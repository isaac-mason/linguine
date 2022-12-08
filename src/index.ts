export type NodeProps = {
  deferred?: boolean;
};

export abstract class Node {
  parent?: Node | Topic<unknown>;
  children: Node[] = [];

  constructor(public props?: NodeProps) {}

  abstract execute(input: unknown): unknown;

  protected emit(output: unknown) {
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
  }
}

export class NoopNode<T> extends Node {
  execute(input: T): void {
    this.emit(input);
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

export class DebounceNode<T> extends Node {
  private lastValue: T | null = null

  private timeout: number | null = null

  constructor(public ms: number, props?: NodeProps) {
    super(props);
  }

  execute(input: T): void {
    this.lastValue = input

    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    this.timeout = setTimeout(() => {
      this.emit(this.lastValue)
      this.lastValue = null;
    }, this.ms)
  }
}

export class StreamBuilder<T> {
  T: T;

  constructor(private current: Node | Topic<T>) {}

  /**
   * Calls the provided function with the input
   * @param fn
   * @returns
   */
  forEach(fn: (value: T) => void) {
    const node = new ForEachNode(fn);

    node.parent = this.current;
    this.current.children.push(node);
  }

  /**
   * Returns the output
   * @param fn
   * @returns
   */
  map<Out>(fn: (value: T) => Out) {
    const node = new MapNode(fn);

    node.parent = this.current;
    this.current.children.push(node);

    return new StreamBuilder<Out>(node);
  }

  /**
   * Returns the output
   * @param fn
   * @returns
   */
  flatMap<Out>(fn: (value: T) => Out[]) {
    const node = new FlatMapNode(fn);

    node.parent = this.current;
    this.current.children.push(node);

    return new StreamBuilder<Out>(node);
  }

  /**
   * Returns the input if the function returns true
   * @param fn
   * @returns
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
   * const topic = new Topic() 
   * topic.stream().debounce(1000).forEach((value) => console.log(value))
   * topic.push(1)
   * ```
   */
  debounce(ms: number) {
    const node = new DebounceNode(ms);

    node.parent = this.current;
    this.current.children.push(node);

    return new StreamBuilder(node);
  }

  /**
   * Writes to the provided topic
   * @param topic
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
   */
  join<S extends StreamBuilder<unknown>[]>(...streams: [...S]) {
    const joinNode = new NoopNode();

    this.current.children.push(joinNode);
    streams.forEach((stream) => {
      stream.current.children.push(joinNode);
    });

    return new StreamBuilder<[...S][number]["T"] | this["T"]>(joinNode);
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
    const rootNode = new NoopNode();
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

filteredAndDoubled.map((data) => data.toString()).to(toStringTopic);

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
