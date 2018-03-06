'use strict'

require('./style.css')

const { parse } = require('query-string')
const utils = require('./utils')
const langs = require('./languages')

const state = {
  lang: 'zh_tw',
  falling: [],
  maxLives: 5,
  lives: 0,
  score: 0,
  gameOver: false,
  started: false,
  pause: false,
  lastTime: 0,
  dom: {
    scene: document.querySelector('.scene'),
    score: document.querySelector('.score_value'),
    lives: document.querySelector('.lives'),
    info: document.querySelector('.info'),
    error: document.querySelector('.error')
  },
  audio: {
    correct: 'mp3/correct.mp3',
    wrong: 'mp3/wrong.mp3',
    gameover: 'mp3/gameover.mp3'
  }
}

state.lang = parse(location.search).lang || state.lang

document.body.appendChild(utils.renderKeyboard(utils.layouts[state.lang]))

const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const playSound = file => {
  (new Audio(file)).play()
}

const setInfo = value => {
  state.pause = !!value
  state.dom.info.innerHTML = value
  state.dom.info.style.display = state.pause ? 'flex' : 'none'
}

const updateScore = value => {
  state.dom.score.textContent = value
  state.score = value
}

const updateLives = value => {
  if (value < 0) {
    state.gameOver = true
    playSound(state.audio.gameover)
    return setInfo('Game Over')
  }

  state.dom.lives.innerHTML = ''
  for (let i = 0; i < state.maxLives; i++) {
    const heart = document.createElement('div')
    heart.classList.add('heart')
    if (i >= value) {
      heart.classList.add('empty')
    }
    state.dom.lives.appendChild(heart)
  }
  state.lives = value
}

const showError = key => {
  state.dom.error.textContent = key
  state.dom.error.style.opacity = '.9'
  setTimeout(() => {
    state.dom.error.style.opacity = '0'
  }, 200)
}

const spawn = text => {
  const element = document.createElement('div')
  element.appendChild(document.createTextNode(text))
  element.className = 'entity'
  const x = getRandom(20, window.innerWidth - 40)
  element.style.left = x + 'px'
  state.dom.scene.appendChild(element)
  state.falling.push({ text, element, y: 0 })
}

const update = time => {
  if (state.pause || state.gameOver) return

  for (const i in state.falling) {
    state.falling[i].y += 1
    state.falling[i].element.style.top = state.falling[i].y + 'px'

    if (state.falling[i].y > window.innerHeight) {
      state.dom.scene.removeChild(state.falling[i].element)
      state.falling.splice(i, 1)
      updateLives(state.lives - 1)
    }
  }

  if (time > state.lastTime + 1000) {
    let l = []
    for (let set of langs[state.lang].modes[2].sets) {
      l = l.concat(langs[state.lang].sets[set])
    }
    const i = getRandom(0, l.length - 1)
    spawn(l[i])
    state.lastTime = time
  }
  
  requestAnimationFrame(update)
}

const start = () => {
  state.dom.info.style.display = 'none'
  state.started = true
  requestAnimationFrame(update)
}

const restart = () => {
  updateLives(state.maxLives)
  updateScore(0)
  state.falling = []
  state.dom.scene.innerHTML = ''
  state.gameOver = false
  state.pause = false
  start()
}

updateLives(state.maxLives)

document.addEventListener('keydown', ev => {
  if (!state.started && ev.key === ' ') return start()
  if (state.gameOver && ev.key === ' ') return restart()
  if (!state.started || state.gameOver) return

  if (ev.key === 'Escape' || ev.key === ' ') {
    if (state.pause) {
      setInfo(false)
      requestAnimationFrame(update)
    } else {
      setInfo('Press space or escape to continue')
    }
    return
  }

  if (state.pause) return

  const key = utils.mapKeyEvent[state.lang](ev)
  if (!key) return
  console.log(key)

  for (let i = 0; i < state.falling.length; i++) {
    if (state.falling[i].text === key) {
      state.dom.scene.removeChild(state.falling[i].element)
      state.falling.splice(i, 1)
      updateScore(state.score + 1)
      playSound(state.audio.correct)
      return
    }
  }

  updateLives(state.lives - 1)
  showError(key)
  playSound(state.audio.wrong)
})
