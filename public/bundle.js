(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
var trailingNewlineRegex = /\n[\s]+$/
var leadingNewlineRegex = /^\n[\s]+/
var trailingSpaceRegex = /[\s]+$/
var leadingSpaceRegex = /^[\s]+/
var multiSpaceRegex = /[\n\s]+/g

var TEXT_TAGS = [
  'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'data', 'dfn', 'em', 'i',
  'kbd', 'mark', 'q', 'rp', 'rt', 'rtc', 'ruby', 's', 'amp', 'small', 'span',
  'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr'
]

var VERBATIM_TAGS = [
  'code', 'pre', 'textarea'
]

module.exports = function appendChild (el, childs) {
  if (!Array.isArray(childs)) return

  var nodeName = el.nodeName.toLowerCase()

  var hadText = false
  var value, leader

  for (var i = 0, len = childs.length; i < len; i++) {
    var node = childs[i]
    if (Array.isArray(node)) {
      appendChild(el, node)
      continue
    }

    if (typeof node === 'number' ||
      typeof node === 'boolean' ||
      typeof node === 'function' ||
      node instanceof Date ||
      node instanceof RegExp) {
      node = node.toString()
    }

    var lastChild = el.childNodes[el.childNodes.length - 1]

    // Iterate over text nodes
    if (typeof node === 'string') {
      hadText = true

      // If we already had text, append to the existing text
      if (lastChild && lastChild.nodeName === '#text') {
        lastChild.nodeValue += node

      // We didn't have a text node yet, create one
      } else {
        node = document.createTextNode(node)
        el.appendChild(node)
        lastChild = node
      }

      // If this is the last of the child nodes, make sure we close it out
      // right
      if (i === len - 1) {
        hadText = false
        // Trim the child text nodes if the current node isn't a
        // node where whitespace matters.
        if (TEXT_TAGS.indexOf(nodeName) === -1 &&
          VERBATIM_TAGS.indexOf(nodeName) === -1) {
          value = lastChild.nodeValue
            .replace(leadingNewlineRegex, '')
            .replace(trailingSpaceRegex, '')
            .replace(trailingNewlineRegex, '')
            .replace(multiSpaceRegex, ' ')
          if (value === '') {
            el.removeChild(lastChild)
          } else {
            lastChild.nodeValue = value
          }
        } else if (VERBATIM_TAGS.indexOf(nodeName) === -1) {
          // The very first node in the list should not have leading
          // whitespace. Sibling text nodes should have whitespace if there
          // was any.
          leader = i === 0 ? '' : ' '
          value = lastChild.nodeValue
            .replace(leadingNewlineRegex, leader)
            .replace(leadingSpaceRegex, ' ')
            .replace(trailingSpaceRegex, '')
            .replace(trailingNewlineRegex, '')
            .replace(multiSpaceRegex, ' ')
          lastChild.nodeValue = value
        }
      }

    // Iterate over DOM nodes
    } else if (node && node.nodeType) {
      // If the last node was a text node, make sure it is properly closed out
      if (hadText) {
        hadText = false

        // Trim the child text nodes if the current node isn't a
        // text node or a code node
        if (TEXT_TAGS.indexOf(nodeName) === -1 &&
          VERBATIM_TAGS.indexOf(nodeName) === -1) {
          value = lastChild.nodeValue
            .replace(leadingNewlineRegex, '')
            .replace(trailingNewlineRegex, '')
            .replace(multiSpaceRegex, ' ')

          // Remove empty text nodes, append otherwise
          if (value === '') {
            el.removeChild(lastChild)
          } else {
            lastChild.nodeValue = value
          }
        // Trim the child nodes if the current node is not a node
        // where all whitespace must be preserved
        } else if (VERBATIM_TAGS.indexOf(nodeName) === -1) {
          value = lastChild.nodeValue
            .replace(leadingSpaceRegex, ' ')
            .replace(leadingNewlineRegex, '')
            .replace(trailingNewlineRegex, '')
            .replace(multiSpaceRegex, ' ')
          lastChild.nodeValue = value
        }
      }

      // Store the last nodename
      var _nodeName = node.nodeName
      if (_nodeName) nodeName = _nodeName.toLowerCase()

      // Append the node to the DOM
      el.appendChild(node)
    }
  }
}

},{}],2:[function(require,module,exports){
var hyperx = require('hyperx')
var appendChild = require('./appendChild')

var SVGNS = 'http://www.w3.org/2000/svg'
var XLINKNS = 'http://www.w3.org/1999/xlink'

var BOOL_PROPS = [
  'autofocus', 'checked', 'defaultchecked', 'disabled', 'formnovalidate',
  'indeterminate', 'readonly', 'required', 'selected', 'willvalidate'
]

var COMMENT_TAG = '!--'

var SVG_TAGS = [
  'svg', 'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor',
  'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile',
  'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix',
  'feComponentTransfer', 'feComposite', 'feConvolveMatrix',
  'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood',
  'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage',
  'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight',
  'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter',
  'font', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src',
  'font-face-uri', 'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image',
  'line', 'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph',
  'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect',
  'set', 'stop', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref',
  'tspan', 'use', 'view', 'vkern'
]

function belCreateElement (tag, props, children) {
  var el

  // If an svg tag, it needs a namespace
  if (SVG_TAGS.indexOf(tag) !== -1) {
    props.namespace = SVGNS
  }

  // If we are using a namespace
  var ns = false
  if (props.namespace) {
    ns = props.namespace
    delete props.namespace
  }

  // Create the element
  if (ns) {
    el = document.createElementNS(ns, tag)
  } else if (tag === COMMENT_TAG) {
    return document.createComment(props.comment)
  } else {
    el = document.createElement(tag)
  }

  // Create the properties
  for (var p in props) {
    if (props.hasOwnProperty(p)) {
      var key = p.toLowerCase()
      var val = props[p]
      // Normalize className
      if (key === 'classname') {
        key = 'class'
        p = 'class'
      }
      // The for attribute gets transformed to htmlFor, but we just set as for
      if (p === 'htmlFor') {
        p = 'for'
      }
      // If a property is boolean, set itself to the key
      if (BOOL_PROPS.indexOf(key) !== -1) {
        if (val === 'true') val = key
        else if (val === 'false') continue
      }
      // If a property prefers being set directly vs setAttribute
      if (key.slice(0, 2) === 'on') {
        el[p] = val
      } else {
        if (ns) {
          if (p === 'xlink:href') {
            el.setAttributeNS(XLINKNS, p, val)
          } else if (/^xmlns($|:)/i.test(p)) {
            // skip xmlns definitions
          } else {
            el.setAttributeNS(null, p, val)
          }
        } else {
          el.setAttribute(p, val)
        }
      }
    }
  }

  appendChild(el, children)
  return el
}

module.exports = hyperx(belCreateElement, {comments: true})
module.exports.default = module.exports
module.exports.createElement = belCreateElement

},{"./appendChild":1,"hyperx":5}],3:[function(require,module,exports){
'use strict';
var token = '%[a-f0-9]{2}';
var singleMatcher = new RegExp(token, 'gi');
var multiMatcher = new RegExp('(' + token + ')+', 'gi');

function decodeComponents(components, split) {
	try {
		// Try to decode the entire string first
		return decodeURIComponent(components.join(''));
	} catch (err) {
		// Do nothing
	}

	if (components.length === 1) {
		return components;
	}

	split = split || 1;

	// Split the array in 2 parts
	var left = components.slice(0, split);
	var right = components.slice(split);

	return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
}

function decode(input) {
	try {
		return decodeURIComponent(input);
	} catch (err) {
		var tokens = input.match(singleMatcher);

		for (var i = 1; i < tokens.length; i++) {
			input = decodeComponents(tokens, i).join('');

			tokens = input.match(singleMatcher);
		}

		return input;
	}
}

function customDecodeURIComponent(input) {
	// Keep track of all the replacements and prefill the map with the `BOM`
	var replaceMap = {
		'%FE%FF': '\uFFFD\uFFFD',
		'%FF%FE': '\uFFFD\uFFFD'
	};

	var match = multiMatcher.exec(input);
	while (match) {
		try {
			// Decode as big chunks as possible
			replaceMap[match[0]] = decodeURIComponent(match[0]);
		} catch (err) {
			var result = decode(match[0]);

			if (result !== match[0]) {
				replaceMap[match[0]] = result;
			}
		}

		match = multiMatcher.exec(input);
	}

	// Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
	replaceMap['%C2'] = '\uFFFD';

	var entries = Object.keys(replaceMap);

	for (var i = 0; i < entries.length; i++) {
		// Replace all decoded components
		var key = entries[i];
		input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
	}

	return input;
}

module.exports = function (encodedURI) {
	if (typeof encodedURI !== 'string') {
		throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + typeof encodedURI + '`');
	}

	try {
		encodedURI = encodedURI.replace(/\+/g, ' ');

		// Try the built in decoder first
		return decodeURIComponent(encodedURI);
	} catch (err) {
		// Fallback to a more advanced decoder
		return customDecodeURIComponent(encodedURI);
	}
};

},{}],4:[function(require,module,exports){
module.exports = attributeToProperty

var transform = {
  'class': 'className',
  'for': 'htmlFor',
  'http-equiv': 'httpEquiv'
}

function attributeToProperty (h) {
  return function (tagName, attrs, children) {
    for (var attr in attrs) {
      if (attr in transform) {
        attrs[transform[attr]] = attrs[attr]
        delete attrs[attr]
      }
    }
    return h(tagName, attrs, children)
  }
}

},{}],5:[function(require,module,exports){
var attrToProp = require('hyperscript-attribute-to-property')

var VAR = 0, TEXT = 1, OPEN = 2, CLOSE = 3, ATTR = 4
var ATTR_KEY = 5, ATTR_KEY_W = 6
var ATTR_VALUE_W = 7, ATTR_VALUE = 8
var ATTR_VALUE_SQ = 9, ATTR_VALUE_DQ = 10
var ATTR_EQ = 11, ATTR_BREAK = 12
var COMMENT = 13

module.exports = function (h, opts) {
  if (!opts) opts = {}
  var concat = opts.concat || function (a, b) {
    return String(a) + String(b)
  }
  if (opts.attrToProp !== false) {
    h = attrToProp(h)
  }

  return function (strings) {
    var state = TEXT, reg = ''
    var arglen = arguments.length
    var parts = []

    for (var i = 0; i < strings.length; i++) {
      if (i < arglen - 1) {
        var arg = arguments[i+1]
        var p = parse(strings[i])
        var xstate = state
        if (xstate === ATTR_VALUE_DQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_SQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_W) xstate = ATTR_VALUE
        if (xstate === ATTR) xstate = ATTR_KEY
        p.push([ VAR, xstate, arg ])
        parts.push.apply(parts, p)
      } else parts.push.apply(parts, parse(strings[i]))
    }

    var tree = [null,{},[]]
    var stack = [[tree,-1]]
    for (var i = 0; i < parts.length; i++) {
      var cur = stack[stack.length-1][0]
      var p = parts[i], s = p[0]
      if (s === OPEN && /^\//.test(p[1])) {
        var ix = stack[stack.length-1][1]
        if (stack.length > 1) {
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === OPEN) {
        var c = [p[1],{},[]]
        cur[2].push(c)
        stack.push([c,cur[2].length-1])
      } else if (s === ATTR_KEY || (s === VAR && p[1] === ATTR_KEY)) {
        var key = ''
        var copyKey
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_KEY) {
            key = concat(key, parts[i][1])
          } else if (parts[i][0] === VAR && parts[i][1] === ATTR_KEY) {
            if (typeof parts[i][2] === 'object' && !key) {
              for (copyKey in parts[i][2]) {
                if (parts[i][2].hasOwnProperty(copyKey) && !cur[1][copyKey]) {
                  cur[1][copyKey] = parts[i][2][copyKey]
                }
              }
            } else {
              key = concat(key, parts[i][2])
            }
          } else break
        }
        if (parts[i][0] === ATTR_EQ) i++
        var j = i
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_VALUE || parts[i][0] === ATTR_KEY) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][1])
            else parts[i][1]==="" || (cur[1][key] = concat(cur[1][key], parts[i][1]));
          } else if (parts[i][0] === VAR
          && (parts[i][1] === ATTR_VALUE || parts[i][1] === ATTR_KEY)) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][2])
            else parts[i][2]==="" || (cur[1][key] = concat(cur[1][key], parts[i][2]));
          } else {
            if (key.length && !cur[1][key] && i === j
            && (parts[i][0] === CLOSE || parts[i][0] === ATTR_BREAK)) {
              // https://html.spec.whatwg.org/multipage/infrastructure.html#boolean-attributes
              // empty string is falsy, not well behaved value in browser
              cur[1][key] = key.toLowerCase()
            }
            if (parts[i][0] === CLOSE) {
              i--
            }
            break
          }
        }
      } else if (s === ATTR_KEY) {
        cur[1][p[1]] = true
      } else if (s === VAR && p[1] === ATTR_KEY) {
        cur[1][p[2]] = true
      } else if (s === CLOSE) {
        if (selfClosing(cur[0]) && stack.length) {
          var ix = stack[stack.length-1][1]
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === VAR && p[1] === TEXT) {
        if (p[2] === undefined || p[2] === null) p[2] = ''
        else if (!p[2]) p[2] = concat('', p[2])
        if (Array.isArray(p[2][0])) {
          cur[2].push.apply(cur[2], p[2])
        } else {
          cur[2].push(p[2])
        }
      } else if (s === TEXT) {
        cur[2].push(p[1])
      } else if (s === ATTR_EQ || s === ATTR_BREAK) {
        // no-op
      } else {
        throw new Error('unhandled: ' + s)
      }
    }

    if (tree[2].length > 1 && /^\s*$/.test(tree[2][0])) {
      tree[2].shift()
    }

    if (tree[2].length > 2
    || (tree[2].length === 2 && /\S/.test(tree[2][1]))) {
      throw new Error(
        'multiple root elements must be wrapped in an enclosing tag'
      )
    }
    if (Array.isArray(tree[2][0]) && typeof tree[2][0][0] === 'string'
    && Array.isArray(tree[2][0][2])) {
      tree[2][0] = h(tree[2][0][0], tree[2][0][1], tree[2][0][2])
    }
    return tree[2][0]

    function parse (str) {
      var res = []
      if (state === ATTR_VALUE_W) state = ATTR
      for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i)
        if (state === TEXT && c === '<') {
          if (reg.length) res.push([TEXT, reg])
          reg = ''
          state = OPEN
        } else if (c === '>' && !quot(state) && state !== COMMENT) {
          if (state === OPEN) {
            res.push([OPEN,reg])
          } else if (state === ATTR_KEY) {
            res.push([ATTR_KEY,reg])
          } else if (state === ATTR_VALUE && reg.length) {
            res.push([ATTR_VALUE,reg])
          }
          res.push([CLOSE])
          reg = ''
          state = TEXT
        } else if (state === COMMENT && /-$/.test(reg) && c === '-') {
          if (opts.comments) {
            res.push([ATTR_VALUE,reg.substr(0, reg.length - 1)],[CLOSE])
          }
          reg = ''
          state = TEXT
        } else if (state === OPEN && /^!--$/.test(reg)) {
          if (opts.comments) {
            res.push([OPEN, reg],[ATTR_KEY,'comment'],[ATTR_EQ])
          }
          reg = c
          state = COMMENT
        } else if (state === TEXT || state === COMMENT) {
          reg += c
        } else if (state === OPEN && c === '/' && reg.length) {
          // no-op, self closing tag without a space <br/>
        } else if (state === OPEN && /\s/.test(c)) {
          res.push([OPEN, reg])
          reg = ''
          state = ATTR
        } else if (state === OPEN) {
          reg += c
        } else if (state === ATTR && /[^\s"'=/]/.test(c)) {
          state = ATTR_KEY
          reg = c
        } else if (state === ATTR && /\s/.test(c)) {
          if (reg.length) res.push([ATTR_KEY,reg])
          res.push([ATTR_BREAK])
        } else if (state === ATTR_KEY && /\s/.test(c)) {
          res.push([ATTR_KEY,reg])
          reg = ''
          state = ATTR_KEY_W
        } else if (state === ATTR_KEY && c === '=') {
          res.push([ATTR_KEY,reg],[ATTR_EQ])
          reg = ''
          state = ATTR_VALUE_W
        } else if (state === ATTR_KEY) {
          reg += c
        } else if ((state === ATTR_KEY_W || state === ATTR) && c === '=') {
          res.push([ATTR_EQ])
          state = ATTR_VALUE_W
        } else if ((state === ATTR_KEY_W || state === ATTR) && !/\s/.test(c)) {
          res.push([ATTR_BREAK])
          if (/[\w-]/.test(c)) {
            reg += c
            state = ATTR_KEY
          } else state = ATTR
        } else if (state === ATTR_VALUE_W && c === '"') {
          state = ATTR_VALUE_DQ
        } else if (state === ATTR_VALUE_W && c === "'") {
          state = ATTR_VALUE_SQ
        } else if (state === ATTR_VALUE_DQ && c === '"') {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_SQ && c === "'") {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_W && !/\s/.test(c)) {
          state = ATTR_VALUE
          i--
        } else if (state === ATTR_VALUE && /\s/.test(c)) {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE || state === ATTR_VALUE_SQ
        || state === ATTR_VALUE_DQ) {
          reg += c
        }
      }
      if (state === TEXT && reg.length) {
        res.push([TEXT,reg])
        reg = ''
      } else if (state === ATTR_VALUE && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_DQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_SQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_KEY) {
        res.push([ATTR_KEY,reg])
        reg = ''
      }
      return res
    }
  }

  function strfn (x) {
    if (typeof x === 'function') return x
    else if (typeof x === 'string') return x
    else if (x && typeof x === 'object') return x
    else return concat('', x)
  }
}

