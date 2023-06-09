(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":2}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
const home_page = require('../src/node_modules/home_page')
const growth_page = require('../src/node_modules/growth_page')
const timeline_page = require('../src/node_modules/timeline_page')
const projects_page = require('../src/node_modules/projects_page')
const consortium_page = require('../src/node_modules/consortium_page')


const navbar = require('../src/node_modules/navbar/index')
const light_theme = require('../src/node_modules/theme/light_theme/index')
const dark_theme = require('../src/node_modules/theme/dark_theme/index')

// Default Theme
let current_theme = light_theme
const sheet = new CSSStyleSheet()

//Default Page
let current_page = consortium_page({data: current_theme})
let notify
const PROTOCOL = {
    'active_page': 'HOME',
    'handle_page_change': handle_page_change,
    'handle_theme_change': handle_theme_change,
}


const page_list = {
    'HOME': home_page({data: current_theme}),
    'PROJECTS': projects_page({data: current_theme}),
    'GROWTH PROGRAM': growth_page({data: current_theme}),
    'TIMELINE': timeline_page({data: current_theme}),
    'DEFAULT': consortium_page({data: current_theme})
}

const theme_list = {
    'DARK': dark_theme,
    'LIGHT': light_theme
}

document.body.append( navbar({data: current_theme}, page_protocol))
document.body.append(current_page)
handle_page_change('DEFAULT')

// Adding font link
document.head.innerHTML = ` 
    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap" ></link> 
    <style>${get_theme(current_theme)}</style>
`
document.adoptedStyleSheets = [sheet]


function handle_page_change(active_page){
    PROTOCOL.active_page = active_page;
    document.body.removeChild(current_page)
    current_page = page_list[active_page]
    document.body.append(current_page)
    const message = {
        head: ['root', 'navbar', 'navbar'],
        type: 'theme',
        data: active_page,
    }
    notify(message)
}

function handle_theme_change(){
    ;current_theme = current_theme === light_theme ? dark_theme : light_theme
    sheet.replaceSync( get_theme(current_theme) )
}

function page_protocol (handshake, send, mid = 0) {
    notify = send

    if (send) return listen
    
    function listen (message) {        
        const { head, type, data } = message
        const {by, to, id} = head
        // if (to !== id) return console.error('address unknown', message)
        const action = PROTOCOL[type] || invalid
        action(data)
    }
    // function invalid (message) { console.error('invalid type', message) }
    // async function change_theme () {
    //     // const [to] = head
    //     ;current_theme = current_theme === light_theme ? dark_theme : light_theme
    //     sheet.replaceSync( get_theme(current_theme) )
    //     return send({
    //         // head: [id, to, mid++],
    //         // refs: { cause: head },
    //         // type: 'theme',
    //         from: 'page updated',
    //         data: current_theme
    //     })
    // }
}

function get_theme(opts) {
    return`
        :root{ 
            --bg_color: ${opts.bg_color};
            --ac-1: ${opts.ac_1};
            --ac-2: ${opts.ac_2};
            --ac-3: ${opts.ac_3};
            --primary_color: ${opts.primary_color};
            font-family: Silkscreen;
        }
        html, body{
            padding:0px;
            margin: 0px;
        }
        svg{
            fill: var(--bg_color);
        }
    `
}
},{"../src/node_modules/consortium_page":17,"../src/node_modules/growth_page":18,"../src/node_modules/home_page":19,"../src/node_modules/navbar/index":20,"../src/node_modules/projects_page":23,"../src/node_modules/theme/dark_theme/index":26,"../src/node_modules/theme/light_theme/index":27,"../src/node_modules/timeline_page":29}],4:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = app_about_us


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const window_bar = require('window_bar')
const sm_text_button = require('buttons/sm_text_button')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function app_about_us (opts) {

    const {data} = opts

    // Assigning all the icons
    const { img_src: { 
        about_us_cover = `${prefix}/about_us_cover.png`,
        img_robot_1 = `${prefix}/img_robot_1.svg`,
        icon_pdf_reader = `${prefix}/icon_pdf_reader.svg`,
    } } = data

    const el = document.createElement('div')
    const shadow = el.attachShadow ( { mode : 'closed' } )

    shadow.innerHTML = `
        <div class="about_us_wrapper">
            <div class="about_us_cover_image"></div>
            <div class="content_wrapper">
                <div class="title"> ABOUT US </div>
            </div>
        </div>
        <div class="about_us_desc">
            Dat ecosystem garden supports open source projects that strengthen P2P foundations, with a focus on builder tools, infrastructure, research, and community resources.
        </div>
        <style> ${get_theme} </style>
    `

    // Added background banner cover
    const about_us_cover_image = shadow.querySelector('.about_us_cover_image')
    banner_img = document.createElement('img')
    banner_img.src = about_us_cover
    about_us_cover_image.append(banner_img)

    // about_us_wrapper.style.backgroundImage = `url(${banner_cover})`
    const content_wrapper = shadow.querySelector('.content_wrapper')
    img_robot_1_img = document.createElement('img')
    img_robot_1_img.src = img_robot_1
    content_wrapper.prepend(img_robot_1_img)

    const cover_window = window_bar({
        name:'Learn_about_us.pdf', 
        src: icon_pdf_reader,
        action_buttons: ['IMPORTANT DOCUMENTS', 'TELL ME MORE'],
        data: data
    }, about_us_protocol)

    shadow.adoptedStyleSheets = [ sheet ]
    shadow.prepend(cover_window)
    return el

    // about us protocol
    function about_us_protocol(message, send){
        return listen
    }
    // Listening to toggle event 
    function listen (message) {
        const {head, refs, type, data, meta} = message  
        const PROTOCOL = {
            'toggle_active_state': toggle_active_state
        }
        const action = PROTOCOL[type] || invalid      
        action(message)
    }
    function invalid (message) { console.error('invalid type', message) }
    async function toggle_active_state (message) {
        const {head, refs, type, data, meta} = message
        const {active_state} = data
        ;( active_state === 'active')?el.style.display = 'none':''
    }
}




function get_theme(){
    return`
        *{
            box-sizing: border-box;
        }

        .about_us_wrapper{
            position:relative;
            height:max-content;
            width:100%;
            display:flex;
            flex-direction:column;
            justify-content: center;
            align-items: center;
            padding: 150px 0px;
            background-image: radial-gradient(var(--primary_color) 1px, var(--bg_color) 1px);
            background-size: 10px 10px;
            background-color:red;
            border: 1px solid var(--primary_color);
            box-sizing: border-box;
            container-type: inline-size;
        }

        /* This covers background-image will change to an image */
        .about_us_cover_image{
            position: absolute;
            width:100%;
            height:100%;
            overflow:hidden;
        }
        .about_us_cover_image img{
            position:absolute;
            left:50%;
            top:50%;
            width: auto;
            height: 80%;
            transform:translate(-50%, -50%);
        }

        .about_us_desc{
            width:100% !important;
            background-color:var(--bg_color);
            color: var(--primary_color);
            border:1px solid var(--primary_color);
            padding:10px;
            letter-spacing: -2px;
            line-height:18px;
            font-size:16px;
            margin-bottom:30px;
            box-sizing: border-box;
        }


        /* Cover image alignment */
        .content_wrapper{
            display: flex;
            justify-content:center;
            align-items:center;
            gap:20px;
            position: relative;
            z-index:1;
            color:var(--primary_color);
            text-align:center;
        }
        .content_wrapper img{
            width: 100px;
            height: auto;
        }
        .content_wrapper .title{
            font-size:40px;
        }


        @container(min-width: 856px) {
            .about_us_cover_image img{
                width: 100%;
                height: auto;
            }
        }

    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_about_us")
},{"_process":2,"buttons/sm_text_button":15,"path":1,"window_bar":30}],5:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = cover_app


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const window_bar = require('window_bar')
const sm_text_button = require('buttons/sm_text_button')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)


let id = 0


function cover_app (opts, protocol) {
    const name = `cover_app-${id++}`

    const {data} = opts
    // Assigning all the icons
    const {img_src} = data
    const {
        banner_cover = `${prefix}/banner_cover.svg`,
        tree_character = `${prefix}/tree_character.png`,
        icon_pdf_reader
    } = img_src

    const el = document.createElement('div')
    const shadow = el.attachShadow ( { mode : 'closed' } )

    shadow.innerHTML = `
        <div class="cover_wrapper">
        <div class="cover_content">
            <div class="cover_image">
                <img src="${banner_cover}" />
            </div>
            <div class="content_wrapper">
                <img src="${tree_character}" />
                WELCOME TO DAT ECOSYSTEM
            </div>
        </div>
        </div>
        <style> ${get_theme} </style>
    `


    const cover_window = window_bar({
        name:'Learn_about_us.pdf', 
        src: icon_pdf_reader,
        action_buttons: ['View more (20)', 'TELL ME MORE'],
        data: data
    }, cover_protocol)
    const cover_wrapper = shadow.querySelector('.cover_wrapper')
    cover_wrapper.prepend(cover_window)


    shadow.adoptedStyleSheets = [ sheet ]
    return el

    
    // cover protocol
    function cover_protocol(message, send){
        return listen
    }
    // Listening to toggle event 
    function listen (message) {
        const {head, refs, type, data, meta} = message  
        const PROTOCOL = {
            'toggle_active_state': toggle_active_state
        }
        const action = PROTOCOL[type] || invalid      
        action(message)
    }
    function invalid (message) { console.error('invalid type', message) }
    async function toggle_active_state (message) {
        const {head, refs, type, data, meta} = message
        const {active_state} = data
        ;( active_state === 'active')?cover_wrapper.style.display = 'none':''
    }

}




function get_theme(){
    return`
        *{
            box-sizing: border-box;
        }

        .app_cover{
            display:none;
        }

        .cover_content{
            position:relative;
            height:max-content;
            width:100%;
            display:flex;
            justify-content: center;
            align-items: center;
            padding: 150px 0px;
            background-image: radial-gradient(var(--primary_color) 1px, var(--bg_color) 1px);
            background-size: 10px 10px;
            background-color:var(--bg_color);
            border: 1px solid var(--primary_color);
            margin-bottom: 30px;
        }

        /* This covers background-image will change to an image */
        .cover_image{
            position: absolute;
            width:100%;
            height:100%;
            overflow:hidden;
        }
        .cover_image img{
            position:absolute;
            left:50%;
            top:50%;
            width: auto;
            height: 100%;
            transform:translate(-50%, -50%);
        }


        /* Cover image alignment */
        .content_wrapper{
            display: flex;
            flex-direction: column;
            align-items:center;
            gap:20px;
            position: relative;
            z-index:1;
            color:var(--primary_color);
            text-align:center;
        }
        .content_wrapper img{
            width: 300px;
            height: auto;
        }

    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_cover")
},{"_process":2,"buttons/sm_text_button":15,"path":1,"window_bar":30}],6:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = app_footer


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const window_bar = require('window_bar')
const sm_text_button = require('buttons/sm_text_button')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function app_footer (opts) {

    const {data} = opts

    // Assigning all the icons
    const { img_src: {
        icon_pdf_reader = `${prefix}/icon_pdf_reader.svg`,
        img_robot_2 = `${prefix}/img_robot_2.png`,
        pattern_img_1 = `${prefix}/pattern_img_1.png`,
    } } = data

    const el = document.createElement('div')
    const shadow = el.attachShadow ( { mode : 'closed' } )

    shadow.innerHTML = `
        <div class="main_wrapper">
            <div class="footer_wrapper">
                <div class="robot_img_2"></div>
                <div class="footer_info_wrapper">
                    <div class="title"> INTERESTED IN JOINING DAT ECOSYSTEM CHAT NETWORKING? </div>
                    <div class="desc"> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vitae porta aliquet sit amet ornare sagittis, ultricies sed. Viverra sit felis ullamcorper pharetra mattis amet, vel. </div>
                </div>
            </div>
            <div class="pattern_img"></div>
        </div>
        <style> ${get_theme} </style>
    `
    
    // Adding Robot Image
    const robot_image_wrapper = shadow.querySelector('.robot_img_2')
    const robot_image = document.createElement('img')
    robot_image.src = img_robot_2
    robot_image_wrapper.append(robot_image)

    // Adding Button
    const footer_info_wrapper = shadow.querySelector('.footer_info_wrapper')
    const join_programe = sm_text_button({text:'JOIN OUR GROWTH PROGRAME'})
    footer_info_wrapper.append(join_programe)

    // Adding Pattern Image
    const pattern_image_wrapper = shadow.querySelector('.pattern_img')
    const pattern_image = document.createElement('img')
    pattern_image.src = pattern_img_1
    pattern_image_wrapper.append(pattern_image)


    // Adding Footer Window
    const footer_window = window_bar({
        name:'FOOTER.pdf', 
        src: icon_pdf_reader,
        data:data,
    }, footer_protocol)

    shadow.adoptedStyleSheets = [ sheet ]
    shadow.prepend(footer_window)
    return el


    // footer protocol
    function footer_protocol(message, send){
        return listen
    }
    // Listening to toggle event 
    function listen (message) {
        const {head, refs, type, data, meta} = message  
        const PROTOCOL = {
            'toggle_active_state': toggle_active_state
        }
        const action = PROTOCOL[type] || invalid      
        action(message)
    }
    function invalid (message) { console.error('invalid type', message) }
    async function toggle_active_state (message) {
        const {head, refs, type, data, meta} = message
        const {active_state} = data
        ;( active_state === 'active')?el.style.display = 'none':''
    }

}


