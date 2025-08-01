# Twether Frontend

## Overview

The Twether frontend is a React-based web application that provides a real-time interface for viewing and interacting with Ethereum community tweets. It features a modern, responsive design with WebSocket connectivity for live updates and a clean, intuitive user experience.

## Features

- **Real-time Updates**: Live tweet feed with WebSocket connectivity
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Connection Status**: Visual indicator for WebSocket connection status
- **Tweet Categorization**: Display tweets by Ethereum-related categories
- **Modern UI**: Clean, minimalist design with smooth animations
- **TypeScript**: Full type safety and better development experience

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Real-time**: Socket.io Client
- **Routing**: React Router
- **State Management**: React Hooks
- **HTTP Client**: Axios

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Backend server running (see backend README)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/collinsadi/twether
   cd twether/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp example.env .env
   ```
   
   Configure the following environment variables:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── MinimalHeader.tsx
│   ├── MinimalFooter.tsx
│   ├── TweetCard.tsx
│   ├── TweetFeed.tsx
│   └── TweetSkeleton.tsx
├── pages/              # Page components
│   └── Home/
│       └── Home.tsx
├── services/           # API and WebSocket services
│   ├── api.ts
│   └── socket.ts
├── routes/             # Routing configuration
│   └── AppRoutes.tsx
└── assets/             # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Components

### Core Components

#### TweetCard
Displays individual tweets with metadata, categories, and styling.

#### TweetFeed
Manages the list of tweets with infinite scrolling and real-time updates.

#### TweetSkeleton
Loading skeleton for tweets during data fetching.

#### MinimalHeader
Application header with connection status indicator.

#### MinimalFooter
Application footer with project information.

## Collaboration Guide

### Getting Started

1. **Fork the repository** and create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow the coding standards**:
   - Use TypeScript for all components
   - Follow ESLint and Prettier configuration
   - Use functional components with hooks
   - Write meaningful commit messages
   - Add JSDoc comments for complex functions

3. **Testing**: Write tests for new components and ensure all existing tests pass

### Best Practices

#### Component Development
- **Single Responsibility**: Each component should have one clear purpose
- **Props Interface**: Define TypeScript interfaces for all props
- **Default Props**: Provide sensible defaults where appropriate
- **Error Boundaries**: Wrap components that might fail

#### Styling
- **Tailwind Classes**: Use utility classes for styling
- **Responsive Design**: Test on multiple screen sizes
- **Dark Mode**: Consider dark mode support
- **Consistency**: Follow existing design patterns

#### Performance
- **Lazy Loading**: Use React.lazy for route-based code splitting
- **Memoization**: Use React.memo for expensive components
- **Bundle Size**: Keep dependencies minimal
- **Images**: Optimize and use appropriate formats

#### Accessibility
- **Semantic HTML**: Use proper HTML elements
- **ARIA Labels**: Add accessibility attributes
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Color Contrast**: Maintain sufficient color contrast ratios

### Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows TypeScript best practices
- [ ] All ESLint rules pass
- [ ] Components are responsive
- [ ] Accessibility features are implemented
- [ ] Error handling is in place
- [ ] Performance considerations are addressed
- [ ] Documentation is updated if needed


### Common Issues and Solutions

#### WebSocket Connection Issues
- Check backend server is running
- Verify WebSocket URL in environment variables
- Implement reconnection logic in socket service

#### Build Issues
- Clear node_modules and reinstall dependencies
- Check TypeScript compilation errors
- Verify all imports are correct

#### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check for conflicting CSS rules
- Verify responsive breakpoints


## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
```env
VITE_API_URL=https://your-backend-url.com
```

## License

This project is open source and available under the MIT License.