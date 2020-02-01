let BASE 
BASE = "cloudjs"

const stack = [
  {
    label: 'Cloudjs-server',
    spawnCmd: 'npm',
    spawnArgs: ['run', 'server'],
    spawnOptions: {
      cwd:  '/home/coco/Projects/cloudjs',
      env: Object.assign({
        mongoDbURL:`mongodb://root:123456@localhost:27017/${BASE}?authSource=admin`
      }, process.env)
    }
  },
  {
    label: 'Cloudjs-front',
    spawnCmd: 'npm',
    spawnArgs: ['run', 'client'],
    spawnOptions: {
      cwd:  '/home/coco/Projects/cloudjs',
      env: Object.assign({
        mongoDbURL:`mongodb://root:123456@localhost:27017/${BASE}?authSource=admin`
      }, process.env)
    }
  }
]

module.exports = stack
