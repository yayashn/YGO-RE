const fs = require('fs');
const request = require('request');

function downloadCardImage(cardId, setName) {
  // Ensure the folder for the set exists
  if (!fs.existsSync(`./${setName}`)) {
    fs.mkdirSync(`./${setName}`);
  }

  const imageUrl = `https://images.ygoprodeck.com/images/cards/${cardId}.jpg`;
  const imageFilePath = `./${setName}/card-${cardId}.jpg`;

  request(imageUrl)
    .on('error', (error) => {
      console.error(`Error downloading image for card ID: ${cardId}`, error);
    })
    .pipe(fs.createWriteStream(imageFilePath))
    .on('finish', () => {
      console.log(`Image downloaded successfully for card ID: ${cardId}`);
    });
}

function main(setName) {
  request(`https://db.ygoprodeck.com/api/v7/cardinfo.php?cardset=${setName}`, (error, response, body) => {
    if (error) {
      console.error(error);
      return;
    }

    const cards = JSON.parse(body).data;
    if (!cards || !cards.length) {
      console.error(`No cards found for set: ${setName}`);
      return;
    }

    cards.forEach((card) => {
      downloadCardImage(card.id, setName);
    });
  });
}

main(process.argv[2]);
