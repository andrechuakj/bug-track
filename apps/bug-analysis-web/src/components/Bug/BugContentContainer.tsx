import AiSummary from './AiSummary';
import BugDescription from './BugDescription';

const BugContentContainer: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-4">
      <AiSummary />
      <BugDescription />;
    </div>
  );
};

export default BugContentContainer;
