# AmazonFlow / `aws_hack_proj` — Important Files Directory

This folder consolidates all the core source code, components, styles, configurations, and mock data for the redesigned operations dashboard.

---

## 📁 Directory Structure

```
important_files/
├── App.jsx                        # Master layout, navigation tab routing & HITL state machine
├── App.css                        # Complete stylesheet (dark theme, glassmorphism, lime accents)
├── index.css                      # Global styles, typography & color variables
├── main.jsx                       # React DOM entry point
├── index.html                     # HTML root shell
├── package.json                   # Dependencies & scripts
├── vite.config.js                 # Vite bundler configuration
│
├── components/                    # Modular UI components
│   ├── Navbar.jsx                 # Top bar with logo, light pill tabs & user profile
│   ├── HeroOverview.jsx           # Conveyor visual hero, bold stacked title, glassmorphic KPIs
│   ├── MarchReport.jsx            # March Report: Overview KPI, Sales Goal & Donut Distribution
│   ├── OpsBannerAndStats.jsx      # Delay alerts, design notes & 4 KPI cards
│   ├── ExceptionList.jsx          # Active exceptions table with tabs
│   ├── ExceptionCard.jsx          # Hub diagnostics & telemetry card
│   ├── AIRecommendationCard.jsx  # AI recommendation & confidence factors
│   ├── ReviewModal.jsx            # HITL modal with keyboard shortcuts ([A], [R], [Esc])
│   ├── ActivityLog.jsx            # Real-time resolution audit ledger
│   ├── HubCapacityView.jsx        # National Hub Capacity & Ingestion Grid
│   ├── AutomatedRoutingView.jsx   # Autonomous routing rules & carrier dispatch
│   ├── AuditComplianceView.jsx    # Regulatory compliance & SHA-256 verification
│   ├── LiveTelemetryView.jsx      # Live edge IoT sensor streaming feed
│   ├── Sidebar.jsx                # Collapsible side navigation rail
│   ├── Topbar.jsx                 # Secondary toolbar with collector controls
│   ├── CommandBar.jsx             # Disruption trigger & re-run analysis bar
│   ├── StatsStrip.jsx             # Metrics overview strip
│   ├── WorkflowStepper.jsx        # Pipeline stage progression bar
│   └── Footer.jsx                 # System status footer
│
└── data/
    └── mockException.js           # Multi-hub exception & telemetry mock database
```

---

## 🚀 How to Run

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```