function get_theme(){
    return`
        *{ box-sizing: border-box; }

        .main_wrapper{
            position: relative;
            container-type: inline-size;
            background-color: var(--bg_color);
            border: 1px solid var(--primary_color);
            margin-bottom: 30px;
        }
        .footer_wrapper{
            display:flex;
            flex-direction:column-reverse;
            align-items:flex-start;
            padding: 20px;
            padding-bottom:0px !important;

        }

        .title{
            font-size: 40px;
            color:var(--primary_color);
            font-weight: 700;
            line-height: 36px;
            letter-spacing: -5px;
            margin-bottom: 10px;
        }
        .desc{
            font-size: 16px;
            color:var(--primary_color);
            line-height: 14px;
            letter-spacing: -2px;
            margin-bottom: 30px;
        }
        .footer_info_wrapper{
            margin-bottom:30px;
        }
        .robot_img_2 img{
            width:150px;
        }
        .pattern_img{
            display:none;
        }


        @container(min-width: 856px) {
            .footer_wrapper{
                gap:40px;
                flex-direction: row;
                align-items:flex-end;
                width:70%;
            }
            .pattern_img{
                display:block;
                position:absolute;
                top:0;
                right:0;
            }
            .pattern_img img{
                width: 300px;
                height: auto;
            }
        }

    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_footer")
},{"_process":2,"buttons/sm_text_button":15,"path":1,"window_bar":30}],7:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = app_projects

const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// Importing components
const project_card = require('project_card')
const window_bar = require('window_bar')
const project_filter = require('project_filter')
const scrollbar = require('scrollbar')



// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

function app_projects(opts, protocol){

    const {data} = opts
    const PROTOCOL = {

    }
     // Assigning all the icons
     const { img_src: {
        icon_discord = `${prefix}/icon_discord.png`,
        icon_twitter = `${prefix}/icon_twitter.png`,
        icon_github = `${prefix}/icon_github.png`,
        icon_folder = `${prefix}/icon_folder.svg`,
        project_logo_1 = `${prefix}/project_logo_1.png`,
    } } = data


    
    const el = document.createElement('div')
    const shadow = el.attachShadow( { mode: 'closed' } )
    shadow.innerHTML = `
        <div class="main_wrapper">
            <div class="filter_wrapper">
                <div class="project_wrapper"></div>
            </div>
        </div>
        <style> ${get_theme} </style>
    `

    // Adding applcation window bar
    const app_project_window = window_bar({
        name: 'OUR_PROJECTS',
        src: icon_folder,
        data: data,
    }, app_projects_protocol)

    // Adding project cards
    const project_wrapper = shadow.querySelector('.project_wrapper')
    const cardsData = [
        { 
            title: 'Official starting of the web course.',
            project_logo: project_logo_1,
            project: 'Agregore', 
            link: '/',
            socials: [icon_github, icon_twitter, icon_discord],
            desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
            tags: ['Hypercore', 'Hypercore', 'Hypercore'],
            data: data,
        },{
            title: 'Official starting of the web course.',
            project_logo: project_logo_1,
            project: 'Ogre', 
            link: '/',
            socials: [icon_github, icon_twitter, icon_discord],
            desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
            tags: ['Hypercore', 'Hypercore', 'Hypercore'],
            data: data,
        },{
            title: 'Official starting of the web course.',
            project_logo: project_logo_1,
            project: 'Gerger', 
            link: '/',
            socials: [icon_github, icon_twitter, icon_discord],
            desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
            tags: ['Hypercore', 'Hypercore', 'Hypercore'],
            data: data
        },{ 
            title: 'Official starting of the web course.',
            project_logo: project_logo_1,
            project: 'Agregored', 
            link: '/',
            socials: [icon_github, icon_twitter, icon_discord],
            desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
            tags: ['Hypercore', 'Hypercore', 'Hypercore'],
            data: data
        },{
            title: 'Official starting of the web course.',
            project_logo: project_logo_1,
            project: 'Ogred', 
            link: '/',
            socials: [icon_github, icon_twitter, icon_discord],
            desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
            tags: ['Hypercore', 'Hypercore', 'Hypercore'],
            data: data
        },{
            title: 'Official starting of the web course.',
            project_logo: project_logo_1,
            project: 'Ragregore', 
            link: '/',
            socials: [icon_github, icon_twitter, icon_discord],
            desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
            tags: ['Hypercore', 'Hypercore', 'Hypercore'],
            data: data
        },{
            title: 'Official starting of the web course.',
            project_logo: project_logo_1,
            project: 'Agregorey',
            link: '/',
            socials: [icon_github, icon_twitter, icon_discord],
            desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
            tags: ['Hypercore', 'Hypercore', 'Hypercore'],
            data: data
        },
    ]
    const project_cards = cardsData.map((card_data) => project_card(card_data))
    project_cards.forEach((card) => {
        project_wrapper.append(card)
    })

    
    const main_wrapper = shadow.querySelector('.main_wrapper')
    main_wrapper.append(scrollbar({data}, app_projects_protocol))

    const filter_wrapper = shadow.querySelector('.filter_wrapper')
    filter_wrapper.append(project_filter({data}, app_projects_protocol))
    shadow.adoptedStyleSheets = [ sheet ]
    shadow.prepend(app_project_window)
    return el



    //protocol
    function app_projects_protocol(handshake, send){
        if(handshake.from.includes('scrollbar')){
            project_wrapper.onscroll = send[0]
            PROTOCOL['handleScroll'] = send[0]
            PROTOCOL['getScrollInfo'] = send[1]
            return [listen, setScrollTop]
        }
        else if(handshake.from.includes('project_filter')){
            return listen
        }
        else if(handshake.from.includes('window_bar')){
            PROTOCOL['toggle_active_state'] = toggle_active_state
            return listen
        }
        function listen (message){
            const {head, type, data} = message
            const {by, to, mid} = head
            // if( to !== name) return console.error('address unknown', message)
            if(by.includes('scrollbar'))
            {
                message.data = {sh: project_wrapper.scrollHeight, ch: project_wrapper.clientHeight, st: project_wrapper.scrollTop}
                PROTOCOL.getScrollInfo(message)
            }
            else if(by.includes('project_filter')){
                PROTOCOL[type] = data
                setFilter()
            }
            else if(by.includes('window_bar')){
                PROTOCOL[type](message)
            }
        }
        
        async function setScrollTop(value){
            project_wrapper.scrollTop = value
        }
        async function setFilter(){
            if(PROTOCOL.search){
                project_wrapper.innerHTML = ''
                const cardfilter = cardsData.filter((card_data) => {return card_data.project.toLowerCase().match(PROTOCOL.search.toLowerCase())})
                const project_cards = cardfilter.map((card_data) => project_card(card_data))
                project_cards.forEach((card) => {
                    project_wrapper.append(card)
                })
            }
            else{
                const project_cards = cardsData.map((card_data) => project_card(card_data))
                project_cards.forEach((card) => {
                    project_wrapper.append(card)
                })
            }
            PROTOCOL['handleScroll']()
        }
        async function toggle_active_state (message) {
            const {head, refs, type, data, meta} = message
            const {active_state} = data
            ;( active_state === 'active')?el.style.display = 'none':''
        }
    }


}

function get_theme(){
    return`
        .main_wrapper{
            display: flex;
            container-type: inline-size;
            width:100%;
            height: 100%;
        }
        .filter_wrapper{
            width:100%;
            height: 100%;
        }
        *{
            box-sizing: border-box;
        }
        .project_wrapper{
            --s: 20px; /* control the size */
            --_g: var(--bg_color) /* first color */ 0 25%, #0000 0 50%;
            background:
                repeating-conic-gradient(at 66% 66%,var(--_g)),
                repeating-conic-gradient(at 33% 33%,var(--_g)),
                var(--primary_color);  /* second color */ 
            background-size: var(--s) var(--s);  
            border:1px solid var(--primary_color);
            width:100%;
            height: 400px;
            padding: 0px;
            display: grid;
            gap:20px;
            grid-template-columns: 12fr;
            box-sizing: border-box;
            overflow: scroll;
            scrollbar-width: none; /* For Firefox */
        }
        .project_wrapper::-webkit-scrollbar {
            display: none;
        }
        @container(min-width: 768px) {
            .project_wrapper{
                grid-template-columns: repeat(2, 6fr);
            }
        }

        @container(min-width: 1200px) {
            .project_wrapper{
                grid-template-columns: repeat(3, 4fr);
            }
        }

        /*---------- Mobile devices ----------*/
        @media (min-width: 480px) {
        }

        /*---------- iPads, Tablets ----------*/
        @media (min-width: 768px) {
        }

        /*---------- Mediuem screens, laptops ----------*/
        @media (min-width: 1024px) {}
    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_projects")
},{"_process":2,"path":1,"project_card":21,"project_filter":22,"scrollbar":24,"window_bar":30}],8:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = app_projects_mini


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const window_bar = require('window_bar')
const project_card = require('project_card')
const sm_text_button = require('buttons/sm_text_button')
const sm_icon_button = require('buttons/sm_icon_button')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function app_projects_mini (opts) {

    const {data} = opts

    // Assigning all the icons
    const { img_src: {
        icon_discord = `${prefix}/icon_discord.png`,
        icon_twitter = `${prefix}/icon_twitter.png`,
        icon_github = `${prefix}/icon_github.png`,
        icon_folder = `${prefix}/icon_folder.svg`,
        project_logo_1 = `${prefix}/project_logo_1.png`,
    } } = data

    const el = document.createElement('div')
    const shadow = el.attachShadow ( { mode : 'closed' } )

    shadow.innerHTML = `
        <div class="main_wrapper">
            <div class="project_wrapper">
            </div>
        </div>
        <style> ${get_theme} </style>
    `

    // Adding Applicatin window Bar
    const cover_window = window_bar({
        name:'OUR PROJECTS', 
        src: icon_folder,
        action_buttons: ['View more (12)'],
        data: data
    }, projects_mini_protocol)


    // Adding project cards
    const project_wrapper = shadow.querySelector('.project_wrapper')
    const cardsData = [
        { 
            title: 'Official starting of the web course.',
            project_logo: project_logo_1,
            data: data,
            project: 'Agregore', 
            link: '/',
            socials: [icon_github, icon_twitter, icon_discord],
            desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
            tags: ['Hypercore', 'Hypercore', 'Hypercore'],
        },{ 
            title: 'Official starting of the web course.',
            project_logo: project_logo_1,
            data: data,
            project: 'Agregore', 
            link: '/',
            socials: [icon_github, icon_twitter, icon_discord],
            desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
            tags: ['Hypercore', 'Hypercore', 'Hypercore'],
        },{ 
            title: 'Official starting of the web course.',
            project_logo: project_logo_1,
            data: data,
            project: 'Agregore', 
            link: '/',
            socials: [icon_github, icon_twitter, icon_discord],
            desc: 'Keep track of whānau whakapapa information, preserve and share cultural records and narratives, own and control whānau data and servers, and build a stronger sense of whānau, community and identity.', 
            tags: ['Hypercore', 'Hypercore', 'Hypercore'],
        },
    ]
    const project_cards = cardsData.map((card_data) => project_card(card_data))
    project_cards.forEach((card) => {
        project_wrapper.append(card)
    })

    shadow.adoptedStyleSheets = [ sheet ]
    shadow.prepend(cover_window)
    return el

    // projects mini protocol
    function projects_mini_protocol(message, send){
        return listen
    }
    // Listening to toggle event 
    function listen (message) {
        const {head, refs, type, data, meta} = message  
        const PROTOCOL = {
            'toggle_active_state': toggle_active_state
        }
        const action = PROTOCOL[type] || invalid      
        action(message)
    }
    function invalid (message) { console.error('invalid type', message) }
    async function toggle_active_state (message) {
        const {head, refs, type, data, meta} = message
        const {active_state} = data
        ;( active_state === 'active')?el.style.display = 'none':''
    }
}




