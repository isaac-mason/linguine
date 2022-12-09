import { PassthroughNode } from './passthrough-node'

export class CatchErrorNode<T> extends PassthroughNode<T> {
  constructor(public fn: (error: Error) => void) {
    super()
    this.errorHandler = fn
  }
}
