const fs = require('fs');
const Util = require('./Util');
const { performance } = require('perf_hooks');

const TMP_AUDIO_PREFIX = 'tmp_audio_file';
const FINAL_AUDIO_PREFIX = 'audio_';
const AUDIO_FORMAT = 'wav'

let index = 0;
let lastTimestamp;

class TextToSpeech {

  constructor() {}

  checkAudioDuration(index, outputPath) {

    let path = this.generateAudioFilePath(outputPath, index);

    let resolve, reject;

    const deffered = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    
    let spawn = require('child_process').spawn;

    let fantProc = spawn('sh', [
      '-c', `ffmpeg -i ${path} 2>&1 `+
      "| sed 's/Duration: \\(.*\\), start/\\1/gp'"
    ]);

    fantProc.stdout.on('data', (data) => {
      console.log(data.toString())
      let duration = data.toString().
        match(/(?!Duration: )\d{2}:\d{2}:\d{2}\.\d{1,3}/g)[0];
      resolve(Util.unformattedTime(duration));
    });

    fantProc.stderr.on('data', (data) => {
      console.log(data.toString())
    });

    fantProc.on('close', (data) => {
      console.log(data.toString())
    });

    return deffered;
  }

  generateAudioFilePath(outputPath, index) {
    return `${outputPath}/${FINAL_AUDIO_PREFIX}${index}.${AUDIO_FORMAT}`;
  }

  createVoiceFromText(text, outputPath) {

    let resolve, reject;

    const deffered = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    
    let spawn = require('child_process').spawn;

    let fantProc = spawn('sh', [
      '-c', `espeak -vbrazil-mbrola-4 "${text}" -s 130 --stdout > ${outputPath}`
    ]);

    fantProc.on('close', () => {
      resolve();
    });

    return deffered;
  }

  concatAudios() {

    let resolve, reject;

    const deffered = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });

    let spawn = require('child_process').spawn;

    const filterPreffix = 'concat=n='
    const filterSuffix = ':v=0:a=1[out]'

    let filterBuff = '';
    let args = [];

    for(let i = 0; i < arguments.length-1; i++) {
      filterBuff += `[${i}:0]`
      args.push('-i', arguments[i]);
    }

    args.push('-filter_complex');
    args.push(filterBuff+filterPreffix+(arguments.length-1)+filterSuffix);
    args.push('-map');
    args.push('[out]');
    args.push(arguments[arguments.length-1]);

    let concatProc = spawn('ffmpeg', args);

    concatProc.on('close', () => {
      resolve();
    });

    // concatProc.stdout.on('data', (data) => {
    //   console.log(data.toString());
    // });

    // concatProc.stderr.on('data', (data) => {
    //   console.log(data.toString());
    // });

    return deffered;
  }

  addSilence(silenceDuration, tmpAudio, finalAudio) {

    let resolve, reject;

    const deffered = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });

    let spawn = require('child_process').spawn;

    let concatProc = spawn('ffmpeg', [
      '-i', tmpAudio, '-af',
      `adelay=${silenceDuration}|0`,
      finalAudio
    ]);

    concatProc.on('close', () => {
      resolve();
    });

    return deffered;
  }

  calcDelay(currentTimestamp) {
    return currentTimestamp - (lastTimestamp || 0)
  }

  async say(text, index, outputPath) {

    let tmpAudioFile = `${outputPath}/${TMP_AUDIO_PREFIX}.${AUDIO_FORMAT}`;

    await this.createVoiceFromText(text, tmpAudioFile);

    let currentTimestamp = performance.now();

    await this.addSilence(this.calcDelay(currentTimestamp),
      tmpAudioFile, this.generateAudioFilePath(outputPath, index));

    lastTimestamp = currentTimestamp
  }

  async keyboard(index, resourcesFolder, outputPath) {

    let keySoundFile = `${resourcesFolder}/keysound.${AUDIO_FORMAT}`;

    let currentTimestamp = performance.now();
    
    await this.addSilence(this.calcDelay(currentTimestamp),
      keySoundFile, this.generateAudioFilePath(outputPath, index));

    lastTimestamp = currentTimestamp
  }
}

const tts = new TextToSpeech();

module.exports = {
  keyPressNoise: async (resourcesFolder, outputPath) => {
    await tts.keyboard(index++, resourcesFolder, outputPath);
  },
  say: async (text, outputPath) => {
    await tts.say(text, index++, outputPath);
  },
  generateAudio: async (outputPath) => {
    const getPosition = (fileName) => Number(
      fileName.replace(FINAL_AUDIO_PREFIX, '').
      replace(AUDIO_FORMAT, ''));

    let files = fs.readdirSync(outputPath).
      filter(fn => fn.match(/^audio_[0-9]+\.wav$/g)).
      sort((file1, file2) => {
          return getPosition(file1) - getPosition(file2);
        }).
      map(f => `${outputPath}/${f}`);
    
    await tts.concatAudios(...files, `${outputPath}/final_audio.wav`);
  },
  checkAudioDuration: (index, outputPath) => {
    return tts.checkAudioDuration(index, outputPath);
  }
}