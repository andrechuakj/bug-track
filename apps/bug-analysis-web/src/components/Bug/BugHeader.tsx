import { Button, Skeleton, Typography } from 'antd';
import { useBugReport } from '../../contexts/BugReportContext';
import BugStatusIcon from './BugStatusIcon';

const BugHeader: React.FC = () => {
  const { bugReport } = useBugReport();

  return (
    <>
      {!bugReport && <Skeleton active paragraph={{ rows: 1 }} />}
      {bugReport && (
        <div className="w-full flex gap-4">
          <div className="w-3/4">
            <Typography.Title level={2}>
              {bugReport.title} #{bugReport.id}
            </Typography.Title>
            <BugStatusIcon status={bugReport.status} />
          </div>
          <div className="w-1/4 flex flex-col xl:flex-row xl:justify-end gap-4">
            <Button
              type="primary"
              href={bugReport.githubIssueURL}
              target="_blank"
            >
              View on GitHub
            </Button>
            <Button
              type="default"
              href={bugReport.githubRepoURL}
              target="_blank"
            >
              View Repository
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default BugHeader;
