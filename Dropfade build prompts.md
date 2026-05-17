# 🔥 DropFade — Complete Build Prompts Guide
> Copy these prompts one by one into Cursor / Claude Code / Windsurf.
> Each prompt is self-contained and builds on the previous one.
> Stack: Next.js 14, TypeScript, Tailwind CSS, Cloudinary, Upstash Redis

---

## PROMPT 0 — UI Foundation: Dark/Light Theme + Navbar with Product Hunt Badge

```
You are working on the DropFade project — a Next.js 14 + TypeScript + Tailwind CSS anonymous file sharing app.

TASK: Completely revamp the UI foundation with these exact requirements:

1. THEME SYSTEM
   - Add `next-themes` package for dark/light mode support
   - Wrap `app/layout.tsx` with ThemeProvider (attribute="class", defaultTheme="dark")
   - In `app/globals.css`, define CSS variables for both :root (light) and .dark themes:
     Light: --bg: #f8f8f8, --surface: #ffffff, --border: #e2e8f0, --text: #0f172a, --muted: #64748b, --accent: #f97316 (orange), --accent-hover: #ea6c0a
     Dark: --bg: #0a0a0a, --surface: #111111, --border: #1f1f1f, --text: #f1f5f9, --muted: #94a3b8, --accent: #f97316, --accent-hover: #fb923c

2. NAVBAR — replace any existing header/navbar with this new one in `components/Navbar.tsx`:
   - Fixed top, full width, blur backdrop (backdrop-blur-md), subtle border bottom
   - LEFT CORNER: Product Hunt badge — a sleek pill/badge styled like:
     ```
     <a href="https://www.producthunt.com/posts/dropfade" target="_blank" rel="noopener noreferrer">
       <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:border-orange-500 transition-all duration-200 group">
         <span className="text-orange-500 text-sm">▲</span>
         <span className="text-xs font-medium text-[var(--muted)] group-hover:text-[var(--text)] transition-colors">Product Hunt</span>
       </div>
     </a>
     ```
   - CENTER: "DropFade" logo text with flame emoji, font-bold, orange accent
   - RIGHT CORNER: Theme toggle button (sun/moon icon using lucide-react), no label
   - Height: 56px, z-index: 50

3. LAYOUT UPDATES
   - Remove ALL mentions of login, sign up, pricing, subscription from any page
   - Add `pt-14` to main content to account for fixed navbar
   - Ensure body background uses var(--bg), text uses var(--text)

4. FOOTER — simple one-liner at bottom of every page:
   "Made with 🔥 by Piyush Yadav · Open Source · No tracking, No accounts"
   Centered, small text, muted color

Do NOT add any authentication-related UI. No modals, no account buttons, nothing.
```

---

## PROMPT 1 — Feature: Download Count Limit ("Delete after N downloads")

```
You are working on DropFade — Next.js 14, TypeScript, Upstash Redis, Cloudinary.

TASK: Add "Delete after N downloads" feature alongside the existing one-time access.

BACKEND CHANGES:

1. In `lib/utils.ts` or wherever Redis metadata is stored, add a `maxDownloads` field to the file/text metadata object. Default: 1.

2. In `app/api/upload/file/route.ts` and `app/api/upload/text/route.ts`:
   - Accept `maxDownloads` from request body (number, 1 to 10, default 1)
   - Store it in Redis metadata: `{ ...existing, maxDownloads, downloadCount: 0 }`

3. In `app/api/file/[code]/route.ts` (POST — the download/access handler):
   - On each access, increment `downloadCount` in Redis
   - Only delete the file from Cloudinary AND Redis when `downloadCount >= maxDownloads`
   - If not yet at limit, update the metadata with new count but keep the file alive
   - Return in the response: `{ ...fileData, downloadsRemaining: maxDownloads - downloadCount }`

FRONTEND CHANGES:

4. In the upload form component, add a "Max Downloads" selector:
   - A segmented control or small radio group: [1] [2] [3] [5] [10]
   - Default selected: 1
   - Label: "Delete after how many downloads?"
   - Show helper text: "1 = one-time only (most secure)"
   - Style: pill buttons, active state uses orange accent color var(--accent)

5. On the success/share page after upload:
   - Show "Max downloads: X" as a badge
   - If maxDownloads > 1, show note: "File stays alive until downloaded X times"

6. On the recipient's download page (`app/access/[code]/page.tsx` or similar):
   - After successful download, show: "X downloads remaining" if file still alive
   - If last download, show the "This drop has faded" screen

Keep all TypeScript types updated. No breaking changes to existing one-time flow.
```

---

