import { describe, expect, it } from '@jest/globals'
import { Topic } from '../../src'

describe('DebounceNode', () => {
  jest.useFakeTimers()

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

    jest.advanceTimersByTime(2000)

    expect(values).toEqual([2])
  })
})
