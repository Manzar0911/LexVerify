# Design System
# AI-Powered Vendor Verification Workspace

---

## 1. Overview

This design system defines the visual language, component library, and interaction patterns for the AI-Powered Vendor Verification Workspace. It is intended to ensure **consistency, accessibility, and developer efficiency** across all frontend components built with React (TypeScript).

> **Design Philosophy:** Clean, professional, and data-dense. Optimized for internal tooling and review workflows. Functionality over aesthetics.

---

## 2. Color Palette

### 2.1 Brand / Primary Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-primary-50` | `#EFF6FF` | Light backgrounds, hover states |
| `--color-primary-100` | `#DBEAFE` | Badges, pills |
| `--color-primary-500` | `#3B82F6` | Primary buttons, links |
| `--color-primary-600` | `#2563EB` | Button hover state |
| `--color-primary-700` | `#1D4ED8` | Button active state |
| `--color-primary-900` | `#1E3A8A` | Dark accents |

### 2.2 Neutral / Gray Scale

| Token | Hex | Usage |
|---|---|---|
| `--color-gray-50` | `#F9FAFB` | Page background |
| `--color-gray-100` | `#F3F4F6` | Card background, table rows |
| `--color-gray-200` | `#E5E7EB` | Borders, dividers |
| `--color-gray-400` | `#9CA3AF` | Placeholder text |
| `--color-gray-600` | `#4B5563` | Secondary text |
| `--color-gray-800` | `#1F2937` | Primary text |
| `--color-gray-900` | `#111827` | Headings |

### 2.3 Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-success-100` | `#DCFCE7` | Success background |
| `--color-success-500` | `#22C55E` | Success icon/text |
| `--color-success-700` | `#15803D` | Verified status |
| `--color-warning-100` | `#FEF9C3` | Warning background |
| `--color-warning-500` | `#EAB308` | Warning icon/text |
| `--color-warning-700` | `#A16207` | Mismatch / Action Required |
| `--color-error-100` | `#FEE2E2` | Error background |
| `--color-error-500` | `#EF4444` | Error icon/text |
| `--color-error-700` | `#B91C1C` | Rejected status |
| `--color-info-100` | `#E0F2FE` | Info background |
| `--color-info-500` | `#0EA5E9` | Info icon/text |

### 2.4 Workflow Status Colors

| Status | Background | Text |
|---|---|---|
| Draft | `--color-gray-100` | `--color-gray-600` |
| Under Review | `--color-info-100` | `#0369A1` |
| Action Required | `--color-warning-100` | `--color-warning-700` |
| Approved | `--color-success-100` | `--color-success-700` |
| Rejected | `--color-error-100` | `--color-error-700` |

---

## 3. Typography

### 3.1 Font Family

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

**Import (Google Fonts):**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 3.2 Type Scale

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `text-xs` | 12px | 16px | 400 | Captions, badges |
| `text-sm` | 14px | 20px | 400 | Body text, form labels |
| `text-base` | 16px | 24px | 400 | Default body |
| `text-lg` | 18px | 28px | 500 | Section subtitles |
| `text-xl` | 20px | 28px | 600 | Card headings |
| `text-2xl` | 24px | 32px | 600 | Page headings |
| `text-3xl` | 30px | 36px | 700 | Main page titles |

---

## 4. Spacing System

Based on a **4px base unit**:

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Micro spacing |
| `space-2` | 8px | Tight spacing |
| `space-3` | 12px | Small spacing |
| `space-4` | 16px | Default spacing |
| `space-6` | 24px | Section padding |
| `space-8` | 32px | Large padding |
| `space-12` | 48px | Section gaps |
| `space-16` | 64px | Page sections |

---

## 5. Layout

### 5.1 Grid System

- **Breakpoints:**
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px

- **Container:** max-width `1280px`, auto margins, `px-6` padding
- **Column Grid:** 12-column grid using CSS Grid or Flexbox

### 5.2 Page Layout Structure

