const Form = ({ onSubmit }) => <form onSubmit={onSubmit}>
  <input type='text' />
  <input type='password' />
  <input type='submit' />
</form>

export default () => <div>
  <h3>Sign in</h3>
  <Form onSubmit={signin} />

  <h3>Sign up</h3>
  <Form onSubmit={signup} />
</div>

function signin(evt) {
  evt.preventDefault()
  const [input1, input2] = evt.target
  const username = input1.value
  const password = input2.value
  Meteor.loginWithPassword(username, password, err => !err && FlowRouter.go('/'))
}

function signup(evt) {
  evt.preventDefault()
  const [input1, input2] = evt.target
  const username = input1.value
  const password = input2.value
  Accounts.createUser({ username, password })
}
