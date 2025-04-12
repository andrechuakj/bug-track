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
