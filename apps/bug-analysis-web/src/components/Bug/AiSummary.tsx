import { Skeleton } from 'antd';
import React from 'react';
import { useAppContext } from '../../utils/context';

const AiSummary: React.FC = () => {
  const { theme } = useAppContext();

  const summary = false;

  return (
    <div
      className={`w-full rounded-lg p-4 ${theme === 'light' ? 'bg-white' : 'bg-black'}`}
    >
      <img
        src={
          theme === 'dark' ? '/ai_summary_white.png' : '/ai_summary_black.png'
        }
        className="h-[6vh]"
      />
      <div className="px-3 pb-4">
        {summary ? (
          <></>
        ) : (
          <Skeleton active paragraph={{ rows: 4 }} title={false} />
        )}
      </div>
    </div>
  );
};

export default AiSummary;
