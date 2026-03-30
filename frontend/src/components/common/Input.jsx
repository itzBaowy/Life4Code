import React from 'react';

/**
 * Input component chuẩn hóa cho toàn dự án
 * @param {Object} props
 */
export default function Input({ id, name, type = 'text', value, onChange, onBlur, placeholder, error, ...rest }) {
  return (
    <div className="mb-2">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${error ? 'border-red-500' : 'border-gray-300'}`}
        {...rest}
      />
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
}
