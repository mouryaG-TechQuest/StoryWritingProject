import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Lock, Eye, ArrowLeft, Save } from 'lucide-react';

interface SettingsPageProps {
  onNavigate?: (page: 'home') => void;
}

export default function SettingsPage({ onNavigate }: SettingsPageProps) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    publicProfile: true,
    showEmail: false,
  });

  const handleSave = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => onNavigate?.('home')}
          className="flex items-center text-purple-600 hover:text-purple-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <SettingsIcon className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          </div>

          {/* Account Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-700">Account</h2>
            </div>
            <div className="space-y-4 ml-7">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Username</p>
                  <p className="text-sm text-gray-500">{localStorage.getItem('username')}</p>
                </div>
                <button className="text-purple-600 hover:text-purple-700 font-medium">Edit</button>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-700">Notifications</h2>
            </div>
            <div className="space-y-3 ml-7">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <span className="text-gray-700">Email notifications</span>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <span className="text-gray-700">Push notifications</span>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
              </label>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-700">Privacy</h2>
            </div>
            <div className="space-y-3 ml-7">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <span className="text-gray-700">Public profile</span>
                <input
                  type="checkbox"
                  checked={settings.publicProfile}
                  onChange={(e) => setSettings({...settings, publicProfile: e.target.checked})}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
              </label>
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <span className="text-gray-700">Show email on profile</span>
                <input
                  type="checkbox"
                  checked={settings.showEmail}
                  onChange={(e) => setSettings({...settings, showEmail: e.target.checked})}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
              </label>
            </div>
          </div>

          {/* Security Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-700">Security</h2>
            </div>
            <div className="ml-7">
              <button className="w-full p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition">
                <p className="font-medium text-gray-800">Change Password</p>
                <p className="text-sm text-gray-500">Update your password</p>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
