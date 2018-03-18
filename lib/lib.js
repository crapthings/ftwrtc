Buffer = global.Buffer || require('buffer').Buffer

_ = require('lodash')
moment = require('moment')
React = require('react')
Component = React.Component
mount = require('react-mounter').mount
withTracker = require('meteor/react-meteor-data').withTracker

if (Meteor.isClient)
  $ = require('jquery')

Users = Meteor.users
Channels = new Mongo.Collection('channels')
Messages = new Mongo.Collection('messages')
