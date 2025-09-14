# KVP Report Hub LGSA

## Overview

The KVP Report Hub LGSA is a comprehensive community management platform designed for roleplay gaming communities. This web application serves as a central hub where players can communicate, share content, report issues, and engage with the community through various interactive features. The platform supports both registered users and guests, providing real-time chat functionality, content sharing, admin tools, and community engagement features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application is built using **React 18** with **TypeScript** for type safety and better developer experience. The architecture follows a component-based approach with:

- **Vite** as the build tool for fast development and optimized production builds
- **React Router** for client-side routing and navigation
- **TailwindCSS** with **shadcn/ui** component library for consistent, modern UI design
- **Radix UI** primitives for accessible and customizable component foundations
- **Lucide React** for a comprehensive icon system

### State Management and Data Flow
The application uses **React Query (@tanstack/react-query)** for server state management, providing:
- Automatic background refetching and caching
- Optimistic updates for better user experience
- Real-time synchronization with the backend

Local state is managed through React's built-in `useState` and `useEffect` hooks, with localStorage for persistent user preferences and session data.

### Real-time Communication
The platform implements real-time features through **Supabase's realtime subscriptions**, enabling:
- Live chat updates in public and private channels
- Real-time notifications for admin messages and friend requests
- Live player count tracking
- Instant updates for posts, likes, and community interactions

### Authentication and User Management
The authentication system supports multiple user types:
- **Guest users**: Temporary accounts with limited features
- **Registered users**: Full access to all platform features
- **Staff/Admin users**: Additional moderation and management capabilities

User sessions are persisted using localStorage, with security questions for account recovery.

### Component Organization
The component structure is organized into logical categories:
- **Layout components**: Navigation, sidebars, and page structure
- **Feature components**: Chat systems, post management, admin panels
- **UI components**: Reusable interface elements from shadcn/ui
- **Page components**: Top-level route components

### Responsive Design Strategy
The application implements a mobile-first responsive design using:
- **TailwindCSS breakpoints** for adaptive layouts
- **Floating action buttons** for mobile navigation
- **Drawer/Sheet patterns** for mobile-optimized menus
- **Responsive navigation** that adapts to screen size

## External Dependencies

### Database and Backend Services
- **Supabase**: Primary backend-as-a-service providing PostgreSQL database, real-time subscriptions, authentication, and file storage
- **Supabase Storage**: File upload and management for images, screenshots, and user-generated content

### UI and Design System
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Headless component primitives for accessibility and customization
- **TailwindCSS**: Utility-first CSS framework for styling
- **class-variance-authority**: Type-safe variant API for component styling
- **Lucide React**: Comprehensive icon library

### Development and Build Tools
- **Vite**: Modern build tool with HMR and optimized bundling
- **TypeScript**: Static type checking and enhanced developer experience
- **ESLint**: Code linting with React and TypeScript rules
- **PostCSS**: CSS processing with Autoprefixer

### Runtime Libraries
- **React Hook Form**: Form state management and validation
- **React Query**: Server state management and caching
- **React Router**: Client-side routing
- **Sonner**: Toast notification system
- **date-fns**: Date manipulation and formatting
- **Embla Carousel**: Touch-friendly carousel component

### Advertising Integration
- **Google AdSense**: Monetization through contextual advertising
- **AdCash**: Additional advertising network integration

The platform is architected to be scalable, maintainable, and user-friendly, with a focus on real-time community interaction and comprehensive moderation tools for staff members.