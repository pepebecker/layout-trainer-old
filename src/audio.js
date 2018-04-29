'use strict'

const WebAudioFontPlayer = require('webaudiofont')
const path = require('path')

const AudioContextFunc = window.AudioContext || window.webkitAudioContext
const audioContext = new AudioContextFunc()
const player = new WebAudioFontPlayer()

let instr = null

const loadInstrument = async url => {
  const name = '_tone_' + path.basename(url, '.js')
  player.loader.startLoad(audioContext, url, name)
  return new Promise((resolve, reject) => {
    player.loader.waitLoad(() => {
      instr = window[name]
      resolve(instr)
    })
  })
}

const playNote = note => {
  player.queueWaveTable(audioContext, audioContext.destination, instr, 0, note, 0.4, 0.4)
}

const createPlayScore = melody => score => {
  for (let voice of melody) {
    const length = voice.notes.length
    if(score >= voice.startAt && score < voice.endAt){
      const note = voice.notes[(score-voice.startAt) % length]
      if(note) playNote(note)
    }
  }
}

module.exports = {
  loadInstrument,
  playNote,
  createPlayScore,
  play: file => (new Audio(file)).play()
}
