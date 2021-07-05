const fs = require('fs');
const Util = require('./Util');
const { 
  FINAL_VIDEO_NAME,
  FINAL_VIDEO_FORMAT,
  FINAL_AUDIO_NAME,
  FINAL_AUDIO_FORMAT,
  SUBTITLES_NAME } = require('./Constants');

module.exports = (tmpVideoName, tmpFolder, outputFolder) => {

  let outputPath = `${outputFolder}/${FINAL_VIDEO_NAME}.${FINAL_VIDEO_FORMAT}`;
  let audioPath = `${tmpFolder}/${FINAL_AUDIO_NAME}.${FINAL_AUDIO_FORMAT}`;
  let videoPath = `${tmpFolder}/${tmpVideoName}`;
  let subtitlesPath = `${tmpFolder}/${SUBTITLES_NAME}`
  
  let params = [
    '-y',
    '-i', videoPath,
  ]

  if(fs.existsSync(audioPath)) {
    params = params.concat(['-i', audioPath])
  }

  params = params.concat([
    '-vsync', '2',
    '-filter:v', '"fps=60"',
    '-vf', `subtitles=${subtitlesPath}`,
    outputPath
  ]);

  return Util.externalCall({
    exec: 'ffmpeg',
    params
  });
}