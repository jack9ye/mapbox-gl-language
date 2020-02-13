# Mapbox GL Language

Adds support for switching the language of your map style in [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js/) maps.

This is an improved version of [Mapbox GL Language](https://github.com/mapbox/mapbox-gl-language/).

## Addition features

- Works with Mapbox Streets v7 & v8 vector tile styles.
- Works with [OpenMapTiles' styles](https://github.com/openmaptiles/osm-bright-gl-style).
- The map shows both point's name of current map language and the point's local language,
- If the point's local language name is the same to current map language, then only show the point's local language name.
- Changing the map's style won't reset the language.

## Supported Styles

This plugin works with official Mapbox styles and [OpenMapTiles' styles](https://github.com/openmaptiles/osm-bright-gl-style):

Mapbox Streets v8 Vector Tile Styles
- `mapbox://styles/mapbox/streets-v11`
- `mapbox://styles/mapbox/outdoors-v11`
- `mapbox://styles/mapbox/dark-v10`
- `mapbox://styles/mapbox/light-v10`
- `mapbox://styles/mapbox/satellite-streets-v11`
- `mapbox://styles/mapbox/traffic-day-v4`
- `mapbox://styles/mapbox/traffic-night-v4`

Mapbox Streets v7 Vector Tile Styles
- `mapbox://styles/mapbox/streets-v10`
- `mapbox://styles/mapbox/outdoors-v10`
- `mapbox://styles/mapbox/dark-v9`
- `mapbox://styles/mapbox/light-v9`
- `mapbox://styles/mapbox/satellite-streets-v9`
- `mapbox://styles/mapbox/traffic-day-v2`
- `mapbox://styles/mapbox/traffic-night-v2`

Check the demo: http://coocy.github.io/mapbox-gl-language/example/

![Multiple language supported with style transforms](https://user-images.githubusercontent.com/2136111/74450431-00f20a00-4eb9-11ea-848e-1ae2d9b46524.gif)

## Usage

**mapbox-gl-language** is a [Mapbox GL JS plugin](https://www.mapbox.com/blog/build-mapbox-gl-js-plugins/) that you can easily add on top of your map.

**Example**

```javascript
mapboxgl.accessToken = 'YOUR_ACCESS_TOKEN';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-77.0259, 38.9010],
    zoom: 9
});

var language = new MapboxLanguage();
map.addControl(language);
```

Check `examples/` for usage example.

## API


### MapboxLanguage

Create a new [Mapbox GL JS plugin](https://www.mapbox.com/blog/build-mapbox-gl-js-plugins/) that
modifies the layers of the map style to use the 'text-field' that matches the browser language.

**Parameters**

-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Options to configure the plugin.
    -   `options.supportedLanguages` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>?** List of supported languages. Default: ['ar', 'en', 'es', 'fr', 'de', 'ja', 'ko', 'pt', 'ru', 'zh', 'zh-CN', 'zh-TW', 'zh-HK']
    -   `options.defaultLanguage` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)?** Name of the default language to initialize style after loading. Default: auto match the browser language.
    -   `options.excludedLayerIds` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)?** Name of the layers that should be excluded from translation.

#### setLanguage

Explicitly change the map's language.

**Parameters**

-   `language` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The language iso code
