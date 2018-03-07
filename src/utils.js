'use strict'

const layouts = require('./layouts')
const renderKeyboard = require('./render-keyboard')

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
  if (ev.code === 'Quote' || ev.code === 'Slash') ev.preventDefault() // Firefox Quicks find
  return mapKeyCode(layout)(ev.code, ev.shiftKey)
}

for (const key in layouts) {
  mapKeyEvent[key] = mapKeyEvent(layouts[key])
}

module.exports = {
  mapKeyCode,
  mapKeyEvent,
  layouts,
  renderKeyboard: layout => renderKeyboard(mapKeyCode(layout)),
  getRandom: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
}
