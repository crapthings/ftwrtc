Meteor.publish('messages.findOne', function (_id) {
  const { channelId } = Messages.findOne(_id)
  if (!channelId) return []
  return Messages.find({ $or: [{ _id }, { type: 'rtc', channelId, 'answer.type': 'answer' }] })
})
