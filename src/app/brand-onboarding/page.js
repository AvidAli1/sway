'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Phone, MapPin, Building2, FileText, X } from 'lucide-react';

function BrandOnboardingContent() {
  const [token, setToken] = useState('');
  const [isValidToken, setIsValidToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    // User data
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',

    // Brand data
    brandName: '',
    description: '',
    businessEmail: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    logo: '',
    bannerImage: '',
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      validateToken(tokenFromUrl);
    } else {
      setIsValidToken(false);
      setLoading(false);
    }
  }, [searchParams]);

  const validateToken = async (tokenToValidate) => {
    try {
      const response = await fetch('/api/brand/validate-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenToValidate }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsValidToken(true);
        setFormData(prev => ({
          ...prev,
          email: data.email,
          brandName: data.brandName,
          businessEmail: '',
        }));
      } else {
        setIsValidToken(false);
        setError(data.error || 'Invalid invitation token');
      }
    } catch (error) {
      console.error('Error validating token:', error);
      setIsValidToken(false);
      setError('Failed to validate invitation token');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRemoveImage = (field) => {
    // Reset file input logic via ID so standard "Choose file" text changes back
    const fileInput = document.getElementById(field);
    if (fileInput) fileInput.value = '';

    setFormData(prev => ({
      ...prev,
      [field]: '',
    }));
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (field === 'logo') setUploadingLogo(true);
    else setUploadingBanner(true);
    setError('');

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await response.json();
      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          [field]: data.url,
        }));
      } else {
        setError(data.error || `Failed to upload ${field}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Failed to upload ${field}`);
    } finally {
      if (field === 'logo') setUploadingLogo(false);
      else setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setSubmitting(false);
      return;
    }

    if (!formData.logo || !formData.bannerImage) {
      setError('Logo and Banner Image are required');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        token,
        ...formData,
        brandPhone: formData.phone // Use the same phone for brand
      };
      delete payload.confirmPassword;

      const response = await fetch('/api/brand/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/brandDashboard');
        }, 3000);
      } else {
        setError(data.error || 'Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to complete onboarding');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            This invitation link may have expired or been used already. Please contact support if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Onboarding Complete!</h1>
          <p className="text-gray-600 mb-6">
            Welcome to Sway! Your brand has been successfully onboarded.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to your brand dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-black absolute left-[48%] sm:left-[50%] transform -translate-x-1/2">
            <Link href="/">
              <img src="/logo.png" alt="Logo" className="h-[24px] w-auto" />
            </Link>
          </h1>
        </div>
      </header>

      <div className="min-h-screen bg-gray-50">
        {/* Main Content - Responsive spacing */}
        <div className="px-4 sm:px-6">
          <div className="w-full max-w-2xl mx-auto pt-16 sm:pt-20 pb-16 sm:pb-24">
            {/* Auth Header */}
            <div className="text-center mb-12 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Complete Your Brand Profile</h2>
              <p className="text-gray-600">Fill in the details below to get started</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Information Section */}
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        placeholder="+92 300 1234567"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-50 text-gray-500 font-medium">Brand Information</span>
                </div>
              </div>

              {/* Brand Information Section */}
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Brand Name */}
                  <div>
                    <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        id="brandName"
                        name="brandName"
                        value={formData.brandName}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Business Email */}
                  <div>
                    <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        id="businessEmail"
                        name="businessEmail"
                        value={formData.businessEmail}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        placeholder="business@company.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Brand Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Description
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                      placeholder="Tell us about your brand..."
                    />
                  </div>
                </div>

                {/* Images Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Logo Upload */}
                  <div>
                    <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Logo *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="file"
                        id="logo"
                        name="logo"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'logo')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                        disabled={uploadingLogo}
                      />
                      {uploadingLogo && <span className="text-sm text-gray-500 ml-2">Uploading...</span>}
                      {formData.logo && !uploadingLogo && <span className="text-sm text-green-500 mx-2">✓ Uploaded</span>}
                    </div>
                    {formData.logo && (
                      <div className="mt-2 relative inline-block">
                        <img src={formData.logo} alt="Brand Logo Preview" className="h-16 w-auto object-contain rounded border" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('logo')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                          title="Remove Logo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Banner Image Upload */}
                  <div>
                    <label htmlFor="bannerImage" className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Banner Image *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="file"
                        id="bannerImage"
                        name="bannerImage"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'bannerImage')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                        disabled={uploadingBanner}
                      />
                      {uploadingBanner && <span className="text-sm text-gray-500 ml-2">Uploading...</span>}
                      {formData.bannerImage && !uploadingBanner && <span className="text-sm text-green-500 mx-2">✓ Uploaded</span>}
                    </div>
                    {formData.bannerImage && (
                      <div className="mt-2 relative inline-block">
                        <img src={formData.bannerImage} alt="Brand Banner Preview" className="h-16 w-full object-cover rounded border" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage('bannerImage')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                          title="Remove Banner"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                      placeholder="Your complete address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      placeholder="State"
                    />
                  </div>
                </div>

                {/* Postal Code */}
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    placeholder="Postal Code"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full bg-yellow-400 text-black py-3 px-4 rounded-lg font-semibold hover:bg-yellow-500 transition-colors ${submitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                {submitting ? 'Completing...' : 'Complete Onboarding'}
              </button>
            </form>

            {/* Terms */}
            <p className="text-xs text-gray-600 text-center mt-6">
              By completing onboarding, you agree to our <Link href="/terms" className="text-yellow-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-yellow-600 hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function BrandOnboarding() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BrandOnboardingContent />
    </Suspense>
  );
}