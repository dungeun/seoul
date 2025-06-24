# Seoul National University Carbon Neutral Campus - Project Structure Documentation

## 📋 Project Overview

This is a comprehensive Next.js 15 web application for Seoul National University's Carbon Neutral Campus initiative. The system provides real-time energy monitoring, greenhouse gas tracking, solar power analytics, and comprehensive content management for sustainability initiatives.

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon hosted)
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: React hooks + SWR
- **Real-time Updates**: Server-Sent Events (SSE)
- **Authentication**: JWT tokens
- **Charts**: Recharts
- **Editor**: TipTap
- **File Upload**: Local storage with image optimization

## 📁 Complete Directory Structure

```
/Users/admin/프로젝트/seoul_end/nextjs-app/
│
├── 📄 Configuration Files
│   ├── package.json                 # Project dependencies and scripts
│   ├── next.config.ts              # Next.js configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── tailwind.config.ts          # Tailwind CSS configuration
│   ├── postcss.config.mjs          # PostCSS configuration
│   ├── middleware.ts               # Next.js middleware for auth
│   └── .env.local                  # Environment variables (not in repo)
│
├── 📁 app/                         # Next.js App Router
│   ├── 📄 Root Files
│   │   ├── layout.tsx              # Root layout with metadata
│   │   ├── page.tsx                # Homepage with hero slides
│   │   ├── globals.css             # Global styles
│   │   └── favicon.ico             # Site favicon
│   │
│   ├── 📁 (public)/                # Public routes group
│   │   ├── board/                  # Board pages
│   │   ├── carbon-tech/            # Carbon technology page
│   │   ├── infographic/            # Infographic display page
│   │   └── realtime/               # Real-time monitoring
│   │       ├── layout.tsx
│   │       └── page.tsx
│   │
│   ├── 📁 Public Pages
│   │   ├── energy/                 # Energy analytics page
│   │   ├── greenhouse-gas/         # Greenhouse gas analytics
│   │   ├── solar-power/            # Solar power analytics
│   │   ├── history/                # Historical timeline
│   │   ├── carbon-tech/            # Carbon technology showcase
│   │   ├── page/[slug]/            # Dynamic static pages
│   │   └── post/[identifier]/      # Dynamic post pages
│   │
│   ├── 📁 admin/                   # Admin panel routes
│   │   ├── admin.css               # Admin-specific styles
│   │   ├── page.tsx                # Admin dashboard
│   │   ├── login/                  # Admin login
│   │   ├── dashboard/              # Dashboard overview
│   │   ├── boards/                 # Board management
│   │   ├── posts/                  # Post management
│   │   │   ├── page.tsx
│   │   │   └── PostForm.tsx
│   │   ├── categories/             # Category management
│   │   ├── menus/                  # Menu management
│   │   ├── pages/                  # Static page management
│   │   ├── files/                  # File management
│   │   ├── energy/                 # Energy data management
│   │   ├── energy-data/            # Detailed energy data
│   │   ├── solar-data/             # Solar data management
│   │   ├── hero-slides/            # Hero slider management
│   │   ├── main-icons/             # Main icon management
│   │   ├── board-banners/          # Board banner management
│   │   ├── link-posts/             # Link post management
│   │   ├── carbon-tech/            # Carbon tech management
│   │   └── researcher-screenshots/ # Screenshot management
│   │
│   └── 📁 api/                     # API Routes
│       ├── 📁 auth/                # Authentication endpoints
│       │   ├── check/
│       │   ├── login/
│       │   └── logout/
│       ├── 📁 Data APIs
│       │   ├── boards/             # Board CRUD operations
│       │   ├── posts/              # Post CRUD operations
│       │   ├── categories/         # Category operations
│       │   ├── menus/              # Menu operations
│       │   ├── pages/              # Page content operations
│       │   ├── files/              # File operations
│       │   ├── buildings/          # Building data
│       │   ├── energy/             # Energy data endpoints
│       │   ├── energy-data/        # Detailed energy data
│       │   ├── solar/              # Solar generation data
│       │   ├── solar-data/         # Detailed solar data
│       │   ├── hero-slides/        # Hero slide management
│       │   ├── main-icons/         # Icon management
│       │   ├── board-banners/      # Banner management
│       │   ├── link-posts/         # Link post operations
│       │   ├── carbon-tech/        # Carbon tech data
│       │   └── researcher-screenshots/ # Screenshot API
│       ├── 📁 public/              # Public API endpoints
│       │   ├── energy-stats/
│       │   ├── greenhouse-gas-stats/
│       │   ├── link-posts/
│       │   └── menus/
│       ├── 📁 Utility APIs
│       │   ├── dashboard/stats/    # Dashboard statistics
│       │   ├── history/            # Historical data
│       │   ├── realtime/           # Real-time data streams
│       │   ├── upload/             # File upload handler
│       │   ├── screenshot/         # Screenshot generation
│       │   ├── scheduler/          # Task scheduler
│       │   ├── energy-collector/   # Energy data collector
│       │   └── health/             # Health check endpoint
│
├── 📁 components/                  # Reusable React Components
│   ├── 📄 Layout Components
│   │   ├── Header.tsx              # Main site header
│   │   ├── ClientHeader.tsx        # Client-side header
│   │   ├── ServerHeader.tsx        # Server-side header
│   │   ├── ToastProvider.tsx       # Toast notification provider
│   │   └── BoardTheme.tsx          # Board theming component
│   ├── 📄 Content Components
│   │   ├── ContentRenderer.tsx     # Rich content renderer
│   │   ├── TiptapEditor.tsx        # Rich text editor
│   │   ├── SubPage.tsx             # Sub-page layout
│   │   ├── PDFViewer.tsx           # PDF display component
│   │   ├── PDFViewerWithPDFJS.tsx  # Advanced PDF viewer
│   │   ├── PDFThumbnailViewer.tsx  # PDF thumbnail generator
│   │   └── SimplePDFViewer.tsx     # Basic PDF viewer
│   ├── 📁 admin/                   # Admin-specific components
│   │   └── AdminLayout.tsx         # Admin panel layout
│   ├── 📁 charts/                  # Data visualization
│   │   ├── BaseChart.tsx           # Base chart component
│   │   ├── EnergyChart.tsx         # Energy usage charts
│   │   ├── GreenhouseGasChart.tsx  # GHG emission charts
│   │   └── SolarChart.tsx          # Solar generation charts
│   ├── 📁 ui/                      # UI components
│   │   └── Switch.tsx              # Toggle switch component
│   └── 📄 Feature Components
│       ├── ResearcherScreenshotDisplay.tsx    # Screenshot display
│       └── ResearcherScreenshotManager.tsx    # Screenshot management
│
├── 📁 lib/                         # Utility Libraries
│   ├── api.ts                      # API client utilities
│   ├── auth.ts                     # Authentication utilities
│   ├── database.ts                 # PostgreSQL connection pool
│   ├── utils.ts                    # General utilities
│   ├── energy-scheduler.ts         # Energy data scheduler
│   ├── carbon-tech-data.json       # Carbon tech static data
│   └── 📁 hooks/                   # Custom React hooks
│       ├── useRealtimeData.ts      # Real-time data hook
│       └── useResearcherScreenshots.ts # Screenshot data hook
│
├── 📁 types/                       # TypeScript Type Definitions
│   └── index.ts                    # Global type definitions
│
├── 📁 public/                      # Static Assets
│   ├── 📁 img/                     # Images
│   │   ├── 1-12.png               # Numbered images
│   │   ├── 2008-2024.jpg          # Year-based images
│   │   ├── a1-a9.jpg/webp         # Gallery images
│   │   ├── backup/                # Backup images
│   │   └── icons/                 # Icon assets
│   ├── 📁 html/                    # Static HTML files
│   │   ├── 2008-2024.html         # Year-based content
│   │   ├── styles.css             # HTML styles
│   │   └── img/                   # HTML-specific images
│   ├── 📁 uploads/                 # User uploads
│   │   ├── banners/               # Banner images
│   │   ├── screenshots/           # Generated screenshots
│   │   └── thumbnails/            # Generated thumbnails
│   ├── 📁 templates/               # File templates
│   │   └── carbon-tech-template.csv
│   └── 📄 Other Assets
│       ├── styles.css             # Additional styles
│       └── Various SVG/PNG files  # Icons and graphics
│
├── 📁 scripts/                     # Database & Utility Scripts
│   ├── 📄 Migration Scripts
│   │   ├── migrate-neon.js        # Main migration script
│   │   ├── check-neon-schema.js   # Schema verification
│   │   ├── init-database.js       # Database initialization
│   │   └── complete-migration-simple.js
│   ├── 📄 Data Import Scripts
│   │   ├── import-carbon-tech-data.js
│   │   ├── upload-seoul-links.js
│   │   ├── init-history-data.js
│   │   └── add-green-report-samples.js
│   ├── 📄 Table Creation SQL
│   │   ├── create-board-banners-table.sql
│   │   ├── create-carbon-tech-table.sql
│   │   ├── create-link-posts-table.sql
│   │   ├── create-main-icons-table.sql
│   │   └── create-researcher-screenshots-table.sql
│   ├── 📄 Screenshot Generation
│   │   ├── generate-screenshots.js
│   │   ├── screenshot-utils.js
│   │   └── screenshot-generation.log
│   └── 📄 Other Utilities
│       ├── convert-images.js      # Image conversion
│       ├── create-sample-pdfs.js  # PDF generation
│       └── Various check/verify scripts
│
└── 📄 Documentation
    ├── README.md                   # Main project documentation
    ├── BANNER_DEBUG_GUIDE.md      # Banner debugging guide
    └── PROJECT_STRUCTURE.md       # This file

```

