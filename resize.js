const sharp = require("sharp")

async function getMetaData(){
    try {
        const meta = await sharp("sammy.png").metadata();
        console.log(meta);
    } catch (error) {
        console.log(error);
    }
}

const resize = async (data, image) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(data, image);
        const imageFinal = await sharp(image.path)
          .resize({
            width: parseInt(data.width),
            height: parseInt(data.height),
          })
          .toFormat("jpeg", { mozjpeg: true })
          .toFile(
            `./image/${data.name}.jpeg`);
        resolve({
          message: "Successfully resized",
          file: `./image/${data.name}.jpeg`,
        });
      } catch (error) {
        reject(error);
      }
    });
  };
  

module.exports = {
    resize
}