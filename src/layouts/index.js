'use strict'

const en_us = require('./en-us')

module.exports = {
  en_us,
  de_de: Object.assign({}, en_us, require('./de-de')),
  es_es: Object.assign({}, en_us, require('./es-es')),
  ko:    Object.assign({}, en_us, require('./ko'   )),
  ru:    Object.assign({}, en_us, require('./ru'   )),
  zh_tw: Object.assign({}, en_us, require('./zh-tw'))
}
