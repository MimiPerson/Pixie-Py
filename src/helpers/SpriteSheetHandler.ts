/**
 * Handles the loading of a sprite sheet image from the given path.
 *
 * @param imgPath - The path to the sprite sheet image.
 * @param frameWidth - The width of each frame in the sprite sheet.
 * @param frameHeight - The height of each frame in the sprite sheet.
 * @returns A promise that resolves to an array of image urls that are the individual frames of the sprite sheet.
 */
function SpriteSheetHandler(
  imgPath: string,
  frameWidth: number,
  frameHeight: number
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const spriteSheet = new Image();
    const imagesURLS: string[] = [];
    spriteSheet.src = imgPath;
    spriteSheet.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      const rows = Math.floor(spriteSheet.height / frameHeight);
      const cols = Math.floor(spriteSheet.width / frameWidth);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          canvas.width = frameWidth;
          canvas.height = frameHeight;
          ctx.clearRect(0, 0, frameWidth, frameHeight);
          ctx.drawImage(
            spriteSheet,
            col * frameWidth,
            row * frameHeight,
            frameWidth,
            frameHeight,
            0,
            0,
            frameWidth,
            frameHeight
          );

          const frame = new Image();
          frame.src = canvas.toDataURL();
          imagesURLS.push(frame.src);
        }
      }
      console.log(imagesURLS);
      resolve(imagesURLS);
    };

    spriteSheet.onerror = (error) => {
      reject(error);
    };
  });
}

export default SpriteSheetHandler;
