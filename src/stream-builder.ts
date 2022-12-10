import { Node, NodeProps } from './node'
import {
  BufferByCountNode,
  BufferByTimeNode,
  CatchErrorNode,
  DebounceNode,
  DelayNode,
  FilterNode,
  FlatMapNode,
  ForEachNode,
  MapNode,
  PassthroughNode,
  SkipDuplicatesNode,
  ThrottleByTimeNode,
  WriteToTopicNode,
} from './nodes'
import type { Topic } from './topic'

export type StreamBuilderProps = {
  deferred: boolean
}

export class StreamBuilder<T> {
  T!: T

  private props: NodeProps | undefined

  private current: Node | Topic<T>

  constructor(current: Node | Topic<T>, props?: NodeProps) {
    this.props = props
    this.current = current
  }

  /**
   * Calls the provided function with the input. Terminal node.
   * @param fn
   * @returns
   *
   * @example
   * ```ts
   * const topic = new Topic<number>();
   * topic.stream().forEach((value) => console.log(value));
   * ```
   */
  forEach(fn: (value: T) => void) {
    const node = new ForEachNode(fn, this.props)

    node.parent = this.current
    this.current.children.push(node)
  }

  /**
   * Returns the output of the function
   * @param fn
   * @returns
   *
   * @example
   * ```ts
   * const topic = new Topic<number>();
   * topic.stream().map((value) => value * 2);
   * ```
   */
  map<Out>(fn: (value: T) => Out) {
    const node = new MapNode(fn, this.props)

    node.parent = this.current
    this.current.children.push(node)

    return new StreamBuilder<Out>(node, this.props)
  }

  /**
   * Returns each output of the function
   * @param fn
   * @returns
   *
   * @example
   * ```ts
   * const topic = new Topic<number>();
   * topic.stream().flatMap((value) => [value, value * 2]);
   * ```
   */
  flatMap<Out>(fn: (value: T) => Out[]) {
    const node = new FlatMapNode(fn, this.props)

    node.parent = this.current
    this.current.children.push(node)

    return new StreamBuilder<Out>(node, this.props)
  }

  /**
   * Returns the input if the filter function returns true
   * @param fn
   * @returns
   *
   * @example
   * ```ts
   * // Will only print even numbers
   * const topic = new Topic<number>();
   * topic.stream()
   *   .filter((value) => value % 2 === 0)
   *   .forEach((value) => console.log(value));
   */
  filter<S extends T>(fn: (value: T) => value is S): StreamBuilder<S>

  filter(fn: (value: T) => boolean): StreamBuilder<T>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter(fn: (value: any) => any) {
    const node = new FilterNode(fn, this.props)

    node.parent = this.current
    this.current.children.push(node)

    return new StreamBuilder(node, this.props)
  }

  /**
   * Debounces the stream by the given amount of milliseconds
   * @param ms
   * @returns
   *
   * @example
   * ```ts
   * // Will only print the last value after 1000ms have passed without a new value
   * const topic = new Topic<number>()
   * topic.stream().debounce(1000).forEach((value) => console.log(value))
   * topic.write(1)
   * ```
   */
  debounce(ms: number) {
    const node = new DebounceNode(ms, this.props)

    node.parent = this.current
    this.current.children.push(node)

    return new StreamBuilder<T>(node, this.props)
  }

  /**
   * Delays the stream by the given amount of milliseconds
   * @param ms
   * @returns
   *
   * @example
   * ```ts
   * // Will print 1 after 1000ms
   * const topic = new Topic<number>()
   * topic.stream().delay(1000).forEach((value) => console.log(value))
   * topic.write(1)
   * ```
   */
  delay(ms: number) {
    const node = new DelayNode(ms, this.props)

    node.parent = this.current
    this.current.children.push(node)

    return new StreamBuilder<T>(node, this.props)
  }

