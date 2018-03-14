const Peer = require('simple-peer')

const tracker = ({ messageId }) => {
  const ready = Meteor.subscribe('messages.findOne', messageId).ready()
  if (!ready) return { ready }
  const message = Messages.findOne(messageId)
  return { ready, messageId, message }
}

class component extends Component {
  state = {
    request: true,
  }

  componentDidMount() {
    const { messageId, message } = this.props
    navigator.getUserMedia({ video: true, audio: true }, this.gotMedia({ messageId, message }), function () {})
  }

  componentWillUnmount() {
    peer && peer.destroy()
    this.stream && this.stream.stop()
  }

  gotMedia = ({ messageId, message }) => stream => {
    this.stream = stream.getVideoTracks()[0]
    console.log(stream)

    const currentUserId = Meteor.userId()

    const initiator = Meteor.userId() === message.userId
    global.peer = new Peer({
      initiator,
      channelName: messageId,
      config: { iceServers: [{ urls: 'stun:39.107.42.211:19302' }] },
      stream: stream,
      trickle: false,
    })

    peer.on('signal', function (data) {
      Meteor.call('messages.signal', messageId, data)
    })

    peer.on('connect', function () {
      console.log('CONNECT')
      peer.send('whatever' + Math.random())
    })

    peer.on('data', function (data) {
      console.log('data: ' + data)
    })

    peer.on('stream', stream => {
      // got remote video stream, now let's show it in a video tag
      console.log(stream)
      var video = document.querySelector('video')
      video.src = window.URL.createObjectURL(stream)
      video.play()
    })
  }

  signal = (userId, message) => () => {
    this.setState({ request: false }, () => {
      peer.signal(message.users[userId])
    })
  }

  render() {
    const { message } = this.props
    const { request } = this.state
    return (
      <div>
        <h1>video</h1>
        {_.without(_.keys(message.users), Meteor.userId()).map(userId => {
          const { type } = message.users[userId]
          return <div key={userId} onClick={this.signal(userId, message)}>
            {request ? <button>{type === 'offer' ? '对方请求视频回话' : '对方请求视频回话'}</button> : null}
          </div>
        })}
        <div id='outgoing'></div>
        <video id='video'></video>
      </div>
    )
  }
}

const loader = Comp => props => {
  if (!props.ready) return <div>loading</div>
  return <Comp { ...props } />
}

export default withTracker(tracker)(loader(component))
