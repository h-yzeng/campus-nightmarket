import { Camera, AlertCircle, Mail, Lock, Shield, Eye, EyeOff, Check, X } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ProfileData } from '../types';
import { SECURITY_QUESTIONS, saveSecurityQuestions } from '../services/auth/securityService';
import { useAuth } from '../hooks/useAuth';
import { rateLimiter, RATE_LIMITS } from '../utils/rateLimiter';
import PageHead from '../components/common/PageHead';

interface SignupProps {
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
  onCreateProfile: (password: string) => Promise<void>;
  onGoToLogin?: () => void;
  onBrowseFood?: () => void;
}

const Signup = ({
  profileData,
  setProfileData,
  onCreateProfile,
  onGoToLogin,
  onBrowseFood,
}: SignupProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password state managed locally (not in store)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [securityQuestion1, setSecurityQuestion1] = useState('');
  const [securityAnswer1, setSecurityAnswer1] = useState('');
  const [securityQuestion2, setSecurityQuestion2] = useState('');
  const [securityAnswer2, setSecurityAnswer2] = useState('');

  const isValidName = (name: string): boolean => {
    return /^[A-Za-z\s]*$/.test(name);
  };

  const isValidStudentId = (id: string): boolean => {
    return /^A\d{0,8}$/.test(id);
  };

  const getPasswordRequirements = (pwd: string) => {
    return {
      length: pwd.length >= 12,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
  };

  const getFormErrors = (): string[] => {
    const errors: string[] = [];

    if (!profileData.firstName) errors.push('First name is required');
    else if (!isValidName(profileData.firstName))
      errors.push('First name contains invalid characters');

    if (!profileData.lastName) errors.push('Last name is required');
    else if (!isValidName(profileData.lastName))
      errors.push('Last name contains invalid characters');

    if (!profileData.email) errors.push('Email is required');
    else if (!isValidEmail(profileData.email)) errors.push('Must use @hawk.illinoistech.edu email');

    if (!profileData.studentId) errors.push('Student ID is required');
    else if (!isValidStudentId(profileData.studentId) || profileData.studentId.length <= 1) {
      errors.push('Student ID must be A followed by up to 8 digits');
    }

    if (!password) errors.push('Password is required');
    else if (!isValidPassword(password)) errors.push('Password does not meet requirements');

    if (!confirmPassword) errors.push('Password confirmation is required');
    else if (!passwordsMatch()) errors.push('Passwords do not match');

    if (!securityQuestion1) errors.push('Security question 1 is required');
    if (!securityAnswer1.trim()) errors.push('Security answer 1 is required');

    if (!securityQuestion2) errors.push('Security question 2 is required');
    if (!securityAnswer2.trim()) errors.push('Security answer 2 is required');

    if (securityQuestion1 && securityQuestion2 && securityQuestion1 === securityQuestion2) {
      errors.push('Security questions must be different');
    }

    return errors;
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@hawk\.illinoistech\.edu$/.test(email);
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

  const passwordsMatch = (): boolean => {
    return password === confirmPassword && password.length > 0;
  };

  const getNameBorderColor = (value: string): string => {
    if (!value) return 'border-[#3A3A3A] focus:ring-[#CC0000]';
    if (isValidName(value)) return 'border-[#4A4A4A] focus:ring-[#CC0000]';
    return 'border-[#CC0000] focus:ring-[#CC0000]';
  };

  const getStudentIdBorderColor = (value: string): string => {
    if (!value) return 'border-[#3A3A3A] focus:ring-[#CC0000]';
    if (isValidStudentId(value) && value.length > 1) return 'border-[#4A4A4A] focus:ring-[#CC0000]';
    return 'border-[#CC0000] focus:ring-[#CC0000]';
  };

  const getEmailBorderColor = (value: string): string => {
    if (!value) return 'border-[#3A3A3A] focus:ring-[#CC0000]';
    if (isValidEmail(value)) return 'border-[#4A4A4A] focus:ring-[#CC0000]';
    return 'border-[#CC0000] focus:ring-[#CC0000]';
  };

  const getPasswordBorderColor = (value: string): string => {
    if (!value) return 'border-[#3A3A3A] focus:ring-[#CC0000]';
    if (isValidPassword(value)) return 'border-[#4A4A4A] focus:ring-[#CC0000]';
    return 'border-[#CC0000] focus:ring-[#CC0000]';
  };

  const getConfirmPasswordBorderColor = (): string => {
    if (!confirmPassword) return 'border-[#3A3A3A] focus:ring-[#CC0000]';
    if (passwordsMatch()) return 'border-[#4A4A4A] focus:ring-[#CC0000]';
    return 'border-[#CC0000] focus:ring-[#CC0000]';
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
      const formErrors = getFormErrors();
      setError(
        formErrors.length > 0 ? formErrors[0] : 'Please fill out all required fields correctly'
      );
      setLoading(false);
      return;
    }

    // Rate limiting check for signup
    const rateLimit = rateLimiter.checkLimit('signup_attempt', RATE_LIMITS.SIGNUP);
    if (!rateLimit.allowed) {
      setError(rateLimit.message || 'Too many signup attempts. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      await onCreateProfile(password);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (user?.uid) {
        const questions = [
          { question: securityQuestion1, answer: securityAnswer1 },
          { question: securityQuestion2, answer: securityAnswer2 },
        ];
        await saveSecurityQuestions(user.uid, questions);
      }

      // Clear sensitive form values after successful signup
      // Note: profileData is managed by parent and user will be redirected after signup
      setPassword('');
      setConfirmPassword('');
      setSecurityQuestion1('');
      setSecurityAnswer1('');
      setSecurityQuestion2('');
      setSecurityAnswer2('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHead
        title="Sign Up"
        description="Create your student profile to start buying and selling homemade food on campus."
      />
      <div className="flex min-h-screen flex-col bg-[#0A0A0B]">
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-2xl">
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-4xl font-bold text-[#CC0000]">Welcome to Night Market!</h2>
              <p className="text-lg text-gray-400">Create your verified student profile</p>
              {onBrowseFood && (
                <button
                  type="button"
                  onClick={onBrowseFood}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border-2 border-[#CC0000] bg-transparent px-6 py-2.5 text-sm font-bold text-[#CC0000] transition-all hover:bg-[#CC0000] hover:text-white"
                >
                  👀 Browse available food first
                </button>
              )}
            </div>

            <div className="rounded-2xl border-2 border-[#3A3A3A] bg-[#1E1E1E] p-8 shadow-xl">
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div
                    onClick={handlePhotoClick}
                    className="flex h-32 w-32 cursor-pointer items-center justify-center rounded-full border-4 border-[#3A3A3A] bg-[#2A2A2A] transition-colors hover:border-red-300"
                  >
                    {profileData.photo ? (
                      <img
                        src={profileData.photo}
                        alt="Profile"
                        loading="lazy"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Camera size={36} className="mx-auto text-[#76777B]" />
                        <p className="mt-2 text-xs text-gray-400">Add Photo</p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handlePhotoClick}
                    className="absolute right-1 bottom-1 rounded-full bg-[#CC0000] p-3 text-white shadow-lg transition-shadow hover:shadow-xl"
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

              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">
                    First Name <span className="text-[#CC0000]">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={handleFirstNameChange}
                    className={`w-full rounded-xl border-2 bg-[#2A2A2A] px-4 py-3 text-base text-white transition-all focus:ring-2 focus:outline-none ${getNameBorderColor(profileData.firstName)}`}
                    placeholder="John"
                  />
                  {profileData.firstName && !isValidName(profileData.firstName) && (
                    <p className="mt-1 text-xs text-[#CC0000]">Only letters are allowed</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">
                    Last Name <span className="text-[#CC0000]">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={handleLastNameChange}
                    className={`w-full rounded-xl border-2 bg-[#2A2A2A] px-4 py-3 text-base text-white transition-all focus:ring-2 focus:outline-none ${getNameBorderColor(profileData.lastName)}`}
                    placeholder="Doe"
                  />
                  {profileData.lastName && !isValidName(profileData.lastName) && (
                    <p className="mt-1 text-xs text-[#CC0000]">Only letters are allowed</p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-white">
                  Email Address <span className="text-[#CC0000]">*</span>
                </label>
                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute top-1/2 left-4 -translate-y-1/2 transform text-[#76777B]"
                  />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className={`w-full rounded-xl border-2 bg-[#2A2A2A] py-3 pr-4 pl-12 text-base text-white transition-all focus:ring-2 focus:outline-none ${getEmailBorderColor(profileData.email)}`}
                    placeholder="youremail@hawk.illinoistech.edu"
                  />
                </div>
                {profileData.email && !isValidEmail(profileData.email) && (
                  <p className="mt-1 text-xs text-[#CC0000]">
                    Must use @hawk.illinoistech.edu email
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-white">
                  Student ID Number <span className="text-[#CC0000]">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.studentId}
                  onChange={handleStudentIdChange}
                  className={`w-full rounded-xl border-2 bg-[#2A2A2A] px-4 py-3 font-mono text-base text-white transition-all focus:ring-2 focus:outline-none ${getStudentIdBorderColor(profileData.studentId)}`}
                  placeholder="A20123456"
                  maxLength={9}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Format: A followed by up to 8 digits (e.g., A20123456)
                </p>
                {profileData.studentId &&
                  (!isValidStudentId(profileData.studentId) ||
                    profileData.studentId.length <= 1) && (
                    <p className="mt-1 text-xs text-[#CC0000]">
                      Must start with 'A' followed by numbers (max 8 digits)
                    </p>
                  )}
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-white">
                  Password <span className="text-[#CC0000]">*</span>
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute top-1/2 left-4 -translate-y-1/2 transform text-[#76777B]"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-xl border-2 bg-[#2A2A2A] py-3 pr-12 pl-12 text-base text-white transition-all focus:ring-2 focus:outline-none ${getPasswordBorderColor(password)}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 transform text-[#76777B] transition-colors hover:text-white"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Password Requirements */}
                <div className="mt-3 space-y-1.5 rounded-lg bg-[#2A2A2A] p-3">
                  <p className="mb-2 text-xs font-semibold text-gray-300">Password must contain:</p>
                  {Object.entries({
                    length: 'At least 12 characters',
                    uppercase: 'One uppercase letter (A-Z)',
                    lowercase: 'One lowercase letter (a-z)',
                    number: 'One number (0-9)',
                    special: 'One special character (!@#$%...)',
                  }).map(([key, label]) => {
                    const requirements = getPasswordRequirements(password);
                    const isMet = requirements[key as keyof typeof requirements];
                    return (
                      <div key={key} className="flex items-center gap-2">
                        {isMet ? (
                          <Check size={14} className="shrink-0 text-green-500" />
                        ) : (
                          <X size={14} className="shrink-0 text-gray-500" />
                        )}
                        <span className={`text-xs ${isMet ? 'text-green-400' : 'text-gray-400'}`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-white">
                  Confirm Password <span className="text-[#CC0000]">*</span>
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute top-1/2 left-4 -translate-y-1/2 transform text-[#76777B]"
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full rounded-xl border-2 bg-[#2A2A2A] py-3 pr-12 pl-12 text-base text-white transition-all focus:ring-2 focus:outline-none ${getConfirmPasswordBorderColor()}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 transform text-[#76777B] transition-colors hover:text-white"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch() && (
                  <p className="mt-1 text-xs text-[#CC0000]">Passwords do not match</p>
                )}
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-white">
                  Tell us something about yourself
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="min-h-[120px] w-full resize-none rounded-xl border-2 border-[#3A3A3A] bg-[#2A2A2A] px-4 py-3 text-base text-white transition-all focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                  placeholder="I like coding and games..."
                />
              </div>

              <div className="mb-6 rounded-xl border-2 border-blue-800 bg-blue-950 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-blue-400" />
                  <h3 className="text-lg font-bold text-white">Security Questions</h3>
                </div>
                <p className="mb-4 text-sm text-gray-300">
                  Choose 2 security questions to help recover your account if you forget your
                  password.
                </p>

                <div className="mb-4 flex gap-2 rounded-lg border border-yellow-600 bg-yellow-900/30 p-3">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-yellow-400" />
                  <p className="text-xs text-yellow-200">
                    <strong>Important:</strong> Remember your answers! You'll need them to recover
                    your account if you forget your password.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">
                      Security Question 1 <span className="text-[#CC0000]">*</span>
                    </label>
                    <select
                      value={securityQuestion1}
                      onChange={(e) => setSecurityQuestion1(e.target.value)}
                      title="Select your first security question"
                      className="mb-2 w-full rounded-xl border-2 border-[#3A3A3A] bg-[#2A2A2A] px-4 py-3 text-base text-white transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                    >
                      <option value="">Select a question...</option>
                      {SECURITY_QUESTIONS.map((q, index) => (
                        <option key={index} value={q} disabled={q === securityQuestion2}>
                          {q}
                        </option>
                      ))}
                    </select>
                    {securityQuestion1 && (
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-white">
                          Your Answer <span className="text-[#CC0000]">*</span>
                        </label>
                        <input
                          type="text"
                          value={securityAnswer1}
                          onChange={(e) => setSecurityAnswer1(e.target.value)}
                          className="w-full rounded-xl border-2 border-[#3A3A3A] bg-[#2A2A2A] px-4 py-3 text-base text-white transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                          placeholder="Your answer"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">
                      Security Question 2 <span className="text-[#CC0000]">*</span>
                    </label>
                    <select
                      value={securityQuestion2}
                      onChange={(e) => setSecurityQuestion2(e.target.value)}
                      title="Select your second security question"
                      className="mb-2 w-full rounded-xl border-2 border-[#3A3A3A] bg-[#2A2A2A] px-4 py-3 text-base text-white transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                    >
                      <option value="">Select a question...</option>
                      {SECURITY_QUESTIONS.map((q, index) => (
                        <option key={index} value={q} disabled={q === securityQuestion1}>
                          {q}
                        </option>
                      ))}
                    </select>
                    {securityQuestion2 && (
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-white">
                          Your Answer <span className="text-[#CC0000]">*</span>
                        </label>
                        <input
                          type="text"
                          value={securityAnswer2}
                          onChange={(e) => setSecurityAnswer2(e.target.value)}
                          className="w-full rounded-xl border-2 border-[#3A3A3A] bg-[#2A2A2A] px-4 py-3 text-base text-white transition-all focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000] focus:outline-none"
                          placeholder="Your answer"
                        />
                      </div>
                    )}
                  </div>

                  {securityQuestion1 &&
                    securityQuestion2 &&
                    securityQuestion1 === securityQuestion2 && (
                      <p className="text-xs text-[#CC0000]">
                        Please select two different questions
                      </p>
                    )}
                </div>
              </div>

              <div className="mb-6 flex gap-3 rounded-xl border-2 border-red-800 bg-red-950 p-4">
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-[#CC0000]" />
                <p className="text-sm text-white">
                  Your profile will be visible to other students. This helps build trust in our
                  community.
                </p>
              </div>

              {error && (
                <div className="mb-6 flex gap-3 rounded-xl border-2 border-red-800 bg-red-950 p-4">
                  <AlertCircle size={20} className="mt-0.5 shrink-0 text-[#CC0000]" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid || loading}
                className={`w-full transform rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-102 hover:shadow-xl active:scale-98 disabled:transform-none disabled:hover:shadow-lg ${
                  isFormValid && !loading
                    ? 'cursor-pointer bg-[#CC0000]'
                    : 'cursor-not-allowed bg-[#999999]'
                }`}
              >
                {loading
                  ? 'Creating Account...'
                  : isFormValid
                    ? 'Create Profile →'
                    : 'Fill Required Fields'}
              </button>

              {onGoToLogin && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={onGoToLogin}
                      className="font-semibold text-[#CC0000] hover:underline"
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
    </>
  );
};

export default Signup;
