const fs = require('fs');

const framePrefix = 'frame_'; 

// Runs ffmpeg
const videoRenderer = (viewport, outputFolder) => {

    let resolve, reject;

    const deffered = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    
    let spawn = require('child_process').spawn;
    let outputPath = `${outputFolder}/video.mp4`;

    let args = [
        '-y',
        '-r', '10',
        '-f', 'image2',
        '-s', `${viewport.width}x${viewport.height}`,
        '-i', `${outputFolder}/${framePrefix}%d.png`, 
        '-vcodec', 'libx264',
        '-crf', '25',
        '-pix_fmt', 'yuv420p', 
        outputPath
    ];

    let proc = spawn('ffmpeg', args);

    proc.stdout.on('data', function(data) {});

    proc.stderr.setEncoding("utf8")
    proc.stderr.on('data', function(data) {});

    proc.on('close', function() {
        resolve(outputPath);
    });

    return deffered;
}

module.exports = async (setup, outputPath) => {
    let session;
    let resolve;
    let reject;
    const deffered = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });

    let index = 0;
  
    async function start(page) {

      session = await page.target().createCDPSession();
      await session.send('Page.startScreencast');
      session.on('Page.screencastFrame', event => {
        const name = `${framePrefix}${index++}.png`;
        const path = `${outputPath}/${name}`;
        let base64Image = event.data.split(';base64,').pop();

        fs.writeFile(path, base64Image, {encoding: 'base64'}, function(err) {});
      });
    }
  
    async function stop(viewport) {
      await session.send('Page.stopScreencast');
      let videoPath = await videoRenderer(viewport, outputPath);
      resolve(videoPath);
    }
  
    await setup(start, stop);
    return deffered;
}