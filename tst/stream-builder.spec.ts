import { describe, it, expect } from 'vitest'
import { Topic } from '../src'

describe('StreamBuilder', () => {
  describe('merge', () => {
    it('should merge streams', () => {
      const topic1 = new Topic<number>()
      const topic2 = new Topic<number>()
      const values: number[] = []

      topic1
        .stream()
        .merge(topic2.stream())
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
    it('should create deferred stream', (): Promise<void> => {
      const topic = new Topic<number>()
      const values: number[] = []

      topic.stream({ deferred: true }).forEach((v) => {
        values.push(v)
      })

      topic.write(1)
      topic.write(2)
      topic.write(3)

      expect(values).toEqual([])

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(values).toEqual([1, 2, 3])
          resolve()
        })
      })
    })
  })

  describe('destroy', () => {
    it('should destroy the stream from the current node', () => {
      const values: number[] = []

      const topic = new Topic<number>()
      const stream = topic.stream()

      stream
        .map((v) => v * 2)
        .forEach((v) => {
          values.push(v)
        })

      topic.write(1)

      stream.destroy()

      topic.write(2)

      expect(values).toEqual([2])
    })

    it('should not destroy nodes upstream of the current node', () => {
      const values: (number | string)[] = []

      const numberTopic = new Topic<number>()

      const numberStream = numberTopic.stream()

      const stringStream = numberStream.map((v) => String(v))
      const doubleStream = numberStream.map((v) => v * 2)

      stringStream.forEach((v) => {
        values.push(v)
      })

      doubleStream.forEach((v) => {
        values.push(v)
      })

      numberTopic.write(1)

      doubleStream.destroy()

      numberTopic.write(2)

      expect(values).toEqual(['1', 2, '2'])
    })
  })
})
