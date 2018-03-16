import io from 'socket.io-client'
import Peer from 'simple-peer'

const tracker = ({ messageId }) => {
  const ready = Meteor.subscribe('messages.findOne', messageId).ready()
  if (!ready) return { ready }
  const message = Messages.findOne(messageId)
  return { ready, messageId, message }
}

class component extends Component {
  render() {
    return (
      <div>
        <h1>video</h1>
        <video id='local'></video>
        <video id='remote'></video>
      </div>
    )
  }
}

const loader = Comp => props => {
  if (!props.ready) return <div>loading</div>
  return <Comp { ...props } />
}

export default withTracker(tracker)(loader(component))
