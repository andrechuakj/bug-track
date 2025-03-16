import { Select } from 'antd';
import React, { ReactNode } from 'react';
import { FilterSettings } from '../../utils/types';

export interface FilterSelectionProps {
  filterPrefix: ReactNode;
  filterSetting: FilterSettings[keyof FilterSettings];
  filterOptions: FilterSettings[keyof FilterSettings][];
  filterOnChange: (val: FilterSettings[keyof FilterSettings]) => void;
  filterPlaceholder: string;
}
const FilterSelection: React.FC<FilterSelectionProps> = ({
  filterPrefix,
  filterSetting,
  filterOptions,
  filterOnChange,
  filterPlaceholder,
}: FilterSelectionProps) => {
  return (
    <Select
      showSearch
      prefix={filterPrefix}
      value={filterSetting}
      optionLabelProp="label"
      placeholder={filterPlaceholder}
      options={filterOptions.map(
        (opt: FilterSettings[keyof FilterSettings]) => ({
          value: opt,
          label: opt,
        })
      )}
      className="w-full"
      onChange={filterOnChange}
    />
  );
};

export default FilterSelection;
