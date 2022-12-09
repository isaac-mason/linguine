import { Topic } from './topic'

export type NodeProps = {
  deferred?: boolean
}

export abstract class Node {
  parent?: Node | Topic<unknown>

  children: Node[] = []

  public props?: NodeProps

  errorHandler?: <E extends Error>(error: E) => void

  constructor(props?: NodeProps) {
    this.props = props
  }

  abstract execute(input: unknown): unknown

  protected emit(output: unknown) {
    try {
      const emit = () => {
        this.children.forEach((child) => {
          child.execute(output)
        })
      }

      if (this.props?.deferred) {
        setTimeout(() => emit())
      } else {
        emit()
      }
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(error as Error)
      } else {
        throw error
      }
    }
  }
}
