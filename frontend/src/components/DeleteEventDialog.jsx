import PropTypes from 'prop-types';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { userState } from '../store/atoms';
import socket from '../utils/socket';

const DeleteEventDialog = ({ event, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const user = useRecoilValue(userState);

  const handleDelete = async () => {
    setLoading(true);
    try {
      socket.emit('delete_event', {
        eventId: event.id,
        userId: user.id
      }, (response) => {
        if (response?.success) {
          onSuccess();
          onClose();
        } else {
          console.error('Failed to delete event:', response?.error);
          // Optionally show error toast here
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-2xl font-bold mb-4">Delete Event</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{event.name}"? This action cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Deleting...' : 'Delete Event'}
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteEventDialog.propTypes = {
  event: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default DeleteEventDialog; 