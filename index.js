/**
 * Create a new [Mapbox GL JS plugin](https://www.mapbox.com/blog/build-mapbox-gl-js-plugins/) that
 * modifies the layers of the map style to use the 'text-field' that matches the browser language.
 * @constructor
 * @param {object} options - Options to configure the plugin.
 * @param {string[]} [options.supportedLanguages] - List of supported languages
 * @param {string} [options.defaultLanguage] - Name of the default language to initialize style after loading.
 * @param {string[]} [options.excludedLayerIds] - Name of the layers that should be excluded from translation.
 *
 * ==ClosureCompiler==
 * @compilation_level SIMPLE_OPTIMIZATIONS
 * ==/ClosureCompiler==
 */
function MapboxLanguage(options) {
  options = Object.assign({}, options);
  if (!(this instanceof MapboxLanguage)) {
    throw new Error('MapboxLanguage needs to be called with the new keyword');
  }

  this._initialStyleUpdate = this._initialStyleUpdate.bind(this);

  this._defaultLanguage = options.defaultLanguage;
  this._excludedLayerIds = options.excludedLayerIds || [];
  this.supportedLanguages = options.supportedLanguages || ['ar', 'en', 'es', 'fr', 'de', 'ja', 'ko', 'pt', 'ru', 'zh', 'zh-CN', 'zh-TW', 'zh-HK'];
}

function browserLanguage(supportedLanguages) {
  var language = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
  var parts = language.split('-');
  var languageCode = language;
  if (parts.length > 1 && 'zh' !== parts[0]) {
    languageCode = parts[0];
  }

  if (supportedLanguages.indexOf(languageCode) > -1) {
    return languageCode;
  }
  return null;
}

function filterTextFiled(field, languageField) {
  if (field.stops) {
    var hasLanguageTextField = false;
    var stop;
    for (var i = 0; i < field.stops.length; i++) {
      stop = field.stops[i]
      if (isLanguageTextField(stop[1])) {
        hasLanguageTextField = true;
        break;
      }
    }
    if (hasLanguageTextField) {
      return languageField;
    }
  } else if (isLanguageTextField(field)) {
    return languageField;
  }
  return field;
}

function isLanguageTextField(field) {
  if (field instanceof Array && 'get' === field[0]) {
    field = field[1];
  }
  if (typeof field === 'string' && /^\{?name/.test(field)) {
    return true;
  }
  if (field instanceof Array) {
    var hasLanguageTextField = false;
    for (var i = 0; i < field.length; i++) {
      if (isLanguageTextField(field[i])) {
        hasLanguageTextField = true;
      }
    }
    return hasLanguageTextField;
  }
  return false;
}

function changeLayerTextProperty(layer, languageField, excludedLayerIds) {
  var newLayerData;
  // 此处覆盖的filter与官方不同，会导致省界被绘制两遍
  //   if ([
  //       'admin-0-boundary',
  //       'admin-1-boundary',
  //       'admin-0-boundary-disputed',
  //       'admin-1-boundary-bg',
  //       'admin-0-boundary-bg'
  //     ].indexOf(layer.id) > -1
  //   ) {
  //     newLayerData = {
  //       filter: [
  //         'match',
  //         ['get', 'worldview'],
  //         ['all', 'CN'],
  //         true,
  //         false
  //       ]
  //     };
  //   }

  if (layer.layout && layer.layout['text-field'] && excludedLayerIds.indexOf(layer.id) === -1) {
    var textField = filterTextFiled(layer.layout['text-field'], languageField);
    newLayerData = newLayerData || {};
    newLayerData.layout =  Object.assign({}, layer.layout, {
      "text-line-height": 1.35,
      'text-field': textField
    });
  }

  return newLayerData ? Object.assign({}, layer, newLayerData) : layer;
}

function getLanguageTextField(language) {
  var zhSubName;
  if (0 === language.indexOf('zh')) {
    zhSubName = ('zh-TW' === language || 'zh-HK' === language)  ? 'Hant' : 'Hans';
    language = 'zh';
  }
  var _styleExpressAny = ['any'],
    _styleExpressCoalesce = ['coalesce'],
    languageNames = [
      'name_' + language,
      'name:' + language
    ];

  if (zhSubName) {
    languageNames.unshift('name_zh-' + zhSubName);
  }

  for (var i = 0; i < languageNames.length; i++) {
    _styleExpressAny.push(['has', languageNames[i]]);
    _styleExpressCoalesce.push(['get', languageNames[i]]);
  }

  _styleExpressCoalesce = [
    'case',
    ['==', _styleExpressCoalesce, '中華民國'], '台灣',
    ['==', _styleExpressCoalesce, '中華民国'], '台灣',
    _styleExpressCoalesce
  ];

  var textField = [
    'case',

    // If the point's languages don't contain current map language, then only show the point's local language name.
    [
      '!',
      _styleExpressAny
    ],
    ['get', 'name'], 

    // If the point's local language name is the same to current map language, then only show the point's local language name.
//     [
//       'all',
//       _styleExpressAny,
//       [
//         'any',
//         [
//           '==', 
//           _styleExpressCoalesce,
//           ['get', 'name']
//         ],
//         [
//           'in', 
//           _styleExpressCoalesce,
//           ['get', 'name']
//         ],
//         [
//           'in', 
//           ['get', 'name'],
//           _styleExpressCoalesce
//         ]
//       ]
//     ],
    _styleExpressCoalesce,
    // 不要添加额外的本地语言地名

    // Default: 
    // If the point's local language name is not the same to current map language, 
    // then show both current map language and the point's local language name.
//     [
//       'format', 
//       _styleExpressCoalesce, {},
//       '\n', {},
//       ['get', 'name'], {"font-scale": 0.8}
//     ]
  ];

  return textField;
}

/**
 * Explicitly change the language for a style.
 * @param {string} language - The language iso code
 * @returns {object} the modified style
 */
MapboxLanguage.prototype.setLanguage = function (language) {
  if (this.supportedLanguages.indexOf(language) < 0) {
    throw new Error('Language ' + language + ' is not supported');
  }
  var style = this._mapStyle;
  var excludedLayerIds = this._excludedLayerIds;
  var changedLayers = style.layers.map(function (layer) {
    var languageTextField = getLanguageTextField(language);
    return changeLayerTextProperty(layer, languageTextField, excludedLayerIds);
  });

  var languageStyle = Object.assign({}, style, {
    layers: changedLayers
  });

  this.currentLanguage = language;
  this._map.setStyle(languageStyle);
};

MapboxLanguage.prototype._initialStyleUpdate = function (e) {
  this._mapStyle = this._map.getStyle();
  var language = this.currentLanguage || this._defaultLanguage || browserLanguage(this.supportedLanguages);
  this.setLanguage(language);
};

MapboxLanguage.prototype.onAdd = function (map) {
  this._map = map;
  this._map.on('style.load', this._initialStyleUpdate);
  this._container = document.createElement('div');
  return this._container;
};

MapboxLanguage.prototype.onRemove = function () {
  this._map.off('style.load', this._initialStyleUpdate);
  this._map = undefined;
};

function ie11Polyfill() {
  if (typeof Object.assign != 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, 'assign', {
      // eslint-disable-next-line no-unused-vars
      value: function assign(target, varArgs) { // .length of function is 2
        // eslint-disable-next-line strict
        'use strict';
        if (target === null) { // TypeError if undefined or null
          throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];

          if (nextSource !== null) { // Skip over if undefined or null
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = MapboxLanguage;
} else {
  ie11Polyfill();
  window.MapboxLanguage = MapboxLanguage;
}
