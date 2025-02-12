import { useRef, useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { toastState, userState } from '../store/atoms';
import PropTypes from 'prop-types';
import socket from '../utils/socket';

// Helper function for date formatting
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const EventDialog = ({ event, onClose, isAttending, attendeeCount, onStatusChange, isPast }) => {
  const dialogRef = useRef(null);
  const setToast = useSetRecoilState(toastState);
  const user = useRecoilValue(userState);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    dialogRef.current?.close();
    onClose();
  };

  useEffect(() => {
    dialogRef.current?.showModal();

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (dialogRef.current) {
        dialogRef.current.close();
      }
    };
  }, []);

  const handleAttendance = async () => {
    if (isPast) return;
    setLoading(true);
    try {
      if (isAttending) {
        socket.emit('leave_event', {
          userId: user.id,
          eventId: event.id
        });
      } else {
        socket.emit('join_event', {
          userId: user.id,
          eventId: event.id
        });
      }
      onStatusChange();
    } catch (error) {
      console.error('Socket error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex justify-center items-center">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Close button for mobile */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Image Section */}
        <img
          src={event.cover_image || '/default-event.jpg'}
          alt={event.name}
          className="w-full h-64 object-cover"
        />

        {/* Content Section */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
              <p className="text-gray-600">Created by {event.creator_name}</p>
            </div>
            <button
              onClick={handleAttendance}
              disabled={loading || isPast}
              className={`px-6 py-2 rounded-lg font-medium ${isAttending
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                } ${(loading || isPast) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="inline-block animate-pulse">Processing...</span>
              ) : (
                isPast ? (isAttending ? 'Attended' : 'Did not attend') :
                  isAttending ? 'Leave Event' : 'Join Event'
              )}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Date & Time</h3>
              <p className="text-gray-600">
                {formatDateTime(event.date_time)}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Location</h3>
              <p className="text-gray-600">{event.location}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Description</h3>
              <p className="text-gray-600">{event.description}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Attendees</h3>
              <p className="text-gray-600">{attendeeCount} people {isPast ? 'attended' : 'attending'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

EventDialog.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    creator_name: PropTypes.string.isRequired,
    date_time: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    cover_image: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  isAttending: PropTypes.bool.isRequired,
  attendeeCount: PropTypes.number.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  isPast: PropTypes.bool.isRequired
};

export default EventDialog; 