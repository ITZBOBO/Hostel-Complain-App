# Goal Description

Fundamentally rebuild the entire Hostel Portal (for Students, Admins, and Artisans) utilizing an authentic "Mobile-App First" architecture natively targeted at 375px viewports (iPhone SE class). We are abandoning the responsive website paradigm and adopting a progressive web app paradigm heavily featuring sticky top-headers, fixed bottom-nav bars, and 100% card-based UI. 

Desktop will serve as a scaled-up, clean version of this mobile foundation (meaning no permanent left-sidebars for any role on desktop either; desktop will utilize a top-rail or left-rail equivalent of the bottom nav).

## Proposed Changes

### Architecure Overview: "The App Shell"
Every layout (`dashboard`, `admin`, `artisan`) will be refactored into an App Shell:
```html
<div class="bg-gray-50 flex flex-col min-h-[100dvh]">
  <TopHeader class="fixed top-0 w-full h-16 z-50 />
  <main class="flex-1 mt-16 mb-16 overflow-y-auto px-4 py-6">
    ... routes ...
  </main>
  <BottomNav class="fixed bottom-0 w-full h-16 z-50 md:hidden" />
</div>
```

### 1. Global Navigation Paradigm (No Sidebars)
- **Student Bottom Nav**: 
  - `Home` (`/dashboard` - Dashboard stats & basic info)
  - `Complaints` (`/dashboard/complaints` - List of history)
  - `Submit` (`/dashboard/complaints/new` - Centered prominent action)
  - `Profile` (`/dashboard/profile` - Profile info & Logout)
- **Admin Bottom Nav**:
  - `Home` (`/admin` - 2x2 Stats Card layout)
  - `Complaints` (`/admin/complaints` - Cards only list)
  - `Artisans` (`/admin/artisans` - Add/Manage artisans)
  - `Settings` (Logout)
- **Artisan Bottom Nav**:
  - `Tasks` (`/artisan` - Assigned complaints)
  - `Profile` (Logout)

### 2. File Restructuring
#### [NEW] `components/BottomNav.tsx`
A polymorphic client component capable of mapping routes natively to a physical sticky bottom bar. Will employ `text-[10px]` labels underneath large `text-lg` FontAwesome icons.

#### [MODIFY] Layouts (`app/dashboard/layout.tsx`, `app/admin/layout.tsx`, `app/artisan/layout.tsx`)
- Completely rip out all implementations of `aside`, Left-sidebars, and the temporary `MobileQuickNav`.
- Inject the fixed `16px`/`4rem` header logic.
- Inject the `BottomNav`.

#### [NEW] `app/dashboard/profile/page.tsx`
Migrate the heavy Student Profile Card (which was previously pinned on the left side) entirely to its own dedicated page on mobile so it does not crowd the actual features. This tab will also house the `Logout` button.

#### [MODIFY] All Table Data Views
- `app/admin/complaints/page.tsx`: Destroy the HTML `<table>`. Replace it with a `flex-col` feed of uniform `<ComplaintCard />`s identical to a social media feed. On Desktop, these can sit in a clean `max-w-3xl` center column.
- `app/admin/artisans/page.tsx`: Keep strictly the Card map feed we built recently; delete the table fallback completely.

### 3. Touch Target Standardization
Expand inputs, buttons, and links from `44px` to the rigid requested standard of **`min-h-[48px]`** (or `min-h-12` in Tailwind) enforcing spacious, frictionless ergonomics padding everywhere. 

## Open Questions

1. **Desktop Presentation**: To adhere to "Desktop is a clean version of mobile", I propose the Bottom Nav simply transforms into a Top Navigation rail on viewports `>768px` (hiding the bottom nav). This completely eliminates sidebars forever. Does this behavior match your vision?
2. **Student Home vs Profile Tab**: I will construct the Profile Tab (`/dashboard/profile`) to contain the student's ID/Department info, and the Home tab (`/dashboard`) to contain a high-level summary/statistics of their complaints. Is this separation logic correct?

## Verification Plan

### Automated/Screen Checks
- Emulate inside a 375px viewport exclusively.
- Verify `Top: 0` sticky header existence.
- Verify `Bottom: 0` sticky navigation bar persistence while scrolling the `main` container.
- Tap every primary element ensuring no CSS height computes to `<48px`.
