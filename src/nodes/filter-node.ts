import type { NodeProps } from '../node'
import { Node } from '../node'

export class FilterNode<T> extends Node {
  constructor(private fn: (data: T) => boolean, props?: NodeProps) {
    super(props)
  }

  execute(input: T): void {
    if (this.fn(input)) {
      this.emit(input)
    }
  }
}
