const Peer = require('simple-peer')

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

const inviteVideoTalk = channelId => async () => {
  const message = {
    channelId,
    _id: Random.id(),
    type: 'video',
    text: `start a video call`,
  }

  Meteor.call('messages.create', message, (err, resp) => {
    FlowRouter.go(`/channels/${channelId}/video/${resp}`)
  })
}

const acceptVideoTalk = ({ channelId, _id }) => async () => {
  FlowRouter.go(`/channels/${channelId}/video/${_id}`)
}

const inviteUser = channelId => evt => {
  const username = _.trim(prompt('enter an username'))
  if (!username) return
  Meteor.call('channels.invite', channelId, username)
}

const tracker = ({ _id: channelId }) => {
  const ready = Meteor.subscribe('channel', channelId).ready()
  if (!ready) return { ready }
  const channel = Channels.findOne(channelId)
  const users = Users.find({ _id: { $in: _.keys(channel.users) } }).fetch()
  const messages = Messages.find({ channelId }).fetch()
  return { ready, channelId, channel, users, messages }
}

const component = ({ ready, channelId, channel, users, messages }) => {
  if (!ready)
    return <div>loading</div>

  return (
    <>
      <div>
        <button onClick={inviteUser(channelId)}>invite</button>
      </div>

      <h3>Users</h3>
      {users.map(({ _id, username }) => <div key={_id}>
        {username}
      </div>)}

      <h3>Messages</h3>
      <textarea id='input-box' onKeyUp={createMessage(channelId)}></textarea>
      <button onClick={inviteVideoTalk(channelId)}>video/audio</button>
      {messages.map(message => {
        const { _id, userId, user, createdAt, text, type } = message
        const isSelf = userId === Meteor.userId() ? true : false
        return (
          <div key={_id}>
            <span className='mgr'>{moment(createdAt).format('YYYY.MM.DD HH:mm')}</span>
            <span className='mgr'>{isSelf ? user : <a href={`/channels/${channelId}/conversation/${userId}`}>{user}</a>}</span>
            <span className='mgr'>{text}</span>
            {Meteor.userId() !== userId && <span className='mgr'>{type === 'video' && <a onClick={acceptVideoTalk(message)}>accept</a>}</span>}
          </div>
        )
      })}
    </>
  )
}

export default withTracker(tracker)(component)
