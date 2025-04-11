import { vi } from 'vitest';
import { DbmsListResponseDto, DbmsResponseDto } from '../../src/api/dbms';
import { ReactNode, useState } from 'react';
import { SessionContext } from '../../src/contexts/SessionContext';

export const mockTenantA: DbmsListResponseDto = {
  id: 0,
  name: 'Tenant A',
};

export const mockTenantAData: DbmsResponseDto = {
  id: 0,
  name: 'Tenant A',
  bug_count: 42,
  bug_categories: [
    { category: 'UI', count: 20 },
    { category: 'Backend', count: 22 },
  ],
};

export const mockTenantB: DbmsListResponseDto = {
  id: 1,
  name: 'Tenant B',
};

const defaultTenantList: DbmsListResponseDto[] = [mockTenantA, mockTenantB];
const defaultRefreshTenants = vi.fn();
const defaultSetCurrentTenant = vi.fn();

type MockSessionProviderProps = {
  children: ReactNode;
  tenantList?: DbmsListResponseDto[];
  currentTenant?: DbmsListResponseDto;
  refreshedTenants?: DbmsListResponseDto[];
};

export const MockSessionProvider: React.FC<MockSessionProviderProps> = ({
  children,
  tenantList,
  currentTenant,
  refreshedTenants,
}) => {
  const [list, setList] = useState<DbmsListResponseDto[]>(
    tenantList || defaultTenantList
  );
  const [current, setCurrent] = useState<DbmsListResponseDto | undefined>(
    currentTenant
  );

  defaultRefreshTenants.mockImplementation(() => {
    if (refreshedTenants) {
      setList(refreshedTenants);
    } else {
      setList(defaultTenantList);
    }
  });
  defaultSetCurrentTenant.mockImplementation((id) => {
    const tenant = tenantList?.find((t) => t.id === id);
    if (!tenant) {
      console.error('Tenant not found:', id);
      return;
    }
    setCurrent(tenant);
  });

  return (
    <SessionContext.Provider
      value={{
        tenantList: list,
        currentTenant: current,
        refreshTenants: defaultRefreshTenants,
        setCurrentTenant: defaultSetCurrentTenant,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
