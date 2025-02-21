import { Button, Skeleton, Typography } from 'antd';
import { useBugDetail } from '../../contexts/BugDetailContext';
import BugStatusIcon from './BugStatusIcon';

const BugHeader: React.FC = () => {
  const { bugDetail } = useBugDetail();

  return (
    <>
      {!bugDetail && <Skeleton active paragraph={{ rows: 1 }} />}
      {bugDetail && (
        <div className="w-full flex gap-4">
          <div className="w-3/4">
            <Typography.Title level={2}>
              {bugDetail.title} #{bugDetail.id}
            </Typography.Title>
            <BugStatusIcon status={bugDetail.status} />
          </div>
          <div className="w-1/4 flex flex-col xl:flex-row xl:justify-end gap-4">
            <Button
              type="primary"
              href={bugDetail.githubIssueURL}
              target="_blank"
            >
              View on GitHub
            </Button>
            <Button
              type="default"
              href={bugDetail.githubRepoURL}
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
