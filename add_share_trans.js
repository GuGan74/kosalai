const fs = require('fs');
const path = require('path');

const locales = {
  en: "Share Listing",
  ta: "பகிர்க",
  hi: "शेयर करें",
  te: "షేర్ చేయండి",
  ml: "ഷെയർ ചെയ്യുക",
  kn: "ಶೇರ್ ಮಾಡಿ"
};

for (const [lang, text] of Object.entries(locales)) {
  const p = path.join(__dirname, 'src/locales', lang, 'translation.json');
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (data.listingDetail) {
      data.listingDetail.shareListing = text;
      fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
      console.log(`Updated ${lang}`);
    }
  }
}
