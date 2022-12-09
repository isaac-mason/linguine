import type { NodeProps } from '../node'
import { Node } from '../node'

export class BufferByCountNode<T> extends Node {
  private buffer: T[] = []

  constructor(public count: number, props?: NodeProps) {
    super(props)
  }

  execute(input: T): void {
    this.buffer.push(input)

    if (this.buffer.length >= this.count) {
      this.emit(this.buffer)
      this.buffer = []
    }
  }
}
