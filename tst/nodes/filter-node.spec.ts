import { describe, expect, it } from 'vitest'
import { Topic } from '../../src'

describe('FilterNode', () => {
  it('should filter values', () => {
    const topic = new Topic<number>()
    const values: number[] = []

    topic
      .stream()
      .filter((v) => v % 2 === 0)
      .forEach((v) => {
        values.push(v)
      })

    topic.write(1)
    topic.write(2)
    topic.write(3)
    topic.write(4)

    expect(values).toEqual([2, 4])
  })
})
