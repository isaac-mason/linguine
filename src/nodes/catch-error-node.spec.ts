import { describe, expect, it } from '@jest/globals'
import { Topic } from '..'

describe('CatchErrorNode', () => {
  it('should catch errors', () => {
    const topic = new Topic<number>()
    let errorCaught = false

    topic
      .stream()
      .catchError(() => {
        errorCaught = true
      })
      .forEach(() => {
        throw new Error('error')
      })

    topic.write(1)

    expect(errorCaught).toBe(true)
  })

  it('should not catch errors if the error is thrown upstream of the CatchErrorNode', () => {
    const topic = new Topic<number>()
    let errorCaught = false

    topic
      .stream()
      .map(() => {
        throw new Error('error')
      })
      .catchError(() => {
        errorCaught = true
      })

    try {
      topic.write(1)
      fail()
    } catch (error) {
      expect((error as Error).message).toBe('error')
      expect(errorCaught).toBe(false)
    }
  })
})
