import { Dispatch, SetStateAction } from 'react';
import FilterSelection from '../../components/FilterSelection';
import { BUG_CATEGORY_FILTERS, FilterSettings } from '../../utils/types';

export interface CategoryFilterProps {
  filterSettings: FilterSettings;
  setFilterSettings: Dispatch<SetStateAction<FilterSettings>>;
}

const CategoryFilter = ({
  filterSettings,
  setFilterSettings,
}: CategoryFilterProps) => {
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

export default CategoryFilter;
