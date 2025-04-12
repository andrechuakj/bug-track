import { describe, expect, it, vi } from 'vitest';
import { BugReports } from '../../src/api/dbms';
import {
  bugReportToBugSearchResult,
  categoriseBugs,
  setBugExplore,
} from '../../src/utils/bug';
import { FilterBugCategory } from '../../src/utils/types';

describe('categoriseBugs', () => {
  it('should categorise bugs by category', () => {
    const mockBugReports: BugReports = {
      bug_reports: [
        {
          id: 1,
          dbms_id: 101,
          category_id: 0,
          title: 'UI Bug 1',
          url: 'http://example.com/bug1',
          description: 'Button misalignment',
          dbms: '',
          category: null,
          issue_created_at: '',
          issue_updated_at: null,
          issue_closed_at: null,
          is_closed: false,
          priority: 'Low',
        },
        {
          id: 2,
          dbms_id: 102,
          category_id: 2,
          title: 'Backend Bug 1',
          url: 'http://example.com/bug2',
          description: 'API timeout',
          dbms: '',
          category: null,
          issue_created_at: '',
          issue_updated_at: null,
          issue_closed_at: null,
          is_closed: false,
          priority: 'Low',
        },
        {
          id: 3,
          dbms_id: 103,
          category_id: 0,
          title: 'UI Bug 2',
          url: 'http://example.com/bug3',
          description: 'Text overflow issue',
          dbms: '',
          category: null,
          issue_created_at: '',
          issue_updated_at: null,
          issue_closed_at: null,
          is_closed: false,
          priority: 'Low',
        },
        {
          id: 4,
          dbms_id: 104,
          category_id: 5,
          title: 'Performance Bug 1',
          url: 'http://example.com/bug4',
          description: 'Slow page load',
          dbms: '',
          category: null,
          issue_created_at: '',
          issue_updated_at: null,
          issue_closed_at: null,
          is_closed: false,
          priority: 'Low',
        },
      ],
    };

    const expectedCategorisedBugs = {
      categories: [
        {
          title: 'Crash / Segmentation Fault',
          options: [
            {
              display: 'UI Bug 1',
              bugReportId: 1,
            },
            {
              display: 'UI Bug 2',
              bugReportId: 3,
            },
          ],
        },
        {
          title: 'Infinite Loop / Hang',
          options: [
            {
              display: 'Backend Bug 1',
              bugReportId: 2,
            },
          ],
        },
        {
          title: 'Constraint Violation',
          options: [
            {
              display: 'Performance Bug 1',
              bugReportId: 4,
            },
          ],
        },
      ],
    };

    const result = categoriseBugs(mockBugReports.bug_reports);

    expect(result).toEqual(expectedCategorisedBugs);
  });
});

