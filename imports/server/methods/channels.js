Meteor.methods({
  'channels.create'(opts) {
    const { userId } = this
    if (!userId) return
    _.set(opts, `users.${userId}`, true)
    return Channels.insert(opts)
  },

  'channels.invite'(_id, username) {
    const { userId } = this
    if (!userId) return
    const user = Accounts.findUserByUsername(username)
    if (!user) return
    const key = `users.${user._id}`
    return Channels.update(_id, { $set: { [key]: true } })
  },
})
