package com.vcube.stockpilot.service;

import com.vcube.stockpilot.dto.Advice;
import com.vcube.stockpilot.config.ApiErrors;
import com.vcube.stockpilot.dto.Day;
import com.vcube.stockpilot.dto.Forecast;
import com.vcube.stockpilot.repository.OrderItemRepository;
import com.vcube.stockpilot.model.Product;
import com.vcube.stockpilot.repository.ProductRepository;
import com.vcube.stockpilot.repository.PurchaseOrderRepository;
import com.vcube.stockpilot.dto.Sales;
import com.vcube.stockpilot.dto.SalesRow;
import com.vcube.stockpilot.model.StockMovement;
import com.vcube.stockpilot.repository.StockMovementRepository;
import java.math.*;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly=true)
public class ReportingService {
    private final StockMovementRepository moves;
    private final ProductRepository products;
    private final OrderItemRepository items;
    private final PurchaseOrderRepository orders;
    ReportingService(StockMovementRepository moves,ProductRepository products,OrderItemRepository items,PurchaseOrderRepository orders) {
        this.moves=moves; this.products=products; this.items=items; this.orders=orders;
    }

    private Instant start(LocalDate d) {return d.atStartOfDay(ZoneId.systemDefault()).toInstant();}
    private List<StockMovement> salesBetween(LocalDate from,LocalDate to) {
        return moves.findByReasonAndCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtAsc("SALE",start(from),start(to.plusDays(1)));
    }
    public Sales sales(LocalDate from,LocalDate to) {
        if(to.isBefore(from) || to.isAfter(from.plusYears(1))) throw ApiErrors.bad("Choose a date range of up to one year in chronological order");
        var rows=new HashMap<Long,SalesRow>();
        BigDecimal total=BigDecimal.ZERO;
        long units=0;
        for(var m:salesBetween(from,to)) {
            BigDecimal amount=m.unitSalePrice.multiply(BigDecimal.valueOf(m.quantity));
            var prev=rows.getOrDefault(m.product.id,new SalesRow(m.product.id,m.product.name,0,BigDecimal.ZERO));
            rows.put(m.product.id,new SalesRow(m.product.id,m.product.name,prev.units()+m.quantity,prev.revenue().add(amount)));
            total=total.add(amount); units+=m.quantity;
        }
        return new Sales(from,to,units,total,rows.values().stream().sorted(Comparator.comparingLong(SalesRow::units).reversed().thenComparing(SalesRow::productId)).toList());
    }
    public Map<String,Object> summary() {
        var today=LocalDate.now();
        var sale=sales(today,today);
        return Map.of("productCount",products.count(),"lowStockCount",products.low().size(),"openOrderCount",orders.countByStatus("ORDERED"),
            "todayUnitsSold",sale.unitsSold(),"todayRevenue",sale.revenue());
    }
    Product product(long id) {return products.findById(id).orElseThrow(ApiErrors::missing);}
    private Map<Long,Map<LocalDate,Long>> history(LocalDate today) {
        var data=new HashMap<Long,Map<LocalDate,Long>>();
        for(var m:salesBetween(today.minusDays(6),today)) {
            var day=m.createdAt.atZone(ZoneId.systemDefault()).toLocalDate();
            data.computeIfAbsent(m.product.id,k->new HashMap<>()).merge(day,(long)m.quantity,Long::sum);
        }
        return data;
    }
    public Forecast forecast(long id,int days) {
        if(days<1 || days>90) throw ApiErrors.bad("days must be between 1 and 90");
        var today=LocalDate.now();
        return forecast(product(id),days,today,history(today));
    }
    private Forecast forecast(Product p,int days,LocalDate today,Map<Long,Map<LocalDate,Long>> history) {
        var first=today.minusDays(6);
        if(p.createdOn.isAfter(first)) first=p.createdOn;
        var daily=history.getOrDefault(p.id,Map.of());
        var series=new ArrayList<Day>();
        long units=0;
        for(var d=first;!d.isAfter(today);d=d.plusDays(1)) {
            long n=daily.getOrDefault(d,0L); series.add(new Day(d,n)); units+=n;
        }
        double rate=series.isEmpty()?0:(double)units/series.size();
        return new Forecast(p.id,p.name,days,series.size(),rate,Math.round(rate*days),series,
            "Mean daily sale units over up to 7 calendar days including today (partial day). Short history is provisional.");
    }
    public List<Advice> advice(Long id) {
        var today=LocalDate.now();
        var history=history(today);
        var selection=id==null ? products.findAll() : List.of(product(id));
        var result=new ArrayList<Advice>();
        for(var p:selection) {
            var forecast=forecast(p,7,today,history);
            double rate=forecast.dailyAverage();
            int lead=p.supplier.leadTimeDays;
            long target=(long)Math.ceil(rate*lead)+p.minStock;
            long incoming=items.incoming(p.id,today,today.plusDays(lead));
            long qty=Math.max(0,target-p.currentStock-incoming);
            Double cover=rate==0?null:p.currentStock/rate;
            String risk=cover==null?"NO_RECENT_SALES":cover<lead?"AT_RISK_BEFORE_DELIVERY":"COVERED";
            result.add(new Advice(p.id,p.name,p.supplier.id,p.supplier.name,p.currentStock,lead,cover,target,incoming,qty,risk,forecast));
        }
        result.sort(Comparator.comparingLong(Advice::suggestedQuantity).reversed().thenComparing(Advice::productId));
        return result;
    }
}
