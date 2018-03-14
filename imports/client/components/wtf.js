// const Peer = require('simple-peer')
//
// const MeteorCallPromise = () => new Promise((resolve, reject) => {
  // Meteor.call(...arguments, (err, resp) => {
    // if (err) return reject(err, null)
    // resolve(null, resp)
  // })
// })
//
// const tracker = ({ messageId }) => {
  // const ready = Meteor.subscribe('messages.findOne', messageId).ready()
  // if (!ready) return { ready }
  // const message = Messages.findOne(messageId)
  // return { ready, messageId, message }
// }
//
// class component extends Component {
  // componentDidMount() {
    // const { messageId, message } = this.props
    // console.log(messageId, message)
  // }
//
  // render() {
    // return (
      // <div>
        // <h3>video</h3>
        // <div id='outgoing'></div>
        // <video id='video'></video>
      // </div>
    // )
  // }
// }
//
// const loader = Comp => props => {
  // if (!props.ready) return <div>loading</div>
  // return <Comp { ...props } />
// }
//
// export default withTracker(tracker)(loader(component))
