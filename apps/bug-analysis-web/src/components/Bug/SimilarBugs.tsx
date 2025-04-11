import { Skeleton, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { BugReport, fetchSimilarBugs } from '../../api/bugReport';
import { useBugReport } from '../../contexts/BugReportContext';

const { Link } = Typography;

const SimilarBugs: React.FC = () => {
  const { bugReport } = useBugReport();
  const [similarReports, setSimilarReports] = useState<BugReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!bugReport) {
        return;
      }
      try {
        const res = await fetchSimilarBugs(bugReport.id, 5);
        setSimilarReports(res);
      } catch (err) {
        console.error('Failed to fetch similar bugs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [bugReport]);

  return (
    <>
      <Typography.Title level={5}>Similar bugs</Typography.Title>
      {isLoading && <Skeleton.Input active size="small" />}
      {!isLoading &&
        (similarReports.length === 0 ? (
          <Typography.Text>No similar bugs found</Typography.Text>
        ) : (
          <div className="flex flex-col gap-2">
            {similarReports.map((report) => (
              <Link key={report.id} href={`/bug/${report.id}`}>
                {report.title}
              </Link>
            ))}
          </div>
        ))}
    </>
  );
};

export default SimilarBugs;
