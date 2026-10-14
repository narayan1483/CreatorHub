-- V4: Add media_id to automation_workflows to bind rules to specific Instagram Posts/Reels
ALTER TABLE automation_workflows ADD COLUMN IF NOT EXISTS media_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_workflows_media ON automation_workflows(media_id);
