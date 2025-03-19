import { Button, Skeleton, Typography } from 'antd';
import { useBugReport } from '../../contexts/BugReportContext';
import BugStatusIcon from './BugStatusIcon';

const BugHeader: React.FC = () => {
  const { bugReport, isBugLoading } = useBugReport();

  return (
    <>
      {isBugLoading && <Skeleton active paragraph={{ rows: 1 }} />}
      {!isBugLoading && (
        <div className="w-full flex gap-4">
          <div className="w-3/4">
            <Typography.Title level={2}>
              {bugReport?.title
                ? `${bugReport.title} #${bugReport.id}`
                : 'No title found'}
            </Typography.Title>
            <BugStatusIcon status={'Closed'} />
          </div>
          <div className="w-1/4 flex flex-col xl:flex-row xl:justify-end gap-4">
            <Button
              type="primary"
              href={'https://www.github.com'}
              target="_blank"
            >
              View on GitHub
            </Button>
            <Button
              type="default"
              href={'https://www.github.com'}
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
