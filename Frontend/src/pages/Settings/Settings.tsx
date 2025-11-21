import { useState, useEffect, memo } from 'react';
import { Settings as SettingsIcon, User, Bell, Lock, Eye, ArrowLeft, Save } from 'lucide-react';
import FormInput from '../../components/common/FormInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import { validateRegistrationForm, isValidEmail, isValidPhoneNumber } from '../../utils/validation';

interface SettingsPageProps {
  onNavigate?: (page: 'home') => void;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export default memo(function SettingsPage({ onNavigate }: SettingsPageProps) {
  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'privacy' | 'security'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    publicProfile: true,
    showEmail: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProfile();
    loadSettings();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
  };

  const validateProfile = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profile.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (profile.firstName.length < 2 || profile.firstName.length > 50) {
      newErrors.firstName = 'First name must be 2-50 characters';
    }

    if (!profile.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (profile.lastName.length < 2 || profile.lastName.length > 50) {
      newErrors.lastName = 'Last name must be 2-50 characters';
    }

    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(profile.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (profile.phoneNumber && !isValidPhoneNumber(profile.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    setError('');
    setSuccess('');

    if (!validateProfile()) {
      setError('Please fix the errors before saving');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setSuccess('Settings saved successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading settings..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => onNavigate?.('home')}
          className="flex items-center text-purple-600 hover:text-purple-700 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-600">Manage your account preferences</p>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />
          )}
          {success && (
            <Alert type="success" message={success} onClose={() => setSuccess('')} className="mb-6" />
          )}

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {[
              { id: 'profile', icon: User, label: 'Profile' },
              { id: 'notifications', icon: Bell, label: 'Notifications' },
              { id: 'privacy', icon: Eye, label: 'Privacy' },
              { id: 'security', icon: Lock, label: 'Security' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  activeSection === id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Profile Information
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Update your personal details. All fields marked with * are required.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="First Name"
                  placeholder="First Name"
                  value={profile.firstName}
                  onChange={(value) => setProfile({ ...profile, firstName: value })}
                  error={errors.firstName}
                  required
                  autoComplete="given-name"
                />

                <FormInput
                  label="Last Name"
                  placeholder="Last Name"
                  value={profile.lastName}
                  onChange={(value) => setProfile({ ...profile, lastName: value })}
                  error={errors.lastName}
                  required
                  autoComplete="family-name"
                />
              </div>

              <FormInput
                type="email"
                label="Email Address"
                placeholder="your.email@example.com"
                value={profile.email}
                onChange={(value) => setProfile({ ...profile, email: value })}
                error={errors.email}
                required
                autoComplete="email"
              />

              <FormInput
                type="tel"
                label="Phone Number"
                placeholder="Phone Number (optional)"
                value={profile.phoneNumber}
                onChange={(value) => setProfile({ ...profile, phoneNumber: value })}
                error={errors.phoneNumber}
                autoComplete="tel"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Username</p>
                  <p className="text-sm text-blue-700 mt-1">{localStorage.getItem('username')}</p>
                  <p className="text-xs text-blue-600 mt-2">Username cannot be changed</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-600" />
                Notification Preferences
              </h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <div>
                    <p className="font-medium text-gray-800">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <div>
                    <p className="font-medium text-gray-800">Push Notifications</p>
                    <p className="text-sm text-gray-600">Receive browser notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </label>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition font-semibold shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* Privacy Section */}
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                Privacy Controls
              </h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <div>
                    <p className="font-medium text-gray-800">Public Profile</p>
                    <p className="text-sm text-gray-600">Make your profile visible to others</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.publicProfile}
                    onChange={(e) => setSettings({ ...settings, publicProfile: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <div>
                    <p className="font-medium text-gray-800">Show Email on Profile</p>
                    <p className="text-sm text-gray-600">Display your email address publicly</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showEmail}
                    onChange={(e) => setSettings({ ...settings, showEmail: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                </label>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition font-semibold shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600" />
                Security Settings
              </h2>
              <button className="w-full p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition border border-gray-200">
                <p className="font-medium text-gray-800">Change Password</p>
                <p className="text-sm text-gray-500 mt-1">Update your password to keep your account secure</p>
              </button>
              <button className="w-full p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition border border-gray-200">
                <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account</p>
              </button>
              <button className="w-full p-4 bg-red-50 rounded-lg text-left hover:bg-red-100 transition border border-red-200">
                <p className="font-medium text-red-800">Delete Account</p>
                <p className="text-sm text-red-600 mt-1">Permanently remove your account and all data</p>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
