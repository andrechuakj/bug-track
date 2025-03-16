import { components } from '../../../api/client/api';

export type DbmsResponseDto = components['schemas']['DbmsResponseDto'];
export type BugCategory = components['schemas']['BugCategory'];
export type AiSummary = components['schemas']['AiSummaryResponseDto'];
export type BugReports = components['schemas']['BugSearchResponseDto'];
export type BugExploreReports =
  components['schemas']['BugSearchCategoryResponseDto'];

const getBaseUrl = () => {
  return `${process.env.NEXT_PUBLIC_API_URL}/api/v1/dbms`;
};

export async function fetchDbmsData(dbms_id: number): Promise<DbmsResponseDto> {
  const res: DbmsResponseDto = await fetch(`${getBaseUrl()}/${dbms_id}`)
    .then((res) => res.json())
    .catch(console.log);

  return res;
}

export async function fetchAiSummary(dbms_id: number): Promise<AiSummary> {
  const res: AiSummary = await fetch(`${getBaseUrl()}/${dbms_id}/ai_summary`)
    .then((res) => res.json())
    .catch(console.log);

  return res;
}

export async function searchBugReports(
  dbms_id: number,
  search: string,
  start: number = 0,
  limit: number = 0
): Promise<BugReports> {
  const url = new URL(`${getBaseUrl()}/${dbms_id}/bug_search`);
  const params: Record<string, string> = {
    search,
    start: String(start),
    limit: String(limit),
  };

  Object.keys(params).forEach((ky: string) => {
    url.searchParams.append(ky, params[ky]);
  });

  const res: BugReports = await fetch(url, { method: 'GET' })
    .then((res) => res.json())
    .catch(console.log);

  return res;
}

export async function loadMoreBugsByCategory(
  dbms_id: number,
  category_id: number,
  distribution: number[],
  amount: number = 5
): Promise<BugExploreReports> {
  const url = new URL(`${getBaseUrl()}/${dbms_id}/bug_search_category`);
  const params: Record<string, string> = {
    category_id: String(category_id),
    amount: String(amount),
    distribution: distribution.join(','),
  };

  Object.keys(params).forEach((ky: string) => {
    url.searchParams.append(ky, params[ky]);
  });

  const res: BugExploreReports = await fetch(url, { method: 'GET' })
    .then((res) => res.json())
    .catch(console.log);

  return res;
}
