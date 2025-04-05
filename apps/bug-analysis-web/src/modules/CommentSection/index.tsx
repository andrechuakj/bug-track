import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Input,
  message,
  Modal,
  Skeleton,
  Typography,
} from 'antd';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import {
  addBugReportComment,
  DiscussionResponseDto,
  fetchDiscussions,
} from '../../api/discussion';
import Thread from '../../components/Thread';
import { useAuth } from '../../contexts/AuthContext';

interface CommentSectionProps {
  bugReportId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ bugReportId }) => {
  // Get discussions
  const [discussions, setDiscussions] = useState<DiscussionResponseDto[]>([]);
  const [isFetchingDiscussions, setIsFetchingDiscussions] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth
  const { loggedInUser } = useAuth();
  const router = useRouter();

  // Toast
  const [messageApi, contextHolder] = message.useMessage();

  // Ref for the newly added thread (scroll & highlight behaviour)
  const newThreadRef = useRef<HTMLDivElement | null>(null);

  const fetchComments = () => {
    setIsFetchingDiscussions(true);
    fetchDiscussions(bugReportId)
      .then((data) => {
        setDiscussions(data);
        setIsFetchingDiscussions(false);
      })
      .catch((error) => {
        console.error('Error fetching discussions:', error);
        setIsFetchingDiscussions(false);
      });
  };

  useEffect(() => {
    fetchComments();
  }, [bugReportId]);

  const handleAddCommentClick = () => {
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
      messageApi.error('Please login and try again');
      setIsSubmitting(false);
      setIsModalVisible(false);
      return;
    }

    addBugReportComment(bugReportId, newComment, userId)
      .then((newDiscussion) => {
        setDiscussions((prevDiscussions) => [
          ...prevDiscussions,
          newDiscussion,
        ]);
        setNewComment('');
        setIsModalVisible(false);

        setTimeout(() => {
          if (newThreadRef.current) {
            newThreadRef.current.scrollIntoView({ behavior: 'smooth' });
            newThreadRef.current.classList.add('highlight-border');
            setTimeout(() => {
              newThreadRef.current?.classList.remove('highlight-border');
            }, 4000);
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

  const addComment = (
    <span
      className="text-blue-500 cursor-pointer ml-2 flex gap-2 mt-3"
      onClick={handleAddCommentClick}
    >
      <PlusOutlined />
      <span>Add a comment</span>
    </span>
  );

  return (
    <Card>
      <div className="flex justify-between">
        <Typography.Title level={3} className="mb-4">
          Comments
        </Typography.Title>
        <div className="flex items-center">
          <Button type="link" onClick={handleAddCommentClick}>
            Add a comment
          </Button>
          <Button type="link" onClick={fetchComments}>
            Refresh
          </Button>
        </div>
      </div>

      {contextHolder}
      {isFetchingDiscussions && <Skeleton active />}

      {!isFetchingDiscussions &&
        (discussions.length > 0 ? (
          <>
            {discussions.map((discussion, index) => (
              <div
                key={discussion.id}
                ref={index === discussions.length - 1 ? newThreadRef : null}
              >
                <Thread
                  discussion={discussion}
                  isLast={index === discussions.length - 1}
                />
              </div>
            ))}
            {addComment}
          </>
        ) : (
          <>
            <p className="mb-4">No discussions available.</p>
            {addComment}
          </>
        ))}

      <Modal
        title="Add a Comment"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={isSubmitting}
        okText="Submit"
        cancelText="Cancel"
      >
        <Input.TextArea
          rows={4}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your comment here..."
        />
      </Modal>
    </Card>
  );
};

export default CommentSection;
