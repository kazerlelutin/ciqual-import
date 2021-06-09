(async () => {
  (fs = require("fs")),
    (request = require("request")),
    (convert = require("xml-js")),
    (unzipper = require("unzipper")),
    (zipPath = "./zip.zip"),
    (folderPath = "./unzip"),
    (url =
      "https://www.data.gouv.fr/fr/datasets/r/e31dd87c-8ad0-43e4-bdaa-af84ad243dc6");

  //delete old files
  fs.access(folderPath, (err) => {
    if (!err) {
      fs.readdir(folderPath, (err, files) => {
        files.forEach((file) => {
          fs.unlink(folderPath + "/" + file, () =>
            console.log(file + " delete")
          );
        });
      });
    }
  });

  //donwload and save file, and dezip
  request
    .get(url)
    .pipe(fs.createWriteStream(zipPath))
    .on("close", () => {
      fs.createReadStream(zipPath)
        .pipe(
          unzipper.Extract({
            path: folderPath,
          })
        )
        .on("close", () => {
          fs.unlink(zipPath, () => console.log("delete archive"));
          console.log("file unziped");

          fs.readdir(folderPath, async (err, files) => {
            files.forEach((file) => {
              fs.readFile(folderPath + "/" + file, async (error, data) => {
                
                try {
                  await fs.writeFileSync(
                    folderPath + "/" + file.replace("xml", "json"),
                    convert.xml2json(data)
                  );
                } catch (e) {
                  console.log(e);
                }
                await fs.unlink(folderPath + "/" + file, () =>
                  console.log(file + " delete")
                );
              });
            });
          });

          /*
            - save le json dans une base
            */
        });
    });
})();
