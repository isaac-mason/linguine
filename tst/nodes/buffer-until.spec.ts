import { describe, expect, it } from '@jest/globals'
import { Topic } from '../../src'

describe('BufferUntilNode', () => {
  it('should buffer until a given function returns true', () => {
    const topic = new Topic<number>()
    const values: number[][] = []

    topic
      .stream()
      .bufferUntil((v) => v.includes(3))
      .forEach((v) => {
        values.push(v)
      })

    topic.write(1)
    topic.write(2)
    topic.write(3)

    expect(values).toEqual([[1, 2, 3]])
  })
})
