import React, { createContext, ReactNode, useContext, useState } from 'react';
import { BugDetail } from '../pages/bug/mockdata';

interface BugDetailContextType {
  bugDetail: BugDetail | null;
  setBugDetail: (bugDetail: BugDetail) => void;
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
  const [bugDetail, setBugDetail] = useState<BugDetail | null>(null);

  return (
    <BugDetailContext.Provider value={{ bugDetail, setBugDetail }}>
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
