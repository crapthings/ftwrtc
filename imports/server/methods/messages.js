Meteor.methods({
  'messages.create'(opts) {
    const userId = this.userId
    if (!userId) return
    opts.userId = userId
    opts.user = Users.findOne(userId).username
    opts.createdAt = new Date()
    return Messages.insert(opts)
  },

  'messages.accept'(_id, opts) {
    Messages.update(_id, {
      $set: opts
    })
    return Messages.findOne(_id).initiatorId
  },

  'messages.update'(_id, opts) {
    return Messages.update(_id, {
      $set: opts
    })
  },

  'messages.remove'(_id) {
    console.log(_id)
    return Messages.remove({ $or: [{ _id }, { messageId: _id }]})
  }
})
