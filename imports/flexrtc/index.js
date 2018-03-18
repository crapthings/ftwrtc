import Deepstream from 'deepstream.io-client-js'
import SimplePeer from 'simple-peer'

export default class FlexRTC {
  constructor(options) {
    this.options = options
    this.connections = {}
    this.connection = Deepstream(this.options.url).login()
    this.currentPeer = this.connection.getUid()
    this.peers = this.connection.record.getList('peers')
    this.peers.addEntry(this.currentPeer)
    this.SubscribeEvent()
    this.SubscribeRecord()
  }

  SubscribeEvent = () => this.connection.event.subscribe(`rtc-signal/${this.currentPeer}`, this.onPeer)

  onPeer = ({ peer, signal }) => this.connections[peer] && this.connections[peer].processSignal(signal)

  SubscribeRecord = () => this.peers.subscribe(this.onPeers)

  onPeers = _peers => {
    const { options, connections, connection, currentPeer, peers } = this

    _peers.forEach(peer => {
      if (this.connections[peer]) return
      if (this.currentPeer === peer) return
      this.connections[peer] = new Peer({ options, connections, connection, currentPeer, peers, peer })
    })

    for (let peer in connections) {
      if (_peers.indexOf(peer) === -1) connections[peer].destroy()
    }
  }
}

class Peer {
  constructor({ options, connections, connection, currentPeer, peers, peer }) {
    this.options = options
    this.connections = connections
    this.connection = connection
    this.currentPeer = currentPeer
    this.peers = peers
    this.peer = peer

    this._isConnected = false

    this.videoWrapper = document.getElementById('video-wrapper')
    this.video = document.createElement('video')
    this.video.id = peer
    this.video.width = 320
    this.video.height = 240
    this.videoWrapper.appendChild(this.video)

    if (this.videoWrapper)
      navigator.getUserMedia({ video: true, audio: true }, this.getUserMedia, () => {})

    if (!this.videoWrapper)
      this.connect()
  }

  connect = ({ stream }) => {
    const { options: { iceServers }, currentPeer, peer } = this

    const options = {
      config: { iceServers },
      initiator: currentPeer > peer,
      trickle: false,
    }

    if (stream)
      options.stream = stream

    this._p2pConnection = new SimplePeer(options)
    this._p2pConnection.on('signal', this._onOutgoingSignal)
    this._p2pConnection.on('error', this._onError)
    this._p2pConnection.on('connect', this._onConnect)
    this._p2pConnection.on('close', this._onClose)
    this._p2pConnection.on('data', this._onData)
    this._p2pConnection.on('stream', this._onStream)
    setTimeout(this._checkConnected, 2000)
  }

  getUserMedia = stream => this.connect({ stream })

  processSignal = signal => this._p2pConnection.signal(signal)

  send = msg => this._p2pConnection.send(msg)

  destroy = () => this._p2pConnection.destroy()

  _onOutgoingSignal = signal => {
    this.connection.event.emit(`rtc-signal/${this.peer}`, {
      peer: this.currentPeer,
      signal,
    })
  }

  _onConnect = () => {
    this._isConnected = true
    console.log('on connect' + this.peer)
  }

  _onClose = () => {
    console.log('on close', this.peer)
    delete this.connections[this.peer]
    this.peers.removeEntry(this.peer)
    this.videoWrapper.removeChild(this.video)

    if (this._p2pConnection) {
      if (this._p2pConnection.stream) {
        this._p2pConnection.stream.getTracks().forEach(track => track.stop())
      }
    }
  }

  _checkConnected = () => {
    if (!this._isConnected) {
      this.destroy()
    }
  }

  _onData = data => {
    console.log('on data', data)
  }

  _onError = error => {
    console.log('on error', error)
  }

  _onStream = stream => {
    const video = document.getElementById(this.peer)
    video.src = window.URL.createObjectURL(stream)
    video.play()
  }
}
