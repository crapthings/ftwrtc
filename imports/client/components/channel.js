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

const rtcMessage = channelId => () => {
  const message = {
    channelId,
    _id: Random.id(),
    type: 'rtc',
    text: `start a video call`,
  }

  const options = {
    initiator: true,
    channelName: message._id,
    config: { iceServers: [{ urls: 'stun:39.107.42.211:19302' }] },
    trickle: false,
  }

  navigator.getUserMedia(
    { video: true, audio: true },
    function (stream) {
      options.stream = stream
      global.peer = new Peer(options)
      peer.on('signal', function (data) {
        if (data.type === 'offer') {
          message.offer = data
          Meteor.call('messages.create', message, (err, resp) => {
            FlowRouter.go(`/channels/${channelId}/video/${resp}`)
          })
        }
      })

      peer.on('connect', function () {
        console.log('CONNECT')
        peer.send('whatever' + Math.random())
      })

      peer.on('data', function (data) {
        console.log('data: ' + data)
      })

      peer.on('stream', stream => {
        global.videoSrc = document.querySelector('video')
        videoSrc.src = window.URL.createObjectURL(stream)
        videoSrc.play()
      })
    },
    function () {},
  )
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
      <button onClick={rtcMessage(channelId)}>video/audio</button>
      {messages.map(({ _id, userId, user, createdAt, text, type }) => {
        const isSelf = userId === Meteor.userId() ? true : false
        return (
          <div key={_id}>
            <span className='mgr'>{moment(createdAt).format('YYYY.MM.DD HH:mm')}</span>
            <span className='mgr'>{isSelf ? user : <a href={`/channels/${channelId}/conversation/${userId}`}>{user}</a>}</span>
            <span className='mgr'>{text}</span>
            <span className='mgr'>{type === 'rtc' && <a href={`/channels/${channelId}/video/${_id}`}>enter</a>}</span>
          </div>
        )
      })}
    </>
  )
}

export default withTracker(tracker)(component)
