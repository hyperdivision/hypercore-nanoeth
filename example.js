const HyperETH = require('./')
const hypercore = require('hypercore')
const got = require('got')
const ram = require('random-access-memory')

const endpoint = 'https://eth.hyperdivision.dk'
const feed = hypercore(ram)

async function httpEth (json) {
  const res = await got.post({
    url: endpoint,
    timeout: 5000,
    json,
    responseType: 'json'
  })

  return res.body
}

feed.ready(async function () {
  const clone = hypercore(ram, feed.key)

  const s1 = feed.replicate(true, { live: true })
  const s2 = clone.replicate(false, { live: true })


  const client = new HyperETH(s1)
  const server = new HyperETH(s2, httpEth)

  s1.pipe(s2).pipe(s1)

  console.log(await client.blockNumber())
  console.log(await client.blockNumber())
})
