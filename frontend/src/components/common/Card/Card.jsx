import React from 'react';
import PropTypes from 'prop-types';

const Card = ({ 
  children, 
  title, 
  subtitle,
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`
        bg-white rounded-lg shadow-md p-4 mb-4
        ${onClick ? 'cursor-pointer transform transition-transform duration-200 hover:-translate-y-1' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : 'article'}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 m-0">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600 m-0">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="text-gray-800">
        {children}
      </div>
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default Card; 