## PROMPT 2 — Feature: File Preview Before Download

```
You are working on DropFade — Next.js 14, TypeScript, Tailwind CSS.

TASK: Add a "Preview before download" screen on the recipient's access page. The preview should show enough to confirm the file is correct, but NOT trigger deletion — deletion only happens when user explicitly clicks Download.

CURRENT FLOW: User enters code → file is immediately downloaded + deleted.
NEW FLOW: User enters code → Preview screen → User clicks "Download & Delete" → file deleted.

BACKEND CHANGES:

1. Add a new API route: `GET /api/file/[code]/preview`
   - Returns metadata ONLY (filename, fileType, fileSize, uploadedAt, expiresAt, downloadsRemaining)
   - Does NOT increment download count
   - Does NOT delete anything
   - If expired or already deleted, return 404 with `{ error: "faded" }`

2. The existing `POST /api/file/[code]` remains the actual "download and delete" trigger.

FRONTEND CHANGES:

3. On the access page (`/access/[code]` or similar), change the flow to:
   
   STEP 1 — Loading: fetch `/api/file/[code]/preview`
   STEP 2 — Preview Screen shows:
   
   For ALL file types:
   - File name (large, bold)
   - File type icon (use lucide-react: FileText, Image, Video, Music, Archive, File)
   - File size (formatted: "2.4 MB")
   - "Uploaded X minutes ago"
   - "Expires in X minutes/hours" (live countdown using setInterval)
   - "X downloads remaining"
   
   For IMAGE files (image/jpeg, image/png, image/gif, image/webp):
   - Show actual image preview from Cloudinary URL with CSS filter: `blur(8px) brightness(0.7)`
   - Show a lock icon overlay in center
   - Caption: "Preview blurred for security · Download to view full image"
   
   For TEXT notes:
   - Show first 100 characters of text with `...` truncation
   - Rest is hidden behind blur
   
   For other files (PDF, video, etc.):
   - Just show the file icon + name, no content preview
   
   STEP 3 — Big CTA button: "⬇ Download & Delete Forever"
   - Orange gradient button, full width
   - On click: POST to `/api/file/[code]` → trigger download → show "Faded" screen
   - Add a subtle warning below button: "⚠ This action cannot be undone"

4. FADED SCREEN (after download OR if 404):
   - Animated: flame/smoke emoji fading out (CSS keyframe animation)
   - Title: "This drop has faded 🌫️"
   - Subtitle: "This content was deleted after access."
   - Button: "Create your own drop →" linking to homepage
   - Style: centered, minimal, beautiful

All TypeScript types must be updated. Handle loading and error states gracefully.
```

---

## PROMPT 3 — Feature: Brute Force Protection (Wrong Code = Soft Lock)

```
You are working on DropFade — Next.js 14, TypeScript, Upstash Redis.

TASK: Add brute-force protection on the code entry/access endpoint.

LOGIC:
- Track failed access attempts per IP address in Redis
- Key pattern: `ratelimit:ip:{hashedIP}` 
- After 5 failed attempts within 15 minutes → soft lock that IP for 15 minutes
- On soft lock: return 429 with `{ error: "too_many_attempts", retryAfter: 900 }`
- Successful access resets the counter for that IP

BACKEND CHANGES:

1. Create `lib/rateLimit.ts`:
```typescript
import { redis } from './redis' // your existing redis client

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; attemptsLeft: number; retryAfter?: number }> {
  const key = `ratelimit:ip:${ip}`
  const lockKey = `ratelimit:lock:${ip}`
  
  // Check if locked
  const locked = await redis.get(lockKey)
  if (locked) {
    const ttl = await redis.ttl(lockKey)
    return { allowed: false, attemptsLeft: 0, retryAfter: ttl }
  }
  
  // Increment attempt count
  const attempts = await redis.incr(key)
  if (attempts === 1) await redis.expire(key, 900) // 15 min window
  
  if (attempts >= 5) {
    await redis.set(lockKey, '1', { ex: 900 }) // lock for 15 min
    await redis.del(key)
    return { allowed: false, attemptsLeft: 0, retryAfter: 900 }
  }
  
  return { allowed: true, attemptsLeft: 5 - attempts }
}

export async function resetRateLimit(ip: string): Promise<void> {
  await redis.del(`ratelimit:ip:${ip}`)
  await redis.del(`ratelimit:lock:${ip}`)
}
```

2. In `app/api/file/[code]/route.ts` (both GET preview and POST download):
   - Extract IP from request headers: `request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1'`
   - Call `checkRateLimit(ip)` before processing
   - If not allowed, return 429 response immediately
   - If code lookup returns null/not found (wrong code), do NOT call resetRateLimit — let attempt count grow
   - If code found successfully, call `resetRateLimit(ip)`

