import { expect, Mock } from 'vitest';

export const expectComponentCalledWithPropsContaining = (
  mockComponent: Mock,
  expectedProps: Record<string, unknown>
) => {
  expect(mockComponent).toHaveBeenCalled();
  const lastCallArgs = mockComponent.mock.lastCall;
  expect(lastCallArgs).toBeDefined();
  if (lastCallArgs) {
    const receivedProps = lastCallArgs[0] as unknown;
    expect(receivedProps).toEqual(expect.objectContaining(expectedProps));
  }
};

export const expectNthCallWithPropsContaining = (
  mockComponent: Mock,
  callIndex: number, // 1-based index
  expectedProps: Record<string, unknown>
) => {
  expect(mockComponent).toHaveBeenCalled();
  expect(mockComponent.mock.calls.length).toBeGreaterThanOrEqual(callIndex);

  const nthCallArgs = mockComponent.mock.calls[callIndex - 1];
  expect(nthCallArgs).toBeDefined();

  if (nthCallArgs) {
    const receivedProps = nthCallArgs[0] as unknown;
    expect(receivedProps).toEqual(expect.objectContaining(expectedProps));
  }
};
