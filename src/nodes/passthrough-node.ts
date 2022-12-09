import { Node } from '../node'

export class PassthroughNode<T> extends Node {
  execute(input: T): void {
    this.emit(input)
  }
}
