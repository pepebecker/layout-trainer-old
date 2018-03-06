'use strict'

const en_us = require('./en-us')

module.exports = {
  en_us,
  de_de: Object.assign({}, en_us, require('./de-de')),
  en_gb: Object.assign({}, en_us, require('./en-gb')),
  es_es: Object.assign({}, en_us, require('./es-es')),
  jp:    Object.assign({}, en_us, require('./jp'   )),
  ko:    Object.assign({}, en_us, require('./ko'   )),
  ru:    Object.assign({}, en_us, require('./ru'   )),
  zh_tw: Object.assign({}, en_us, require('./zh-tw'))
}
