'use strict'

require('./style.css')

const { parse } = require('query-string')
const utils = require('./utils')
const langs = require('./languages')
const audio = require('./audio')
const melodies = require('./melodies')

const state = {
  lang: 'en_us',
  falling: [],
  maxLives: 5,
  lives: 0,
  score: 0,
  gameOver: false,
  started: false,
  pause: false,
  lastTime: 0,
  show_keyboard: true,
  dom: {
    setup: document.querySelector('.setup'),
    start: document.querySelector('.start_btn'),
    layout_sel: document.querySelector('.layout_sel'),
    show_keyboard: document.querySelector('.show_keyboard'),
    scene: document.querySelector('.scene'),
    score: document.querySelector('.score_value'),
    lives: document.querySelector('.lives'),
    info: document.querySelector('.info'),
    error: document.querySelector('.error')
  },
  audio: {
    wrong: 'public/mp3/wrong.mp3',
    gameover: 'public/mp3/gameover.mp3'
  }
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
    audio.play(state.audio.gameover)
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
  const x = utils.getRandom(20, window.innerWidth - 40)
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
    const i = utils.getRandom(0, l.length - 1)
    spawn(l[i])
    state.lastTime = time
  }

  requestAnimationFrame(update)
}

const start = () => {
  state.dom.setup.style.display = 'none'
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

const checkKey = (key, done) => {
  for (let i = 0; i < state.falling.length; i++) {
    if (state.falling[i].text === key) {
      state.dom.scene.removeChild(state.falling[i].element)
      state.falling.splice(i, 1)
      done(true)
      return
    }
  }
  done(false)
}

const showKeyboard = value => {
  state.showKeyboard = value
  if (state.dom.keyboard) {
    state.dom.keyboard.style.display = value ? 'block' : 'none'
  }
}

const renderKeyboard = lang => {
  if (state.dom.keyboard) {
    document.body.removeChild(state.dom.keyboard)
  }
  state.dom.keyboard = utils.renderKeyboard(utils.layouts[lang])
  document.body.appendChild(state.dom.keyboard)
  showKeyboard(state.showKeyboard)
}

const main = async () => {
  await audio.loadInstrument('https://surikov.github.io/webaudiofontdata/sound/0000_JCLive_sf2_file.js')
  const playScore = audio.createPlayScore(melodies.beethoven)

  updateLives(state.maxLives)

  state.dom.start.addEventListener('click', start)
  state.dom.layout_sel.addEventListener('change', ev => {
    state.lang = state.dom.layout_sel.value
    renderKeyboard(state.lang)
    localStorage.setItem('lang', state.lang)
  })

  state.dom.show_keyboard.addEventListener('change', ev => {
    state.showKeyboard = state.dom.show_keyboard.checked
    showKeyboard(state.showKeyboard)
    localStorage.setItem('show_keyboard', state.showKeyboard ? 'show' : 'hide')
  })

  const lang = localStorage.getItem('lang')
  if (lang) {
    state.lang = lang
    state.dom.layout_sel.value = lang
  }

  const show = localStorage.getItem('show_keyboard')
  if (typeof show === 'string') {
    showKeyboard(show === 'show')
  } else {
    showKeyboard(state.showKeyboard)
  }

  renderKeyboard(state.lang)

  document.addEventListener('keydown', ev => {
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

    checkKey(key, correct => {
      if (correct) {
        playScore(state.score)
        updateScore(state.score + 1)
      } else {
        updateLives(state.lives - 1)
        showError(key)
        audio.play(state.audio.wrong)
      }
    })
  })
}

main().catch(console.error)
