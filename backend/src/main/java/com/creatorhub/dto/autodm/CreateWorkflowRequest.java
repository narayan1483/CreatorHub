package com.creatorhub.dto.autodm;

import jakarta.validation.constraints.NotBlank;

public class CreateWorkflowRequest {

    @NotBlank(message = "Workflow name is required")
    private String name;

    @NotBlank(message = "Trigger keyword is required")
    private String triggerKeyword;

    private String matchType = "contains";

    @NotBlank(message = "DM message template is required")
    private String dmMessageTemplate;

    @NotBlank(message = "Public reply template is required")
    private String publicReplyTemplate;

    private String mediaId;

    public CreateWorkflowRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTriggerKeyword() { return triggerKeyword; }
    public void setTriggerKeyword(String triggerKeyword) { this.triggerKeyword = triggerKeyword; }

    public String getMatchType() { return matchType; }
    public void setMatchType(String matchType) { this.matchType = matchType; }

    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }

    public String getDmMessageTemplate() { return dmMessageTemplate; }
    public void setDmMessageTemplate(String dmMessageTemplate) { this.dmMessageTemplate = dmMessageTemplate; }

    public String getPublicReplyTemplate() { return publicReplyTemplate; }
    public void setPublicReplyTemplate(String publicReplyTemplate) { this.publicReplyTemplate = publicReplyTemplate; }
}
