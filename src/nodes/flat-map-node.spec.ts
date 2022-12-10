import { describe, expect, it } from '@jest/globals'
import { Topic } from '..'

describe('FlatMapNode', () => {
  it('should flat map values', () => {
    const topic = new Topic<number>()
    const values: number[] = []

    topic
      .stream()
      .flatMap((v) => [v, v * 2])
      .forEach((v) => {
        values.push(v)
      })

    topic.write(1)

    expect(values).toEqual([1, 2])
  })
})
