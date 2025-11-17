import { Camera, AlertCircle } from 'lucide-react';
import { useRef } from 'react';
import type { ProfileData } from '../types';

interface SignupProps {
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
  onCreateProfile: () => void;
}

const Signup = ({ 
  profileData, 
  setProfileData, 
  onCreateProfile 
}: SignupProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isFormValid = profileData.firstName && profileData.lastName && profileData.studentId;

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3 text-[#CC0000]">
              Welcome to Night Market!
            </h2>
            <p className="text-lg text-gray-600">
              Create your verified student profile
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
            {/* Photo Upload */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div 
                  onClick={handlePhotoClick}
                  className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-[#E0E0E0] bg-[#F5F5F5] cursor-pointer hover:border-red-300 transition-colors"
                >
                  {profileData.photo ? (
                    <img 
                      src={profileData.photo} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover" 
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
                  title="Upload Photo"
                >
                  <Camera size={16} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  title="Upload Photo"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  First Name <span className="text-[#CC0000]">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-xl text-base focus:outline-none focus:ring-2 transition-all bg-[#FAFAFA] ${
                    profileData.firstName 
                      ? 'border-[#000000] focus:ring-gray-200' 
                      : 'border-[#CC0000] focus:ring-red-200'
                  }`}
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  Last Name <span className="text-[#CC0000]">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-xl text-base focus:outline-none focus:ring-2 transition-all bg-[#FAFAFA] ${
                    profileData.lastName 
                      ? 'border-[#000000] focus:ring-gray-200' 
                      : 'border-[#CC0000] focus:ring-red-200'
                  }`}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                Student ID Number <span className="text-[#CC0000]">*</span>
              </label>
              <input
                type="text"
                value={profileData.studentId}
                onChange={(e) => setProfileData({ ...profileData, studentId: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-xl text-base focus:outline-none focus:ring-2 transition-all font-mono bg-[#FAFAFA] ${
                  profileData.studentId 
                    ? 'border-[#000000] focus:ring-gray-200' 
                    : 'border-[#CC0000] focus:ring-red-200'
                }`}
                placeholder="A20123456"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                Tell us something about yourself
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#D0D0D0] rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all resize-none bg-[#FAFAFA] min-h-[120px]"
                placeholder="I like coding and games..."
              />
            </div>

            {/* Info Box */}
            <div className="flex gap-3 p-4 rounded-xl mb-6 bg-[#FFF5F5] border-2 border-[#FFDDDD]">
              <AlertCircle size={20} className="text-[#CC0000] shrink-0 mt-0.5" />
              <p className="text-sm text-gray-900">
                Your profile will be visible to other students. This helps build trust in our community.
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={onCreateProfile}
              disabled={!isFormValid}
              className={`w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102 active:scale-98 disabled:transform-none disabled:hover:shadow-lg ${
                isFormValid ? 'bg-[#CC0000] cursor-pointer' : 'bg-[#D0D0D0] cursor-not-allowed'
              }`}
            >
              {isFormValid ? 'Create Profile →' : 'Fill Required Fields'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;