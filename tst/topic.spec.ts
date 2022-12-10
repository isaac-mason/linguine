import { describe, it, expect } from '@jest/globals'
import { Topic } from '../src'

describe('Topic', () => {
  it('should construct', () => {
    const topic = new Topic()

    expect(topic).toBeDefined()
  })

  it('should emit data to streams', () => {
    const topic = new Topic<number>()
    let value: number | undefined

    topic.stream().forEach((v) => {
      value = v
    })

    topic.write(1)

    expect(value).toBe(1)
  })
})
