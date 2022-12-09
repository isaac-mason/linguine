import type { NodeProps } from '../node'
import { Node } from '../node'

export class DelayNode<T> extends Node {
  constructor(public ms: number, props?: NodeProps) {
    super(props)
  }

  execute(input: T): void {
    setTimeout(() => {
      this.emit(input)
    }, this.ms)
  }
}
