const fs = require('fs');
const request = require('request');
const jsonPretty = require('json-pretty');

function createSetJson(setName) {
  const setJson = {
    ClassName: 'Folder',
    Children: []
  };

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
      const cardJson = {
        ClassName: 'Folder',
        Name: card.name,
        Children: []
      };
      cardJson.Children.push({
        ClassName: 'StringValue',
        Name: 'art',
        Properties: {
          Value: `rbxgameasset://Images/card-${card.id}`
        }
      });

      Object.entries(card).forEach(([statName, statValue]) => {
        let wrongStat = false;
        if (statValue === undefined) {
          return;
        }
        let statClass;
        switch (statName) {
          case 'id':
          case 'level':
            statClass = 'IntValue';
            statValue = parseInt(statValue);
            break;
          case 'type':
          case 'desc':
          case 'race':
          case 'attribute':
            statClass = 'StringValue';
            break;
          case 'atk':
          case 'def':
            statClass = 'NumberValue';
            statValue = Number(statValue);
            break;
          default:
            wrongStat = true;
            break;
        }
        if (!wrongStat) {
          cardJson.Children.push({
            ClassName: statClass,
            Name: statName,
            Properties: {
              Value: statValue
            }
          });
        }
      });

      setJson.Children.push(cardJson);

      // Download the card image
      downloadCardImage(card.id);
    });

    fs.writeFile(`${setName}.model.json`, jsonPretty(setJson), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`${setName}.model.json created successfully`);
    });
  });
}

// Function to download the card image
function downloadCardImage(cardId) {
  const imageUrl = `https://images.ygoprodeck.com/images/cards/${cardId}.jpg`;
  const imageFilePath = `./Images/card-${cardId}.jpg`;

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
  createSetJson(setName);
}

main(process.argv[2]);