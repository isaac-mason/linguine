import type { NodeProps } from '../node'
import { Node } from '../node'
import type { Topic } from '../topic'

export class WriteToTopicNode<T> extends Node {
  constructor(private topic: Topic<T>, props?: NodeProps) {
    super(props)
  }

  execute(input: T): void {
    this.topic.write(input)
  }
}
