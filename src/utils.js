'use strict'

const bel = require('bel')
const layouts = require('./layouts')

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

const renderKeyboard = layout => {
  const map = mapKeyCode(layout)
  return bel`
    <div class="keyboard">
      <div class="row">
        <div class="key Backquote">${map('Backquote')}</div>
        <div class="key Digit1">${map('Digit1')}</div>
        <div class="key Digit2">${map('Digit2')}</div>
        <div class="key Digit3">${map('Digit3')}</div>
        <div class="key Digit4">${map('Digit4')}</div>
        <div class="key Digit5">${map('Digit5')}</div>
        <div class="key Digit6">${map('Digit6')}</div>
        <div class="key Digit7">${map('Digit7')}</div>
        <div class="key Digit8">${map('Digit8')}</div>
        <div class="key Digit9">${map('Digit9')}</div>
        <div class="key Digit0">${map('Digit0')}</div>
        <div class="key Minus">${map('Minus')}</div>
        <div class="key Equal">${map('Equal')}</div>
        <div class="key Backspace">␡</div>
      </div>
      <div class="row">
        <div class="key Tab">↹</div>
        <div class="key KeyQ">${map('KeyQ')}</div>
        <div class="key KeyW">${map('KeyW')}</div>
        <div class="key KeyE">${map('KeyE')}</div>
        <div class="key KeyR">${map('KeyR')}</div>
        <div class="key KeyT">${map('KeyT')}</div>
        <div class="key KeyY">${map('KeyY')}</div>
        <div class="key KeyU">${map('KeyU')}</div>
        <div class="key KeyI">${map('KeyI')}</div>
        <div class="key KeyO">${map('KeyO')}</div>
        <div class="key KeyP">${map('KeyP')}</div>
        <div class="key BracketLeft">${map('BracketLeft')}</div>
        <div class="key BracketRight">${map('BracketRight')}</div>
        <div class="key Backslash">${map('Backslash')}</div>
      </div>
      <div class="row">
        <div class="key CapsLock">⇪</div>
        <div class="key KeyA">${map('KeyA')}</div>
        <div class="key KeyS">${map('KeyS')}</div>
        <div class="key KeyD">${map('KeyD')}</div>
        <div class="key KeyF">${map('KeyF')}</div>
        <div class="key KeyG">${map('KeyG')}</div>
        <div class="key KeyH">${map('KeyH')}</div>
        <div class="key KeyJ">${map('KeyJ')}</div>
        <div class="key KeyK">${map('KeyK')}</div>
        <div class="key KeyL">${map('KeyL')}</div>
        <div class="key Semicolon">${map('Semicolon')}</div>
        <div class="key Quote">${map('Quote')}</div>
        <div class="key Enter">⏎</div>
      </div>
      <div class="row">
        <div class="key Shift">⇧</div>
        <div class="key KeyZ">${map('KeyZ')}</div>
        <div class="key KeyX">${map('KeyX')}</div>
        <div class="key KeyC">${map('KeyC')}</div>
        <div class="key KeyV">${map('KeyV')}</div>
        <div class="key KeyB">${map('KeyB')}</div>
        <div class="key KeyN">${map('KeyN')}</div>
        <div class="key KeyM">${map('KeyM')}</div>
        <div class="key Comma">${map('Comma')}</div>
        <div class="key Period">${map('Period')}</div>
        <div class="key Slash">${map('Slash')}</div>
        <div class="key Shift">⇧</div>
      </div>
    </div>
  `
}

module.exports = { mapKeyCode, mapKeyEvent, layouts, renderKeyboard }
