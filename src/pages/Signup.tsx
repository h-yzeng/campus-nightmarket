import { Camera, AlertCircle, Mail, Lock, Shield } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ProfileData } from '../types';
import { SECURITY_QUESTIONS, saveSecurityQuestions } from '../services/auth/securityService';
import { useAuth } from '../hooks/userAuth';
import { rateLimiter, RATE_LIMITS } from '../utils/rateLimiter';

interface SignupProps {
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
  onCreateProfile: (password: string) => Promise<void>;
  onGoToLogin?: () => void;
}

const Signup = ({
  profileData,
  setProfileData,
  onCreateProfile,
  onGoToLogin
}: SignupProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password state managed locally (not in store)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [securityQuestion1, setSecurityQuestion1] = useState('');
  const [securityAnswer1, setSecurityAnswer1] = useState('');
  const [securityQuestion2, setSecurityQuestion2] = useState('');
  const [securityAnswer2, setSecurityAnswer2] = useState('');
  
  const isValidName = (name: string): boolean => {
    return /^[A-Za-z\s]*$/.test(name);
  };
  
  const isValidStudentId = (id: string): boolean => {
    return /^A\d*$/.test(id);
  };
  
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@hawk\.illinoistech\.edu$/.test(email);
  };
  
  const isValidPassword = (password: string): boolean => {
    return password.length >= 12 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /\d/.test(password) &&
           /[!@#$%^&*(),.?":{}|<>]/.test(password);
  };
  
  const passwordsMatch = (): boolean => {
    return password === confirmPassword && password.length > 0;
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
    if (!confirmPassword) return 'border-[#D0D0D0] focus:ring-gray-200';
    if (passwordsMatch()) return 'border-[#000000] focus:ring-gray-200';
    return 'border-[#CC0000] focus:ring-red-200';
  };
  
  const isFormValid =
    profileData.email &&
    isValidEmail(profileData.email) &&
    password &&
    isValidPassword(password) &&
    confirmPassword &&
    passwordsMatch() &&
    profileData.firstName &&
    isValidName(profileData.firstName) &&
    profileData.lastName &&
    isValidName(profileData.lastName) &&
    profileData.studentId &&
    isValidStudentId(profileData.studentId) &&
    profileData.studentId.length > 1 &&
    securityQuestion1 &&
    securityAnswer1.trim() &&
    securityQuestion2 &&
    securityAnswer2.trim() &&
    securityQuestion1 !== securityQuestion2;

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

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (!isFormValid) {
      setError('Please fill out all required fields correctly');
      setLoading(false);
      return;
    }

    // Rate limiting check for signup
    const rateLimit = rateLimiter.checkLimit(
      'signup_attempt',
      RATE_LIMITS.SIGNUP
    );
    if (!rateLimit.allowed) {
      setError(rateLimit.message || 'Too many signup attempts. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      await onCreateProfile(password);
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (user?.uid) {
        const questions = [
          { question: securityQuestion1, answer: securityAnswer1 },
          { question: securityQuestion2, answer: securityAnswer2 },
        ];
        await saveSecurityQuestions(user.uid, questions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3 text-[#CC0000]">
              Welcome to Night Market!
            </h2>
            <p className="text-lg text-gray-400">
              Create your verified student profile
            </p>
          </div>

          <div className="bg-[#1E1E1E] rounded-2xl shadow-xl border-2 border-[#3A3A3A] p-8">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div
                  onClick={handlePhotoClick}
                  className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-[#3A3A3A] bg-[#334150] cursor-pointer hover:border-red-300 transition-colors"
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
                      <p className="text-xs mt-2 text-gray-400">Add Photo</p>
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
                <label className="block text-sm font-semibold mb-2 text-white">
                  First Name <span className="text-[#CC0000]">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={handleFirstNameChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl text-base text-white focus:outline-none focus:ring-2 transition-all bg-[#334150] ${getNameBorderColor(profileData.firstName)}`}
                  placeholder="John"
                />
                {profileData.firstName && !isValidName(profileData.firstName) && (
                  <p className="text-xs text-[#CC0000] mt-1">Only letters are allowed</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Last Name <span className="text-[#CC0000]">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={handleLastNameChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl text-base text-white focus:outline-none focus:ring-2 transition-all bg-[#334150] ${getNameBorderColor(profileData.lastName)}`}
                  placeholder="Doe"
                />
                {profileData.lastName && !isValidName(profileData.lastName) && (
                  <p className="text-xs text-[#CC0000] mt-1">Only letters are allowed</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-white">
                Email Address <span className="text-[#CC0000]">*</span>
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#76777B]" />
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-base text-white focus:outline-none focus:ring-2 transition-all bg-[#334150] ${getEmailBorderColor(profileData.email)}`}
                  placeholder="youremail@hawk.illinoistech.edu"
                />
              </div>
              {profileData.email && !isValidEmail(profileData.email) && (
                <p className="text-xs text-[#CC0000] mt-1">Must use @hawk.illinoistech.edu email</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-white">
                Student ID Number <span className="text-[#CC0000]">*</span>
              </label>
              <input
                type="text"
                value={profileData.studentId}
                onChange={handleStudentIdChange}
                className={`w-full px-4 py-3 border-2 rounded-xl text-base text-white focus:outline-none focus:ring-2 transition-all font-mono bg-[#334150] ${getStudentIdBorderColor(profileData.studentId)}`}
                placeholder="A20123456"
              />
              {profileData.studentId && (!isValidStudentId(profileData.studentId) || profileData.studentId.length <= 1) && (
                <p className="text-xs text-[#CC0000] mt-1">Must start with 'A' followed by numbers</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Password <span className="text-[#CC0000]">*</span>
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#76777B]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-base text-white focus:outline-none focus:ring-2 transition-all bg-[#334150] ${getPasswordBorderColor(password)}`}
                    placeholder="••••••••"
                  />
                </div>
                {password && !isValidPassword(password) && (
                  <p className="text-xs text-[#CC0000] mt-1">12+ chars, uppercase, lowercase, number, special character</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Confirm Password <span className="text-[#CC0000]">*</span>
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#76777B]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl text-base text-white focus:outline-none focus:ring-2 transition-all bg-[#334150] ${getConfirmPasswordBorderColor()}`}
                    placeholder="••••••••"
                  />
                </div>
                {confirmPassword && !passwordsMatch() && (
                  <p className="text-xs text-[#CC0000] mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

            <div className="mb-6 p-6 bg-blue-950 border-2 border-blue-800 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} className="text-blue-400" />
                <h3 className="text-lg font-bold text-white">Security Questions</h3>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Choose 2 security questions to help recover your account if you forget your password.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">
                    Security Question 1 <span className="text-[#CC0000]">*</span>
                  </label>
                  <select
                    value={securityQuestion1}
                    onChange={(e) => setSecurityQuestion1(e.target.value)}
                    title="Select your first security question"
                    className="w-full px-4 py-3 border-2 border-[#3A3A3A] rounded-xl text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-[#334150] mb-2"
                  >
                    <option value="">Select a question...</option>
                    {SECURITY_QUESTIONS.map((q, index) => (
                      <option key={index} value={q} disabled={q === securityQuestion2}>
                        {q}
                      </option>
                    ))}
                  </select>
                  {securityQuestion1 && (
                    <input
                      type="text"
                      value={securityAnswer1}
                      onChange={(e) => setSecurityAnswer1(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-[#3A3A3A] rounded-xl text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-[#334150]"
                      placeholder="Your answer"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">
                    Security Question 2 <span className="text-[#CC0000]">*</span>
                  </label>
                  <select
                    value={securityQuestion2}
                    onChange={(e) => setSecurityQuestion2(e.target.value)}
                    title="Select your second security question"
                    className="w-full px-4 py-3 border-2 border-[#3A3A3A] rounded-xl text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-[#334150] mb-2"
                  >
                    <option value="">Select a question...</option>
                    {SECURITY_QUESTIONS.map((q, index) => (
                      <option key={index} value={q} disabled={q === securityQuestion1}>
                        {q}
                      </option>
                    ))}
                  </select>
                  {securityQuestion2 && (
                    <input
                      type="text"
                      value={securityAnswer2}
                      onChange={(e) => setSecurityAnswer2(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-[#3A3A3A] rounded-xl text-base text-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-[#334150]"
                      placeholder="Your answer"
                    />
                  )}
                </div>

                {securityQuestion1 && securityQuestion2 && securityQuestion1 === securityQuestion2 && (
                  <p className="text-xs text-[#CC0000]">Please select two different questions</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-white">
                Tell us something about yourself
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#3A3A3A] rounded-xl text-base text-white focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all resize-none bg-[#334150] min-h-[120px]"
                placeholder="I like coding and games..."
              />
            </div>

            <div className="flex gap-3 p-4 rounded-xl mb-6 bg-red-950 border-2 border-red-800">
              <AlertCircle size={20} className="text-[#CC0000] shrink-0 mt-0.5" />
              <p className="text-sm text-white">
                Your profile will be visible to other students. This helps build trust in our community.
              </p>
            </div>

            {error && (
              <div className="flex gap-3 p-4 rounded-xl mb-6 bg-red-950 border-2 border-red-800">
                <AlertCircle size={20} className="text-[#CC0000] shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!isFormValid || loading}
              className={`w-full py-4 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102 active:scale-98 disabled:transform-none disabled:hover:shadow-lg ${
                isFormValid && !loading ? 'bg-[#CC0000] cursor-pointer' : 'bg-[#999999] cursor-not-allowed'
              }`}
            >
              {loading ? 'Creating Account...' : isFormValid ? 'Create Profile →' : 'Fill Required Fields'}
            </button>

            {onGoToLogin && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{' '}
                  <button
                    onClick={onGoToLogin}
                    className="text-[#CC0000] font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;