package com.creatorhub.controller;

import com.creatorhub.dto.common.ApiResponse;
import com.creatorhub.dto.product.CreateProductRequest;
import com.creatorhub.dto.product.ProductDto;
import com.creatorhub.security.UserPrincipal;
import com.creatorhub.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDto>>> getWorkspaceProducts(
            @PathVariable UUID workspaceId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ProductDto> products = productService.getWorkspaceProducts(workspaceId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.ok(products));
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getPublicProducts(@PathVariable UUID workspaceId) {
        List<ProductDto> products = productService.getPublicProducts(workspaceId);
        return ResponseEntity.ok(ApiResponse.ok(products));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(
            @PathVariable UUID workspaceId,
            @Valid @RequestBody CreateProductRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ProductDto created = productService.createProduct(workspaceId, userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Product created successfully", created));
    }

    @PatchMapping("/{productId}/visibility")
    public ResponseEntity<ApiResponse<ProductDto>> toggleVisibility(
            @PathVariable UUID workspaceId,
            @PathVariable UUID productId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ProductDto updated = productService.toggleVisibility(workspaceId, userPrincipal.getId(), productId);
        return ResponseEntity.ok(ApiResponse.ok("Product visibility updated", updated));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable UUID workspaceId,
            @PathVariable UUID productId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        productService.deleteProduct(workspaceId, userPrincipal.getId(), productId);
        return ResponseEntity.ok(ApiResponse.ok("Product deleted successfully", null));
    }
}
