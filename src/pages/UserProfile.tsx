import { Camera, Mail, User, IdCard, Eye, EyeOff, AlertCircle, Lock, DollarSign } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ProfileData } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { UserMode } from '../types';

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
  onModeChange
}: UserProfileProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, photo: reader.result as string });
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
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

  const isValidPassword = (password: string): boolean => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /\d/.test(password);
  };

  const handlePasswordChange = () => {
    setPasswordError('');

    // Validate current password
    if (currentPassword !== profileData.password) {
      setPasswordError('Current password is incorrect');
      return;
    }

    // Validate new password
    if (!isValidPassword(newPassword)) {
      setPasswordError('Password must be 8+ characters with uppercase, lowercase, and number');
      return;
    }

    // Confirm passwords match
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Update password
    setProfileData({ ...profileData, password: newPassword, confirmPassword: newPassword });
    setHasChanges(true);
    
    // Clear fields and close section
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowPasswordSection(false);
    alert('Password updated! Remember to save changes.');
  };

  const handleSave = () => {
    onSaveProfile();
    setHasChanges(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        cartItems={[]} 
        profileData={profileData} 
        onCartClick={() => {}}
        onSignOut={onSignOut}
        onProfileClick={() => {}} 
        onOrdersClick={onOrdersClick}
        onSellerDashboardClick={onSellerDashboardClick}
        onModeChange={onModeChange}
        showCart={false}
        userMode={userMode}
      />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-[#CC0000] font-semibold hover:underline flex items-center gap-2"
          >
            ← Back to Browse
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
          <h1 className="text-3xl font-bold mb-2 text-[#CC0000]">My Profile</h1>
          <p className="text-gray-600 mb-8">Manage your account information and privacy settings</p>

          <div className="flex justify-center mb-8">
            <div className="relative">
              <div 
                onClick={handlePhotoClick}
                className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-[#E0E0E0] bg-[#F5F5F5] cursor-pointer hover:border-red-300 transition-colors overflow-hidden"
              >
                {profileData.photo ? (
                  <img 
                    src={profileData.photo} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="text-center">
                    <Camera size={36} className="text-[#76777B] mx-auto" />
                    <p className="text-xs mt-2 text-gray-500">Add Photo</p>
                  </div>
                )}
              </div>
              <button 
                type="button"
                onClick={handlePhotoClick}
                className="absolute bottom-1 right-1 p-3 rounded-full text-white shadow-lg hover:shadow-xl transition-shadow bg-[#CC0000]"
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
            <div className="bg-[#F5F5F5] rounded-xl p-6 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Eye size={20} className="text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Public Information</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">This information is visible to other students on Night Market</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900 items-center gap-2">
                      <User size={16} />
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      disabled
                      className="w-full px-4 py-3 border-2 border-[#D0D0D0] rounded-xl text-base bg-white text-gray-700 cursor-not-allowed"
                      title="First Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900 items-center gap-2">
                      <User size={16} />
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      disabled
                      className="w-full px-4 py-3 border-2 border-[#D0D0D0] rounded-xl text-base bg-white text-gray-700 cursor-not-allowed"
                      title="Last Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900 items-center gap-2">
                    <IdCard size={16} />
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={profileData.studentId}
                    disabled
                    className="w-full px-4 py-3 border-2 border-[#D0D0D0] rounded-xl text-base font-mono bg-white text-gray-700 cursor-not-allowed"
                    title="Student ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={handleBioChange}
                    className="w-full px-4 py-3 border-2 border-[#D0D0D0] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all resize-none bg-white min-h-[100px]"
                    placeholder="Tell us something about yourself..."
                  />
                </div>
              </div>
            </div>

            {/* Private Information Section */}
            <div className="bg-[#FFF5F5] rounded-xl p-6 border-2 border-[#FFDDDD]">
              <div className="flex items-center gap-2 mb-4">
                <EyeOff size={20} className="text-[#CC0000]" />
                <h2 className="text-xl font-bold text-gray-900">Private Information</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">This information is only visible to you</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900 items-center gap-2">
                    <Mail size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-3 border-2 border-[#D0D0D0] rounded-xl text-base bg-white text-gray-700 cursor-not-allowed"
                    title="Email Address"
                  />
                </div>

                {/* Password Change Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-900 items-center gap-2">
                      <Lock size={16} />
                      Password
                    </label>
                    <button
                      onClick={() => setShowPasswordSection(!showPasswordSection)}
                      className="text-sm text-[#CC0000] font-semibold hover:underline"
                    >
                      {showPasswordSection ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>

                  {!showPasswordSection ? (
                    <input
                      type="password"
                      value="••••••••"
                      disabled
                      className="w-full px-4 py-3 border-2 border-[#D0D0D0] rounded-xl text-base bg-white text-gray-700 cursor-not-allowed"
                      title="Password"
                    />
                  ) : (
                    <div className="space-y-3 p-4 bg-white rounded-xl border-2 border-gray-200">
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-gray-700">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-[#D0D0D0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all bg-white"
                          placeholder="Enter current password"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1 text-gray-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-[#D0D0D0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all bg-white"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1 text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-[#D0D0D0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all bg-white"
                          placeholder="Confirm new password"
                        />
                      </div>

                      {passwordError && (
                        <p className="text-xs text-[#CC0000]">{passwordError}</p>
                      )}

                      <button
                        onClick={handlePasswordChange}
                        className="w-full py-2 bg-[#CC0000] text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all"
                      >
                        Update Password
                      </button>

                      <p className="text-xs text-gray-600">
                        Password must be 8+ characters with uppercase, lowercase, and number
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Information Section */}
            <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={20} className="text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Payment Information</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">Add your payment methods so buyers can easily pay you</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    💸 CashApp Username
                  </label>
                  <input
                    type="text"
                    value={profileData.sellerInfo?.paymentMethods?.cashApp || ''}
                    onChange={(e) => handlePaymentChange('cashApp', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#D0D0D0] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all bg-white"
                    placeholder="$yourCashAppUsername"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    💳 Venmo Username
                  </label>
                  <input
                    type="text"
                    value={profileData.sellerInfo?.paymentMethods?.venmo || ''}
                    onChange={(e) => handlePaymentChange('venmo', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#D0D0D0] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all bg-white"
                    placeholder="@yourVenmoUsername"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    🏦 Zelle Email/Phone
                  </label>
                  <input
                    type="text"
                    value={profileData.sellerInfo?.paymentMethods?.zelle || ''}
                    onChange={(e) => handlePaymentChange('zelle', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-[#D0D0D0] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#000000] transition-all bg-white"
                    placeholder="your.email@hawk.illinoistech.edu"
                  />
                </div>

                <div className="flex gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700">
                    Add at least one payment method if you plan to sell food. Buyers will see these details after placing an order.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy Note */}
            <div className="flex gap-3 p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
              <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Privacy Note</p>
                <p className="text-sm text-gray-700">
                  Your name, student ID, profile photo, and bio are visible to other verified students. 
                  Your email, password, and payment information remain private.
                </p>
              </div>
            </div>

            {hasChanges && (
              <button
                onClick={handleSave}
                className="w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102 active:scale-98 bg-[#CC0000]"
              >
                Save Changes
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