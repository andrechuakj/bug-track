import { render } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAiSummary } from '../../../src/api/dbms';
import { DashboardAiSummary } from '../../../src/modules';

describe('DashboardAiSummaryModule', () => {
  beforeAll(() => {
    // Mock useAppContext to return a dark theme
    vi.mock('../../../src/contexts/AppContext', () => ({
      useAppContext: () => ({ theme: 'dark' }),
    }));
  });

  beforeEach(() => {
    // Mock the fetch function
    vi.mock('../../../src/api/dbms', () => ({
      fetchAiSummary: vi
        .fn()
        // First call is on mount useEffect,
        // second call is also through useEffect after initial render
        .mockReturnValueOnce(new Promise(() => {}))
        .mockResolvedValueOnce(
          Promise.resolve({ summary: 'This is a test summary.' })
        )
        .mockResolvedValueOnce(Promise.resolve({ summary: 'Updated summary.' }))
        .mockReturnValue(new Promise(() => {})),
    }));
  });

  it('renders loading state correctly', () => {
    const { getByRole } = render(<DashboardAiSummary dbmsId={1} />);
    expect(fetchAiSummary).toHaveBeenCalledTimes(1);
    expect(fetchAiSummary).toHaveBeenCalledWith(1);
    const button = getByRole('button', { name: /AI Summary/i });
    expect(button).toBeDisabled();
  });

  it('renders summary when data is loaded', async () => {
    const mockSummary = 'This is a test summary.';
    const { findByText } = render(<DashboardAiSummary dbmsId={1} />);
    expect(fetchAiSummary).toHaveBeenCalledTimes(2);
    expect(fetchAiSummary).toHaveBeenCalledWith(1);
    const summaryElement = await findByText(mockSummary);
    expect(summaryElement).toBeInTheDocument();
  });

  it('reloads data when the button is clicked', async () => {
    const mockSummary = 'Updated summary.';
    const { getByRole, findByText } = render(<DashboardAiSummary dbmsId={1} />);
    const button = getByRole('button', { name: /AI Summary/i });
    button.click();
    expect(fetchAiSummary).toHaveBeenCalledTimes(3);
    expect(fetchAiSummary).toHaveBeenCalledWith(1);
    const updatedSummary = await findByText(mockSummary);
    expect(updatedSummary).toBeInTheDocument();
  });

  it('displays the correct image based on theme', () => {
    const { getByAltText } = render(<DashboardAiSummary dbmsId={1} />);
    const lightImage = getByAltText(/ai_summary_white/i);
    expect(lightImage).toBeInTheDocument();
  });
});
