Meteor.publish(null, function () {
  const { userId } = this
  if (!userId) return
  const isChannelUser = `users.${userId}`
  return Channels.find({ type: { $ne: 'conversation' }, [isChannelUser]: true })
})

Meteor.publish('channel', function (_id) {
  const { userId } = this
  if (!userId) return

  const { users, ...channel } = Channels.findOne(_id)
  if (!channel) return

  const isChannelUser = `users.${userId}`

  const channelHandler = Channels.find({ _id }, { fields: { users: true } }).observe({
    changed: (channel, oldChannel) => {
      const newUserIds = _.without(_.keys(channel.users), ..._.keys(oldChannel.users))
      const users = Users.find({ _id: { $in: newUserIds } }, { fields: { services: false } }).forEach(user =>
        this.added('users', user._id, user)
      )
      this.added('channel', channel._id, channel)
    },
  })

  this.onStop(() => {
    channelHandler.stop()
  })

  const result = [ Channels.find({ _id }) ]

  if (users)
    result.push(Users.find({ _id: { $in: _.keys(users) } }, { fields: { services: false } }))

  result.push(Messages.find({ channelId: _id }))

  return result
})

Meteor.publish('conversation', function (channelId, targetUserId) {
  const channelSelector = { channelId, type: 'conversation', users: {
    [targetUserId]: true,
    [this.userId]: true
  } }
  const conversationId = _.get(Channels.findOne(channelSelector), '_id') || Channels.insert(channelSelector)
  return [Channels.find({ _id: conversationId }), Messages.find({ channelId: conversationId })]
})
