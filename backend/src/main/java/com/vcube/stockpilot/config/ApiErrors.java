package com.vcube.stockpilot.config;

import java.util.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiErrors {
    public static ResponseStatusException bad(String msg) { return new ResponseStatusException(HttpStatus.BAD_REQUEST,msg); }
    public static ResponseStatusException conflict(String msg) { return new ResponseStatusException(HttpStatus.CONFLICT,msg); }
    public static ResponseStatusException missing() { return new ResponseStatusException(HttpStatus.NOT_FOUND,"Record not found"); }
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<?> expected(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("message",Objects.toString(ex.getReason(),"Request failed")));
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<?> duplicate() { return ResponseEntity.status(409).body(Map.of("message","Duplicate value or invalid reference")); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<?> invalid(MethodArgumentNotValidException ex) {
        var errors=new LinkedHashMap<String,String>();
        ex.getBindingResult().getFieldErrors().forEach(e->errors.put(e.getField(),e.getDefaultMessage()));
        return ResponseEntity.badRequest().body(Map.of("message","Check input fields","fields",errors));
    }
}
