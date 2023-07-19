import { describe, expect, it } from 'vitest'
import { Topic } from '../../src'

describe('SkipDuplicatesNode', () => {
  it('should skip duplicates', () => {
    const topic = new Topic<number>()
    const values: number[] = []

    topic
      .stream()
      .skipDuplicates()
      .forEach((v) => {
        values.push(v)
      })

    topic.write(1)
    topic.write(1)
    topic.write(2)

    expect(values).toEqual([1, 2])
  })
})
