import { Divider } from 'antd';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import BugContentContainer from '../../components/Bug/BugContentContainer';
import BugHeader from '../../components/Bug/BugHeader';
import BugSideBar from '../../components/Bug/BugSideBar';
import {
  BugDetailProvider,
  useBugDetail,
} from '../../contexts/BugDetailContext';
import { mockBugData } from './mockdata';

const BugDetailPage: React.FC = () => {
  const { setBugDetail } = useBugDetail();
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    setBugDetail(mockBugData[Number(id)]);
  });

  return (
    <div className="min-h-screen p-4 max-w-7xl mx-auto">
      <BugHeader />
      <Divider />
      <div className="min-h-screen flex gap-4">
        <div className="w-full lg:w-3/4">
          <BugContentContainer />
        </div>
        <div className="hidden lg:block w-1/4">
          <BugSideBar />
        </div>
      </div>
    </div>
  );
};

const BugDetailPageWrapper: React.FC = () => {
  return (
    <BugDetailProvider>
      <BugDetailPage />
    </BugDetailProvider>
  );
};

export default BugDetailPageWrapper;
