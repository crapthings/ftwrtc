import Login from './login'
import Channels from './channels'

const tracker = ({ children }) => {
  const userId = Meteor.userId()
  if (!userId) return { requireLogin: true }
  const ready = Meteor.subscribe('users.current').ready()
  if (!ready) return { ready }
  const user = Meteor.user()
  return { ready, children, user }
}

const component = ({ requireLogin, ready, children, user }) => {
  if (requireLogin)
    return <Login />

  if (!ready)
    return <div>loading</div>

  return (
    <div>
      <div>
        <div>{user.username} <button onClick={() => Meteor.logout(err => FlowRouter.go('/'))}>logout</button></div>
        <Channels />
      </div>

      <div>
        {children()}
      </div>
    </div>
  )
}

export default withTracker(tracker)(component)
