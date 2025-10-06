# Streamflix - Netflix-Inspired Streaming Platform

A modern, responsive streaming platform inspired by Netflix, built with React, TypeScript, Tailwind CSS, and Firebase. The application fetches movie and TV show data from The Movie Database (TMDB) API.

## Features

- User authentication with Firebase (signup, login, logout)
- Browse movies and TV shows by categories
- Hero banner featuring trending content
- Detailed movie and TV show pages
- Horizontal scrolling content rows with hover effects
- Responsive design optimized for all devices
- Search functionality for finding content
- Protected routes requiring authentication

## Technologies Used

- React with TypeScript
- Tailwind CSS for styling
- Firebase Authentication
- Axios for API requests
- React Router for navigation
- Lucide React for icons

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- TMDB API key
- Firebase project

### Installation

1. Clone the repository or download the source code

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory based on `.env.example` and add your API keys
```
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
```

4. Start the development server
```bash
npm run dev
```

## Project Structure

- `/src/components` - Reusable UI components
- `/src/context` - React context for state management
- `/src/pages` - Main application pages
- `/src/services` - API and Firebase configuration
- `/src/hooks` - Custom React hooks

## API Integration

This project uses The Movie Database (TMDB) API to fetch movie and TV show data. You'll need to obtain an API key from [TMDB](https://www.themoviedb.org/documentation/api) and add it to your `.env` file.

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Email/Password authentication
3. Copy your Firebase configuration to the `.env` file

## Deployment

To build the application for production:

```bash
npm run build
```

The build files will be in the `dist` directory.

## License

This project is open source and available under the MIT License.