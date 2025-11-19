import { Camera, Mail, User, IdCard, Eye, EyeOff, AlertCircle } from 'lucide-react';
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

            <div className="bg-[#FFF5F5] rounded-xl p-6 border-2 border-[#FFDDDD]">
              <div className="flex items-center gap-2 mb-4">
                <EyeOff size={20} className="text-[#CC0000]" />
                <h2 className="text-xl font-bold text-gray-900">Private Information</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">This information is only visible to you unless you decide to become a seller.</p>
              
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
            </div>

            <div className="flex gap-3 p-4 rounded-xl bg-blue-50 border-2 border-blue-200">
              <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Privacy Note</p>
                <p className="text-sm text-gray-700">
                  Your name, student ID, profile photo, and bio are visible to other verified students. 
                  Your email and password remain private.
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