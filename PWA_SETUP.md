# Progressive Web App (PWA) Setup

## Overview
Francine's Corner is now configured as a Progressive Web App (PWA), which means it can be installed on devices and work offline!

## Features
- ✅ **Installable**: Can be installed on desktop and mobile devices
- ✅ **Offline Support**: Service worker caches assets for offline use
- ✅ **App-like Experience**: Runs in standalone mode without browser UI
- ✅ **Custom Icon**: Displays with a custom app icon

## How to Install

### On Desktop (Chrome/Edge)
1. Visit the app in your browser
2. Look for the install icon in the address bar (or three-dot menu)
3. Click "Install" or "Add to desktop"
4. The app will open in its own window

### On Mobile (iOS Safari)
1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Name the app and tap "Add"

### On Mobile (Android Chrome)
1. Open the app in Chrome
2. Tap the three-dot menu
3. Tap "Add to Home Screen" or "Install app"
4. Confirm the installation

## Files Added/Modified

### New Files:
- `public/manifest.json` - PWA manifest configuration
- `public/service-worker.js` - Service worker for offline caching
- `public/icon.svg` - App icon (SVG format)
- `src/serviceWorkerRegistration.js` - Service worker registration logic

### Modified Files:
- `public/index.html` - Added PWA meta tags and manifest link
- `src/index.js` - Enabled service worker registration

## Icon Customization

The app currently uses an SVG icon. To create optimized PNG icons:

1. Use an online tool like https://realfavicongenerator.net/
2. Upload the `public/icon.svg` file
3. Generate 192x192 and 512x512 PNG icons
4. Save them as `icon-192.png` and `icon-512.png` in the `public` folder
5. Update `manifest.json` to reference the PNG files instead of SVG

## Testing PWA Functionality

1. **Build for production**: `npm run build`
2. **Serve the build**: `npx serve -s build`
3. **Open in browser**: Visit http://localhost:3000
4. **Check PWA features**: Use Chrome DevTools > Application tab > Manifest

## Deployment

When deploying to production (GitHub Pages, Netlify, etc.), the PWA features will automatically work. Make sure to:
- Use HTTPS (required for service workers)
- Deploy the `build` folder
- Ensure all paths in `manifest.json` are correct

## Offline Functionality

The service worker caches:
- Main HTML file
- CSS bundles
- JavaScript bundles
- Images (cached on first visit)

Users can access the app even without an internet connection after the first visit!
