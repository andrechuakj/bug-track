import { Select } from 'antd';
import { useSession } from '../../contexts/SessionContext';

const DatabaseDropdown: React.FC = () => {
  const { currentTenant, tenantList, setCurrentTenant } = useSession();

  return (
    <div className={'w-full'}>
      <Select
        placeholder="Select a Database"
        onChange={setCurrentTenant}
        className={'text-center w-full'}
        value={currentTenant?.id}
      >
        {tenantList.map(({ id, name }) => (
          <Select.Option key={id} value={id}>
            {name}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default DatabaseDropdown;
