import { merge, length, find, propEq, without, contains, forEach, pluck, reject } from 'ramda'
import WebSocket from 'ws'
import * as mitt from 'mitt'
import validate from './validation'
import { repair } from './repairSerialization'

const DEFAULTS = {
  port: 9090, // the port to live (required)
}

class Server {
  emitter: mitt.Emitter = new mitt()

  // the configuration options
  options = merge({}, DEFAULTS)
  messageId = 0
  subscriptions = []
  partialConnections = []
  wss

  /**
   * Holds the currently connected clients.
   */
  connections = []

  constructor(createTransport) {
    this.send = this.send.bind(this)
  }

  /**
   * Set the configuration options.
   */
  configure(options = {}) {
    // options get merged & validated before getting set
    const newOptions = merge(this.options, options)
    validate(newOptions)
    this.options = newOptions
    return this
  }

  /**
   * Turns on an event listener
   */
  on(type: string, handler: () => null) {
    this.emitter.on(type, handler)
  }

  /**
   * Turns off an event listener
   */
  off(type: string, handler: () => null) {
    this.emitter.off(type, handler)
  }

  /**
   * Starts the server
   */
  start() {
    const { port } = this.options

    // start listening
    this.wss = new WebSocket.Server({ port })

    // register events
    this.wss.on('connection', socket => {
      // a wild client appears
      const partialConnection = {
        id: socket.id,
        address: 'dunno', // socket.request.connection.remoteAddress,
        socket,
      }

      // tuck them away in a "almost connected status"
      this.partialConnections.push(partialConnection)

      // trigger onConnect
      this.emitter.emit('connect', partialConnection)

      // when this client disconnects
      socket.on('disconnect', () => {
        // remove them from the list partial list
        this.partialConnections = reject(propEq('id', socket.id), this.partialConnections) as any

        // remove them from the main connections list
        const severingConnection = find(propEq('id', socket.id), this.connections)
        if (severingConnection) {
          (this.connections as any).remove(severingConnection)
          this.emitter.emit('disconnect', severingConnection)
        }
      })

      // when we receive a command from the client
      socket.on('message', incoming => {
        const message = JSON.parse(incoming)
        repair(message)
        const { type, important, payload } = message
        this.messageId++
        const date = new Date()
        const fullCommand = {
          type,
          important,
          payload,
          messageId: this.messageId,
          date,
        }

        // for client intros
        if (type === 'client.intro') {
          // find them in the partial connection list
          const partConn = find(propEq('id', socket.id), this.partialConnections) as any

          // add their address in
          fullCommand.payload.address = partConn.address

          // remove them from the partial connections list
          this.partialConnections = reject(propEq('id', socket.id), this.partialConnections) as any

          // bestow the payload onto the connection
          const connection = merge(payload, {
            id: socket.id,
            address: partConn.address,
          })

          // then trigger the connection
          this.connections.push(connection)
        }

        // refresh subscriptions
        if (type === 'state.values.change') {
          this.subscriptions = pluck('path', payload.changes || [])
        }

        // assign a name to the backups since the client doesn't pass one.  without it, we have to
        // call extendObservable instead of a standard assignment, which is very confusing.
        if (type === 'state.backup.response') {
          fullCommand.payload.name = null
        }

        this.emitter.emit('command', fullCommand)
      })

      // resend the subscriptions to the client upon connecting
      this.stateValuesSendSubscriptions()
    })

    // trigger the start message
    this.emitter.emit('start')

    return this
  }

  /**
   * Stops the server
   */
  stop() {
    forEach(s => s && (s as any).connected && (s as any).disconnect(), pluck('socket', this.connections))
    this.wss.close()

    // trigger the stop message
    this.emitter.emit('stop')

    return this
  }

  /**
   * Sends a command to the client
   */
  send(type, payload) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, payload }))
      }
    })
  }

  /**
   * Sends a list of subscribed paths to the client for state subscription.
   */
  stateValuesSendSubscriptions() {
    this.send('state.values.subscribe', { paths: this.subscriptions })
  }

  /**
   * Subscribe to a path in the client's state.
   */
  stateValuesSubscribe(path) {
    // prevent duplicates
    if (contains(path, this.subscriptions)) {
      return
    }

    // subscribe
    this.subscriptions.push(path)
    this.stateValuesSendSubscriptions()
  }

  /**
   * Unsubscribe from this path.
   */
  stateValuesUnsubscribe(path) {
    // if it doesn't exist, jet
    if (!contains(path, this.subscriptions)) {
      return
    }

    this.subscriptions = without([path], this.subscriptions)
    this.stateValuesSendSubscriptions()
  }

  /**
   * Clears the subscriptions.
   */
  stateValuesClearSubscriptions() {
    this.subscriptions = []
    this.stateValuesSendSubscriptions()
  }
}

export default Server

// convenience factory function
export const createServer = options => {
  const server = new Server(null)
  server.configure(options)
  return server
}
