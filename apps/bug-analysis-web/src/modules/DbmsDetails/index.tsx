import { Card, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { fetchNumReportsToday } from '../../api/dbms';
import CategoryTag from '../../components/CategoryTag';
import { antdTagPresets, BugTrackColors } from '../../utils/theme';
import { FilterBugCategory } from '../../utils/types';

// Constants for title text
const TITLE_KEY_ISSUES = 'Bug Check';
const TITLE_BUG_CATEGORIES = 'Categories of bugs reported today';
const TITLE_REPORT_GENERATED = 'Report generated';

export type DbmsDetailsProps = {
  dbmsId: number;
};

export const DbmsDetails: React.FC<DbmsDetailsProps> = ({
  dbmsId,
}: DbmsDetailsProps) => {
  const [newBugReports, setNewBugReports] = useState<number | null>(null);

  const reportGeneratedDate = useMemo(() => new Date().toLocaleString(), []);

  useEffect(() => {
    // Fetch the number of new bug reports for the given DBMS
    const fetchNewReports = async () => {
      try {
        const numReports = await fetchNumReportsToday(dbmsId);
        setNewBugReports(numReports);
      } catch (error) {
        console.error('Error fetching new bug reports:', error);
        setNewBugReports(null);
      }
    };

    fetchNewReports();
  }, [dbmsId]);

  return (
    <div className="overflow-y-scroll">
      <Typography.Title level={4}>{TITLE_KEY_ISSUES}</Typography.Title>
      <Typography.Title level={4} className="!font-light !mb-4">
        {newBugReports !== null
          ? `${newBugReports} new bugs reported today`
          : 'Loading new bug reports...'}
      </Typography.Title>
      <div className="flex flex-col justify-center">
        <div className="flex gap-2 lg:flex-col sm:flex-col md:flex-col xl:flex-row">
          <Card
            style={{
              borderRadius: '12px',
              backgroundColor: `${BugTrackColors.BLUE}40`,
              maxHeight: '19vh',
            }}
          >
            <Typography.Title level={4}>
              {TITLE_BUG_CATEGORIES}
            </Typography.Title>
            <div className="flex flex-wrap gap-1">
              <CategoryTag
                text={FilterBugCategory.CRASH}
                color={antdTagPresets[0]}
              />
              <CategoryTag
                text={FilterBugCategory.ASSERTION_FAILURE}
                color={antdTagPresets[1]}
              />
              <CategoryTag
                text={FilterBugCategory.INFINITE_LOOP}
                color={antdTagPresets[2]}
              />
            </div>
          </Card>

          <Card
            style={{
              borderRadius: '12px',
              backgroundColor: `${BugTrackColors.GREEN}40`,
              maxHeight: '19vh',
              overflow: 'hidden',
            }}
          >
            <Typography.Title level={4}>
              {TITLE_REPORT_GENERATED}
            </Typography.Title>
            <Typography.Title level={4} className="!font-light">
              {reportGeneratedDate}
            </Typography.Title>
          </Card>
        </div>
      </div>
    </div>
  );
};
