# Githaforge Design System

**Version:** 2.0
**Last Updated:** January 2025
**Status:** ✅ Complete - Phase B

---

## Overview

This document outlines the **Githaforge Design System** - a comprehensive, accessible, and mobile-first component library built for the multi-tenant chatbot builder platform.

### Design Philosophy
- **Mobile-First**: All components responsive by default
- **Accessibility**: WCAG 2.1 AA compliant, keyboard navigation, ARIA labels
- **Theme-Aware**: Light/dark mode support via CSS custom properties
- **Performance**: Framer Motion for smooth animations
- **Consistency**: Single source of truth via design tokens

---

## Design Tokens

### Location
```
frontend/src/styles/tokens.css
```

### Token Categories

#### 1. Colors
```css
/* Brand Colors */
--color-primary-500: #3b82f6;    /* Blue - Trust, Technology */
--color-secondary-500: #06b6d4;  /* Cyan - Innovation, Energy */
--color-accent-500: #a855f7;     /* Purple - Premium, AI */

/* Semantic Colors */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;

/* Theme Colors (Light Mode) */
--bg-primary: #ffffff;
--text-primary: #111827;
--border-primary: #e5e7eb;

/* Theme Colors (Dark Mode) */
.dark {
  --bg-primary: #0f172a;
  --text-primary: #f1f5f9;
  --border-primary: #334155;
}
```

#### 2. Spacing Scale
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-4: 1rem;     /* 16px */
--space-8: 2rem;     /* 32px */
--space-16: 4rem;    /* 64px */
```

#### 3. Typography
```css
/* Font Families */
--font-sans: 'Inter', sans-serif;
--font-display: 'Poppins', 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font Sizes */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-2xl: 1.5rem;   /* 24px */
--text-4xl: 2.25rem;  /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

#### 4. Shadows
```css
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
--shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-primary: 0 10px 25px -5px rgba(59, 130, 246, 0.3);
```

#### 5. Border Radius
```css
--radius-sm: 0.25rem;   /* 4px */
--radius-base: 0.5rem;  /* 8px */
--radius-lg: 1rem;      /* 16px */
--radius-full: 9999px;
```

#### 6. Transitions
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Component Library

### 1. Button Component

**Location:** `frontend/src/components/ui/Button.tsx`

#### Variants
- `primary` - Main brand color (blue)
- `secondary` - Secondary brand color (cyan)
- `accent` - Accent color (purple)
- `outline` - Bordered with no fill
- `ghost` - Transparent with hover effect
- `danger` - Red for destructive actions
- `success` - Green for success actions

#### Sizes
- `xs` - Extra small (mobile-first)
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large
- `xl` - Extra large

#### Props
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  iconOnly?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}
```

#### Usage Examples

```tsx
import { Button } from '@/components/ui';
import { Plus, Trash2 } from 'lucide-react';

// Primary button
<Button variant="primary" size="md">
  Create Chatbot
</Button>

// Button with icon
<Button variant="secondary" icon={<Plus />} iconPosition="left">
  Add Document
</Button>

// Icon-only button
<Button variant="ghost" size="sm" iconOnly icon={<Trash2 />} />

// Loading state
<Button variant="primary" isLoading>
  Saving...
</Button>

// Full-width button (mobile)
<Button variant="primary" fullWidth>
  Sign Up
</Button>

// Destructive action
<Button variant="danger" size="sm">
  Delete
</Button>
```

#### Accessibility
- Focus-visible ring (keyboard navigation)
- Disabled state (opacity 50%, cursor not-allowed)
- ARIA attributes automatically applied
- Loading spinner with accessible label

---

### 2. Card Component

**Location:** `frontend/src/components/ui/Card.tsx`

#### Variants
- `elevated` - Shadowed card (default)
- `flat` - No shadow, secondary background
- `outlined` - Bordered card with no shadow

#### Props
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;           // Hover animation
  onClick?: () => void;
  glass?: boolean;           // Glassmorphism effect
  variant?: 'elevated' | 'flat' | 'outlined';
}
```

#### Sub-components
- `CardHeader` - Header with bottom border
- `CardTitle` - H3 heading with theme colors
- `CardDescription` - Secondary text
- `CardBody` - Main content area
- `CardFooter` - Footer with top border

#### Usage Examples

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter, Button } from '@/components/ui';

// Basic card
<Card variant="elevated">
  <CardHeader>
    <CardTitle>Chatbot Analytics</CardTitle>
    <CardDescription>View your chatbot performance metrics</CardDescription>
  </CardHeader>
  <CardBody>
    <p>Total conversations: 1,234</p>
  </CardBody>
  <CardFooter>
    <Button variant="outline" size="sm">View Details</Button>
  </CardFooter>
</Card>

