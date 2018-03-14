Package.describe({
  version: '0.0.1',
  name: 'meteor-slack:rtc'
})

Package.onUse((api) => {
  configurePackage(api)
})

Npm.depends({
  'lodash': '4.17.4',
  'simple-peer': '9.0.0',
})

function configurePackage(api) {
  const both = ['client', 'server']

  // api.versionsFrom('METEOR@1.0')

  api.use([
    'ecmascript',
    'mongo-livedata',
  ], both)

  api.addFiles([
    'index.js',
  ], both)

  api.export([
    'Peer',
    'Signals',
  ])
}