describe('setBugExplore', () => {
  it('should update a single category', () => {
    const mockBugExploreDistribution = [0, 0, 0];
    const setBugExploreDistribution = vi.fn();
    const setBugReports = vi.fn();

    const mockBugReportsDelta: BugReports = {
      bug_reports: [
        {
          id: 1,
          dbms_id: 0,
          url: 'http://example.com/bug1',
          category_id: 0,
          title: 'UI Bug 1',
          description: 'Button misalignment',
          dbms: '',
          category: null,
          issue_created_at: '',
          issue_updated_at: null,
          issue_closed_at: null,
          is_closed: false,
          priority: 'Low',
        },
        {
          id: 2,
          dbms_id: 0,
          url: 'http://example.com/bug2',
          category_id: 0,
          title: 'UI Bug 2',
          description: 'Text overflow issue',
          dbms: '',
          category: null,
          issue_created_at: '',
          issue_updated_at: null,
          issue_closed_at: null,
          is_closed: false,
          priority: 'Low',
        },
      ],
    };

    const category = FilterBugCategory.CRASH;
    const categoryId = 0;

    setBugExplore(
      mockBugExploreDistribution,
      setBugExploreDistribution,
      setBugReports,
      mockBugReportsDelta,
      category,
      categoryId
    );

    expect(setBugReports).toHaveBeenCalled();
    // Note: this gets the first argument of the first call
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const functionCall = setBugReports.mock.calls[0][0];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const updatedReports = functionCall({});

    expect(updatedReports).toEqual({
      [category]: {
        categoryId,
        title: category,
        bugs: [
          {
            bugReportId: 1,
            display: 'UI Bug 1',
            description: 'Button misalignment',
          },
          {
            bugReportId: 2,
            display: 'UI Bug 2',
            description: 'Text overflow issue',
          },
        ],
      },
    });
    expect(setBugExploreDistribution).not.toHaveBeenCalled();
  });

  it('should update multiple categories', () => {
    const mockBugExploreDistribution = [0, 0, 0, 0, 0, 0];
    const setBugExploreDistribution = vi.fn();
    const setBugReports = vi.fn();

    const mockBugReportsDelta: BugReports = {
      bug_reports: [
        {
          id: 1,
          dbms_id: 0,
          url: 'http://example.com/bug1',
          category_id: 0,
          title: 'UI Bug 1',
          description: 'Button misalignment',
          dbms: '',
          category: null,
          issue_created_at: '',
          issue_updated_at: null,
          issue_closed_at: null,
          is_closed: false,
          priority: 'Low',
        },
        {
          id: 2,
          dbms_id: 0,
          url: 'http://example.com/bug2',
          category_id: 4,
          title: 'Backend Bug 1',
          description: 'API timeout',
          dbms: '',
          category: null,
          issue_created_at: '',
          issue_updated_at: null,
          issue_closed_at: null,
          is_closed: false,
          priority: 'Low',
        },
      ],
    };

    setBugExplore(
      mockBugExploreDistribution,
      setBugExploreDistribution,
      setBugReports,
      mockBugReportsDelta
    );

    expect(setBugExploreDistribution).toHaveBeenCalledWith([1, 0, 0, 0, 1, 0]);
    expect(setBugReports).toHaveBeenCalledWith({
      [FilterBugCategory.CRASH]: {
        categoryId: 0,
        title: 'Crash / Segmentation Fault',
        bugs: [
          {
            bugReportId: 1,
            display: 'UI Bug 1',
            description: 'Button misalignment',
          },
        ],
      },
      [FilterBugCategory.TRANSACTION_ANOMALY]: {
        categoryId: 4,
        title: 'Transaction Anomaly',
        bugs: [
          {
            bugReportId: 2,
            display: 'Backend Bug 1',
            description: 'API timeout',
          },
        ],
      },
    });
  });
});

describe('bugReportToBugSearchResult', () => {
  it('should convert bug reports to BugSearchResult array', () => {
    const mockBugReports: BugReports = {
      bug_reports: [
        {
          id: 1,
          dbms_id: 101,
          category_id: 0,
          title: 'UI Bug 1',
          url: 'http://example.com/bug1',
          description: 'Button misalignment',
          dbms: '',
          category: null,
          issue_created_at: '',
          issue_updated_at: null,
          issue_closed_at: null,
          is_closed: false,
          priority: 'Low',
        },
        {
          id: 2,
          dbms_id: 102,
          category_id: 2,
          title: 'Backend Bug 1',
          url: 'http://example.com/bug2',
          description: 'API timeout',
          dbms: '',
          category: null,
          issue_created_at: '',
          issue_updated_at: null,
          issue_closed_at: null,
          is_closed: false,
          priority: 'Low',
        },
      ],
    };

    const expectedResults = [
      {
        description: 'Button misalignment',
        display: 'UI Bug 1',
        bugReportId: 1,
      },
      {
        description: 'API timeout',
        display: 'Backend Bug 1',
        bugReportId: 2,
      },
    ];

    const result = bugReportToBugSearchResult(mockBugReports);

    expect(result).toEqual(expectedResults);
  });

  it('should handle bug reports with missing descriptions', () => {
    const mockBugReports: BugReports = {
      bug_reports: [
        {
          id: 1,
          dbms_id: 101,
          category_id: 0,
          title: 'UI Bug 1',
          url: 'http://example.com/bug1',
          description: null,
          dbms: '',
          category: null,
          issue_created_at: '',
          issue_updated_at: null,
          issue_closed_at: null,
          is_closed: false,
          priority: 'Low',
        },
        {
          id: 2,
          dbms_id: 102,
          category_id: 2,
          title: 'Backend Bug 1',
          url: 'http://example.com/bug2',
          description: null,
          dbms: '',
          category: null,
          issue_created_at: '',
          issue_updated_at: null,
          issue_closed_at: null,
          is_closed: false,
          priority: 'Low',
        },
      ],
    };

    const expectedResults = [
      {
        description: '',
        display: 'UI Bug 1',
        bugReportId: 1,
      },
      {
        description: '',
        display: 'Backend Bug 1',
        bugReportId: 2,
      },
    ];

    const result = bugReportToBugSearchResult(mockBugReports);

    expect(result).toEqual(expectedResults);
  });
});
