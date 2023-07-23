const fs = require('fs');
const https = require('https');

function getCardInfo(setName) {
    return new Promise((resolve, reject) => {
        https.get(`https://db.ygoprodeck.com/api/v7/cardinfo.php?cardset=${setName}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}
async function createSetTs(setName) {
    const cardData = await getCardInfo(setName);
    const cards = cardData.data;

    if (!cards || !cards.length) {
        console.error(`No cards found for set: ${setName}`);
        return;
    }

    const exportData = cards.map(card => ({
        name: card.name,
        art: `rbxgameasset://Images/card-${card.id}`,
        id: card.id,
        type: card.type,
        desc: card.desc,
        atk: card.atk,
        def: card.def,
        level: card.level,
        race: card.race,
        attribute: card.attribute
    }));

    // Replace spaces with underscores in the filename
    const filename = `${setName.replace(/\s/g, '-')}.ts`;

    fs.writeFile(filename, `export default ${JSON.stringify(exportData, null, 2)};\n`, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`${filename} created successfully`);
    });
}

createSetTs(process.argv[2]);