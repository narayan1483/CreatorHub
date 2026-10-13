package com.creatorhub.dto.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public class ProductDto {
    private UUID id;
    private UUID workspaceId;
    private String title;
    private String slug;
    private String subtitle;
    private String type;
    private BigDecimal price;
    private String currency;
    private String badge;
    private String coverImageUrl;
    private String deliveryUrl;
    private boolean visible;
    private int sortOrder;

    public ProductDto() {}

    public ProductDto(UUID id, UUID workspaceId, String title, String slug, String subtitle, String type, BigDecimal price, String currency, String badge, String coverImageUrl, String deliveryUrl, boolean visible, int sortOrder) {
        this.id = id;
        this.workspaceId = workspaceId;
        this.title = title;
        this.slug = slug;
        this.subtitle = subtitle;
        this.type = type;
        this.price = price;
        this.currency = currency;
        this.badge = badge;
        this.coverImageUrl = coverImageUrl;
        this.deliveryUrl = deliveryUrl;
        this.visible = visible;
        this.sortOrder = sortOrder;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(UUID workspaceId) { this.workspaceId = workspaceId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }

    public String getDeliveryUrl() { return deliveryUrl; }
    public void setDeliveryUrl(String deliveryUrl) { this.deliveryUrl = deliveryUrl; }

    public boolean isVisible() { return visible; }
    public void setVisible(boolean visible) { this.visible = visible; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}
