# InfoBanner Component

A responsive, expandable hover info banner component for the Tales of Adventure app.

## Features

- **Expandable on hover**: Banner expands from narrow (220px) to full width with smooth animation
- **RTL Support**: Designed for Persian/RTL text direction
- **Accessibility**: Full keyboard navigation support with ARIA attributes
- **Responsive**: Adapts to different screen sizes
- **Reduced Motion**: Respects user's motion preferences
- **Customizable**: Props for title, description, and icon

## Usage

```tsx
import InfoBanner from './InfoBanner';

// Default usage
<InfoBanner />

// Custom usage
<InfoBanner 
  title="درباره ماجراجویی"
  description="Your custom description here..."
  icon="⚔️"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"درباره ماجراجویی"` | Banner title text |
| `description` | `string` | `"در Tales of Adventure..."` | Description text shown when expanded |
| `icon` | `React.ReactNode` | `"⚔️"` | Icon displayed in the banner |

## Styling

The component uses custom CSS classes that match the app's design system:

- **Background**: Vertical cream gradient (`#fff6e6` to `#f5e7ca`)
- **Border**: 1px solid `#e3d6b3`
- **Shadow**: `0 10px 24px rgba(0,0,0,0.08)`
- **Text Colors**: Title `#4b2e1e`, Description `#7b5a44`
- **Border Radius**: 20px
- **Icon Chip**: 40×40px with `rgba(255,200,120,0.35)` background

## Accessibility

- **ARIA Labels**: Proper `aria-label` and `aria-expanded` attributes
- **Keyboard Navigation**: Enter/Space to toggle expanded state
- **Focus Management**: Visual focus indicators
- **Screen Reader Support**: Proper semantic structure

## Responsive Behavior

- **Desktop**: 220px default width, 170px expanded height
- **Mobile (< 720px)**: 180px default width, 220px expanded height
- **Text Scaling**: Slightly smaller text on mobile devices

## Animation

- **Smooth Transitions**: Width, height, padding, and caret rotation
- **Text Effects**: Fade and slide animations for description
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **Hover States**: Enhanced shadow and scale effects

## Integration

The component is integrated into the Lobby page above the Create Room and Join Room cards:

```tsx
// In Lobby.tsx
<div className="max-w-6xl mx-auto">
  {/* Header content */}
  
  {/* Info Banner */}
  <InfoBanner />
  
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* Create Room and Join Room cards */}
  </div>
</div>
```
