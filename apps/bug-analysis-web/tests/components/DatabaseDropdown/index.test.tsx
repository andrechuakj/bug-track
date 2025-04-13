import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DatabaseDropdown from '../../../src/components/DatabaseDropdown';
import {
  defaultSetCurrentTenant,
  MockSessionProvider,
  mockTenantA,
  mockTenantB,
} from '../../contexts/MockSessionProvider';
import { DbmsListResponseDto } from '../../../src/api/dbms';
import { expectFnLastCallToContainAnywhere } from '../../MockFnAssertUtils';

type RenderPageOptions = {
  currentTenant?: DbmsListResponseDto;
};
const renderComponent = (options: RenderPageOptions = {}) => {
  return render(
    <MockSessionProvider currentTenant={options.currentTenant}>
      <DatabaseDropdown />
    </MockSessionProvider>
  );
};

describe('DatabaseDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders placeholder when no tenant is selected', () => {
    const { getByText } = renderComponent({ currentTenant: undefined });
    expect(getByText('Select a Database')).toBeInTheDocument();
  });

  it('renders options based on tenantList', () => {
    const { getByRole, getByText } = renderComponent({
      currentTenant: undefined,
    });

    fireEvent.mouseDown(getByRole('combobox'));
    waitFor(() => {
      expect(getByText(mockTenantA.name)).toBeInTheDocument();
      expect(getByText(mockTenantB.name)).toBeInTheDocument();
    });
  });

  it('renders current tenant name when a tenant is selected', () => {
    const { getByText } = renderComponent({ currentTenant: mockTenantA });
    expect(getByText(mockTenantA.name)).toBeInTheDocument();
  });

  it('calls setCurrentTenant with the selected tenant id on change', async () => {
    const { getByRole, findByText } = renderComponent({
      currentTenant: undefined,
    });

    const selectInput = getByRole('combobox');
    fireEvent.mouseDown(selectInput);
    const optionToSelect = await findByText(mockTenantB.name);
    fireEvent.click(optionToSelect);

    expectFnLastCallToContainAnywhere(
      defaultSetCurrentTenant,
      mockTenantB.name
    );
  });
});
