import '@testing-library/jest-dom/vitest';

if (typeof window !== 'undefined' && !window.matchMedia) {
  // @ts-expect-error creating mock to make antd's Grid.useBreakpoint work,
  //   which allows Login to render.
  //   Does not implement all other methods otherwise expected.
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
  });
}
