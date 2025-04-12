import { Card, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import {
  BugCategory,
  fetchNewBugReportCategoriesToday,
  fetchNumReportsToday,
} from '../../api/dbms';
import CategoryTag from '../../components/CategoryTag';
import { antdTagPresets, BugTrackColors } from '../../utils/theme';

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
  const [bugCategories, setBugCategories] = useState<BugCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

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

  useEffect(() => {
    // Fetch the categories of new bug reports for the given DBMS
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categories = await fetchNewBugReportCategoriesToday(dbmsId);
        setBugCategories(categories);
      } catch (error) {
        console.error('Error fetching bug report categories:', error);
        setBugCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [dbmsId]);

  return (
    <div className="overflow-y-scroll">
      <Typography.Title level={4}>{TITLE_KEY_ISSUES}</Typography.Title>
      <Typography.Title level={4} className="!font-light !mb-4 sticky top-0">
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
            <Typography.Title level={5}>
              {TITLE_BUG_CATEGORIES}
            </Typography.Title>

            <div className="flex flex-wrap gap-1 max-h-[9.5vh] overflow-y-scroll">
              {isLoadingCategories ? (
                <Typography.Text>Loading categories...</Typography.Text>
              ) : bugCategories.length > 0 ? (
                bugCategories.map((category, index) => (
                  <CategoryTag
                    key={category.id}
                    text={`${category.name} (${category.count})`}
                    color={antdTagPresets[index % antdTagPresets.length]}
                  />
                ))
              ) : (
                <Typography.Text>No categories reported today.</Typography.Text>
              )}
            </div>
          </Card>

          <Card
            style={{
              borderRadius: '12px',
              backgroundColor: `${BugTrackColors.GREEN}40`,
              maxHeight: '19vh',
              overflow: 'hidden',
              minWidth: '33%',
            }}
          >
            <Typography.Title level={5}>
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
