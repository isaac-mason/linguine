import { describe, expect, it, vi } from 'vitest'
import { Topic } from '../../src'

describe('ThrottleByTimeNode', () => {
  vi.useFakeTimers()

  it('should throttle by time', () => {
    const topic = new Topic<number>()
    const values: number[] = []

    topic
      .stream()
      .throttleByTime(1000)
      .forEach((v) => {
        values.push(v)
      })

    topic.write(1)

    expect(values).toEqual([])

    vi.advanceTimersByTime(2000)

    expect(values).toEqual([1])
  })
})
