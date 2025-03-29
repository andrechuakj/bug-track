import { Collapse, Skeleton, Typography } from 'antd';
import React from 'react';

const AiSummary: React.FC = () => {
  const summary = false;

  return (
    <Collapse
      expandIconPosition="end"
      items={[
        {
          key: '1',
          label: <Typography.Text>✨AI Summary</Typography.Text>,
          children: summary ? (
            <></>
          ) : (
            <Skeleton active paragraph={{ rows: 4 }} title={false} />
          ),
        },
      ]}
    />
  );
};

export default AiSummary;
