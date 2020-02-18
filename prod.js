const inquirer = require('inquirer');
const PromiseB = require('bluebird')
const {spawn,exec} = require('child_process')
const node_ssh = require('node-ssh')
const fse = require('fs-extra')
let infos = {
  host: '',
  username: '',
  password: '',
}


class SSH extends node_ssh {
  connect() {
    return super.connect({
      host: infos.host,
      username: infos.username,
      password: infos.password
    })
  }

  verbose() {
    this._verbose = true
  }

  execCommand(givenCommand, options = {}) {
    if(this._verbose) {
      options.onStdout = (chunk) => {
        console.log(chunk.toString('utf-8'))
      }
    }
    return super.execCommand(givenCommand, options)
  }
}

const ssh = new SSH()
function bash(cmd, args = []) {
  return new Promise((resolve, reject) => {
    const sp = spawn(cmd, args, {})
    sp.stdout.on('data', a=>console.log(a.toString('utf-8')))
    sp.stderr.on('data', a=>console.log(a.toString('utf-8')))
    sp.on('close', code => {
      if(code !== 0) reject()
      else resolve()
    })
  })
}
function bashExec(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if(err||stderr) return reject(err || stderr)
      else resolve(stdout)
    })
  })
}
(async () => {
  await getInfos()
  console.log('connect...')
  await ssh.connect()
  console.log('Build files...')
  await bash('npm', ["run", "build:all"])
  console.log('Generate docker image')
  await bash('docker', ["build", "-t", "rheavue", "."])
  await bash('docker', ["save", "-o", "rheavue.tar", "rheavue"])
  await createFolderIfNeeded()
  await createComposeIfNeeded()
  // ssh.verbose()
  await pushDockerImage()
  await loadDockerImageOnServer()
  await relaunchDockerCompose()
  ssh.dispose()
  // console.log('Bye')
})().catch(err => {
  ssh.dispose()
  console.error(err)
})
async function getInfos() {
  if(fse.existsSync('./prod-infos.json')) {
    infos = fse.readJSONSync('./prod-infos.json')
  } else {
    infos = await inquirer.prompt([
      {name:'host', message:'Host of your production'},
      {name:'username', message:'User account of your server'},
      {name:'password', type:"password",message:'Password of your server'}
    ])
    const {save} = await inquirer.prompt({name:'save',message:'Save config', type:'confirm', default: true})
    if(save) fse.writeJSONSync('./prod-infos.json', infos)
  }
  const {prod} = await inquirer.prompt({name:'prod', message:'Are you sure to update production', type:'confirm', default: true})
  if(!prod) process.exit(0) 

}
async function createFolderIfNeeded() {
  console.log('Create folder if needed')
  const folders = await ls('/app')
  if(!folders.includes('rheavue')) await ssh.mkdir('/app/rheavue')
}

async function ls(path) {
  const lsCmd = await ssh.execCommand('ls ' + path)
  return lsCmd.stdout.split('\n')
}

async function createComposeIfNeeded() {
  console.log('Create docker compose if needed')
  const files = await ls('/app/rheavue')
  if(!files.includes('docker-compose.yml')) await ssh.putFile('./docker-compose.yml', '/app/rheavue/docker-compose.yml')
}

async function pushDockerImage() {
  const res = await ssh.execCommand('stat -c "%s" /app/rheavue/rheavue.tar')
  const remoteSize = +res.stdout
  const res1 = await bashExec('stat -c "%s" ./rheavue.tar')
  const localSize = +res1
  if(remoteSize !== localSize) {
    console.log('Push docker image...')
    await PromiseB.map([
      progressFile(),
      ssh.putFile('./rheavue.tar', '/app/rheavue/rheavue.tar')
    ], () => {})
  } else {
    console.log('Skip push. Remote file is the same as local file')
  }
}

async function progressFile() {
  await wait(5000)
  const res = await ssh.execCommand('stat -c "%s" /app/rheavue/rheavue.tar')
  const remoteSize = +res.stdout
  const res1 = await bashExec('stat -c "%s" ./rheavue.tar')
  const localSize = +res1
  console.log((remoteSize / 1000000).toFixed(2) + 'Mo', (localSize / 1000000).toFixed(2) + 'Mo')
  if(remoteSize < localSize) {
    await progressFile()
  }
}
async function loadDockerImageOnServer() {
  console.log('Load docker image...')
  await ssh.execCommand('docker load -i /app/rheavue/rheavue.tar')
}

async function relaunchDockerCompose () {
  console.log('Relaunch docker...')
  await ssh.execCommand('cd /app/rheavue && docker-compose up -d')
}

function wait(ms) {
  return new Promise(res => {
    setTimeout(() => {
      res()
    }, ms);
  })
}