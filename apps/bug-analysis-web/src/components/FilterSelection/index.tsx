import { Select } from 'antd';
import React, { ReactNode } from 'react';
import { FilterSettings } from '../../utils/types';

type Props = {
  filterPrefix: ReactNode;
  filterSetting: FilterSettings[keyof FilterSettings];
  filterOptions: FilterSettings[keyof FilterSettings][];
  filterOnChange: (val: FilterSettings[keyof FilterSettings]) => void;
  filterPlaceholder: string;
};

const FilterSelection: React.FC<Props> = ({
  filterPrefix,
  filterSetting,
  filterOptions,
  filterOnChange,
  filterPlaceholder,
}) => {
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