FRONTEND CHANGES:

3. On the access/code entry page, handle these error states:
   
   - 404 (wrong code): Show "❌ Invalid code. X attempts remaining before temporary lock."
     - If attemptsLeft === 1: highlight warning in red/orange: "⚠ Last attempt before 15-minute lockout!"
   
   - 429 (locked): Show lock screen:
     - 🔒 icon (large)
     - Title: "Too many wrong attempts"  
     - Subtitle: "Access temporarily locked."
     - Live countdown timer: "Try again in MM:SS" (use retryAfter seconds)
     - After countdown ends: automatically re-enable the input

All TypeScript types must be correct. No breaking changes to happy path.
```

---

## PROMPT 4 — Feature: Real-time File Size Validation + Upload Progress

```
You are working on DropFade — Next.js 14, TypeScript, React, Tailwind CSS.

TASK: Add two UX improvements to the file upload component.

PART A — Real-time file size feedback:

1. In the file upload component, on the file input's `onChange` event:
   - Immediately check `file.size` before any upload
   - If file.size > 5 * 1024 * 1024 (5MB):
     - Show inline error below the dropzone: "❌ File too large (X MB). Maximum is 5MB."
     - Disable the upload/submit button
     - Highlight the dropzone border in red
   - If file.size is valid:
     - Show green checkmark + "✓ X MB — looks good!"
     - Enable the button
   - Format file size nicely: bytes → KB/MB (e.g., "2.4 MB", "890 KB")

2. Also show file type icon next to filename in the dropzone after selection.
   Use lucide-react icons: Image (images), FileText (text/pdf), Music (audio), Video (video), Archive (zip/rar), File (others).

PART B — Upload progress indicator:

3. Replace the current upload fetch call with XMLHttpRequest to track progress:

```typescript
const uploadWithProgress = (formData: FormData, onProgress: (pct: number) => void): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    })
    xhr.addEventListener('load', () => resolve(new Response(xhr.responseText, { status: xhr.status })))
    xhr.addEventListener('error', () => reject(new Error('Upload failed')))
    xhr.open('POST', '/api/upload/file')
    xhr.send(formData)
  })
}
```

4. Show a progress bar during upload:
   - Full-width bar below the upload button
   - Orange fill color (var(--accent))
   - Animated shimmer effect while loading
   - Shows percentage: "Uploading... 67%"
   - On complete: transitions to "✓ Upload complete!" in green
   - On error: transitions to "✗ Upload failed. Try again." in red

5. During upload, disable all form inputs and the submit button. Show a spinner inside the button.

Use React state (useState) for all of this. No external libraries needed.
```

---

## PROMPT 5 — Feature: Mobile Web Share API + Better Copy Button

```
You are working on DropFade — Next.js 14, TypeScript, React.

TASK: Improve sharing UX on the success page after upload.

CURRENT: User gets a code and maybe a QR code.
NEW: Full sharing toolkit.

CHANGES in the success/share page component:

1. SHARE URL construction:
   - Build the full share URL: `${window.location.origin}/access/${code}`

2. COPY LINK BUTTON:
   - On click: use `navigator.clipboard.writeText(shareUrl)`
   - Button states:
     - Default: "📋 Copy Link" 
     - Success: "✓ Copied!" (green, 2 seconds, then revert)
     - Error fallback: select text from a hidden input element
   - Style: outlined button, full width on mobile

3. COPY CODE BUTTON (separate):
   - Just copies the 6-character code itself
   - Large monospace display of the code (font-mono, text-3xl, letter-spacing: 0.3em)
   - Tap anywhere on the code to copy
   - Show subtle "tap to copy" label below
   - On copy: brief scale animation + "Copied!" tooltip

4. NATIVE SHARE BUTTON (mobile only):
   - Check: `if (typeof navigator !== 'undefined' && navigator.share)`
   - If supported (mobile), show "📤 Share via..." button
   - On click:
     ```typescript
     navigator.share({
       title: 'DropFade — Secure File Share',
       text: `Access this file with code: ${code} (expires soon)`,
       url: shareUrl
     })
     ```
   - If not supported (desktop), hide this button — don't show it at all

5. WHATSAPP QUICK SHARE (always visible):
   - Button: "💬 Share on WhatsApp"
   - Link: `https://wa.me/?text=Here's your secure file: ${shareUrl} (Code: ${code}) — opens once then deletes!`
   - Opens in new tab

