import { Select } from 'antd';
import React from 'react';

const categories = ['TiDB', 'Some Other DB'];

interface DatabaseDropdownProps {
  value?: string;
  onChange?: (value: string) => void;
}

const DatabaseDropdown: React.FC<DatabaseDropdownProps> = ({
  value,
  onChange,
}: DatabaseDropdownProps) => {
  if (process.env.NODE_ENV !== 'production' && typeof onChange !== 'function') {
    console.error(
      "DatabaseDropdown: Missing onChange. Are you sure you're using this component inside an antd Form? It appears the Form isn't injecting the onChange prop."
    );
  }
  return (
    <div className={'width-full'}>
      <Select
        placeholder="Select a Database"
        onChange={onChange}
        className={'text-center'}
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