function get_theme(){
    return`
        .main_wrapper{
            container-type: inline-size;
            width:100%;
            height: 100%;
        }
        *{
            box-sizing: border-box;
        }
        .project_wrapper{
            --s: 20px; /* control the size */
            --_g: var(--bg_color) /* first color */ 0 25%, #0000 0 50%;
            background:
                repeating-conic-gradient(at 66% 66%,var(--_g)),
                repeating-conic-gradient(at 33% 33%,var(--_g)),
                var(--primary_color);  /* second color */ 
            background-size: var(--s) var(--s);  
            border:1px solid var(--primary_color);
            width:100%;
            height: 100%;
            padding: 0px;
            display: grid;
            gap:20px;
            grid-template-columns: 12fr;
            margin-bottom: 30px;
            box-sizing: border-box;
        }

        @container(min-width: 768px) {
            .project_wrapper{
                grid-template-columns: repeat(2, 6fr);
            }
        }

        @container(min-width: 1200px) {
            .project_wrapper{
                grid-template-columns: repeat(3, 4fr);
            }
        }

        /*---------- Mobile devices ----------*/
        @media (min-width: 480px) {
        }

        /*---------- iPads, Tablets ----------*/
        @media (min-width: 768px) {
        }

        /*---------- Mediuem screens, laptops ----------*/
        @media (min-width: 1024px) {}
    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_projects_mini")
},{"_process":2,"buttons/sm_icon_button":13,"buttons/sm_text_button":15,"path":1,"project_card":21,"window_bar":30}],9:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = app_timeline_mini


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const window_bar = require('window_bar')
const timeline_card = require('timeline_card')
const sm_text_button = require('buttons/sm_text_button')
const scrollbar = require('scrollbar')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)


let id = 0;

function app_timeline_mini (opts, protocol) {

    const name = `app_timeline_mini-${id++}`
    const {data} = opts
    const PROTOCOL = {
        
    }
    // Assigning all the icons
    const { img_src: {
        icon_folder= `${prefix}/icon_folder.svg`,
    } } = data

    const el = document.createElement('div')
    const shadow = el.attachShadow ( { mode : 'closed' } )

    shadow.innerHTML = `
        <div class="main_wrapper">
            <div class="timeline_wrapper">
            </div>
        </div>
        <style> ${get_theme} </style>
    `

    // Adding Applicatin window Bar
    const cover_window = window_bar({
        name:'TIMELINE', 
        src: icon_folder,
        action_buttons: ['View more (12)'],
        data: data
    }, timeline_mini_protocol)


    // Adding timeline cards
    const timeline_wrapper = shadow.querySelector('.timeline_wrapper')
    const cards_data = [
        { title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data: data,
        },{ title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data: data,
        },{ title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data: data,
        },{ title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data: data,
        },{ title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data: data,
        },{ title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data: data,
        },{ title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data: data,
        },{ title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data: data,
        },{ title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data: data,
        },{ title: 'Official starting of the web course.', date: 'July 11, 2022', time: '07:05AM', link: '/', desc: 'The course is called - vanilla.js hyper modular web component building course and it will last approximately 4-8 weeks.. ', tags: ['Hypercore', 'Hypercore', 'Hypercore'], data: data,
        },
    ]
    const timeline_cards = cards_data.map((card_data) => timeline_card(card_data))
    timeline_cards.forEach((card) => {
        timeline_wrapper.append(card)
    })

    const main_wrapper = shadow.querySelector('.main_wrapper')
    
    main_wrapper.append(scrollbar({data: data}, timeline_mini_protocol))
    
    shadow.adoptedStyleSheets = [ sheet ]
    shadow.prepend(cover_window)
    return el

    
    function timeline_mini_protocol(handshake, send){
        if(handshake.from.includes('scrollbar')){
            timeline_wrapper.onscroll = send[0];
            PROTOCOL['getScrollInfo'] = send[1]
            return [listen, setScrollTop]
        }
        else if(handshake.from.includes('window_bar')){
            PROTOCOL['toggle_active_state'] = toggle_active_state;
            return listen;
        }
        function listen (message){
            const {head, type, data} = message
            const {by, to, id} = head
            // if( to !== name) return console.error('address unknown', message)
            if(by.includes('scrollbar')){
                message.data = {sh: timeline_wrapper.scrollHeight, ch: timeline_wrapper.clientHeight, st: timeline_wrapper.scrollTop}
                PROTOCOL.getScrollInfo(message)
            }
            else if(by.includes('window_bar')){
                PROTOCOL[type](message)
            }
        }
        function setScrollTop(value){
            timeline_wrapper.scrollTop = value
        }
        async function toggle_active_state (message) {
            const {head, refs, type, data, meta} = message
            const {active_state} = data
            ;( active_state === 'active')?el.style.display = 'none':''
        }
    }
}




function get_theme(){
    return`
        *{
            box-sizing: border-box;
        }
        .timeline_wrapper{
            --s: 20px; /* control the size */
            --_g: var(--bg_color) /* first color */ 0 25%, #0000 0 50%;
            background:
                repeating-conic-gradient(at 66% 66%,var(--_g)),
                repeating-conic-gradient(at 33% 33%,var(--_g)),
                var(--primary_color);  /* second color */ 
            background-size: var(--s) var(--s);  
            overflow: scroll;
            scrollbar-width: none; /* For Firefox */
            border:1px solid var(--primary_color);
            width:100%;
            height: 400px;
            padding: 0px;
            display: grid;
            gap:20px;
            grid-template-columns: 12fr;
        }
        .timeline_wrapper::-webkit-scrollbar {
            display: none;
        }
        @container(min-width: 768px) {
            .timeline_wrapper{
                grid-template-columns: repeat(2, 6fr);
            }
        }
    
        @container(min-width: 1200px) {
            .timeline_wrapper{
                grid-template-columns: repeat(3, 4fr);
            }
        }
        .main_wrapper{
            display: flex;
            container-type: inline-size;
            width: 100%;
            height: 100%;
            margin-bottom: 30px;
        }
          
        /*---------- Mobile devices ----------*/
        @media (min-width: 480px) {
        }

        /*---------- iPads, Tablets ----------*/
        @media (min-width: 768px) {
        }

        /*---------- Mediuem screens, laptops ----------*/
        @media (min-width: 1024px) {}
    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/app_timeline_mini")
},{"_process":2,"buttons/sm_text_button":15,"path":1,"scrollbar":24,"timeline_card":28,"window_bar":30}],10:[function(require,module,exports){

module.exports = icon_button

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)



var id = 0

// opts - icon/img src
function icon_button (opts, protocol) {

    const name = `icon_button_${id++}`
    let {src, src_active} = opts
    let parent_args, message

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})
    shadow.innerHTML = `
        <div class="icon_btn">
            ${src}
        </div>
        <style>${get_theme()}</style>
    `
    const icon_button = shadow.querySelector(".icon_btn")

    //protocol
    if(protocol){
        parent_args = protocol(listen, name)
        message = {
            head: {by:'icon_button', to:parent_args[1], mid:0},
            type: 'handle_page_change',
        }
        function listen(message){
            const {head, type, data} = message
            const [by, to, id] = head
            ;(data === 'DEFAULT') ? icon_button.classList.add('active') : icon_button.classList.remove('active')
        }
    }

    // Toggle Icon
    if(src_active){
        let activeState = true
        icon_button.onclick = (e) =>{
            ;icon_button.innerHTML = (activeState)? src_active : src
            activeState = !activeState
            toggle_class(e)
        }
    }else{
        icon_button.onclick = (e) => toggle_class(e)
    }

    shadow.adoptedStyleSheets = [sheet]
    return el

    // function toggle_class(e){
    //     if(protocol)
    //     {
    //         message['data'] = 'DEFAULT'
    //         parent_args[0](message)
    //     }
    //     else{
    //         let selector = e.target.classList
    //         ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
    //     }
    // }

    function toggle_class(e) {
        if (protocol) {
            message['data'] = 'DEFAULT'
            parent_args[0](message)
        } else {
            e.target.classList.toggle('active');
        }
    }
}



function get_theme(){
    return`
        .icon_btn{
            display:flex;
            justify-content: center;
            align-items:center;
            height:40px;
            box-sizing:border-box;
            aspect-ratio:1/1;
            cursor:pointer;
            border: 1px solid var(--primary_color);
            background-color: var(--bg_color);
        }
        .icon_btn svg{
            height:25px;
            width: 25px;
            pointer-events:none;
        }
        .icon_btn svg *{
            pointer-events:none;
        }
        .icon_btn.active{
            background-color: var(--ac-2)
        }
    `
}
},{}],11:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = logo_button

const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function logo_button(){

    const el = document.createElement('div')
    // el.classList.add('logo_button_wrapper')
    const shadow = el.attachShadow({mode:'closed'})
    const logo_button = document.createElement('div')
    logo_button.classList.add('logo_button')


    const logo = document.createElement('img')
    logo.src = `${prefix}/logo.png`
    const company_name = document.createElement('span')
    company_name.innerHTML = 'DAT ECOSYSTEM'
    logo_button.append(logo, company_name)


    logo_button.onclick = (e) => toggle_class(e)

    const style = document.createElement('style')
    style.textContent = get_theme()

    shadow.append(logo_button, style)
    shadow.adoptedStyleSheets = [sheet]
    return el
}


function get_theme(){
    return`
        .logo_button{
            width: 100%;
            height:40px;
            box-sizing:border-box;
            padding: 10px;
            display:flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            background-color: var(--primary_color);
            color: var(--bg_color);
            font-size: 0.875em;
            letter-spacing: 0.25rem;
        }
    `
}

function toggle_class(e){
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/buttons")
},{"_process":2,"path":1}],12:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = select_button


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

function select_button (opts, protocol) {
    const notify = protocol(null, listen)
    let message = {
        head: ['select_button', 'project_filter', 'project_filter'],
        type: 'status',
    }

    const {data} = opts
    // Assigning all the icons
    const {img_src} = data
    const {
        icon_arrow_down,
        icon_arrow_up
    } = img_src

    const el = document.createElement('div')
    const shadow = el.attachShadow( { mode:`closed` } )
    shadow.innerHTML = `
        <div class="select_button_wrapper bottom">
            <div class="option_wrapper">
                <div class="option">ACTIVE</div>
                <div class="option">UNACTIVE</div>
                <div class="option">PAUSED</div>
            </div>
            <div class="button_wrapper">
                <span class="button_name">${'STATUS: '}</span>
                <span class="selected_option">${'NULL'}</span>
                <span class="arrow_icon">
                    ${icon_arrow_up}
                </span>
            </div>
        </div>
        <style> ${get_theme()} </style>
    `

    // Adding Select Toggle function
    const select_toggle_btn = shadow.querySelector('.button_wrapper')
    let active_state = true
    select_toggle_btn.onclick = (e) => {
        shadow.querySelector('.select_button_wrapper').classList.toggle('active')
        ;(active_state)?shadow.querySelector('.arrow_icon').innerHTML = icon_arrow_down: shadow.querySelector('.arrow_icon').innerHTML = icon_arrow_up
        active_state = !active_state
    }
    // select_toggle_btn.addEventListener('click', function() {
    //     shadow.querySelector('.select_button_wrapper').classList.toggle('active')
    // })


    // Use event delegation
    // document.addEventListener('click', (e) => {
    //     console.log(e.target.className)
    // })

    // Select all .option divs
    const options = shadow.querySelectorAll('.option')
    const selected_option = shadow.querySelector('.selected_option')

    // Attach click event listener to each .option div
    options.forEach((option) => {
        option.addEventListener('click', () => {
            if (!option.classList.contains('active')) {
                // Add 'active' class to the clicked option
                option.classList.add('active')
                // Remove 'active' class from other options
                options.forEach((other_option) => {
                    if (other_option !== option) {
                        other_option.classList.remove('active')
                    }
                });
            } else {
                // Remove 'active' class from the clicked option
                option.classList.remove('active')
                selected_option.innerHTML = 'Null'
            }

            // Update the selected_option innerHTML
            const active_options = shadow.querySelectorAll('.option.active')
            if (active_options.length > 0) {
                selected_option.innerHTML = active_options[0].innerHTML
                message['data'] = selected_option.innerHTML
                notify(message)
            }
            shadow.querySelector('.select_button_wrapper').classList.toggle('active')

        })
    })


    // shadow.append(main, navbar(opts, protocol))
    shadow.adoptedStyleSheets = [sheet]
    return el

    function listen(message){
        // const {head, type, data} = message
        // const [by, to, id] = head
        // if( to !== id) return console.error('address unknown', message)
    }
}

