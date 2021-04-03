module.exports = (fileName, tmpFolder, outputFolder) => {

  let resolve, reject;

  const deffered = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
  });
  
  let spawn = require('child_process').spawn;
  let outputPath = `${outputFolder}/video.mp4`;

  const args = [
    '-y',
    '-i', `${tmpFolder}/${fileName}`,
    '-i', `${tmpFolder}/final_audio.wav`,
    '-vsync', '2',
    '-filter:v', '"fps=60"',
    '-vf', `subtitles=${tmpFolder}/subtitles.srt`,
    outputPath
  ];

  let proc = spawn('ffmpeg', args);

  proc.on('close', () => {
      resolve(outputPath);
  });

  if(process.env.integrationDebug){
    proc.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    proc.stderr.on('data', (data) => {
      console.log(data.toString());
    });
  }

  return deffered;
}