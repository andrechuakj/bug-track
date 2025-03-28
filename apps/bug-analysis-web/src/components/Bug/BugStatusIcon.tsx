import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

const BugStatusIcon: React.FC<{ isClosed: boolean }> = ({
  isClosed,
}: {
  isClosed: boolean;
}) => {
  switch (isClosed) {
    case false:
      return (
        <div className="px-3 py-1 bg-green-500 rounded-full flex gap-2 text-white w-fit">
          <ClockCircleOutlined />
          <Typography.Text className="text-white">Open</Typography.Text>
        </div>
      );
    case true:
      return (
        <div className="px-3 py-1 bg-purple-500 rounded-full flex gap-2 text-white w-fit">
          <CheckCircleOutlined />
          <Typography.Text className="text-white">Closed</Typography.Text>
        </div>
      );
    default:
      return <></>;
  }
};

export default BugStatusIcon;