## 🗄️ Database Schema

### Core Tables
1. **buildings** - Building information
2. **energy_data** - Energy consumption data
3. **solar_data** - Solar generation data
4. **boards** - Content boards/sections
5. **posts** - Content posts
6. **categories** - Post categories
7. **menus** - Navigation menus
8. **pages** - Static pages
9. **files** - File management
10. **users** - User accounts
11. **hero_slides** - Homepage slides
12. **main_icons** - Main feature icons
13. **board_banners** - Board-specific banners
14. **link_posts** - External link posts
15. **carbon_tech** - Carbon technology data
16. **researcher_screenshots** - Research screenshots
17. **collection_logs** - Data collection logs

## 🔐 Authentication & Security

- JWT-based authentication for admin panel
- Middleware protection for admin routes
- Environment-based configuration
- Secure file upload with validation

## 🚀 Key Features

### Public Features
1. **Real-time Energy Monitoring** - Live energy usage data
2. **Greenhouse Gas Analytics** - Emission tracking and trends
3. **Solar Power Dashboard** - Generation statistics
4. **Historical Timeline** - Interactive history viewer
5. **Carbon Technology Showcase** - Innovation display
6. **Infographic Display** - Visual data presentations
7. **Content Management** - Dynamic content pages

### Admin Features
1. **Comprehensive Dashboard** - System overview
2. **Content Management** - Posts, pages, categories
3. **Data Management** - Energy, solar, GHG data
4. **File Management** - Upload and organize files
5. **Menu Builder** - Dynamic navigation
6. **Banner Management** - Promotional content
7. **Screenshot Generator** - Automated captures

