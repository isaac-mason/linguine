export class Node {
  public children: Node[] = [];
  public operation?: Operation;

  constructor() {}

  handle(input: any): any {
    // default output is the input
    let output = input;

    // if there is an operation, execute it
    if (this.operation) {
      output = this.operation.handle(input);

      // if the operation returns undefined, stop the chain
      if (output === undefined) {
        return;
      }
    }

    // if there are children nodes, execute them
    if (this.children.length !== 0) {
      this.children.forEach((child) => {
        child.handle(output);
      });
    }
  }
}

export abstract class Operation {
  abstract handle(input: unknown): unknown | undefined;
}

export class DoOperation<T> {
  constructor(private fn: (data: T) => void) {}

  handle(input: T): T {
    this.fn(input);
    return input;
  }
}

export class MapOperation<T, Out> {
  constructor(private fn: (data: T) => Out) {}

  handle(input: T): Out {
    return this.fn(input);
  }
}

export class FilterOperation<T> {
  constructor(private fn: (data: T) => boolean) {}

  handle(input: T): T | undefined {
    if (this.fn(input)) {
      return input;
    }
    return undefined;
  }
}

export class WriteToTopicOperation<T> {
  constructor(private topic: Topic<T>) {}

  handle(input: T): T | undefined {
    this.topic.push(input);
    return undefined;
  }
}

export class StreamBuilder<T> {
  constructor(private parent: Node | Topic<T>) {}

  /**
   * Calls the provided function and returns the input
   * @param fn
   * @returns
   */
  do(fn: (data: T) => void) {
    const node = this.createNode(new DoOperation<T>(fn));
    return new StreamBuilder<T>(node);
  }

  /**
   * Returns the output
   * @param fn
   * @returns
   */
  map<Out>(fn: (data: T) => Out) {
    const node = this.createNode(new MapOperation<T, Out>(fn));
    return new StreamBuilder<Out>(node);
  }

  /**
   * Returns the input if the function returns true
   * @param fn
   * @returns
   */
  filter(fn: (data: T) => boolean) {
    const node = this.createNode(new FilterOperation<T>(fn));
    return new StreamBuilder<T>(node);
  }

  /**
   * Writes to the provided topic
   * @param topic
   */
  to(topic: Topic<T>): void {
    const node = this.createNode(new WriteToTopicOperation<T>(topic));
  }

  private createNode(operation: Operation): Node {
    const node = new Node();
    node.operation = operation;
    this.parent.children.push(node);
    return node;
  }
}

export class Topic<T> {
  children: Operation[] = [];

  /**
   * Push data to the topic
   * @param data
   */
  push(data: T): void {
    this.children.forEach((node) => {
      node.handle(data);
    });
  }

  /**
   * Create a new stream builder for this topic
   */
  stream(): StreamBuilder<T> {
    const rootNode = new Node();
    this.children.push(rootNode);

    return new StreamBuilder<T>(rootNode);
  }
}

const inputNumberTopic = new Topic<number>();
const doubledNumberTopic = new Topic<number>();
const filteredDoubledNumberTopic = new Topic<number>();

const doubled = inputNumberTopic.stream().map((data) => data * 2);

const filtered = doubled.filter((data) => data > 5);

filtered.to(filteredDoubledNumberTopic);
doubled.to(doubledNumberTopic);

doubledNumberTopic.stream().do((data) => {
  console.log("outTopic - " + data);
});
filteredDoubledNumberTopic.stream().do((data) => {
  console.log("filteredOutTopic - " + data);
});

inputNumberTopic.push(1);
inputNumberTopic.push(2);
inputNumberTopic.push(3);
