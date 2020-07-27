let BASE 
BASE = "rhea"

const stack = [
  {
    label: 'rhea-server',
    spawnCmd: 'npm',
    spawnArgs: ['run', 'server'],
    spawnOptions: {
      cwd:  __dirname,
      env: Object.assign({
        PORT: '9847',
        mongoDbURL:`mongodb://root:123456@localhost:27017/${BASE}?authSource=admin`
      }, process.env)
    }
  },
  {
    label: 'rhea-front',
    spawnCmd: 'npm',
    spawnArgs: ['run', 'client'],
    spawnOptions: {
      cwd: __dirname,
      env: Object.assign({
        VUE_APP_SERVER_URL: 'http://localhost',
        VUE_APP_SERVER_PORT: 9847,
        mongoDbURL: `mongodb://root:123456@localhost:27017/${BASE}?authSource=admin`
      }, process.env)
    }
  },
  {
    label: 'rhea-front-cordova',
    spawnCmd: 'npm',
    spawnArgs: ['run', 'capacitor:serve -- --android'],
    spawnOptions: {
      cwd: '/home/coco/Projects/rhea',
      env: Object.assign({
        VUE_APP_SERVER_URL: 'http://localhost',
        VUE_APP_SERVER_PORT: 9847,
        mongoDbURL: `mongodb://root:123456@localhost:27017/${BASE}?authSource=admin`
      }, process.env)
    }
  }
]




require('dns').lookup(require('os').hostname(), function (err, add) {
  stack.filter(({label}) => label.includes('front-cordova')).pop().spawnOptions.env.VUE_APP_SERVER_URL = `http://${add}`
})


module.exports = stack
