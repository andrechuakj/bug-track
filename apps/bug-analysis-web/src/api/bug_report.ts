import { components } from '../../../api/client/api';

export type BugCategoryResponseDto =
  components['schemas']['BugCategoryResponseDto'];
export type BugReportResponseDto =
  components['schemas']['BugReportResponseDto'];

const getBaseUrl = () => {
  return `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;
};

export async function fetchAllCategories(): Promise<BugCategoryResponseDto> {
  const res: BugCategoryResponseDto = await fetch(`${getBaseUrl()}/category/`)
    .then((res) => res.json())
    .catch(console.log);

  return res;
}

export async function updateBugCategory(bug_id: number, category_id: number) {
  const url = `${getBaseUrl()}/bug/${bug_id}/category`;
  const request = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ category_id }),
  };
  const res: BugReportResponseDto = await fetch(url, request)
    .then((res) => res.json())
    .catch(console.log);

  return res;
}
