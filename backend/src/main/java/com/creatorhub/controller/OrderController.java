package com.creatorhub.controller;

import com.creatorhub.dto.common.ApiResponse;
import com.creatorhub.dto.order.CreateOrderRequest;
import com.creatorhub.dto.order.OrderDto;
import com.creatorhub.security.UserPrincipal;
import com.creatorhub.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDto>>> getOrders(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<OrderDto> orders = orderService.getWorkspaceOrders(workspaceId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(orders));
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderDto>> createCheckout(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderDto order = orderService.createCheckoutOrder(workspaceId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Order placed successfully", order));
    }
}