function get_theme(){
    return`
        .select_button_wrapper{
            box-sizing: border-box;
            position: relative;
            z-index:100;
            width: 100%;
            height: 40px;
            font-size: 0.875em;
            line-height: 1.5em;
            background-color: var(--bg_color);
        }
        .select_button_wrapper.active .option_wrapper{
            display: block !important;
        }
        
        .option_wrapper{
            position: absolute;
            display: none;
            box-sizing: border-box;
            height: max-content;
            max-height: 400px;
            width: 100%;
            background-color: var(--bg_color);
            border: 1px solid var(--primary_color);
        }
        .select_button_wrapper.bottom .option_wrapper{
            bottom: 40px;
            left: 0px;
        }
        .select_button_wrapper.top .option_wrapper{
            /* top: 40px; */
            left: 0px;
        }
        .option_wrapper.top{
            /* bottom: 40px; */
            left: 0px;
        }
        .option{
            box-sizing: border-box;
            display: flex;
            gap:5px;
            align-items:center;
            padding: 10px 5px;
            cursor: pointer;
            background-color: var(--bg_color);
        }
        .option.active{
            background-color: var(--ac-1);
            color: var(--primary_color);
        }
        .option:hover{
            filter: brightness(0.8);
        }
        .select_button_wrapper.active .button_wrapper{
            border: 2px solid var(--ac-1);
        }
        .button_wrapper{
            box-sizing: border-box;
            display: flex;
            gap:5px;
            padding: 10px 5px;
            cursor: pointer;
            height:40px;
            background-color: var(--bg_color);
            border: 1px solid var(--primary_color);
        }
        .button_name{ 
            font-weight: 700;
            letter-spacing: -1px;
        }
        .selected_option{ 
            font-weight: 300;
            letter-spacing: -1px;
        }
        .arrow_icon{
            margin-left: auto;
        }

    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/buttons")
},{"_process":2,"path":1}],13:[function(require,module,exports){

module.exports = sm_icon_button

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)




// Props - icon/img src
function sm_icon_button (props) {
    let {src, src_active} = props

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})

    shadow.innerHTML = `
        <div class="sm_icon_button">
            ${src}
        </div>
    `
    const sm_icon_button = shadow.querySelector(".sm_icon_button")
    
    // Toggle Icon
    if(src_active){
        let activeState = true;
        sm_icon_button.onclick = (e) =>{
            ;(activeState)?icon.src = src_active: icon.src = src
            activeState = !activeState
            toggle_class(e)
        }
    }else{
        // Toggle Class
        sm_icon_button.onclick = (e) => toggle_class(e)
    }

    const style = document.createElement('style')
    style.textContent = get_theme()

    shadow.append(sm_icon_button, style)
    shadow.adoptedStyleSheets = [sheet]
    return el
}



function get_theme(){
    return`
        .sm_icon_button{
            display:flex;
            justify-content: center;
            align-items:center;
            height:30px;
            box-sizing:border-box;
            aspect-ratio:1/1;
            cursor:pointer;
            border: 1px solid var(--primary_color);
            // border-left: var(--bg_color);
            background-color: var(--bg_color);
        }
        .sm_icon_button img{
            height: 20px;
            width: 20px;
            pointer-events:none;
        }
        .sm_icon_button.active{
            background-color: var(--ac-2)
        }
        svg, svg *{
            pointer-events:none !important;
        }
    `
}



function toggle_class(e){
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
}
},{}],14:[function(require,module,exports){

module.exports = sm_icon_button_alt

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)


var id = 0


// opts - icon/img src
function sm_icon_button_alt (opts, protocol) {
    
    const name = `sm_icon_button_alt_${id++}`
    let {src, src_active} = opts

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})

    shadow.innerHTML = `
        <div class="sm_icon_button_alt"> 
            ${src}
        </div>
        <style>${get_theme()}</style>
    `

    const sm_icon_button_alt = shadow.querySelector('.sm_icon_button_alt')


    // Toggle Icon
    if (protocol) { 
        const send = protocol({from:name}, listen) 
        function listen (message) {
            // 
        }
        let active_state = true;

        sm_icon_button_alt.onclick = (e) => {
            if(src_active){
                ;(active_state)?sm_icon_button_alt.innerHTML = src_active: sm_icon_button_alt.innerHTML = src
                active_state = !active_state
                toggle_class(e)
            }else{
                toggle_class(e)
            }

            send({
                head: {
                    by: name,
                    to: 'window_bar_0',
                    mid: 0,
                },
                type: 'toggle_window_active_state', 
                data: {active_state : active_state} 
            })
        }
    }

    shadow.adoptedStyleSheets = [sheet]
    return el
}



function get_theme(){
    return`
        .sm_icon_button_alt{
            display:flex;
            justify-content: center;
            align-items:center;
            height:30px;
            box-sizing:border-box;
            aspect-ratio:1/1;
            cursor:pointer;
            border: 1px solid var(--bg_color);
            // border-left: var(--bg_color);
            background-color: var(--primary_color);
        }
        .sm_icon_button_alt img{
            height: 20px;
            width: 20px;
            pointer-events:none;
        }
        .sm_icon_button_alt.active{
            background-color: var(--ac-2)
        }
        svg, svg *{
            pointer-events:none !important;
        }
    `
}



function toggle_class(e){
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
}
},{}],15:[function(require,module,exports){
module.exports = sm_text_button


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function sm_text_button (props) {

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})
    const sm_text_button = document.createElement('div')
    sm_text_button.classList.add('sm_text_button')
    sm_text_button.innerHTML = props.text
    sm_text_button.onclick = (e) => toggle_class(e)

    const style = document.createElement('style')
    style.textContent = get_theme()

    shadow.append(sm_text_button, style)
    shadow.adoptedStyleSheets = [sheet]
    return el

}



function get_theme(){
    return`
        .sm_text_button{
            text-align:center;
            font-size: 0.875em;
            line-height: .5em;
            padding:10px 5px;
            height:30px;
            box-sizing:border-box;
            width: 100%;
            cursor:pointer;
            border: 1px solid var(--primary_color);
            background-color: var(--bg_color);
            color:var(--primary_color);
        }
        .sm_text_button.active{
            background-color: var(--ac-1);
            color: var(--primary_color);
        }
    `
}



function toggle_class(e){
    let selector = e.target.classList
    ;( selector.contains('active') ) ? selector.remove('active') : selector.add('active')
}
},{}],16:[function(require,module,exports){
module.exports = text_button


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)


var id = 0


function text_button (props, protocol) {

    const name = `text_button_${id++}`
    const {text} = props
    const [notify, parent_name] = protocol(listen, name)
    let message = {
        head: {by:'text_button', to:parent_name, mid:0},
        type: 'handle_page_change',
    }
    function listen(message){
        const {head, type, data} = message
        const [by, to, id] = head
        text_button.classList.toggle('active', data === text);
    }

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})

    shadow.innerHTML = `
        <div class="text_button">${props.text}</div>
        <style>${get_theme()}</style>
    `
    const text_button = shadow.querySelector('.text_button')
    text_button.onclick = (e) => toggle_class(e)

    shadow.adoptedStyleSheets = [sheet]
    return el

    function toggle_class(e){
        message['data'] = text_button.classList.contains('active') ? 'DEFAULT' : text;
        notify(message)
    }
}



function get_theme(){
    return`
        .text_button{
            text-align:center;
            font-size: 0.875em;
            line-height: 1.5714285714285714em;
            padding:10px 5px;
            height:40px;
            box-sizing:border-box;
            width: 100%;
            cursor:pointer;
            border: 1px solid var(--primary_color);
            background-color: var(--bg_color);
            color:var(--primary_color);
        }
        .text_button.active{
            background-color: var(--ac-1);
            color: var(--primary_color);
        }
    `
}
},{}],17:[function(require,module,exports){
module.exports = consortium_page

function consortium_page (opts, protocol) {
    const el = document.createElement('div')
    const shadow = el.attachShadow({mode: 'closed'})

    // adding a `main-wrapper` 
    shadow.innerHTML = `
        <div class="main-wrapper">consortium</div>
        <style>${get_theme()}</style>
    `
    // shadow.adoptedStyleSheets = [sheet]
    return el
}

function get_theme() {
    return ``
}
},{}],18:[function(require,module,exports){
module.exports = growth_page

function growth_page (opts, protocol) {
    const el = document.createElement('div')
    const shadow = el.attachShadow({mode: 'closed'})

    // adding a `main-wrapper` 
    shadow.innerHTML = `
        <div class="main-wrapper">growth</div>
        <style>${get_theme()}</style>
    `
    // shadow.adoptedStyleSheets = [sheet]
    return el
}

function get_theme() {
    return ``
}
},{}],19:[function(require,module,exports){
module.exports = home_page

const cover_app = require('app_cover')
const app_timeline_mini = require('app_timeline_mini')
const app_projects_mini = require('app_projects_mini')
const app_about_us = require('app_about_us')
const app_footer = require('app_footer')


// HOME PAGE

function home_page (opts, protocol) {

    const {data} = opts

    // CSS Boiler Plat
    const sheet = new CSSStyleSheet
    const theme = get_theme()

    const components = [
        cover_app({data}),
        app_timeline_mini({data}),
        app_projects_mini({data}),
        app_about_us({data}),
        app_footer({data}),
    ]

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode: 'closed'})

    // adding a `main-wrapper` 
    shadow.innerHTML = `
        <div class="main-wrapper"></div>
        <style>${get_theme()}</style>
    `
    const main = shadow.querySelector('.main-wrapper')
    main.append(...components)
    shadow.append(main)
    shadow.adoptedStyleSheets = [sheet]
    return el


    // Placeholder code for learning purposes
    // Will be removed
    function home_protocol (handshake, send){
        listen.id  = id
        if (send) return listen
        const PROTOCOL = {
            'toggle_display' : toggle_display
        }
        send = handshake(null, listen)
        function listen (message){
            function format (new_message = {
                head: [from = 'alice', to = 'bob', message_id = 1],
                refs: { cause: message.head }, // reply to received message
                type: 'change_theme',
                data: `.foo { background-color: red; }`
            }) { return new_message }
            console.log(format())
            // const { head, type, data } = message
            // const [by, to, id] = head
            // if (to !== id) return console.error('address unknown', message)
            // const action = PROTOCOL[type] || invalid
            // action(message)
        }
        function invalid (message) { console.error('invalid type', message) }
        async function toggle_display ({ head: [to], data: theme }) {
            // @TODO: apply theme to `sheet` and/or `style` and/or css `var(--property)`
        }
    }
}



function get_theme() {
    return`
        .main-wrapper{
            margin: 0;
            padding:30px 10px;
            opacity: 1;
            background-image: radial-gradient(var(--primary_color) 2px, var(--bg_color) 2px);
            background-size: 16px 16px;
        }
        @media(min-width: 856px){
            .main-wrapper{
                padding-inline:20px;
            }
        }
    `
}
},{"app_about_us":4,"app_cover":5,"app_footer":6,"app_projects_mini":8,"app_timeline_mini":9}],20:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = navbar

const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)


const icon_button = require('buttons/icon_button')
const logo_button = require('buttons/logo_button')
const text_button = require('buttons/text_button')


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)


// Setting component id
var id = 0


function navbar(opts, protocol){

    const {data} = opts

    const name = `navbar-${id++}`

    const notify = protocol({from: name}, listen)
    function listen(message){
        const {head, type, data} = message
        // const [by, to, id] = head
        handle_active_change(data)
    }

    const PROTOCOL = {
        active_page: 'HOME',
        controls: {}
    }

    // Assigning all the icons
    const {img_src} = data
    const {
        icon_consortium,
        icon_blogger,
        icon_discord,
        icon_twitter,
        icon_github,
        icon_terminal,
        icon_theme,
        icon_arrow_down,
        icon_arrow_up
    } = img_src


    const el = document.createElement('div')
    const shadow = el.attachShadow({mode:'closed'})

    shadow.innerHTML = `
    <div class="navbar_wrapper">
        <div class="navbar">
            <div class="nav_toggle_wrapper">
                <div class="logo_button_wrapper"></div>
                <div class="nav_toggle"></div>
            </div>
            <div class="page_btns_wrapper"></div>
            <div class="icon_btn_wrapper"></div>
        </div>
    </div>
    <style>${get_theme()}</style>
  `
    
    // sm nav buttons
    const consortium_btn = icon_button({src:icon_consortium}, navbar_protocol)
    const logo_btn = logo_button()
    const nav_toggle_wrapper = shadow.querySelector('.nav_toggle_wrapper')
    const logo_button_wrapper = shadow.querySelector('.logo_button_wrapper')
    nav_toggle_wrapper.prepend(consortium_btn)
    logo_button_wrapper.append(logo_btn)


    // adding nav toggle button
    const nav_toggle_btn = icon_button({ src: icon_arrow_down, src_active: icon_arrow_up });
    const nav_toggle = shadow.querySelector('.nav_toggle')
    nav_toggle.append(nav_toggle_btn)
    nav_toggle.onclick = event => shadow.querySelector('.navbar').classList.toggle('active');





    // Page List Buttons
    const text_btns = [
        { element: text_button({ text: 'HOME' }, navbar_protocol) },
        { element: text_button({ text: 'PROJECTS' }, navbar_protocol) },
        { element: text_button({ text: 'GROWTH PROGRAM' }, navbar_protocol) },
        { element: text_button({ text: 'TIMELINE' }, navbar_protocol) }
    ]
    const page_btns_wrapper = shadow.querySelector('.page_btns_wrapper')
    text_btns.forEach((button_data) => {
        const text_button_wrapper = document.createElement('div')
        text_button_wrapper.classList.add('text_button_wrapper')
        text_button_wrapper.appendChild(button_data.element)
        page_btns_wrapper.appendChild(text_button_wrapper)
    })





    // Adding social and action buttons
    const icon_btns = [
        {element: icon_button({src:icon_blogger}) },
        {element: icon_button({src:icon_discord}) },
        {element: icon_button({src:icon_twitter}) },
        {element: icon_button({src:icon_github}) },
        {element: icon_button({src:icon_terminal}) },
    ]
    
    const theme_btn = icon_button({src:icon_theme});
    theme_btn.onclick = e => {
        // send({from: name, type: 'change_theme'})
        const head = {from: name, to: 'page', mid: 0}
        notify({head, type:'handle_theme_change', data: ''})
    };
    const icon_btn_wrapper = shadow.querySelector('.icon_btn_wrapper')
    icon_btn_wrapper.append(...icon_btns.map(button_data => button_data.element), theme_btn)


    function handle_active_change(active_page){
        PROTOCOL.active_page = active_page;
        
        for(const button in PROTOCOL.controls){
            const message = {
                head: [name, button, button],
                type: 'theme',
                data: active_page,
            }
            PROTOCOL.controls[button](message)
        }
    }


    //protocol
    function navbar_protocol(handshake, send, mid = 0){
        
        PROTOCOL.controls[send] = handshake

        if (send) return [listen, name];
        function listen(message){
            const {head, type, data} = message
            const {by, to, id} = head
            // if( to !== id) return console.error('address unknown', message)

            notify(message)
        }
        

    }


    shadow.adoptedStyleSheets = [sheet]
    return el

}


function get_theme(){
    return`
        .navbar_wrapper{
            container-type: inline-size;
            width: 100%;
        }
        .navbar{
            display: block;
            width:100%;
            height:40px;
            overflow:hidden;
            border-bottom: 1px solid var(--primary_color);

            --s: 15px; /* control the size */
            --_g: var(--bg_color) /* first color */ 0 25%, #0000 0 50%;
            background:
                repeating-conic-gradient(at 33% 33%,var(--_g)),
                repeating-conic-gradient(at 66% 66%,var(--_g)),
                var(--primary_color);  /* second color */ 
            background-size: var(--s) var(--s);                   
        }
        .navbar.active{
            height:max-content;
        }


        /* Starting buttons wrapper */
        .nav_toggle_wrapper{
            display: flex;
            width:100%;
            justify-content:stretch;
        }
        .nav_toggle_wrapper .logo_button_wrapper{
            width:100% !important;
            flex-grow:1;
        }
        .nav_toggle{
            display:block;
        }
        .page_btns_wrapper{
            width:100%;
            display:flex;
            flex-direction:column;
        }
        .page_btns_wrapper .text_button_wrapper{
            width:100%;
            flex-grow:1;
        }
        .icon_btn_wrapper{
            display:flex;
            justify-content:flex-start;
        }










        .page_list{
            display: none;
        }

        @container(min-width: 899px) {

            .navbar{
                display: flex;
            }

            .nav_toggle_wrapper{
                width:max-content;
                display:flex;
            }
            .nav_toggle_wrapper .logo_button_wrapper{
                width: max-content !important;
            }
            .nav_toggle{
                display:none;   
            }
            .page_list{
                display:flex;
            }

            .nav_toggle_wrapper .nav_toggle_btn{
                display: none;
            }
            .page_btns_wrapper{
                flex-direction: row;
            }
            .page_btns_wrapper .text_button_wrapper{
                width:max-content !important;
                flex-grow: unset;
            }
        }
        
        .socials_list{
            display: flex;
        }
    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/navbar")
},{"_process":2,"buttons/icon_button":10,"buttons/logo_button":11,"buttons/text_button":16,"path":1}],21:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = project_card


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const sm_icon_button = require('buttons/sm_icon_button')


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function project_card (opts) {

    const {data} = opts
    // Assigning all the icons
    const { img_src: { 
        icon_consortium = `${prefix}/icon_consortium_page.png`,
    } } = data


    const el = document.createElement('div')
    el.style.lineHeight = '0px'
    const shadow = el.attachShadow( { mode : 'closed' } )
    
    shadow.innerHTML = `
        <div class="project_card">
            <div class="icon_wrapper">
                <div class="project_title">
                    ${opts.project}
                </div>
                <div class="socials_wrapper"></div>
            </div>
            <div class="content_wrapper">
                <div class="desc"> ${opts.desc}</div>
            </div>
            <div class="tags_wrapper">
                ${opts.tags.map((tag) => `<div class="tag">${tag}</div>`).join('')}
            </div>
        </div>
        <style>${get_theme}</style>
    `

    // Adding Project Logo
    const project_title = shadow.querySelector('.project_title');
    
    const project_logo = document.createElement('img')
    project_logo.src = opts.project_logo
    project_title.prepend(project_logo)
    
    // Adding Socials
    const socials_wrapper = shadow.querySelector('.socials_wrapper');
    const social_link = opts.socials.map((social) => sm_icon_button({src:social}));
    social_link.forEach((social) => {
        socials_wrapper.append(social)
    })


    shadow.adoptedStyleSheets = [sheet]
    return el


}





