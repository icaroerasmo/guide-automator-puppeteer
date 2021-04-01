const { performance } = require('perf_hooks');

const TMP_AUDIO_PREFIX = 'tmp_audio_file';
const AUDIO_FORMAT = 'wav'

let lastTimestamp = null;

class TextToSpeech {

  constructor() {}

  createSilence() {

    let currentTimestamp = performance.now();
    let delay = (currentTimestamp - (lastTimestamp || 0))/1000
    
    let resolve, reject;

    const deffered = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    
    let spawn = require('child_process').spawn;

    let fantProc = spawn('sh', [
      '-c', `ffmpeg -f lavfi -i anullsrc=channel_layout=mono:sample_rate=44100 -t ${delay} -f s16le -ar 44100 -ac 1 - > ${process.env.fakeMicPath}`
    ]);

    fantProc.on('close', () => {
      resolve();
    });

    fantProc.stdout.on('data', (data) => {
      console.log(data.toString())
    });

    fantProc.stderr.on('data', (data) => {
      console.log(data.toString())
    });

    lastTimestamp = currentTimestamp;
    
    return deffered;
  }

  createVoiceFromText(text) {

    let resolve, reject;

    const deffered = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    
    let spawn = require('child_process').spawn;

    let fantProc = spawn('sh', [
      '-c', `espeak -vbrazil-mbrola-4 "${text}" --stdout | `+
      'ffmpeg -fflags +discardcorrupt -i pipe:0 -f s16le -ar '+
      `44100 -ac 1 - > ${process.env.fakeMicPath}`
    ]);

    fantProc.on('close', () => {
      resolve();
    });

    return deffered;
  }

  appendAudioToStream(tmpAudio) {

    let resolve, reject;

    const deffered = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });

    let spawn = require('child_process').spawn;

    let concatProc = spawn('sh', [
      '-c', `ffmpeg -fflags +discardcorrupt -i ${tmpAudio} `+
      `-f s16le -ar 44100 -ac 1 - > ${process.env.fakeMicPath}`
    ]);

    concatProc.on('close', () => {
      resolve();
    });

    return deffered;
  }

  async say(text, outputPath) {

    await this.createSilence();

    let tmpAudioFile = `${outputPath}/${TMP_AUDIO_PREFIX}.${AUDIO_FORMAT}`;

    await this.createVoiceFromText(text, tmpAudioFile);
  }

  async keyboard(resourcesFolder) {

    await this.createSilence();

    let keySoundFile = `${resourcesFolder}/keysound.${AUDIO_FORMAT}`;
    
    await this.appendAudioToStream(keySoundFile);
  }
}


module.exports = {
  keyPressNoise: async (resourcesFolder) => {
    const tts = new TextToSpeech();
    await tts.keyboard(resourcesFolder);
  },
  say: async (text) => {
    const tts = new TextToSpeech();
    await tts.say(text);
  },
}