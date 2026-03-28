# Copilot Instructions

## UI/Design Rules
- Theme: Dark. Background #09090B, surface #18181B, border #27272A
- Typography: Inter font. Sizes: text-sm / text-base / text-lg / text-2xl
- Spacing system: multiples of 4px only (p-2, p-4, p-6, p-8...)
- Border radius: rounded-md for inputs, rounded-lg for cards, rounded-full for avatars
- All interactive elements must have hover + focus-visible states
- Animations: transition-all duration-200 ease-out
- Never use pure white text — use text-zinc-100 or text-zinc-200

## Component Style Reference
- Cards: bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-sm
- Buttons primary: bg-violet-600 hover:bg-violet-500 text-white rounded-md px-4 py-2
- Input: bg-zinc-900 border border-zinc-700 focus:border-violet-500 rounded-md