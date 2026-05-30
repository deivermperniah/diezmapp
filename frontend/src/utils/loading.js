const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

export const withMinimumDelay = async (task, delay = 600) => {
  const startedAt = Date.now()

  try {
    return await task()
  } finally {
    const remaining = delay - (Date.now() - startedAt)
    if (remaining > 0) {
      await wait(remaining)
    }
  }
}
