package com.creatorhub.dto.meta;

import java.io.Serializable;

public class InstagramCommentEvent implements Serializable {

    private String eventId;
    private String mediaId;
    private String commenterId;
    private String commenterUsername;
    private String commentText;
    private String instagramAccountId;
    private long timestamp;
    private boolean isDryRun;

    public InstagramCommentEvent() {}

    public InstagramCommentEvent(String eventId, String mediaId, String commenterId, String commenterUsername, String commentText, String instagramAccountId, long timestamp, boolean isDryRun) {
        this.eventId = eventId;
        this.mediaId = mediaId;
        this.commenterId = commenterId;
        this.commenterUsername = commenterUsername;
        this.commentText = commentText;
        this.instagramAccountId = instagramAccountId;
        this.timestamp = timestamp;
        this.isDryRun = isDryRun;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }

    public String getCommenterId() { return commenterId; }
    public void setCommenterId(String commenterId) { this.commenterId = commenterId; }

    public String getCommenterUsername() { return commenterUsername; }
    public void setCommenterUsername(String commenterUsername) { this.commenterUsername = commenterUsername; }

    public String getCommentText() { return commentText; }
    public void setCommentText(String commentText) { this.commentText = commentText; }

    public String getInstagramAccountId() { return instagramAccountId; }
    public void setInstagramAccountId(String instagramAccountId) { this.instagramAccountId = instagramAccountId; }

    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }

    public boolean isDryRun() { return isDryRun; }
    public void setDryRun(boolean dryRun) { isDryRun = dryRun; }

    @Override
    public String toString() {
        return "InstagramCommentEvent{" +
                "eventId='" + eventId + '\'' +
                ", mediaId='" + mediaId + '\'' +
                ", commenterUsername='" + commenterUsername + '\'' +
                ", instagramAccountId='" + instagramAccountId + '\'' +
                ", isDryRun=" + isDryRun +
                '}';
    }
}
