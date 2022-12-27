const fs = require('fs'); // import the 'fs' module to read/write files
const request = require('request'); // import the 'request' module to make HTTP requests
const jsonPretty = require('json-pretty'); // import the 'json-pretty' package

// function to create the JSON file with the specified structure
function createSetJson(setName) {
  const setJson = {
    ClassName: 'Folder',
    Children: []
  };

  // make an HTTP GET request to the API to get the array of cards for the set
  request(`https://db.ygoprodeck.com/api/v7/cardinfo.php?cardset=${setName}`, (error, response, body) => {
    if (error) {
      console.error(error);
      return;
    }

    const cards = JSON.parse(body).data; // parse the 'data' property of the response as an array
    if (!cards || !cards.length) {
      console.error(`No cards found for set: ${setName}`);
      return;
    }

    cards.forEach((card) => {
      // create a new object for each card and add it to the Children array
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
      })

      // add the card's stats as children of the card object
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
              statValue = parseInt(statValue); // convert the value to an integer
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
              statValue = Number(statValue); // convert the value to a number
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

  // add the card object to the Children array of the set object
  setJson.Children.push(cardJson);
});

// pretty-print the set object and write it to a file in the current directory
fs.writeFile(`${setName}.model.json`, jsonPretty(setJson), (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(`${setName}.model.json created successfully`);
});
});
}

// the main function that will be called when the command is run
function main(setName) {
createSetJson(setName);
}

// run the main function with the set name passed as an argument
main(process.argv[2]);