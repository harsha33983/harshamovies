import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Globe, Bell, Play, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [language, setLanguage] = useState('English');
  const [autoplay, setAutoplay] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [tempDisplayName, setTempDisplayName] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [memberSince, setMemberSince] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Initialize display name from localStorage or empty string
    const savedDisplayName = localStorage.getItem('userDisplayName') || '';
    setDisplayName(savedDisplayName);
    setTempDisplayName(savedDisplayName);

    // Set member since date from Firebase user creation time
    if (currentUser.metadata?.creationTime) {
      const creationDate = new Date(currentUser.metadata.creationTime);
      const formattedDate = creationDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });
      setMemberSince(formattedDate);
    } else {
      // Fallback to current date if creation time is not available
      const currentDate = new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });
      setMemberSince(currentDate);
    }
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    localStorage.setItem('preferred-language', e.target.value);
  };

  const handleAutoplayToggle = () => {
    const newValue = !autoplay;
    setAutoplay(newValue);
    localStorage.setItem('autoplay-enabled', newValue.toString());
  };

  const handleNotificationsToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem('notifications-enabled', newValue.toString());
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setTempDisplayName(displayName);
  };

  const handleSaveEdit = async () => {
    if (!tempDisplayName.trim()) {
      setTempDisplayName(displayName);
      setIsEditing(false);
      return;
    }
    
    try {
      setSaveLoading(true);
      // Save to localStorage
      localStorage.setItem('userDisplayName', tempDisplayName.trim());
      setDisplayName(tempDisplayName.trim());
      setIsEditing(false);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to update display name:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTempDisplayName(displayName);
  };

  // Load saved preferences
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    const savedAutoplay = localStorage.getItem('autoplay-enabled');
    const savedNotifications = localStorage.getItem('notifications-enabled');
    
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedAutoplay) setAutoplay(savedAutoplay === 'true');
    if (savedNotifications) setNotifications(savedNotifications === 'true');
  }, []);

  // Get display name or fallback
  const getDisplayName = () => {
    if (displayName) return displayName;
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'User';
  };

  // Get avatar letter
  const getAvatarLetter = () => {
    const name = getDisplayName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#141414] text-gray-900 dark:text-white pt-20 pb-16 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-fadeSlideUp">
          <h1 className="text-3xl font-bold">Profile</h1>
          <div className="flex items-center gap-4">
            {/* Edit Button */}
            {!isEditing ? (
              <button
                onClick={handleEditClick}
                className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
              >
                <Edit3 size={16} />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={saveLoading || !tempDisplayName.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {saveLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-lg transition-all duration-300 hover:shadow-xl animate-fadeSlideUp animation-delay-200">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                {getAvatarLetter()}
              </div>
              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={tempDisplayName}
                    onChange={(e) => setTempDisplayName(e.target.value)}
                    className="text-2xl font-bold bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors duration-200 text-gray-900 dark:text-white w-full sm:w-auto rounded-lg px-2 py-1"
                    placeholder="Enter display name"
                    autoFocus
                  />
                  <p className="text-gray-600 dark:text-gray-400">{currentUser?.email}</p>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold mb-1 transition-colors duration-300">{getDisplayName()}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{currentUser?.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-lg transition-all duration-300 hover:shadow-xl animate-fadeSlideUp animation-delay-400">
          <h2 className="text-xl font-bold mb-4">Account Details</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-200 dark:border-gray-700 gap-2">
              <span className="text-gray-600 dark:text-gray-400">Email:</span>
              <span className="font-medium break-all">{currentUser?.email}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-2">
              <span className="text-gray-600 dark:text-gray-400">Member since:</span>
              <span className="font-medium">{memberSince}</span>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-lg transition-all duration-300 hover:shadow-xl animate-fadeSlideUp animation-delay-600">
          <h2 className="text-xl font-bold mb-6">Settings</h2>
          
          {/* Language */}
          <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Globe className="text-blue-500 dark:text-blue-400" size={20} />
                <div>
                  <h3 className="font-medium">Language</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred language</p>
                </div>
              </div>
              <select
                value={language}
                onChange={handleLanguageChange}
                className="bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 w-full sm:w-auto"
              >
                <option value="English">English</option>
                <option value="telugu">Telugu</option>
                <option value="hindi">Hindi</option>
                <option value="kannada">Kannada</option>
                <option value="malayalam">Malayalam</option>
              </select>
            </div>
          </div>

          {/* Autoplay */}
          <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Play className="text-green-500 dark:text-green-400" size={20} />
                <div>
                  <h3 className="font-medium">Autoplay</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automatically play next episode</p>
                </div>
              </div>
              <button
                onClick={handleAutoplayToggle}
                className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  autoplay ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ease-in-out ${
                    autoplay ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Bell className="text-yellow-500 dark:text-yellow-400" size={20} />
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get notified about new releases</p>
                </div>
              </div>
              <button
                onClick={handleNotificationsToggle}
                className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  notifications ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ease-in-out ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="animate-fadeSlideUp animation-delay-800">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <LogOut size={20} />
            <span>{loading ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;