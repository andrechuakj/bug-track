import { Responses } from '~api';
import { api } from './client';

export type DbmsListResponseDto = Responses<'DbmsListResponseDto'>;
export type DbmsResponseDto = Responses<'DbmsResponseDto'>;
export type BugCategory = Responses<'BugCategoryResponseDto'>;
export type AiSummary = Responses<'AiSummaryResponseDto'>;
export type BugReports = Responses<'BugSearchResponseDto'>;
export type BugExploreReports = Responses<'BugSearchCategoryResponseDto'>;

export async function fetchDbmsList(): Promise<DbmsListResponseDto[]> {
  const { data, response } = await api.GET('/api/v1/dbms/');
  if (!data) {
    console.error('Error fetching DBMS list!', response);
    throw new Error('Error fetching DBMS list!');
  }
  return data;
}

export async function fetchDbmsData(dbms_id: number): Promise<DbmsResponseDto> {
  const { data, response } = await api.GET('/api/v1/dbms/{dbms_id}', {
    params: { path: { dbms_id } },
  });
  if (!data) {
    console.error('Error fetching DBMS data!', response);
    throw new Error('Error fetching DBMS data!');
  }
  return data;
}

export async function fetchAiSummary(dbms_id: number): Promise<AiSummary> {
  const { data, response } = await api.GET(
    '/api/v1/dbms/{dbms_id}/ai_summary',
    {
      params: { path: { dbms_id } },
    }
  );
  if (!data) {
    console.error('Error fetching AI summary!', response);
    throw new Error('Error fetching AI summary!');
  }
  return data;
}

export async function searchBugReports(
  dbms_id: number,
  search: string,
  start: number = 0,
  limit: number = 10,
  category_id?: number
): Promise<BugReports> {
  const { data, response } = await api.GET(
    '/api/v1/dbms/{dbms_id}/bug_search',
    {
      params: {
        path: { dbms_id },
        query: { search, start, limit, category_id },
      },
    }
  );
  if (!data) {
    console.error('Error fetching bug reports!', response);
    throw new Error('Error fetching bug reports!');
  }
  return data;
}

export async function loadMoreBugsByCategory(
  dbms_id: number,
  category_id: number,
  distribution: number[],
  amount: number = 5
): Promise<BugExploreReports> {
  const { data, response } = await api.GET(
    '/api/v1/dbms/{dbms_id}/bug_search_category',
    {
      params: {
        path: { dbms_id },
        query: { category_id, amount, distribution: distribution.join(',') },
      },
    }
  );
  if (!data) {
    console.error('Error fetching bug reports by category!', response);
    throw new Error('Error fetching bug reports by category!');
  }
  return data;
}
export async function fetchBugTrend(
  dbms_id: number,
  days: number = 30
): Promise<number[]> {
  const { data, response } = await api.GET('/api/v1/dbms/{dbms_id}/bug_trend', {
    params: {
      path: { dbms_id },
      query: { days },
    },
  });
  if (!data) {
    console.error('Error fetching bug trend!', response);
    throw new Error('Error fetching bug trend!');
  }
  return data;
}
