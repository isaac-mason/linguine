import type { NodeProps } from '../node'
import { Node } from '../node'

export class BufferByTimeNode<T> extends Node {
  private buffer: T[] = []

  constructor(public ms: number, props?: NodeProps) {
    super(props)
  }

  execute(input: T): void {
    this.buffer.push(input)

    if (this.buffer.length === 1) {
      setTimeout(() => {
        this.emit(this.buffer)
        this.buffer = []
      }, this.ms)
    }
  }
}
