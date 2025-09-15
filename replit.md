# New Gym Income Management Application

## Overview

This is a modern income tracking application designed specifically for New Gym, built to manage session-based income, coaching fees, and subscription payments. The application provides a comprehensive dashboard for tracking financial transactions from multiple payment sources including Wave, Orange Money, and manual entries. It features a clean, professional interface inspired by trusted financial applications and offers real-time income analytics with filtering and categorization capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for accessible, customizable components
- **Styling**: Tailwind CSS with custom design system based on financial app aesthetics (Wave/Orange Money inspired)
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js for RESTful API endpoints
- **Language**: TypeScript for full-stack type safety
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling
- **Validation**: Zod schemas for runtime type validation and data sanitization

### Data Storage Solutions
- **Database**: PostgreSQL for reliable transactional data storage
- **Connection**: Node.js pg driver with connection pooling
- **Schema Management**: Drizzle Kit for database migrations and schema evolution
- **Data Types**: Structured transaction records with enums for categories, sources, and status tracking

### Database Schema Design
The application uses a single primary table `transactions` with the following structure:
- **Transaction Categories**: session, session-coaching, monthly-subscription, weekly-subscription
- **Payment Sources**: wave, orange-money, manual
- **Status Tracking**: completed, pending, failed
- **Financial Data**: Decimal precision for accurate money calculations
- **Timestamps**: Created and transaction date tracking for reporting

### Authentication and Authorization
Currently implements a minimal authentication approach suitable for single-user or small team usage. The application is designed to be extended with proper authentication middleware when needed.

### API Architecture
- **Transaction Management**: Full CRUD operations for income transactions
- **Filtering System**: Advanced query parameters for search, category, source, and date range filtering
- **Statistics Endpoints**: Aggregated data for dashboard analytics including total income, category breakdowns, and source analysis
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Validation**: Request/response validation using Zod schemas

### Design System
- **Color Palette**: Professional financial theme with orange (Orange Money) and teal (Wave) brand colors
- **Typography**: Inter font family with Roboto fallback for optimal readability
- **Component Variants**: Consistent button, card, and form styling with hover states
- **Responsive Design**: Mobile-first approach with breakpoint-specific layouts
- **Dark Mode**: CSS custom properties for theme switching capability

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Type-safe ORM for database operations and query building
- **@tanstack/react-query**: Server state management, caching, and synchronization
- **wouter**: Lightweight routing library for single-page application navigation

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives (dialogs, dropdowns, forms)
- **tailwindcss**: Utility-first CSS framework for rapid UI development
- **class-variance-authority**: Type-safe component variant system
- **lucide-react**: Modern icon library with consistent design language

### Form Management and Validation
- **react-hook-form**: Performant form handling with minimal re-renders
- **@hookform/resolvers**: Integration layer for validation library compatibility
- **zod**: Runtime type validation and schema definition
- **drizzle-zod**: Automatic schema generation from database models

### Development Tools
- **typescript**: Static type checking and enhanced developer experience
- **vite**: Fast build tool with hot module replacement
- **tsx**: TypeScript execution environment for development
- **esbuild**: Fast JavaScript bundler for production builds

### Database Tools
- **drizzle-kit**: Database migration and schema management toolkit
- **connect-pg-simple**: PostgreSQL session store for future authentication needs

### Date and Utility Libraries
- **date-fns**: Modern date manipulation library with tree-shaking support
- **clsx**: Utility for conditional className composition
- **nanoid**: Secure URL-friendly unique ID generator