# Compass

A cinematic, interactive 3D globe travel dashboard built with HTML, CSS, JavaScript, and Three.js.

## Files

- `index.html`: dashboard markup and Explore dialog
- `style.css`: layout, typography, and animations
- `app.js`: globe rendering, travel data, and interactions
- `assets/three.js`: vendored Three.js module
- `assets/destination-photos.js`: embedded destination photos
- `assets/`: Earth textures, icon, and original destination photos
- `assets/destinations/credits.json`: photo source and credit information

## Editing

Destination data lives in the `cities` array near the top of app.js. Prices and weather are illustrative, not live booking or forecast data. Temperatures are stored in Celsius and displayed in Fahrenheit.

Google Fonts are loaded online; the browser uses fallback fonts when unavailable. Globe textures, Three.js, and destination images are bundled locally. No API keys or backend are required.

## Third-party assets

Three.js includes its MIT license attribution in assets/three.js. Photo credits and source license links are preserved in assets/destinations/credits.json. Third-party assets retain their original licenses.
