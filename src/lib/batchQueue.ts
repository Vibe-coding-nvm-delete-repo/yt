import { QueueOptions, QueueResult } from '@/types';

/**
 * runWithConcurrency
 *
 * Executes an array of task factories (functions that return a Promise) with bounded concurrency,
 * optional AbortSignal support, and simple retry/backoff logic.
 *
 * - tasks: array of functions returning Promise<T>
 * - options.concurrency: number of concurrent workers (default 2)
 * - options.signal: AbortSignal for cancelling the whole run
 * - options.onProgress: callback(completed, total)
 * - options.retryAttempts: number of retry attempts on failure (default 1)
 * - options.retryDelay: base delay in ms for exponential backoff (default 300)
 *
 * Returns: Promise<QueueResult<T>>
 *
 * Note: This helper does not attempt to interpret errors (e.g. 4xx vs 5xx). Calling code
 * may inspect thrown errors and decide whether to retry/categorize them.
 */
export async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  options: QueueOptions = {}
): Promise<QueueResult<T>> {
  const concurrency = options.concurrency && options.concurrency > 0 ? options.concurrency : 2;
  const total = tasks.length;
  const results: (T | Error)[] = new Array(total);
  let completed = 0;
  const errors: Error[] = [];

  // Shared index for workers
  let index = 0;

  // If signal is aborted before start, throw
  if (options.signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const onProgress = options.onProgress;
  const retryAttempts = typeof options.retryAttempts === 'number' ? options.retryAttempts : 1;
  const retryDelay = typeof options.retryDelay === 'number' ? options.retryDelay : 300;

  // Helper: sleep with jitter
  const sleep = (ms: number) =>
    new Promise<void>((res) => {
      const t = setTimeout(res, ms);
      if (options.signal) {
        options.signal.addEventListener(
          'abort',
          () => {
            clearTimeout(t);
            res();
          },
          { once: true }
        );
      }
    });

  // Worker that picks next task index and runs it
  const worker = async (): Promise<void> => {
    while (true) {
      if (options.signal?.aborted) {
        // Stop processing further tasks
        throw new DOMException('Aborted', 'AbortError');
      }

      const current = index++;
      if (current >= tasks.length) {
        return;
      }

      const taskFactory = tasks[current];
      let attempt = 0;

      while (true) {
        try {
          const value = await taskFactory();
          results[current] = value;
          break;
        } catch (err) {
          attempt++;
          const errName = (err as { name?: string })?.name;
          const isAbort = (err instanceof DOMException && err.name === 'AbortError') || errName === 'AbortError';
          if (isAbort || options.signal?.aborted) {
            // propagate abort
            throw new DOMException('Aborted', 'AbortError');
          }

          if (attempt > retryAttempts) {
            const error = err instanceof Error ? err : new Error(String(err));
            results[current] = error;
            errors.push(error);
            break;
          }

          // Exponential backoff with jitter
          const backoff = Math.round(retryDelay * Math.pow(2, attempt - 1));
          const jitter = Math.round(Math.random() * 0.2 * backoff); // ±20% jitter
          await sleep(backoff + jitter);
          // retry
        }
      }

      completed++;
      try {
        onProgress?.(completed, total);
      } catch {
        // ignore progress handler errors
      }
    }
  };

  // Launch workers
  const workers: Promise<void>[] = [];
  const workerCount = Math.min(concurrency, tasks.length);
  for (let i = 0; i < workerCount; i++) {
    workers.push(
      worker().catch((err) => {
        // If AbortError, propagate later; otherwise record
        if (err instanceof DOMException && err.name === 'AbortError') {
          throw err;
        }
        // Non-fatal - push to errors array
        errors.push(err instanceof Error ? err : new Error(String(err)));
      })
    );
  }

  // Wait for workers
  try {
    await Promise.all(workers);
  } catch (err) {
    // If aborted, ensure we surface it as an AbortError
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    // otherwise continue to return partial results
  }

  return {
    results,
    completed,
    total,
    errors,
  };
}

export default runWithConcurrency;
