# Boot Animation Guide

## Overview

Your website now features an authentic Linux-style boot animation that appears once per browser session. This creates an immersive, retro computing experience that sets your portfolio apart.

## Features

### 🖥️ Authentic Boot Sequence
- **BIOS Phase**: Memory checks and hardware detection
- **Bootloader Phase**: GRUB-style menu
- **Kernel Phase**: Linux kernel loading messages
- **Init Phase**: Systemd service initialization (with fun easter eggs!)
- **Login Phase**: TTY login prompt with interactive commands

### 🎮 Interactive Commands
At the login prompt, users can type:
- `whoami` - Display user information
- `help` - Show available commands
- `ls` - List fake directory contents with fun files
- `neofetch` - Display system information with ASCII art
- `matrix` - Trigger Matrix rain effect
- `ESC` or `Ctrl+C` - Skip boot sequence anytime

### 🎨 Visual Effects
- **CRT Screen Effect**: Subtle screen curvature and glow
- **Scanlines**: Authentic retro monitor look
- **Phosphor Green Text**: Classic terminal color (#00FF00)
- **Typewriter Animation**: Messages appear in sequence
- **Blinking Cursor**: Just like a real terminal

### 🔊 Sound Effects
- Toggle sound on/off with the button in the top-right corner
- Synthesized beep sounds (no external audio files needed)
- Boot beep, keypress clicks, and completion chimes

### ♿ Accessibility Features
- **Skip Button**: Always visible in top-left corner
- **Keyboard Shortcuts**: ESC or Ctrl+C to skip
- **Reduced Motion**: Auto-skips for users with motion sensitivity
- **Screen Reader Support**: Announces boot progress
- **Focus Management**: Proper keyboard navigation

## Session Behavior

### Main Site Integration
The boot animation shows **once per browser session** on the main site:
- First visit in a new tab/window: Full boot sequence
- Subsequent page loads: Direct to main site
- Force show: Add `?boot=true` to URL (useful for testing/showing off)

### Dedicated Boot Page
Visit **`/boot`** to see the boot animation anytime!
- Shows the full sequence every time you visit
- Perfect for showcasing to others
- Redirects to home page after completion or skip
- Direct link: `http://localhost:3000/boot` (or your production URL)

## File Structure

```
lib/
  └── boot-messages.ts          # Boot message data and generators

hooks/
  ├── use-boot-sequence.ts      # Boot phase progression logic
  ├── use-keyboard-commands.ts  # Interactive command handling
  └── use-boot-sounds.ts        # Sound effect generation

components/ui/
  ├── boot-screen.tsx           # Main boot animation component
  ├── boot-manager.tsx          # Session wrapper
  └── boot-easter-eggs.tsx      # Easter egg components

app/
  ├── layout.tsx                # Integration point
  └── globals.css               # CRT/scanline effects
```

## Customization

### Change Boot Duration
Edit phase durations in `hooks/use-boot-sequence.ts`:

```typescript
const phaseDurations: Record<BootPhase, number> = {
  bios: 1500,        // Adjust these values (in milliseconds)
  bootloader: 1800,
  kernel: 2500,
  init: 2800,
  login: 3000,
  complete: 0,
};
```

### Add Custom Messages
Edit message arrays in `lib/boot-messages.ts`:

```typescript
export const initMessages: BootMessage[] = [
  // Add your own messages here
  { text: '[  OK  ] Started My Custom Service', type: 'ok', delay: 100 },
];
```

### Add New Easter Eggs
1. Add command in `hooks/use-keyboard-commands.ts`
2. Add response in `lib/boot-messages.ts`
3. Handle display in `components/ui/boot-easter-eggs.tsx`

### Change Terminal Color
Edit `.boot-screen` class in `app/globals.css`:

```css
.boot-screen {
  color: #00FF00; /* Change this color */
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5); /* And this glow */
}
```

Common retro terminal colors:
- Phosphor Green: `#00FF00` (current)
- Amber: `#FFAA00`
- White/Green: `#33FF33`
- IBM Blue: `#00AAFF`

### Disable for Development
Add to URL: `?boot=false` or clear session storage in browser console:
```javascript
sessionStorage.removeItem('boot-completed');
```

## Easter Eggs Included

Hidden surprises for curious users:
- Random "error" messages during service initialization
- Matrix digital rain effect
- ASCII art system information
- Witty file names in directory listing
- "Command not found" jokes

## Performance

- **Total Boot Time**: ~7 seconds (fully skippable)
- **No External Assets**: All sounds generated via Web Audio API
- **Optimized Animations**: CSS transforms for GPU acceleration
- **Session Storage**: Minimal memory footprint
- **Lazy Content**: Main site loads during boot sequence

## Browser Compatibility

✅ Works in all modern browsers:
- Chrome/Edge (v90+)
- Firefox (v88+)
- Safari (v14+)
- Mobile browsers (optimized for smaller screens)

## Tips

1. **First Impressions**: The boot animation creates immediate engagement
2. **Easter Eggs**: Encourage users to explore with the hint text
3. **Skip Option**: Never force users to wait - respect their time
4. **Testing**: Use `?boot=true` to show to friends/clients
5. **Mobile**: Boot sequence is faster on mobile devices

## Troubleshooting

**Boot animation doesn't appear:**
- Clear session storage
- Check console for errors
- Verify BootManager is wrapping your app in layout.tsx

**Sound doesn't work:**
- User must enable sound with the toggle button
- Some browsers block audio until user interaction
- Check browser audio permissions

**Keyboard commands not working:**
- Wait for login prompt to appear
- Check keyboard focus isn't in another element
- Try clicking on the screen first

## Future Enhancements

Ideas for extending the boot animation:
- [ ] Custom boot logo/splash screen
- [ ] Save user's favorite commands
- [ ] Achievement for finding all easter eggs
- [ ] Different OS themes (Windows 95, Mac OS Classic, etc.)
- [ ] Animated ASCII art during boot
- [ ] Custom welcome message based on time/date
- [ ] Random boot messages from a larger pool

Enjoy your retro boot experience! 🚀

