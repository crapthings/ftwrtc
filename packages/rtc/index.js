const _ = require('lodash')
Buffer = global.Buffer || require('buffer').Buffer
Peer = require('simple-peer')

Signals = new Mongo.Collection('signals')

Signals.startPeer = ({ channelName }) => new Promise((resolve, reject) => {
  global.peer = new Peer({
    channelName,
    trickle: false,
    initiator: true,
    config: { iceServers: [{ urls: 'stun:39.107.42.211:19302' }] },
  })

  peer.on('signal', function (data) {
    resolve(data)
  })
})

if (Meteor.isServer) {
  Meteor.methods({
    'signals.update'(channelName, signal) {
      console.log(channelName)
      const { userId } = this
      Signals.update({ userId }, { $set: { channelName, [`signals.${userId}`]: signal } })
    }
  })

  Meteor.publish(null, function () {
    const { userId } = this

    if (!userId) return

    const signal = Signals.findOne({ userId })

    if (!signal)
      Signals.insert({ userId })

    return Signals.find({ userId })
  })

  Meteor.publish('signals.findOne', function (channelName) {
    const { userId } = this

    if (!userId) return

    return Signals.find({ channelName })
  })
}
