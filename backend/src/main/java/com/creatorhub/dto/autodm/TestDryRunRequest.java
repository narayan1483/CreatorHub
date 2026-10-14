package com.creatorhub.dto.autodm;

import jakarta.validation.constraints.NotBlank;

public class TestDryRunRequest {

    @NotBlank(message = "Comment text is required")
    private String commentText;

    private String commenterUsername;

    private String mediaId;

    public TestDryRunRequest() {}

    public TestDryRunRequest(String commentText, String commenterUsername) {
        this.commentText = commentText;
        this.commenterUsername = commenterUsername;
    }

    public String getCommentText() { return commentText; }
    public void setCommentText(String commentText) { this.commentText = commentText; }

    public String getCommenterUsername() { return commenterUsername; }
    public void setCommenterUsername(String commenterUsername) { this.commenterUsername = commenterUsername; }

    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }
}
