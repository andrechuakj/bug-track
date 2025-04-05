import { components } from '../../../api/client/api';
import { api } from './client';

export type DiscussionResponseDto =
  components['schemas']['DiscussionResponseDto'];
export type DiscussionReplyResponseDto =
  components['schemas']['DiscussionReplyResponseDto'];
export type CreateDiscussionRequestDto =
  components['schemas']['CreateDiscussionRequestDto'];

export async function fetchDiscussions(
  bug_report_id: number
): Promise<DiscussionResponseDto[]> {
  const { data, response } = await api.GET('/api/v1/discussions/', {
    params: { query: { bug_report_id } },
  });
  if (!data) {
    console.error('Error fetching discussions!', response);
    throw new Error('Error fetching discussions!');
  }
  return data;
}

export async function fetchDiscussion(
  id: number
): Promise<DiscussionResponseDto> {
  const { data, response } = await api.GET('/api/v1/discussions/{id}', {
    params: { path: { id } },
  });
  if (!data) {
    console.error('Error fetching discussion!', response);
    throw new Error('Error fetching discussion!');
  }
  return data;
}

export async function addBugReportComment(
  bug_report_id: number,
  content: string,
  author_id: number
): Promise<DiscussionResponseDto> {
  const { data, response } = await api.POST('/api/v1/discussions/', {
    body: {
      bug_report_id,
      content,
      author_id,
    },
  });
  if (!data) {
    console.error('Error adding bug report comment!', response);
    throw new Error('Error adding bug report comment!');
  }
  return data;
}

export async function addDiscussionReply(
  discussion_id: number,
  content: string,
  author_id: number
): Promise<DiscussionReplyResponseDto> {
  const { data, response } = await api.POST('/api/v1/discussions/{id}/reply', {
    params: { path: { id: discussion_id } },
    body: {
      content,
      author_id,
    },
  });
  if (!data) {
    console.error('Error adding discussion reply!', response);
    throw new Error('Error adding discussion reply!');
  }
  return data;
}
