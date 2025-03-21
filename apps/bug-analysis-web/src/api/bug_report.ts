import { components } from '../../../api/client/api';
import { api } from './client';

export type BugCategoryResponseDto =
  components['schemas']['BugCategoryResponseDto'];
export type BugReport = components['schemas']['BugReportResponseDto'];

export async function fetchBugById(bug_id: number): Promise<BugReport> {
  const { data, response } = await api.GET('/api/v1/bug_reports/{bug_id}', {
    params: { path: { bug_id } },
  });

  if (!data) {
    console.error('Error fetching bug report!', response);
    throw new Error('Error fetching bug report!');
  }
  return data;
}

export async function fetchAllCategories(): Promise<BugCategoryResponseDto[]> {
  const { data, response } = await api.GET('/api/v1/categories');

  if (!data) {
    console.error('Error fetching bug categories!', response);
    throw new Error('Error fetching bug categories!');
  }
  return data;
}

export async function updateBugCategory(bug_id: number, category_id: number) {
  const { data, response } = await api.PATCH(
    '/api/v1/bug_reports/{bug_id}/category',
    {
      params: { path: { bug_id } },
      body: { category_id },
    }
  );

  if (!data) {
    console.error('Error updating bug category!', response);
    throw new Error('Error updating bug category!');
  }
  return data;
}
