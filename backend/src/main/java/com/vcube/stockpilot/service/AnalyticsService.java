package com.vcube.stockpilot.service;

import com.vcube.stockpilot.config.ApiErrors;
import com.vcube.stockpilot.dto.Forecast;
import com.vcube.stockpilot.dto.InventoryQuestionRequest;
import com.vcube.stockpilot.repository.ProductRepository;
import com.vcube.stockpilot.dto.Sales;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {
    private final ReportingService reports;
    private final LlmClient llm;
    private final ProductRepository products;

    AnalyticsService(ReportingService reports, LlmClient llm, ProductRepository products) {
        this.reports = reports;
        this.llm = llm;
        this.products = products;
    }

    public Map<String,Object> summary() {
        return reports.summary();
    }

    public Sales sales(LocalDate from, LocalDate to) {
        return reports.sales(from, to);
    }

    public Forecast forecast(long productId, int days) {
        return reports.forecast(productId, days);
    }

    private Map<String,Object> explain(Object data, String instruction, String facts) {
        try {
            return Map.of("data", data, "source", "LLM", "explanation", llm.answer(instruction, facts));
        } catch(Exception ex) {
            return Map.of("data", data, "source", "CALCULATION_ONLY", "explanation", "Live calculations available. AI explanation is temporarily unavailable.");
        }
    }

    public Map<String,Object> insights(long productId) {
        var list = reports.advice(productId);
        if (list.isEmpty()) throw ApiErrors.missing();
        var advice = list.getFirst();
        return explain(advice, "Explain the stock risk in two short sentences. Mention short history and the supplier lead time.", advice.toString());
    }

    public Map<String,Object> recommendations() {
        var rows = reports.advice(null).stream().filter(a -> a.suggestedQuantity() > 0).toList();
        if (rows.isEmpty()) return Map.of("data", rows, "source", "CALCULATION_ONLY", "explanation", "No purchase is currently suggested");
        return explain(rows, "Explain the highest-priority proposed order. Cite quantity and incoming orders.", rows.getFirst().toString());
    }

    public Map<String,Object> ask(InventoryQuestionRequest req) {
        var today = LocalDate.now();
        String scope;
        try {
            scope = llm.answer("Route this inventory question to one report. Return exactly one label: SALES_TODAY, SALES_LAST_7_DAYS, SALES_PREVIOUS_WEEK, LOW_STOCK, REORDER, OVERVIEW, UNSUPPORTED. Previous week means previous Mon-Sun. For unsupported periods or topics return UNSUPPORTED.", req.question()).toUpperCase(Locale.ROOT);
        } catch(Exception e) {
            String q = req.question().toLowerCase(Locale.ROOT);
            if (q.contains("today")) scope = "SALES_TODAY";
            else if (q.contains("7") || q.contains("seven") || q.contains("trend") || q.contains("selling") || q.contains("recent")) scope = "SALES_LAST_7_DAYS";
            else if (q.contains("previous week") || q.contains("last week")) scope = "SALES_PREVIOUS_WEEK";
            else if (q.contains("low") || q.contains("alert") || q.contains("shortage")) scope = "LOW_STOCK";
            else if (q.contains("reorder") || q.contains("order") || q.contains("purchase") || q.contains("suggest")) scope = "REORDER";
            else scope = "OVERVIEW";
        }
        Object facts = switch(scope) {
            case "SALES_TODAY" -> reports.sales(today, today);
            case "SALES_LAST_7_DAYS" -> reports.sales(today.minusDays(6), today);
            case "SALES_PREVIOUS_WEEK" -> {
                var monday = today.with(java.time.DayOfWeek.MONDAY);
                yield reports.sales(monday.minusWeeks(1), monday.minusDays(1));
            }
            case "LOW_STOCK" -> products.low().stream().map(p -> Map.of("name", p.name, "currentStock", p.currentStock, "minStock", p.minStock)).toList();
            case "REORDER" -> reports.advice(null).stream().filter(a -> a.suggestedQuantity() > 0).toList();
            case "OVERVIEW" -> reports.summary();
            default -> reports.summary();
        };
        String answer;
        try {
            answer = llm.answer("Answer briefly using the report. If it lacks information say so. Include applicable dates and figures.",
                "Question: " + req.question() + "\nReport: " + facts);
        } catch(Exception e) {
            answer = "Inventory report for " + scope.toLowerCase(Locale.ROOT).replace('_', ' ') + ": " + facts.toString();
        }
        return Map.of("answer", answer, "report", scope, "data", facts);
    }
}
