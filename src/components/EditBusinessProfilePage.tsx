// src/components/EditBusinessProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader, AlertCircle, Check, Edit, Upload } from 'lucide-react';
import Sidebar from './dashboard/Sidebar';
import TopBar from './dashboard/TopBar';
import { useAuth } from '../contexts/AuthContext';
import { getBusinessProfileById, updateBusinessProfile, uploadFile, type BusinessProfile } from '../lib/database';

const EditBusinessProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State for form fields
  const [formData, setFormData] = useState({
    business_name: '',
    category: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    email: '',
    phone: '',
    website: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    youtube_video_url: '',
    promo_tagline: '',
    referral_reward_amount: 0,
    referral_reward_type: 'percentage' as 'percentage' | 'fixed',
    enable_referrals: true,
    display_earnings_publicly: false,
    enable_questions_comments: true,
    years_in_business: 0,
    // Add other fields as needed
  });

  // State for image uploads
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingCertifications, setUploadingCertifications] = useState(false);

  useEffect(() => {
    const loadBusiness = async () => {
      if (!id) {
        setError('Invalid business ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const fetchedBusiness = await getBusinessProfileById(id);
        if (fetchedBusiness) {
          // Check if user owns this business profile
          if (fetchedBusiness.user_id !== user?.id) {
            setError('You can only edit your own business profiles');
            setLoading(false);
            return;
          }
          setBusiness(fetchedBusiness);
          setFormData({
            business_name: fetchedBusiness.business_name || '',
            category: fetchedBusiness.category || '',
            description: fetchedBusiness.description || '',
            address: fetchedBusiness.address || '',
            city: fetchedBusiness.city || '',
            state: fetchedBusiness.state || '',
            country: fetchedBusiness.country || '',
            email: fetchedBusiness.email || '',
            phone: fetchedBusiness.phone || '',
            website: fetchedBusiness.website || '',
            linkedin: fetchedBusiness.linkedin || '',
            twitter: fetchedBusiness.twitter || '',
            facebook: fetchedBusiness.facebook || '',
            instagram: fetchedBusiness.instagram || '',
            youtube_video_url: fetchedBusiness.youtube_video_url || '',
            promo_tagline: fetchedBusiness.promo_tagline || '',
            referral_reward_amount: fetchedBusiness.referral_reward_amount || 0,
            referral_reward_type: fetchedBusiness.referral_reward_type || 'percentage',
            enable_referrals: fetchedBusiness.enable_referrals,
            display_earnings_publicly: fetchedBusiness.display_earnings_publicly,
            enable_questions_comments: fetchedBusiness.enable_questions_comments,
            years_in_business: fetchedBusiness.years_in_business || 0,
            // Initialize other fields
          });
        } else {
          setError('Business not found');
        }
      } catch (err) {
        console.error('Error loading business:', err);
        setError('Failed to load business. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadBusiness();
  }, [id, user]);

  const handleNavigation = (page: string) => {
    setSidebarOpen(false);
    navigate(`/dashboard/${page}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnail_url' | 'cover_photo_url', bucket: string) => {
    const file = e.target.files?.[0];
    if (!file || !business) return;

    if (field === 'thumbnail_url') setUploadingThumbnail(true);
    if (field === 'cover_photo_url') setUploadingCover(true);
    setError('');
    setSuccess('');

    try {
      const imageUrl = await uploadFile(file, bucket);
      if (imageUrl) {
        const updatedBusiness = await updateBusinessProfile(business.id, { [field]: imageUrl });
        if (updatedBusiness) {
          setBusiness(updatedBusiness);
          setSuccess(`${field.replace('_', ' ').replace('url', 'URL')} updated successfully!`);
          setTimeout(() => setSuccess(''), 3000);
        }
      }
    } catch (err: any) {
      console.error(`Error uploading ${field}:`, err);
      setError(`Failed to upload ${field}. Please try again.`);
    } finally {
      if (field === 'thumbnail_url') setUploadingThumbnail(false);
      if (field === 'cover_photo_url') setUploadingCover(false);
      e.target.value = ''; // Clear input
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !user) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updatedBusiness = await updateBusinessProfile(business.id, formData);
      if (updatedBusiness) {
        setBusiness(updatedBusiness);
        setSuccess('Business profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Failed to update business profile');
      }
    } catch (err: any) {
      console.error('Error saving business profile:', err);
      setError(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isOpen={sidebarOpen} currentPage="business-pages" onNavigate={handleNavigation} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} user={user} />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar isOpen={sidebarOpen} currentPage="business-pages" onNavigate={handleNavigation} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} user={user} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
              <button onClick={() => navigate('/dashboard/business-pages')} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
                Back to Business Pages
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} currentPage="business-pages" onNavigate={handleNavigation} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} user={user} />

        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center space-x-4">
            <button onClick={() => navigate(`/dashboard/business/${business.id}`)} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
                Edit Business Profile
              </h1>
              <p className="text-gray-600 mt-1" style={{ fontFamily: 'Inter' }}>
                Update details for {business.business_name}
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {(error || success) && (
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
            <div className="max-w-4xl mx-auto">
              {error && (
                <div className="flex items-center space-x-2 text-red-700 bg-red-50 px-4 py-2 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span style={{ fontFamily: 'Inter' }}>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                  <Check className="h-5 w-5" />
                  <span style={{ fontFamily: 'Inter' }}>{success}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Montserrat' }}>
                  Basic Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                    <input type="text" id="business_name" name="business_name" value={formData.business_name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select a category</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Retail">Retail</option>
                      <option value="Professional Services">Professional Services</option>
                      <option value="Health & Wellness">Health & Wellness</option>
                      <option value="Technology">Technology</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Education">Education</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Home Services">Home Services</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" />
                  </div>
                  <div>
                    <label htmlFor="years_in_business" className="block text-sm font-medium text-gray-700 mb-2">Years in Business</label>
                    <input type="number" id="years_in_business" name="years_in_business" value={formData.years_in_business} onChange={handleNumberChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Montserrat' }}>
                  Location
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input type="text" id="state" name="state" value={formData.state} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input type="text" id="country" name="country" value={formData.country} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Montserrat' }}>
                  Contact Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input type="url" id="website" name="website" value={formData.website} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Montserrat' }}>
                  Social Media
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                    <input type="url" id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
                    <input type="url" id="twitter" name="twitter" value={formData.twitter} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
                    <input type="url" id="facebook" name="facebook" value={formData.facebook} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                    <input type="url" id="instagram" name="instagram" value={formData.instagram} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Montserrat' }}>
                  Media
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700 mb-2">Business Logo (Thumbnail)</label>
                    <input type="file" id="thumbnail_url" name="thumbnail_url" accept="image/*" onChange={(e) => handleImageUpload(e, 'thumbnail_url', 'business-thumbnails')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    {uploadingThumbnail && <p className="text-blue-600 text-sm mt-1">Uploading...</p>}
                    {business.thumbnail_url && <img src={business.thumbnail_url} alt="Current Thumbnail" className="mt-2 w-24 h-24 object-cover rounded-lg" />}
                  </div>
                  <div>
                    <label htmlFor="cover_photo_url" className="block text-sm font-medium text-gray-700 mb-2">Cover Photo</label>
                    <input type="file" id="cover_photo_url" name="cover_photo_url" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover_photo_url', 'business-covers')} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    {uploadingCover && <p className="text-blue-600 text-sm mt-1">Uploading...</p>}
                    {business.cover_photo_url && <img src={business.cover_photo_url} alt="Current Cover" className="mt-2 w-full h-32 object-cover rounded-lg" />}
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="youtube_video_url" className="block text-sm font-medium text-gray-700 mb-2">YouTube Video URL</label>
                    <input type="url" id="youtube_video_url" name="youtube_video_url" value={formData.youtube_video_url} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  {/* Add fields for gallery_urls and certifications_urls if needed */}
                </div>
              </div>

              {/* Referral Program Settings */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Montserrat' }}>
                  Referral Program Settings
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" name="enable_referrals" checked={formData.enable_referrals} onChange={handleChange} className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded" />
                    <span className="ml-2 text-sm text-gray-700">Enable Referral Program</span>
                  </label>
                  {formData.enable_referrals && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="referral_reward_amount" className="block text-sm font-medium text-gray-700 mb-2">Referral Reward Amount</label>
                        <input type="number" id="referral_reward_amount" name="referral_reward_amount" value={formData.referral_reward_amount} onChange={handleNumberChange} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label htmlFor="referral_reward_type" className="block text-sm font-medium text-gray-700 mb-2">Referral Reward Type</label>
                        <select id="referral_reward_type" name="referral_reward_type" value={formData.referral_reward_type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed Amount</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label htmlFor="promo_tagline" className="block text-sm font-medium text-gray-700 mb-2">Promotional Tagline</label>
                        <input type="text" id="promo_tagline" name="promo_tagline" value={formData.promo_tagline} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Other Settings */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Montserrat' }}>
                  Other Settings
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" name="display_earnings_publicly" checked={formData.display_earnings_publicly} onChange={handleChange} className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded" />
                    <span className="ml-2 text-sm text-gray-700">Display Earnings Publicly</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" name="enable_questions_comments" checked={formData.enable_questions_comments} onChange={handleChange} className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded" />
                    <span className="ml-2 text-sm text-gray-700">Enable Questions & Comments</span>
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2">
                  {saving ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default EditBusinessProfilePage;
