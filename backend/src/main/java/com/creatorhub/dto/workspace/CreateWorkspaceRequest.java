package com.creatorhub.dto.workspace;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateWorkspaceRequest {

    @NotBlank(message = "Workspace name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Handle / slug is required")
    @Pattern(regexp = "^[a-z0-9_-]{3,50}$", message = "Handle must be 3-50 alphanumeric characters or hyphens/underscores")
    private String slug;

    private String tagline;
    private String niche;
    private String theme = "indigo";

    public CreateWorkspaceRequest() {}

    public CreateWorkspaceRequest(String name, String slug, String tagline, String niche, String theme) {
        this.name = name;
        this.slug = slug;
        this.tagline = tagline;
        this.niche = niche;
        this.theme = theme != null ? theme : "indigo";
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }

    public String getNiche() { return niche; }
    public void setNiche(String niche) { this.niche = niche; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
}
