import { Divider, Skeleton, Typography } from 'antd';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BugReport } from '../../api/bugReport';
import { useAppContext } from '../../contexts/AppContext';
import { useBugReport } from '../../contexts/BugReportContext';
import { formatDate } from '../../utils/dateUtils';

const getDateDescription = (bugReport: BugReport | null): string => {
  if (bugReport?.is_closed && bugReport.issue_closed_at) {
    return `Closed at: ${formatDate(bugReport.issue_closed_at)}`;
  } else if (bugReport?.issue_created_at) {
    return `Created at: ${formatDate(bugReport.issue_created_at)}`;
  } else {
    return 'No date found';
  }
};

const BugDescription: React.FC = () => {
  const { bugReport, isBugLoading } = useBugReport();
  const { theme } = useAppContext();

  if (isBugLoading) {
    return <Skeleton active paragraph={{ rows: 1 }} />;
  }

  return (
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
        {getDateDescription(bugReport)}
      </Typography.Text>
    </div>
  );
};

export default BugDescription;
