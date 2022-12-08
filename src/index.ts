export type NodeProps = {
  deferred?: boolean;
};

export abstract class Node {
  parent?: Node | Topic<unknown>;
  children: Node[] = [];
  errorHandler?: (error: unknown) => void;

  constructor(public props?: NodeProps) {}

  abstract execute(input: unknown): unknown;

  protected emit(output: unknown) {
    try {
      const emit = () => {
        this.children.forEach((child) => {
          child.execute(output);
        });
      };

      if (this.props?.deferred) {
        setTimeout(() => emit());
      } else {
        emit();
      }
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(error);
      } else {
        throw error;
      }
    }
  }
}

export class PassthroughNode<T> extends Node {
  execute(input: T): void {
    this.emit(input);
  }
}

export class CatchErrorNode<T> extends PassthroughNode<T> {
  constructor(public fn: (error: unknown) => void) {
    super();
    this.errorHandler = fn;
  }
}

export class ForEachNode<T> extends Node {
  constructor(private fn: (data: T) => void, props?: NodeProps) {
    super(props);
  }

  execute(input: T): void {
    this.fn(input);
  }
}

export class MapNode<T, Out> extends Node {
  constructor(private fn: (data: T) => Out, props?: NodeProps) {
    super(props);
  }

  execute(input: T): void {
    this.emit(this.fn(input));
  }
}

export class FlatMapNode<T, Out> extends Node {
  constructor(private fn: (data: T) => Out[], props?: NodeProps) {
    super(props);
  }

  execute(input: T): void {
    const outputs = this.fn(input);

    for (const output of outputs) {
      this.emit(output);
    }
  }
}

export class FilterNode<T> extends Node {
  constructor(private fn: (data: T) => boolean, props?: NodeProps) {
    super(props);
  }

  execute(input: T): void {
    if (this.fn(input)) {
      this.emit(input);
    }
  }
}

export class WriteToTopicNode<T> extends Node {
  constructor(private topic: Topic<T>, props?: NodeProps) {
    super(props);
  }

  execute(input: T): void {
    this.topic.push(input);
  }
}

export class DelayNode<T> extends Node {
  constructor(public ms: number, props?: NodeProps) {
    super(props);
  }

  execute(input: T): void {
    setTimeout(() => {
      this.emit(input);
    }, this.ms);
  }
}

export class BufferByCountNode<T> extends Node {
  private buffer: T[] = [];

  constructor(public count: number, props?: NodeProps) {
    super(props);
  }

  execute(input: T): void {
    this.buffer.push(input);

    if (this.buffer.length >= this.count) {
      this.emit(this.buffer);
      this.buffer = [];
    }
  }
}

export class BufferByTimeNode<T> extends Node {
  private buffer: T[] = [];

  constructor(public ms: number, props?: NodeProps) {
    super(props);
  }

  execute(input: T): void {
    this.buffer.push(input);

    if (this.buffer.length === 1) {
      setTimeout(() => {
        this.emit(this.buffer);
        this.buffer = [];
      }, this.ms);
    }
  }
}

export class DebounceNode<T> extends Node {
  private lastValue: T | null = null;

  private timeout: number | null = null;

  constructor(public ms: number, props?: NodeProps) {
    super(props);
  }

  execute(input: T): void {
    this.lastValue = input;

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.emit(this.lastValue);
      this.lastValue = null;
    }, this.ms);
  }
}

export class ThrottleByTimeNode<T> extends Node {
  private timeout: number | null = null;

  constructor(public ms: number, props?: NodeProps) {
    super(props);
  }

  execute(input: T): void {
    if (!this.timeout) {
      this.timeout = setTimeout(() => {
        this.emit(input);
        this.timeout = null;
      }, this.ms);
    }
  }
}

export class StreamBuilder<T> {
  T: T;

  constructor(private current: Node | Topic<T>) {}

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
    const node = new ForEachNode(fn);

    node.parent = this.current;
    this.current.children.push(node);
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
    const node = new MapNode(fn);

    node.parent = this.current;
    this.current.children.push(node);

    return new StreamBuilder<Out>(node);
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
    const node = new FlatMapNode(fn);

    node.parent = this.current;
    this.current.children.push(node);

