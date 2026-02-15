---
name: React Animation Skill
description: Best practices for creating animated UIs with React and Framer Motion.
---

# React UI Animations (Framer Motion)

## Overview

Guidelines for implementing smooth, performant animations in the React UI dashboard.

## Core Patterns

### 1. Page Transitions

Wrap routes or main content in `AnimatePresence` and `motion.div`.

```jsx
import { motion, AnimatePresence } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// Inside component
<motion.div
  variants={pageVariants}
  initial="initial"
  animate="animate"
  exit="exit"
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>
```

### 2. Micro-interactions (Hover/Tap)

Use `whileHover` and `whileTap` for interactive elements.

```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="btn-primary"
>
  Click Me
</motion.button>
```

### 3. List Animations

Use `staggerChildren` to animate lists or grids of items sequentially.

```jsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0 },
  show: { opacity: 1 }
};

<motion.ul variants={container} initial="hidden" animate="show">
  <motion.li variants={item} />
  <motion.li variants={item} />
</motion.ul>
```

## Performance

- Animate `transform` and `opacity` only (GPU accelerated).
- Avoid animating `width`, `height`, `top`, `left` unless necessary (triggers layout structure).
