import { Dispatch, SetStateAction } from 'react';
import FilterSelection from '../../components/FilterSelection';
import { BUG_CATEGORY_FILTERS, FilterSettings } from '../../utils/types';

export type CategoryFilterProps = {
  filterSettings: FilterSettings;
  setFilterSettings: Dispatch<SetStateAction<FilterSettings>>;
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  filterSettings,
  setFilterSettings,
}) => {
  return (
    <FilterSelection<'category'>
      key="filter-sel-category"
      filterPrefix={<p className="font-light">Category:</p>}
      filterSetting={filterSettings.category}
      filterOptions={BUG_CATEGORY_FILTERS}
      filterOnChange={(val) => {
        setFilterSettings((settings) => ({ ...settings, category: val }));
      }}
      filterPlaceholder="Select Bug Category"
    />
  );
};
