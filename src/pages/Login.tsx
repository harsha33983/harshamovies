import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Mail, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPopupHelp, setShowPopupHelp] = useState(false);
  
  const { login, loginWithGoogle, resetPassword, currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Background image array
  const backgroundImages = [
    'https://assets.nflxext.com/ffe/siteui/vlv3/9d3533b2-0e2b-40b2-95e0-ecd7979cc88b/a3873901-5b7c-46eb-b9fa-12fea5197bd3/IN-en-20240311-popsignuptwoweeks-perspective_alpha_website_large.jpg',
    'https://wallpapers.com/images/featured/movie-9pvmdtvz4cb0xl37.jpg',
    'https://tse2.mm.bing.net/th?id=OIP.bEg5qhr8v2P59Odw5SpEsgHaHa&pid=Api&P=0&h=180'
  ];
  const [currentBg, setCurrentBg] = useState(0);

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
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      let errorMessage = 'Failed to log in';
      
      // Handle specific Firebase error codes
      if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (useRedirect: boolean = false) => {
    try {
      setError('');
      setShowPopupHelp(false);
      setGoogleLoading(true);
      console.log('Starting Google sign-in...');
      await loginWithGoogle(useRedirect);
      
      if (!useRedirect) {
        console.log('Google sign-in completed, navigating...');
        navigate('/');
      }
    } catch (err: any) {
      console.error('Google sign-in error in component:', err);
      
      // Handle Firebase auth errors
      if (err.code === 'auth/popup-blocked') {
        setShowPopupHelp(true);
        setError('Pop-up was blocked by your browser. Please see the instructions below to enable pop-ups, or try the alternative sign-in method.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google sign-in. Please contact the administrator to add this domain to the Firebase project\'s authorized domains list.');
      } else if (err.message === 'POPUP_BLOCKED') {
        setShowPopupHelp(true);
        setError('Pop-up was blocked by your browser. Please see the instructions below to enable pop-ups, or try the alternative sign-in method.');
      } else if (err.message === 'This domain is not authorized for Google sign-in.') {
        setError('This domain is not authorized for Google sign-in. Please contact the administrator to add this domain to the Firebase project\'s authorized domains list.');
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleRedirectSignIn = async () => {
    await handleGoogleSignIn(true);
  };
  
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      await resetPassword(email);
      setResetSent(true);
      setError('');
    } catch (err: any) {
      let errorMessage = 'Failed to send password reset email';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-28 overflow-hidden">
      {/* Background image banner with overlay */}
      <div className="absolute inset-0 z-0">
        {backgroundImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === currentBg ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="absolute inset-0 bg-black/60" />
      </div>
      
      <div className="relative z-10 w-full max-w-md bg-white/10 dark:bg-black/75 rounded-2xl p-8 sm:p-10 backdrop-blur-lg border border-white/20 dark:border-gray-700 shadow-2xl">
        <h1 className="text-3xl font-bold mb-8 text-white text-center">Sign In</h1>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-2 backdrop-blur-sm">
            <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Popup help instructions */}
        {showPopupHelp && (
          <div className="mb-4 p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-blue-200 mb-2">How to enable pop-ups:</h3>
            <ul className="text-xs text-blue-200 space-y-1 mb-3">
              <li>• Look for a popup blocked icon in your address bar</li>
              <li>• Click it and select "Always allow pop-ups"</li>
              <li>• Or go to browser settings and allow pop-ups for this site</li>
            </ul>
            <button
              onClick={handleGoogleRedirectSignIn}
              disabled={googleLoading || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} />
              Try Alternative Sign-in Method
            </button>
          </div>
        )}
        
        {/* Password reset confirmation */}
        {resetSent && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-xl backdrop-blur-sm">
            <p className="text-sm text-green-200">
              Password reset link sent to your email. Check your inbox.
            </p>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          onClick={() => handleGoogleSignIn(false)}
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
          <span>{googleLoading ? 'Signing in...' : 'Continue with Google'}</span>
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
              placeholder="Enter your password"
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
          
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-gradient-to-r from-[#E50914] to-[#f6121d] hover:from-[#f6121d] hover:to-[#E50914] text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4 text-sm">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-gray-300 hover:text-white transition-colors duration-200 underline px-2 py-1 rounded-lg hover:bg-white/10"
              disabled={loading || googleLoading}
            >
              Forgot password?
            </button>
            
            <div className="text-gray-300">
              New to Streamflix?{' '}
              <Link to="/signup" className="text-white hover:text-[#E50914] transition-colors duration-200 underline font-medium">
                Sign up now
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
