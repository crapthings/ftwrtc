const createChannel = () => {
  const name = _.trim(prompt('a channel name'))
  if (!name) return
  Meteor.call('channels.create', { name })
}

const tracker = props => {
  const channels = Channels.find().fetch()
  return { channels }
}

const component = ({ channels }) => {
  return (
    <>
      <button onClick={createChannel}>create channel</button>
      {/* <div onClick={() => FlowRouter.go('/')}>home</div> */}
      <h3>Channels</h3>
      <ul>
      {channels.map(({ _id, name }) => <li key={_id}>
        <a key={_id} onClick={() => FlowRouter.go(`/channels/${_id}`)}>{name}</a>
      </li>)}
      </ul>
    </>
  )
}

export default withTracker(tracker)(component)
