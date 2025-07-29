import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, Loader, AlertCircle, Check, Lightbulb, Megaphone, Building, Globe, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createGroup, Group } from '../../lib/database'; // Import Group interface and createGroup function

const CreateGroupForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'general' as Group['type'],
    location: '',
    privacy_setting: 'public' as Group['privacy_setting'],
    // For conditional fields (Idea Hub, Referral Network)
    linked_content_id: '', // e.g., Idea ID or Referral Job ID
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const groupTypes: Array<Group['type']> = ['business_guild', 'idea_hub', 'referral_network', 'general'];
  const privacySettings: Array<Group['privacy_setting']> = ['public', 'private', 'hidden'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a group.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const newGroup = await createGroup({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        location: formData.location || undefined,
        owner_id: user.id,
        privacy_setting: formData.privacy_setting,
      });

      if (newGroup) {
        setSuccess('Group created successfully!');
        // Optionally, navigate to the new group's detail page
        navigate(`/dashboard/community/groups/${newGroup.id}`);
      } else {
        throw new Error('Failed to create group.');
      }
    } catch (err: any) {
      console.error('Error creating group:', err);
      setError(err.message || 'Failed to create group. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Montserrat' }}>
            Create New Group
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700" style={{ fontFamily: 'Inter' }}>{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-500" />
              <p className="text-green-700" style={{ fontFamily: 'Inter' }}>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                style={{ fontFamily: 'Inter' }}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                style={{ fontFamily: 'Inter' }}
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">Group Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                style={{ fontFamily: 'Inter' }}
              >
                {groupTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional UI for Group Types */}
            {formData.type === 'idea_hub' && (
              <div>
                <label htmlFor="linked_content_id" className="block text-sm font-medium text-gray-700 mb-2">Link to Idea ID</label>
                <input
                  type="text"
                  id="linked_content_id"
                  name="linked_content_id"
                  value={formData.linked_content_id}
                  onChange={handleChange}
                  placeholder="Enter Idea ID (e.g., from Ideas Vault)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  style={{ fontFamily: 'Inter' }}
                />
                <p className="text-sm text-gray-500 mt-1">This group will be centered around this specific idea.</p>
              </div>
            )}

            {formData.type === 'referral_network' && (
              <div>
                <label htmlFor="linked_content_id" className="block text-sm font-medium text-gray-700 mb-2">Link to Business Profile ID or Referral Job ID</label>
                <input
                  type="text"
                  id="linked_content_id"
                  name="linked_content_id"
                  value={formData.linked_content_id}
                  onChange={handleChange}
                  placeholder="Enter Business/Referral Job ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  style={{ fontFamily: 'Inter' }}
                />
                <p className="text-sm text-gray-500 mt-1">This group will focus on a specific business or referral opportunity.</p>
              </div>
            )}

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">Location (Optional)</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., New York, NY or specific neighborhood"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                style={{ fontFamily: 'Inter' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Setting</label>
              <div className="flex space-x-4">
                {privacySettings.map(setting => (
                  <label key={setting} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="privacy_setting"
                      value={setting}
                      checked={formData.privacy_setting === setting}
                      onChange={handleChange}
                      className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700" style={{ fontFamily: 'Inter' }}>
                      {setting.charAt(0).toUpperCase() + setting.slice(1)}
                      {setting === 'public' && ' (Anyone can find and join)'}
                      {setting === 'private' && ' (Requires approval to join)'}
                      {setting === 'hidden' && ' (Only visible to members)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard/community?tab=groups')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium"
                style={{ fontFamily: 'Inter' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
                style={{ fontFamily: 'Inter' }}
              >
                {saving ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Create Group</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupForm;