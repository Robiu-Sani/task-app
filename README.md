# CodeBiruni WorkList

CodeBiruni WorkList is an offline-first personal workspace PWA. Tasks, projects, releases, notes, finance entries, contacts, habits, timer data, and settings are stored in the browser's IndexedDB using Dexie.js. No account or server is required.

## Files

- `index.html` — complete application UI and client-side logic
- `manifest.json` — install metadata and icon declarations
- `sw.js` — app-shell caching and network-first caching for CDN dependencies
- `icon.svg` — source vector brand icon
- `icon-192.png` / `icon-512.png` — PNG icons referenced by the manifest; generate these from `icon.svg` using the instructions below

## Run locally

Service workers and install prompts require a secure context. Use `localhost` for development or deploy the folder to an HTTPS static host. Do not open `index.html` directly using a `file://` URL.

For example, with Node.js installed:

```bash
npx serve .
```

Then open the local URL printed by the command. On first online launch, the browser loads the CDN libraries and the service worker caches the app shell. After the first successful load, the app shell can reopen offline. The CDN libraries are also cached after they load successfully once.

## Create the PNG icons

The source `icon.svg` is a scalable vector. Generate both required PNG sizes with ImageMagick:

```bash
magick -background none icon.svg -resize 192x192 icon-192.png
magick -background none icon.svg -resize 512x512 icon-512.png
```

Or open `icon.svg` in Inkscape and use **File → Export** to export PNG at 192 × 192 and 512 × 512 pixels. Save the files beside `index.html` with the exact names `icon-192.png` and `icon-512.png`.

## Offline and backups

- App records persist locally in IndexedDB on the browser/device that created them.
- Use **Settings → Export full backup** to download a JSON backup.
- Use **Settings → Restore from a WorkList JSON backup** to merge a backup by record ID. Export a fresh backup before restoring.
- Clearing browser site data can delete the local database, so keep backups somewhere safe.

## Privacy and security notes

- Project credentials are stored locally in browser storage, not encrypted by this application. Do not save high-value production secrets on shared or untrusted devices.
- Tailwind CSS, Lucide, and Dexie are loaded from CDNs. The service worker caches these dependencies after they have loaded successfully online; a first-time offline visit cannot download uncached libraries.
- The service worker cannot cache a cross-origin CDN response unless the browser permits the request and the request succeeds.
