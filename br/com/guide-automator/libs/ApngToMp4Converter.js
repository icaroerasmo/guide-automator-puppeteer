const Util = require('./Util');

module.exports = (fileName, tmpFolder, outputFolder) => {

  let outputPath = `${outputFolder}/video.mp4`;

  return Util.externalCall({
    exec: 'ffmpeg',
    params: [
      '-y',
      '-i', `${tmpFolder}/${fileName}`,
      '-i', `${tmpFolder}/final_audio.wav`,
      '-vsync', '2',
      '-filter:v', '"fps=60"',
      '-vf', `subtitles=${tmpFolder}/subtitles.srt`,
      outputPath
    ]
  });
}