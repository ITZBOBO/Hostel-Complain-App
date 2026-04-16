# Mobile-First App Architecture Rebuild

- [x] **1. Navigation Components**
  - [x] Delete `MobileQuickNav.tsx`, `AdminSidebar.tsx`, `AdminMobileSidebar.tsx`.
  - [x] Create `components/UnifiedNav.tsx` (Handles Top-rail on Desktop, Bottom-bar on Mobile, including the elevated Amber FAB for student "Submit").

- [x] **2. Role Layout Adjustments (The App Shell)**
  - [x] `app/dashboard/layout.tsx`: Implement `min-h-[100dvh]` shell. Remove sidebars. Insert `UnifiedNav`.
  - [x] `app/admin/layout.tsx`: Implement App Shell. Remove sidebars. Insert `UnifiedNav`.
  - [x] `app/artisan/layout.tsx`: Implement App Shell. Remove sidebars. Insert `UnifiedNav`.

- [x] **3. Touch Targets Standardization**
  - [x] Update all inputs, selects, and primary buttons globally to `min-h-[48px]`.

- [x] **4. Student Portal Routing**
  - [x] `app/dashboard/page.tsx`: Create dashboard Home (Stats: Total, Pending, Resolved).
  - [x] `app/dashboard/profile/page.tsx`: Move student profile card here, add Logout button.
  - [x] Adjust `app/dashboard/complaints/page.tsx` for optimal mobile viewing.
  - [x] Update `app/dashboard/complaints/new/page.tsx` controls to 48px.

- [x] **5. Admin Portal Overhaul (Cards Only)**
  - [x] `app/admin/complaints/page.tsx`: Remove `<table>`. Rebuild as Card feed natively.
  - [x] `app/admin/artisans/page.tsx`: Delete `<table>` block out of existence. Ensure Card layout spans desktop/mobile.

- [x] **6. Artisan Portal Verification**
  - [x] Ensure `app/artisan/page.tsx` and detail views comply with mobile-first cards and 48px UI norms.
