import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CategoryTag from '../../../src/components/CategoryTag';

describe('CategoryTag', () => {
  it('renders with icon number when iconIsNumber is true', () => {
    const { getByText } = render(
      <CategoryTag text="Test" color="blue" iconIsNumber iconNumber={5} />
    );
    const iconElement = getByText('5');
    expect(iconElement).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    const customIcon = <span>Icon</span>;
    const { getByText } = render(
      <CategoryTag text="Test" color="blue" icon={customIcon} />
    );
    const iconElement = getByText('Icon');
    expect(iconElement).toBeInTheDocument();
  });

  it('renders without icon when iconIsNumber is true but iconNumber is not provided', () => {
    const { queryByText } = render(
      <CategoryTag text="Test" color="blue" iconIsNumber />
    );
    const iconElement = queryByText('5');
    expect(iconElement).not.toBeInTheDocument();
  });
});
