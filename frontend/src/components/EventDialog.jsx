import { useRef, useEffect, useState } from 'react';
import { XMarkIcon, MapPinIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
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
      socket.emit(isAttending ? 'leave_event' : 'join_event', {
        userId: user.id,
        eventId: event.id
      });
      onStatusChange();
    } catch (error) {
      console.error('Socket error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">
          <div className="relative h-96">
            <img
              src={event.cover_image || '/default-event.jpg'}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-500 mb-3">
                {event.category}
              </span>
              <h2 className="text-3xl font-bold mb-2">{event.name}</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">About this event</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
                </div>

                <button
                  onClick={handleAttendance}
                  disabled={loading || isPast}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${isAttending
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200'
                    } ${(loading || isPast) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <span className="inline-flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    isPast ? (isAttending ? '✓ Attended' : '✗ Did not attend') :
                      isAttending ? 'Leave Event' : 'Join Event'
                  )}
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center text-gray-700">
                    <CalendarIcon className="w-5 h-5 text-purple-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium">Date and time</p>
                      <p className="text-sm text-gray-500">{formatDateTime(event.date_time)}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <MapPinIcon className="w-5 h-5 text-purple-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-gray-500">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <UserGroupIcon className="w-5 h-5 text-purple-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium">Attendees</p>
                      <p className="text-sm text-gray-500">
                        {attendeeCount} {attendeeCount === 1 ? 'person' : 'people'} {isPast ? 'attended' : 'attending'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
    cover_image: PropTypes.string,
    category: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  isAttending: PropTypes.bool.isRequired,
  attendeeCount: PropTypes.number.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  isPast: PropTypes.bool.isRequired
};

export default EventDialog; 