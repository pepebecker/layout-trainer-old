'use strict'

const WebAudioFontPlayer = require('webaudiofont')
const path = require('path')

const AudioContextFunc = window.AudioContext || window.webkitAudioContext
const audioContext = new AudioContextFunc()
const player = new WebAudioFontPlayer()

let instr = null

const loadInstrument = url => {
  const name = '_tone_' + path.basename(url, '.js')
  player.loader.startLoad(audioContext, url, name)
  player.loader.waitLoad(() => instr = window[name])
}

const playNote = note => {
  player.queueWaveTable(audioContext, audioContext.destination, instr, 0, note, 1)
}

const createPlayScore = melody => score => {
  const length = melody[0].notes.length
  for (let voice of melody) {
    const note = voice.notes[score % length]
    if (note && (score >= length * voice.startAt)) playNote(note)
  }
}

module.exports = {
  loadInstrument,
  playNote,
  createPlayScore,
  play: file => (new Audio(file)).play()
}
