import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DbmsDetails } from '../../../src/modules';

describe('DbmsDetails', () => {
  it('renders the component with correct titles and data', () => {
    const { getByText } = render(<DbmsDetails />);

    expect(getByText(/Key Issues/i)).toBeInTheDocument();
    expect(getByText(/12 new bugs reported/i)).toBeInTheDocument();
    expect(getByText(/Number of Reporters/i)).toBeInTheDocument();
    expect(getByText(/123/i)).toBeInTheDocument();
    expect(getByText(/Bug Categories Hit/i)).toBeInTheDocument();
    expect(getByText(/Crash/i)).toBeInTheDocument();
    expect(getByText(/Assertion Failure/i)).toBeInTheDocument();
    expect(getByText(/Infinite Loop/i)).toBeInTheDocument();
    expect(getByText(/Report Last Updated/i)).toBeInTheDocument();
  });

  it('renders cards with correct styles', () => {
    const { container } = render(<DbmsDetails />);
    const cards = container.querySelectorAll('.ant-card');

    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveStyle('background-color: rgba(224, 82, 156, 0.25)');
    expect(cards[1]).toHaveStyle('background-color: rgba(132, 210, 243, 0.25)');
    expect(cards[2]).toHaveStyle('background-color: rgba(111, 188, 152, 0.25)');
  });
});
