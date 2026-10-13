package com.creatorhub.service;

import com.creatorhub.dto.product.CreateProductRequest;
import com.creatorhub.dto.product.ProductDto;
import com.creatorhub.exception.BadRequestException;
import com.creatorhub.exception.ResourceNotFoundException;
import com.creatorhub.model.Product;
import com.creatorhub.model.Workspace;
import com.creatorhub.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final WorkspaceService workspaceService;

    public ProductService(ProductRepository productRepository, WorkspaceService workspaceService) {
        this.productRepository = productRepository;
        this.workspaceService = workspaceService;
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getWorkspaceProducts(UUID workspaceId, UUID userId) {
        workspaceService.assertUserAccess(workspaceId, userId);
        return productRepository.findByWorkspaceIdOrderBySortOrderAsc(workspaceId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getPublicProducts(UUID workspaceId) {
        return productRepository.findByWorkspaceIdAndVisibleTrueOrderBySortOrderAsc(workspaceId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDto createProduct(UUID workspaceId, UUID userId, CreateProductRequest request) {
        workspaceService.assertUserAccess(workspaceId, userId);
        Workspace workspace = workspaceService.getWorkspaceEntity(workspaceId);

        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = request.getTitle().toLowerCase().replaceAll("[^a-z0-9]", "-");
            if (slug.isBlank()) slug = "prod-" + UUID.randomUUID().toString().substring(0, 6);
        }

        if (productRepository.existsByWorkspaceIdAndSlug(workspaceId, slug)) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 4);
        }

        Product product = new Product(workspace, request.getTitle(), slug, request.getType(), request.getPrice());
        product.setSubtitle(request.getSubtitle());
        product.setBadge(request.getBadge());
        product.setCoverImageUrl(request.getCoverImageUrl());
        product.setDeliveryUrl(request.getDeliveryUrl());
        product.setVisible(request.getVisible() != null ? request.getVisible() : true);
        product.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);

        product = productRepository.save(product);
        return mapToDto(product);
    }

    @Transactional
    public ProductDto toggleVisibility(UUID workspaceId, UUID userId, UUID productId) {
        workspaceService.assertUserAccess(workspaceId, userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getWorkspace().getId().equals(workspaceId)) {
            throw new BadRequestException("Product does not belong to this workspace");
        }

        product.setVisible(!product.isVisible());
        product = productRepository.save(product);
        return mapToDto(product);
    }

    @Transactional
    public void deleteProduct(UUID workspaceId, UUID userId, UUID productId) {
        workspaceService.assertUserAccess(workspaceId, userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getWorkspace().getId().equals(workspaceId)) {
            throw new BadRequestException("Product does not belong to this workspace");
        }

        productRepository.delete(product);
    }

    private ProductDto mapToDto(Product p) {
        return new ProductDto(
                p.getId(),
                p.getWorkspace().getId(),
                p.getTitle(),
                p.getSlug(),
                p.getSubtitle(),
                p.getType(),
                p.getPrice(),
                p.getCurrency(),
                p.getBadge(),
                p.getCoverImageUrl(),
                p.getDeliveryUrl(),
                p.isVisible(),
                p.getSortOrder()
        );
    }
}