```
+--------------------------------------------------+
|  Sidebar (260px fixed)  |  Main Content Area     |
|                         |                        |
|  - Navigation Links     |  - Page Header         |
|  - Vendor List          |  - Content Cards       |
|  - Status Filters       |  - Forms / Tables      |
+--------------------------------------------------+
```

### 5.3 Card Layout

```
+----------------------------------------+
|  Card Header (title + actions)         |
+----------------------------------------+
|  Card Body (main content)              |
|                                        |
+----------------------------------------+
|  Card Footer (pagination / buttons)    |
+----------------------------------------+
```

---

## 6. Component Library

### 6.1 Buttons

| Variant | Background | Text | Usage |
|---|---|---|---|
| Primary | `--color-primary-500` | White | Main CTA |
| Secondary | White | `--color-primary-500` | Secondary actions |
| Danger | `--color-error-500` | White | Destructive actions |
| Ghost | Transparent | `--color-gray-600` | Subtle actions |

**Sizes:** `sm` (32px height), `md` (40px height), `lg` (48px height)

**States:** Default, Hover, Active, Disabled, Loading (with spinner)

### 6.2 Form Inputs

```
Input Field:
- Height: 40px (md) / 36px (sm)
- Border: 1px solid --color-gray-200
- Border-radius: 6px
- Focus: 2px ring --color-primary-500 / 20% opacity
- Error: border-color --color-error-500
- Label: text-sm, font-weight 500, --color-gray-700

Textarea:
- min-height: 80px
- resize: vertical

Select:
- Same as Input + custom chevron icon
```

### 6.3 Status Badge

```
<StatusBadge status="Verified" />
<StatusBadge status="Mismatch" />
<StatusBadge status="Unable to Verify" />
<StatusBadge status="Draft" />
<StatusBadge status="Action Required" />
<StatusBadge status="Approved" />
<StatusBadge status="Rejected" />
```

- Rounded pill shape
- 6px padding horizontal, 2px vertical
- Font size: text-xs, font-weight 600
- Uses semantic colors from Section 2.3

### 6.4 Document Card

```
+----------------------------------------------+
|  [Icon] Document Type Name       [Status Badge]|
+----------------------------------------------+
|  Uploaded: filename.pdf                        |
|  Extracted Fields:                             |
|    Company Name: [editable field]              |
|    Reg. Number:  [editable field]              |
|    Address:      [editable field]              |
+----------------------------------------------+
|  [Re-extract] [Save Changes]                  |
+----------------------------------------------+
```

### 6.5 Comparison Table

```
+----------------+------------------+------------------+---------+
| Field          | Doc 1 (Reg.)     | Doc 2 (GST)     | Status  |
+----------------+------------------+------------------+---------+
| Company Name   | ABC Tech Pvt Ltd | ABC Technology  | MISMATCH|
| GST Number     | 27AABCU9603R1Z1  | 27AABCU9603R1Z1 | MATCH   |
| Address        | 123 Main St      | -               | MISSING |
+----------------+------------------+------------------+---------+
```

### 6.6 Workflow Status Stepper

```
[Draft] --> [Under Review] --> [Action Required] --> [Approved/Rejected]
  (filled)     (current)          (pending)
```

- Horizontal stepper with connecting lines
- Current step highlighted with primary color
- Completed steps filled/checkmarked

### 6.7 Task Card

```
+----------------------------------------+
|  Task: "Upload missing bank document"  |
|  Priority: HIGH         Due: 2026-10-07|
+----------------------------------------+
|  Status: [Pending] [Mark Complete]     |
+----------------------------------------+
```

### 6.8 Version History Item

```
+----------------------------------------+
|  v3 | Oct 01, 2026 14:22 | Admin       |
|  Company Name:                         |
|    Before: "ABC Technologies"          |
|    After:  "ABC Technologies Pvt Ltd"  |
|  [Restore this version]                |
+----------------------------------------+
```

