-- ============================================================
-- CreatorHub V2 Migration - Seed Demo Creator & Sample Data
-- ============================================================

-- Seed demo user: alex@creatorhub.to (Password: Password123!)
-- BCrypt: $2a$10$7Z2v4V1Z6fX5n9wQ6.U8O.zZzZzZzZzZzZzZzZzZzZzZzZzZzZzZ
INSERT INTO users (id, email, password_hash, full_name, phone, avatar_url, status, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'alex@creatorhub.to',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- standard bcrypt for "password"
    'Alex Rivera',
    '+91 98765 43210',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Seed workspace for Alex Rivera
INSERT INTO workspaces (id, slug, name, tagline, niche, theme, owner_id, created_at, updated_at)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'alexrivera',
    'Alex Rivera',
    'Tech Creator & Fullstack AI Architect. Helping 100K+ engineers scale their skills & income.',
    'Tech & AI',
    'indigo',
    'a0000000-0000-0000-0000-000000000001',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (slug) DO NOTHING;

-- Seed workspace membership (OWNER)
INSERT INTO workspace_memberships (id, workspace_id, user_id, role, created_at)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'OWNER',
    CURRENT_TIMESTAMP
) ON CONFLICT (workspace_id, user_id) DO NOTHING;

-- Seed Sample Products
INSERT INTO products (id, workspace_id, title, slug, subtitle, type, price, currency, badge, cover_image_url, delivery_url, visible, sort_order)
VALUES 
(
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    '100-Day Startup Growth Playbook',
    'startup-playbook',
    'Step-by-step scaling framework with 50+ copy templates and Notion dashboard.',
    'DIGITAL_FILE',
    0.00,
    'INR',
    'FREE',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    'https://assets.creatorhub.to/downloads/startup-playbook.pdf',
    TRUE,
    1
),
(
    'd0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'Creator Launchpad & Automation Bundle',
    'launchpad-bundle',
    'Full stack templates, comment-to-DM triggers, and video SOPs.',
    'DIGITAL_FILE',
    799.00,
    'INR',
    'HOT',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
    'https://assets.creatorhub.to/downloads/launchpad-bundle.zip',
    TRUE,
    2
),
(
    'd0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    '30-Min 1:1 Growth Strategy Call',
    'strategy-call',
    'Private coaching session on scaling your creator audience and monetization.',
    'CALL',
    1499.00,
    'INR',
    'LIMITED',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80',
    'https://calendly.com/creatorhub-alex/30min',
    TRUE,
    3
) ON CONFLICT (workspace_id, slug) DO NOTHING;

-- Seed Sample Customers
INSERT INTO customers (id, workspace_id, name, email, phone, instagram_handle, segment, total_spend, orders_count)
VALUES 
(
    'e0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Priya Sharma',
    'priya.s@gmail.com',
    '+91 98765 43210',
    '@priya_codes',
    'Instagram Contacts',
    499.00,
    1
),
(
    'e0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'Arjun Mehta',
    'arjun.m@techcorp.in',
    '+91 98112 34567',
    '@arjun_dev',
    'Instagram Contacts',
    1999.00,
    2
) ON CONFLICT (workspace_id, email) DO NOTHING;

-- Seed Sample Automation Workflows
INSERT INTO automation_workflows (id, workspace_id, name, trigger_keyword, match_type, dm_message_template, public_reply_template, status, runs_count, followers_gained, button_clicks)
VALUES 
(
    'f0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Reel: AI Roadmap -> Send Free Playbook',
    'STARTUP',
    'contains',
    'Hey {{first_name}}! 🎉 Thanks for commenting on my Reel! Here is your free Startup Growth Playbook: {{store_link}}',
    'Sent you a DM! Check your requests 📥🚀',
    'ACTIVE',
    1420,
    340,
    1120
),
(
    'f0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'Launchpad Pricing & Discount Offer',
    'PRICE',
    'contains',
    'Hey {{first_name}}! The Creator Launchpad Bundle is currently 40% OFF at ₹799: {{store_link}}',
    'DM sent with pricing details! 🚀',
    'ACTIVE',
    512,
    115,
    380
);
