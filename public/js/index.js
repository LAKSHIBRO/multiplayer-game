const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const scoreEl = document.querySelector('#scoreEl')

const devicepixelratio = window.devicePixelRatio

canvas.width = window.innerWidth * devicepixelratio
canvas.height = window.innerHeight * devicepixelratio

const x = canvas.width / 2
const y = canvas.height / 2

const frontEndPlayers = {}
const frontEndProjectiles = []

socket.on('updatePlayers', (backEndPlayers) => {
  for (const id in backEndPlayers) {
       const backEndPlayer = backEndPlayers[id]

      if (!frontEndPlayers[id]) {
        frontEndPlayers[id] = new Player({
          x: backEndPlayer.x,
          y: backEndPlayer.y,
          radius: 10, 
          color:backEndPlayer.color
        })
      }else{
        if(id === socket.id) {
        frontEndPlayers[id].x = backEndPlayer.x
        frontEndPlayers[id].y = backEndPlayer.y

        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return backEndPlayer.sequenceNumber === input.sequenceNumber
        })
        if (lastBackendInputIndex !== -1) {
        playerInputs.splice(0, lastBackendInputIndex + 1)

        playerInputs.forEach((input) => {
          frontEndPlayers[id].x += input.dx
          frontEndPlayers[id].y += input.dy
        })
        }
      }else{
        frontEndPlayers[id].x = backEndPlayer.x
        frontEndPlayers[id].y = backEndPlayer.y

        gsap.to(frontEndPlayers[id], {
          x: backEndPlayer.x,
          y: backEndPlayer.y,
          duration: 0.015,
          ease: 'none'
        })
      }
    }
  }

  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      delete frontEndPlayers[id]
    }
  }


})

let animationId
function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)

  for (const id in frontEndPlayers) {
    frontEndPlayers[id].draw()
  } 

  for (let i = frontEndProjectiles.length - 1; i >= 0; i--) {
    
    const frontEndProjectile = frontEndProjectiles[i]
    frontEndProjectile.update()
    
  }

}

animate()

const keys = {
  w:{
    pressed: false,
  },
  a:{
    pressed: false,
  },
  s:{
    pressed: false,
  },
  d:{
    pressed: false,
  }

}

const SPEED = 10
const playerInputs = []
let sequenceNumber = 0

setInterval(() => {

  if (keys.w.pressed) {
    sequenceNumber++
    playerInputs.push({sequenceNumber,dx: 0, dy: -SPEED})
    frontEndPlayers[socket.id].y -= SPEED
    socket.emit('keydown', {keycode:'KeyW', sequenceNumber})
  }
  if (keys.a.pressed) {
    sequenceNumber++
    playerInputs.push({sequenceNumber,dx: -SPEED, dy: 0})
    frontEndPlayers[socket.id].x -= SPEED
    socket.emit('keydown', {keycode:'KeyA', sequenceNumber})
  }
  if (keys.s.pressed) {
    sequenceNumber++
    playerInputs.push({sequenceNumber,dx: 0, dy: SPEED})
    frontEndPlayers[socket.id].y += SPEED
    socket.emit('keydown', {keycode:'KeyS', sequenceNumber})
  }
  if (keys.d.pressed) {
    sequenceNumber++
    playerInputs.push({sequenceNumber,dx: SPEED, dy: 0})
    frontEndPlayers[socket.id].x += SPEED
    socket.emit('keydown', {keycode:'KeyD', sequenceNumber})
  }

}, 15);

window.addEventListener('keydown', (e) => {

  if (!frontEndPlayers[socket.id]) return

  switch(e.code) {
    case 'KeyW':
     keys.w.pressed = true
      break
    case 'KeyA':
      keys.a.pressed = true
      break
    case 'KeyS':
      keys.s.pressed = true
      break
    case 'KeyD':
      keys.d.pressed = true
      break
  }

})  

window.addEventListener('keyup', (e) => {
  if (!frontEndPlayers[socket.id]) return

  switch(e.code) {
    case 'KeyW':
      keys.w.pressed = false
      break
    case 'KeyA':
     keys.a.pressed = false
      break
    case 'KeyS':
      keys.s.pressed = false
      break
    case 'KeyD':
      keys.d.pressed = false
      break
  }
})