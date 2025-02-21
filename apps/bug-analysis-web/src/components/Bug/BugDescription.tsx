import { Divider, Typography } from 'antd';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useBugDetail } from '../../contexts/BugDetailContext';
import { useAppContext } from '../../utils/context';
import { formatDate } from '../../utils/dateUtils';

const BugDescription: React.FC = () => {
  const { bugDetail } = useBugDetail();
  const { theme } = useAppContext();

  return (
    <div
      className={`w-full rounded-lg p-4 ${theme === 'light' ? 'bg-white' : 'bg-black'}`}
    >
      <div className="markdown overflow-y-auto">
        <Markdown remarkPlugins={[remarkGfm]} skipHtml>
          {bugDetail?.bugDescription || 'No description found'}
        </Markdown>
      </div>

      <Divider className="mt-4 mb-1" />
      <Typography.Text className="text-xs">
        Created at:{' '}
        {bugDetail?.createdAt
          ? formatDate(bugDetail.createdAt)
          : 'No date found'}
      </Typography.Text>
    </div>
  );
};

export default BugDescription;
