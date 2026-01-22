# Soft Deadline Manager (MVP)

This is a small, interview-safe MVP that makes deadline drift visible. It uses localStorage for persistence and focuses on deterministic logic and a calm UI.

Features implemented:
- Create / read / update / delete tasks
- Immutable originalDeadline; currentDeadline reflects changes
- Deadline extension history (read-only) with reason and timestamp
- Extension count and color state (0=green,1-2=yellow,3+=red)
- Timeline view showing original deadline, each extension, and completion
- Completion detection: early, on time, late (based on originalDeadline)
- Insights page: tasks with most extensions, average extensions, common reasons

How to run (requires Node >=16):

```bash
npm install
npm run dev
```

Design notes:
- Models store ISO date strings for determinism and easy serialization.
- Core logic is in `src/utils.ts`. UI components are simple and stateless where possible.
- Original deadlines are never overwritten — extension operations append a read-only history entry.
