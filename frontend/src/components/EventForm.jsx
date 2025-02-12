import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { userState } from '../store/atoms';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import socket from '../utils/socket';
import { CATEGORIES } from '../utils/constants';

const EventForm = ({ event, onClose, mode, onSuccess }) => {
  const user = useRecoilValue(userState);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date_time: '',
    location: '',
    category: '',
    cover_image: ''
  });
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    if (event && mode === 'update') {
      setFormData({
        name: event.name,
        description: event.description,
        date_time: new Date(event.date_time).toISOString().slice(0, 16),
        location: event.location,
        category: event.category,
        cover_image: event.cover_image
      });
      setPreviewImage(event.cover_image);
    }
  }, [event, mode]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, cover_image: reader.result }));
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'create') {
        socket.emit('new_event', {
          eventData: formData,
          userId: user.id
        }, (response) => {
          if (response?.success && response.event) {
            onSuccess(response.event);
            onClose();
          }
          setLoading(false);
        });
      } else {
        socket.emit('update_event', {
          eventId: event.id,
          eventData: formData,
          userId: user.id
        }, (response) => {
          if (response?.success && response.event) {
            onSuccess(response.event);
            onClose();
          }
          setLoading(false);
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
          <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-6">
                {mode === 'create' ? 'Create New Event' : 'Update Event'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload Section */}
                <div className="relative">
                  <div className="flex items-center justify-center w-full">
                    <label className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <PhotoIcon className="w-10 h-10 text-gray-400 mb-3" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Event Name"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />

                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="datetime-local"
                      value={formData.date_time}
                      onChange={e => setFormData(prev => ({ ...prev, date_time: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />

                    <select
                      value={formData.category}
                      onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                      required
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="text"
                    placeholder="Location"
                    value={formData.location}
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="inline-flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {mode === 'create' ? 'Creating...' : 'Updating...'}
                      </span>
                    ) : (
                      mode === 'create' ? 'Create Event' : 'Update Event'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

EventForm.propTypes = {
  event: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['create', 'update']).isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default EventForm; 