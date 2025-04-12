import React, { ReactNode } from 'react';
import { vi } from 'vitest';
import { BugReport } from '../../src/api/bugReport';
import {
  BugReportContext,
  BugReportContextType,
} from '../../src/contexts/BugReportContext';

export const mockBugReportData = {
  id: 123,
  dbms_id: 1,
  dbms: 'PostgreSQL',
  category_id: 2,
  category: 'Performance',
  title: 'Mock Bug: Slow query on user table',
  description: 'The query to fetch user profiles takes longer than 5 seconds.',
  url: 'https://github.com/issues/123',
  issue_created_at: new Date('2024-01-15T10:00:00Z').toISOString(),
  issue_updated_at: new Date('2024-01-16T11:30:00Z').toISOString(),
  issue_closed_at: null,
  is_closed: false,
  priority: 'Low',
} satisfies BugReport;

export const defaultSetBugReport = vi.fn();
export const defaultFetchBugReport = vi.fn();

type MockBugReportProviderProps = {
  children: ReactNode;
  bugReport?: BugReport | null;
  setBugReport?: (bugReport: BugReport) => void;
  fetchBugReport?: (bug_id: number) => Promise<void>;
  isBugLoading?: boolean;
};

export const MockBugReportProvider: React.FC<MockBugReportProviderProps> = ({
  children,
  bugReport,
  setBugReport,
  fetchBugReport,
  isBugLoading,
}) => {
  const contextValue: BugReportContextType = {
    bugReport: bugReport ?? null,
    setBugReport: setBugReport ?? defaultSetBugReport,
    fetchBugReport: fetchBugReport ?? defaultFetchBugReport,
    isBugLoading: isBugLoading ?? false,
  };

  return (
    <BugReportContext.Provider value={contextValue}>
      {children}
    </BugReportContext.Provider>
  );
};
