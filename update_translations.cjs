const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src/locales');
const languages = fs.readdirSync(localesDir).filter(file => fs.statSync(path.join(localesDir, file)).isDirectory());

const aboutUsData = {
    "title": "About Us",
    "learnMore": "Learn more about Kosalai",
    "intro1": "Welcome to Kosalai, a trusted digital marketplace dedicated to connecting buyers and sellers of livestock, pets, birds, and other animals across India. Our platform is designed to make animal trading simple, transparent, and reliable by bringing farmers, breeders, livestock owners, and animal enthusiasts together in one place.",
    "intro2": "At Kosalai, we believe that trust is the foundation of every successful transaction. We provide a secure and user-friendly environment where sellers can showcase their animals and buyers can discover quality livestock with confidence. Whether you are looking for cows, calves, goats, sheep, poultry, pets, or other animals, Kosalai helps you find the right match quickly and easily.",
    "missionTitle": "Our Mission",
    "missionDesc": "Our mission is to simplify the process of buying and selling animals by leveraging technology to connect genuine buyers and sellers directly. We aim to reduce barriers, improve accessibility, and create opportunities for livestock owners across both rural and urban communities.",
    "visionTitle": "Our Vision",
    "visionDesc": "Our vision is to empower farmers, breeders, and animal owners through a trusted digital ecosystem that promotes transparency, fair trade, and sustainable growth. By embracing innovation and building strong community connections, we aspire to become India's most reliable marketplace for livestock and animal trading.",
    "outro": "At Kosalai, we are committed to creating a platform where every transaction is built on trust, convenience, and confidence."
};

languages.forEach(lang => {
    const filePath = path.join(localesDir, lang, 'translation.json');
    if (fs.existsSync(filePath)) {
        let content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        content['aboutUs'] = aboutUsData;
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
        console.log(`Updated ${lang}/translation.json`);
    }
});