function get_theme(){
    return`
        *{
            box-sizing: border-box;
        }
        .project_card{
            height:max-content;
            width:100%;
            line-height: normal;
            background-color: var(--bg_color);
            color: var(--primary_color) !important;
            border:1px solid var(--primary_color);
            container-type: inline-size;
            box-sizing: border-box;
        }
        .content_wrapper{
            padding:20px;
        }
        .icon_wrapper{
            display:flex;
            justify-content:space-between;
            border-bottom: 1px solid var(--primary_color);
        }
        .project_title{
            display:flex;
            gap:5px;
            font-size:16px;
            letter-spacing:-2px;
            align-items:center;
            font-weight: 700;
            margin-left:5px;
        }
        .socials_wrapper{
            display:flex;
        }
        .socials_wrapper a{
            display:flex;
            height:100%;
            align-items:center;
        }
        .desc{
            font-size:14px;
            letter-spacing:-2px;
            line-height:16px;
        }
        .tags_wrapper{
            display: flex;
            flex-wrap:wrap;
        }
        .tag{
            flex-grow:1;
            min-width:max-content;
            padding:5px 10px;
            border: 1px solid var(--primary_color);
            text-align:center;
        }
        




        @container(min-width: 856px) {
            
        }


    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/project_card")
},{"_process":2,"buttons/sm_icon_button":13,"path":1}],22:[function(require,module,exports){
module.exports = project_filter


const search_input = require('search_input')
const select_button = require('../buttons/select_button')

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

var id = 0;
function project_filter(opts, protocol){

    const name = 'project_filter-'+id++;
    const notify = protocol({from: name}, listen)

    const PROTOCOL = {

    }

    const el = document.createElement('div')
    const shadow = el.attachShadow( { mode:`closed` } )
    shadow.innerHTML = `
        <div class="filter_wrapper">
            <div class="project_filter"></div>
        </div>
        <style> ${get_theme} </style>
    `

    const search_project = search_input(opts, project_filter_protocol)
    const status_button = select_button(opts, project_filter_protocol)
    const tag_button = select_button(opts, project_filter_protocol)

    const project_filter = shadow.querySelector('.project_filter')
    project_filter.append(status_button, tag_button, search_project)

    // shadow.append(project_filter)
    shadow.adoptedStyleSheets = [sheet]
    return el

    function project_filter_protocol(handshake, send, mid = 0){
        if(send) return listen
        function listen(message){
            const {head, type, data} = message
            const {by, to, id} = head
            // if( to !== id) return console.error('address unknown', message)
            message = {
                head: {by:name, to:'app_projects', mid:0},
                type: type,
                data: data
            }
            notify(message)
        }
    }
    function listen(message){
        
    }

}

function get_theme(){
    return`
        .filter_wrapper{
            container-type: inline-size;
        }
        .project_filter{
            display: grid;
            grid-template-columns: 12fr;
            align-items:flex-end;
        }
        .project_filter > div{
            flex-grow: 1;
        }
        .project_filter .select_button_wrapper{
            width: 100% !important;
        }





        @container(min-width: 412px) {
            .project_filter{
                grid-template-columns: 1fr 1fr 10fr;
            }
        }
    `
}
},{"../buttons/select_button":12,"search_input":25}],23:[function(require,module,exports){
module.exports = projects_page

const app_projects = require('app_projects')

function projects_page (opts, protocol) {
    const {data} = opts

    // CSS Boiler Plat
    const sheet = new CSSStyleSheet
    const theme = get_theme()

    const components = [
        app_projects({data}),
    ]

    const el = document.createElement('div')
    const shadow = el.attachShadow({mode: 'closed'})

    // adding a `main-wrapper` 
    shadow.innerHTML = `
        <div class="main-wrapper"></div>
        <style>${get_theme()}</style>
    `
    const main = shadow.querySelector('.main-wrapper')
    main.append(...components)
    shadow.append(main)
    shadow.adoptedStyleSheets = [sheet]
    return el


    // Placeholder code for learning purposes
    // Will be removed
    function projects_protocol (handshake, send){
        listen.id  = id
        if (send) return listen
        const PROTOCOL = {
            'toggle_display' : toggle_display
        }
        send = handshake(null, listen)
        function listen (message){
            function format (new_message = {
                head: [from = 'alice', to = 'bob', message_id = 1],
                refs: { cause: message.head }, // reply to received message
                type: 'change_theme',
                data: `.foo { background-color: red; }`
            }) { return new_message }
            console.log(format())
            // const { head, type, data } = message
            // const [by, to, id] = head
            // if (to !== id) return console.error('address unknown', message)
            // const action = PROTOCOL[type] || invalid
            // action(message)
        }
        function invalid (message) { console.error('invalid type', message) }
        async function toggle_display ({ head: [to], data: theme }) {
            // @TODO: apply theme to `sheet` and/or `style` and/or css `var(--property)`
        }
    }
}

function get_theme() {
    return`
        .main-wrapper{
            margin: 0;
            padding:30px 10px;
            opacity: 1;
            background-image: radial-gradient(var(--primary_color) 2px, var(--bg_color) 2px);
            background-size: 16px 16px;
        }
        @media(min-width: 856px){
            .main-wrapper{
                padding-inline:20px;
            }
        }
    `
}
},{"app_projects":7}],24:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = scrollbar

const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const sm_icon_button = require('buttons/sm_icon_button')


const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)

let id = 0;

function scrollbar(opts, protocol){

    const name = "scrollbar-"+id++;
    const {data} = opts
    let message = {
        head: {by: name, to:'app_projects', mid:0},
        type: 'status',
        data: null
    }
    let content_scrollHeight, content_clientHeight, content_scrollTop;
    
    const [notify, setScrollTop] = protocol({from: name}, [handle_scroll, listen])
    function listen(message){
        const {head, type, data} = message
        const {by, to, id} = head
        const { sh, ch, st } = data
        content_clientHeight = ch;
        content_scrollHeight = sh;
        content_scrollTop = st;
    }

    // Assigning all the icons
    const { img_src: { 
        icon_arrow_down = `${prefix}/icon_arrow_down.svg`,
        icon_arrow_up = `${prefix}/icon_arrow_up.svg`
    } } = data

    const el = document.createElement('div')
    el.classList.add('container')
    const shadow = el.attachShadow({ mode: 'closed'})
    shadow.innerHTML = `
        <div class="scrollbar_wrapper">
            <div class="bar_wrapper">
                <div class="bar"> </div>
            </div>
        </div>
        <style> ${get_theme} </style>
    `
    const bar = shadow.querySelector('.bar')
    let lastPageY;
    let isMouseDown = false
    bar.onmousedown = handle_mousedown;
    function handle_mousedown(e){
        lastPageY = e.pageY;
        isMouseDown = true;
    }
    bar.onmousemove = handle_mousemove;
    function handle_mousemove(e){
        if(isMouseDown){
            notify(message)
            const delta = e.pageY - lastPageY;
            lastPageY = e.pageY;
            const ratio = content_clientHeight / content_scrollHeight
            setScrollTop(content_scrollTop + delta / ratio)
        }
    }
    bar.onmouseup = handle_mouseup;
    bar.onmouseleave = handle_mouseup;
    function handle_mouseup(){
        isMouseDown = false;
    }

    window.onresize = handle_scroll;
    function handle_scroll(){
        notify(message)
        const ratio = content_clientHeight / content_scrollHeight
        if(ratio >= 1) 
            el.style.cssText = 'display: none;'
        else
            el.style.cssText = 'display: inline;'
        bar.style.cssText = 'height:' + Math.max(ratio * 100, 10) + '%; top:' + (content_scrollTop / content_scrollHeight ) * 100 + '%;'
    }

    window.requestAnimationFrame(handle_scroll);
    

    const arrow_down_btn = sm_icon_button({src: icon_arrow_down, src_active: icon_arrow_down, activate: true})
    arrow_down_btn.classList.add('arrow_down_btn')
    arrow_down_btn.onclick = () => {
        notify(message)
        const ratio = content_clientHeight / content_scrollHeight
        setScrollTop(content_scrollTop + 30 / ratio)
    }

    const arrow_up_btn = sm_icon_button({src: icon_arrow_up, src_active: icon_arrow_up, activate: true})
    arrow_up_btn.classList.add('arrow_up_btn')
    arrow_up_btn.onclick = () => {
        notify(message)
        const ratio = content_clientHeight / content_scrollHeight
        setScrollTop(content_scrollTop - 30 / ratio)
    }

    const scrollbar_wrapper = shadow.querySelector('.scrollbar_wrapper')
    scrollbar_wrapper.append(arrow_down_btn, arrow_up_btn)


    shadow.adoptedStyleSheets = [ sheet ]
    return el;
}

function get_theme() {
    return `
        .scrollbar_wrapper{
            width: 32px;
            height: 100%;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            border:1px solid var(--primary_color);
        }
        .bar_wrapper{
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .bar {
            position: relative;
            background-color: var(--primary_color);
            width: 30px;
            cursor: pointer;
            transition: opacity 0.25s linear;
            box-shadow:inset 0px 0px 0px 1px #fff;
            
        }
        .bar:hover {
            cursor: pointer
        }
        .bar:active {
            -o-user-select: none;
            -ms-user-select: none;
            -moz-user-select: none;
            -webkit-user-select: none;
            user-select: none;
        }
    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/scrollbar")
},{"_process":2,"buttons/sm_icon_button":13,"path":1}],25:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = input_search

const path = require('path')
const cwd = process.cwd()   
const prefix = path.relative(cwd, __dirname)

// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)


function input_search (opts, protocol){
    const notify = protocol(null, listen)
    const {data} = opts
    let message = {
        head: ['input_search', 'project_filter', 'project_filter'],
        type: 'search',
    }

    // Assigning all the icons
    const { img_src: {
        icon_search = `${prefix}/icon_search.svg`,
    } } = data

    const el = document.createElement('div')
    // el.classList.add('input_wrapper')

    const shadow = el.attachShadow( { mode:`closed` } )
    shadow.innerHTML = `
        <div class="search_input">
            <input class="input" type="text" placeholder="SEARCH...">
                ${icon_search}
            </input>
        </div>
        <style> ${get_theme} </style>
    `
    const input = shadow.querySelector('.input')
    input.onchange = (e) => {
        message['data'] = e.target.value
        notify(message)
    }

    // shadow.append(main, navbar(opts, protocol))
    shadow.adoptedStyleSheets = [sheet]
    return el

    function listen(message){
        // const {head, type, data} = message
        // const [by, to, id] = head
        // if( to !== id) return console.error('address unknown', message)

    }
}


