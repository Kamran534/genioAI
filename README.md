<div align="center">
  <img src="public/banner.png" alt="GenioAI Banner" width="100%" />
</div>

# GenioAI 🚀

A modern, responsive landing page for an AI tools platform built with React, TypeScript, and Vite. GenioAI showcases AI-powered tools, pricing plans, testimonials, and includes a newsletter subscription feature.

## ✨ Features

- **Modern UI/UX**: Beautiful gradient designs with smooth animations
- **Responsive Design**: Optimized for all device sizes
- **AI Tools Showcase**: Interactive grid displaying various AI tools
- **Pricing Plans**: Multiple subscription tiers with feature comparisons
- **Customer Testimonials**: Social proof with ratings and reviews
- **Newsletter Subscription**: Email collection with validation
- **Error Handling**: Comprehensive error boundary for better UX
- **Performance Optimized**: Fast loading with code splitting and optimization

## 🛠️ Tech Stack

- **Frontend**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.1.2
- **Styling**: Tailwind CSS 4.1.12
- **Icons**: Lucide React
- **Carousel**: Swiper.js
- **Routing**: React Router DOM
- **Linting**: ESLint with TypeScript support

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd genioAI
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ErrorBoundary.tsx    # Error handling component
│   ├── Footer.tsx           # Site footer
│   ├── Header.tsx           # Navigation header
│   ├── Hero.tsx             # Hero section
│   ├── Newsletter.tsx       # Newsletter subscription
│   ├── Pricing.tsx          # Pricing plans
│   ├── Testimonials.tsx     # Customer testimonials
│   └── ToolsGrid.tsx        # AI tools showcase
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   └── validation.ts        # Form validation
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## 🎨 Components Overview

### Hero Section
- Eye-catching headline and call-to-action
- Gradient background with modern design
- Responsive layout for all devices

### Tools Grid
- Interactive showcase of AI tools
- Hover effects and smooth transitions
- Categorized tool display

### Pricing Plans
- Multiple subscription tiers
- Feature comparison table
- Popular plan highlighting
- Responsive pricing cards

### Testimonials
- Customer reviews with ratings
- Swiper carousel for smooth navigation
- Social proof elements

### Newsletter
- Email subscription form
- Client-side validation
- Rate limiting protection
- Success/error states

### Error Boundary
- Graceful error handling
- Development error details
- Retry functionality
- User-friendly error messages

## 🔧 Configuration

### Vite Configuration
- ESBuild minification for fast builds
- Code splitting for optimal performance
- Asset optimization
- Development server with hot reload

### TypeScript Configuration
- Strict type checking
- Modern ES2022 target
- React JSX support
- Path mapping for clean imports

### Tailwind CSS
- Custom color palette
- Responsive utilities
- Animation classes
- Component-based styling

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1440px+)

## 🚀 Performance Features

- **Code Splitting**: Automatic chunk splitting for vendor libraries
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and CSS optimization
- **Lazy Loading**: Component-based lazy loading
- **Bundle Analysis**: Optimized bundle sizes

## 🔒 Security Features

- **Input Validation**: Client-side form validation
- **Rate Limiting**: Newsletter submission protection
- **XSS Protection**: Safe HTML rendering
- **Error Handling**: Secure error reporting

## 🧪 Development

### Code Quality
- ESLint configuration for code quality
- TypeScript for type safety
- Prettier for code formatting
- Git hooks for pre-commit checks

### Testing
- Component testing setup ready
- Error boundary testing
- Form validation testing

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

The build process:
1. TypeScript compilation
2. Vite bundling and optimization
3. Asset processing and minification
4. Output to `dist/` directory

### Deployment Options
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFlare, AWS CloudFront
- **Server**: Nginx, Apache

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide](https://lucide.dev/) - Icons
- [Swiper](https://swiperjs.com/) - Carousel

---

**GenioAI** - Empowering creativity with AI tools 🎨✨