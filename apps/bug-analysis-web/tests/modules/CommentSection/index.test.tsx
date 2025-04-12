import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { CommentSection, CommentSectionProps } from '../../../src/modules';
import { DiscussionResponseDto } from '../../../src/api/discussion';
import { MockAuthProvider } from '../../contexts/MockAuthProvider';

const pushMock = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const { mockFetchDiscussions, mockAddBugReportComment } = vi.hoisted(() => ({
  mockFetchDiscussions: vi.fn(),
  mockAddBugReportComment: vi.fn(),
}));

vi.mock('../../../src/api/discussion', () => ({
  fetchDiscussions: mockFetchDiscussions,
  addBugReportComment: mockAddBugReportComment,
}));

const defaultProps: CommentSectionProps = {
  bugReportId: 1,
};

type RenderComponentOptions = {
  props?: Partial<CommentSectionProps>;
  loggedInUser?: number;
};

const renderComponent = (options: RenderComponentOptions = {}) => {
  const finalProps = { ...defaultProps, ...(options.props || {}) };

  return render(
    <MockAuthProvider loggedInUser={options.loggedInUser}>
      <CommentSection {...finalProps} />
    </MockAuthProvider>
  );
};

const mockDiscussions: DiscussionResponseDto[] = [
  {
    id: 1,
    is_thread: true,
    author: { id: 101, name: 'User One', email: 'user1@example.com' },
    content: 'First comment',
    replies: [],
    created_at: '2023-10-01T10:00:00Z',
    updated_at: '2023-10-01T10:00:00Z',
    is_edited: false,
  },
  {
    id: 2,
    is_thread: true,
    author: { id: 102, name: 'User Two', email: 'user2@example.com' },
    content: 'Second comment',
    replies: [],
    created_at: '2023-10-01T11:00:00Z',
    updated_at: '2023-10-01T11:00:00Z',
    is_edited: false,
  },
];

describe('CommentSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and fetches discussions on mount', async () => {
    mockFetchDiscussions.mockResolvedValue(mockDiscussions);
    const { getByText } = renderComponent();

    expect(getByText('Comments')).toBeInTheDocument();
    expect(mockFetchDiscussions).toHaveBeenCalledWith(defaultProps.bugReportId);

    await waitFor(() => {
      expect(getByText('First comment')).toBeInTheDocument();
      expect(getByText('Second comment')).toBeInTheDocument();
    });
  });

  it('posts a new comment successfully', async () => {
    mockFetchDiscussions.mockResolvedValue(mockDiscussions);
    const newCommentText = 'New test comment';
    const newCommentDto: DiscussionResponseDto = {
      id: 3,
      is_thread: true,
      author: { id: 123, name: 'Logged In User', email: 'test@example.com' },
      content: newCommentText,
      replies: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_edited: false,
    };
    mockAddBugReportComment.mockResolvedValue(newCommentDto);

    const {
      getByText,
      getByRole,
      queryByRole,
      findByText,
      getByPlaceholderText,
    } = renderComponent({
      loggedInUser: 123,
    });
    await findByText('First comment');

    const addButton = getByRole('button', { name: /add a comment/i });
    fireEvent.click(addButton);
    await findByText('Add a Comment');

    const textArea = getByPlaceholderText('Write your comment here...');
    fireEvent.change(textArea, { target: { value: newCommentText } });
    const submitButton = getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    expect(mockAddBugReportComment).toHaveBeenCalledWith(
      defaultProps.bugReportId,
      newCommentText,
      123
    );

    await waitFor(() => {
      expect(queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(
      getByText(newCommentText, { selector: 'div.ant-typography' })
    ).toBeInTheDocument();
  });
});
