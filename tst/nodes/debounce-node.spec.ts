import { describe, expect, it, vi } from 'vitest'
import { Topic } from '../../src'

describe('DebounceNode', () => {
  vi.useFakeTimers()

  it('should debounce values', () => {
    const topic = new Topic<number>()
    const values: number[] = []

    topic
      .stream()
      .debounce(1000)
      .forEach((v) => {
        values.push(v)
      })

    topic.write(1)
    topic.write(2)

    expect(values).toEqual([])

    vi.advanceTimersByTime(2000)

    expect(values).toEqual([2])
  })
})
