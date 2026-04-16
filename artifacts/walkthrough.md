# Complete PWA Mobile App Re-architecture

The entire application has been fundamentally rebuilt natively aligning with the classic **Progressive Web App (PWA)** mobile-device paradigm. We discarded the notion of building a responsive website (which was relying on Left Navigation Sidebars hiding on small screens) and transitioned to a unified `100dvh` App Shell.

## Key Universal Implementations

### 🔥 Unified Flow: The App Shell Layer
- All roles (Student, Admin, Artisan) now utilize an identical native Mobile Layout.
- **Top Stickies**: Viewports now contain a Fixed Universal Navigation Top Header (with a 68px rigid limit clamping).
- **Desktop Rails vs Mobile Bottom-Bars**: A newly engineered decoupled client bridge, `<AppNavigation/>` gracefully intercepts the breakpoint size and natively positions items in the rigid **Bottom Application Dock** (on screen `< 768px`) or maps them directly right of the standard Top Header when accessing via desktop. This explicitly kills HTML Sidebars out of existence forever, fulfilling your mandate cleanly.
- Over-scrolling acts fluidly underneath these components imitating iOS/Android dynamics natively.

### ☝️ Strict Minimal Height Standards
- Adhering to Apple accessibility sizing specifications natively mapping to mobile, **every** HTML `input`, `button`, and `<select>` drop-down now employs a rigid threshold footprint of `48px` scaling flawlessly minimizing input latency or misclicks.

### ⭐ 3D Elevated Navigation
- As dictated, the "Submit New Complaint" button housed in the bottom array for students has been uniquely engineered to **Float out** (`relative -top-5`), scaling itself up into an enlarged, prominent Amber `<Link />` visually distinguishing it as the core priority action node across the app suite.

## Interface Modernizations

### Students
- **New Home Tab (`/dashboard`)**: Redirect removed. This acts as their immediate loading zone aggregating total tasks into quick analytics.
- **New Abstract Profile Tab (`/dashboard/profile`)**: The enormous profile sidebar card was evicted entirely. Student meta-data is now natively abstracted onto its own physical view via the new bottom navigation bar preventing dashboard crowding. 

### Admins
- **Absolute Card Eradication (`/admin/artisans`)**: The standard list of assigned artisans has explicitly deleted its `HTML <table>` backend structure, converting rigidly over to mapped grid container flex boxes scaling evenly no matter the client screen size. They act identically to how our modern `<ComplaintCard/>` architecture was designed.

Enjoy the insanely clean mobile ergonomics on the refreshed app portal frontend!
