import { Node } from '../node'

export class SkipDuplicatesNode<T> extends Node {
  private lastValue: T | null = null

  execute(input: T): void {
    if (this.lastValue !== input) {
      this.emit(input)
      this.lastValue = input
    }
  }
}