### 6.9 Alert / Notification

| Type | Icon | Color |
|---|---|---|
| Success | check-circle | `--color-success-500` |
| Warning | exclamation-triangle | `--color-warning-500` |
| Error | x-circle | `--color-error-500` |
| Info | information-circle | `--color-info-500` |

### 6.10 Loading States

- **Spinner:** Animated circle, primary color, sizes: sm/md/lg
- **Skeleton:** Gray animated pulse for table rows / cards
- **Progress Bar:** Horizontal bar for document upload progress

---

## 7. Icons

**Library:** Heroicons (outline style by default, solid for filled states)
**Sizes:** 16px (sm), 20px (md), 24px (lg)

| Icon | Usage |
|---|---|
| `DocumentIcon` | Documents section |
| `CheckCircleIcon` | Verified / Success |
| `ExclamationTriangleIcon` | Warning / Mismatch |
| `XCircleIcon` | Error / Rejected |
| `ClockIcon` | Pending / Due dates |
| `ArrowPathIcon` | Re-extract / Refresh |
| `HistoryIcon` | Version history |
| `EnvelopeIcon` | Email automation |
| `BuildingOfficeIcon` | Company / Vendor |
| `MagnifyingGlassIcon` | Search / Verify |

---

## 8. Tables

### Standard Data Table
```
- Header: bg-gray-50, text-xs uppercase, text-gray-500, border-b
- Rows: bg-white, border-b, hover:bg-gray-50
- Padding: px-6 py-4 per cell
- Responsive: horizontal scroll on sm breakpoint
```

---

## 9. Navigation

### 9.1 Sidebar Navigation

```
+-----------------------------+
|  [Logo] VendorVerify        |
+-----------------------------+
|  Dashboard                  |
|  Vendors                    |
|  - All Vendors              |
|  - Pending Review           |
|  - Action Required          |
+-----------------------------+
|  Settings (bottom)          |
+-----------------------------+
```

### 9.2 Page Header

```
+--------------------------------------------------+
|  [Back Arrow]  Page Title          [Action Btn] |
|  Breadcrumb: Vendors > ABC Corp > Documents     |
+--------------------------------------------------+
```

---

## 10. Interaction Patterns

### 10.1 Form Validation
- Validate on blur (not on keypress)
- Show error message below the field
- Red border + error icon on invalid fields
- Disable submit until required fields are valid

### 10.2 Optimistic UI
- Immediately update status badges on state change
- Revert if API call fails with error toast

### 10.3 Toast Notifications
- Position: Top-right corner
- Auto-dismiss: 4 seconds
- Types: Success, Error, Warning, Info

### 10.4 Confirmation Modals
- Required for: Reject vendor, Restore version, Send email
- Two-button: Cancel (ghost) + Confirm (primary/danger)

### 10.5 Inline Editing
- Click-to-edit pattern for extracted document fields
- Show edit icon on hover
- Save/Cancel buttons appear when in edit mode

---

## 11. Accessibility (A11y)

- All interactive elements have visible focus ring
- Color is never the sole indicator of status (always include icon/text)
- Form labels explicitly associated with inputs (`htmlFor`)
- ARIA labels on icon-only buttons
- Keyboard navigation supported throughout
- Minimum contrast ratio: 4.5:1 (WCAG AA)

---

## 12. CSS Architecture

### Approach: CSS Modules + CSS Variables

```
src/
  styles/
    variables.css    <- All design tokens (colors, spacing, fonts)
    reset.css        <- Normalize/reset
    global.css       <- Body, typography defaults
    utilities.css    <- Shared utility classes
  components/
    Button/
      Button.module.css
    StatusBadge/
      StatusBadge.module.css
```

### Naming Convention: BEM-inspired within CSS Modules

```css
/* Component.module.css */
.card { ... }
.card__header { ... }
.card__body { ... }
.card--highlighted { ... }
```

---

*Design System v1.0 | AI-Powered Vendor Verification Workspace*
