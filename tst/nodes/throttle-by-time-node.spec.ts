import { describe, expect, it } from '@jest/globals'
import { Topic } from '../../src'

describe('ThrottleByTimeNode', () => {
  jest.useFakeTimers()

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

    jest.advanceTimersByTime(2000)

    expect(values).toEqual([1])
  })
})
