import { Dispatch, SetStateAction } from 'react';
import { BugReports } from '../api/dbms';
import { FilterBugCategory } from './types';

// TODO: shift options logic to the BE. We are no planning to change the categories soon, and thus prioritise working code.

export const BUG_CATEGORIES = Object.values(
  FilterBugCategory
) as FilterBugCategory[];

// Autocomplete types
export type AcBugSearchResult = {
  display: string;
  bugReportId: number;
};

export type AcBugSearchResultCategory = {
  title: FilterBugCategory;
  options: AcBugSearchResult[];
};

export type AcBugSearchResultStruct = {
  categories: AcBugSearchResultCategory[];
};

// Search result / bug explore types
export type BugSearchResult = AcBugSearchResult & {
  description: string;
};

export type BugSearchResultCategory = {
  categoryId: number;
  title: FilterBugCategory;
  bugs: BugSearchResult[];
};

export type BugSearchResultStruct = {
  [cat in FilterBugCategory]?: BugSearchResultCategory;
};

export const categoriseBugs = (
  bugReports: BugReports
): AcBugSearchResultStruct => {
  const categoryMap: { [cat in FilterBugCategory]?: number } = {};

  const { bug_reports: reports } = bugReports;
  const searchResult: AcBugSearchResultStruct = {
    categories: [],
  };

  for (let i = 0; i < reports.length; ++i) {
    const {
      id: bugReportId,
      title: display,
      category_id: categoryId,
    } = reports[i];
    const category: FilterBugCategory = BUG_CATEGORIES[categoryId];

    if (categoryId >= BUG_CATEGORIES.length) {
      continue;
    }

    let idx: number;
    if (categoryMap[category] === undefined) {
      idx = searchResult.categories.length;
      searchResult.categories.push({
        title: category,
        options: [],
      });
      categoryMap[category] = idx;
    }

    idx = categoryMap[category];
    if (idx >= searchResult.categories.length) {
      continue;
    }
    searchResult.categories[idx]?.options?.push({
      display,
      bugReportId,
    });
  }

  return searchResult;
};

export const bugReportToBugSearchResult = (
  reports: BugReports
): BugSearchResult[] => {
  const { bug_reports: bugReports } = reports;

  return bugReports.map((report) => ({
    description: report.description ?? '',
    display: report.title,
    bugReportId: report.id,
  }));
};

// TODO: test for empty categories too
// TODO: mock empty response for 1 category, then load more for that category
export const setBugExplore = (
  bugExploreDistribution: number[],
  setBugExploreDistribution: Dispatch<SetStateAction<number[]>>,
  setBugReports: Dispatch<SetStateAction<BugSearchResultStruct>>,
  bugReportsDelta: BugReports,
  category?: FilterBugCategory, // for single category update
  categoryId?: number
): void => {
  // Single category update
  if (category && categoryId !== undefined) {
    // const deltaLength = bugReportsDelta.bug_reports.length;
    setBugReports((reports: BugSearchResultStruct) => {
      const neww = {
        ...reports,
        [category]: {
          ...(reports[category] ?? { categoryId, title: category }),
          ...{
            bugs: reports[category]
              ? [
                  ...reports[category].bugs,
                  ...bugReportToBugSearchResult(bugReportsDelta),
                ]
              : bugReportToBugSearchResult(bugReportsDelta),
          },
        },
      };

      return neww;
    });
  }
  // Bulk update
  if (category || categoryId) return;

  const { bug_reports: bugReports } = bugReportsDelta;
  const newDistr = Array(bugExploreDistribution.length).fill(0);
  const bugSearchResult: BugSearchResultStruct = {};

  for (const rep of bugReports) {
    const {
      id: bugReportId,
      title: display,
      category_id: categoryId,
      description,
    } = rep;

    if (categoryId >= newDistr.length || categoryId >= BUG_CATEGORIES.length)
      continue;

    newDistr[categoryId]++;
    const category: FilterBugCategory = BUG_CATEGORIES[categoryId];
    if (!bugSearchResult[category]) {
      bugSearchResult[category] = { categoryId, title: category, bugs: [] };
    }

    bugSearchResult[category].bugs.push({
      bugReportId,
      display,
      description: description ?? '',
    });
  }
  setBugExploreDistribution(newDistr);
  setBugReports(bugSearchResult);
};

export const setBugSearchResults = (
  setBugSearchReports: Dispatch<SetStateAction<BugSearchResultStruct>>,
  bugReportsDelta: BugReports
): void => {
  // Bulk update
  const { bug_reports: bugReports } = bugReportsDelta;

  const bugSearchResult: BugSearchResultStruct = {};

  for (const rep of bugReports) {
    const {
      id: bugReportId,
      title: display,
      category_id: categoryId,
      description,
    } = rep;

    const category: FilterBugCategory = BUG_CATEGORIES[categoryId];
    if (!bugSearchResult[category]) {
      bugSearchResult[category] = { categoryId, title: category, bugs: [] };
    }

    bugSearchResult[category].bugs.push({
      bugReportId,
      display,
      description: description ?? '',
    });
  }

  setBugSearchReports(bugSearchResult);
};
