import type { NodeProps } from '../node'
import { Node } from '../node'

export class MapNode<T, Out> extends Node {
  constructor(private fn: (data: T) => Out, props?: NodeProps) {
    super(props)
  }

  execute(input: T): void {
    this.emit(this.fn(input))
  }
}
