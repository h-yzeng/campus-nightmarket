import {
  Camera,
  Mail,
  User,
  IdCard,
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
  DollarSign,
  MapPin,
  Phone,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { ProfileData } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { UserMode } from '../types';
import { uploadProfilePhoto } from '../services/storage/imageService';
import { useAuth } from '../hooks/useAuth';
import { logger } from '../utils/logger';
import { LOCATIONS } from '../constants';

interface UserProfileProps {
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
  onSaveProfile: () => void;
  onSignOut: () => void;
  onBack: () => void;
  userMode: UserMode;
  onOrdersClick: () => void;
  onSellerDashboardClick: () => void;
  onModeChange?: (mode: UserMode) => void;
  onLogoClick?: () => void;
}

const UserProfile = ({
  profileData,
  setProfileData,
  onSaveProfile,
  onSignOut,
  onBack,
  userMode,
  onOrdersClick,
  onSellerDashboardClick,
  onModeChange,
  onLogoClick,
}: UserProfileProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    setError('');

    try {
      const photoURL = await uploadProfilePhoto(user.uid, file);

      setProfileData({ ...profileData, photo: photoURL });
      setHasChanges(true);
    } catch (err) {
      logger.error('Error uploading photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, bio: e.target.value });
    setHasChanges(true);
  };

  const handlePaymentChange = (field: 'cashApp' | 'venmo' | 'zelle', value: string) => {
    setProfileData({
      ...profileData,
      sellerInfo: {
        ...profileData.sellerInfo,
        paymentMethods: {
          ...profileData.sellerInfo?.paymentMethods,
          [field]: value,
        },
        preferredLocations: profileData.sellerInfo?.preferredLocations || [],
      },
    });
    setHasChanges(true);
  };

  const handlePhoneChange = (value: string) => {
    setProfileData({
      ...profileData,
      sellerInfo: {
        ...profileData.sellerInfo,
        phone: value,
        paymentMethods: profileData.sellerInfo?.paymentMethods || {},
        preferredLocations: profileData.sellerInfo?.preferredLocations || [],
      },
    });
    setHasChanges(true);
  };

  const handleLocationChange = (location: string) => {
    setProfileData({
      ...profileData,
      sellerInfo: {
        ...profileData.sellerInfo,
        paymentMethods: profileData.sellerInfo?.paymentMethods || {},
        preferredLocations: location ? [location] : [],
      },
    });
    setHasChanges(true);
  };

  const isValidPassword = (password: string): boolean => {
    return (
      password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  };

  const handlePasswordChange = async () => {
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }

    if (!isValidPassword(newPassword)) {
      setPasswordError(
        'Password must be 12+ characters with uppercase, lowercase, number, and special character'
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      const { changePassword } = await import('../services/auth/authService');
      await changePassword(currentPassword, newPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordSection(false);
      alert('Password changed successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      setPasswordError(errorMessage);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      await onSaveProfile();
      setHasChanges(false);
    } catch (err) {
      logger.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0B]">
      <Header
        cartItems={[]}
        profileData={profileData}
        onCartClick={() => {}}
        onSignOut={onSignOut}
        onProfileClick={() => {}}
        onOrdersClick={onOrdersClick}
        onSellerDashboardClick={onSellerDashboardClick}
        onModeChange={onModeChange}
        onLogoClick={onLogoClick}
        showCart={false}
        userMode={userMode}
      />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 font-semibold text-[#FF4444] transition-colors hover:text-[#CC0000] hover:underline"
          >
            ← Back to Browse
          </button>
        </div>

        <div className="rounded-2xl border-2 border-[#2A2A2A] bg-[#1A1A1B] p-8 shadow-xl">
          <h1 className="mb-2 text-3xl font-bold text-[#CC0000]">My Profile</h1>
          <p className="mb-8 text-[#B0B0B0]">
            Manage your account information and privacy settings
          </p>

          {error && (
            <div className="mb-6 flex gap-3 rounded-xl border-2 border-[#4A1A1A] bg-[#2A0A0A] p-4">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-[#FF4444]" />
              <p className="text-sm text-[#FFB0B0]">{error}</p>
            </div>
          )}

          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div
                onClick={uploadingPhoto ? undefined : handlePhotoClick}
                className={`flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#3A3A3A] bg-[#252525] ${uploadingPhoto ? 'cursor-wait' : 'cursor-pointer hover:border-[#CC0000]'} overflow-hidden transition-colors`}
              >
                {uploadingPhoto ? (
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[#CC0000]"></div>
                    <p className="mt-2 text-xs text-[#B0B0B0]">Uploading...</p>
                  </div>
                ) : profileData.photo ? (
                  <img
                    src={profileData.photo}
                    alt="Profile"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Camera size={36} className="mx-auto text-[#888888]" />
                    <p className="mt-2 text-xs text-[#B0B0B0]">Add Photo</p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handlePhotoClick}
                disabled={uploadingPhoto}
                className="absolute right-1 bottom-1 rounded-full bg-[#CC0000] p-3 text-white shadow-lg transition-shadow hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                title="Change Photo"
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                title="Change Photo"
              />
            </div>
          </div>

          <div className="space-y-6">
            {/* Public Information Section */}
            <div className="rounded-xl border-2 border-[#1A4A1A] bg-[#0A2A0A] p-6">
              <div className="mb-4 flex items-center gap-2">
                <Eye size={20} className="text-green-400" />
                <h2 className="text-xl font-bold text-[#E0E0E0]">Public Information</h2>
              </div>
              <p className="mb-4 text-sm text-[#90C090]">
                This information is visible to other students on Night Market
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block items-center gap-2 text-sm font-semibold text-[#E0E0E0]">
                      <User size={16} />
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border-2 border-[#2A4A2A] bg-[#1A3A1A] px-4 py-3 text-base text-[#A0C0A0]"
                      title="First Name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block items-center gap-2 text-sm font-semibold text-[#E0E0E0]">
                      <User size={16} />
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border-2 border-[#2A4A2A] bg-[#1A3A1A] px-4 py-3 text-base text-[#A0C0A0]"
                      title="Last Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block items-center gap-2 text-sm font-semibold text-[#E0E0E0]">
                    <IdCard size={16} />
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={profileData.studentId}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border-2 border-[#2A4A2A] bg-[#1A3A1A] px-4 py-3 font-mono text-base text-[#A0C0A0]"
                    title="Student ID"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#E0E0E0]">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={handleBioChange}
                    className="min-h-[100px] w-full resize-none rounded-xl border-2 border-[#2A4A2A] bg-[#1A3A1A] px-4 py-3 text-base text-[#E0E0E0] placeholder-[#5A7A5A] transition-all focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    placeholder="Tell us something about yourself..."
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#E0E0E0]">
                    <MapPin size={16} />
                    Current Dorm Location
                  </label>
                  <select
                    value={profileData.sellerInfo?.preferredLocations?.[0] || ''}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="w-full appearance-none rounded-xl border-2 border-[#2A4A2A] bg-[#1A3A1A] px-4 py-3 text-base text-[#E0E0E0] transition-all focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    title="Select your current dorm"
                  >
                    <option value="">Select your dorm...</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-[#90C090]">
                    This helps buyers know your general location
                  </p>
                </div>
              </div>
            </div>

            {/* Private Information Section */}
            <div className="rounded-xl border-2 border-[#4A1A1A] bg-[#2A0A0A] p-6">
              <div className="mb-4 flex items-center gap-2">
                <EyeOff size={20} className="text-[#FF4444]" />
                <h2 className="text-xl font-bold text-[#E0E0E0]">Private Information</h2>
              </div>
              <p className="mb-4 text-sm text-[#C09090]">This information is only visible to you</p>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block items-center gap-2 text-sm font-semibold text-[#E0E0E0]">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border-2 border-[#4A2A2A] bg-[#3A1A1A] px-4 py-3 text-base text-[#C0A0A0]"
                    title="Email Address"
                  />
                </div>

                {/* Password Change Section */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block items-center gap-2 text-sm font-semibold text-[#E0E0E0]">
                      <Lock size={16} />
                      Password
                    </label>
                    <button
                      onClick={() => setShowPasswordSection(!showPasswordSection)}
                      className="text-sm font-semibold text-[#FF4444] transition-colors hover:text-[#CC0000] hover:underline"
                    >
                      {showPasswordSection ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>

                  {!showPasswordSection ? (
                    <input
                      type="password"
                      value="••••••••"
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border-2 border-[#4A2A2A] bg-[#3A1A1A] px-4 py-3 text-base text-[#C0A0A0]"
                      title="Password"
                    />
                  ) : (
                    <div className="space-y-3 rounded-xl border-2 border-[#5A2A2A] bg-[#3A1A1A] p-4">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#D0B0B0]">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full rounded-lg border-2 border-[#5A2A2A] bg-[#2A0A0A] px-3 py-2 text-sm text-[#E0E0E0] placeholder-[#8A5A5A] transition-all focus:border-[#FF4444] focus:ring-2 focus:ring-[#FF4444] focus:outline-none"
                          placeholder="Enter current password"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#D0B0B0]">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-lg border-2 border-[#5A2A2A] bg-[#2A0A0A] px-3 py-2 text-sm text-[#E0E0E0] placeholder-[#8A5A5A] transition-all focus:border-[#FF4444] focus:ring-2 focus:ring-[#FF4444] focus:outline-none"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#D0B0B0]">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full rounded-lg border-2 border-[#5A2A2A] bg-[#2A0A0A] px-3 py-2 text-sm text-[#E0E0E0] placeholder-[#8A5A5A] transition-all focus:border-[#FF4444] focus:ring-2 focus:ring-[#FF4444] focus:outline-none"
                          placeholder="Confirm new password"
                        />
                      </div>

                      {passwordError && <p className="text-xs text-[#FF8888]">{passwordError}</p>}

                      <button
                        onClick={handlePasswordChange}
                        className="w-full rounded-lg bg-[#CC0000] py-2 text-sm font-bold text-white transition-all hover:bg-[#AA0000] hover:shadow-lg"
                      >
                        Update Password
                      </button>

                      <p className="text-xs text-[#B08080]">
                        Password must be 12+ characters with uppercase, lowercase, number, and
                        special character
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Information Section */}
            <div className="rounded-xl border-2 border-[#1A4A1A] bg-[#0A2A0A] p-6">
              <div className="mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-green-400" />
                <h2 className="text-xl font-bold text-[#E0E0E0]">Seller Contact & Payment</h2>
              </div>
              <p className="mb-4 text-sm text-[#90C090]">
                Add your contact info and payment methods so buyers can reach you and pay you
              </p>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#E0E0E0]">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.sellerInfo?.phone || ''}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full rounded-xl border-2 border-[#2A4A2A] bg-[#1A3A1A] px-4 py-3 text-base text-[#E0E0E0] placeholder-[#5A7A5A] transition-all focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    placeholder="(123) 456-7890"
                  />
                  <p className="mt-1 text-xs text-[#90C090]">
                    Buyers will see your phone number after placing an order
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#E0E0E0]">
                    💸 CashApp Username
                  </label>
                  <input
                    type="text"
                    value={profileData.sellerInfo?.paymentMethods?.cashApp || ''}
                    onChange={(e) => handlePaymentChange('cashApp', e.target.value)}
                    className="w-full rounded-xl border-2 border-[#2A4A2A] bg-[#1A3A1A] px-4 py-3 text-base text-[#E0E0E0] placeholder-[#5A7A5A] transition-all focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    placeholder="$yourCashAppUsername"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#E0E0E0]">
                    💳 Venmo Username
                  </label>
                  <input
                    type="text"
                    value={profileData.sellerInfo?.paymentMethods?.venmo || ''}
                    onChange={(e) => handlePaymentChange('venmo', e.target.value)}
                    className="w-full rounded-xl border-2 border-[#2A4A2A] bg-[#1A3A1A] px-4 py-3 text-base text-[#E0E0E0] placeholder-[#5A7A5A] transition-all focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    placeholder="@yourVenmoUsername"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#E0E0E0]">
                    🏦 Zelle Email/Phone
                  </label>
                  <input
                    type="text"
                    value={profileData.sellerInfo?.paymentMethods?.zelle || ''}
                    onChange={(e) => handlePaymentChange('zelle', e.target.value)}
                    className="w-full rounded-xl border-2 border-[#2A4A2A] bg-[#1A3A1A] px-4 py-3 text-base text-[#E0E0E0] placeholder-[#5A7A5A] transition-all focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    placeholder="your.email@hawk.illinoistech.edu"
                  />
                </div>

                <div className="flex gap-3 rounded-lg border border-[#1A3A4A] bg-[#0A1A2A] p-3">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-blue-400" />
                  <p className="text-xs text-[#90A0C0]">
                    Add your phone number and at least one payment method if you plan to sell food.
                    Buyers will see these details after placing an order.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Note */}
            <div className="flex gap-3 rounded-xl border-2 border-[#1A3A4A] bg-[#0A1A2A] p-4">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-blue-400" />
              <div>
                <p className="mb-1 text-sm font-semibold text-[#E0E0E0]">Privacy Note</p>
                <p className="text-sm text-[#90A0C0]">
                  Your name, student ID, profile photo, and bio are visible to other verified
                  students. Your phone number, email, and payment information are only shared with
                  buyers after they place an order with you.
                </p>
              </div>
            </div>

            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={saving || uploadingPhoto}
                className={`w-full transform rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-102 hover:shadow-xl active:scale-98 ${
                  saving || uploadingPhoto ? 'cursor-not-allowed bg-gray-400' : 'bg-[#CC0000]'
                }`}
              >
                {saving ? 'Saving...' : uploadingPhoto ? 'Uploading Photo...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfile;
