import Layout from './components/layout'
import Channel from './components/channel'
import Conversation from './components/conversation'
import Video from './components/video'

FlowRouter.route('/', {
  action() {
    mount(Layout, {
      children: () => <h1>welcome</h1>
    })
  }
})

FlowRouter.route('/channels/:_id', {
  action({ _id }) {
    mount(Layout, {
      children: () => <Channel _id={_id} />
    })
  }
})

FlowRouter.route('/channels/:_id/conversation/:userId', {
  action({ _id, userId }) {
    mount(Layout, {
      children: () => <Conversation _id={_id} userId={userId} />
    })
  }
})

FlowRouter.route('/channels/:_id/video/:messageId', {
  action({ _id, messageId }) {
    mount(Layout, {
      children: () => <Video _id={_id} messageId={messageId} />
    })
  },

  triggersExit: [function () {
    if (global.peer) {
      peer.stream.getTracks().forEach(track => track.stop())
      peer.destroy()
    }
  }]
})


