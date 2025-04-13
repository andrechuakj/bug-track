import { render, RenderResult, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BugReportPageWrapper from '../../../src/pages/bug/[id]';
import { expectComponentCalledWithPropsContaining } from '../../MockFnAssertUtils';

const {
  mockBugHeader,
  mockBugContentContainer,
  mockBugSideBar,
  mockCommentSection,
} = vi.hoisted(() => ({
  mockBugHeader: vi.fn(() => <div data-testid="mock-bug-header" />),
  mockBugContentContainer: vi.fn(() => (
    <div data-testid="mock-bug-content-container" />
  )),
  mockBugSideBar: vi.fn(() => <div data-testid="mock-bug-sidebar" />),
  mockCommentSection: vi.fn(() => <div data-testid="mock-comment-section" />),
}));

vi.mock('../../../src/components/Bug/BugHeader', () => ({
  default: mockBugHeader,
}));
vi.mock('../../../src/components/Bug/BugContentContainer', () => ({
  default: mockBugContentContainer,
}));
vi.mock('../../../src/components/Bug/BugSideBar', () => ({
  default: mockBugSideBar,
}));
vi.mock('../../../src/modules/CommentSection', () => ({
  CommentSection: mockCommentSection,
}));

const { mockFetchBugById } = vi.hoisted(() => ({
  mockFetchBugById: vi.fn(),
}));
vi.mock('../../../src/api/bugReport', () => ({
  fetchBugById: mockFetchBugById,
}));

const mockRouterPush = vi.fn();
const mockRouterQuery = vi.hoisted<Record<string, string | undefined>>(() => ({
  id: undefined,
}));
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    query: mockRouterQuery,
  }),
}));

type RenderPageOptions = {
  id?: string;
};

const renderPage = (options: RenderPageOptions = {}): RenderResult => {
  mockRouterQuery.id = options.id;

  return render(<BugReportPageWrapper />);
};

describe('BugReportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouterQuery.id = undefined;
  });

  it('does not fetch or render comments with non-numeric id', () => {
    renderPage({ id: undefined });

    expect(mockFetchBugById).not.toHaveBeenCalled();
    expect(mockBugHeader).toHaveBeenCalled();
    expect(mockBugContentContainer).toHaveBeenCalled();
    expect(mockBugSideBar).toHaveBeenCalled();
    expect(mockCommentSection).not.toHaveBeenCalled();
  });

  it('fetches data and renders with numeric id', async () => {
    const testId = 123;
    renderPage({ id: testId.toString() });

    await waitFor(() => {
      expect(mockFetchBugById).toHaveBeenCalledWith(Number(testId));
    });

    expect(mockBugHeader).toHaveBeenCalled();
    expect(mockBugContentContainer).toHaveBeenCalled();
    expect(mockBugSideBar).toHaveBeenCalled();

    await waitFor(() => {
      expectComponentCalledWithPropsContaining(mockCommentSection, {
        bugReportId: testId,
      });
    });
  });
});
