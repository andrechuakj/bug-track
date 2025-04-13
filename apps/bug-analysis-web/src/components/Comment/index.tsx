import { Avatar, Typography } from 'antd';
import React from 'react';
import { formatDate } from '../../utils/dateUtils';
import { BugTrackColorsArr } from '../../utils/theme';

export interface CommentProps {
  name: string;
  content: string;
  timestamp: string;
  idx: number;
}

const Comment: React.FC<CommentProps> = ({ name, content, timestamp, idx }) => {
  const getInitials = (name: string) => {
    if (typeof name !== 'string') {
      return '??';
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <div
        style={{
          marginBottom: '8px',
          borderRadius: '8px',
        }}
      >
        <div className="flex items-center">
          <Avatar
            style={{
              backgroundColor:
                BugTrackColorsArr[idx % BugTrackColorsArr.length],
              marginRight: '12px',
              flexShrink: 0,
              marginBottom: '15px',
            }}
          >
            {getInitials(name)}
          </Avatar>
          <div className="flex-1">
            <Typography.Text strong>{name}</Typography.Text>
            <Typography.Paragraph className="m-0">
              {content}
            </Typography.Paragraph>
          </div>
        </div>
      </div>
      <Typography.Text type="secondary">
        {formatDate(timestamp)}
      </Typography.Text>
    </>
  );
};

export default Comment;
