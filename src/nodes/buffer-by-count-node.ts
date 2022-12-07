import type { NodeProps } from '../node'
import { BufferUntilNode } from './buffer-until-node'

export class BufferByCountNode<T> extends BufferUntilNode<T> {
  constructor(public count: number, props?: NodeProps) {
    const shouldEmit = (buffer: T[]) => buffer.length >= this.count
    super(shouldEmit, props)
  }
}
