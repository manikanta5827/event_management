import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRecoilValue } from 'recoil';
import { userState } from '../store/atoms';
import { XMarkIcon } from '@heroicons/react/24/outline';
import socket from '../utils/socket';

const EventForm = ({ event, onClose, mode }) => {
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
    }
  }, [event, mode]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, cover_image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'create') {
        console.log('Creating new event');
        socket.emit('new_event', {
          eventData: formData,
          userId: user.id
        });
      } else {
        socket.emit('update_event', {
          eventId: event.id,
          eventData: formData,
          userId: user.id
        });
      }
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          {mode === 'create' ? 'Create New Event' : 'Update Event'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Event Name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border rounded"
              required
            />
            
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border rounded h-32"
              required
            />

            <input
              type="datetime-local"
              value={formData.date_time}
              onChange={e => setFormData(prev => ({ ...prev, date_time: e.target.value }))}
              className="w-full px-4 py-2 border rounded"
              required
            />

            <input
              type="text"
              placeholder="Location"
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-2 border rounded"
              required
            />

            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border rounded"
              required
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : mode === 'create' ? 'Create Event' : 'Update Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

EventForm.propTypes = {
  event: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['create', 'update']).isRequired
};

export default EventForm; 