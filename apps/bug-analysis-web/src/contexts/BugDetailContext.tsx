import React, { createContext, ReactNode, useContext, useState } from 'react';
import { BugReport, fetchBugById } from '../api/bug_report';

interface BugDetailContextType {
  bugDetail: BugReport | null;
  setBugDetail: (bugDetail: BugReport) => void;
  useFetchBugDetail: (bug_id: number) => Promise<void>;
  isBugLoading: boolean;
}

const BugDetailContext = createContext<BugDetailContextType | undefined>(
  undefined
);

interface BugDetailProviderProps {
  children: ReactNode;
}

export const BugDetailProvider: React.FC<BugDetailProviderProps> = ({
  children,
}: BugDetailProviderProps) => {
  const [bugDetail, setBugDetail] = useState<BugReport | null>(null);
  const [isBugLoading, setIsBugLoading] = useState(false);

  const useFetchBugDetail = async (bug_id: number) => {
    setIsBugLoading(true);
    try {
      const data = await fetchBugById(bug_id);
      setBugDetail(data);
    } catch (error) {
      console.error('Error fetching bug detail:', error);
    } finally {
      setIsBugLoading(false);
    }
  };

  return (
    <BugDetailContext.Provider
      value={{ bugDetail, setBugDetail, useFetchBugDetail, isBugLoading }}
    >
      {children}
    </BugDetailContext.Provider>
  );
};

export const useBugDetail = (): BugDetailContextType => {
  const context = useContext(BugDetailContext);
  if (!context) {
    throw new Error('useBugDetail must be used within a BugDetailProvider');
  }
  return context;
};
