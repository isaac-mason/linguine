# fludd

`fludd` is a library for composing simple event-driven logic with topics and streams.

## Installation

```sh
$ npm install fludd
```

### Example

```ts
import { Topic } from 'fludd'

type Player = {
    id: string
}

type PlayerUpdate = {
    player: Player
    state: 'dead' | 'alive'
}

const playerUpdateTopic = new Topic<PlayerUpdate>()
const deadPlayersTopic  = new Topic<Player>()

playerUpdateTopic
    .stream()
    .filter((x) => x.state === 'dead')
    .map((x) => x.player)
    .to(deadPlayersTopic)
```