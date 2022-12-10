import type { NodeProps } from '../node'
import { Node } from '../node'

export class BufferUntilNode<T> extends Node {
  protected buffer: T[] = []

  constructor(public shouldEmit: (buffer: T[]) => boolean, props?: NodeProps) {
    super(props)
  }

  execute(input: T): void {
    this.buffer.push(input)

    if (this.shouldEmit(this.buffer)) {
      this.emit(this.buffer)
      this.buffer = []
    }
  }
}
