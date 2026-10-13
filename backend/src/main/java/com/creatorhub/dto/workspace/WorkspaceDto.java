package com.creatorhub.dto.workspace;

import java.util.UUID;

public class WorkspaceDto {
    private UUID id;
    private String slug;
    private String name;
    private String tagline;
    private String niche;
    private String theme;
    private String role;

    public WorkspaceDto() {}

    public WorkspaceDto(UUID id, String slug, String name, String tagline, String niche, String theme, String role) {
        this.id = id;
        this.slug = slug;
        this.name = name;
        this.tagline = tagline;
        this.niche = niche;
        this.theme = theme;
        this.role = role;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }

    public String getNiche() { return niche; }
    public void setNiche(String niche) { this.niche = niche; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
