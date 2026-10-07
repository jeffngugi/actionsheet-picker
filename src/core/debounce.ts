export interface Debounced<A extends unknown[]> {
  (...args: A): void;
  cancel(): void;
  /** Runs a pending call immediately. */
  flush(): void;
}

export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  wait: number
): Debounced<A> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: A | undefined;

  const run = () => {
    timer = undefined;
    if (pending) {
      const args = pending;
      pending = undefined;
      fn(...args);
    }
  };

  const debounced = (...args: A) => {
    pending = args;
    if (timer !== undefined) clearTimeout(timer);
    if (wait <= 0) run();
    else timer = setTimeout(run, wait);
  };

  debounced.cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    pending = undefined;
  };

  debounced.flush = () => {
    if (timer !== undefined) clearTimeout(timer);
    run();
  };

  return debounced;
}
