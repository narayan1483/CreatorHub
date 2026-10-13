package com.creatorhub.service;

import com.creatorhub.dto.customer.CustomerDto;
import com.creatorhub.model.Customer;
import com.creatorhub.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final WorkspaceService workspaceService;

    public CustomerService(CustomerRepository customerRepository, WorkspaceService workspaceService) {
        this.customerRepository = customerRepository;
        this.workspaceService = workspaceService;
    }

    @Transactional(readOnly = true)
    public List<CustomerDto> getWorkspaceCustomers(UUID workspaceId, UUID userId) {
        workspaceService.assertUserAccess(workspaceId, userId);
        return customerRepository.findByWorkspaceIdOrderByLastActiveAtDesc(workspaceId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private CustomerDto mapToDto(Customer c) {
        return new CustomerDto(
                c.getId(),
                c.getName(),
                c.getEmail(),
                c.getPhone(),
                c.getInstagramHandle(),
                c.getSegment(),
                c.getTotalSpend(),
                c.getOrdersCount(),
                c.getLastActiveAt()
        );
    }
}
