import type { NodeProps } from '../node'
import { Node } from '../node'

export class FlatMapNode<T, Out> extends Node {
  constructor(private fn: (data: T) => Out[], props?: NodeProps) {
    super(props)
  }

  execute(input: T): void {
    const outputs = this.fn(input)

    for (const output of outputs) {
      this.emit(output)
    }
  }
}