6. EXPIRY COUNTDOWN on success page:
   - Live countdown showing time remaining: "Expires in 47m 32s"
   - Use setInterval, update every second
   - When under 5 minutes: turn red and pulse
   - When expired: show "This drop has now expired"
   - Calculate from: uploadTimestamp + expiryDuration (pass these in response from API)

Style everything consistently with the existing dark/light theme CSS variables.
```

---

## PROMPT 6 — Feature: "File Already Faded" Page + Better Error UX

```
You are working on DropFade — Next.js 14, TypeScript, Tailwind CSS.

TASK: Create a beautiful, on-brand error/faded page and fix all silent error states.

1. Create `app/faded/page.tsx` — the "Drop has faded" screen:
   
   Design:
   - Dark/themed background
   - Center-aligned content
   - Large animated emoji/icon: a flame that fades to smoke (CSS keyframe)
     ```css
     @keyframes fadeSmoke {
       0% { opacity: 1; filter: blur(0px); transform: scale(1); }
       50% { opacity: 0.5; filter: blur(2px); transform: scale(1.1); }
       100% { opacity: 0; filter: blur(8px); transform: scale(0.8); }
     }
     ```
   - Title: "This drop has faded" — large, bold
   - Subtitle options (show based on reason param):
     - `?reason=accessed` → "This content was viewed and permanently deleted."
     - `?reason=expired` → "This drop expired before anyone accessed it."
     - `?reason=notfound` → "This code doesn't exist or was never created."
     - Default → "This content no longer exists."
   - Below: a divider, then:
     - "Want to share something securely?"
     - Big CTA button: "🔥 Create a new Drop" → links to `/`
   - Small footnote: "DropFade deletes content automatically. No copies. No logs."

2. Redirect to this page appropriately:
   - In `app/access/[code]/page.tsx`: if API returns 404 or 410, redirect to `/faded?reason=notfound` or `?reason=accessed`
   - If API returns 410 (expired), redirect to `/faded?reason=expired`

3. Fix silent failures across the app:
   - File upload fails → show toast notification (use a simple custom toast, not a library):
     Create `components/Toast.tsx` — a fixed bottom-right notification that auto-dismisses after 4 seconds
     Red for errors, green for success, orange for warnings
   - Text upload fails → same toast
   - Code copy fails → toast "Couldn't copy — try manually"
   - Network error on access page → toast "Network error. Check connection and try again."

4. Add a global `error.tsx` in the app directory for unhandled Next.js errors:
   - Same faded aesthetic
   - "Something went wrong" with a "Go Home" button

Keep all TypeScript properly typed. The faded page should look premium, not like a generic 404.
```

---

## PROMPT 7 — Feature: Text Character Counter + UX Fixes

```
You are working on DropFade — Next.js 14, TypeScript, React, Tailwind CSS.

TASK: Fix small but annoying UX issues in the text note upload flow.

1. CHARACTER COUNTER for text input:
   - Current limit: 1000 characters (keep this)
   - Add live counter below the textarea: "247 / 1000"
   - Color states:
     - 0-800: muted gray (var(--muted))
     - 801-950: orange warning (var(--accent))  
     - 951-1000: red (#ef4444)
     - Over 1000: impossible (block input at 1000), show "Limit reached" in red
   - Counter positioned: bottom-right of textarea
   - The textarea itself should have a subtle border color change matching the counter state

2. AUTO-RESIZE TEXTAREA:
   - Textarea should grow with content (min 4 rows, max 12 rows)
   - Use this pattern:
     ```typescript
     const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
       e.target.style.height = 'auto'
       e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`
       setText(e.target.value.slice(0, 1000))
     }
     ```

3. TAB KEY SUPPORT in textarea:
   - When user presses Tab inside textarea, insert 2 spaces instead of moving focus
   - Use onKeyDown handler

4. PASTE DETECTION:
   - On paste, if pasted content would exceed 1000 chars, truncate and show toast:
     "Pasted text was trimmed to 1000 character limit"

5. UPLOAD TABS — File vs Text:
   - If there are separate tabs for "Upload File" and "Write Text", add smooth tab transition animation
   - Active tab: orange underline + bold text
   - Inactive tab: muted, pointer cursor
   - Tab switching: content fades in (opacity 0→1, translateY 4px→0, 200ms ease)

6. FORM VALIDATION before submit (both file and text):
   - File: no file selected → shake animation on dropzone + "Please select a file first"
   - Text: empty textarea → shake animation + "Please write something first"
   - Expiry: always has a default selected, so no validation needed
   - The shake animation:
     ```css
     @keyframes shake {
       0%, 100% { transform: translateX(0); }
       20%, 60% { transform: translateX(-6px); }
       40%, 80% { transform: translateX(6px); }
     }
     ```

All changes are purely frontend React/TypeScript. No backend changes needed.
```

