const createMessage = channelId => evt => {
  let { keyCode, target: { value: text } } = evt
  if (keyCode !== 13) return
  text = _.trim(text)
  if (!text) return
  Meteor.call('messages.create', { channelId, text }, (err, resp) => {
    if (err) return
    document.getElementById('input-box').value = ''
  })
}

const tracker = ({ _id: channelId, userId }) => {
  const ready = Meteor.subscribe('conversation', channelId, userId).ready()
  if (!ready) return { ready }
  const channel = Channels.findOne({ channelId, type: 'conversation', [`users.${userId}`]: true })
  const users = Users.find({ _id: { $in: _.keys(channel.users) } }).fetch()
  const messages = Messages.find({ channelId: channel._id }).fetch()
  return { ready, channelId, channel, users, messages }
}

const component = ({ ready, channelId, channel, users, messages }) => {
  if (!ready)
    return <div>loading</div>

  return (
    <>
      {users.map(({ _id, username }) => <div key={_id}>
        {username}
      </div>)}

      {messages.map(({ _id, userId, user, createdAt, text }) => {
        return (
          <div key={_id}>
            {moment(createdAt).format('YYYY.MM.DD HH:mm')} {user} {text}
          </div>
        )
      })}

      <textarea id='input-box' onKeyUp={createMessage(channel._id)}></textarea>
    </>
  )
}

export default withTracker(tracker)(component)