  /**
   * Buffers the stream by the given number of items
   * @param count
   * @returns
   *
   * @example
   * ```ts
   * // Will print [1, 2, 3] after 3 values have been pushed
   * const topic = new Topic<number>();
   * topic.stream()
   *   .bufferByCount(3)
   *   .forEach((value) => console.log(value));
   * topic.write(1);
   * topic.write(2);
   * topic.write(3);
   * ```
   */
  bufferByCount(count: number) {
    const node = new BufferByCountNode(count, this.props)

    node.parent = this.current
    this.current.children.push(node)

    return new StreamBuilder<T[]>(node, this.props)
  }

  /**
   * Buffers the stream by the given amount of milliseconds
   * @param ms
   * @returns
   *
   * @example
   * ```ts
   * // Will print [1, 2, 3] after 1000ms have passed without a new value
   * const topic = new Topic<number>();
   * topic.stream()
   *   .bufferByTime(1000)
   *   .forEach((value) => console.log(value));
   * topic.write(1);
   * topic.write(2);
   * topic.write(3);
   * ```
   */
  bufferByTime(ms: number) {
    const node = new BufferByTimeNode<T>(ms, this.props)

    node.parent = this.current
    this.current.children.push(node)

    return new StreamBuilder<T[]>(node, this.props)
  }

  /**
   * Ignores messages if a message has already been emitted in the last ms.
   * @param ms
   * @returns
   *
   * @example
   * ```ts
   * // Will only print 1 and 3
   * const topic = new Topic<number>();
   * topic.stream()
   *  .throttleByTime(1000)
   * .forEach((value) => console.log(value));
   * topic.write(1);
   * topic.write(2);
   *
   * setTimeout(() => {
   *  topic.write(3);
   * }, 2000);
   * ```
   */
  throttleByTime(ms: number) {
    const node = new ThrottleByTimeNode<T>(ms, this.props)

    node.parent = this.current
    this.current.children.push(node)

    return new StreamBuilder<T>(node, this.props)
  }

  /**
   * Ignores messages if they are equal to the previous message.
   * @returns
   *
   * @example
   * ```ts
   * // Will log "12"
   * const topic = new Topic<number>();
   * topic.stream()
   *   .skipDuplicates()
   *   .forEach((value) => console.log(value));
   * topic.write(1);
   * topic.write(1);
   * topic.write(2);
   * ```
   */
  skipDuplicates() {
    const node = new SkipDuplicatesNode<T>(this.props)

    node.parent = this.current
    this.current.children.push(node)

    return new StreamBuilder<T>(node, this.props)
  }

  /**
   * Writes to the provided topic
   * @param topic
   *
   * @example
   * ```ts
   * const topic = new Topic<number>();
   * const otherTopic = new Topic<number>();
   * topic.stream().map((value) => value * 2).to(otherTopic);
   * topic.write(1);
   * ```
   */
  to(topic: Topic<T>): void {
    const node = new WriteToTopicNode(topic, this.props)

    node.parent = this.current
    this.current.children.push(node)
  }

  /**
   * Joins the given streams
   * @param streams
   * @returns
   *
   * @example
   * ```ts
   * const topic = new Topic<number>();
   * const doubledStream = topic.stream().map((value) => value * 2);
   * const tripledStream = topic.stream().map((value) => value * 3);
   * const joinedStream = doubledStream.join(tripledStream);
   * ```
   */
  join<S extends StreamBuilder<unknown>[]>(...streams: [...S]) {
    const joinNode = new PassthroughNode(this.props)

    this.current.children.push(joinNode)
    streams.forEach((stream) => {
      stream.current.children.push(joinNode)
    })

    return new StreamBuilder<[...S][number]['T'] | this['T']>(
      joinNode,
      this.props
    )
  }

  /**
   * Calls the provided function when an error occurs
   * @param fn
   * @returns
   *
   * @example
   * ```ts
   * const topic = new Topic<number>();
   * topic.stream().catchError((error) => console.log(error));
   * ```
   */
  catchError(fn: (error: Error) => void) {
    const node = new CatchErrorNode(fn)

    node.parent = this.current
    this.current.children.push(node)

    return new StreamBuilder<T>(node, this.props)
  }
}