    return new StreamBuilder<Out>(node);
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
  filter<S extends T>(fn: (value: T) => value is S): StreamBuilder<S>;
  filter(fn: (value: T) => boolean): StreamBuilder<T>;
  filter(fn: (value: any) => any) {
    const node = new FilterNode(fn);

    node.parent = this.current;
    this.current.children.push(node);

    return new StreamBuilder(node);
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
   * topic.push(1)
   * ```
   */
  debounce(ms: number) {
    const node = new DebounceNode(ms);

    node.parent = this.current;
    this.current.children.push(node);

    return new StreamBuilder<T>(node);
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
   * topic.push(1)
   * ```
   */
  delay(ms: number) {
    const node = new DelayNode(ms);

    node.parent = this.current;
    this.current.children.push(node);

    return new StreamBuilder<T>(node);
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
   * topic.push(1);
   * topic.push(2);
   * topic.push(3);
   * ```
   */
  bufferByCount(count: number) {
    const node = new BufferByCountNode(count);

    node.parent = this.current;
    this.current.children.push(node);

    return new StreamBuilder<T[]>(node);
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
   * topic.push(1);
   * topic.push(2);
   * topic.push(3);
   * ```
   */
  bufferByTime(ms: number) {
    const node = new BufferByTimeNode<T>(ms);

    node.parent = this.current;
    this.current.children.push(node);

    return new StreamBuilder<T[]>(node);
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
   * topic.push(1);
   * topic.push(2);
   * 
   * setTimeout(() => {
   *  topic.push(3);
   * }, 2000);
   * ```
   */
  throttleByTime(ms: number) {
    const node = new ThrottleByTimeNode(ms);

    node.parent = this.current;
    this.current.children.push(node);

    return new StreamBuilder<T>(node);
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
   * topic.push(1);
   * ```
   */
  to(topic: Topic<T>): void {
    const node = new WriteToTopicNode(topic);

    node.parent = this.current;
    this.current.children.push(node);
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
    const joinNode = new PassthroughNode();

    this.current.children.push(joinNode);
    streams.forEach((stream) => {
      stream.current.children.push(joinNode);
    });

    return new StreamBuilder<[...S][number]["T"] | this["T"]>(joinNode);
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
  catchError(fn: (error: any) => void) {
    const node = new CatchErrorNode(fn);

    node.parent = this.current;
    this.current.children.push(node);

    return new StreamBuilder<T>(node);
  }
}

export class Topic<T> {
  children: Node[] = [];

  /**
   * Push data to the topic
   * @param data
   */
  push(data: T): void {
    this.children.forEach((node) => {
      node.execute(data);
    });
  }

  /**
   * Create a new stream builder for this topic
   */
  stream(): StreamBuilder<T> {
    const rootNode = new PassthroughNode();
    this.children.push(rootNode);

    return new StreamBuilder<T>(rootNode);
  }
}

const inputNumberTopic = new Topic<number>();

const doubledNumberTopic = new Topic<number>();
const filteredAndDoubledNumberTopic = new Topic<number>();
const toStringTopic = new Topic<string>();

const doubled = inputNumberTopic.stream().map((value) => value * 2);
doubled.to(doubledNumberTopic);

const filteredAndDoubled = doubled.filter((value) => 5 < value);
filteredAndDoubled.to(filteredAndDoubledNumberTopic);

const toString = filteredAndDoubled.map((data) => data.toString());

toString.to(toStringTopic);

doubledNumberTopic.stream().forEach((data) => {
  console.log("outTopic - " + data);
});

filteredAndDoubledNumberTopic.stream().forEach((data) => {
  console.log("filteredOutTopic - " + data);
});

toStringTopic.stream().forEach((data) => {
  console.log("toStringTopic - " + data);
});

inputNumberTopic.push(1);
inputNumberTopic.push(2);
inputNumberTopic.push(3);

/// ---

const input = new Topic<number>();

input
  .stream()
  .catchError((error) => console.log(`caught error - ${error}`))
  .map((value) => {
    return value
  })
  .catchError((error) => console.log(`caught error here instead - ${error}`))
  .map((value) => {
    throw new Error("testing error")
  })

  input.push(1)