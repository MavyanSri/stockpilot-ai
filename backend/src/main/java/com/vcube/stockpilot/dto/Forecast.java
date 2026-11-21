package com.vcube.stockpilot.dto;

import java.util.List;

public record Forecast(Long productId,String name,int days,int observedDays,double dailyAverage,long projectedUnits,List<Day> history,String method) {}
