import { inspect } from 'util';
import { expect, Mock } from 'vitest';
import util from 'node:util';

export const expectComponentLastCalledWithPropsContaining = (
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

export const expectComponentNthCallWithPropsContaining = (
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

export const expectComponentAnyCallWithPropsContaining = (
  mockComponent: Mock,
  expectedProps: Record<string, unknown>
) => {
  expect(mockComponent.mock.calls).toEqual(
    expect.arrayContaining([
      expect.arrayContaining([expect.objectContaining(expectedProps)]),
    ])
  );
};

/**
 * Checks if a mock function was called at least once
 * with the specified argument value present anywhere in the arguments list of any call.
 */
export const expectFnAnyCallContainingArgs = (
  mockFn: Mock,
  expectedArg: unknown
) => {
  expect(mockFn).toHaveBeenCalled();

  const calls = mockFn.mock.calls;
  expect(calls).toEqual(
    expect.arrayContaining([expect.arrayContaining([expectedArg])])
  );
};

export const expectFnLastCallToContainAnywhere = (
  mockFn: Mock,
  expectedArg: unknown
) => {
  expect(mockFn).toHaveBeenCalled();

  const calls = mockFn.mock.calls;
  const lastCall = calls[calls.length - 1];
  expect(util.inspect(lastCall, { depth: null })).toContain(expectedArg);
};
