import { describe, expect, it } from 'vitest'
import { Topic } from '../../src'

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
