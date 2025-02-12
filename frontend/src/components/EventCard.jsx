import { useRecoilValue } from 'recoil';
import { userState } from '../store/atoms';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { PencilIcon, TrashIcon, CalendarIcon, UserGroupIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
// import {  } from '@heroicons/react/24/outline';
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
      className="group relative bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
    >
      {isOwner && !isPast && (
        <div className="absolute top-3 right-3 z-20 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event, 'update');
            }}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
            title="Edit event"
          >
            <PencilIcon className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event, 'delete');
            }}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200"
            title="Delete event"
          >
            <TrashIcon className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      <div className="relative h-48">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
        <img
          src={event.cover_image || '/default-event.jpg'}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500 text-white mb-2">
            {event.category}
          </span>
          <h3 className="text-lg font-bold text-white text-shadow-sm line-clamp-2">{event.name}</h3>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <CalendarIcon className="w-5 h-5 mr-2 text-purple-500" />
            <span className="text-sm">{format(new Date(event.date_time), 'PPp')}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <MapPinIcon className="w-5 h-5 mr-2 text-purple-500" />
            <span className="text-sm truncate">{event.location}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <UserGroupIcon className="w-5 h-5 mr-2 text-purple-500" />
            <span className="text-sm">
              {attendeeCount} {attendeeCount === 1 ? 'person' : 'people'} {isPast ? 'attended' : 'attending'}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleAttendance}
            disabled={loading || isPast}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 
              ${isAttending
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