## 🔧 Development Scripts

```bash
# Development
npm run dev              # Start development server

# Build & Production
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run migrate         # Run database migrations
npm run migrate:check   # Verify database schema

# Linting
npm run lint           # Run ESLint
```

## 🌐 API Architecture

The API follows RESTful principles with consistent patterns:
- GET `/api/[resource]` - List resources
- POST `/api/[resource]` - Create resource
- GET `/api/[resource]/[id]` - Get single resource
- PUT `/api/[resource]/[id]` - Update resource
- DELETE `/api/[resource]/[id]` - Delete resource

Special endpoints:
- `/api/realtime/sse` - Server-sent events for real-time data
- `/api/public/*` - Public data endpoints (no auth required)
- `/api/upload` - Multipart file upload handler

## 🎨 Design System

- **Colors**: Custom palette for sustainability theme
- **Typography**: Geist Sans/Mono fonts
- **Components**: Consistent UI component library
- **Responsive**: Mobile-first responsive design
- **Animations**: Framer Motion for smooth transitions

## 📊 Data Flow

1. **Client** → Makes request to API route
2. **API Route** → Validates request and auth
3. **Database Query** → PostgreSQL via pg pool
4. **Data Transform** → Format for client
5. **Response** → JSON API response
6. **Client Update** → SWR caching and UI update

## 🔄 Real-time Updates

- Server-Sent Events for live data streaming
- 30-second to 2-minute update intervals
- Automatic reconnection on disconnect
- Efficient data diffing to minimize updates

This comprehensive system provides a complete solution for Seoul National University's carbon neutrality monitoring and management needs.