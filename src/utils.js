'use strict'

const layouts = require('./layouts')
const renderKeyboard = require('./render-keyboard')
const keyPositions = require('./key-positions')

const mapKeyCode = layout => (code, shift) => {
  if (layout[code]) {
    if (typeof layout[code] === 'string') {
      return layout[code].toUpperCase()
    }
    return shift ? layout[code].shift : layout[code].default
  }
  return ''
}

const mapKeyEvent = layout => ev => {
  if (ev.code === 'Quote' || ev.code === 'Slash') ev.preventDefault() // Firefox Quick find
  return mapKeyCode(layout)(ev.code, ev.shiftKey)
}

for (const key in layouts) {
  mapKeyEvent[key] = mapKeyEvent(layouts[key])
}

const mapKeyToCode = (lang, key) => {
  const layout = layouts[lang]
  key = key.toLowerCase()
  for (const code in layout) {
    if (typeof layout[code] === 'string' && layout[code].toLowerCase() === key) {
      return code
    } else if (typeof layout[code].default === 'string' && layout[code].default.toLowerCase() === key) {
     return code 
    } else if (typeof layout[code].shift === 'string' && layout[code].shift.toLowerCase() === key) {
      return code
    }
  }
}

module.exports = {
  mapKeyCode,
  mapKeyEvent,
  mapKeyToCode,
  keyPositions,
  layouts,
  renderKeyboard: layout => renderKeyboard(mapKeyCode(layout)),
  getRandom: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
}
