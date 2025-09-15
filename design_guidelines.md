# Income Tracking Application Design Guidelines

## Design Approach
**Selected Approach**: Reference-Based Design inspired by Wave and Orange Money interfaces
**Justification**: Financial applications require trust through clean, professional interfaces. Wave and Orange Money's proven UX patterns will create familiarity for users already using these services.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Orange: 16 100% 59% (Orange Money brand)
- Teal: 174 59% 65% (Wave brand)
- Background: 210 14% 97% (light grey)
- Text: 210 29% 24% (dark blue-grey)
- Success: 145 63% 42% (green)
- Card: 0 0% 100% (white)

**Dark Mode:**
- Background: 210 11% 15%
- Cards: 210 11% 21%
- Text: 210 14% 89%
- Borders: 210 11% 25%

### B. Typography
**Font Stack**: Inter for primary UI, Roboto as fallback
- Headings: 600 weight, sizes 24px/20px/18px
- Body: 400 weight, 16px base
- Captions: 400 weight, 14px
- Numbers/amounts: 500 weight for emphasis

### C. Layout System
**Spacing Units**: Tailwind units of 2, 4, 6, and 8 (8px, 16px, 24px, 32px)
- Container padding: p-6
- Card spacing: p-4
- Element margins: m-2, m-4
- Section gaps: gap-6, gap-8

### D. Component Library

**Navigation**
- Top navigation bar with app logo and user menu
- Mobile: Hamburger menu with slide-out drawer
- Active states with subtle orange/teal indicators

**Dashboard Cards**
- White background with subtle shadow (shadow-sm)
- Rounded corners (rounded-lg)
- Transaction cards with amount highlighting
- Income source icons with category colors

**Transaction Lists**
- Table view for desktop with sortable columns
- Card view for mobile with swipe actions
- Amount display with color coding (green for income)
- Payment source badges (Wave/Orange Money branded)

**Forms & Inputs**
- Outlined input fields with focus states
- Category dropdowns with icons
- Date range pickers with calendar interface
- Search bars with filtering chips

**Data Visualization**
- Simple bar charts for income trends
- Donut charts for category breakdowns
- Minimal, clean styling without excessive decoration

**Buttons**
- Primary: Orange background for main actions
- Secondary: Teal outline for secondary actions
- Ghost: Text-only for tertiary actions
- When on images: Blurred background for outline variants

### E. Responsive Behavior
**Mobile-First Design**
- Single column layout on mobile
- Card-based transaction display
- Bottom sheet modals for actions
- Collapsible filters and search

**Desktop Enhancements**
- Two-column dashboard layout
- Table view for transactions
- Sidebar for filters and categories
- Hover states for interactive elements

## Key Design Principles
1. **Trust & Clarity**: Clean, professional interface builds user confidence
2. **Familiar Patterns**: Leverage Wave/Orange Money UX patterns users know
3. **Mobile Priority**: Optimize for mobile money service users
4. **Data Hierarchy**: Clear visual hierarchy for financial information
5. **Minimal Friction**: Streamlined flows for quick income tracking

## Visual Treatment
- Clean, minimal interface with generous whitespace
- Subtle shadows and borders for depth without distraction
- Consistent 8px grid system throughout
- Branded colors used strategically, not overwhelmingly
- Professional typography with clear hierarchy