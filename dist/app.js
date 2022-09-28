(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    var val = aliases[name];
    return (val && name !== val) ? expandAlias(val) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("src/helpers/queryFormatter.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function queryFormatter(data) {
    return Object.keys(data).map(function (key) {
        return key + '=' + data[key];
    }).join('&');
}

exports.queryFormatter = queryFormatter;
});

;require.register("src/stores/modules/auth/index.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _actions;

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _queryFormatter = require('../../../helpers/queryFormatter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var state = {
    token: null
};

var mutations = {
    UPDATE_TOKEN: function UPDATE_TOKEN(state, payload) {
        localStorage.setItem('token', payload);
        state.token = payload;
    }
};

var actions = (_actions = {
    register: function register(payload) {
        return (0, _axios2.default)({
            method: 'POST',
            url: '/api/auth/register',
            data: (0, _queryFormatter.queryFormatter)(payload),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    },
    changePassword: function changePassword(_ref, payload) {
        var commit = _ref.commit;

        return (0, _axios2.default)({
            method: 'POST',
            url: '/api/auth/change-password',
            data: (0, _queryFormatter.queryFormatter)(payload),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (response) {
            commit('UPDATE_TOKEN', response.data.token);
        });
    },
    requestNewPassword: function requestNewPassword(_ref2, payload) {
        var commit = _ref2.commit;

        return (0, _axios2.default)({
            method: 'POST',
            url: '/api/auth/request-new-password',
            data: (0, _queryFormatter.queryFormatter)(payload),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    },
    restorePassword: function restorePassword(_ref3, payload) {
        var commit = _ref3.commit;

        return (0, _axios2.default)({
            method: 'POST',
            url: '/api/auth/restore-password',
            data: (0, _queryFormatter.queryFormatter)(payload),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (response) {
            commit('UPDATE_TOKEN', response.data.token);
        });
    },
    generateNewToken: function generateNewToken(_ref4, payload) {
        var commit = _ref4.commit;

        return (0, _axios2.default)({
            method: 'POST',
            url: '/api/auth/generate-new-token',
            data: (0, _queryFormatter.queryFormatter)(payload),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (response) {
            commit('UPDATE_TOKEN', response.data.token);
        });
    }
}, _defineProperty(_actions, 'register', function register(_ref5, payload) {
    var commit = _ref5.commit;

    return (0, _axios2.default)({
        method: 'POST',
        url: '/api/auth/register',
        data: (0, _queryFormatter.queryFormatter)(payload),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (response) {
        commit('UPDATE_TOKEN', response.data.token);
    });
}), _defineProperty(_actions, 'login', function login(_ref6, payload) {
    var commit = _ref6.commit;

    return (0, _axios2.default)({
        method: 'POST',
        url: '/api/login',
        data: (0, _queryFormatter.queryFormatter)(payload),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (response) {
        commit('UPDATE_TOKEN', response.data.token);
    });
}), _defineProperty(_actions, 'getToken', function getToken(_ref7) {
    var commit = _ref7.commit;

    var token = localStorage.getItem('token');
    if (token) {
        commit('UPDATE_TOKEN', token);
    }
}), _defineProperty(_actions, 'logout', function logout(_ref8) {
    var commit = _ref8.commit;

    commit('UPDATE_TOKEN', null);
    localStorage.removeItem('token');
}), _actions);

var getters = {
    token: function token(state) {
        return state.token;
    }
};

var authModule = {
    state: state,
    mutations: mutations,
    actions: actions,
    getters: getters
};

exports.default = authModule;
});

require.register("src/stores/modules/main/index.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var state = {
    isLoading: false,
    showEditSpecificPopup: false,
    pageTitle: '2022'
};

var mutations = {
    LOADING: function LOADING(state, isLoading) {
        state.isLoading = isLoading;
    },
    EDIT_SPECIFIC_POPUP: function EDIT_SPECIFIC_POPUP(state, showEditSpecificPopup) {
        state.showEditSpecificPopup = showEditSpecificPopup;
    }
};

var actions = {
    setTitle: function setTitle(_ref, title) {
        var commit = _ref.commit;

        if (title === '2022') {
            document.title = '2022';
        } else {
            document.title = title + ' · 2022';
        }
        state.pageTitle = title;
    },
    buildCache: function buildCache(asdf, token) {
        _axios2.default.post('/api/admin/build-cache?token=' + token);
    }
};

var getters = {
    loading: function loading(state) {
        return state.isLoading;
    },
    showEditSpecificPopup: function showEditSpecificPopup(state) {
        return state.showEditSpecificPopup;
    },
    pageTitle: function pageTitle(state) {
        return state.pageTitle;
    }
};

var mainModule = {
    state: state,
    mutations: mutations,
    actions: actions,
    getters: getters
};

exports.default = mainModule;
});

require.register("src/stores/modules/months/index.js", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _queryFormatter = require('../../../helpers/queryFormatter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var state = {
  entries: [],
  editingEntry: {},
  editingGallery: {}
};

var mutations = {
  UPDATE_EDITING_ENTRY: function UPDATE_EDITING_ENTRY(state, payload) {
    state.editingEntry = payload;
  },
  UPDATE_ENTRIES: function UPDATE_ENTRIES(state, payload) {
    state.entries = payload;
  },
  UPDATE_EDITING_GALLERY: function UPDATE_EDITING_GALLERY(state, payload) {
    state.editingGallery = payload;
  }
};

var actions = {
  getEntries: function getEntries(_ref) {
    var commit = _ref.commit;

    _axios2.default.get('/api/entries').then(function (response) {
      commit('UPDATE_ENTRIES', response.data);
    });
  },
  updateEntry: function updateEntry(_ref2, payload) {
    var commit = _ref2.commit;

    commit('UPDATE_EDITING_ENTRY', payload.entry);
  },
  saveEntry: function saveEntry(_ref3, token) {
    var commit = _ref3.commit;

    var data = {
      token: token,
      content: btoa(getters.editingEntry(state).raw_content),
      entry: getters.editingEntry(state).id
    };
    return (0, _axios2.default)({
      method: 'post',
      url: '/api/admin/entry/edit',
      data: (0, _queryFormatter.queryFormatter)(data),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  getEntry: function getEntry(_ref4, payload) {
    var commit = _ref4.commit;

    return _axios2.default.get('/api/admin/entry/edit?entry=' + payload.entry + '&token=' + payload.token).then(function (response) {
      commit('UPDATE_EDITING_ENTRY', response.data);
    });
  },
  deleteEntry: function deleteEntry(_ref5, payload) {
    var commit = _ref5.commit;

    return _axios2.default.delete('/api/admin/entry/delete?' + (0, _queryFormatter.queryFormatter)(payload));
  },
  loadImagesForEntry: function loadImagesForEntry(_ref6, payload) {
    var commit = _ref6.commit;

    return _axios2.default.get('/api/admin/entry/images/load?entry=' + payload.entry).then(function (response) {
      commit('UPDATE_EDITING_GALLERY', response.data.images);
    });
  }
};

var getters = {
  entries: function entries(state) {
    return state.entries;
  },
  editingEntry: function editingEntry(state) {
    return state.editingEntry;
  },
  gallery: function gallery(state) {
    return state.editingGallery;
  }
};

var monthsModule = {
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
};

exports.default = monthsModule;
});

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map