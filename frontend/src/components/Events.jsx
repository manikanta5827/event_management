import { useState, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { userState, toastState } from '../store/atoms';
import api from '../api/api';
import EventCard from './EventCard';
import EventDialog from './EventDialog';
import EventForm from './EventForm';
import DeleteEventDialog from './DeleteEventDialog';
import socket from '../utils/socket';
import { PlusIcon } from '@heroicons/react/24/outline';

const Events = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [attendeeCounts, setAttendeeCounts] = useState({});
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dialogType, setDialogType] = useState(null); // 'view', 'create', 'update', 'delete'
  const user = useRecoilValue(userState);
  const setToast = useSetRecoilState(toastState);

  useEffect(() => {
    fetchEvents();
    setupSocketEvents();
  }, [user]);

  const setupSocketEvents = () => {
    socket.on('event_created', (newEvent) => {
      if (new Date(newEvent.date_time) > new Date()) {
        setUpcomingEvents(prev => [...prev, newEvent]);
      } else {
        setPastEvents(prev => [...prev, newEvent]);
      }
    });

    socket.on('event_updated', (updatedEvent) => {
      const updateEventInList = (prev) =>
        prev.map(event => event.id === updatedEvent.id ? updatedEvent : event);

      if (new Date(updatedEvent.date_time) > new Date()) {
        setUpcomingEvents(updateEventInList);
        setPastEvents(prev => prev.filter(event => event.id !== updatedEvent.id));
      } else {
        setPastEvents(updateEventInList);
        setUpcomingEvents(prev => prev.filter(event => event.id !== updatedEvent.id));
      }
    });

    socket.on('event_deleted', (deletedEventId) => {
      setUpcomingEvents(prev => prev.filter(event => event.id !== deletedEventId));
      setPastEvents(prev => prev.filter(event => event.id !== deletedEventId));
    });

    socket.on('attendee_update', ({ eventId, attendeeCount }) => {
      const count = parseInt(attendeeCount, 10);
      if (!isNaN(count) && count >= 0) {
        setAttendeeCounts(prev => ({
          ...prev,
          [eventId]: count
        }));
      }
    });

    return () => {
      socket.off('event_created');
      socket.off('event_updated');
      socket.off('event_deleted');
      socket.off('attendee_update');
    };
  };
  const processCounts = (attendeeCounts) => {
    return Object.entries(attendeeCounts).reduce((acc, [key, value]) => {
      const count = parseInt(value, 10);
      if (!isNaN(count) && count >= 0) {
        acc[key] = count;
      } else {
        acc[key] = 0;
      }
      return acc;
    }, {});
  }

  const fetchEvents = async () => {
    try {
      const response = await api.get('/api/events');
      const { upcoming, past, userEvents, attendeeCounts } = response.data.data;

      setUpcomingEvents(upcoming);
      setPastEvents(past);
      setUserEvents(userEvents.map(event => event.event_id));
      setAttendeeCounts(processCounts(attendeeCounts));
      
    } catch (error) {
      console.error('Error fetching events:', error);
      setToast({
        message: 'Failed to load events',
        type: 'error'
      });
    }
  };

  const handleJoinLeave = async (eventId, isJoining) => {
    const socketEvent = isJoining ? 'join_event' : 'leave_event';
    const currentCount = attendeeCounts[eventId] || 0;

    setUserEvents(prev =>
      isJoining
        ? [...prev, eventId]
        : prev.filter(id => id !== eventId)
    );

    setAttendeeCounts(prev => ({
      ...prev,
      [eventId]: Math.max(0, currentCount + (isJoining ? 1 : -1))
    }));

    socket.emit(socketEvent, {
      userId: user.id,
      eventId: eventId
    });
  };

  const handleEventClick = (event, type = 'view') => {
    if (!event && type !== 'create') return;
    setSelectedEvent(event);
    setDialogType(type);
  };

  const handleCloseDialog = () => {
    setSelectedEvent(null);
    setDialogType(null);
  };

  if (upcomingEvents.length === 0 && pastEvents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        Failed to load events. Please try again later.
      </div>
    );
  }

  const isUserAttending = (eventId) => {
    return userEvents.includes(eventId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Create Event Button */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex space-x-4">
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
        <button
          onClick={() => handleEventClick(null, 'create')}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Event
        </button>
      </div>

      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'upcoming' ? upcomingEvents : pastEvents).map((event) => (
          <EventCard
            key={`event-${event.id}`}
            event={event}
            attendeeCount={attendeeCounts[event.id] || 0}
            isAttending={isUserAttending(event.id)}
            onEventClick={handleEventClick}
            onJoinLeave={handleJoinLeave}
            isPast={activeTab === 'past'}
          />
        ))}
      </div>

      {/* Dialogs */}
      {selectedEvent && dialogType === 'view' && (
        <EventDialog
          event={selectedEvent}
          onClose={handleCloseDialog}
          isAttending={isUserAttending(selectedEvent.id)}
          attendeeCount={attendeeCounts[selectedEvent.id] || 0}
          onStatusChange={fetchEvents}
          isPast={activeTab === 'past'}
        />
      )}

      {dialogType === 'create' && (
        <EventForm
          onClose={handleCloseDialog}
          mode="create"
        />
      )}

      {selectedEvent && dialogType === 'update' && (
        <EventForm
          event={selectedEvent}
          onClose={handleCloseDialog}
          mode="update"
        />
      )}

      {selectedEvent && dialogType === 'delete' && (
        <DeleteEventDialog
          event={selectedEvent}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
};

export default Events; 