import { describe, expect, it, vi } from 'vitest'
import { Topic } from '../../src'

describe('DelayNode', () => {
  vi.useFakeTimers()

  it('should delay values', () => {
    const topic = new Topic<number>()
    const values: number[] = []

    topic
      .stream()
      .delay(1000)
      .forEach((v) => {
        values.push(v)
      })

    topic.write(1)

    expect(values).toEqual([])

    vi.advanceTimersByTime(2000)

    expect(values).toEqual([1])
  })
})
