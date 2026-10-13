package com.creatorhub.service;

import com.creatorhub.dto.order.CreateOrderRequest;
import com.creatorhub.dto.order.OrderDto;
import com.creatorhub.exception.BadRequestException;
import com.creatorhub.exception.ResourceNotFoundException;
import com.creatorhub.model.Customer;
import com.creatorhub.model.Order;
import com.creatorhub.model.Product;
import com.creatorhub.model.Workspace;
import com.creatorhub.repository.CustomerRepository;
import com.creatorhub.repository.OrderRepository;
import com.creatorhub.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final WorkspaceService workspaceService;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            CustomerRepository customerRepository,
            WorkspaceService workspaceService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.workspaceService = workspaceService;
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getWorkspaceOrders(UUID workspaceId, UUID userId) {
        workspaceService.assertUserAccess(workspaceId, userId);
        return orderRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDto createCheckoutOrder(UUID workspaceId, CreateOrderRequest request) {
        Workspace workspace = workspaceService.getWorkspaceEntity(workspaceId);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.getProductId()));

        if (!product.getWorkspace().getId().equals(workspaceId)) {
            throw new BadRequestException("Product does not belong to this creator workspace");
        }

        // 1. Find or create Customer
        Customer customer = customerRepository.findByWorkspaceIdAndEmail(workspaceId, request.getCustomerEmail().toLowerCase().trim())
                .orElseGet(() -> {
                    Customer newCustomer = new Customer(workspace, request.getCustomerName(), request.getCustomerEmail().toLowerCase().trim());
                    newCustomer.setPhone(request.getCustomerPhone());
                    return customerRepository.save(newCustomer);
                });

        // 2. Update Customer telemetry
        customer.setTotalSpend(customer.getTotalSpend().add(product.getPrice()));
        customer.setOrdersCount(customer.getOrdersCount() + 1);
        customer.setLastActiveAt(Instant.now());
        customer = customerRepository.save(customer);

        // 3. Create Order
        Order order = new Order(
                workspace,
                product,
                product.getPrice(),
                request.getCustomerName(),
                request.getCustomerEmail(),
                request.getPaymentMethod()
        );
        order.setCustomer(customer);
        order.setTransactionRef("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order = orderRepository.save(order);

        return mapToDto(order);
    }

    private OrderDto mapToDto(Order o) {
        return new OrderDto(
                o.getId(),
                o.getProduct() != null ? o.getProduct().getId() : null,
                o.getProduct() != null ? o.getProduct().getTitle() : "Product",
                o.getAmount(),
                o.getCurrency(),
                o.getStatus(),
                o.getPaymentMethod(),
                o.getTransactionRef(),
                o.getCustomerName(),
                o.getCustomerEmail(),
                o.getCreatedAt()
        );
    }
}
