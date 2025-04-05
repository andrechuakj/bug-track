import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { DbmsListResponseDto, fetchDbmsList } from '../api/dbms';
import { useAuth } from './AuthContext';

type SessionContext = {
  tenantList: DbmsListResponseDto[];
  currentTenant: DbmsListResponseDto | undefined;
  refreshTenants: () => void;
  setCurrentTenant: (tenantId: number) => void;
};

const SessionContext = createContext<SessionContext | undefined>(undefined);

export const useSession = (): SessionContext => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

const SessionProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [tenantList, setTenantList] = useState<DbmsListResponseDto[]>([]);

  const { isAuthenticated } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<
    DbmsListResponseDto | undefined
  >(undefined);
  useEffect(() => {
    if (!isAuthenticated) {
      setTenantList([]);
      setCurrentTenant(undefined);
      return;
    }
    fetchDbmsList().then((data) => {
      setTenantList(data);
      // React 18+ batches state updates automatically,
      // so this is safe to do
      if (data.length > 0) {
        setCurrentTenant(data[0]);
      }
    });
  }, [isAuthenticated]);

  const refreshTenants = useCallback(() => {
    fetchDbmsList().then((data) => {
      setTenantList(data);
      if (data.length == 0) {
        setCurrentTenant(undefined);
        return;
      }
      if (currentTenant && !data.find((t) => t.id === currentTenant.id)) {
        // Reset tenant to first if current tenant disappears (e.g. deleted)
        setCurrentTenant(data[0]);
      }
    });
  }, [currentTenant]);

  const setCurrentTenantId = useCallback(
    (tenantId: number) => {
      const tenant = tenantList.find((t) => t.id === tenantId);
      if (!tenant) {
        console.error('Tenant not found:', tenantId);
        return;
      }
      setCurrentTenant(tenant);
    },
    [tenantList]
  );

  return (
    <SessionContext.Provider
      value={{
        tenantList,
        currentTenant,
        refreshTenants,
        setCurrentTenant: setCurrentTenantId,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;
