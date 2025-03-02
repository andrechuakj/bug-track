import { Select } from 'antd';

const categories = ['TiDB', 'Some Other DB'];

const DatabaseDropdown = ({
                            value,
                            onChange,
}) => {
  return (
    <div style={{ width: '100%'}}>
      <Select
        placeholder="Select a Database"
        onChange={onChange}
        style={{ textAlign: 'center'}}
        value={value || undefined}
      >
        {categories.map((category) => (
          <Select.Option key={category} value={category}>
            {category}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default DatabaseDropdown;