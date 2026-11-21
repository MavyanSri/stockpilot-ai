package com.vcube.stockpilot.service;

import com.vcube.stockpilot.model.Account;
import com.vcube.stockpilot.repository.AccountRepository;
import com.vcube.stockpilot.config.ApiErrors;
import com.vcube.stockpilot.model.OrderItem;
import com.vcube.stockpilot.model.Product;
import com.vcube.stockpilot.repository.ProductRepository;
import com.vcube.stockpilot.dto.ProductRequest;
import com.vcube.stockpilot.model.PurchaseOrder;
import com.vcube.stockpilot.repository.PurchaseOrderRepository;
import com.vcube.stockpilot.dto.PurchaseOrderRequest;
import com.vcube.stockpilot.model.StockMovement;
import com.vcube.stockpilot.repository.StockMovementRepository;
import com.vcube.stockpilot.dto.StockMovementRequest;
import com.vcube.stockpilot.model.Supplier;
import com.vcube.stockpilot.repository.SupplierRepository;
import com.vcube.stockpilot.dto.SupplierRequest;
import static com.vcube.stockpilot.config.ApiErrors.*;
import java.time.*;
import java.util.*;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

@Service
@Transactional(readOnly=true)
public class InventoryService {
    private final ProductRepository products;
    private final SupplierRepository suppliers;
    private final StockMovementRepository movements;
    private final AccountRepository accounts;
    private final PurchaseOrderRepository orders;

    InventoryService(ProductRepository products,SupplierRepository suppliers,StockMovementRepository movements,AccountRepository accounts,PurchaseOrderRepository orders) {
        this.products=products; this.suppliers=suppliers; this.movements=movements; this.accounts=accounts; this.orders=orders;
    }

    public List<Supplier> suppliers() {return suppliers.findAll(Sort.by("id"));}
    @Transactional
    public Supplier addSupplier(SupplierRequest data) {return saveSupplier(new Supplier(),data);}
    @Transactional
    public Supplier editSupplier(Long id,SupplierRequest data) {
        return saveSupplier(suppliers.findById(id).orElseThrow(ApiErrors::missing),data);
    }
    private Supplier saveSupplier(Supplier s,SupplierRequest data) {
        s.name=data.name().trim(); s.phone=data.phone(); s.leadTimeDays=data.leadTimeDays();
        return suppliers.save(s);
    }

    public List<Product> products() {return products.findAll(Sort.by("id"));}
    public List<Product> alerts() {return products.low();}
    @Transactional
    public Product addProduct(ProductRequest data) {
        var p=new Product();
        p.createdOn=LocalDate.now();
        return saveProduct(p,data);
    }
    @Transactional
    public Product editProduct(Long id,ProductRequest data) {
        return saveProduct(products.lockId(id).orElseThrow(ApiErrors::missing),data);
    }
    private Product saveProduct(Product p,ProductRequest data) {
        p.supplier=suppliers.findById(data.supplierId()).orElseThrow(ApiErrors::missing);
        p.name=data.name().trim(); p.sku=data.sku().trim().toUpperCase(Locale.ROOT);
        p.minStock=data.minStock(); p.sellingPrice=data.sellingPrice();
        return products.save(p);
    }

    public List<StockMovement> history(Long productId) {
        return productId==null ? movements.findAllByOrderByCreatedAtDescIdDesc() : movements.findByProductIdOrderByCreatedAtDescIdDesc(productId);
    }
    @Transactional
    public Map<String,Object> record(StockMovementRequest req,Authentication auth) {
        boolean valid=req.type().equals("IN") && req.reason().equals("OPENING")
            || req.type().equals("OUT") && Set.of("SALE","DAMAGE").contains(req.reason());
        if(!valid) throw bad("Use IN/OPENING, OUT/SALE or OUT/DAMAGE. Receive supplier deliveries through their order");
        var product=products.lockId(req.productId()).orElseThrow(ApiErrors::missing);
        int previous=product.currentStock;
        var movement=apply(product,req.quantity(),req.type(),req.reason(),operator(auth),null);
        return Map.of("transactionId",movement.id,"productId",product.id,"previousStock",previous,
            "currentStock",product.currentStock,"lowStock",product.currentStock<=product.minStock);
    }

    private Account operator(Authentication auth) {return accounts.findByEmail(auth.getName()).orElseThrow(ApiErrors::missing);}
    private StockMovement apply(Product product,int quantity,String type,String reason,Account user,OrderItem line) {
        long balance=(long)product.currentStock+(type.equals("IN")?quantity:-quantity);
        if(balance<0) throw conflict("Insufficient stock");
        if(balance>Integer.MAX_VALUE) throw conflict("Stock exceeds maximum balance");
        product.currentStock=(int)balance;
        var m=new StockMovement();
        m.product=product; m.quantity=quantity; m.type=type; m.reason=reason; m.setRecordedBy(user);
        m.setOrderItem(line); m.createdAt=Instant.now();
        if(reason.equals("SALE")) m.unitSalePrice=product.sellingPrice;
        return movements.save(m);
    }

    public List<PurchaseOrder> orders() {var all=orders.findAll(Sort.by(Sort.Direction.DESC,"id")); all.forEach(o->o.items.size()); return all;}
    public PurchaseOrder order(Long id) {
        var o=orders.findById(id).orElseThrow(ApiErrors::missing); o.items.size(); return o;
    }
    @Transactional
    public PurchaseOrder place(PurchaseOrderRequest req,Authentication auth) {
        var supplier=suppliers.findById(req.supplierId()).orElseThrow(ApiErrors::missing);
        var o=new PurchaseOrder();
        o.supplier=supplier; o.setCreatedBy(operator(auth)); o.status="ORDERED"; o.orderedAt=Instant.now();
        o.expectedAt=req.expectedAt()==null?LocalDate.now().plusDays(supplier.leadTimeDays):req.expectedAt();
        var seen=new HashSet<Long>();
        for(var line:req.items()) {
            var product=products.findById(line.productId()).orElseThrow(ApiErrors::missing);
            if(!product.supplier.id.equals(supplier.id)) throw bad("Product belongs to another supplier");
            if(!seen.add(product.id)) throw bad("Combine duplicate product lines");
            var i=new OrderItem();
            i.setPurchaseOrder(o); i.product=product; i.quantity=line.quantity(); i.unitCost=line.unitCost(); o.items.add(i);
        }
        return orders.save(o);
    }
    @Transactional
    public PurchaseOrder receive(Long id,Authentication auth) {
        var o=orders.lockId(id).orElseThrow(ApiErrors::missing);
        if(!o.status.equals("ORDERED")) throw conflict("Order already received");
        var user=operator(auth);
        for(var line:o.items.stream().sorted(Comparator.comparing(i->i.product.id)).toList()) {
            var p=products.lockId(line.product.id).orElseThrow(ApiErrors::missing);
            // A line can load the product before its lock is acquired. Refresh the locked balance.
            entityManager.refresh(p,jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
            apply(p,line.quantity,"IN","PURCHASE",user,line);
        }
        o.status="RECEIVED";
        return o;
    }
    @jakarta.persistence.PersistenceContext jakarta.persistence.EntityManager entityManager;
}
