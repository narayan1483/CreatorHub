package com.creatorhub.dto.autodm;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class AutomationWorkflowDto {
    private UUID id;
    private String name;
    private String triggerKeyword;
    private String matchType;
    private String dmMessageTemplate;
    private String publicReplyTemplate;
    private String status;
    private int runsCount;
    private int followersGained;
    private int buttonClicks;

    public AutomationWorkflowDto() {}

    public AutomationWorkflowDto(UUID id, String name, String triggerKeyword, String matchType, String dmMessageTemplate, String publicReplyTemplate, String status, int runsCount, int followersGained, int buttonClicks) {
        this.id = id;
        this.name = name;
        this.triggerKeyword = triggerKeyword;
        this.matchType = matchType;
        this.dmMessageTemplate = dmMessageTemplate;
        this.publicReplyTemplate = publicReplyTemplate;
        this.status = status;
        this.runsCount = runsCount;
        this.followersGained = followersGained;
        this.buttonClicks = buttonClicks;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTriggerKeyword() { return triggerKeyword; }
    public void setTriggerKeyword(String triggerKeyword) { this.triggerKeyword = triggerKeyword; }

    public String getMatchType() { return matchType; }
    public void setMatchType(String matchType) { this.matchType = matchType; }

    public String getDmMessageTemplate() { return dmMessageTemplate; }
    public void setDmMessageTemplate(String dmMessageTemplate) { this.dmMessageTemplate = dmMessageTemplate; }

    public String getPublicReplyTemplate() { return publicReplyTemplate; }
    public void setPublicReplyTemplate(String publicReplyTemplate) { this.publicReplyTemplate = publicReplyTemplate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getRunsCount() { return runsCount; }
    public void setRunsCount(int runsCount) { this.runsCount = runsCount; }

    public int getFollowersGained() { return followersGained; }
    public void setFollowersGained(int followersGained) { this.followersGained = followersGained; }

    public int getButtonClicks() { return buttonClicks; }
    public void setButtonClicks(int buttonClicks) { this.buttonClicks = buttonClicks; }
}
