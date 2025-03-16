export type AppTheme = 'dark' | 'light';

export enum FilterBugCategory {
  CRASH = 'Crash',
  ASSERTION_FAILURE = 'Assertion Failure',
  USABILITY = 'Usability',
  COMPATIBILITY = 'Compatibility',
  INCORRECT_QUERY_RESULT = 'Incorrect Query Result',
  PERFORMANCE_DEGRADATION = 'Performance Degradation',
  CONSTRAINT_VIOLATION = 'Constraint Violation',
  DEADLOCK = 'Deadlock',
  DATA_CORRUPTION = 'Data Corruption',
  SQL_SYNTAX_ERROR = 'SQL Syntax Error',
  PRIVILEGE_ESCALATION = 'Privilege Escalation',
  MEMORY_LEAK = 'Memory Leak',
  CONCURRENCY_ISSUE = 'Concurrency Issue',
  TRANSACTION_ANOMALY = 'Transaction Anomaly',
  NON_ISSUES = 'Non-Issues',
  NONE_SELECTED = 'None Selected',
}

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
