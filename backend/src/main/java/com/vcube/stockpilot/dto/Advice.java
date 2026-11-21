package com.vcube.stockpilot.dto;

public record Advice(Long productId,String name,Long supplierId,String supplier,int currentStock,int leadTimeDays,
        Double daysOfStock,long targetStock,long incomingUnits,long suggestedQuantity,String risk,Forecast forecast) {}
