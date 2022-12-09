import { describe, expect, it } from '@jest/globals'
import { Topic } from '..'

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
