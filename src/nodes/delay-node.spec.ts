import { describe, expect, it } from '@jest/globals'
import { Topic } from '..'

describe('DelayNode', () => {
  jest.useFakeTimers()

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

    jest.advanceTimersByTime(2000)

    expect(values).toEqual([1])
  })
})
