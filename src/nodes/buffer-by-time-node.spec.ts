import { describe, expect, it } from '@jest/globals'
import { Topic } from '..'

describe('BufferByTimeNode', () => {
  jest.useFakeTimers()

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

    jest.advanceTimersByTime(2000)

    expect(values).toEqual([[1, 2]])
  })
})
