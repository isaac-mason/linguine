import type { NodeProps } from '../node'
import { Node } from '../node'

export class ForEachNode<T> extends Node {
  constructor(private fn: (data: T) => void, props?: NodeProps) {
    super(props)
  }

  execute(input: T): void {
    this.fn(input)
  }
}
