import React from 'react';
import { useAppContext } from '../../utils/context';

const AiSummary: React.FC = () => {
  const { theme } = useAppContext();

  return (
    <div
      className={`w-full rounded-lg p-4 ${theme === 'light' ? 'bg-white' : 'bg-black'}`}
    >
      <img
        src={
          theme === 'dark' ? '/ai_summary_white.png' : '/ai_summary_black.png'
        }
        className="h-[5vh]"
      />
      {/* Text here */}
    </div>
  );
};

export default AiSummary;
