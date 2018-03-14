Meteor.methods({
  'messages.create'(opts) {
    const userId = this.userId
    if (!userId) return
    opts.userId = userId
    opts.user = Users.findOne(userId).username
    opts.createdAt = new Date()
    return Messages.insert(opts)
  },

  'messages.signal'(_id, signal) {
    return Messages.update(_id, {
      $set: { signals: { [`${this.userId}`]: { signal, ts: new Date() } } }
    })
  },

  'messages.remove'(_id) {
    console.log(_id)
    return Messages.remove({ $or: [{ _id }, { messageId: _id }]})
  }
})
