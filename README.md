# linguine 🍝

De-spaghettify your event logic! Declaratively compose event logic with Topics and Streams.

## Installation

```sh
$ npm install linguine # or yarn install
```

## Introduction

`linguine` is a library for declaratively composing event logic. It's like RxJS, but with fewer features, and generally worse! It's also a lot smaller, and has a simpler API.

`linguine` is built around two concepts: **Topics** and **Streams**.

A **Topic** is something you can write values to. A **Stream** takes values from a Topic and manipulates them. The beauty of linguine is Streams can branch and merge, allowing you to compose complex event logic in a declarative way.

## Simple Example

```ts
import { Topic } from 'linguine'

const numberTopic = new Topic<number>()
const doubledNumberTopic = new Topic<number>()

numberTopic
  .stream()
  .map((value) => value * 2)
  .to(doubledNumberTopic)
```

## Stream APIs

### `map`

Calls the given function for each value in the stream.

```ts
const topic = new Topic<number>()

// double each value
topic.stream().map((value) => value * 2)
```

### `flatMap`

Calls the given function for each value in the stream, and returns multiple messages. The givenfunction must return an array.

```ts
const topic = new Topic<number>()

// return the original value, plus the doubled value
topic.stream().flatMap((value) => [value, value * 2])
```

### `filter`

Only pass values through the stream that match a predicate.

```ts
const topic = new Topic<number>()

// only pass even numbers through the stream
topic.stream().filter((value) => value % 2 === 0)
```

### `forEach`

Call a function on each value in the stream.

```ts
const topic = new Topic<number>()

// log each value
topic.stream().forEach((value) => console.log(value))
```

### `to`

Write each value in the stream to a topic. This is a terminal operation.

```ts
const inputTopic = new Topic<number>()
const outputTopic = new Topic<number>()

// write each value to another topic
topic.stream().to(outputTopic)
```

### `merge`

Merge two streams together.

```ts
const topicA = new Topic<number>()
const topicB = new Topic<string>()

const streamA = topicA.stream()
const streamB = topicB.stream()

// merge the two streams together
const mergedStream = streamA.merge(streamB)
```

Merging streams is also typesafe! The merged stream will have the union of the types of the two streams.

### `catchError`

Catches errors in the following streams.

```ts
const topic = new Topic<number>()

// catch errors in the following streams
topic.stream().catchError((error) => console.error(error))
```

### `skipDuplicates`

Skip duplicate values in the stream.

```ts
const topic = new Topic<number>()

// skip duplicate values and log the results
topic
  .stream()
  .skipDuplicates()
  .forEach((value) => console.log(value))

topic.write(1)
topic.write(1)

// stdout:
// `1`
```

### `debounce`

Debounce the stream. A message will only be passed through the stream if there are no other messages for a given number of milliseconds.

```ts
const topic = new Topic<number>()

// debounce by 1000ms
topic
  .stream()
  .debounce(1000)
  .forEach((value) => console.log(value))

// only `2` and `3` will be logged
topic.write(1)
topic.write(2)
setTimeout(() => {
  topic.write(3)
}, 1000)
```

### `delay`

Delay the stream by a given number of milliseconds.

```ts
const topic = new Topic<number>()

// delay by 1000ms
topic
  .stream()
  .delay(1000)
  .forEach((value) => console.log(value))

// `1` will be logged after 1000ms
topic.write(1)
```

### `throttleByTime`

Throttle the stream by time. Only one message will be passed through the stream every `ms` milliseconds, others will be ignored.

```ts
const topic = new Topic<number>()

// only pass one message through the stream every 1000ms
topic
  .stream()
  .throttleByTime(1000)
  .forEach((value) => console.log(value))

// only `1` and `3` will be logged
topic.write(1)
topic.write(2)
setTimeout(() => {
  topic.write(3)
}, 1000)
```

### `bufferByTime`

Buffer messages in the stream by time. Messages will be passed through the stream in batches, with each batch containing messages that were written to the stream within a given number of milliseconds of each other.

```ts
const topic = new Topic<number>()

// buffer messages by 1000ms
topic
  .stream()
  .bufferByTime(1000)
  .forEach((values) => console.log(values))

topic.write(1)
topic.write(2)
setTimeout(() => {
  topic.write(3)
}, 1000)

// stdout:
// `[1, 2]`
// `[3]`
```

### `bufferByCount`

Buffer messages in the stream by count. Messages will be passed through the stream in batches, with each batch containing a given number of messages.

```ts
const topic = new Topic<number>()

// buffer messages in groups of 2
topic
  .stream()
  .bufferByCount(2)
  .forEach((values) => console.log(values))

topic.write(1)
topic.write(2)
topic.write(3)

// stdout:
// `[1, 2]`
```

### `bufferUntil`

Buffer messages in the stream until a given function returns true.

```ts
const topic = new Topic<number>()

// buffer messages until the buffer inclues the number 3
topic.stream()
  .bufferUntil((values) => values.includes(3))
  .forEach((values) => console.log(values))

topic.write(1)
topic.write(2)
topic.write(3)

// stdout:
// `[1, 2, 3]`
```