function get_theme(){

    return`
        .search_input{
            width: 100%;
            min-width: 100% !important;
            height: 40px;
            max-height: 40px;
            position: relative;
            flex-grow: 1;
        }
        input{
            box-sizing: border-box;
            width:100%;
            height: 100%;
            border: 3px solid var(--primary_color);
            padding: 10px 40px 10px 5px;
            outline:none;
            font-family: Silkscreen;
            font-size: 18px;
            letter-spacing:-1px;
        }
        input:focus{
            border-color: var(--ac-1) !important;
        }
        .search_input svg{
            position: absolute;
            right:10px;
            top:50%;
            translate: 0 -50%;
            width:20px;
            height: auto;
        }
    `
    
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/search_input")
},{"_process":2,"path":1}],26:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const dark_theme = {
  bg_color : '#000',
    primary_color : '#2ACA4B',
    // bg_color : '#293648',
    // primary_color : '#fff',
    ac_1 : '#2ACA4B',
    ac_2 : '#F9A5E4',
    ac_3 : '#88559D',

    img_src:{
      icon_consortium: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1927)"><path d="M38 41.1776V50.0011H12V41.1776H20.6667V23.5306H14.8889V14.707H29.3333V41.1776H38Z" fill="#293648"/><path d="M29.3337 0H20.667V8.82353H29.3337V0Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1927"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
      icon_blogger: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1919)"><path d="M47.0588 26.4706V23.5294H44.1176V20.5882H38.2353V17.6471H35.2941V5.88235H32.3529V2.94118H29.4118V0H5.88235V2.94118H2.94118V5.88235H0V44.1176H2.94118V47.0588H5.88235V50H44.1176V47.0588H47.0588V44.1176H50V26.4706H47.0588ZM5.88235 35.2941H8.82353V32.3529H38.2353V35.2941H41.1765V38.2353H38.2353V41.1765H8.82353V38.2353H5.88235V35.2941ZM5.88235 14.7059H8.82353V11.7647H26.4706V14.7059H29.4118V17.6471H26.4706V20.5882H8.82353V17.6471H5.88235V14.7059Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1919"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
      icon_discord: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.3684 25.7692V18.1538H44.7368V13.0769H39.4737V8H28.9474V13.0769H34.2105V15.6154H15.7895V13.0769H21.0526V8H10.5263V13.0769H5.26316V18.1538H2.63158V25.7692H0V35.9231H2.63158V38.4615H7.89474V41H15.7895V35.9231H34.2105V41H42.1053V38.4615H47.3684V35.9231H50V25.7692H47.3684ZM21.0526 30.8462H15.7895V20.6923H21.0526V30.8462ZM34.2105 30.8462H28.9474V20.6923H34.2105V30.8462Z" fill="#293648"/></svg>`,
      icon_twitter: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 7.89474V10.5263H47.3684V13.1579H44.7368V21.0526H47.3684V28.9474H44.7368V36.8421H42.1053V42.1053H39.4737V44.7368H34.2105V47.3684H28.9474V50H15.7895V47.3684H7.89474V44.7368H5.26316V39.4737H7.89474V42.1053H13.1579V39.4737H10.5263V36.8421H7.89474V34.2105H5.26316V28.9474H2.63158V23.6842H5.26316V26.3158H7.89474V28.9474H13.1579V26.3158H10.5263V23.6842H7.89474V21.0526H5.26316V18.4211H2.63158V13.1579H0V7.89474H2.63158V10.5263H7.89474V13.1579H15.7895V15.7895H21.0526V13.1579H23.6842V7.89474H26.3158V2.63158H31.5789V0H42.1053V2.63158H44.7368V5.26316H47.3684V7.89474H50Z" fill="#293648"/></svg>`,
      icon_github: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1915)"><path d="M50 15.7895V34.2105H47.3684V39.4737H44.7368V42.1053H42.1053V44.7368H39.4737V47.3684H34.2105V50H28.9474V34.2105H26.3158V31.5789H34.2105V28.9474H36.8421V26.3158H39.4737V18.4211H36.8421V10.5263H34.2105V13.1579H31.5789V15.7895H28.9474V13.1579H21.0526V15.7895H18.4211V13.1579H15.7895V10.5263H13.1579V18.4211H10.5263V26.3158H13.1579V28.9474H15.7895V31.5789H23.6842V34.2105H21.0526V36.8421H18.4211V39.4737H13.1579V36.8421H10.5263V34.2105H7.89474V39.4737H10.5263V42.1053H13.1579V44.7368H18.4211V42.1053H21.0526V50H15.7895V47.3684H10.5263V44.7368H7.89474V42.1053H5.26316V39.4737H2.63158V34.2105H0V15.7895H2.63158V10.5263H5.26316V7.89474H7.89474V5.26316H10.5263V2.63158H15.7895V0H34.2105V2.63158H39.4737V5.26316H42.1053V7.89474H44.7368V10.5263H47.3684V15.7895H50Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1915"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
      icon_terminal: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.619 9.70588V7.35294H45.2381V5H4.7619V7.35294H2.38095V9.70588H0V40.2941H2.38095V42.6471H4.7619V45H45.2381V42.6471H47.619V40.2941H50V9.70588H47.619ZM19.0476 30.8824H16.6667V33.2353H14.2857V35.5882H9.52381V33.2353H11.9048V30.8824H14.2857V28.5294H16.6667V26.1765H19.0476V23.8235H16.6667V21.4706H14.2857V19.1176H11.9048V16.7647H9.52381V14.4118H14.2857V16.7647H16.6667V19.1176H19.0476V21.4706H21.4286V23.8235H23.8095V26.1765H21.4286V28.5294H19.0476V30.8824ZM40.4762 35.5882H21.4286V33.2353H40.4762V35.5882Z" fill="#293648"/></svg>`,
      icon_theme: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1948)"><path d="M39.4634 26.3141V28.944H34.2037V26.3141H28.944V23.6843H26.3141V21.0544H23.6843V18.4246H21.0544V13.1649H18.4246V0.015625H10.535V2.64547H7.90517V5.27532H5.27532V7.90517H2.64547V13.1649H0.015625V34.2037H2.64547V39.4634H5.27532V42.0932H7.90517V44.7231H10.535V47.3529H15.7947V49.9828H34.2037V47.3529H39.4634V44.7231H42.0932V42.0932H44.7231V39.4634H47.3529V36.8335H49.9828V26.3141H39.4634ZM47.3529 34.2037H44.7231V36.8335H42.0932V39.4634H39.4634V42.0932H36.8335V44.7231H31.5738V47.3529H18.4246V44.7231H13.1649V42.0932H10.535V39.4634H7.90517V36.8335H5.27532V31.5738H2.64547V15.7947H5.27532V10.535H7.90517V7.90517H10.535V5.27532H13.1649V2.64547H15.7947V15.7947H18.4246V21.0544H21.0544V23.6843H23.6843V26.3141H26.3141V28.944H31.5738V31.5738H42.0932V28.944H47.3529V34.2037Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1948"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
      icon_close_dark: `<svg width="20" height="20" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.25 12V9.75H7V7.5H4.75V5.25H2.5V3H0.25V0.75H2.5V3H4.75V5.25H7V7.5H9.25V9.75H11.5V12H9.25ZM7 5.25V3H9.25V0.75H11.5V3H9.25V5.25H7ZM2.5 9.75V7.5H4.75V9.75H2.5ZM0.25 12V9.75H2.5V12H0.25Z" fill="#293648"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9 12.25V10H6.75V7.75H5V10H2.75V12.25H0V9.5H2.25V7.25H4.5V5.5H2.25V3.25H0V0.5H2.75V2.75H5V5H6.75V2.75H9V0.5H11.75V3.25H9.5V5.5H7.25V7.25H9.5V9.5H11.75V12.25H9ZM9.25 9.75V7.5H7V5.25H9.25V3H11.5V0.75H9.25V3H7V5.25H4.75V3H2.5V0.75H0.25V3H2.5V5.25H4.75V7.5H2.5V9.75H0.25V12H2.5V9.75H4.75V7.5H7V9.75H9.25V12H11.5V9.75H9.25Z" fill="#293648"/></svg>`,
      icon_close_light: `<svg width="20" height="20" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.25 11.9023V9.65234H7V7.40234H4.75V5.15234H2.5V2.90234H0.25V0.652344H2.5V2.90234H4.75V5.15234H7V7.40234H9.25V9.65234H11.5V11.9023H9.25ZM7 5.15234V2.90234H9.25V0.652344H11.5V2.90234H9.25V5.15234H7ZM2.5 9.65234V7.40234H4.75V9.65234H2.5ZM0.25 11.9023V9.65234H2.5V11.9023H0.25Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9 12.1523V9.90234H6.75V7.65234H5V9.90234H2.75V12.1523H0V9.40234H2.25V7.15234H4.5V5.40234H2.25V3.15234H0V0.402344H2.75V2.65234H5V4.90234H6.75V2.65234H9V0.402344H11.75V3.15234H9.5V5.40234H7.25V7.15234H9.5V9.40234H11.75V12.1523H9ZM9.25 9.65234V7.40234H7V5.15234H9.25V2.90234H11.5V0.652344H9.25V2.90234H7V5.15234H4.75V2.90234H2.5V0.652344H0.25V2.90234H2.5V5.15234H4.75V7.40234H2.5V9.65234H0.25V11.9023H2.5V9.65234H4.75V7.40234H7V9.65234H9.25V11.9023H11.5V9.65234H9.25Z" fill="white"/></svg>`,
      icon_pdf_reader: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2040_2024)"><path fill-rule="evenodd" clip-rule="evenodd" d="M45 6.00332V8V50H5V0H37H39V2L41 2.00332L40.9998 4.00332H43V6.00332H45ZM37 2H39V4H40.9991L41 6.00332H43V8H37V2ZM8 3H33.9987V11.0032H42V47H8V3Z" fill="white"/><path d="M26.9981 12.0012H10.9981V14.0012H26.9981V12.0012Z" fill="white"/><path d="M32.9981 25.9951H10.9981V27.9951H32.9981V25.9951Z" fill="white"/><path d="M34.9981 15.9953H10.9981V17.9953H34.9981V15.9953Z" fill="white"/><path d="M32.9981 29.9989H10.9981V31.9989H32.9981V29.9989Z" fill="white"/></g><defs><clipPath id="clip0_2040_2024"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
      icon_folder: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M28 15H0V41H50V9H28V15ZM31 12V18H3V38H47V12H31Z" fill="white"/></svg>`,
      icon_arrow_down: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.421 41H31.579V33H42.1054V22.3333H50V9L31.579 9V17H18.421V9L1.2659e-06 9L0 22.3333H7.89475V33H18.421V41Z" fill="#293648"/></svg>`,
      icon_arrow_up: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.5789 9H18.4211V17H7.89473V27.6667H0V41H18.4211V33H31.5789V41H50V27.6667H42.1053V17H31.5789V9Z" fill="#293648"/></svg>`,
      icon_arrow_down_light: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.421 41H31.579V33H42.1054V22.3333H50V9L31.579 9V17H18.421V9L1.2659e-06 9L0 22.3333H7.89475V33H18.421V41Z" fill="white"/></svg>`,
      icon_arrow_up_light: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.579 9L18.421 9V17H7.89475V27.6667H1.2659e-06L0 41H18.421V33H31.579V41H50V27.6667H42.1054V17H31.579V9Z" fill="white"/></svg>`,
      icon_search : `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.7627 2.27344H25.5832V4.73044H12.7627V2.27344Z" fill="#293648"/><path d="M12.7627 32.9844H25.5832V35.4414H12.7627V32.9844Z" fill="#293648"/><path d="M6.93457 4.73047H12.7621V7.18747H6.93457V4.73047Z" fill="#293648"/><path d="M6.93457 30.5273H12.7621V32.9844H6.93457V30.5273Z" fill="#293648"/><path d="M4.60352 7.1875H6.93452V14.5585H4.60352V7.1875Z" fill="#293648"/><path d="M4.60352 23.1562H6.93452V30.5272H4.60352V23.1562Z" fill="#293648"/><path d="M2.27246 13.3281H4.60346V24.3846H2.27246V13.3281Z" fill="#293648"/><path d="M31.4102 7.1875H33.7413V14.5585H31.4102V7.1875Z" fill="#293648"/><path d="M33.7416 35.4433H31.4105V32.9863H25.583V30.5292H31.4105V24.3867H33.7416V30.5292H36.0726V32.9863H38.4035V35.4433H40.7346V37.9004H43.0655V40.3574H45.3966V42.8142H47.7276V47.7283H43.0655V45.2713H40.7346V42.8142H38.4035V40.3574H36.0726V37.9004H33.7416V35.4433Z" fill="#293648"/><path d="M33.7412 13.3281H36.0721V24.3846H33.7412V13.3281Z" fill="#293648"/><path d="M25.583 4.73047H31.4105V7.18747H25.583V4.73047Z" fill="#293648"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12.1936 1.70312H26.1505V4.16012H31.978V6.61712H34.3091V12.7596H36.64V24.9524H34.3091V29.9586H36.64V32.4156H38.9709V34.8727H41.3021V37.3297H43.633V39.7868H45.9641V42.2436H48.295V48.294H42.4966V45.837H40.1657V43.3799H37.8346V40.9231H35.5036V38.4661H33.1727V36.009H30.8416V33.552H26.1505V36.009H12.1936V33.552H6.3661V31.0949H4.0351V24.9524H1.7041V12.7596H4.0351V6.61712H6.3661V4.16012H12.1936V1.70312ZM12.7618 4.72831H6.93428V7.18531H4.60328V13.3278H2.27228V24.3843H4.60328V30.5268H6.93428V32.9838H12.7618V35.4409H25.5823V32.9838H31.4098V35.4409H33.7409V37.8979H36.0718V40.3549H38.4027V42.8118H40.7339V45.2688H43.0648V47.7259H47.7268V42.8118H45.3959V40.3549H43.0648V37.8979H40.7339V35.4409H38.4027V32.9838H36.0718V30.5268H33.7409V24.3843H36.0718V13.3278H33.7409V7.18531H31.4098V4.72831H25.5823V2.27131H12.7618V4.72831ZM25.5823 4.72831H12.7618V7.18531H6.93428V14.5563H4.60328V23.1559H6.93428V30.5268H12.7618V32.9838H25.5823V30.5268H31.4098V24.3843H33.7409V14.5563H31.4098V7.18531H25.5823V4.72831ZM25.0141 5.29649H13.33V7.75349H7.50247V15.1245H5.17147V22.5876H7.50247V29.9586H13.33V32.4156H25.0141V29.9586H30.8416V23.8161H33.1727V15.1245H30.8416V7.75349H25.0141V5.29649Z" fill="#293648"/></svg>`,
      banner_cover : `${prefix}/../assets/images/banner_cover.svg`,
      about_us_cover : `${prefix}/../assets/images/about_us_cover.png`,
      tree_character : `${prefix}/../assets/images/tree_character.png`,
      icon_clock : `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2040_1964)"><path fill-rule="evenodd" clip-rule="evenodd" d="M33.3333 38.889H38.889V33.3333H44.4444V16.6667H38.889V11.1111H33.3333V5.55556H16.6667V11.1111H11.1111V16.6667H5.55556V33.3333H11.1111V38.889H16.6667V44.4444H33.3333V38.889ZM38.889 44.4444V50H11.1111V44.4444H5.55556V38.889H0V11.1111H5.55556V5.55556H11.1111V0H38.889V5.55556H44.4444V11.1111H50V38.889H44.4444V44.4444H38.889Z" fill="#293648"/><path d="M22.2226 22.2206H16.667V27.776H27.778V11.1094H22.2226V22.2206Z" fill="#293648"/></g><defs><clipPath id="clip0_2040_1964"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
      icon_link : `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2040_1975)"><path d="M28 0L28 5L37 5V10H32L32 15L27 15V20H22V28L30 28L30 23H35L35 18H40V13H45L45 23H50V0H28Z" fill="#293648"/><path d="M0 5H22V11H6V44H39V28H45V50H0V5Z" fill="#293648"/></g><defs><clipPath id="clip0_2040_1975"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
      icon_calendar : `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M47 14H3V45H47V14ZM0 6V48H50V6H46V2H40V6H10V2H4V6H0Z" fill="#293648"/><path d="M15 38V35H12V25H14.9901L15 22H22V25H25V35H22V38H15ZM15 35H22V25H14.9901L15 35Z" fill="#293648"/><path d="M28 38V35H32V25H28V22H35.0098V35H39V38H28Z" fill="#293648"/></svg>`,
      project_logo_1 : `${prefix}/../assets/images/project_logo_1.png`,
      img_robot_1 : `${prefix}/../assets/images/img_robot_1.png`,
      img_robot_2 : `${prefix}/../assets/images/img_robot_2.png`,
      pattern_img_1 : `${prefix}/../assets/images/pattern_img_1.png`,
    },
}

