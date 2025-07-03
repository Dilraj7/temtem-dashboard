const fs = require('fs');
const https = require('https');
const path = require('path');

const data = require('./data.json');
const outputDir = path.join(__dirname, 'img');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Node.js script)'
      }
    };

    https.get(url, options, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // 🔁 Redirection → relance la fonction avec l'URL de redirection
        return downloadImage(res.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      }

      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(`Erreur ${res.statusCode} pour ${url}`);
      }
    }).on('error', reject);
  });
}



(async () => {
  for (const temtem of data.rows) {
    const name = temtem.name.toLowerCase();
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    const imageUrl = `https://temtem.wiki.gg/wiki/Special:FilePath/Luma${formattedName}_full_render.png`;
    const filepath = path.join(outputDir, `${name}.png`);

    try {
      console.log(`📥 Téléchargement de ${name}...`);
      await downloadImage(imageUrl, filepath);
      console.log(`✅ ${name}.png sauvegardé.`);
    } catch (err) {
      console.warn(`⚠️ Échec pour ${name}: ${err}`);
    }
  }

  console.log('🎉 Téléchargement terminé.');
})();