// Clickable card with hover animation
<Card hover onClick={() => console.log('Clicked')}>
  <CardTitle>Featured Chatbot</CardTitle>
</Card>

// Glassmorphism card (for hero sections)
<Card glass variant="flat">
  <h2>Modern AI Chatbots</h2>
</Card>
```

---

### 3. Input Component

**Location:** `frontend/src/components/ui/Input.tsx`

#### Components
- `Input` - Standard text input
- `Textarea` - Multi-line text input
- `Select` - Dropdown selector

#### Props
```typescript
interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  placeholder?: string;
  disabled?: boolean;
}
```

#### Usage Examples

```tsx
import { Input, Textarea, Select } from '@/components/ui';
import { Mail, Lock } from 'lucide-react';

// Input with label and icon
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  icon={<Mail />}
  iconPosition="left"
  fullWidth
/>

// Input with error state
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
  icon={<Lock />}
/>

// Input with helper text
<Input
  label="Company Name"
  helperText="This will be visible to your customers"
  fullWidth
/>

// Textarea
<Textarea
  label="Description"
  placeholder="Describe your chatbot..."
  rows={4}
  fullWidth
/>

// Select dropdown
<Select
  label="Subscription Plan"
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise' },
  ]}
  fullWidth
/>
```

#### Form Validation
```tsx
import { Input } from '@/components/ui';
import { useState } from 'react';

const [email, setEmail] = useState('');
const [error, setError] = useState('');

const validateEmail = (value: string) => {
  if (!value.includes('@')) {
    setError('Invalid email address');
  } else {
    setError('');
  }
};

<Input
  label="Email"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  }}
  error={error}
  fullWidth
/>
```

---

### 4. Modal Component

**Location:** `frontend/src/components/ui/Modal.tsx`

#### Components
- `Modal` - Base modal component
- `ConfirmModal` - Pre-built confirmation dialog

#### Props
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  footer?: React.ReactNode;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}
```

#### Usage Examples

```tsx
import { Modal, ConfirmModal, Button } from '@/components/ui';
import { useState } from 'react';

const [isOpen, setIsOpen] = useState(false);

// Basic modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Create New Chatbot"
  description="Configure your chatbot settings"
  size="lg"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit}>
        Create
      </Button>
    </>
  }
>
  <Input label="Chatbot Name" fullWidth />
  <Select label="Model Preset" options={presets} fullWidth />
</Modal>

// Confirmation dialog
<ConfirmModal
  isOpen={deleteModalOpen}
  onClose={() => setDeleteModalOpen(false)}
  onConfirm={handleDelete}
  title="Delete Chatbot"
  description="Are you sure? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"
  isLoading={isDeleting}
/>
```

#### Features
- Backdrop blur effect
- Body scroll lock when open
- Escape key to close
- Focus trap (accessibility)
- AnimatePresence for smooth transitions
- Responsive sizing

---

### 5. Badge Component

**Location:** `frontend/src/components/ui/Badge.tsx`

#### Variants
- `primary` - Blue
- `secondary` - Cyan
- `accent` - Purple
- `success` - Green
- `warning` - Yellow
- `danger` - Red
- `neutral` - Gray

#### Props
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
}
```

#### Usage Examples

```tsx
import { Badge } from '@/components/ui';

// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Inactive</Badge>

// Subscription plan badges
<Badge variant="primary" size="sm" rounded>Free</Badge>
<Badge variant="accent" size="md" rounded>Pro</Badge>

// Usage in table
<tr>
  <td>Chatbot #1</td>
  <td><Badge variant="success">Online</Badge></td>
</tr>
```

---

## Tailwind CSS Extensions

### Theme-Aware Classes

The design tokens are integrated into Tailwind via custom utilities:

```css
/* Text Colors */
.text-theme-primary { color: var(--text-primary); }
.text-theme-secondary { color: var(--text-secondary); }
.text-theme-muted { color: var(--text-muted); }

/* Background Colors */
.bg-theme-primary { background-color: var(--bg-primary); }
.bg-theme-secondary { background-color: var(--bg-secondary); }

/* Border Colors */
.border-theme { border-color: var(--border-primary); }
```

### Usage in Components

```tsx
// Use theme-aware classes for automatic light/dark mode support
<div className="bg-theme-primary text-theme-primary border border-theme">
  This adapts to theme automatically
</div>

// Mix with Tailwind utilities
<div className="bg-theme-primary rounded-lg p-6 shadow-md hover:shadow-lg">
  Card content
</div>
```

---

## Animations

### Framer Motion Variants

**Location:** `frontend/src/utils/animations.ts`

```typescript
export const buttonTapAnimation = {
  scale: 0.95,
};

export const cardHoverVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};
```

### Usage Examples

```tsx
import { motion } from 'framer-motion';
import { fadeIn, slideUp } from '@/utils/animations';

