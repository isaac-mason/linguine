import type { NodeProps } from '../node'
import { Node } from '../node'

export class DebounceNode<T> extends Node {
  private lastValue: T | null = null

  private timeout: NodeJS.Timeout | null = null

  constructor(public ms: number, props?: NodeProps) {
    super(props)
  }

  execute(input: T): void {
    this.lastValue = input

    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    this.timeout = setTimeout(() => {
      this.emit(this.lastValue)
      this.lastValue = null
    }, this.ms)
  }
}
