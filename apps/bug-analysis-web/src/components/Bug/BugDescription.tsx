import { Divider, Skeleton, Typography } from 'antd';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useBugReport } from '../../contexts/BugReportContext';
import { useAppContext } from '../../utils/context';
import { formatDate } from '../../utils/dateUtils';

const BugDescription: React.FC = () => {
  const { bugReport, isBugLoading } = useBugReport();
  const { theme } = useAppContext();

  return (
    <>
      {isBugLoading && <Skeleton active paragraph={{ rows: 1 }} />}
      {!isBugLoading && (
        <div
          className={`w-full rounded-lg p-4 ${theme === 'light' ? 'bg-white' : 'bg-black'}`}
        >
          <div className="markdown overflow-y-auto">
            <Markdown remarkPlugins={[remarkGfm]} skipHtml>
              {bugReport?.description || 'No description found'}
            </Markdown>
          </div>

          <Divider className="mt-4 mb-1" />
          <Typography.Text className="text-xs">
            Created at:{' '}
            {bugReport?.createdAt
              ? formatDate(bugReport.createdAt)
              : 'No date found'}
          </Typography.Text>
        </div>
      )}
    </>
  );
};

export default BugDescription;
