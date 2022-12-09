# linguine 🍝

De-spaghettify your event logic! Declaratively compose event logic with Topics and Streams.

## Installation

```sh
$ npm install linguine # or yarn install
```

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
        y: (up ? -1 : 0) + (down ? 1 : 0)
    }))
    .to(playerMovementTopic)

playerMovementTopic
    .stream()
    .forEach((movement) => console.log(movement))

// later...

playerInputTopic.write({ up: true, down: false, left: false, right: false })

// stdout:
// { x: -1, y: 0 }
```
