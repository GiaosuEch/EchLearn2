const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, '../src/services/mediaDiscoveryService.ts');
const pagePath = path.join(__dirname, '../src/pages/app/media/MusicPodcastLabPage.tsx');
let issues = 0;

for (const file of [servicePath, pagePath]) {
  if (!fs.existsSync(file)) {
    console.error(`FAIL missing ${file}`);
    issues++;
  }
}

if (!issues) {
  const service = fs.readFileSync(servicePath, 'utf8');
  const page = fs.readFileSync(pagePath, 'utf8');
  const checks = [
    ['Spotify PKCE login present', /startSpotifyPkceLogin/.test(service) && /code_challenge_method/.test(service)],
    ['No client secret in frontend', !/client_secret|SPOTIFY_CLIENT_SECRET/i.test(service + page)],
    ['Curated media fallback exists', /getCuratedMedia/.test(service) && /languageQueries/.test(service)],
    ['Music and podcast categories exist', /kind: 'song'/.test(service) && /kind: 'podcast'/.test(service)],
    ['UI route page exists', /MusicPodcastLabPage/.test(page)],
    ['Missing client id message exists', /spotifyNoKey/.test(page)],
  ];
  for (const [label, ok] of checks) {
    if (ok) console.log(`PASS ${label}`);
    else { console.error(`FAIL ${label}`); issues++; }
  }
}

if (issues) process.exit(1);
console.log('PASS music integration verification complete');
