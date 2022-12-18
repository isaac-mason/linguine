import type { Node, NodeProps } from './node'
import { PassthroughNode } from './nodes/passthrough-node'
import { StreamBuilder } from './stream-builder'

export class Topic<T> {
  _T!: T

  children: Node[] = []

  /**
   * Write data to the topic
   * @param data
   */
  write(data: T): void {
    this.children.forEach((node) => {
      node.execute(data)
    })
  }

  /**
   * Create a new stream builder for this topic
   */
  stream(props?: NodeProps): StreamBuilder<T> {
    const rootNode = new PassthroughNode(props)
    rootNode.parents.push(this)
    this.children.push(rootNode)

    return new StreamBuilder<T>(rootNode, props)
  }
}
