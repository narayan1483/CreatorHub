package com.creatorhub.dto.autodm;

import java.util.UUID;

public class SimulationResultDto {
    private boolean matched;
    private UUID matchedWorkflowId;
    private String workflowName;
    private String triggerKeyword;
    private String publicReply;
    private String directMessage;

    public SimulationResultDto() {}

    public SimulationResultDto(boolean matched, UUID matchedWorkflowId, String workflowName, String triggerKeyword, String publicReply, String directMessage) {
        this.matched = matched;
        this.matchedWorkflowId = matchedWorkflowId;
        this.workflowName = workflowName;
        this.triggerKeyword = triggerKeyword;
        this.publicReply = publicReply;
        this.directMessage = directMessage;
    }

    public static SimulationResultDto notMatched() {
        return new SimulationResultDto(false, null, null, null, null, null);
    }

    public boolean isMatched() { return matched; }
    public void setMatched(boolean matched) { this.matched = matched; }

    public UUID getMatchedWorkflowId() { return matchedWorkflowId; }
    public void setMatchedWorkflowId(UUID matchedWorkflowId) { this.matchedWorkflowId = matchedWorkflowId; }

    public String getWorkflowName() { return workflowName; }
    public void setWorkflowName(String workflowName) { this.workflowName = workflowName; }

    public String getTriggerKeyword() { return triggerKeyword; }
    public void setTriggerKeyword(String triggerKeyword) { this.triggerKeyword = triggerKeyword; }

    public String getPublicReply() { return publicReply; }
    public void setPublicReply(String publicReply) { this.publicReply = publicReply; }

    public String getDirectMessage() { return directMessage; }
    public void setDirectMessage(String directMessage) { this.directMessage = directMessage; }
}
