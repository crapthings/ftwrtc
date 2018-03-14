Meteor.publish('users.current', function () {
  const { userId } = this
  if (!userId) return
  return Users.find({ _id: userId }, { fields: { services: false } })
})
