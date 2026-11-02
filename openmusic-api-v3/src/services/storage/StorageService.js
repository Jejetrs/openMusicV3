const fs = require('fs');
const path = require('path');

class StorageService {
  constructor(folder = path.resolve(__dirname, '../../../uploads')) {
    this._folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, meta) {
    const filename = +new Date() + path.extname(meta.filename);
    const filePath = path.join(this._folder, filename);

    const fileStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => {
        const url = `http://${process.env.HOST}:${process.env.PORT}/uploads/${filename}`;
        console.log('File uploaded successfully:', url);
        resolve(url);
      });
    });
  }
}

module.exports = StorageService;
