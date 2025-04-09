export type AppTheme = 'dark' | 'light';

export enum FilterBugCategory {
  CRASH = 'Crash / Segmentation Fault',
  ASSERTION_FAILURE = 'Assertion Failure',
  INFINITE_LOOP = 'Infinite Loop / Hang',
  INCORRECT_QUERY_RESULT = 'Incorrect Query Result',
  TRANSACTION_ANOMALY = 'Transaction Anomaly',
  CONSTRAINT_VIOLATION = 'Constraint Violation',
  DATA_CORRUPTION = 'Data Corruption',
  PERFORMANCE_DEGRADATION = 'Performance Degradation',
  DEADLOCK = 'Deadlock',
  OTHERS = 'Others',
  NONE_SELECTED = 'None Selected',
}

const categoryToIdMap: { [cat in FilterBugCategory]?: number } =
  Object.fromEntries(
    Object.values(FilterBugCategory).map((value, index) => [value, index])
  );

export const BUG_CATEGORY_FILTERS: ReadonlyArray<FilterBugCategory> =
  Object.values(FilterBugCategory);

export enum BugPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  UNASSIGNED = 'Unassigned',
}

export enum FilterBugPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  UNASSIGNED = 'Unassigned',
  NONE_SELECTED = 'None Selected',
}

export const BUG_PRIORITY_FILTERS: ReadonlyArray<FilterBugPriority> =
  Object.values(FilterBugPriority);

// Dashboard filter settings
export type FilterSettings = {
  category: FilterBugCategory;
  priority: FilterBugPriority;
};

export const getCategoryId = ({ category }: FilterSettings) =>
  category !== FilterBugCategory.NONE_SELECTED
    ? categoryToIdMap[category]
    : undefined;
