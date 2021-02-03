# hypercore-nanoeth

Hypercore extension for Nanoeth

```
npm install hypercore-nanoeth
```

## Usage

``` js
const HyperNanoETH = require('hypercore-nanoeth')

const client = new HyperNanoETH(hypercoreReplicationStream)
const server = new HyperNanoETH(hypercoreReplicationStream, async onrequest (message) {
  // forward this json rpc message to your eth provider
})

// client is a normal hypereth instance
console.log(await client.blockNumber())
```

## License

MIT
