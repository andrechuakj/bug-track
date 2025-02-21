import { Divider, Tag, Typography } from 'antd';
import { useBugDetail } from '../../contexts/BugDetailContext';
import CategoryTag from '../CategoryTag';

const BugSideBar: React.FC = () => {
  const { bugDetail } = useBugDetail();

  return (
    <div className="w-full">
      <div className="flex flex-col gap-1">
        <Typography.Title level={5}>DBMS</Typography.Title>
        <Tag color="red" className="w-fit">
          TiDB
        </Tag>
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <Typography.Title level={5}>Category</Typography.Title>
        {bugDetail?.category ? (
          <CategoryTag
            color="blue"
            text={bugDetail.category}
            className="w-fit"
          />
        ) : (
          'Not categorised'
        )}
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <Typography.Title level={5}>Versions affected</Typography.Title>
        {bugDetail?.versionsAffected ? (
          <Typography.Text>
            {bugDetail.versionsAffected.join(', ')}
          </Typography.Text>
        ) : (
          'Not specified'
        )}
      </div>

      <Divider />
    </div>
  );
};

export default BugSideBar;
