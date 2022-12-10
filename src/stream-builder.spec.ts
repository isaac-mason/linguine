import { describe, it, expect } from '@jest/globals'
import { Topic } from '.'

describe('StreamBuilder', () => {
  describe('join', () => {
    it('should join streams', () => {
      const topic1 = new Topic<number>()
      const topic2 = new Topic<number>()
      const values: number[] = []

      topic1
        .stream()
        .join(topic2.stream())
        .forEach((v) => {
          values.push(v)
        })

      topic1.write(1)
      topic2.write(2)
      topic1.write(3)
      topic2.write(4)

      expect(values).toEqual([1, 2, 3, 4])
    })
  })

  describe('deferred', () => {
    it('should create deferred stream', (done) => {
      const topic = new Topic<number>()
      const values: number[] = []

      topic.stream({ deferred: true }).forEach((v) => {
        values.push(v)
      })

      topic.write(1)
      topic.write(2)
      topic.write(3)

      expect(values).toEqual([])

      setTimeout(() => {
        expect(values).toEqual([1, 2, 3])
        done()
      })
    })
  })
})
