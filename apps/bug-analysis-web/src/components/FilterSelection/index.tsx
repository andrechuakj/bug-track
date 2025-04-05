import { Select } from 'antd';
import React, { ReactNode } from 'react';
import { FilterSettings } from '../../utils/types';

type Props<T extends keyof FilterSettings> = {
  filterPrefix: ReactNode;
  filterSetting: FilterSettings[T];
  filterOptions: ReadonlyArray<FilterSettings[T]>;
  filterOnChange: (val: FilterSettings[T]) => void;
  filterPlaceholder: string;
};

const FilterSelection = (<T extends keyof FilterSettings>({
  filterPrefix,
  filterSetting,
  filterOptions,
  filterOnChange,
  filterPlaceholder,
}: Props<T>) => {
  return (
    <Select
      showSearch
      prefix={filterPrefix}
      value={filterSetting}
      optionLabelProp="label"
      placeholder={filterPlaceholder}
      options={filterOptions.map((opt: FilterSettings[T]) => ({
        value: opt,
        label: opt,
      }))}
      className="w-full"
      onChange={filterOnChange}
    />
  );
}) satisfies React.FC<Props<keyof FilterSettings>>;

export default FilterSelection;
