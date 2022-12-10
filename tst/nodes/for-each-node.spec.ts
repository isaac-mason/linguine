import { describe, expect, it } from '@jest/globals'
import { Topic } from '../../src'

describe('ForEachNode', () => {
  it('should call the callback for each event, and should be a terminal operation', () => {
    const topic = new Topic<number>()
    const values: number[] = []

    topic.stream().forEach((v) => {
      values.push(v)
    })

    topic.write(1)
    topic.write(2)

    expect(values).toEqual([1, 2])
  })
})
