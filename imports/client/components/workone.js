const Peer = require('simple-peer')

const tracker = ({ messageId }) => {
  const ready = Meteor.subscribe('messages.findOne', messageId).ready()
  if (!ready) return { ready }
  const message = Messages.findOne(messageId)
  const lastAnswer = Messages.findOne({ 'answer.type': 'answer' }, { sort: { createdAt: -1 } })
  if (!message) {
    FlowRouter.go('/')
    global.peer && peer.destroy()
    return {}
  }
  return { ready, messageId, message, lastAnswer }
}

class component extends Component {
  constructor(props) {
    super(props)
    const { messageId, message } = props
    if (message.offer && message.offer.type === 'offer' && message.userId !== Meteor.userId()) {
      navigator.getUserMedia({ video: true, audio: true }, this.asAnswer({ messageId, message }), function () {})
    }
  }

  componentWillReceiveProps(nextProps) {
    const { lastAnswer } = nextProps
    if (lastAnswer.answer && lastAnswer.answer.type === 'answer' && lastAnswer.userId !== Meteor.userId())
      peer.signal(lastAnswer.answer)
  }

  asAnswer = ({ messageId, message }) => stream => {
    global.peer = new Peer({
      initiator: false,
      channelName: messageId,
      config: { iceServers: [{ urls: 'stun:39.107.42.211:19302' }] },
      stream: stream,
      trickle: false,
    })

    peer.signal(message.offer)

    peer.on('signal', function (data) {
      Meteor.call('messages.create', { messageId, type: 'rtc', answer: data, channelId: message.channelId })
    })

    peer.on('stream', stream => {
      global.videoSrc = document.querySelector('video')
      videoSrc.src = window.URL.createObjectURL(stream)
      videoSrc.play()
    })
  }

  render() {
    const { messageId } = this.props
    return (
      <div>
        <h1>video</h1>
        <button onClick={() => Meteor.call('messages.remove', messageId)}>leave</button>
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
