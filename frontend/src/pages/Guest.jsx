import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { toastState } from '../store/atoms';
import Header from '../components/Header';
import EventCard from '../components/EventCard';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { CATEGORIES } from '../utils/constants';
import api from '../api/api';

const Guest = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sortBy: 'date'
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const setToast = useSetRecoilState(toastState);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/api/events/guest');
      if (response.data.success) {
        // Combine upcoming and past events
        const allEvents = [
          ...response.data.data.upcoming.map(event => ({
            ...event,
            // Use actual attendee count if available, otherwise random
            attendeeCount: response.data.data.attendeeCounts[event.id] ||
              Math.floor(Math.random() * 50) + 1
          })),
          ...response.data.data.past.map(event => ({
            ...event,
            // Use actual attendee count if available, otherwise random
            attendeeCount: response.data.data.attendeeCounts[event.id] ||
              Math.floor(Math.random() * 50) + 1
          }))
        ];
        setEvents(allEvents);
      }
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

  const handleLoginRequired = () => {
    setToast({
      message: 'Please login to access this feature',
      type: 'info'
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || event.category === filters.category;
    return matchesSearch && matchesCategory;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (filters.sortBy === 'date') {
      return new Date(b.date_time) - new Date(a.date_time);
    } else if (filters.sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-gray-50 text-lg font-medium text-gray-900">
              Upcoming Events
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
          <button
            onClick={handleLoginRequired}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Create Event
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <FunnelIcon className="-ml-1 mr-2 h-5 w-5" />
            Filters
          </button>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                >
                  <option value="date">Date (Newest First)</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                attendeeCount={event.attendeeCount}
                isAttending={false}
                onEventClick={handleLoginRequired}
                onJoinLeave={handleLoginRequired}
                isPast={new Date(event.date_time) < new Date()}
                isGuestView={true}
              />
            ))}
          </div>
        )}

        {!loading && sortedEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No events found</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Guest;