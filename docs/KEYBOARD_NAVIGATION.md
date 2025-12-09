# Keyboard Navigation Guide

This application is fully accessible via keyboard. Below are the keyboard shortcuts and navigation patterns available.

## Global Navigation

| Key                    | Action                                       |
| ---------------------- | -------------------------------------------- |
| `Tab`                  | Move focus to next interactive element       |
| `Shift + Tab`          | Move focus to previous interactive element   |
| `Enter` / `Space`      | Activate focused button or link              |
| `Escape`               | Close modals, dropdowns, or overlays         |
| `Skip to main content` | Press `Tab` on page load to reveal skip link |

---

## Skip Navigation

When you first load any page:

1. Press `Tab` to reveal the "Skip to main content" link
2. Press `Enter` or `Space` to jump directly to the main content area
3. This bypasses repetitive navigation elements (header, etc.)

---

## Browse Page

### Listing Cards

- **Navigate cards**: Use `Tab` to move between cards
- **Focus card**: Press `Enter` or `Space` on a focused card to focus the first interactive element (view profile button)
- **View seller profile**: Press `Enter` or `Space` on the "by [seller]" button
- **Add to cart**: Press `Enter` or `Space` on the "Add +" button

### Filters

- **Search input**: `Tab` to search field, type to filter
- **Location dropdown**: `Tab` to location, `Enter` to open, arrow keys to select, `Enter` to confirm
- **Category dropdown**: Same as location
- **Price range slider**: `Tab` to slider, arrow keys to adjust
- **Sort dropdown**: `Tab` to sort, `Enter` to open, arrow keys to select
- **Reset filters**: `Tab` to "Reset All" button, press `Enter`

### Cart

- **Open cart**: `Tab` to cart icon in header, press `Enter`
- **Navigate cart items**: Use `Tab` to move between quantity controls and remove buttons
- **Increase quantity**: `Tab` to "+" button, press `Enter`
- **Decrease quantity**: `Tab` to "-" button, press `Enter`
- **Remove item**: `Tab` to "Remove" button, press `Enter`
- **Checkout**: `Tab` to "Checkout" button, press `Enter`

---

## Header Navigation

### User Menu

- **Open user menu**: `Tab` to user avatar/name, press `Enter`
- **Navigate menu**: Use arrow keys (`↑`/`↓`) to navigate options
- **Select option**: Press `Enter` on highlighted option
- **Close menu**: Press `Escape`

### Notifications

- **Open notifications**: `Tab` to bell icon, press `Enter`
- **Navigate notifications**: Use `Tab` to move between items
- **Mark as read**: `Tab` to notification, press `Enter`
- **Clear all**: `Tab` to "Clear All" button, press `Enter`

---

## Forms

### Login / Signup

- **Navigate fields**: Use `Tab` to move between inputs
- **Fill input**: Type directly when focused
- **Toggle password visibility**: `Tab` to eye icon, press `Enter`
- **Submit form**: `Tab` to submit button, press `Enter` (or press `Enter` from any input field)
- **Show/hide password**: `Tab` to eye icon button, press `Enter` or `Space`

### Create Listing

- **File upload**: `Tab` to upload button, press `Enter` to open file dialog
- **Navigate form fields**: Use `Tab`
- **Category/location**: `Tab` to dropdown, `Enter` to open, arrow keys to select
- **Submit**: `Tab` to "Create Listing" button, press `Enter`

---

## Checkout

- **Payment method**: `Tab` to radio buttons, use arrow keys to select
- **Pickup time**: `Tab` to time inputs, type time or use browser's time picker
- **Notes**: `Tab` to notes textarea, type additional instructions
- **Place order**: `Tab` to "Place Order" button, press `Enter`

---

## Orders

### Order Cards

- **Navigate orders**: Use `Tab` to move between order cards
- **Expand details**: `Tab` to order card, press `Enter` to view details
- **Cancel order**: `Tab` to "Cancel Order" button (buyer), press `Enter`
- **Update status**: `Tab` to status dropdown (seller), arrow keys to select, `Enter` to confirm
- **Submit review**: `Tab` to "Submit Review" button, press `Enter`

### Review Modal

- **Rate seller**: `Tab` to star rating, use arrow keys (`←`/`→`) to select stars
- **Write comment**: `Tab` to comment textarea, type review
- **Submit**: `Tab` to "Submit Review" button, press `Enter`
- **Cancel**: `Tab` to "Cancel" button or press `Escape`

---

## Seller Dashboard

### Stats Cards

- **Navigate stats**: Use `Tab` to move between stat cards
- **View orders**: `Tab` to "View Orders" link, press `Enter`

### Listings Management

- **Navigate listings**: Use `Tab` to move between listing cards
- **Toggle availability**: `Tab` to "Available"/"Unavailable" toggle, press `Enter`
- **Edit listing**: `Tab` to edit icon button, press `Enter`
- **Delete listing**: `Tab` to trash icon button, press `Enter`

---

## Modals & Dialogs

### General

- **Close modal**: Press `Escape` or `Tab` to close button and press `Enter`
- **Confirm action**: `Tab` to confirm button, press `Enter`
- **Cancel action**: `Tab` to cancel button, press `Enter` or press `Escape`

### Focus Trap

All modals implement focus trapping:

- When a modal opens, focus moves to the first interactive element
- `Tab` cycles focus within the modal only
- Cannot `Tab` to elements outside the modal while it's open
- Focus returns to trigger element when modal closes

---

## Accessibility Features

### Screen Reader Support

- **ARIA labels**: All interactive elements have descriptive labels
- **Live regions**: Dynamic content updates are announced
- **Semantic HTML**: Proper heading hierarchy and landmarks

### Visual Indicators

- **Focus rings**: Visible red ring around focused elements
- **High contrast**: Dark mode with sufficient contrast ratios
- **No motion**: Animations respect `prefers-reduced-motion`

---

## Tips for Keyboard Users

1. **Discover interactive elements**: Press `Tab` repeatedly to see all focusable elements
2. **Skip repetitive navigation**: Always use "Skip to main content" link on page load
3. **Close overlays quickly**: Press `Escape` to close modals, dropdowns, and menus
4. **Form submission**: Press `Enter` from any input field to submit forms (no need to Tab to submit button)
5. **Dropdown navigation**: Use arrow keys in dropdowns instead of `Tab` for faster selection

---

## Browser Support

Keyboard navigation works in all modern browsers:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Feedback

Encounter keyboard navigation issues? Please report them via:

- GitHub Issues: [campus-nightmarket/issues](https://github.com/h-yzeng/campus-nightmarket/issues)
- Email: <support@campusnightmarket.com>

---

**Last Updated**: January 2025
