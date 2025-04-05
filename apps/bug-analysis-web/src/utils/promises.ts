export type MaybePromise<T> = T | Promise<T>;

export const toPromise =
  <T, Args extends any[]>(maybePromise: (...args: Args) => MaybePromise<T>) =>
  (...args: Args): Promise<T> => {
    const result = maybePromise(...args);
    return result instanceof Promise ? result : Promise.resolve(result);
  };
