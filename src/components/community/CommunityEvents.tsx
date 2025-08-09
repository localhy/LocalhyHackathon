import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Loader, AlertCircle, Check } from 'lucide-react';
import { createEvent, getEvents, uploadFile, Event } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';

const CommunityEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedEvents = await getEvents();
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !description.trim() || !eventDate.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    setFormSuccess('');

    let imageUrl: string | undefined = undefined;
    try {
      if (imageFile) {
        imageUrl = await uploadFile(imageFile, 'event-images');
      }

      const newEvent = await createEvent({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        event_date: new Date(eventDate).toISOString(),
        location: location.trim() || undefined,
        image_url: imageUrl || undefined,
      });

      if (newEvent) {
        setFormSuccess('Event created successfully!');
        setTitle('');
        setDescription('');
        setEventDate('');
        setLocation('');
        setImageFile(null);
        setShowCreateForm(false);
        loadEvents(); // Reload events to show the new one
      } else {
        throw new Error('Failed to create event.');
      }
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.message || 'Failed to create event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat' }}>
            Community Events
          </h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{showCreateForm ? 'Cancel' : 'Create Event'}</span>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  id="event-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="event-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                />
              </div>
              <div>
                <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  id="event-date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label htmlFor="event-location" className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
                <input
                  type="text"
                  id="event-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label htmlFor="event-image" className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
                <input
                  type="file"
                  id="event-image"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Create Event</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="h-12 w-12 animate-spin text-purple-500" />
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events scheduled yet</h3>
            <p className="text-gray-600 mb-6">Be the first to create a community event!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow p-6 flex items-start space-x-4">
                {event.image_url && (
                  <img src={event.image_url} alt={event.title} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h2>
                  <p className="text-gray-700 text-sm mb-2">{event.description}</p>
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(event.event_date)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <Search className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.user_profile && (
                    <p className="text-xs text-gray-500 mt-2">Posted by {event.user_profile.name}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityEvents;