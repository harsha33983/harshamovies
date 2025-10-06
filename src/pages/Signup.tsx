import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Background images
  const backgroundImages = [
    'https://tse1.mm.bing.net/th?id=OIP.RaAxaGwzM_kqzasNRt2jwwHaDf&pid=Api&P=0&h=180',
    'https://tse3.mm.bing.net/th?id=OIP.9q87chmxcP27E1rze4fa5QHaC1&pid=Api&P=0&h=180',
    'https://www.sakshipost.com/sites/default/files/article_images/2017/11/22/Kalyan.jpg',
    'https://tse1.mm.bing.net/th?id=OIP.qXh031nWo1hb3QnigBnU1AHaDt&pid=Api&P=0&h=180'
  ];
  const [currentBg, setCurrentBg] = useState(0);

  const { signup, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Change background every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password match
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    // Validate password strength
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    
    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/');
    } catch (err: any) {
      let errorMessage = 'Failed to create an account';
      
      // Handle specific Firebase error codes
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please sign in or use a different email.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError('');
      setGoogleLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      let errorMessage = 'Failed to sign up with Google';
      
      if (err.message === 'Sign-in was cancelled') {
        errorMessage = 'Google sign-up was cancelled';
      } else if (err.message.includes('popup-blocked')) {
        errorMessage = 'Pop-up was blocked. Please allow pop-ups and try again.';
      } else if (err.message.includes('account-exists-with-different-credential')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      }
      
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };
  
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-28 overflow-hidden">
      {/* Background banner with overlay */}
      <div className="absolute inset-0 z-0">
        {backgroundImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === currentBg ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${img})` }}
          />
        ))}
      </div>
      
      <div className="relative z-10 w-full max-w-md bg-white/10 dark:bg-black/75 rounded-2xl p-8 sm:p-10 backdrop-blur-lg border border-white/20 dark:border-gray-700 shadow-2xl">
        <h1 className="text-3xl font-bold mb-8 text-white text-center">Sign Up</h1>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-2 backdrop-blur-sm">
            <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Google Sign-Up Button */}
        <button
          onClick={handleGoogleSignUp}
          disabled={googleLoading || loading}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] mb-6 flex items-center justify-center gap-3"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>{googleLoading ? 'Creating account...' : 'Continue with Google'}</span>
        </button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/10 text-gray-300 rounded-full backdrop-blur-sm">or</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent placeholder-gray-300 backdrop-blur-sm transition-all duration-200"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent pr-12 placeholder-gray-300 backdrop-blur-sm transition-all duration-200"
              placeholder="Create a password"
            />
            <button
              type="button"
              className="absolute right-3 top-[42px] text-gray-300 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent pr-12 placeholder-gray-300 backdrop-blur-sm transition-all duration-200"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              className="absolute right-3 top-[42px] text-gray-300 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-white/10"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-gradient-to-r from-[#E50914] to-[#f6121d] hover:from-[#f6121d] hover:to-[#E50914] text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
          
          <div className="text-center text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="text-white hover:text-[#E50914] transition-colors duration-200 underline font-medium">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;