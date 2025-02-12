import { useRecoilValue } from 'recoil';
import { userState } from '../store/atoms';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
// import socket from '../utils/socket';

const EventCard = ({ event, attendeeCount, isAttending, onEventClick, onJoinLeave, isPast }) => {
  const [loading, setLoading] = useState(false);
  // const setToast = useSetRecoilState(toastState);
  const user = useRecoilValue(userState);

  // Validate UUID format
  if (!event.id || typeof event.id !== 'string') {
    console.error('Invalid event ID:', event);
    return null;
  }

  const isOwner = user.id === event.created_by;

  const handleAttendance = async (e) => {
    e.stopPropagation();
    if (isPast || loading) return;

    setLoading(true);
    try {
      await onJoinLeave(event.id, !isAttending);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => onEventClick(event)}
      className="relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
    >
      {isOwner && !isPast && (
        <div className="absolute top-2 right-2 z-20 flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event, 'update');
            }}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            <PencilIcon className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event, 'delete');
            }}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            <TrashIcon className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}
      <div className="relative h-48">
        <div className="absolute inset-0 bg-black/10"></div>
        <img
          src={event.cover_image || '/default-event.jpg'}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white font-semibold text-lg">{event.name}</h3>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span>{attendeeCount} {isPast ? 'attended' : 'attending'}</span>
        </div>
        <button
          onClick={handleAttendance}
          disabled={loading || isPast}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${isAttending
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
            } ${(loading || isPast) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <span className="inline-block animate-pulse">Processing...</span>
          ) : (
            isPast ? (isAttending ? 'Attended' : 'Did not attend') :
              isAttending ? 'Leave' : 'Join'
          )}
        </button>
      </div>
    </div>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    created_by: PropTypes.string.isRequired,
    cover_image: PropTypes.string,
    description: PropTypes.string.isRequired,
    date_time: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired
  }).isRequired,
  attendeeCount: PropTypes.number.isRequired,
  isAttending: PropTypes.bool.isRequired,
  onEventClick: PropTypes.func.isRequired,
  onJoinLeave: PropTypes.func.isRequired,
  isPast: PropTypes.bool.isRequired
};

export default EventCard; 