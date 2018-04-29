'use strict'

require('./style.css')

const { parse } = require('query-string')
const utils = require('./utils')
const langs = require('./languages')
const audio = require('./audio')
const melodies = require('./melodies')

const state = {
  lang: null,
  mode: 0,
  falling: [],
  maxLives: 5,
  lives: 0,
  score: 0,
  gameOver: false,
  started: false,
  pause: false,
  speed: 1,
  lastTime: 0,
  showKeyboard: 'hidden',
  melody: 'beethoven',
  dom: {
    setup: document.querySelector('.setup'),
    start: document.querySelector('.start_btn'),
    layout_sel: document.querySelector('.layout_sel'),
    mode_sel: document.querySelector('.mode_sel'),
    melody_sel: document.querySelector('.melody_sel'),
    keyboard_sel: document.querySelector('.keyboard_sel'),
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

const spawn = (text, shift, x = -1) => {
  const element = document.createElement('div')
  element.appendChild(document.createTextNode(text))
  element.className = 'entity'
  if (shift) element.classList.add('shift')
  x = (x > -1 ? x : utils.getRandom(20, window.innerWidth - 40))
  element.style.left = x + 'px'
  state.dom.scene.appendChild(element)
  state.falling.push({ text, element, y: 0 })
}

const update = time => {
  if (state.pause || state.gameOver) return

  for (const i in state.falling) {
    state.falling[i].y += state.speed
    state.falling[i].element.style.top = state.falling[i].y + 'px'

    if (state.falling[i].y > window.innerHeight) {
      state.dom.scene.removeChild(state.falling[i].element)
      state.falling.splice(i, 1)
      updateLives(state.lives - 1)
    }
  }

  if (time > state.lastTime + (1000 / state.speed)) {
    let l = []
    for (let set of langs[state.lang].modes[state.mode].sets) {
      l = l.concat(langs[state.lang].sets[set])
    }
    const i = utils.getRandom(0, l.length - 1)
    const { code, shift } = utils.mapKeyToCode(state.lang, l[i])
    const x = utils.keyPositions[code]
    spawn(l[i], shift, x * (window.innerWidth - 40) + 20)
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
  state.speed = 1
  start()
}

const removeKey = index => {
  const explosion = document.createElement('div')
  explosion.classList.add('explosion')
  explosion.style.left = state.falling[index].element.style.left
  explosion.style.top = state.falling[index].element.style.top
  state.dom.scene.appendChild(explosion)
  setTimeout(() => state.dom.scene.removeChild(explosion), 1000)

  state.dom.scene.removeChild(state.falling[index].element)
  state.falling.splice(index, 1)
}

const checkKey = key => {
  for (let i = 0; i < state.falling.length; i++) {
    if (state.falling[i].text === key) {
      removeKey(i)
      return true
    }
  }
  return false
}

const showKeyboard = value => {
  if (state.dom.keyboard) {
    if (value == 'left') {
      state.dom.keyboard.style.left = '0'
      state.dom.keyboard.style.right = 'auto'
      state.dom.keyboard.style.display = 'block'
    } else if (value == 'right') {
      state.dom.keyboard.style.right = '0'
      state.dom.keyboard.style.left = 'auto'
      state.dom.keyboard.style.display = 'block'
    } else {
      state.dom.keyboard.style.display = 'none'
    }
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

const updateLayoutSelection = selectedLang => {
  state.dom.layout_sel.innerHTML = ''
  for (const l in langs) {
    const opt = new Option(langs[l].label, l, null, selectedLang === l)
    state.dom.layout_sel.appendChild(opt)
  }
}

const updateModeSelection = (lang, selectedMode) => {
  state.dom.mode_sel.innerHTML = ''
  for (const i in langs[lang].modes) {
    const opt = new Option(langs[lang].modes[i].label, i, null, selectedMode === i)
    state.dom.mode_sel.appendChild(opt)
  }
}

const updateMelodySelection = selectedMelody => {
  state.dom.melody_sel.innerHTML = ''
  for (const m in melodies) {
    const opt = new Option(melodies[m].label, m, null, selectedMelody === m)
    state.dom.melody_sel.appendChild(opt)
  }
}

const main = async () => {
  updateLives(state.maxLives)

  // Language
  state.lang = localStorage.getItem('lang') || Object.keys(langs)[0]
  updateLayoutSelection(state.lang)

  // Mode
  state.mode = localStorage.getItem('mode') || 0
  updateModeSelection(state.lang, state.mode)

  // Melody
  state.melody = localStorage.getItem('melody') || Object.keys(melodies)[0]
  updateMelodySelection(state.melody)
  let playScore = audio.createPlayScore(melodies[state.melody].voices)

  // Keyboard
  state.showKeyboard = localStorage.getItem('keyboard') || 'hide'
  state.dom.keyboard_sel.value = state.showKeyboard
  renderKeyboard(state.lang)

  await audio.loadInstrument(melodies[state.melody].instrument)
  state.dom.start.addEventListener('click', start)

  state.dom.layout_sel.addEventListener('change', ev => {
    state.lang = state.dom.layout_sel.value
    state.mode = 0
    localStorage.setItem('lang', state.lang)
    localStorage.setItem('mode', state.mode)
    updateModeSelection(state.lang, 0)
    renderKeyboard(state.lang)
  })

  state.dom.mode_sel.addEventListener('change', ev => {
    state.mode = parseInt(state.dom.mode_sel.value)
    localStorage.setItem('mode', state.mode)
  })

  state.dom.melody_sel.addEventListener('change', ev => {
    state.melody = state.dom.melody_sel.value
    localStorage.setItem('melody', state.melody)
    state.dom.start.disabled = true
    audio.loadInstrument(melodies[state.melody].instrument)
    .then(() => {
      playScore = audio.createPlayScore(melodies[state.melody].voices)
      state.dom.start.disabled = false
    })
  })

  state.dom.keyboard_sel.addEventListener('change', ev => {
    state.showKeyboard = state.dom.keyboard_sel.value
    localStorage.setItem('keyboard', state.showKeyboard)
    showKeyboard(state.showKeyboard)
  })

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

    if (checkKey(key)) {
      playScore(state.score)
      updateScore(state.score + 1)
      state.speed *= 1.0025
    } else {
      updateLives(state.lives - 1)
      showError(key)
      audio.play(state.audio.wrong)
    }
  })
}

main().catch(console.error)
