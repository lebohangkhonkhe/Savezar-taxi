# SaveZar Taxi Management System

## Overview

SaveZar is a comprehensive taxi management system designed for monitoring and managing taxi operations. The application provides real-time location tracking, live broadcast capabilities, driver management, and statistical reporting for taxi operations. It's built as a mobile-first web application with a phone-like interface that simulates a taxi management dashboard.

The system allows administrators to track taxi locations on interactive maps, broadcast live feeds from taxis, monitor driver performance and statistics, and manage driver information. The application uses a modern tech stack with React for the frontend, Express for the backend, and PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript, implementing a single-page application (SPA) architecture. The UI is designed to mimic a mobile phone interface with a distinctive red gradient theme and phone-like status bar. The application uses Wouter for client-side routing and TanStack Query for efficient data fetching and state management.

The component structure follows a modular design with reusable UI components built on top of Radix UI primitives and styled with Tailwind CSS. The design system uses shadcn/ui components for consistency and accessibility. The application implements a responsive layout that works across different screen sizes while maintaining the mobile-first aesthetic.

### Backend Architecture
The backend follows a RESTful API architecture built with Express.js and TypeScript. The server implements session-based authentication using express-session with cookie storage. The API endpoints are organized around resource-based routing patterns for users, drivers, taxis, and statistics.

The backend uses middleware for request logging, error handling, and authentication checks. In development, it integrates with Vite for hot module replacement and serves the frontend assets. The server implements proper error handling and validation using Zod schemas for request/response validation.

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The database schema includes tables for users, drivers, taxis, and taxi statistics with proper relationships and constraints.

For development and testing, the system includes an in-memory storage implementation that mimics the database interface, allowing for rapid prototyping and testing without database dependencies. The storage layer is abstracted through an interface pattern, making it easy to switch between different storage backends.

### Database Schema Design
The schema implements a relational model with four main entities:
- Users: Authentication and basic user information
- Drivers: Driver profiles with ratings and performance metrics  
- Taxis: Vehicle information with real-time location data
- TaxiStats: Time-series data for tracking daily performance metrics

The schema uses UUIDs for primary keys and includes proper indexing for performance. Foreign key relationships link drivers to taxis and statistics to specific taxis for data integrity.

### Authentication and Authorization
The application implements session-based authentication using secure HTTP cookies. User sessions are managed server-side with configurable session duration and security settings. The frontend includes authentication state management with automatic token refresh and route protection.

The authentication flow includes login validation, session creation, and proper logout handling with session cleanup. The system includes middleware for protecting authenticated routes and user context management throughout the application.

### API Design Patterns
The REST API follows conventional HTTP methods and status codes with consistent JSON response formats. API endpoints are organized by resource type with nested routes for related data (e.g., /api/drivers/taxi/:taxiId for getting driver by taxi).

The API implements proper error handling with structured error responses and validation using Zod schemas. Request/response logging is implemented for debugging and monitoring purposes.

## External Dependencies

### UI Framework and Styling
- **React**: Frontend framework with TypeScript support
- **Radix UI**: Accessible primitive components for building the UI
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Pre-built component library based on Radix UI
- **Lucide React**: Icon library for consistent iconography

### Backend Framework
- **Express.js**: Web server framework for Node.js
- **express-session**: Session management middleware
- **connect-pg-simple**: PostgreSQL session store

### Database and ORM
- **PostgreSQL**: Primary database (configured for Neon Database)
- **Drizzle ORM**: Type-safe ORM for database operations
- **@neondatabase/serverless**: Serverless PostgreSQL driver

### State Management and Data Fetching
- **TanStack Query**: Powerful data synchronization for React
- **React Hook Form**: Performant forms with easy validation
- **Zod**: TypeScript-first schema validation

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **Wouter**: Minimalist routing for React applications

### Form Handling and Validation
- **@hookform/resolvers**: Validation resolvers for React Hook Form
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

### Utility Libraries
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx**: Utility for constructing className strings conditionally
- **date-fns**: Modern JavaScript date utility library
- **nanoid**: Secure URL-friendly unique string ID generator

### Mobile App (Capacitor)
- **@capacitor/core**: Core Capacitor runtime
- **@capacitor/cli**: CLI tools for building mobile apps
- **@capacitor/android**: Android platform support

## Android App Publishing

### Configuration
- **App ID**: com.savezar.taxi
- **App Name**: SaveZar
- **Primary Color**: #DC2626 (SaveZar Red)
- **Web Directory**: dist/public

### Build Commands
1. Build production version: `npm run build`
2. Sync with Android: `npx cap sync android`
3. Open in Android Studio: `npx cap open android`

### Generating Signed APK/AAB for Play Store
To publish to Google Play Store, you need to create a signed Android App Bundle (AAB):

1. **Download the android folder** from this project to your local machine
2. **Open in Android Studio**: Import the android folder as an existing project
3. **Create a signing key**:
   - Go to Build → Generate Signed Bundle/APK
   - Select "Android App Bundle"
   - Click "Create new..." to create a keystore
   - Fill in the keystore details (keep this file safe!)
4. **Build the signed AAB**:
   - Select your keystore and enter credentials
   - Choose "release" build variant
   - Click "Finish" to generate the AAB file
5. **Upload to Play Console**:
   - Go to play.google.com/console
   - Create a new app or select existing
   - Go to Production → Releases → Create new release
   - Upload the AAB file
   - Fill in app details, screenshots, and descriptions
   - Submit for review

### App Icon Requirements
For Play Store, you need to provide app icons in the following sizes:
- 48x48 (mdpi)
- 72x72 (hdpi)
- 96x96 (xhdpi)
- 144x144 (xxhdpi)
- 192x192 (xxxhdpi)
- 512x512 (Play Store listing)

Replace the default icons in android/app/src/main/res/mipmap-* folders