import PropTypes from 'prop-types';
import { CalendarIcon } from '@heroicons/react/24/outline';

const EmptyState = ({ message, submessage }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-purple-100 p-4 rounded-full mb-4">
        <CalendarIcon className="w-8 h-8 text-purple-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{message}</h3>
      {submessage && <p className="text-sm text-gray-500">{submessage}</p>}
    </div>
  );
};

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
  submessage: PropTypes.string
};

export default EmptyState; 