module.exports = dark_theme
}).call(this)}).call(this,require('_process'),"/src/node_modules/theme/dark_theme")
},{"_process":2,"path":1}],27:[function(require,module,exports){
(function (process,__dirname){(function (){
const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)


const light_theme = {
  bg_color : '#fff',
  primary_color : '#293648',
  ac_1 : '#2ACA4B',
  ac_2 : '#F9A5E4',
  ac_3 : '#88559D',

  img_src:{
    icon_consortium: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1927)"><path d="M38 41.1776V50.0011H12V41.1776H20.6667V23.5306H14.8889V14.707H29.3333V41.1776H38Z" fill="#293648"/><path d="M29.3337 0H20.667V8.82353H29.3337V0Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1927"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_blogger: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1919)"><path d="M47.0588 26.4706V23.5294H44.1176V20.5882H38.2353V17.6471H35.2941V5.88235H32.3529V2.94118H29.4118V0H5.88235V2.94118H2.94118V5.88235H0V44.1176H2.94118V47.0588H5.88235V50H44.1176V47.0588H47.0588V44.1176H50V26.4706H47.0588ZM5.88235 35.2941H8.82353V32.3529H38.2353V35.2941H41.1765V38.2353H38.2353V41.1765H8.82353V38.2353H5.88235V35.2941ZM5.88235 14.7059H8.82353V11.7647H26.4706V14.7059H29.4118V17.6471H26.4706V20.5882H8.82353V17.6471H5.88235V14.7059Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1919"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_discord: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.3684 25.7692V18.1538H44.7368V13.0769H39.4737V8H28.9474V13.0769H34.2105V15.6154H15.7895V13.0769H21.0526V8H10.5263V13.0769H5.26316V18.1538H2.63158V25.7692H0V35.9231H2.63158V38.4615H7.89474V41H15.7895V35.9231H34.2105V41H42.1053V38.4615H47.3684V35.9231H50V25.7692H47.3684ZM21.0526 30.8462H15.7895V20.6923H21.0526V30.8462ZM34.2105 30.8462H28.9474V20.6923H34.2105V30.8462Z" fill="#293648"/></svg>`,
    icon_twitter: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 7.89474V10.5263H47.3684V13.1579H44.7368V21.0526H47.3684V28.9474H44.7368V36.8421H42.1053V42.1053H39.4737V44.7368H34.2105V47.3684H28.9474V50H15.7895V47.3684H7.89474V44.7368H5.26316V39.4737H7.89474V42.1053H13.1579V39.4737H10.5263V36.8421H7.89474V34.2105H5.26316V28.9474H2.63158V23.6842H5.26316V26.3158H7.89474V28.9474H13.1579V26.3158H10.5263V23.6842H7.89474V21.0526H5.26316V18.4211H2.63158V13.1579H0V7.89474H2.63158V10.5263H7.89474V13.1579H15.7895V15.7895H21.0526V13.1579H23.6842V7.89474H26.3158V2.63158H31.5789V0H42.1053V2.63158H44.7368V5.26316H47.3684V7.89474H50Z" fill="#293648"/></svg>`,
    icon_github: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1915)"><path d="M50 15.7895V34.2105H47.3684V39.4737H44.7368V42.1053H42.1053V44.7368H39.4737V47.3684H34.2105V50H28.9474V34.2105H26.3158V31.5789H34.2105V28.9474H36.8421V26.3158H39.4737V18.4211H36.8421V10.5263H34.2105V13.1579H31.5789V15.7895H28.9474V13.1579H21.0526V15.7895H18.4211V13.1579H15.7895V10.5263H13.1579V18.4211H10.5263V26.3158H13.1579V28.9474H15.7895V31.5789H23.6842V34.2105H21.0526V36.8421H18.4211V39.4737H13.1579V36.8421H10.5263V34.2105H7.89474V39.4737H10.5263V42.1053H13.1579V44.7368H18.4211V42.1053H21.0526V50H15.7895V47.3684H10.5263V44.7368H7.89474V42.1053H5.26316V39.4737H2.63158V34.2105H0V15.7895H2.63158V10.5263H5.26316V7.89474H7.89474V5.26316H10.5263V2.63158H15.7895V0H34.2105V2.63158H39.4737V5.26316H42.1053V7.89474H44.7368V10.5263H47.3684V15.7895H50Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1915"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_terminal: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M47.619 9.70588V7.35294H45.2381V5H4.7619V7.35294H2.38095V9.70588H0V40.2941H2.38095V42.6471H4.7619V45H45.2381V42.6471H47.619V40.2941H50V9.70588H47.619ZM19.0476 30.8824H16.6667V33.2353H14.2857V35.5882H9.52381V33.2353H11.9048V30.8824H14.2857V28.5294H16.6667V26.1765H19.0476V23.8235H16.6667V21.4706H14.2857V19.1176H11.9048V16.7647H9.52381V14.4118H14.2857V16.7647H16.6667V19.1176H19.0476V21.4706H21.4286V23.8235H23.8095V26.1765H21.4286V28.5294H19.0476V30.8824ZM40.4762 35.5882H21.4286V33.2353H40.4762V35.5882Z" fill="#293648"/></svg>`,
    icon_theme: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2038_1948)"><path d="M39.4634 26.3141V28.944H34.2037V26.3141H28.944V23.6843H26.3141V21.0544H23.6843V18.4246H21.0544V13.1649H18.4246V0.015625H10.535V2.64547H7.90517V5.27532H5.27532V7.90517H2.64547V13.1649H0.015625V34.2037H2.64547V39.4634H5.27532V42.0932H7.90517V44.7231H10.535V47.3529H15.7947V49.9828H34.2037V47.3529H39.4634V44.7231H42.0932V42.0932H44.7231V39.4634H47.3529V36.8335H49.9828V26.3141H39.4634ZM47.3529 34.2037H44.7231V36.8335H42.0932V39.4634H39.4634V42.0932H36.8335V44.7231H31.5738V47.3529H18.4246V44.7231H13.1649V42.0932H10.535V39.4634H7.90517V36.8335H5.27532V31.5738H2.64547V15.7947H5.27532V10.535H7.90517V7.90517H10.535V5.27532H13.1649V2.64547H15.7947V15.7947H18.4246V21.0544H21.0544V23.6843H23.6843V26.3141H26.3141V28.944H31.5738V31.5738H42.0932V28.944H47.3529V34.2037Z" fill="#293648"/></g><defs><clipPath id="clip0_2038_1948"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_close_dark: `<svg width="20" height="20" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.25 12V9.75H7V7.5H4.75V5.25H2.5V3H0.25V0.75H2.5V3H4.75V5.25H7V7.5H9.25V9.75H11.5V12H9.25ZM7 5.25V3H9.25V0.75H11.5V3H9.25V5.25H7ZM2.5 9.75V7.5H4.75V9.75H2.5ZM0.25 12V9.75H2.5V12H0.25Z" fill="#293648"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9 12.25V10H6.75V7.75H5V10H2.75V12.25H0V9.5H2.25V7.25H4.5V5.5H2.25V3.25H0V0.5H2.75V2.75H5V5H6.75V2.75H9V0.5H11.75V3.25H9.5V5.5H7.25V7.25H9.5V9.5H11.75V12.25H9ZM9.25 9.75V7.5H7V5.25H9.25V3H11.5V0.75H9.25V3H7V5.25H4.75V3H2.5V0.75H0.25V3H2.5V5.25H4.75V7.5H2.5V9.75H0.25V12H2.5V9.75H4.75V7.5H7V9.75H9.25V12H11.5V9.75H9.25Z" fill="#293648"/></svg>`,
    icon_close_light: `<svg width="20" height="20" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.25 11.9023V9.65234H7V7.40234H4.75V5.15234H2.5V2.90234H0.25V0.652344H2.5V2.90234H4.75V5.15234H7V7.40234H9.25V9.65234H11.5V11.9023H9.25ZM7 5.15234V2.90234H9.25V0.652344H11.5V2.90234H9.25V5.15234H7ZM2.5 9.65234V7.40234H4.75V9.65234H2.5ZM0.25 11.9023V9.65234H2.5V11.9023H0.25Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M9 12.1523V9.90234H6.75V7.65234H5V9.90234H2.75V12.1523H0V9.40234H2.25V7.15234H4.5V5.40234H2.25V3.15234H0V0.402344H2.75V2.65234H5V4.90234H6.75V2.65234H9V0.402344H11.75V3.15234H9.5V5.40234H7.25V7.15234H9.5V9.40234H11.75V12.1523H9ZM9.25 9.65234V7.40234H7V5.15234H9.25V2.90234H11.5V0.652344H9.25V2.90234H7V5.15234H4.75V2.90234H2.5V0.652344H0.25V2.90234H2.5V5.15234H4.75V7.40234H2.5V9.65234H0.25V11.9023H2.5V9.65234H4.75V7.40234H7V9.65234H9.25V11.9023H11.5V9.65234H9.25Z" fill="white"/></svg>`,
    icon_pdf_reader: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2040_2024)"><path fill-rule="evenodd" clip-rule="evenodd" d="M45 6.00332V8V50H5V0H37H39V2L41 2.00332L40.9998 4.00332H43V6.00332H45ZM37 2H39V4H40.9991L41 6.00332H43V8H37V2ZM8 3H33.9987V11.0032H42V47H8V3Z" fill="white"/><path d="M26.9981 12.0012H10.9981V14.0012H26.9981V12.0012Z" fill="white"/><path d="M32.9981 25.9951H10.9981V27.9951H32.9981V25.9951Z" fill="white"/><path d="M34.9981 15.9953H10.9981V17.9953H34.9981V15.9953Z" fill="white"/><path d="M32.9981 29.9989H10.9981V31.9989H32.9981V29.9989Z" fill="white"/></g><defs><clipPath id="clip0_2040_2024"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_folder: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M28 15H0V41H50V9H28V15ZM31 12V18H3V38H47V12H31Z" fill="white"/></svg>`,
    icon_arrow_down: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.421 41H31.579V33H42.1054V22.3333H50V9L31.579 9V17H18.421V9L1.2659e-06 9L0 22.3333H7.89475V33H18.421V41Z" fill="#293648"/></svg>`,
    icon_arrow_up: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.5789 9H18.4211V17H7.89473V27.6667H0V41H18.4211V33H31.5789V41H50V27.6667H42.1053V17H31.5789V9Z" fill="#293648"/></svg>`,
    icon_arrow_down_light: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.421 41H31.579V33H42.1054V22.3333H50V9L31.579 9V17H18.421V9L1.2659e-06 9L0 22.3333H7.89475V33H18.421V41Z" fill="white"/></svg>`,
    icon_arrow_up_light: `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.579 9L18.421 9V17H7.89475V27.6667H1.2659e-06L0 41H18.421V33H31.579V41H50V27.6667H42.1054V17H31.579V9Z" fill="white"/></svg>`,
    icon_search : `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.7627 2.27344H25.5832V4.73044H12.7627V2.27344Z" fill="#293648"/><path d="M12.7627 32.9844H25.5832V35.4414H12.7627V32.9844Z" fill="#293648"/><path d="M6.93457 4.73047H12.7621V7.18747H6.93457V4.73047Z" fill="#293648"/><path d="M6.93457 30.5273H12.7621V32.9844H6.93457V30.5273Z" fill="#293648"/><path d="M4.60352 7.1875H6.93452V14.5585H4.60352V7.1875Z" fill="#293648"/><path d="M4.60352 23.1562H6.93452V30.5272H4.60352V23.1562Z" fill="#293648"/><path d="M2.27246 13.3281H4.60346V24.3846H2.27246V13.3281Z" fill="#293648"/><path d="M31.4102 7.1875H33.7413V14.5585H31.4102V7.1875Z" fill="#293648"/><path d="M33.7416 35.4433H31.4105V32.9863H25.583V30.5292H31.4105V24.3867H33.7416V30.5292H36.0726V32.9863H38.4035V35.4433H40.7346V37.9004H43.0655V40.3574H45.3966V42.8142H47.7276V47.7283H43.0655V45.2713H40.7346V42.8142H38.4035V40.3574H36.0726V37.9004H33.7416V35.4433Z" fill="#293648"/><path d="M33.7412 13.3281H36.0721V24.3846H33.7412V13.3281Z" fill="#293648"/><path d="M25.583 4.73047H31.4105V7.18747H25.583V4.73047Z" fill="#293648"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12.1936 1.70312H26.1505V4.16012H31.978V6.61712H34.3091V12.7596H36.64V24.9524H34.3091V29.9586H36.64V32.4156H38.9709V34.8727H41.3021V37.3297H43.633V39.7868H45.9641V42.2436H48.295V48.294H42.4966V45.837H40.1657V43.3799H37.8346V40.9231H35.5036V38.4661H33.1727V36.009H30.8416V33.552H26.1505V36.009H12.1936V33.552H6.3661V31.0949H4.0351V24.9524H1.7041V12.7596H4.0351V6.61712H6.3661V4.16012H12.1936V1.70312ZM12.7618 4.72831H6.93428V7.18531H4.60328V13.3278H2.27228V24.3843H4.60328V30.5268H6.93428V32.9838H12.7618V35.4409H25.5823V32.9838H31.4098V35.4409H33.7409V37.8979H36.0718V40.3549H38.4027V42.8118H40.7339V45.2688H43.0648V47.7259H47.7268V42.8118H45.3959V40.3549H43.0648V37.8979H40.7339V35.4409H38.4027V32.9838H36.0718V30.5268H33.7409V24.3843H36.0718V13.3278H33.7409V7.18531H31.4098V4.72831H25.5823V2.27131H12.7618V4.72831ZM25.5823 4.72831H12.7618V7.18531H6.93428V14.5563H4.60328V23.1559H6.93428V30.5268H12.7618V32.9838H25.5823V30.5268H31.4098V24.3843H33.7409V14.5563H31.4098V7.18531H25.5823V4.72831ZM25.0141 5.29649H13.33V7.75349H7.50247V15.1245H5.17147V22.5876H7.50247V29.9586H13.33V32.4156H25.0141V29.9586H30.8416V23.8161H33.1727V15.1245H30.8416V7.75349H25.0141V5.29649Z" fill="#293648"/></svg>`,
    banner_cover : `${prefix}/../assets/images/banner_cover.svg`,
    about_us_cover : `${prefix}/../assets/images/about_us_cover.png`,
    tree_character : `${prefix}/../assets/images/tree_character.png`,
    icon_clock : `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2040_1964)"><path fill-rule="evenodd" clip-rule="evenodd" d="M33.3333 38.889H38.889V33.3333H44.4444V16.6667H38.889V11.1111H33.3333V5.55556H16.6667V11.1111H11.1111V16.6667H5.55556V33.3333H11.1111V38.889H16.6667V44.4444H33.3333V38.889ZM38.889 44.4444V50H11.1111V44.4444H5.55556V38.889H0V11.1111H5.55556V5.55556H11.1111V0H38.889V5.55556H44.4444V11.1111H50V38.889H44.4444V44.4444H38.889Z" fill="#293648"/><path d="M22.2226 22.2206H16.667V27.776H27.778V11.1094H22.2226V22.2206Z" fill="#293648"/></g><defs><clipPath id="clip0_2040_1964"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_link : `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2040_1975)"><path d="M28 0L28 5L37 5V10H32L32 15L27 15V20H22V28L30 28L30 23H35L35 18H40V13H45L45 23H50V0H28Z" fill="#293648"/><path d="M0 5H22V11H6V44H39V28H45V50H0V5Z" fill="#293648"/></g><defs><clipPath id="clip0_2040_1975"><rect width="50" height="50" fill="white"/></clipPath></defs></svg>`,
    icon_calendar : `<svg width="20" height="20" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M47 14H3V45H47V14ZM0 6V48H50V6H46V2H40V6H10V2H4V6H0Z" fill="#293648"/><path d="M15 38V35H12V25H14.9901L15 22H22V25H25V35H22V38H15ZM15 35H22V25H14.9901L15 35Z" fill="#293648"/><path d="M28 38V35H32V25H28V22H35.0098V35H39V38H28Z" fill="#293648"/></svg>`,
    project_logo_1 : `${prefix}/../assets/images/project_logo_1.png`,
    img_robot_1 : `${prefix}/../assets/images/img_robot_1.png`,
    img_robot_2 : `${prefix}/../assets/images/img_robot_2.png`,
    pattern_img_1 : `${prefix}/../assets/images/pattern_img_1.png`,
  },

}

module.exports = light_theme
}).call(this)}).call(this,require('_process'),"/src/node_modules/theme/light_theme")
},{"_process":2,"path":1}],28:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = timeline_card


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)





