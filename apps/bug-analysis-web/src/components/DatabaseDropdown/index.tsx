import { Select } from 'antd';
import { useSession } from '../../contexts/SessionContext';

const DatabaseDropdown: React.FC = () => {
  const { tenantList, setCurrentTenant } = useSession();

  return (
    <div className={'w-full'}>
      <Select
        placeholder="Select a Database"
        onChange={setCurrentTenant}
        className={'text-center'}
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
