// Took it from node-puppeteer apng to modify
// https://github.com/TomasHubelbauer/node-puppeteer-apng
const fs = require('fs');
const apng = require('node-apng');
const { performance } = require('perf_hooks');
const AudioRecorder = require('node-audiorecorder');

class Recorder {

    stdoutNum = null;

    constructor(start) {
        this.timestamp = start;
    }

    async setupFakeMic() {

      let self = process.env;

      let resolve, reject;
  
      const deffered = new Promise((_resolve, _reject) => {
          resolve = _resolve;
          reject = _reject;
      });
  
      let spawn = require('child_process').spawn;
  
      let concatProc = spawn('sh', [
        '-c',
        'pactl load-module ' +
        'module-pipe-source ' +
        `source_name=${process.env.fakeMicName} ` +
        `file=${process.env.fakeMicPath} ` +
        'format=s16le ' +
        'rate=44100 ' +
        'channels=1'
      ]);
  
      concatProc.on('close', () => {
        resolve();
      });

      concatProc.stdout.on('data', (data) => {
        if(!data.toString().match(/\d+/g)){
          throw new Error("Error starting audio recording");
        }
        self.stdoutNum = data.toString();
      });

      concatProc.stderr.on('data', (data) => {
        //console.log(data.toString())
        if(data){
          throw new Error("Error starting audio recording");
        }
      });
  
      return deffered;
    }

    async setupFakeMicAsDefault() {

      let resolve, reject;
  
      const deffered = new Promise((_resolve, _reject) => {
          resolve = _resolve;
          reject = _reject;
      });
  
      let spawn = require('child_process').spawn;
  
      console.log(process.env.stdoutNum);

      let concatProc = spawn('sh', [
        '-c',
        `pactl set-default-source ${process.env.fakeMicName}`
      ]);
  
      concatProc.on('close', () => {
        resolve();
      });

      concatProc.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      concatProc.stderr.on('data', (data) => {
        console.log(data.toString());
        if(data){
          throw new Error("Error starting audio recording");
        }
      });
  
      return deffered;
    }

    async removeFakeMic() {

      let resolve, reject;
  
      const deffered = new Promise((_resolve, _reject) => {
          resolve = _resolve;
          reject = _reject;
      });
  
      let spawn = require('child_process').spawn;
  
      let concatProc = spawn('sh', [
        '-c',
        `pactl unload-module ${process.env.stdoutNum}`
      ]);
  
      concatProc.on('close', () => {
        resolve();
      });

      if (fs.existsSync(process.env.fakeMicPath)) {
        fs.unlinkSync(process.env.fakeMicPath);
      }
  
      return deffered;
    }

    async startAudioRecorder() {

      await this.setupFakeMic();
      await this.setupFakeMicAsDefault();

      this.audioRecorder = new AudioRecorder({
        program: `sox`,     // Which program to use, either `arecord`, `rec`, or `sox`.
        //device: fakeMicName,       // Recording device to use, e.g. `hw:1,0`
      
        bits: 16,           // Sample size. (only for `rec` and `sox`)
        channels: 1,        // Channel count.
        encoding: `signed-integer`,  // Encoding type. (only for `rec` and `sox`)
        rate: 44100,        // Sample rate.
        type: `wav`,        // Format type.
      
        // Following options only available when using `rec` or `sox`.
        silence: 2,         // Duration of silence in seconds before it stops recording.
        thresholdStart: 0.5,  // Silence threshold to start recording.
        thresholdStop: 0.5,   // Silence threshold to stop recording.
        keepSilence: true   // Keep the silence in the recording.
      });
    }

    async recordUsingScreencast(setup) {
      
        const self = this;
      
        let buffers;
        let cuts;
        let session;
      
        let resolve;
        // TODO: Hook up the reject using try-catch blocks in start and stop
        let reject;
        const deffered = new Promise((_resolve, _reject) => {
          resolve = _resolve;
          reject = _reject;
        });

        await this.startAudioRecorder();
      
        async function start(page, tmpFolder) {
          // Clear the buffers and cuts and reset the timestamp from the previous recording
          buffers = [];
          cuts = [];
          session = await page.target().createCDPSession();
          
          const fileStream = fs.createWriteStream(`${tmpFolder}/final_audio.wav`, { encoding: 'binary' });
          await self.audioRecorder.start().stream().pipe(fileStream);
          
          await session.send('Page.startScreencast');
          session.on('Page.screencastFrame', event => {
            const buffer = Buffer.from(event.data, 'base64');
            buffers.push(buffer);
            cuts.push(performance.now());
          });
        }
      
        async function stop() {
          await session.send('Page.stopScreencast');
          // Drop the first frame because it always has wrong dimensions
          buffers.shift(0);
          cuts.shift(0);

          self.audioRecorder.stop();

          resolve(self.makeApng(buffers, cuts, self.timestamp));
        }
      
        await setup(start, stop);
        return deffered;
    }

    makeApng(buffers, cuts, timestamp) {
        const delays = cuts.reduce((a, c, i) => {
          const delay = c - (cuts[i - 1] || timestamp);
          a.push(delay >= 0 ? delay : 0); return a;
        }, []);
        return apng(buffers, index => ({ numerator: delays[index], denominator: 1000 }));
    }
}

module.exports = {
  recorder: (setup, start) => {
    const recorder = new Recorder(start);
    return recorder.recordUsingScreencast(setup);
  },
  removeFakeMic: () => {
    const recorder = new Recorder();
    return recorder.removeFakeMic();
  }
}