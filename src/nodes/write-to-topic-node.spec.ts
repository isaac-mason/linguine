import { describe, expect, it } from '@jest/globals'
import { Topic } from '..'

describe('WriteToTopicNode', () => {
  it('should write to topic', () => {
    const inTopic = new Topic<number>()
    const outTopic = new Topic<number>()
    let value: number | undefined

    inTopic.stream().to(outTopic)

    outTopic.stream().forEach((v) => {
      value = v
    })

    inTopic.write(1)

    expect(value).toBe(1)
  })
})
