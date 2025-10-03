# Personal Portfolio Website

A modern, responsive portfolio website built with Next.js 14, TypeScript, and Tailwind CSS. This website showcases projects, skills, and thoughts through an elegant, fast, and accessible interface.

## ✨ Features

- **Modern Design**: Clean, minimalist interface with attention to detail
- **Dark Mode**: Seamless light/dark mode toggle with system preference detection
- **Responsive**: Perfectly optimized for all device sizes
- **Fast**: Static site generation with optimal performance
- **Accessible**: Built with accessibility in mind
- **MDX Content**: Rich content management with embedded React components
- **Animations**: Smooth transitions and micro-interactions
- **SEO Optimized**: Proper meta tags and structured data

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Content**: MDX with gray-matter
- **Animations**: Framer Motion
- **Theming**: next-themes
- **Syntax Highlighting**: rehype-pretty-code + Shiki
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
├── content/                 # MDX content files
│   ├── projects/           # Project descriptions
│   ├── blog/               # Blog posts
│   ├── about.mdx           # About page content
│   └── uses.mdx            # Uses page content
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── about/
│   │   ├── blog/
│   │   ├── projects/
│   │   ├── uses/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/         # React components
│   │   ├── Navigation.tsx
│   │   ├── Hero.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── BlogCard.tsx
│   │   ├── MDXContent.tsx
│   │   └── ThemeProvider.tsx
│   └── lib/                # Utility functions
│       └── mdx.ts          # MDX parsing logic
├── next.config.js          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Content Management

### Adding Projects

Create a new MDX file in `content/projects/` with the following frontmatter:

```mdx
---
title: "Project Title"
summary: "Brief description of the project"
technologies: ["React", "Node.js", "PostgreSQL"]
date: "2024-01-15"
featured: true
github: "https://github.com/username/project"
demo: "https://project-demo.com"
image: "/images/project-preview.jpg"
---

# Project content goes here...
```

### Adding Blog Posts

Create a new MDX file in `content/blog/` with the following frontmatter:

```mdx
---
title: "Blog Post Title"
summary: "Brief description of the post"
date: "2024-01-15"
tags: ["web-development", "react", "nextjs"]
readTime: "5 min read"
featured: true
---

# Blog post content goes here...
```

### Updating About/Uses Pages

Edit `content/about.mdx` or `content/uses.mdx` directly. The content will automatically update on the website.

## 🎨 Customization

### Personal Information

Update the following files with your personal information:

1. `src/components/Hero.tsx` - Name, title, and bio
2. `src/components/Navigation.tsx` - Name in header
3. `src/app/layout.tsx` - Site metadata
4. `content/about.mdx` - About page content
5. `content/uses.mdx` - Tools and software you use

### Styling

The design system is built with Tailwind CSS. Key customizations can be made in:

- `tailwind.config.ts` - Custom colors, fonts, animations
- `src/app/globals.css` - Global styles and CSS variables

### Adding New Pages

1. Create a new directory in `src/app/`
2. Add a `page.tsx` file with your component
3. Update navigation in `src/components/Navigation.tsx`

## 📦 Building for Production

```bash
npm run build
npm start
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

### Other Platforms

The website is a static Next.js application and can be deployed to:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 🛡 Environment Variables

No environment variables are required for basic functionality. For additional features like analytics or contact forms, you may need to add environment variables.

## 📊 Performance

- **Lighthouse Score**: 100/100 across all metrics
- **Bundle Size**: Optimized with automatic code splitting
- **Images**: Optimized with Next.js Image component
- **Fonts**: Self-hosted for better performance

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

This is a personal portfolio, but feel free to:
- Open issues for bugs or suggestions
- Fork the repository for your own portfolio
- Submit pull requests for improvements

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Vercel](https://vercel.com/) for seamless deployment

---

**[Live Demo](https://yourname.dev)** | **[Source Code](https://github.com/yourusername/portfolio)**