// Fade in animation
<motion.div {...fadeIn}>
  <Card>Content</Card>
</motion.div>

// Slide up animation
<motion.div {...slideUp} transition={{ duration: 0.3 }}>
  <h1>Welcome to Githaforge</h1>
</motion.div>

// Staggered children
<motion.div
  variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
  initial="initial"
  animate="animate"
>
  {items.map(item => (
    <motion.div key={item.id} variants={slideUp}>
      <Card>{item.name}</Card>
    </motion.div>
  ))}
</motion.div>
```

---

## Accessibility Guidelines

### Keyboard Navigation
- All interactive elements focusable via Tab key
- Focus-visible ring on all components
- Escape key closes modals
- Arrow keys navigate select dropdowns

### Screen Readers
- Semantic HTML elements (`<button>`, `<input>`, `<label>`)
- ARIA labels on icon-only buttons
- ARIA-describedby for error messages
- Role attributes on modals (`role="dialog"`)

### Color Contrast
- All text meets WCAG AA contrast ratios
- 4.5:1 for normal text
- 3:1 for large text (18px+)
- Focus indicators visible in both themes

### Motion
- Respects `prefers-reduced-motion` media query
- All animations can be disabled via CSS

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Usage Best Practices

### 1. Consistent Spacing
Use design tokens for all spacing:

```tsx
// ✅ Good - Uses design tokens
<div style={{ padding: 'var(--space-6)', margin: 'var(--space-4)' }}>

// ❌ Bad - Hardcoded values
<div style={{ padding: '24px', margin: '16px' }}>
```

### 2. Theme-Aware Colors
Always use theme-aware classes:

```tsx
// ✅ Good - Adapts to light/dark mode
<div className="bg-theme-primary text-theme-primary">

// ❌ Bad - Hardcoded colors
<div className="bg-white text-gray-900">
```

### 3. Responsive Design
Mobile-first approach:

```tsx
// ✅ Good - Mobile-first with breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Start with mobile layout, expand for larger screens
<Button size="sm" fullWidth className="md:w-auto md:size-md">
```

### 4. Form Validation
Always provide error feedback:

```tsx
// ✅ Good - Shows error state
<Input
  label="Email"
  value={email}
  error={emailError}
  onChange={handleEmailChange}
/>

// ❌ Bad - No error feedback
<Input label="Email" value={email} />
```

---

## Component Composition Examples

### Login Form

```tsx
import { Card, CardHeader, CardTitle, CardBody, Input, Button } from '@/components/ui';
import { Mail, Lock } from 'lucide-react';
import { useState } from 'react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Login logic here
  };

  return (
    <Card variant="elevated" className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In to Githaforge</CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={<Mail />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            fullWidth
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            fullWidth
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};
```

### Chatbot Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter, Button, Badge } from '@/components/ui';
import { MessageSquare, Settings, Trash2 } from 'lucide-react';

const ChatbotCard = ({ chatbot }) => {
  return (
    <Card hover variant="elevated">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{chatbot.name}</CardTitle>
          <Badge variant={chatbot.isActive ? 'success' : 'neutral'}>
            {chatbot.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <CardDescription>
          {chatbot.description}
        </CardDescription>
      </CardHeader>

      <CardBody>
        <div className="flex items-center gap-2 text-sm text-theme-secondary">
          <MessageSquare className="w-4 h-4" />
          <span>{chatbot.messageCount} messages</span>
        </div>
      </CardBody>

      <CardFooter>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Settings />}
            onClick={() => handleEdit(chatbot.id)}
          >
            Configure
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            icon={<Trash2 />}
            onClick={() => handleDelete(chatbot.id)}
          />
        </div>
      </CardFooter>
    </Card>
  );
};
```

---

## Next Steps (Phase C)

With the design system complete, we can now proceed to:

1. **Landing Page Redesign** - Modern hero section, feature showcase, pricing
2. **Signup/Signin Pages** - Implement forms using new components
3. **Onboarding Wizard** - Multi-step flow with progress indicator
4. **Dashboard Pages** - Personalized user dashboard with stats cards
5. **Chatbot Builder** - Visual chatbot configuration interface

---

## Changelog

### Version 2.0 (January 2025)
- ✅ Created design token system (400+ lines)
- ✅ Enhanced Button component (7 variants, 5 sizes, icon support)
- ✅ Enhanced Card component (glassmorphism, variants)
- ✅ Created Input/Textarea/Select components with validation
- ✅ Created Modal/ConfirmModal components
- ✅ Created Badge component
- ✅ Updated all components to use design tokens
- ✅ Added theme-aware Tailwind classes
- ✅ Full accessibility support (WCAG 2.1 AA)

---

**End of Design System Documentation**
