const express = require("express");
const fs = require("fs-extra");
const app = express();
const port = 3000;

app.get("/", async (req: any, res: any) => {
  console.log("new req incoming:", req.query);

  // set variables from query parameters
  const filename = req.query.filename as string;
  const dihaoString = req.query.dihao;

  // parse dihao to array
  const dihao = dihaoString.split(",");

  // return error is filename or dihao is not set
  if (!filename || !dihao) {
    res.send("Error: filename or dihao is not set");
  }

  // parse the variables
  // if the filename is less than 4 digits, add leading zeros
  // e.g. 1234 -> 1234
  // const filenameWithLeadingZeros = filename.padStart(4, "0");
  const filepath = `./data/lingbianjson/t_${filename}.json`;

  // parse the file to json and save it to a variable
  await fs.readJson(filepath).then((json: any) => {
    let newJson = json;

    let removeList = <number[]>[];
    // append the index of features to removeList if the parcel number is not in dihao
    newJson.features.forEach((feature: any, index: number) => {
      if (!dihao.includes(feature.properties["PARCELNO"])) {
        removeList.push(index);
      }
    });

    // tell which dihao is not in the features list
    dihao.forEach((dihao: string) => {
      if (
        !newJson.features.some(
          (feature: any) => feature.properties["PARCELNO"] === dihao
        )
      ) {
        console.log("dihao not found:", dihao);
      }
    });

    // console.log("removeList", removeList)
    // console.log("newJson.features.length", newJson.features.length)
    // remove the features from newJson.features if they are in removeList (loop backwards)
    for (let i = removeList.length - 1; i >= 0; i--) {
      newJson.features.splice(removeList[i], 1);
    }

    // console.log("newJson.features.length", newJson.features.length)
    res.send(newJson);
    console.log("response sent");
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