function quot (state) {
  return state === ATTR_VALUE_SQ || state === ATTR_VALUE_DQ
}

var hasOwn = Object.prototype.hasOwnProperty
function has (obj, key) { return hasOwn.call(obj, key) }

var closeRE = RegExp('^(' + [
  'area', 'base', 'basefont', 'bgsound', 'br', 'col', 'command', 'embed',
  'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta', 'param',
  'source', 'track', 'wbr', '!--',
  // SVG TAGS
  'animate', 'animateTransform', 'circle', 'cursor', 'desc', 'ellipse',
  'feBlend', 'feColorMatrix', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
  'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR',
  'feGaussianBlur', 'feImage', 'feMergeNode', 'feMorphology',
  'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile',
  'feTurbulence', 'font-face-format', 'font-face-name', 'font-face-uri',
  'glyph', 'glyphRef', 'hkern', 'image', 'line', 'missing-glyph', 'mpath',
  'path', 'polygon', 'polyline', 'rect', 'set', 'stop', 'tref', 'use', 'view',
  'vkern'
].join('|') + ')(?:[\.#][a-zA-Z0-9\u007F-\uFFFF_:-]+)*$')
function selfClosing (tag) { return closeRE.test(tag) }

},{"hyperscript-attribute-to-property":4}],6:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],7:[function(require,module,exports){
'use strict';
var strictUriEncode = require('strict-uri-encode');
var objectAssign = require('object-assign');
var decodeComponent = require('decode-uri-component');

function encoderForArrayFormat(opts) {
	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, index) {
				return value === null ? [
					encode(key, opts),
					'[',
					index,
					']'
				].join('') : [
					encode(key, opts),
					'[',
					encode(index, opts),
					']=',
					encode(value, opts)
				].join('');
			};

		case 'bracket':
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'[]=',
					encode(value, opts)
				].join('');
			};

		default:
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'=',
					encode(value, opts)
				].join('');
			};
	}
}

