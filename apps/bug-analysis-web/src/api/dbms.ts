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
  const res: DbmsResponseDto = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/dbms/${dbms_id}`
  )
    .then((res) => res.json())
    .catch(console.log);

  return res;
}

export async function fetchAiSummary(dbms_id: number): Promise<AiSummary> {
  const res: AiSummary = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/dbms/${dbms_id}/ai_summary`
  )
    .then((res) => res.json())
    .catch(console.log);

  return res;
}
