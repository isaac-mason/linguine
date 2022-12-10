# linguine 🍝

De-spaghettify your event logic! Declaratively compose event logic with Topics and Streams.

## Installation

```sh
$ npm install linguine # or yarn install
```

## Introduction

Linguine is a library for declaratively composing event logic. It's like RxJS, but with fewer features, and generally worse! It's also a lot smaller, and has a much simpler API.

## Example

```ts
type PlayerInput = {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

type PlayerMovement = {
  x: number
  y: number
}

const playerInputTopic = new Topic<PlayerInput>()
const playerMovementTopic = new Topic<PlayerMovement>()

playerInputTopic
  .stream()
  .map(({ up, down, left, right }) => ({
    x: (left ? -1 : 0) + (right ? 1 : 0),
    y: (up ? -1 : 0) + (down ? 1 : 0),
  }))
  .to(playerMovementTopic)

playerMovementTopic.stream().forEach((movement) => console.log(movement))

// later...

playerInputTopic.write({ up: true, down: false, left: false, right: false })

// stdout:
// { x: -1, y: 0 }
```

## Stream Nodes

### `map`

Calls the given function for each value in the stream.

```ts
const topic = new Topic<number>()
const stream = topic.stream()

// double each value
stream.map((value) => value * 2)
```

### `flatMap`

Calls the given function for each value in the stream, and returns multiple messages. The givenfunction must return an array.

```ts
const topic = new Topic<number>()
const stream = topic.stream()

// return the original value, plus the doubled value
stream.flatMap((value) => [value, value * 2])
```

### `filter`

Only pass values through the stream that match a predicate.

```ts
const topic = new Topic<number>()
const stream = topic.stream()

// only pass even numbers through the stream
stream.filter((value) => value % 2 === 0)
```

### `forEach`

Call a function on each value in the stream. This is a terminal operation.

```ts
const topic = new Topic<number>()
const stream = topic.stream()

// log each value
stream.forEach((value) => console.log(value))
```

### `to`

Write each value in the stream to a topic. This is a terminal operation.

```ts
const inputTopic = new Topic<number>()
const outputTopic = new Topic<number>()

const stream = inputTopic.stream()

// write each value to another topic
stream.to(outputTopic)
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
const stream = topic.stream()

// catch errors in the following streams
stream.catchError((error) => console.error(error))
```

### `skipDuplicates`

Skip duplicate values in the stream.

```ts
const topic = new Topic<number>()
const stream = topic.stream()

// skip duplicate values and log the results
stream.skipDuplicates().forEach((value) => console.log(value))

// `1` will only be logged once
topic.write(1)
topic.write(1)
```

### `debounce`

Debounce the stream. A message will only be passed through the stream if there are no other messages for a given number of milliseconds.

```ts
const topic = new Topic<number>()
const stream = topic.stream()

// debounce by 1000ms
stream.debounce(1000).forEach((value) => console.log(value))

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
const stream = topic.stream()

// delay by 1000ms
stream.delay(1000).forEach((value) => console.log(value))

// `1` will be logged after 1000ms
topic.write(1)
```

### `throttleByTime`

Throttle the stream by time. Only one message will be passed through the stream every `ms` milliseconds, others will be ignored.

```ts
const topic = new Topic<number>()
const stream = topic.stream()

// only pass one message through the stream every 1000ms
stream.throttleByTime(1000).forEach((value) => console.log(value))

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
const stream = topic.stream()

// buffer messages by 1000ms
stream.bufferByTime(1000).forEach((values) => console.log(values))

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
const stream = topic.stream()

// buffer messages in groups of 2
stream.bufferByCount(2).forEach((values) => console.log(values))

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
const stream = topic.stream()

// buffer messages until the buffer inclues the number 3
stream
  .bufferUntil((values) => values.includes(3))
  .forEach((values) => console.log(values))

topic.write(1)
topic.write(2)
topic.write(3)

// stdout:
// `[1, 2, 3]`
```
