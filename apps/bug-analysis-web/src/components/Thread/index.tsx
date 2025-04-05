import { ReloadOutlined } from '@ant-design/icons';
import { Card, Divider, Skeleton } from 'antd';
import React, { useState } from 'react';
import {
  DiscussionReplyResponseDto,
  DiscussionResponseDto,
  fetchDiscussion,
} from '../../api/discussion';
import Comment from '../Comment';

interface ThreadProps {
  discussion: DiscussionResponseDto;
}

const Thread: React.FC<ThreadProps> = ({ discussion: ogDiscussion }) => {
  // Fetch thread discussion
  const [discussion, setDiscussion] =
    useState<DiscussionResponseDto>(ogDiscussion);
  const [isLoading, setIsLoading] = useState(false);

  const refreshThread = () => {
    setIsLoading(true);
    fetchDiscussion(discussion.id).then((data) => {
      setDiscussion(data);
      setIsLoading(false);
    });
  };

  const renderComments = (
    replies: DiscussionReplyResponseDto[],
    level: number = 0
  ) => {
    return replies.map((reply) => (
      <div key={reply.id} style={{ marginLeft: level * 20 }}>
        <Comment
          idx={reply.id}
          content={reply.content}
          name={reply.author?.name}
          timestamp={reply.created_at}
        />
      </div>
    ));
  };

  return (
    <Card className="mb-3">
      {isLoading && <Skeleton active />}
      {!isLoading && (
        <>
          {
            <Comment
              idx={discussion.id}
              content={discussion.content}
              name={discussion.author?.name}
              timestamp={discussion.created_at}
            />
          }
          {discussion.replies.length > 0 && <Divider />}
          {renderComments(discussion.replies, 1)}
          {
            <div className="flex justify-end">
              <ReloadOutlined onClick={refreshThread} />
            </div>
          }
        </>
      )}
    </Card>
  );
};

export default Thread;
