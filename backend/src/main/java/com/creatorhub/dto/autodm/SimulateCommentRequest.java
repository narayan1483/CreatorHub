package com.creatorhub.dto.autodm;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class SimulateCommentRequest {

    @NotBlank(message = "Comment text is required")
    private String commentText;

    private String commenterHandle = "follower";
    private String mediaId;

    public SimulateCommentRequest() {}

    public SimulateCommentRequest(String commentText, String commenterHandle) {
        this.commentText = commentText;
        this.commenterHandle = commenterHandle;
    }

    public SimulateCommentRequest(String commentText, String commenterHandle, String mediaId) {
        this.commentText = commentText;
        this.commenterHandle = commenterHandle;
        this.mediaId = mediaId;
    }

    public String getCommentText() { return commentText; }
    public void setCommentText(String commentText) { this.commentText = commentText; }

    public String getCommenterHandle() { return commenterHandle; }
    public void setCommenterHandle(String commenterHandle) { this.commenterHandle = commenterHandle; }

    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }
}
