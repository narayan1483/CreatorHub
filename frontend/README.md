# CreatorHub Frontend

Premium creator commerce SaaS dashboard built with React, TypeScript, Vite, React Router, TanStack Query, and Lucide React.

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── layout/          # DashboardLayout, Sidebar, Header
│   └── ui/              # StatCard, Card, Skeleton, EmptyState
├── features/
│   └── dashboard/
│       └── components/  # RevenueChart, RecentOrders, ActivityFeed, QuickActions, TopProducts
├── data/                # Mock data (will be replaced by API calls)
├── hooks/               # TanStack Query hooks
├── pages/               # Page components
├── types/               # Shared TypeScript types
└── utils.ts             # Formatting utilities
```

## Design System

All design tokens (colors, typography, spacing, shadows) are defined as CSS custom properties in `src/index.css`.
