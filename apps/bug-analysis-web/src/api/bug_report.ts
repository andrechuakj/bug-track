import { components } from '../../../api/client/api';

export type BugCategoryResponseDto =
  components['schemas']['BugCategoryResponseDto'];
export type BugReport = components['schemas']['BugReportResponseDto'];

const getBaseUrl = () => {
  return `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;
};

export async function fetchBugById(bug_id: number): Promise<BugReport> {
  const url: string = `${getBaseUrl()}/bug/${bug_id}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        `Failed to fetch bug: ${res.status} ${res.statusText} - ${errorData?.detail || ''}`
      );
    }

    const data: BugReport = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching bug:', error);
    throw error;
  }
}

export async function fetchAllCategories(): Promise<BugCategoryResponseDto[]> {
  const url: string = `${getBaseUrl()}/category/`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        `Failed to fetch categories: ${res.status} ${res.statusText} - ${errorData?.detail || ''}`
      );
    }

    const data: BugCategoryResponseDto[] = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function updateBugCategory(bug_id: number, category_id: number) {
  const url: string = `${getBaseUrl()}/bug/${bug_id}/category`;
  const request = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ category_id }),
  };

  try {
    const res = await fetch(url, request);

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        `Failed to update category: ${res.status} ${res.statusText} - ${errorData?.detail || ''}`
      );
    }

    const data: BugReport = await res.json();
    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}
