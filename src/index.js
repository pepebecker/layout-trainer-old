'use strict'

require('./style.css')

const { parse } = require('query-string')
const utils = require('./utils')
const langs = require('./languages')
const audio = require('./audio')
const melodies = require('./melodies')
const consts = require('./constants')

window.state = {
  lang: null,
  mode: 0,
  set: [],
  falling: [],
  currentWord: { wordIndex: -1, charIndex: 0, keyIndex: 0 },
  maxLives: 5,
  lives: 0,
  score: 0,
  gameOver: false,
  started: false,
  pause: false,
  speed: .5,
  lastTime: 0,
  sandbox: false,
  updateInterval: null,
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

const getSet = () => {
  let l = []
  for (let set of langs[state.lang].modes[state.mode].sets) {
    l = l.concat(langs[state.lang].sets[set])
  }
  return l
}

const populateWithChars = (element, word) => {
  const characters = []
  if (typeof word === 'string') {
    for (let i = 0; i < word.length; i++) {
      const char = document.createElement('div')
      char.className = 'char'
      char.appendChild(document.createTextNode(word[i]))
      element.appendChild(char)
      characters.push({ char: word[i], dom: char, keys: word[i].toUpperCase() })
    }
  } else {
    const text = word[0]
    for (let i = 0; i < text.length; i++) {
      const char = document.createElement('div')
      char.className = 'char'
      char.appendChild(document.createTextNode(text[i]))
      element.appendChild(char)
      characters.push({ char: text[i], dom: char, keys: word[i + 1].toUpperCase() })
    }
  }  
  return characters
}

const spawn = (word, shift, x = -1) => {
  const wordEl = document.createElement('div')
  const count = state.falling.push({
    word, dom: wordEl, y: 0,
    speed: state.speed
  })
  wordEl.className = 'entity'
  if (word.length > 1) {
    state.falling[count - 1].chars = populateWithChars(wordEl, word)
  } else {
    wordEl.appendChild(document.createTextNode(word))
    state.falling[count - 1].speed *= (Math.random() * 0.6 + 0.8)
  }
  if (shift) wordEl.classList.add('shift')
  state.dom.scene.appendChild(wordEl)
  x = (x > -1 ? x : utils.getRandom(20, window.innerWidth - 40 - wordEl.clientWidth))
  wordEl.style.left = x + 'px'
}

const update = () => {
  if (state.pause || state.gameOver) {
    clearInterval(state.updateInterval)
    return
  }

  for (const i in state.falling) {
    state.falling[i].y += state.falling[i].speed
    if (state.falling[i].y > window.innerHeight) {
      state.dom.scene.removeChild(state.falling[i].dom)
      state.falling.splice(i, 1)
      if (!state.sandbox) updateLives(state.lives - 1)
    }
  }
}

const render = time => {
  if (state.pause || state.gameOver) return

  for (const i in state.falling) {
    state.falling[i].dom.style.top = state.falling[i].y + 'px'
  }

  if (time > state.lastTime + (1000 / state.speed)) {
    const i = utils.getRandom(0, state.set.length - 1)
    const entity = state.set[i]
    if (entity.length > 1) {
      spawn(entity)
    } else {
      const { code, shift } = utils.mapKeyToCode(state.lang, entity)
      const x = utils.keyPositions[code]
      spawn(entity, shift, x * (window.innerWidth - 40) + 20)
    }
    state.lastTime = time
  }

  requestAnimationFrame(render)
}

const resume = () => {
  state.updateInterval = setInterval(update, 16)
  requestAnimationFrame(render)
}

const start = () => {
  state.dom.setup.style.display = 'none'
  state.dom.info.style.display = 'none'
  state.set = getSet()
  state.started = true
  resume()
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

const removeWord = index => {
  const explosion = document.createElement('div')
  explosion.classList.add('explosion')
  explosion.style.left = state.falling[index].dom.style.left
  explosion.style.top = state.falling[index].dom.style.top
  explosion.style.width = state.falling[index].dom.clientWidth + 'px'
  state.dom.scene.appendChild(explosion)
  setTimeout(() => state.dom.scene.removeChild(explosion), 1000)

  state.dom.scene.removeChild(state.falling[index].dom)
  state.falling.splice(index, 1)

  state.currentWord.wordIndex = -1
  state.currentWord.charIndex = 0
  state.currentWord.keyIndex = 0
}

const getWordForKey = key => {
  if (state.currentWord.wordIndex >= 0) return state.currentWord
  for (let i = 0; i < state.falling.length; i++) {
    if (state.falling[i].word === key) {
      state.currentWord.wordIndex = i
      return { wordIndex: i, charIndex: 0, keyIndex: 0 }
    } else if (state.falling[i].chars && state.falling[i].chars[0].keys[0] === key) {
      state.falling[i].chars[0].dom.classList.add('current')
      state.currentWord.wordIndex = i
      return { wordIndex: i, charIndex: 0, keyIndex: 0 }
    }
  }
  return { wordIndex: -1, charIndex: 0, keyIndex: 0 }
}

const increaseCharacterIndex = () => {
  const wordIndex = state.currentWord.wordIndex
  const charIndex = state.currentWord.charIndex
  const charsCount = state.falling[wordIndex].chars.length
  const keysCount = state.falling[wordIndex].chars[charIndex].keys.length

  state.currentWord.keyIndex ++
  if (state.currentWord.keyIndex === keysCount) {
    state.currentWord.charIndex ++
    state.currentWord.keyIndex = 0
    if (state.currentWord.charIndex === charsCount) {
      state.currentWord.wordIndex = -1
      state.currentWord.charIndex = 0
      state.currentWord.keyIndex = 0
      return consts.INCREASE_WORD_COMPLETE
    }
    state.falling[wordIndex].chars[charIndex + 1].dom.classList.add('current')
    return consts.INCREASE_CHAR_COMPLETE
  }
  return consts.INCREASE_IDLE
}

const validateKey = key => {
  const { wordIndex, charIndex, keyIndex } = getWordForKey(key)
  
  if (wordIndex >= 0) {
    if (state.falling[wordIndex].word.length === 1) {
      removeWord(wordIndex)
      return { status: consts.INPUT_COMPLETE, score: 1 }
    }
    if (state.falling[wordIndex].chars[charIndex].keys[keyIndex] === key) {
      const increaseStatus = increaseCharacterIndex()
      if (increaseStatus === consts.INCREASE_IDLE) {
        return { status: consts.INPUT_CORRECT }
      }
      if (increaseStatus === consts.INCREASE_CHAR_COMPLETE) {
        state.falling[wordIndex].chars[charIndex].dom.classList.add('correct')
        return { status: consts.INPUT_CORRECT }
      }
      if (increaseStatus === consts.INCREASE_WORD_COMPLETE) {
        const length = state.falling[wordIndex].chars.length
        removeWord(wordIndex)
        return { status: consts.INPUT_COMPLETE, score: length }
      }
    }
    return { status: consts.INPUT_WRONG }
  }
  return { status: consts.INPUT_WRONG }
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
  state.mode = parseInt(localStorage.getItem('mode') || 0)
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
        resume()
      } else {
        setInfo('Press space or escape to continue')
      }
      return
    }

    if (state.pause) return

    const key = utils.mapKeyEvent[state.lang](ev)
    if (!key) return

    const result = validateKey(key)
    if (result.status == consts.INPUT_CORRECT) {
      playScore(state.score)
    } else if (result.status == consts.INPUT_COMPLETE) {
      playScore(state.score)
      updateScore(state.score + result.score)
      state.speed += 0.005
    } else {
      updateLives(state.lives - 1)
      showError(key)
      audio.play(state.audio.wrong)
    }
  })
}

main().catch(console.error)
