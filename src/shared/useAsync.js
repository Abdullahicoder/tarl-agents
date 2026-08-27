import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Run an async function and track loading/error/data.
 *
 * Every screen needs the same three states, and a teacher on a slow school
 * connection must be told which one they are in — so this returns all three
 * rather than letting a component render an empty list during a fetch.
 */
export function useAsync(fn, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({
    data: null,
    error: null,
    loading: immediate,
  })
  const generation = useRef(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callback = useCallback(fn, deps)

  const run = useCallback(async () => {
    const current = ++generation.current
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const data = await callback()
      if (current === generation.current) {
        setState({ data, error: null, loading: false })
      }
      return data
    } catch (error) {
      if (current === generation.current) {
        setState({ data: null, error, loading: false })
      }
      throw error
    }
  }, [callback])

  useEffect(() => {
    if (!immediate) return
    run().catch(() => {})
  }, [run, immediate])

  const setData = useCallback((updater) => {
    setState((s) => ({
      ...s,
      data: typeof updater === 'function' ? updater(s.data) : updater,
    }))
  }, [])

  return { ...state, reload: run, setData }
}
