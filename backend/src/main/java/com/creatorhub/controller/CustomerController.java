package com.creatorhub.controller;

import com.creatorhub.dto.common.ApiResponse;
import com.creatorhub.dto.customer.CustomerDto;
import com.creatorhub.security.UserPrincipal;
import com.creatorhub.service.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerDto>>> getCustomers(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<CustomerDto> customers = customerService.getWorkspaceCustomers(workspaceId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(customers));
    }
}
