import { ReloadOutlined } from '@ant-design/icons';
import { Card, Divider, Input, message, Modal, Skeleton } from 'antd';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import React, { useRef, useState } from 'react';
import {
  addDiscussionReply,
  DiscussionReplyResponseDto,
  DiscussionResponseDto,
  fetchDiscussion,
} from '../../api/discussion';
import { useAuth } from '../../contexts/AuthContext';
import Comment from '../Comment';

interface ThreadProps {
  discussion: DiscussionResponseDto;
  isLast: boolean;
}

const Thread: React.FC<ThreadProps> = ({
  discussion: ogDiscussion,
  isLast,
}) => {
  // Fetch thread discussion
  const [discussion, setDiscussion] =
    useState<DiscussionResponseDto>(ogDiscussion);
  const [isLoading, setIsLoading] = useState(false);

  // Add reply modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRepliesVisible, setIsRepliesVisible] = useState(true);
  const { loggedInUser } = useAuth();
  const router = useRouter();

  // To locate the newly added reply
  const newReplyRef = useRef<HTMLDivElement | null>(null);

  const handleAddCommentClick = () => {
    setIsRepliesVisible(true);
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    let userId = loggedInUser;

    if (!loggedInUser) {
      const savedUserId = localStorage.getItem('userId');
      if (!savedUserId || isNaN(parseInt(savedUserId))) {
        router.push('/login');
        messageApi.error(
          'You have been logged out. Please log in to add a comment.'
        );
        setIsSubmitting(false);
        return;
      }
      userId = parseInt(savedUserId);
    }

    if (!userId) {
      message.error('Please login and try again');
      setIsSubmitting(false);
      setIsModalVisible(false);
      return;
    }

    addDiscussionReply(discussion.id, newComment, userId)
      .then((newReply) => {
        setDiscussion((prev) => ({
          ...prev,
          replies: [...prev.replies, newReply],
        }));
        setNewComment('');
        setIsModalVisible(false);

        setTimeout(() => {
          if (newReplyRef.current) {
            newReplyRef.current.classList.add('highlight');
            setTimeout(() => {
              newReplyRef.current?.classList.remove('highlight');
            }, 4000);

            newReplyRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }
        }, 100);
      })
      .catch((error) => {
        console.error('Error adding comment:', error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setNewComment('');
  };

  const refreshThread = () => {
    setIsLoading(true);
    fetchDiscussion(discussion.id)
      .then((data) => {
        setDiscussion(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error refreshing thread:', error);
        setIsLoading(false);
      });
  };

  const renderComments = (
    replies: DiscussionReplyResponseDto[],
    level: number = 0
  ) => {
    return replies.map((reply, index) => (
      <div
        key={reply.id}
        ref={index === replies.length - 1 ? newReplyRef : null}
        style={{ marginLeft: level * 20 }}
        className="mb-5"
      >
        <Comment
          idx={reply.id}
          content={reply.content}
          name={reply.author?.name}
          timestamp={reply.created_at}
        />
      </div>
    ));
  };

  const toggleRepliesVisibility = () => {
    setIsRepliesVisible((prev) => !prev);
  };

  const [messageApi, contextHolder] = message.useMessage();

  return (
    <Card className={!isLast ? 'mb-3' : ''}>
      {contextHolder}
      {isLoading && <Skeleton active />}
      {!isLoading && (
        <>
          <Comment
            idx={discussion.id}
            content={discussion.content}
            name={discussion.author?.name}
            timestamp={discussion.created_at}
          />
          {discussion.replies.length > 0 && (
            <>
              <Divider />
              <div
                className="cursor-pointer text-blue-500 mb-3"
                onClick={toggleRepliesVisibility}
              >
                {isRepliesVisible ? 'Hide Replies' : 'Show Replies'}
              </div>
              <div
                style={{
                  maxHeight: isRepliesVisible ? '1000px' : '0',
                  overflow: 'scroll',
                  transition: 'max-height 0.3s ease',
                }}
              >
                {renderComments(discussion.replies, 1)}
              </div>
            </>
          )}
          <div className="flex justify-between mt-4">
            <span
              className={clsx(
                'text-blue-500 cursor-pointer flex gap-2',
                discussion.replies.length > 0 && isRepliesVisible ? 'ml-5' : ''
              )}
              onClick={handleAddCommentClick}
            >
              Add a reply
            </span>
            <ReloadOutlined onClick={refreshThread} />
          </div>
          <Modal
            title="Add a reply"
            visible={isModalVisible}
            onOk={handleModalOk}
            onCancel={handleModalCancel}
            confirmLoading={isSubmitting}
            okText="Add Reply"
            cancelText="Cancel"
          >
            <Input.TextArea
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment here..."
            />
          </Modal>
        </>
      )}
    </Card>
  );
};

export default Thread;
