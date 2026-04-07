# Next-Generation Portfolio Website

A cutting-edge portfolio website built with Next.js 14, featuring 3D graphics, smooth animations, and interactive experiences.

## ✨ Features

- **Interactive 3D Hero** - Immersive WebGL scene using React Three Fiber
- **Smooth Animations** - Framer Motion for fluid transitions and scroll effects
- **Custom Cursor** - Magnetic interactions and hover effects
- **Bento Grid Layout** - Modern, dynamic project showcase
- **Parallax Scrolling** - Depth and motion throughout the experience
- **Horizontal Scroll Sections** - Unique content presentation
- **Game Elements** - Mini-game and achievement system
- **Accessibility First** - Skip links, ARIA labels, reduced motion support
- **Performance Optimized** - Code splitting, lazy loading, optimized images
- **SEO Ready** - Metadata, sitemap, structured data

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion, GSAP
- **3D Graphics:** React Three Fiber, Three.js, Drei
- **Smooth Scroll:** Lenis
- **TypeScript:** Full type safety
- **Deployment:** Vercel

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Optional: Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Contact email
NEXT_PUBLIC_CONTACT_EMAIL=your-email@example.com
```

## 📁 Project Structure

```
website/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   ├── projects/          # Projects pages
│   ├── about/             # About page
│   └── contact/           # Contact page
├── components/
│   ├── 3d/               # Three.js components
│   ├── animations/       # Animation components
│   ├── ui/               # UI components
│   └── layouts/          # Layout components
├── lib/
│   ├── data/            # Project data and content
│   ├── utils.ts         # Utility functions
│   └── analytics.ts     # Analytics helpers
└── hooks/               # Custom React hooks
```

## 🎨 Customization

### Colors

Edit the CSS variables in `app/globals.css` to customize the color scheme:

```css
:root {
  --primary: #3b82f6;
  --secondary: #8b5cf6;
  --accent: #06b6d4;
  /* ... */
}
```

### Projects

Add your projects in `lib/data/projects.ts`:

```typescript
export const projects: Project[] = [
  {
    id: "project-slug",
    title: "Project Title",
    description: "Short description",
    // ... more fields
  },
];
```

### Content

- Update personal information in components
- Replace placeholder images in `public/` folder
- Customize metadata in `app/layout.tsx`

## 🎮 Easter Eggs & Achievements

The site includes hidden achievements:
- **Konami Code**: ↑ ↑ ↓ ↓ ← → ← → B A
- **Explorer**: Visit all pages
- **Curious Mind**: View multiple projects
- **Night Owl**: Visit between midnight and 6am
- **Mini-game**: Available on the About page

## ♿ Accessibility

- Skip to main content link
- ARIA labels throughout
- Keyboard navigation support
- Reduced motion support
- High contrast mode option
- Screen reader friendly

## 📊 Performance

- Lighthouse score: 95+ (all categories)
- Lazy loading for images and 3D scenes
- Code splitting and tree shaking
- Optimized bundle size
- Edge functions on Vercel

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Deploy automatically

```bash
# Or use Vercel CLI
vercel
```

### Manual Deployment

```bash
npm run build
npm start
```

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

Feel free to reach out for collaborations or inquiries.

---

Built with ❤️ using Next.js, React, and Three.js
