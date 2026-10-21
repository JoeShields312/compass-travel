Compass
A cinematic, interactive 3D globe travel dashboard built with HTML, CSS, JavaScript, and Three.js.

Run locally
From this folder, run:

python -m http.server 8000
Open http://localhost:8000 in a modern browser with WebGL support. Serve the files over HTTP; opening index.html directly will prevent JavaScript modules from loading. No build step or npm dependencies are required.

Upload to GitHub
Extract the ZIP and upload the contents of the compass folder to your repository root. Keep the assets folder and its structure intact. The included .nojekyll file makes this a straightforward static GitHub Pages project; configure Pages to serve the repository root from your chosen branch.

Files
index.html: dashboard markup and Explore dialog
style.css: layout, typography, and animations
app.js: globe rendering, travel data, and interactions
assets/three.js: vendored Three.js module
assets/destination-photos.js: embedded destination photos
assets/: Earth textures, icon, and original destination photos
assets/destinations/credits.json: photo source and credit information
Editing
Destination data lives in the cities array near the top of app.js. Prices and weather are illustrative, not live booking or forecast data. Temperatures are stored in Celsius and displayed in Fahrenheit.

Google Fonts are loaded online; the browser uses fallback fonts when unavailable. Globe textures, Three.js, and destination images are bundled locally. No API keys or backend are required.

Third-party assets
Three.js includes its MIT license attribution in assets/three.js. Photo credits and source license links are preserved in assets/destinations/credits.json. Third-party assets retain their original licenses.
