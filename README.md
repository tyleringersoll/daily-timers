# Daily Timers

Repeating work-hour timers and weekly task tracking, right in your browser. Built for personal use and hosted at [daily-timers.ingersoll.dev](https://daily-timers.ingersoll.dev).

## Features

- Multiple concurrent countdown timers with circular progress rings
- Configurable active-hours window — timers auto-pause and resume on schedule
- Timezone-aware schedule (defaults to your local timezone)
- Browser notifications and audio alert on timer completion
- Weekly task tracker with per-day tabs and a full-week view
- Tasks marked as "repeating" survive the weekly auto-reset; one-off tasks are cleared
- Dark / light theme with system-preference awareness and localStorage persistence
- All data persisted in `localStorage` — no backend, no account
- Keyboard accessible throughout (ARIA tabs, focus-trapped toast, skip-nav link)

## Stack

- **Vue 3** (Composition API, `<script setup>`)
- **Pinia** — singleton state stores for timers, schedule, weekly tasks, toast queue, and theme
- **SCSS** — custom design system matching [tyleringersoll.com](https://tyleringersoll.com) brand tokens
- **Vite** — build tool
- **Vitest** — unit tests
- **Cypress** — E2E tests

## Getting started

```bash
git clone https://github.com/tyleringersoll/daily-timers.git
cd daily-timers
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test:unit` | Run Vitest unit tests |
| `npm run test:e2e` | Run Cypress headless |
| `npm run test:e2e:dev` | Open Cypress UI |

## Project structure

```
src/
├── components/
│   ├── AppHeader.vue        # Sticky frosted-glass header + theme toggle
│   ├── AppFooter.vue
│   ├── TimerCard.vue        # Individual timer with SVG progress ring
│   ├── TimerList.vue
│   ├── TimerForm.vue
│   ├── TimerToast.vue       # Expired-timer alert (Teleport + focus trap)
│   ├── ScheduleSettings.vue
│   ├── WeeklyTaskList.vue   # Day-tab strip with ARIA tablist pattern
│   └── WeeklyTaskForm.vue
├── stores/
│   ├── timers.js
│   ├── schedule.js
│   ├── weeklyTasks.js
│   ├── toast.js
│   └── theme.js
├── composables/
│   ├── useAudio.js
│   ├── useNotification.js
│   └── useCurrentDay.js
├── styles/
│   ├── _variables.scss      # Spacing, breakpoints, mixins
│   ├── _theme-vars.scss     # CSS custom properties (dark + light)
│   ├── _base.scss           # Reset, typography, shared component classes
│   └── main.scss
├── utils/
│   └── formatTime.js
└── constants.js
```

## License

MIT — see [LICENSE](LICENSE) for details.
