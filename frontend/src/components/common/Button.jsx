import React from 'react';

/**
 * Button component chuẩn hóa cho toàn dự án
 * @param {Object} props
 */
export default function Button({ children, className = '', ...rest }) {
  return (
    <button
      className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
