import { useState } from 'react';
import { BookOpen, User, LogOut, Heart, Settings, HelpCircle, ShoppingCart, Crown, Home } from 'lucide-react';

interface HeaderProps {
  user: {
    username: string;
    token: string;
  };
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

const Header = ({ user, onLogout, onNavigate }: HeaderProps) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-white shadow-md p-3 sm:p-4">
      <div className="w-full px-2 sm:px-4 lg:px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('home')}>
          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Story Hub</h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => onNavigate('home')}
            className="hidden sm:flex items-center text-gray-700 hover:text-purple-600 transition"
            title="Home"
          >
            <Home className="w-5 h-5" />
          </button>
          <button
            onClick={() => onNavigate('favorites')}
            className="flex items-center text-gray-700 hover:text-purple-600 transition"
            title="Favorites"
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => onNavigate('cart')}
            className="flex items-center text-gray-700 hover:text-purple-600 transition"
            title="Cart"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline font-medium text-gray-700">{user.username}</span>
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <button
                  onClick={() => { setShowDropdown(false); onNavigate('profile'); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Profile</span>
                </button>
                <button
                  onClick={() => { setShowDropdown(false); onNavigate('favorites'); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition"
                >
                  <Heart className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Favorites</span>
                </button>
                <button
                  onClick={() => { setShowDropdown(false); onNavigate('subscription'); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition"
                >
                  <Crown className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Subscription</span>
                </button>
                <button
                  onClick={() => { setShowDropdown(false); onNavigate('settings'); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Settings</span>
                </button>
                <button
                  onClick={() => { setShowDropdown(false); onNavigate('support'); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition"
                >
                  <HelpCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Support</span>
                </button>
                <div className="h-px bg-gray-200 my-2"></div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 text-red-600 transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
