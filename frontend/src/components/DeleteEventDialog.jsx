import PropTypes from 'prop-types';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { userState } from '../store/atoms';
import socket from '../utils/socket';
import { XMarkIcon } from '@heroicons/react/24/outline';

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
    <div className="fixed inset-0 z-50 overflow-auto bg-black/50 backdrop-blur-sm flex justify-center items-center">
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 transform transition-all">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
          <XMarkIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>

        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-2">Delete Event</h2>
        <p className="text-gray-500 text-center mb-6">
          Are you sure you want to delete "{event.name}"? This action cannot be undone.
        </p>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            onClick={onClose}
            className="inline-flex justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </span>
            ) : (
              'Delete Event'
            )}
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