const fs = require('fs');

module.exports = (outputFolder, filePath) => {

  let resolve, reject;

  const deffered = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
  });
  
  let spawn = require('child_process').spawn;
  let outputPath = `${outputFolder}/video.mp4`;

  const args = [
    '-y',
    '-i', filePath,
    '-vf', `subtitles=${outputFolder}/subtitles.srt`,
    outputPath
  ];

  let proc = spawn('ffmpeg', args);

  proc.on('close', () => {
      resolve(outputPath);
  });

  return deffered;
}