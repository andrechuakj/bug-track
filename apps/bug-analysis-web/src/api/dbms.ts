import { components } from '../../../api/client/api';

export type DbmsResponseDto = components['schemas']['DbmsResponseDto'];
export type BugCategory = components['schemas']['BugCategory'];

export async function fetchDbmsData(dbms_id: number): Promise<DbmsResponseDto> {
  const res: DbmsResponseDto = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/dbms/${dbms_id}`
  )
    .then((res) => res.json())
    .catch(console.log);

  return res;
}
