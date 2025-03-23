export type AppTheme = 'dark' | 'light';

export enum FilterBugCategory {
  CRASH = 'Crash / Segmentation Fault',
  ASSERTION_FAILURE = 'Assertion Failure',
  USABILITY = 'Usability',
  COMPATIBILITY = 'Compatibility',
  INCORRECT_QUERY_RESULT = 'Incorrect Query Result',
  PERFORMANCE_DEGRADATION = 'Performance Degradation',
  CONSTRAINT_VIOLATION = 'Constraint Violation',
  DEADLOCK = 'Deadlock',
  DATA_CORRUPTION = 'Data Corruption',
  SQL_SYNTAX_ERROR = 'SQL Syntax / Parsing Error',
  PRIVILEGE_ESCALATION = 'Privilege Escalation',
  MEMORY_LEAK = 'Memory Leak / Resource Exhaustion',
  CONCURRENCY_ISSUE = 'Concurrency Issue (race conditions, lost updates, etc.)',
  TRANSACTION_ANOMALY = 'Transaction Anomaly (phantom reads, dirty reads, etc.)',
  NON_ISSUES = 'Non-Issues',
  NONE_SELECTED = 'None Selected',
}

export const categoryToIdMap: { [cat in FilterBugCategory]?: number } =
  Object.fromEntries(
    Object.values(FilterBugCategory).map((value, index) => [value, index])
  );

export enum FilterBugPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  UNASSIGNED = 'Unassigned',
  NONE_SELECTED = 'None Selected',
}

// Dashboard filter settings
export interface FilterSettings {
  category: FilterBugCategory;
  priority: FilterBugPriority;
}
