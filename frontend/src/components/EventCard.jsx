import { useSetRecoilState } from 'recoil';
import { toastState } from '../store/atoms';
import api from '../api/api';
import PropTypes from 'prop-types';
import { useState } from 'react';

const EventCard = ({ event, attendeeCount, isAttending, onEventClick, onStatusChange, isPast }) => {
  const [loading, setLoading] = useState(false);
  const setToast = useSetRecoilState(toastState);

  const handleAttendance = async (e) => {
    e.stopPropagation();
    if (isPast) return;
    setLoading(true);
    try {
      const endpoint = isAttending ? '/events/leave' : '/events/join';
      await api.post(endpoint, { eventId: event.id });
      setToast({
        message: isAttending ? 'Left event successfully' : 'Joined event successfully',
        type: 'success'
      });
      onStatusChange();
    } catch (error) {
      setToast({
        message: error.response?.data?.message || 'Operation failed',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onEventClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
    >
      <div className="relative h-48">
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
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            isAttending
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
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    cover_image: PropTypes.string
  }).isRequired,
  attendeeCount: PropTypes.number.isRequired,
  isAttending: PropTypes.bool.isRequired,
  onEventClick: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  isPast: PropTypes.bool.isRequired
};

export default EventCard; 