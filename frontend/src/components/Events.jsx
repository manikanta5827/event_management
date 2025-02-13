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
import { CATEGORIES } from '../utils/constants';
import EmptyState from './EmptyState';

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

  // Add new state for filters
  const [filters, setFilters] = useState({
    category: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  useEffect(() => {
    fetchEvents();
    const cleanupSocket = setupSocketEvents();

    // Cleanup function
    return () => {
      if (typeof cleanupSocket === 'function') {
        cleanupSocket();
      }
    };
  }, [user]);

  const setupSocketEvents = () => {
    // Remove existing listeners
    socket.off('event_created');
    socket.off('event_updated');
    socket.off('event_deleted');
    socket.off('attendee_update');

    socket.on('event_created', (newEvent) => {
      if (!newEvent?.name) return;
      console.log('Event created:', newEvent);
      if (newEvent.created_by !== user.id) {
        setToast({
          message: `New event "${newEvent.name}" has been created`,
          type: 'success'
        });
        if (new Date(newEvent.date_time) > new Date()) {
          setUpcomingEvents(prev => {
            if (prev.some(event => event.id === newEvent.id)) {
              return prev;
            }
            return [...prev, newEvent].sort((a, b) =>
              new Date(a.date_time) - new Date(b.date_time)
            );
          });
        } else {
          setPastEvents(prev => {
            if (prev.some(event => event.id === newEvent.id)) {
              return prev;
            }
            return [...prev, newEvent].sort((a, b) =>
              new Date(b.date_time) - new Date(a.date_time)
            );
          });
        }
      }
    });

    socket.on('event_updated', (updatedEvent) => {
      if (!updatedEvent?.name) return;
      if (updatedEvent.created_by !== user.id) {
        setToast({
          message: `Event "${updatedEvent.name}" has been updated`,
          type: 'info'
        });
        const updateEventInList = (prev) =>
          prev.map(event => event.id === updatedEvent.id ? updatedEvent : event)
            .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));

        if (new Date(updatedEvent.date_time) > new Date()) {
          setUpcomingEvents(prev => updateEventInList(prev));
          setPastEvents(prev => prev.filter(event => event.id !== updatedEvent.id));
        } else {
          setPastEvents(prev => updateEventInList(prev));
          setUpcomingEvents(prev => prev.filter(event => event.id !== updatedEvent.id));
        }
      }
    });

    socket.on('event_deleted', (data) => {
      if (!data?.eventId || !data?.eventName) return;
      setToast({
        message: `Event "${data.eventName}" has been deleted`,
        type: 'info'
      });
      // Update upcoming events
      setUpcomingEvents(prev => {
        const filtered = prev.filter(event => event.id !== data.eventId);
        console.log('Filtered upcoming events:', filtered);
        return filtered;
      });

      // Update past events
      setPastEvents(prev => {
        const filtered = prev.filter(event => event.id !== data.eventId);
        console.log('Filtered past events:', filtered);
        return filtered;
      });
    });

    socket.on('attendee_update', ({ eventId, attendeeCount, eventName, action, userName }) => {
      if (!eventId || !eventName || !action || !userName) return;

      const count = parseInt(attendeeCount, 10);
      if (!isNaN(count) && count >= 0) {
        setAttendeeCounts(prev => ({
          ...prev,
          [eventId]: count
        }));

        if (userName && userName !== user.name) {
          setToast({
            message: `${userName} has ${action} event "${eventName}"`,
            type: 'info'
          });
        }
      }
    });

    // Return cleanup function
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
      const { upcoming = [], past = [], userEvents = [], attendeeCounts = {} } = response.data.data;

      // Set default empty arrays if data is null/undefined
      setUpcomingEvents(Array.isArray(upcoming) ? upcoming : []);
      setPastEvents(Array.isArray(past) ? past : []);
      setUserEvents(Array.isArray(userEvents) ? userEvents.map(event => event.event_id) : []);
      setAttendeeCounts(processCounts(attendeeCounts || {}));

    } catch (error) {
      console.error('Error fetching events:', error);
      setToast({
        message: 'Failed to load events',
        type: 'error'
      });
      // Set empty defaults on error
      setUpcomingEvents([]);
      setPastEvents([]);
      setUserEvents([]);
      setAttendeeCounts({});
    }
  };

  const handleJoinLeave = async (eventId, isJoining) => {
    const socketEvent = isJoining ? 'join_event' : 'leave_event';
    const currentCount = attendeeCounts[eventId] || 0;
    const event = upcomingEvents.find(e => e.id === eventId) || pastEvents.find(e => e.id === eventId);

    setUserEvents(prev =>
      isJoining
        ? [...prev, eventId]
        : prev.filter(id => id !== eventId)
    );

    setAttendeeCounts(prev => ({
      ...prev,
      [eventId]: Math.max(0, currentCount + (isJoining ? 1 : -1))
    }));

    // Show toast for the user performing the action
    setToast({
      message: isJoining
        ? `You have joined "${event.name}"`
        : `You have left "${event.name}"`,
      type: 'success'
    });

    socket.emit(socketEvent, {
      userId: user.id,
      eventId: eventId,
      eventName: event.name,
      userName: user.name
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

  const handleEventCreated = (newEvent) => {
    if (!newEvent) return;

    setToast({
      message: 'Event created successfully!',
      type: 'success'
    });
    if (new Date(newEvent.date_time) > new Date()) {
      setUpcomingEvents(prev => [...prev, newEvent].sort((a, b) =>
        new Date(a.date_time) - new Date(b.date_time)
      ));
    } else {
      setPastEvents(prev => [...prev, newEvent].sort((a, b) =>
        new Date(b.date_time) - new Date(a.date_time)
      ));
    }
  };

  const handleEventUpdated = (updatedEvent) => {
    if (!updatedEvent) return;

    setToast({
      message: 'Event updated successfully!',
      type: 'success'
    });
    const updateEventInList = (prev) =>
      prev.map(event => event.id === updatedEvent.id ? updatedEvent : event)
        .sort((a, b) => new Date(a.date_time) - new Date(b.date_time));

    if (new Date(updatedEvent.date_time) > new Date()) {
      setUpcomingEvents(prev => updateEventInList(prev));
      setPastEvents(prev => prev.filter(event => event.id !== updatedEvent.id));
    } else {
      setPastEvents(prev => updateEventInList(prev));
      setUpcomingEvents(prev => prev.filter(event => event.id !== updatedEvent.id));
    }
  };

  const handleEventDeleted = (eventId) => {
    if (!eventId) return;

    setToast({
      message: 'Event deleted successfully!',
      type: 'success'
    });
    setUpcomingEvents(prev => prev.filter(event => event.id !== eventId));
    setPastEvents(prev => prev.filter(event => event.id !== eventId));
  };

  // Add filtered events getter
  const getFilteredEvents = (events) => {
    return events.filter(event => {
      const eventDate = new Date(event.date_time);

      // Category filter
      if (filters.category && event.category !== filters.category) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start && new Date(filters.dateRange.start) > eventDate) {
        return false;
      }
      if (filters.dateRange.end && new Date(filters.dateRange.end) < eventDate) {
        return false;
      }

      return true;
    });
  };

  // Update the empty state check
  const renderEvents = (events) => {
    if (!Array.isArray(events) || events.length === 0) {
      return (
        <EmptyState
          message={activeTab === 'upcoming' ? "No upcoming events" : "No past events"}
          submessage={activeTab === 'upcoming' ? "Be the first to create an event!" : "Past events will appear here"}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            attendeeCount={attendeeCounts[event.id] || 0}
            isAttending={userEvents.includes(event.id)}
            onEventClick={handleEventClick}
            onJoinLeave={handleJoinLeave}
            isPast={activeTab === 'past'}
            isGuestView={user?.role === 'guest'}
          />
        ))}
      </div>
    );
  };

  // if (upcomingEvents.length === 0 && pastEvents.length === 0) {
  //   return (
  //     <div className="text-center py-8 text-gray-600">
  //       Failed to load events. Please try again later.
  //     </div>
  //   );
  // }

  const isUserAttending = (eventId) => {
    return userEvents.includes(eventId);
  };

  // Add filter components
  const FilterSection = () => (
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              category: e.target.value
            }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Date range filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              dateRange: {
                ...prev.dateRange,
                start: e.target.value
              }
            }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              dateRange: {
                ...prev.dateRange,
                end: e.target.value
              }
            }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Clear filters button */}
      <button
        onClick={() => setFilters({
          category: '',
          dateRange: { start: '', end: '' }
        })}
        className="mt-4 px-4 py-2 text-sm text-purple-600 hover:text-purple-800"
      >
        Clear Filters
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tabs and Create Button */}
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
        {user?.role !== 'guest' && (
          <button
            onClick={() => handleEventClick(null, 'create')}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Event
          </button>
        )}
      </div>

      {/* Add filter section */}
      <FilterSection />

      {/* Events Grid */}
      {renderEvents(activeTab === 'upcoming' ? upcomingEvents : pastEvents)}

      {/* Dialogs */}
      {selectedEvent && dialogType === 'view' && (
        <EventDialog
          event={selectedEvent}
          onClose={handleCloseDialog}
          isAttending={userEvents.includes(selectedEvent.id)}
          attendeeCount={attendeeCounts[selectedEvent.id] || 0}
          onStatusChange={fetchEvents}
          isPast={activeTab === 'past'}
        />
      )}

      {dialogType === 'create' && (
        <EventForm
          onClose={handleCloseDialog}
          mode="create"
          onSuccess={handleEventCreated}
        />
      )}

      {selectedEvent && dialogType === 'update' && (
        <EventForm
          event={selectedEvent}
          onClose={handleCloseDialog}
          mode="update"
          onSuccess={handleEventUpdated}
        />
      )}

      {selectedEvent && dialogType === 'delete' && (
        <DeleteEventDialog
          event={selectedEvent}
          onClose={handleCloseDialog}
          onSuccess={() => handleEventDeleted(selectedEvent.id)}
        />
      )}
    </div>
  );
};

export default Events; 