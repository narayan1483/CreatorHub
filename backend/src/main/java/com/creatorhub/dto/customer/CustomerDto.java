package com.creatorhub.dto.customer;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class CustomerDto {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private String instagramHandle;
    private String segment;
    private BigDecimal totalSpend;
    private int ordersCount;
    private Instant lastActiveAt;

    public CustomerDto() {}

    public CustomerDto(UUID id, String name, String email, String phone, String instagramHandle, String segment, BigDecimal totalSpend, int ordersCount, Instant lastActiveAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.instagramHandle = instagramHandle;
        this.segment = segment;
        this.totalSpend = totalSpend;
        this.ordersCount = ordersCount;
        this.lastActiveAt = lastActiveAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getInstagramHandle() { return instagramHandle; }
    public void setInstagramHandle(String instagramHandle) { this.instagramHandle = instagramHandle; }

    public String getSegment() { return segment; }
    public void setSegment(String segment) { this.segment = segment; }

    public BigDecimal getTotalSpend() { return totalSpend; }
    public void setTotalSpend(BigDecimal totalSpend) { this.totalSpend = totalSpend; }

    public int getOrdersCount() { return ordersCount; }
    public void setOrdersCount(int ordersCount) { this.ordersCount = ordersCount; }

    public Instant getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(Instant lastActiveAt) { this.lastActiveAt = lastActiveAt; }
}
