import { useState, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { userState, toastState } from '../store/atoms';
import api from '../api/api';
import EventCard from './EventCard';
import EventDialog from './EventDialog';

const Events = () => {
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const user = useRecoilValue(userState);
  const setToast = useSetRecoilState(toastState);

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setToast({
        message: 'Failed to load events',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!events && !loading) {
    return (
      <div className="text-center py-8 text-gray-600">
        Failed to load events. Please try again later.
      </div>
    );
  }

  const isUserAttending = (eventId) => {
    return events?.userEvents.some(e => e.event_id === eventId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tab buttons */}
      <div className="flex space-x-4 mb-8">
        <button
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'upcoming'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Events
        </button>
        <button
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'past'
            ? 'bg-purple-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          onClick={() => setActiveTab('past')}
        >
          Past Events
        </button>
      </div>

      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events && events[activeTab].map((event) => (
          <EventCard
            key={event.id}
            event={event}
            attendeeCount={events.attendeeCounts[event.id] || 0}
            isAttending={isUserAttending(event.id)}
            onEventClick={() => setSelectedEvent(event)}
            onStatusChange={fetchEvents}
            isPast={activeTab === 'past'}
          />
        ))}
      </div>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <EventDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          isAttending={isUserAttending(selectedEvent.id)}
          attendeeCount={events.attendeeCounts[selectedEvent.id] || 0}
          onStatusChange={fetchEvents}
          isPast={activeTab === 'past'}
        />
      )}
    </div>
  );
};

export default Events; 