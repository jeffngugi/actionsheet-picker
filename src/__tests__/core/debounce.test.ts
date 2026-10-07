import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { debounce } from '../../core/debounce';

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls once with the latest arguments after the wait', () => {
    const fn = jest.fn<(q: string) => void>();
    const d = debounce(fn, 300);
    d('j');
    d('jo');
    jest.advanceTimersByTime(299);
    d('joh');
    jest.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('joh');
  });

  it('cancel drops the pending call', () => {
    const fn = jest.fn<(q: string) => void>();
    const d = debounce(fn, 100);
    d('a');
    d.cancel();
    jest.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();
  });

  it('flush runs the pending call immediately, once', () => {
    const fn = jest.fn<(q: string) => void>();
    const d = debounce(fn, 100);
    d('a');
    d.flush();
    jest.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
    d.flush(); // nothing pending
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('runs synchronously with a zero wait', () => {
    const fn = jest.fn<(q: string) => void>();
    debounce(fn, 0)('now');
    expect(fn).toHaveBeenCalledWith('now');
  });
});
