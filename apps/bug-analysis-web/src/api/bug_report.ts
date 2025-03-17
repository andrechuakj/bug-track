import { components } from '../../../api/client/api';

export type BugCategoryResponseDto =
  components['schemas']['BugCategoryResponseDto'];

const getBaseUrl = () => {
  return `${process.env.NEXT_PUBLIC_API_URL}/api/v1/category`;
};

export async function fetchAllCategories(): Promise<BugCategoryResponseDto> {
  const res: BugCategoryResponseDto = await fetch(`${getBaseUrl()}/`)
    .then((res) => res.json())
    .catch(console.log);

  return res;
}