---

## PROMPT 8 — Final Polish: Overall UI Upgrade

```
You are working on DropFade — Next.js 14, TypeScript, Tailwind CSS. 
This is the final UI polish pass. No new features — only visual/UX improvements.

HOMEPAGE (`app/page.tsx`):

1. HERO SECTION:
   - Headline: "Share files that disappear." — large (text-5xl on desktop, text-3xl mobile), bold, no fluff
   - Subheadline: "No accounts. No tracking. One link, one chance." — muted, text-lg
   - The upload card should be the MAIN focus — center it, give it a subtle glow/shadow in dark mode
   - Remove any marketing copy that mentions pricing, plans, or sign-up

2. UPLOAD CARD:
   - Rounded-2xl, border using var(--border), background var(--surface)
   - In dark mode: add subtle glow: `box-shadow: 0 0 40px rgba(249, 115, 22, 0.08)`
   - File dropzone: dashed border, drag-over state changes to solid orange border + light orange bg tint
   - All form elements should use var(--surface), var(--border), var(--text) — no hardcoded colors

3. HOW IT WORKS section (below upload card):
   - 3-step horizontal layout on desktop, vertical on mobile
   - Steps: "1. Drop it → 2. Share the code → 3. It fades 🌫️"  
   - Each step: icon + title + one-line description
   - Connected by a subtle dashed line between them on desktop

4. TRUST BADGES (below how it works):
   - 4 small badges in a row: "🔒 End-to-end secure" | "👤 No accounts" | "🚫 No tracking" | "⚡ Auto-delete"
   - Small, subtle, pill-shaped with border

5. GLOBAL POLISH:
   - All buttons: consistent rounded-xl, px-5 py-2.5, transition-all duration-200
   - Primary button: orange gradient `from-orange-500 to-orange-600`, hover: `from-orange-400 to-orange-500`, text white
   - Secondary/outline button: border var(--border), hover: border var(--accent), bg transparent
   - Focus states: orange outline (ring-2 ring-orange-500 ring-offset-2)
   - All inputs/textareas: rounded-xl, border var(--border), bg var(--surface), focus: border orange-500
   - Remove any purple, blue, or green accent colors — orange is the ONLY accent
   - Ensure dark mode looks great: deep blacks (#0a0a0a bg, #111 surface), not gray-900

6. MOBILE RESPONSIVENESS:
   - Upload card: full width with mx-4 padding on mobile
   - Navbar: keep Product Hunt badge on left, theme toggle on right, hide center logo text on very small screens (show only flame emoji)
   - Touch targets: minimum 44px height on all interactive elements

7. ANIMATIONS (keep them subtle, not distracting):
   - Page load: main card fades in (opacity 0→1, translateY 10px→0, 400ms ease-out)
   - Button hover: slight scale (1.02) + shadow increase
   - Success state after upload: confetti-free, just a smooth slide-up reveal of the share panel

Do NOT add any loading skeletons that look corporate. Keep it clean, minimal, fast.
The aesthetic target: "Linear.app meets Snapchat" — dark, fast, purposeful.
```

---

## ORDER TO IMPLEMENT

Run these prompts in this sequence:

| # | Prompt | Time Estimate |
|---|--------|--------------|
| 0 | UI Foundation + Navbar + Theme | 20 min |
| 8 | Overall UI Polish (do this second, sets the base) | 30 min |
| 4 | File size validation + progress bar | 15 min |
| 7 | Text counter + form UX fixes | 15 min |
| 1 | Download count limit feature | 20 min |
| 2 | Preview before download | 25 min |
| 5 | Mobile share + copy + countdown | 20 min |
| 6 | Faded page + error handling | 20 min |
| 3 | Brute force protection (do last) | 25 min |

**Total estimated time: ~3 hours**

---

## IMPORTANT RULES FOR ALL PROMPTS

- ❌ No login, sign up, or authentication of any kind
- ❌ No subscription or pricing UI
- ❌ No Product Hunt badge anywhere except top-left navbar (ONE place only)
- ✅ Dark and light theme must work for every new component
- ✅ Use CSS variables (var(--bg), var(--surface), var(--text), var(--accent), var(--border), var(--muted)) — never hardcode colors
- ✅ All components must be TypeScript with proper types
- ✅ Mobile-first responsive design
- ✅ Error states must always be handled (no silent failures)