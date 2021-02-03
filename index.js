const NanoETH = require('nanoeth')

module.exports = class HyperETH extends NanoETH {
  constructor (stream, onrequest) {
    super(new RPC(stream, onrequest))
  }
}

class RPC {
  constructor (stream, onrequest) {
    this.id = 0
    this.inflight = new Map()
    this.onrequest = onrequest || null

    const self = this

    this.ext = stream.registerExtension('nanoeth', {
      encoding: 'json',
      async onmessage (message) {
        if (message.method) {
          let res
          try {
            res = await onrequest(message)
          } catch (err) {
            res = { jsonrpc: '2.0', id: message.id, error: { message: err.message, code: err.code || 0 }}
          }
          return self.ext.send(res)
        }

        if (!self.inflight.has(message.id)) return

        const inv = self.inflight.get(message.id)
        self.inflight.delete(message.id)

        if (message.error) return inv.reject(error(message.error))
        inv.resolve(message.result)
      }
    })
  }

  remoteSupports () {
    return this.ext.remoteSupports()
  }

  async request (method, params) {
    const id = this.id++
    const json = {
      jsonrpc: '2.0',
      method,
      params,
      id
    }

    const inv = invertPromise()
    this.inflight.set(id, inv)
    this.ext.send(json)
    return inv.promise
  }
}

function invertPromise () {
  const res = { promise: null, resolve: null, reject: null }
  res.promise = new Promise((resolve, reject) => {
    res.resolve = resolve
    res.reject = reject
  })
  return res
}

function error (err) {
  const e = new Error(err.message)
  e.code = err.code
  return e
}