function parserForArrayFormat(opts) {
	var result;

	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, accumulator) {
				result = /\[(\d*)\]$/.exec(key);

				key = key.replace(/\[\d*\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = {};
				}

				accumulator[key][result[1]] = value;
			};

		case 'bracket':
			return function (key, value, accumulator) {
				result = /(\[\])$/.exec(key);
				key = key.replace(/\[\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				} else if (accumulator[key] === undefined) {
					accumulator[key] = [value];
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};

		default:
			return function (key, value, accumulator) {
				if (accumulator[key] === undefined) {
					accumulator[key] = value;
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};
	}
}

function encode(value, opts) {
	if (opts.encode) {
		return opts.strict ? strictUriEncode(value) : encodeURIComponent(value);
	}

	return value;
}

function keysSorter(input) {
	if (Array.isArray(input)) {
		return input.sort();
	} else if (typeof input === 'object') {
		return keysSorter(Object.keys(input)).sort(function (a, b) {
			return Number(a) - Number(b);
		}).map(function (key) {
			return input[key];
		});
	}

	return input;
}

exports.extract = function (str) {
	var queryStart = str.indexOf('?');
	if (queryStart === -1) {
		return '';
	}
	return str.slice(queryStart + 1);
};

exports.parse = function (str, opts) {
	opts = objectAssign({arrayFormat: 'none'}, opts);

	var formatter = parserForArrayFormat(opts);

	// Create an object with no prototype
	// https://github.com/sindresorhus/query-string/issues/47
	var ret = Object.create(null);

	if (typeof str !== 'string') {
		return ret;
	}

	str = str.trim().replace(/^[?#&]/, '');

	if (!str) {
		return ret;
	}

	str.split('&').forEach(function (param) {
		var parts = param.replace(/\+/g, ' ').split('=');
		// Firefox (pre 40) decodes `%3D` to `=`
		// https://github.com/sindresorhus/query-string/pull/37
		var key = parts.shift();
		var val = parts.length > 0 ? parts.join('=') : undefined;

		// missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		val = val === undefined ? null : decodeComponent(val);

		formatter(decodeComponent(key), val, ret);
	});

	return Object.keys(ret).sort().reduce(function (result, key) {
		var val = ret[key];
		if (Boolean(val) && typeof val === 'object' && !Array.isArray(val)) {
			// Sort object keys, not values
			result[key] = keysSorter(val);
		} else {
			result[key] = val;
		}

		return result;
	}, Object.create(null));
};

exports.stringify = function (obj, opts) {
	var defaults = {
		encode: true,
		strict: true,
		arrayFormat: 'none'
	};

	opts = objectAssign(defaults, opts);

	if (opts.sort === false) {
		opts.sort = function () {};
	}

	var formatter = encoderForArrayFormat(opts);

	return obj ? Object.keys(obj).sort(opts.sort).map(function (key) {
		var val = obj[key];

		if (val === undefined) {
			return '';
		}

		if (val === null) {
			return encode(key, opts);
		}

		if (Array.isArray(val)) {
			var result = [];

			val.slice().forEach(function (val2) {
				if (val2 === undefined) {
					return;
				}

				result.push(formatter(key, val2, result.length));
			});

			return result.join('&');
		}

		return encode(key, opts) + '=' + encode(val, opts);
	}).filter(function (x) {
		return x.length > 0;
	}).join('&') : '';
};

exports.parseUrl = function (str, opts) {
	return {
		url: str.split('?')[0] || '',
		query: this.parse(this.extract(str), opts)
	};
};

},{"decode-uri-component":3,"object-assign":6,"strict-uri-encode":8}],8:[function(require,module,exports){
'use strict';
module.exports = function (str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
		return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	});
};

},{}],9:[function(require,module,exports){
'use strict';

require('./style.css');

var _require = require('query-string'),
    parse = _require.parse;

var utils = require('./utils');
var langs = require('./languages');

var state = {
  lang: 'zh_tw',
  falling: [],
  maxLives: 5,
  lives: 0,
  score: 0,
  gameOver: false,
  started: false,
  pause: false,
  lastTime: 0,
  dom: {
    scene: document.querySelector('.scene'),
    score: document.querySelector('.score_value'),
    lives: document.querySelector('.lives'),
    info: document.querySelector('.info'),
    error: document.querySelector('.error')
  },
  audio: {
    correct: 'public/mp3/correct.mp3',
    wrong: 'public/mp3/wrong.mp3',
    gameover: 'public/mp3/gameover.mp3'
  }
};

state.lang = parse(location.search).lang || state.lang;

document.body.appendChild(utils.renderKeyboard(utils.layouts[state.lang]));

var getRandom = function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var playSound = function playSound(file) {
  new Audio(file).play();
};

var setInfo = function setInfo(value) {
  state.pause = !!value;
  state.dom.info.innerHTML = value;
  state.dom.info.style.display = state.pause ? 'flex' : 'none';
};

var updateScore = function updateScore(value) {
  state.dom.score.textContent = value;
  state.score = value;
};

var updateLives = function updateLives(value) {
  if (value < 0) {
    state.gameOver = true;
    playSound(state.audio.gameover);
    return setInfo('Game Over');
  }

  state.dom.lives.innerHTML = '';
  for (var i = 0; i < state.maxLives; i++) {
    var heart = document.createElement('div');
    heart.classList.add('heart');
    if (i >= value) {
      heart.classList.add('empty');
    }
    state.dom.lives.appendChild(heart);
  }
  state.lives = value;
};

var showError = function showError(key) {
  state.dom.error.textContent = key;
  state.dom.error.style.opacity = '.9';
  setTimeout(function () {
    state.dom.error.style.opacity = '0';
  }, 200);
};

var spawn = function spawn(text) {
  var element = document.createElement('div');
  element.appendChild(document.createTextNode(text));
  element.className = 'entity';
  var x = getRandom(20, window.innerWidth - 40);
  element.style.left = x + 'px';
  state.dom.scene.appendChild(element);
  state.falling.push({ text: text, element: element, y: 0 });
};

var update = function update(time) {
  if (state.pause || state.gameOver) return;

  for (var i in state.falling) {
    state.falling[i].y += 1;
    state.falling[i].element.style.top = state.falling[i].y + 'px';

    if (state.falling[i].y > window.innerHeight) {
      state.dom.scene.removeChild(state.falling[i].element);
      state.falling.splice(i, 1);
      updateLives(state.lives - 1);
    }
  }

  if (time > state.lastTime + 1000) {
    var l = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = langs[state.lang].modes[2].sets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var set = _step.value;

        l = l.concat(langs[state.lang].sets[set]);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    var _i = getRandom(0, l.length - 1);
    spawn(l[_i]);
    state.lastTime = time;
  }

  requestAnimationFrame(update);
};

var start = function start() {
  state.dom.info.style.display = 'none';
  state.started = true;
  requestAnimationFrame(update);
};

var restart = function restart() {
  updateLives(state.maxLives);
  updateScore(0);
  state.falling = [];
  state.dom.scene.innerHTML = '';
  state.gameOver = false;
  state.pause = false;
  start();
};

updateLives(state.maxLives);

document.addEventListener('keydown', function (ev) {
  if (!state.started && ev.key === ' ') return start();
  if (state.gameOver && ev.key === ' ') return restart();
  if (!state.started || state.gameOver) return;

  if (ev.key === 'Escape' || ev.key === ' ') {
    if (state.pause) {
      setInfo(false);
      requestAnimationFrame(update);
    } else {
      setInfo('Press space or escape to continue');
    }
    return;
  }

  if (state.pause) return;

  var key = utils.mapKeyEvent[state.lang](ev);
  if (!key) return;
  console.log(key);

  for (var i = 0; i < state.falling.length; i++) {
    if (state.falling[i].text === key) {
      state.dom.scene.removeChild(state.falling[i].element);
      state.falling.splice(i, 1);
      updateScore(state.score + 1);
      playSound(state.audio.correct);
      return;
    }
  }

  updateLives(state.lives - 1);
  showError(key);
  playSound(state.audio.wrong);
});

},{"./languages":14,"./style.css":26,"./utils":27,"query-string":7}],10:[function(require,module,exports){
module.exports={
	"sets": {
		"consonants": [
			"B",
			"C",
			"D",
			"F",
			"G",
			"H",
			"J",
			"K",
			"L",
			"M",
			"N",
			"P",
			"Q",
			"R",
			"S",
			"ß",
			"T",
			"V",
			"W",
			"X",
			"Y",
			"Z"
		],
		"vowels": [
			"A",
			"E",
			"I",
			"O",
			"U",
			"Y",
			"Ä",
			"Ö",
			"Ü"
		]
	},
	"modes": [
		{
			"label": "Consonants Only",
			"sets": [
				"consonants"
			]
		},
		{
			"label": "Vowels Only",
			"sets": [
				"vowels"
			]
		},
		{
			"label": "All letters",
			"sets": [
				"consonants",
				"vowels"
			]
		}
	]
}

},{}],11:[function(require,module,exports){
module.exports={
	"sets": {
		"consonants": [
			"B",
			"C",
			"D",
			"F",
			"G",
			"H",
			"J",
			"K",
			"L",
			"M",
			"N",
			"P",
			"Q",
			"R",
			"S",
			"T",
			"V",
			"W",
			"X",
			"Z"
		],
		"vowels": [
			"A",
			"E",
			"I",
			"O",
			"U",
			"Y"
		]
	},
	"modes": [
		{
			"label": "Consonants Only",
			"sets": [
				"consonants"
			]
		},
		{
			"label": "Vowels Only",
			"sets": [
				"vowels"
			]
		},
		{
			"label": "All letters",
			"sets": [
				"consonants",
				"vowels"
			]
		}
	]
}

},{}],12:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11}],13:[function(require,module,exports){
module.exports={
	"sets": {
		"consonants": [
			"B",
			"C",
			"D",
			"F",
			"G",
			"H",
			"J",
			"K",
			"L",
			"M",
			"N",
			"Ñ",
			"P",
			"Q",
			"R",
			"S",
			"T",
			"V",
			"W",
			"X",
			"Z"
		],
		"vowels": [
			"A",
			"E",
			"I",
			"O",
			"U",
			"Y"
		]
	},
	"modes": [
		{
			"label": "Consonants Only",
			"sets": [
				"consonants"
			]
		},
		{
			"label": "Vowels Only",
			"sets": [
				"vowels"
			]
		},
		{
			"label": "All letters",
			"sets": [
				"consonants",
				"vowels"
			]
		}
	]
}

},{}],14:[function(require,module,exports){
'use strict';

module.exports = {
  de_de: require('./de-de'),
  en_gb: require('./en-gb'),
  en_us: require('./en-us'),
  es_es: require('./es-es'),
  // jp:    require('./jp'   ),
  ko: require('./ko'),
  // ru:    require('./ru'   ),
  zh_tw: require('./zh-tw')
};

},{"./de-de":10,"./en-gb":11,"./en-us":12,"./es-es":13,"./ko":15,"./zh-tw":16}],15:[function(require,module,exports){
module.exports={
	"sets": {
		"consonants": [
			"ㅂ",
			"ㅃ",
			"ㅈ",
			"ㅉ",
			"ㄷ",
			"ㄸ",
			"ㄱ",
			"ㄲ",
			"ㅅ",
			"ㅆ",
			"ㅁ",
			"ㄴ",
			"ㅇ",
			"ㄹ",
			"ㅎ",
			"ㅋ",
			"ㅌ",
			"ㅊ",
			"ㅍ"
		],
		"vowels": [
			"ㅛ",
			"ㅕ",
			"ㅑ",
			"ㅐ",
			"ㅒ",
			"ㅔ",
			"ㅖ",
			"ㅗ",
			"ㅓ",
			"ㅏ",
			"ㅣ",
			"ㅠ",
			"ㅜ",
			"ㅡ"
		]
	},
	"modes": [
		{
			"label": "Consonants Only",
			"sets": [
				"consonants"
			]
		},
		{
			"label": "Vowels Only",
			"sets": [
				"vowels"
			]
		},
		{
			"label": "All letters",
			"sets": [
				"consonants",
				"vowels"
			]
		}
	]
}

},{}],16:[function(require,module,exports){
module.exports={
	"sets": {
		"initials": [
			"ㄅ",
			"ㄉ",
			"ㄓ",
			"ㄇ",
			"ㄋ",
			"ㄎ",
			"ㄑ",
			"ㄕ",
			"ㄘ",
			"ㄈ",
			"ㄌ",
			"ㄏ",
			"ㄒ",
			"ㄖ",
			"ㄙ"
		],
		"finals": [
			"ㄚ",
			"ㄞ",
			"ㄢ",
			"ㄦ",
			"ㄧ",
			"ㄛ",
			"ㄟ",
			"ㄣ",
			"ㄨ",
			"ㄜ",
			"ㄠ",
			"ㄤ",
			"ㄩ",
			"ㄝ",
			"ㄡ",
			"ㄥ"
		]
	},
	"modes": [
		{
			"label": "Initials Only",
			"sets": [
				"initials"
			]
		},
		{
			"label": "Finals Only",
			"sets": [
				"finals"
			]
		},
		{
			"label": "All letters",
			"sets": [
				"initials",
				"finals"
			]
		}
	]
}

},{}],17:[function(require,module,exports){
module.exports={
  "Backquote": {
    "default": "<",
    "shift": ">"
  },
  "Digit2": {
    "default": "2",
    "shift": "\""
  },
  "Digit3": {
    "default": "3",
    "shift": "§"
  },
  "Digit6": {
    "default": "6",
    "shift": "&"
  },
  "Digit7": {
    "default": "7",
    "shift": "/"
  },
  "Digit8": {
    "default": "8",
    "shift": "("
  },
  "Digit9": {
    "default": "9",
    "shift": ")"
  },
  "Digit0": {
    "default": "0",
    "shift": "="
  },
  "Minus": {
    "default": "ß",
    "shift": "?"
  },
  "Equal": {
    "default": "´",
    "shift": "`"
  },
  "KeyY": "z",
  "BracketLeft": "ü",
  "BracketRight": {
    "default": "+",
    "shift": "*"
  },
  "KeyZ": "y",
  "Semicolon": "ö",
  "Quote": "ä",
  "Comma": {
    "default": ",",
    "shift": ";"
  },
  "Period": {
    "default": ".",
    "shift": ":"
  },
  "Slash": {
    "default": "-",
    "shift": "_"
  }
}

},{}],18:[function(require,module,exports){
module.exports={
  "Backquote": {
    "default": "`",
    "shift": "~"
  },
  "Digit1": {
    "default": "1",
    "shift": "!"
  },
  "Digit2": {
    "default": "2",
    "shift": "@"
  },
  "Digit3": {
    "default": "3",
    "shift": "#"
  },
  "Digit4": {
    "default": "4",
    "shift": "$"
  },
  "Digit5": {
    "default": "5",
    "shift": "%"
  },
  "Digit6": {
    "default": "6",
    "shift": "^"
  },
  "Digit7": {
    "default": "7",
    "shift": "&"
  },
  "Digit8": {
    "default": "8",
    "shift": "*"
  },
  "Digit9": {
    "default": "9",
    "shift": "("
  },
  "Digit0": {
    "default": "0",
    "shift": ")"
  },
  "Minus": {
    "default": "-",
    "shift": "_"
  },
  "Equal": {
    "default": "=",
    "shift": "+"
  },
  "KeyQ": "q",
  "KeyW": "w",
  "KeyE": "e",
  "KeyR": "r",
  "KeyT": "t",
  "KeyY": "y",
  "KeyU": "u",
  "KeyI": "i",
  "KeyO": "o",
  "KeyP": "p",
  "BracketLeft": {
    "default": "[",
    "shift": "{"
  },
  "BracketRight": {
    "default": "]",
    "shift": "}"
  },
  "Backslash": {
    "default": "\\",
    "shift": "|"
  },
  "KeyA": "p",
  "KeyS": "s",
  "KeyD": "d",
  "KeyF": "f",
  "KeyG": "g",
  "KeyH": "h",
  "KeyJ": "j",
  "KeyK": "k",
  "KeyL": "l",
  "Semicolon": {
    "default": ";",
    "shift": ":"
  },
  "Quote": {
    "default": "'",
    "shift": "\""
  },
  "KeyZ": "z",
  "KeyX": "x",
  "KeyC": "c",
  "KeyV": "v",
  "KeyB": "b",
  "KeyN": "n",
  "KeyM": "m",
  "Comma": {
    "default": ",",
    "shift": "<"
  },
  "Period": {
    "default": ".",
    "shift": ">"
  },
  "Slash": {
    "default": "/",
    "shift": "?"
  }
}

},{}],19:[function(require,module,exports){
module.exports={
  "Backquote": {
    "default": "`",
    "shift": "~"
  },
  "Digit1": {
    "default": "1",
    "shift": "!"
  },
  "Digit2": {
    "default": "2",
    "shift": "@"
  },
  "Digit3": {
    "default": "3",
    "shift": "#"
  },
  "Digit4": {
    "default": "4",
    "shift": "$"
  },
  "Digit5": {
    "default": "5",
    "shift": "%"
  },
  "Digit6": {
    "default": "6",
    "shift": "^"
  },
  "Digit7": {
    "default": "7",
    "shift": "&"
  },
  "Digit8": {
    "default": "8",
    "shift": "*"
  },
  "Digit9": {
    "default": "9",
    "shift": "("
  },
  "Digit0": {
    "default": "0",
    "shift": ")"
  },
  "Minus": {
    "default": "-",
    "shift": "_"
  },
  "Equal": {
    "default": "=",
    "shift": "+"
  },
  "KeyQ": "q",
  "KeyW": "w",
  "KeyE": "e",
  "KeyR": "r",
  "KeyT": "t",
  "KeyY": "y",
  "KeyU": "u",
  "KeyI": "i",
  "KeyO": "o",
  "KeyP": "p",
  "BracketLeft": {
    "default": "[",
    "shift": "{"
  },
  "BracketRight": {
    "default": "]",
    "shift": "}"
  },
  "Backslash": {
    "default": "\\",
    "shift": "|"
  },
  "KeyA": "a",
  "KeyS": "s",
  "KeyD": "d",
  "KeyF": "f",
  "KeyG": "g",
  "KeyH": "h",
  "KeyJ": "j",
  "KeyK": "k",
  "KeyL": "l",
  "Semicolon": {
    "default": ";",
    "shift": ":"
  },
  "Quote": {
    "default": "'",
    "shift": "\""
  },
  "KeyZ": "z",
  "KeyX": "x",
  "KeyC": "c",
  "KeyV": "v",
  "KeyB": "b",
  "KeyN": "n",
  "KeyM": "m",
  "Comma": {
    "default": ",",
    "shift": "<"
  },
  "Period": {
    "default": ".",
    "shift": ">"
  },
  "Slash": {
    "default": "/",
    "shift": "?"
  }
}

},{}],20:[function(require,module,exports){
module.exports={
  "Backquote": {
    "default": "<",
    "shift": ">"
  },
  "Digit1": {
    "default": "1",
    "shift": "¡"
  },
  "Digit2": {
    "default": "2",
    "shift": "!"
  },
  "Digit6": {
    "default": "6",
    "shift": "/"
  },
  "BracketLeft": {
    "default": "´",
    "shift": "º"
  },
  "BracketRight": {
    "default": "`",
    "shift": "¨"
  },
  "Backslash": {
    "default": "'",
    "shift": "\""
  },
  "Semicolon": "ñ",
  "Quote": {
    "default": ";",
    "shift": ":"
  },
  "Comma": {
    "default": ",",
    "shift": "¿"
  },
  "Period": {
    "default": ".",
    "shift": "?"
  },
  "Slash": "ç"
}

},{}],21:[function(require,module,exports){
'use strict';

var en_us = require('./en-us');

module.exports = {
  en_us: en_us,
  de_de: Object.assign({}, en_us, require('./de-de')),
  en_gb: Object.assign({}, en_us, require('./en-gb')),
  es_es: Object.assign({}, en_us, require('./es-es')),
  jp: Object.assign({}, en_us, require('./jp')),
  ko: Object.assign({}, en_us, require('./ko')),
  ru: Object.assign({}, en_us, require('./ru')),
  zh_tw: Object.assign({}, en_us, require('./zh-tw'))
};

},{"./de-de":17,"./en-gb":18,"./en-us":19,"./es-es":20,"./jp":22,"./ko":23,"./ru":24,"./zh-tw":25}],22:[function(require,module,exports){
module.exports={
  "Backquote": {
    "default": "₩",
    "shift": "~"
  },
  "KeyQ": {
    "default": "ㅂ",
    "shift": "ㅃ"
  },
  "KeyW": {
    "default": "ㅈ",
    "shift": "ㅉ"
  },
  "KeyE": {
    "default": "ㄷ",
    "shift": "ㄸ"
  },
  "KeyR": {
    "default": "ㄱ",
    "shift": "ㄲ"
  },
  "KeyT": {
    "default": "ㅅ",
    "shift": "ㅆ"
  },
  "KeyY": "ㅛ",
  "KeyU": "ㅕ",
  "KeyI": "ㅑ",
  "KeyO": {
    "default": "ㅐ",
    "shift": "ㅒ"
  },
  "KeyP": {
    "default": "ㅔ",
    "shift": "ㅖ"
  },
  "KeyA": "ㅁ",
  "KeyS": "ㄴ",
  "KeyD": "ㅇ",
  "KeyF": "ㄹ",
  "KeyG": "ㅎ",
  "KeyH": "ㅗ",
  "KeyJ": "ㅓ",
  "KeyK": "ㅏ",
  "KeyL": "ㅣ",
  "KeyZ": "ㅋ",
  "KeyX": "ㅌ",
  "KeyC": "ㅊ",
  "KeyV": "ㅍ",
  "KeyB": "ㅠ",
  "KeyN": "ㅜ",
  "KeyM": "ㅡ"
}

},{}],23:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"dup":22}],24:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"dup":22}],25:[function(require,module,exports){
module.exports={
  "Backquote": {
    "default": "·",
    "shift": "～"
  },
  "Digit1": {
    "default": "ㄅ",
    "shift": "！"
  },
  "Digit2": {
    "default": "ㄉ",
    "shift": "＠"
  },
  "Digit3": {
    "default": "ˇ",
    "shift": "＃"
  },
  "Digit4": {
    "default": "ˋ",
    "shift": "＄"
  },
  "Digit5": {
    "default": "ㄓ",
    "shift": "％"
  },
  "Digit6": {
    "default": "ˊ",
    "shift": "＾"
  },
  "Digit7": {
    "default": "˙",
    "shift": "＆"
  },
  "Digit8": {
    "default": "ㄚ",
    "shift": "＊"
  },
  "Digit9": {
    "default": "ㄞ",
    "shift": "（"
  },
  "Digit0": {
    "default": "ㄢ",
    "shift": "）"
  },
  "Minus": {
    "default": "ㄦ",
    "shift": "＿"
  },
  "KeyQ": {
    "default": "ㄆ",
    "shift": "Ｑ"
  },
  "KeyW": {
    "default": "ㄊ",
    "shift": "Ｗ"
  },
  "KeyE": {
    "default": "ㄍ",
    "shift": "Ｅ"
  },
  "KeyR": {
    "default": "ㄐ",
    "shift": "Ｒ"
  },
  "KeyT": {
    "default": "ㄔ",
    "shift": "Ｔ"
  },
  "KeyY": {
    "default": "ㄗ",
    "shift": "Ｙ"
  },
  "KeyU": {
    "default": "ㄧ",
    "shift": "Ｕ"
  },
  "KeyI": {
    "default": "ㄛ",
    "shift": "Ｉ"
  },
  "KeyO": {
    "default": "ㄟ",
    "shift": "Ｏ"
  },
  "KeyP": {
    "default": "ㄣ",
    "shift": "Ｐ"
  },
  "BracketLeft": {
    "default": "「",
    "shift": "『"
  },
  "BracketRight": {
    "default": "」",
    "shift": "』"
  },
  "KeyA": {
    "default": "ㄇ",
    "shift": "Ａ"
  },
  "KeyS": {
    "default": "ㄋ",
    "shift": "Ｓ"
  },
  "KeyD": {
    "default": "ㄎ",
    "shift": "Ｄ"
  },
  "KeyF": {
    "default": "ㄑ",
    "shift": "Ｆ"
  },
  "KeyG": {
    "default": "ㄕ",
    "shift": "Ｇ"
  },
  "KeyH": {
    "default": "ㄘ",
    "shift": "Ｈ"
  },
  "KeyJ": {
    "default": "ㄨ",
    "shift": "Ｊ"
  },
  "KeyK": {
    "default": "ㄜ",
    "shift": "Ｋ"
  },
  "KeyL": {
    "default": "ㄠ",
    "shift": "Ｌ"
  },
  "Semicolon": {
    "default": "ㄤ",
    "shift": "："
  },
  "Quote": {
    "default": "‘",
    "shift": "“"
  },
  "KeyZ": {
    "default": "ㄈ",
    "shift": "Ｚ"
  },
  "KeyX": {
    "default": "ㄌ",
    "shift": "Ｘ"
  },
  "KeyC": {
    "default": "ㄏ",
    "shift": "Ｃ"
  },
  "KeyV": {
    "default": "ㄒ",
    "shift": "Ｖ"
  },
  "KeyB": {
    "default": "ㄖ",
    "shift": "Ｂ"
  },
  "KeyN": {
    "default": "ㄙ",
    "shift": "Ｎ"
  },
  "KeyM": {
    "default": "ㄩ",
    "shift": "Ｍ"
  },
  "Comma": {
    "default": "ㄝ",
    "shift": "，"
  },
  "Period": {
    "default": "ㄡ",
    "shift": "。"
  },
  "Slash": {
    "default": "ㄥ",
    "shift": "？"
  }
}

},{}],26:[function(require,module,exports){

},{}],27:[function(require,module,exports){
'use strict';

var _templateObject = _taggedTemplateLiteral(['\n    <div class="keyboard">\n      <div class="row">\n        <div class="key Backquote">', '</div>\n        <div class="key Digit1">', '</div>\n        <div class="key Digit2">', '</div>\n        <div class="key Digit3">', '</div>\n        <div class="key Digit4">', '</div>\n        <div class="key Digit5">', '</div>\n        <div class="key Digit6">', '</div>\n        <div class="key Digit7">', '</div>\n        <div class="key Digit8">', '</div>\n        <div class="key Digit9">', '</div>\n        <div class="key Digit0">', '</div>\n        <div class="key Minus">', '</div>\n        <div class="key Equal">', '</div>\n        <div class="key Backspace">\u2421</div>\n      </div>\n      <div class="row">\n        <div class="key Tab">\u21B9</div>\n        <div class="key KeyQ">', '</div>\n        <div class="key KeyW">', '</div>\n        <div class="key KeyE">', '</div>\n        <div class="key KeyR">', '</div>\n        <div class="key KeyT">', '</div>\n        <div class="key KeyY">', '</div>\n        <div class="key KeyU">', '</div>\n        <div class="key KeyI">', '</div>\n        <div class="key KeyO">', '</div>\n        <div class="key KeyP">', '</div>\n        <div class="key BracketLeft">', '</div>\n        <div class="key BracketRight">', '</div>\n        <div class="key Backslash">', '</div>\n      </div>\n      <div class="row">\n        <div class="key CapsLock">\u21EA</div>\n        <div class="key KeyA">', '</div>\n        <div class="key KeyS">', '</div>\n        <div class="key KeyD">', '</div>\n        <div class="key KeyF">', '</div>\n        <div class="key KeyG">', '</div>\n        <div class="key KeyH">', '</div>\n        <div class="key KeyJ">', '</div>\n        <div class="key KeyK">', '</div>\n        <div class="key KeyL">', '</div>\n        <div class="key Semicolon">', '</div>\n        <div class="key Quote">', '</div>\n        <div class="key Enter">\u23CE</div>\n      </div>\n      <div class="row">\n        <div class="key Shift">\u21E7</div>\n        <div class="key KeyZ">', '</div>\n        <div class="key KeyX">', '</div>\n        <div class="key KeyC">', '</div>\n        <div class="key KeyV">', '</div>\n        <div class="key KeyB">', '</div>\n        <div class="key KeyN">', '</div>\n        <div class="key KeyM">', '</div>\n        <div class="key Comma">', '</div>\n        <div class="key Period">', '</div>\n        <div class="key Slash">', '</div>\n        <div class="key Shift">\u21E7</div>\n      </div>\n    </div>\n  '], ['\n    <div class="keyboard">\n      <div class="row">\n        <div class="key Backquote">', '</div>\n        <div class="key Digit1">', '</div>\n        <div class="key Digit2">', '</div>\n        <div class="key Digit3">', '</div>\n        <div class="key Digit4">', '</div>\n        <div class="key Digit5">', '</div>\n        <div class="key Digit6">', '</div>\n        <div class="key Digit7">', '</div>\n        <div class="key Digit8">', '</div>\n        <div class="key Digit9">', '</div>\n        <div class="key Digit0">', '</div>\n        <div class="key Minus">', '</div>\n        <div class="key Equal">', '</div>\n        <div class="key Backspace">\u2421</div>\n      </div>\n      <div class="row">\n        <div class="key Tab">\u21B9</div>\n        <div class="key KeyQ">', '</div>\n        <div class="key KeyW">', '</div>\n        <div class="key KeyE">', '</div>\n        <div class="key KeyR">', '</div>\n        <div class="key KeyT">', '</div>\n        <div class="key KeyY">', '</div>\n        <div class="key KeyU">', '</div>\n        <div class="key KeyI">', '</div>\n        <div class="key KeyO">', '</div>\n        <div class="key KeyP">', '</div>\n        <div class="key BracketLeft">', '</div>\n        <div class="key BracketRight">', '</div>\n        <div class="key Backslash">', '</div>\n      </div>\n      <div class="row">\n        <div class="key CapsLock">\u21EA</div>\n        <div class="key KeyA">', '</div>\n        <div class="key KeyS">', '</div>\n        <div class="key KeyD">', '</div>\n        <div class="key KeyF">', '</div>\n        <div class="key KeyG">', '</div>\n        <div class="key KeyH">', '</div>\n        <div class="key KeyJ">', '</div>\n        <div class="key KeyK">', '</div>\n        <div class="key KeyL">', '</div>\n        <div class="key Semicolon">', '</div>\n        <div class="key Quote">', '</div>\n        <div class="key Enter">\u23CE</div>\n      </div>\n      <div class="row">\n        <div class="key Shift">\u21E7</div>\n        <div class="key KeyZ">', '</div>\n        <div class="key KeyX">', '</div>\n        <div class="key KeyC">', '</div>\n        <div class="key KeyV">', '</div>\n        <div class="key KeyB">', '</div>\n        <div class="key KeyN">', '</div>\n        <div class="key KeyM">', '</div>\n        <div class="key Comma">', '</div>\n        <div class="key Period">', '</div>\n        <div class="key Slash">', '</div>\n        <div class="key Shift">\u21E7</div>\n      </div>\n    </div>\n  ']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var bel = require('bel');
var layouts = require('./layouts');

var mapKeyCode = function mapKeyCode(layout) {
  return function (code, shift) {
    if (layout[code]) {
      if (typeof layout[code] === 'string') {
        return layout[code].toUpperCase();
      }
      return shift ? layout[code].shift : layout[code].default;
    }
    return '';
  };
};

var mapKeyEvent = function mapKeyEvent(layout) {
  return function (ev) {
    if (ev.code === 'Quote' || ev.code === 'Slash') ev.preventDefault(); // Firefox Quicks find
    return mapKeyCode(layout)(ev.code, ev.shiftKey);
  };
};

for (var key in layouts) {
  mapKeyEvent[key] = mapKeyEvent(layouts[key]);
}

var renderKeyboard = function renderKeyboard(layout) {
  var map = mapKeyCode(layout);
  return bel(_templateObject, map('Backquote'), map('Digit1'), map('Digit2'), map('Digit3'), map('Digit4'), map('Digit5'), map('Digit6'), map('Digit7'), map('Digit8'), map('Digit9'), map('Digit0'), map('Minus'), map('Equal'), map('KeyQ'), map('KeyW'), map('KeyE'), map('KeyR'), map('KeyT'), map('KeyY'), map('KeyU'), map('KeyI'), map('KeyO'), map('KeyP'), map('BracketLeft'), map('BracketRight'), map('Backslash'), map('KeyA'), map('KeyS'), map('KeyD'), map('KeyF'), map('KeyG'), map('KeyH'), map('KeyJ'), map('KeyK'), map('KeyL'), map('Semicolon'), map('Quote'), map('KeyZ'), map('KeyX'), map('KeyC'), map('KeyV'), map('KeyB'), map('KeyN'), map('KeyM'), map('Comma'), map('Period'), map('Slash'));
};

module.exports = { mapKeyCode: mapKeyCode, mapKeyEvent: mapKeyEvent, layouts: layouts, renderKeyboard: renderKeyboard };

},{"./layouts":21,"bel":2}]},{},[9]);
