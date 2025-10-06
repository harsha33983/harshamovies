import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Suspense, lazy } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingScreen from './components/common/LoadingScreen';
import ChatBotToggle from './components/chatbot/ChatBotToggle';

// Lazy loaded components
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const MovieDetails = lazy(() => import('./pages/MovieDetails'));
const TVDetails = lazy(() => import('./pages/TVDetails'));
const PersonDetails = lazy(() => import('./pages/PersonDetails'));
const Movies = lazy(() => import('./pages/Movies'));
const TVShows = lazy(() => import('./pages/TVShows'));
const Search = lazy(() => import('./pages/Search'));
const SearchHistory = lazy(() => import('./pages/SearchHistory'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-[#141414] text-gray-900 dark:text-white flex flex-col transition-colors duration-300">
              <Navbar />
              <main className="flex-grow">
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/browse" replace />} />
                    <Route path="/browse" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/movie/:id" element={
                      <ProtectedRoute>
                        <MovieDetails />
                      </ProtectedRoute>
                    } />
                    <Route path="/tv/:id" element={
                      <ProtectedRoute>
                        <TVDetails />
                      </ProtectedRoute>
                    } />
                    <Route path="/person/:id" element={<PersonDetails />} />
                    <Route path="/movies" element={<Movies />} />
                    <Route path="/tv" element={<TVShows />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/search-history" element={
                      <ProtectedRoute>
                        <SearchHistory />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
              
              {/* AI ChatBot */}
              <ChatBotToggle />
            </div>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;