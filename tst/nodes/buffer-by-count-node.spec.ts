import { describe, expect, it } from '@jest/globals'
import { Topic } from '../../src'

describe('BufferByCountNode', () => {
  it('should buffer by count', () => {
    const topic = new Topic<number>()
    const values: number[][] = []

    topic
      .stream()
      .bufferByCount(2)
      .forEach((v) => {
        values.push(v)
      })

    topic.write(1)
    topic.write(2)
    topic.write(3)
    topic.write(4)
    topic.write(5)

    expect(values).toEqual([
      [1, 2],
      [3, 4],
    ])
  })
})
