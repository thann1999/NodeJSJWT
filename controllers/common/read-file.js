const { FILE_TYPES } = require('../../utils/file-column-type');
const csv = require('csv-parser');
const fs = require('fs');

async function readFileByPath(path) {
  return new Promise((resolve, reject) => {
    const fileType = path.split('.');

    //read file content to json
    const results = [];
    fileType[fileType.length - 1] === FILE_TYPES.CSV
      ? fs
          .createReadStream(path, 'utf8')
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => {
            resolve(results);
          })
      : fs.readFile(path, 'utf8', (err, data) => {
          if (err) reject(err);
          resolve(JSON.parse(data));
        });
  });
}

module.exports = {
  readFileByPath: readFileByPath,
};
