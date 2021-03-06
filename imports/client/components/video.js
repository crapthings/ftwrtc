import FlexRTC from '/imports/flexrtc'

const tracker = ({ messageId }) => {
  const ready = Meteor.subscribe('messages.findOne', messageId).ready()
  if (!ready) return { ready }
  const message = Messages.findOne(messageId)
  return { ready, messageId, message }
}

class component extends Component {
  constructor() {
    super()
    this.flexrtc = new FlexRTC({
      url: 'wss://switch1.fawuapp.com:6020',
      // iceServers: _.map(stuns, stun => ({ urls: `stun:${stun}` })),
      iceServers: [{ urls: 'stun:stun.aeta-audio.com:3478' }],
    })
  }

  render() {
    return (
      <>
        <div id='video-wrapper'></div>
      </>
    )
  }
}

const loader = Comp => props => {
  if (!props.ready) return <div>loading</div>
  return <Comp { ...props } />
}

export default withTracker(tracker)(loader(component))
