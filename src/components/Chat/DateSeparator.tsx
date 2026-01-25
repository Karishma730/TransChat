import React from 'react';

interface DateSeparatorProps {
  date: Date;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  const formatDate = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="flex items-center justify-center my-4">
      <div className="bg-white dark:bg-gray-700 px-4 py-1 rounded-full text-sm text-gray-600 dark:text-gray-300 font-medium">
        {formatDate(date)}
      </div>
    </div>
  );
};
