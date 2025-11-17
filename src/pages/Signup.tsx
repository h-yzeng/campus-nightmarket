import { Camera, AlertCircle, Mail, Lock } from 'lucide-react';
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
  
  const isValidName = (name: string): boolean => {
    return /^[A-Za-z\s]*$/.test(name);
  };
  
  const isValidStudentId = (id: string): boolean => {
    return /^A\d*$/.test(id);
  };
  
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const isValidPassword = (password: string): boolean => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /\d/.test(password);
  };
  
  const passwordsMatch = (): boolean => {
    return profileData.password === profileData.confirmPassword && profileData.password.length > 0;
  };
  
  const getNameBorderColor = (value: string): string => {
    if (!value) return 'border-[#D0D0D0] focus:ring-gray-200';
    if (isValidName(value)) return 'border-[#000000] focus:ring-gray-200';
    return 'border-[#CC0000] focus:ring-red-200';
  };
  
  const getStudentIdBorderColor = (value: string): string => {
    if (!value) return 'border-[#D0D0D0] focus:ring-gray-200';
    if (isValidStudentId(value) && value.length > 1) return 'border-[#000000] focus:ring-gray-200';
    return 'border-[#CC0000] focus:ring-red-200';
  };
  
  const getEmailBorderColor = (value: string): string => {
    if (!value) return 'border-[#D0D0D0] focus:ring-gray-200';
    if (isValidEmail(value)) return 'border-[#000000] focus:ring-gray-200';
    return 'border-[#CC0000] focus:ring-red-200';
  };
  
  const getPasswordBorderColor = (value: string): string => {
    if (!value) return 'border-[#D0D0D0] focus:ring-gray-200';
    if (isValidPassword(value)) return 'border-[#000000] focus:ring-gray-200';
    return 'border-[#CC0000] focus:ring-red-200';
  };
  
  const getConfirmPasswordBorderColor = (): string => {
    if (!profileData.confirmPassword) return 'border-[#D0D0D0] focus:ring-gray-200';
    if (passwordsMatch()) return 'border-[#000000] focus:ring-gray-200';
    return 'border-[#CC0000] focus:ring-red-200';
  };
  
  const isFormValid = 
    profileData.email &&
    isValidEmail(profileData.email) &&
    profileData.password &&
    isValidPassword(profileData.password) &&
    profileData.confirmPassword &&
    passwordsMatch() &&
    profileData.firstName && 
    isValidName(profileData.firstName) &&
    profileData.lastName && 
    isValidName(profileData.lastName) &&
    profileData.studentId && 
    isValidStudentId(profileData.studentId) &&
    profileData.studentId.length > 1;

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
  
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || isValidName(value)) {
      setProfileData({ ...profileData, firstName: value });
    }
  };
  
  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || isValidName(value)) {
      setProfileData({ ...profileData, lastName: value });
    }
  };
  
  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    
    if (value === '') {
      setProfileData({ ...profileData, studentId: '' });
      return;
    }
    
    if (!value.startsWith('A')) {
      if (value.length === 1 && /\d/.test(value)) {
        setProfileData({ ...profileData, studentId: 'A' + value });
      }
      return;
    }
    
    if (isValidStudentId(value)) {
      setProfileData({ ...profileData, studentId: value });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3 text-[#CC0000]">
              Welcome to Night Market!
            </h2>
            <p className="text-lg text-gray-600">
              Create your verified student profile
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  First Name <span className="text-[#CC0000]">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={handleFirstNameChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl text-base focus:outline-none focus:ring-2 transition-all bg-[#FAFAFA] ${getNameBorderColor(profileData.firstName)}`}
                  placeholder="John"
                />
                {profileData.firstName && !isValidName(profileData.firstName) && (
                  <p className="text-xs text-[#CC0000] mt-1">Only letters are allowed</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  Last Name <span className="text-[#CC0000]">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={handleLastNameChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl text-base focus:outline-none focus:ring-2 transition-all bg-[#FAFAFA] ${getNameBorderColor(profileData.lastName)}`}
                  placeholder="Doe"
                />
                {profileData.lastName && !isValidName(profileData.lastName) && (
                  <p className="text-xs text-[#CC0000] mt-1">Only letters are allowed</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                Email Address <span className="text-[#CC0000]">*</span>
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#76777B]" />
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-base focus:outline-none focus:ring-2 transition-all bg-[#FAFAFA] ${getEmailBorderColor(profileData.email)}`}
                  placeholder="youremail@hawk.illinoistech.edu"
                />
              </div>
              {profileData.email && !isValidEmail(profileData.email) && (
                <p className="text-xs text-[#CC0000] mt-1">Please enter a valid email address</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-gray-900">
                Student ID Number <span className="text-[#CC0000]">*</span>
              </label>
              <input
                type="text"
                value={profileData.studentId}
                onChange={handleStudentIdChange}
                className={`w-full px-4 py-3 border-2 rounded-xl text-base focus:outline-none focus:ring-2 transition-all font-mono bg-[#FAFAFA] ${getStudentIdBorderColor(profileData.studentId)}`}
                placeholder="A20123456"
              />
              {profileData.studentId && (!isValidStudentId(profileData.studentId) || profileData.studentId.length <= 1) && (
                <p className="text-xs text-[#CC0000] mt-1">Must start with 'A' followed by numbers</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  Password <span className="text-[#CC0000]">*</span>
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#76777B]" />
                  <input
                    type="password"
                    value={profileData.password}
                    onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-base focus:outline-none focus:ring-2 transition-all bg-[#FAFAFA] ${getPasswordBorderColor(profileData.password)}`}
                    placeholder="••••••••"
                  />
                </div>
                {profileData.password && !isValidPassword(profileData.password) && (
                  <p className="text-xs text-[#CC0000] mt-1">8+ chars, uppercase, lowercase, number</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900">
                  Confirm Password <span className="text-[#CC0000]">*</span>
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#76777B]" />
                  <input
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-base focus:outline-none focus:ring-2 transition-all bg-[#FAFAFA] ${getConfirmPasswordBorderColor()}`}
                    placeholder="••••••••"
                  />
                </div>
                {profileData.confirmPassword && !passwordsMatch() && (
                  <p className="text-xs text-[#CC0000] mt-1">Passwords do not match</p>
                )}
              </div>
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

            <div className="flex gap-3 p-4 rounded-xl mb-6 bg-[#FFF5F5] border-2 border-[#FFDDDD]">
              <AlertCircle size={20} className="text-[#CC0000] shrink-0 mt-0.5" />
              <p className="text-sm text-gray-900">
                Your profile will be visible to other students. This helps build trust in our community.
              </p>
            </div>

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