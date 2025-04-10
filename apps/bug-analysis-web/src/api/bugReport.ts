import { Responses } from '~api';
import { BugPriority } from '../utils/types';
import { api } from './client';

export type BugCategoryResponseDto = Responses<'BugCategoryResponseDto'>;
export type BugReport = Responses<'BugReportResponseDto'>;
export type AiSummary = Responses<'AiSummaryResponseDto'>;

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
  const { data, response } = await api.GET('/api/v1/categories/');

  if (!data) {
    console.error('Error fetching bug categories!', response);
    throw new Error('Error fetching bug categories!');
  }
  return data;
}

export async function updateBugCategory(
  bug_id: number,
  category_id: number
): Promise<BugReport> {
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

export async function updateBugPriority(
  bug_id: number,
  priority: BugPriority
): Promise<BugReport> {
  const { data, response } = await api.PATCH(
    '/api/v1/bug_reports/{bug_id}/priority',
    {
      params: { path: { bug_id } },
      body: { priority_level: priority },
    }
  );

  if (!data) {
    console.error('Error updating bug priority!', response);
    throw new Error('Error updating bug priority!');
  }
  return data;
}

export async function fetchBugReportAiSummary(
  bug_id: number
): Promise<AiSummary> {
  const { data, response } = await api.GET(
    '/api/v1/bug_reports/{bug_id}/ai_summary',
    {
      params: { path: { bug_id } },
    }
  );
  if (!response.ok || !data) {
    console.error(
      `Error fetching AI summary for bug report ${bug_id}!`,
      response
    );
    throw new Error(`Error fetching AI summary for bug report ${bug_id}!`);
  }
  return data;
}

export async function updateBugVersionsAffected(
  bug_id: number,
  updatedVersions: string
): Promise<BugReport> {
  const { data, response } = await api.PATCH(
    '/api/v1/bug_reports/{bug_id}/versions_affected',
    {
      params: { path: { bug_id } },
      body: { updated_versions: updatedVersions },
    }
  );

  if (!data) {
    console.error('Error updating versions affected!', response);
    throw new Error('Error updating versions affected!');
  }
  return data;
}
