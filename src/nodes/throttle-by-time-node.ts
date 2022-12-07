import type { NodeProps } from '../node'
import { Node } from '../node'

export class ThrottleByTimeNode<T> extends Node {
  private timeout: NodeJS.Timeout | null = null

  constructor(public ms: number, props?: NodeProps) {
    super(props)
  }

  execute(input: T): void {
    if (!this.timeout) {
      this.timeout = setTimeout(() => {
        this.emit(input)
        this.timeout = null
      }, this.ms)
    }
  }
}
