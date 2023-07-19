import { describe, expect, it, vi } from 'vitest'
import { Topic } from '../../src'

describe('BufferByTimeNode', () => {
  vi.useFakeTimers()

  it('should buffer by time', () => {
    const topic = new Topic<number>()
    const values: number[][] = []

    topic
      .stream()
      .bufferByTime(1000)
      .forEach((v) => {
        values.push(v)
      })

    topic.write(1)
    topic.write(2)

    expect(values).toEqual([])

    vi.advanceTimersByTime(2000)

    expect(values).toEqual([[1, 2]])
  })
})
