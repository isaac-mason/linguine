import { describe, expect, it } from '@jest/globals'
import { Topic } from '..'

describe('MapNode', () => {
  it('should map values', () => {
    const topic = new Topic<number>()
    let value: number | undefined

    topic
      .stream()
      .map((v) => v * 2)
      .forEach((v) => {
        value = v
      })

    topic.write(1)

    expect(value).toBe(2)
  })
})
