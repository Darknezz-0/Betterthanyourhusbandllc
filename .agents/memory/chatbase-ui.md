---
name: Chatbase launcher and notification
description: Distinguishes the original Chatbase launcher from its separate notification bubble.
---

When adjusting the Chatbase widget, treat its notification bubbles and launcher as separate rendered elements. Hide only the notification when the user wants to remove the upper black bubble; do not remove the embed or the lower launcher.

**Why:** The third-party embed dynamically renders both, so removing the embed would remove the original chat button too.

**How to apply:** Inspect the rendered widget before changing its visibility; confirm the lower button remains usable after hiding the notification.