function timeline_card (opts) {

    const {data} = opts
    // Assigning all the icons
    const {img_src} = data
    const {
        icon_clock,
        icon_link,
        icon_calendar,
    } = img_src


    const el = document.createElement('div')
    el.style.lineHeight = '0px'
    const shadow = el.attachShadow( { mode : 'closed' } )
    
    shadow.innerHTML = `
        <div class="timeline_card">
            <div class="content_wrapper">

                <div class="icon_wrapper">
                    <div> ${icon_calendar} ${opts.date} </div>
                    <div> ${icon_clock} ${opts.time} </div>
                    <div> <a href="${opts.link}">${icon_link}</a> </div>
                </div>

                <div class="title"> ${opts.title} </div>
                <div class="desc"> ${opts.desc}</div>

            </div>
            <div class="tags_wrapper">
                ${opts.tags.map((tag) => `<div class="tag">${tag}</div>`).join('')}
            </div>
        </div>
        <style>${get_theme}</style>
    `


    shadow.adoptedStyleSheets = [sheet]
    return el


}





function get_theme(){
    return`
        *{
            box-sizing: border-box;
        }

        .timeline_card{
            height:max-content;
            width:100%;
            line-height: normal;
            background-color: var(--bg_color);
            color: var(--primary_color) !important;
            border:1px solid var(--primary_color);
            container-type: inline-size;
        }
        .content_wrapper{
            padding:20px;
        }
        .icon_wrapper{
            display:flex;
            gap:20px;
        }
        .icon_wrapper div{
            display:flex;
            gap:5px;
            font-size:16px;
            letter-spacing:-2px;
            align-items:center;
        }
        .icon_wrapper img{
            width: 20px;
            height: 20px;
        }
        .icon_wrapper div:nth-last-child(1){
            margin-left:auto;
        }
        .title{
            margin-top:20px;
            margin-bottom:5px;
            font-size:18px;
            font-weight: 700;
            letter-spacing: -2px;
            line-height:16px;
        }
        .desc{
            font-size:14px;
            letter-spacing:-2px;
            line-height:16px;
        }
        .tags_wrapper{
            display: flex;
            flex-wrap:wrap;
        }
        .tag{
            flex-grow:1;
            min-width:max-content;
            padding:5px 10px;
            border: 1px solid var(--primary_color);
            // line-height:0px;
            text-align:center;
        }
        




        @container(min-width: 856px) {
            
        }


    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/timeline_card")
},{"_process":2,"path":1}],29:[function(require,module,exports){
module.exports = timeline_page

function timeline_page (opts, protocol) {
    const el = document.createElement('div')
    const shadow = el.attachShadow({mode: 'closed'})

    // adding a `main-wrapper` 
    shadow.innerHTML = `
        <div class="main-wrapper">Timeline</div>
        <style>${get_theme()}</style>
    `
    // shadow.adoptedStyleSheets = [sheet]
    return el
}

function get_theme() {
    return ``
}
},{}],30:[function(require,module,exports){
(function (process,__dirname){(function (){
module.exports = window_bar


const path = require('path')
const cwd = process.cwd()
const prefix = path.relative(cwd, __dirname)

const sm_icon_button_alt = require('buttons/sm_icon_button_alt')
const sm_text_button = require('buttons/sm_text_button')


// CSS Boiler Plat
const sheet = new CSSStyleSheet
const theme = get_theme()
sheet.replaceSync(theme)


var id = 0


function window_bar (opts, protocol) {
    const name = `window_bar-${id++}`
    const {data} = opts
    const send = protocol({from: name}, listen)

    // Assigning all the icons
    const {img_src} = data
    const {
        icon_close_light, 
        icon_arrow_down_light, 
        icon_arrow_up_light
    } = img_src


    const el = document.createElement('div')
    el.style.lineHeight = '0px'
    const shadow = el.attachShadow( { mode : 'closed' } )
    
    shadow.innerHTML = `
        <div class="window_bar">
            <div class="application_icon_wrapper"></div>
            <div class="application_name"><span>${opts.name}</span></div>
            <div class="window_bar_actions">
                <div class="actions_wrapper"></div>
            </div>
        </div>
        <style>${get_theme}</style>
    `

    // adding application icon
    const application_icon = sm_icon_button_alt({src:opts.src})
    const application_icon_wrapper = shadow.querySelector('.application_icon_wrapper')
    application_icon_wrapper.append(application_icon)

    // adding close window button
    const window_bar_actions = shadow.querySelector('.window_bar_actions')
    const close_window_btn = sm_icon_button_alt({src:icon_close_light})
    
    // close_window_btn.addEventListener('click', function() {
    //     send( { active_state : 'active' } )
    // });

    close_window_btn.onclick = event => send({
        head: {
            by: name,
            to: 'app_cover_0',
            mid: 0,
        },
        type: 'toggle_active_state', 
        data: {active_state : 'active'} 
    })
    const actions_wrapper = shadow.querySelector('.actions_wrapper')

    if(opts.action_buttons){
        
        // adding additional actions wrapper
        opts.action_buttons.forEach((btn_name) => {
            const button = sm_text_button({text: btn_name})
            actions_wrapper.append(button)
        })

        // adding toggle button for action wrapper
        const actions_toggle_btn = sm_icon_button_alt({
            src: icon_arrow_down_light,
            src_active: icon_arrow_up_light
        }, window_bar_protoocol )
        
        actions_toggle_btn.classList.add('actions_toggle_btn')
        actions_toggle_btn.addEventListener('click', function() {
            // shadow.querySelector('.window_bar_actions').classList.toggle('active');
        });

        window_bar_actions.append(actions_toggle_btn)

    }


    window_bar_actions.append(close_window_btn)


    // window_bar_protoocol
    function window_bar_protoocol(message, send){
        return listen
    }
    function listen (message) {
        const {head, refs, type, data, meta} = message  
        const PROTOCOL = {
            'toggle_window_active_state': toggle_active_state
        }
        const action = PROTOCOL[type] || invalid      
        action(message)
    }
    function invalid (message) { console.error('invalid type', message) }
    async function toggle_active_state (message) {
        const {head, refs, type, data, meta} = message
        const {active_state} = data
        // let actions_wrapper
        ;( active_state)?actions_wrapper.style.display = 'none':actions_wrapper.style.display = 'flex'
    }


    shadow.adoptedStyleSheets = [sheet]
    return el


}





function get_theme(){
    return`
        .window_bar{
            position: relative;
            z-index:2;
            height:30px;
            background-color: var(--primary_color);
            display:inline-flex;
            width:100%;
            justify-content: flex-start;
            background-size: 5px 5px;
            background-image:  repeating-linear-gradient(0deg, var(--bg_color), var(--bg_color) 2px, var(--primary_color) 2px, var(--primary_color));
            container-type: inline-size;
            border: 1px solid var(--primary_color);
            box-sizing: border-box;
        }

        .application_name{
            display:flex;
            align-items:center;
            min-height: 100%;
            width: max-content;
            color:var(--bg_color);
            padding: 0 10px;
            font-size:14px;
            letter-spacing: -1px;
            box-sizing:border-box;
            border: 1px solid var(--primary_color);
            background-color:var(--primary_color);
        }

        .window_bar_actions{
            margin-left: auto;
            display:flex;
        }
        .window_bar_actions.active .actions_wrapper{
            display:flex;
        }
        .actions_wrapper{
            display:none;
            position: absolute;
            flex-direction: column;
            z-index:10;
            width: 100%;
            height:max-content;
            top:30px;
            right:0;
            background-color:var(--bg_color);
            // background-color:red;
            border: 1px solid var(--primary_color);
        }




        @container(min-width: 856px) {
            .actions_toggle_btn{
                display:none;
            }

            .actions_wrapper{
                display: flex !important;
                position: relative;
                flex-direction: row;
                top: unset;
                right: unset;
                height:100%;
                width:max-content;
                border: 0px;
            }
        }


    `
}
}).call(this)}).call(this,require('_process'),"/src/node_modules/window_bar")
},{"_process":2,"buttons/sm_icon_button_alt":14,"buttons/sm_text_button":15,"path":1}]},{},[3]);
