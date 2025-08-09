import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Search, Loader, AlertCircle, Check, DollarSign, Image } from 'lucide-react';
import { createMarketplaceItem, getMarketplaceItems, uploadFile, MarketplaceItem } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';

const CommunityMarketplace = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState<'new' | 'used' | 'like new'>('used');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  const itemCategories = [
    'Electronics', 'Home Goods', 'Apparel', 'Books', 'Vehicles', 'Services', 'Other'
  ];
  const itemConditions = ['new', 'used', 'like new'];

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedItems = await getMarketplaceItems();
      setItems(fetchedItems);
    } catch (err) {
      console.error('Error loading marketplace items:', err);
      setError('Failed to load marketplace items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !description.trim() || !price.trim() || !category.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    setFormSuccess('');

    let imageUrl: string | undefined = undefined;
    try {
      if (imageFile) {
        imageUrl = await uploadFile(imageFile, 'marketplace-images');
      }

      const newItem = await createMarketplaceItem({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category.trim(),
        condition: condition,
        location: location.trim() || undefined,
        image_url: imageUrl || undefined,
        status: 'available',
      });

      if (newItem) {
        setFormSuccess('Item listed successfully!');
        setTitle('');
        setDescription('');
        setPrice('');
        setCategory('');
        setCondition('used');
        setLocation('');
        setImageFile(null);
        setShowCreateForm(false);
        loadItems(); // Reload items to show the new one
      } else {
        throw new Error('Failed to list item.');
      }
    } catch (err: any) {
      console.error('Error creating marketplace item:', err);
      setError(err.message || 'Failed to list item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
            Community Marketplace
          </h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{showCreateForm ? 'Cancel' : 'List Item'}</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700" style={{ fontFamily: 'Inter' }}>{error}</p>
          </div>
        )}
        {formSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-500" />
            <p className="text-green-700" style={{ fontFamily: 'Inter' }}>{formSuccess}</p>
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">List New Item</h2>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label htmlFor="item-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  id="item-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label htmlFor="item-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="item-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="item-price" className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    id="item-price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label htmlFor="item-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    id="item-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select Category</option>
                    {itemCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="item-condition" className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    id="item-condition"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as 'new' | 'used' | 'like new')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    {itemConditions.map((cond) => (
                      <option key={cond} value={cond}>{cond.charAt(0).toUpperCase() + cond.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="item-location" className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
                  <input
                    type="text"
                    id="item-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="item-image" className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
                <input
                  type="file"
                  id="item-image"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Listing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>List Item</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="h-12 w-12 animate-spin text-yellow-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items listed yet</h3>
            <p className="text-gray-600 mb-6">Be the first to list an item for sale or trade!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              List Your First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4">
                {item.image_url && (
                  <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                )}
                <h2 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h2>
                <p className="text-gray-700 text-sm mb-2 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-600 font-bold text-lg flex items-center">
                    <DollarSign className="h-5 w-5" />{item.price.toFixed(2)}
                  </span>
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {item.condition?.charAt(0).toUpperCase() + item.condition?.slice(1)}
                  </span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Search className="h-4 w-4 mr-2" />
                  <span>{item.category}</span>
                  {item.location && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{item.location}</span>
                    </>
                  )}
                </div>
                {item.user_profile && (
                  <p className="text-xs text-gray-500 mt-2">Listed by {item.user_profile.name}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityMarketplace;