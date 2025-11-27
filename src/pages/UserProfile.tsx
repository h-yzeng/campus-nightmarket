import { Camera, Mail, User, IdCard, Eye, EyeOff, AlertCircle, Lock, DollarSign, MapPin, Phone } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ProfileData } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { UserMode } from '../types';
import { uploadProfilePhoto } from '../services/storage/imageService';
import { useAuth } from '../hooks/userAuth';
import { logger } from '../utils/logger';

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
  onLogoClick
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
          [field]: value
        },
        preferredLocations: profileData.sellerInfo?.preferredLocations || []
      }
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
        preferredLocations: profileData.sellerInfo?.preferredLocations || []
      }
    });
    setHasChanges(true);
  };

  const handleLocationChange = (location: string) => {
    setProfileData({
      ...profileData,
      sellerInfo: {
        ...profileData.sellerInfo,
        paymentMethods: profileData.sellerInfo?.paymentMethods || {},
        preferredLocations: location ? [location] : []
      }
    });
    setHasChanges(true);
  };

  const isValidPassword = (password: string): boolean => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /\d/.test(password);
  };

  const handlePasswordChange = async () => {
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }

    if (!isValidPassword(newPassword)) {
      setPasswordError('Password must be 8+ characters with uppercase, lowercase, and number');
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
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
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

      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-[#FF4444] hover:text-[#CC0000] font-semibold hover:underline flex items-center gap-2 transition-colors"
          >
            ← Back to Browse
          </button>
        </div>

        <div className="bg-[#1A1A1B] rounded-2xl shadow-xl border-2 border-[#2A2A2A] p-8">
          <h1 className="text-3xl font-bold mb-2 text-[#CC0000]">My Profile</h1>
          <p className="text-[#B0B0B0] mb-8">Manage your account information and privacy settings</p>

          {error && (
            <div className="flex gap-3 p-4 rounded-xl mb-6 bg-[#2A0A0A] border-2 border-[#4A1A1A]">
              <AlertCircle size={20} className="text-[#FF4444] shrink-0 mt-0.5" />
              <p className="text-sm text-[#FFB0B0]">{error}</p>
            </div>
          )}

          <div className="flex justify-center mb-8">
            <div className="relative">
              <div
                onClick={uploadingPhoto ? undefined : handlePhotoClick}
                className={`w-32 h-32 rounded-full flex items-center justify-center border-4 border-[#3A3A3A] bg-[#252525] ${uploadingPhoto ? 'cursor-wait' : 'cursor-pointer hover:border-[#CC0000]'} transition-colors overflow-hidden`}
              >
                {uploadingPhoto ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CC0000] mx-auto"></div>
                    <p className="text-xs mt-2 text-[#B0B0B0]">Uploading...</p>
                  </div>
                ) : profileData.photo ? (
                  <img
                    src={profileData.photo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Camera size={36} className="text-[#888888] mx-auto" />
                    <p className="text-xs mt-2 text-[#B0B0B0]">Add Photo</p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handlePhotoClick}
                disabled={uploadingPhoto}
                className="absolute bottom-1 right-1 p-3 rounded-full text-white shadow-lg hover:shadow-xl transition-shadow bg-[#CC0000] disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="bg-[#0A2A0A] rounded-xl p-6 border-2 border-[#1A4A1A]">
              <div className="flex items-center gap-2 mb-4">
                <Eye size={20} className="text-green-400" />
                <h2 className="text-xl font-bold text-[#E0E0E0]">Public Information</h2>
              </div>
              <p className="text-sm text-[#90C090] mb-4">This information is visible to other students on Night Market</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#E0E0E0] items-center gap-2">
                      <User size={16} />
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      disabled
                      className="w-full px-4 py-3 border-2 border-[#2A4A2A] rounded-xl text-base bg-[#1A3A1A] text-[#A0C0A0] cursor-not-allowed"
                      title="First Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-[#E0E0E0] items-center gap-2">
                      <User size={16} />
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      disabled
                      className="w-full px-4 py-3 border-2 border-[#2A4A2A] rounded-xl text-base bg-[#1A3A1A] text-[#A0C0A0] cursor-not-allowed"
                      title="Last Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#E0E0E0] items-center gap-2">
                    <IdCard size={16} />
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={profileData.studentId}
                    disabled
                    className="w-full px-4 py-3 border-2 border-[#2A4A2A] rounded-xl text-base font-mono bg-[#1A3A1A] text-[#A0C0A0] cursor-not-allowed"
                    title="Student ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#E0E0E0]">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={handleBioChange}
                    className="w-full px-4 py-3 border-2 border-[#2A4A2A] rounded-xl text-base text-[#E0E0E0] placeholder-[#5A7A5A] focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all resize-none bg-[#1A3A1A] min-h-[100px]"
                    placeholder="Tell us something about yourself..."
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#E0E0E0]">
                    <MapPin size={16} />
                    Current Dorm Location
                  </label>
                  <select
                    value={profileData.sellerInfo?.preferredLocations?.[0] || ''}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#2A4A2A] rounded-xl text-base text-[#E0E0E0] focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all bg-[#1A3A1A] appearance-none"
                    title="Select your current dorm"
                  >
                    <option value="">Select your dorm...</option>
                    <option value="Cunningham Hall">Cunningham Hall</option>
                    <option value="Kacek Hall">Kacek Hall</option>
                    <option value="Carmen Hall">Carmen Hall</option>
                    <option value="MSV">MSV</option>
                    <option value="Rowe North">Rowe North</option>
                    <option value="Rowe Middle">Rowe Middle</option>
                    <option value="Rowe South">Rowe South</option>
                    <option value="The Quad">The Quad</option>
                  </select>
                  <p className="text-xs text-[#90C090] mt-1">This helps buyers know your general location</p>
                </div>
              </div>
            </div>

            {/* Private Information Section */}
            <div className="bg-[#2A0A0A] rounded-xl p-6 border-2 border-[#4A1A1A]">
              <div className="flex items-center gap-2 mb-4">
                <EyeOff size={20} className="text-[#FF4444]" />
                <h2 className="text-xl font-bold text-[#E0E0E0]">Private Information</h2>
              </div>
              <p className="text-sm text-[#C09090] mb-4">This information is only visible to you</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#E0E0E0] items-center gap-2">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-3 border-2 border-[#4A2A2A] rounded-xl text-base bg-[#3A1A1A] text-[#C0A0A0] cursor-not-allowed"
                    title="Email Address"
                  />
                </div>

                {/* Password Change Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-[#E0E0E0] items-center gap-2">
                      <Lock size={16} />
                      Password
                    </label>
                    <button
                      onClick={() => setShowPasswordSection(!showPasswordSection)}
                      className="text-sm text-[#FF4444] hover:text-[#CC0000] font-semibold hover:underline transition-colors"
                    >
                      {showPasswordSection ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>

                  {!showPasswordSection ? (
                    <input
                      type="password"
                      value="••••••••"
                      disabled
                      className="w-full px-4 py-3 border-2 border-[#4A2A2A] rounded-xl text-base bg-[#3A1A1A] text-[#C0A0A0] cursor-not-allowed"
                      title="Password"
                    />
                  ) : (
                    <div className="space-y-3 p-4 bg-[#3A1A1A] rounded-xl border-2 border-[#5A2A2A]">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-[#D0B0B0]">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-[#5A2A2A] rounded-lg text-sm text-[#E0E0E0] placeholder-[#8A5A5A] focus:outline-none focus:ring-2 focus:ring-[#FF4444] focus:border-[#FF4444] transition-all bg-[#2A0A0A]"
                          placeholder="Enter current password"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1 text-[#D0B0B0]">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-[#5A2A2A] rounded-lg text-sm text-[#E0E0E0] placeholder-[#8A5A5A] focus:outline-none focus:ring-2 focus:ring-[#FF4444] focus:border-[#FF4444] transition-all bg-[#2A0A0A]"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1 text-[#D0B0B0]">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-[#5A2A2A] rounded-lg text-sm text-[#E0E0E0] placeholder-[#8A5A5A] focus:outline-none focus:ring-2 focus:ring-[#FF4444] focus:border-[#FF4444] transition-all bg-[#2A0A0A]"
                          placeholder="Confirm new password"
                        />
                      </div>

                      {passwordError && (
                        <p className="text-xs text-[#FF8888]">{passwordError}</p>
                      )}

                      <button
                        onClick={handlePasswordChange}
                        className="w-full py-2 bg-[#CC0000] text-white text-sm font-bold rounded-lg hover:bg-[#AA0000] hover:shadow-lg transition-all"
                      >
                        Update Password
                      </button>

                      <p className="text-xs text-[#B08080]">
                        Password must be 8+ characters with uppercase, lowercase, and number
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Information Section */}
            <div className="bg-[#0A2A0A] rounded-xl p-6 border-2 border-[#1A4A1A]">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={20} className="text-green-400" />
                <h2 className="text-xl font-bold text-[#E0E0E0]">Seller Contact & Payment</h2>
              </div>
              <p className="text-sm text-[#90C090] mb-4">Add your contact info and payment methods so buyers can reach you and pay you</p>

              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#E0E0E0]">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.sellerInfo?.phone || ''}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#2A4A2A] rounded-xl text-base text-[#E0E0E0] placeholder-[#5A7A5A] focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all bg-[#1A3A1A]"
                    placeholder="(123) 456-7890"
                  />
                  <p className="text-xs text-[#90C090] mt-1">Buyers will see your phone number after placing an order</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#E0E0E0]">
                    💸 CashApp Username
                  </label>
                  <input
                    type="text"
                    value={profileData.sellerInfo?.paymentMethods?.cashApp || ''}
                    onChange={(e) => handlePaymentChange('cashApp', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#2A4A2A] rounded-xl text-base text-[#E0E0E0] placeholder-[#5A7A5A] focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all bg-[#1A3A1A]"
                    placeholder="$yourCashAppUsername"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#E0E0E0]">
                    💳 Venmo Username
                  </label>
                  <input
                    type="text"
                    value={profileData.sellerInfo?.paymentMethods?.venmo || ''}
                    onChange={(e) => handlePaymentChange('venmo', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#2A4A2A] rounded-xl text-base text-[#E0E0E0] placeholder-[#5A7A5A] focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all bg-[#1A3A1A]"
                    placeholder="@yourVenmoUsername"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#E0E0E0]">
                    🏦 Zelle Email/Phone
                  </label>
                  <input
                    type="text"
                    value={profileData.sellerInfo?.paymentMethods?.zelle || ''}
                    onChange={(e) => handlePaymentChange('zelle', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#2A4A2A] rounded-xl text-base text-[#E0E0E0] placeholder-[#5A7A5A] focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all bg-[#1A3A1A]"
                    placeholder="your.email@hawk.illinoistech.edu"
                  />
                </div>

                <div className="flex gap-3 p-3 rounded-lg bg-[#0A1A2A] border border-[#1A3A4A]">
                  <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-[#90A0C0]">
                    Add your phone number and at least one payment method if you plan to sell food. Buyers will see these details after placing an order.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Note */}
            <div className="flex gap-3 p-4 rounded-xl bg-[#0A1A2A] border-2 border-[#1A3A4A]">
              <AlertCircle size={20} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#E0E0E0] mb-1">Privacy Note</p>
                <p className="text-sm text-[#90A0C0]">
                  Your name, student ID, profile photo, and bio are visible to other verified students.
                  Your phone number, email, and payment information are only shared with buyers after they place an order with you.
                </p>
              </div>
            </div>

            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={saving || uploadingPhoto}
                className={`w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102 active:scale-98 ${
                  saving || uploadingPhoto ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#CC0000]'
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