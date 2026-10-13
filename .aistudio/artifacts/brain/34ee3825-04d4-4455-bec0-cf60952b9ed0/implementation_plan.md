# GitHub Integration, Firebase Firestore Setup & Mobile Experience Finalization

This plan finalizes the mobile food ordering UX, sets up real-time Firebase Firestore database persistence for orders and menu management, and prepares the complete production codebase with Git initialization, GitHub Actions automation, and Netlify/Cloud deployment configuration.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following technical directions have been confirmed based on your responses:
> - **Hosting & Production Target**: Netlify / Cloud hosting support with Next.js production build configuration and `netlify.toml` / runtime adapters.
> - **GitHub CI/CD Automation**: Complete automated GitHub Actions workflow (`.github/workflows/deploy.yml`) with automated lint, build validation, and branch deployment triggers.
> - **Live Database Engine**: Firebase Firestore integration for real-time order recording, live status synchronization, and admin panel management.
> - **Mobile Navigation & Cart Polish**: Bottom navigation items will seamlessly close active overlays and route to their destinations; bottom action bars in CartDrawer and FoodDetailModal will remain strictly anchored and visible.

---

### 1. Overview & Core Concept

- **What It Delivers**: A production-grade, mobile-optimized online restaurant ordering web app for Benapole Special Sweet Curd & Snacks, backed by real-time Firestore synchronization, auto-authenticated admin controls with Remember Me, and complete GitHub automated publishing workflows.
- **Target Audience**: Benapole food lovers, local customers placing quick mobile orders with zero horizontal scrolling hassle, and restaurant administrators monitoring incoming orders on phones and tablets.
- **Key Value**: Seamless ordering from browse-to-checkout in under 60 seconds on any smartphone screen, plus instant push-to-deploy capability on GitHub.

---

### 2. User Experience & Visual Design

- **Mobile Viewport Discipline**:
  - Zero horizontal overflow guaranteed through `overflow-x: hidden`, `max-w-full`, and flexible header components.
  - Redundant top header "My Orders" and "Cart" buttons hidden on mobile devices in favor of the thumb-friendly 5-slot Bottom Navigation bar.
- **Cart & Food Modal Ergonomics**:
  - The Food Detail bottom modal and Cart Drawer will have persistent, non-compressible sticky action bars (`shrink-0`, `safe-bottom`) ensuring "কার্টে যোগ করুন" (Add to Cart) and "চেকআউট করুন" (Proceed to Checkout) are never clipped by mobile navigation bars.
  - When Cart Drawer is empty, an explicit, prominent button ("মেনু দেখুন ও অর্ডার করুন") smoothly closes the drawer and scrolls directly to the menu grid.
- **Smooth Bottom Navigation Transitions**:
  - Tapping any Bottom Navigation tab (হোম, মেনু, অর্ডার, হেল্পলাইন) while inside the Cart Drawer or an open modal will immediately close all overlays and transition smoothly to the requested screen without requiring the user to locate the close (X) icon first.
- **Admin Panel Access**:
  - Persistent Remember Me authentication using secure client-side tokens and auto-login hooks, retaining administrator status across device reloads while prompting new/unauthorized visitors for passkeys.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Bottom Navigation Overlay Dismissal & Routing**
  - *Chosen Approach*: Centralized `dismissAndNavigate(destination)` handler wired across all Bottom Navigation buttons.
  - *Why*: Eliminates the trapped feeling where a user must manually find and tap the close "X" icon before moving to the Menu or Home page.
- **Decision 2: Firebase Firestore Database Architecture**
  - *Chosen Approach*: Document-driven Firestore database for `orders`, `menu_items`, and `site_settings` with client SDK listeners and offline fallback.
  - *Why*: Provides live, zero-polling order updates to the restaurant admin dashboard and instant confirmation to customers.
- **Decision 3: GitHub CI/CD & Netlify Readiness**
  - *Chosen Approach*: Standardized `.gitignore`, Next.js standalone export configuration, `netlify.toml` redirect rules, and GitHub Actions workflow.
  - *Why*: Allows the owner to connect their GitHub repository with Netlify or Vercel and publish instantly with zero manual server maintenance.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   Customer Device                      │
│   (Mobile Touch Viewport: 375px - 430px Responsive)    │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│     BottomNav Bar     │       │   CartDrawer / Modal  │
│  [Home][Menu][Cart]   │       │  [Sticky Action Bar]  │
│  [Orders][Support]    │◄──────┤  [Auto Dismissal Hub] │
└───────────┬───────────┘       └───────────┬───────────┘
            │                               │
            └───────────────┬───────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│                   AppContext & State                   │
│   (Cart Items, Pricing, Admin Auth, Language, Coupons)  │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│  Firebase Firestore   │       │   GitHub Repository   │
│  • /orders (live)     │       │  • .github/workflows  │
│  • /menu_items        │       │  • netlify.toml       │
│  • /site_settings     │       │  • README.md setup    │
└───────────────────────┘       └───────────────────────┘
```

- **Data Models**:
  - `orders`: Unique order ID, customer name, phone number, delivery address, items array, item notes, subtotal, delivery fee, discount, grand total, status (`pending`, `confirmed`, `cooking`, `delivering`, `completed`, `cancelled`), timestamp.
  - `site_settings`: Delivery fee thresholds, restaurant open/closed status, operating hours, announcement banner.
- **Git & GitHub Artifacts**:
  - Complete Git repository initialization with clean initial commit.
  - `.github/workflows/deploy.yml` for automated build verification on push.
  - `netlify.toml` with Next.js plugin configuration for Netlify deployment.
  - `README.md` in Bengali & English with exact step-by-step instructions to link GitHub, add Firebase keys, and run online.
