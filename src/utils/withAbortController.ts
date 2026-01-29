/**
 * Wraps a callback function in a factory decorator to provide abort controller functionality.
 * If a new call is made while a previous one is still running, the previous execution
 * will be aborted using an AbortController.
 *
 * @param callback - The async function to wrap with abort controller functionality. Receives an AbortSignal as parameter.
 * @returns A new function that aborts any previous pending execution before starting a new one
 *
 * @example
 * ```typescript
 * const fetchData = withAbortController(async (signal) => {
 *   const response = await axios.get('/api/data', { signal });
 *   return response.data;
 * });
 *
 * // First call starts
 * fetchData();
 * // Second call aborts the first one
 * fetchData();
 * ```
 */
export function withAbortController(callback: (signal: AbortSignal) => Promise<unknown>): () => Promise<unknown> {
  let abortController: AbortController | undefined = undefined
  return () => {
    if (abortController !== undefined) {
      abortController.abort()
    }
    abortController = new AbortController()
    return callback(abortController.signal)
  }
}
