import React, { createContext, ReactNode, useContext, useState } from 'react';
import { BugReport, fetchBugById } from '../api/bug_report';

interface BugReportContextType {
  bugReport: BugReport | null;
  setBugReport: (bugReport: BugReport) => void;
  useFetchBugReport: (bug_id: number) => Promise<void>;
  isBugLoading: boolean;
}

const BugReportContext = createContext<BugReportContextType | undefined>(
  undefined
);

interface BugReportProviderProps {
  children: ReactNode;
}

export const BugReportProvider: React.FC<BugReportProviderProps> = ({
  children,
}: BugReportProviderProps) => {
  const [bugReport, setBugReport] = useState<BugReport | null>(null);
  const [isBugLoading, setIsBugLoading] = useState(false);

  const useFetchBugReport = async (bug_id: number) => {
    setIsBugLoading(true);
    try {
      const data = await fetchBugById(bug_id);
      setBugReport(data);
    } catch (error) {
      console.error('Error fetching bug report:', error);
    } finally {
      setIsBugLoading(false);
    }
  };

  return (
    <BugReportContext.Provider
      value={{ bugReport, setBugReport, useFetchBugReport, isBugLoading }}
    >
      {children}
    </BugReportContext.Provider>
  );
};

export const useBugReport = (): BugReportContextType => {
  const context = useContext(BugReportContext);
  if (!context) {
    throw new Error('useBugReport must be used within a BugReportProvider');
  }
  return context;
};
