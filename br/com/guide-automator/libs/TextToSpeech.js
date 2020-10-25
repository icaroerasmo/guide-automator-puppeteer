const fs = require('fs');

const TMP_AUDIO_PREFIX = 'aux_';
const FINAL_AUDIO_PREFIX = 'audio_';
const AUDIO_FORMAT = 'wav'
const SILENCE_FILE = `silence.${AUDIO_FORMAT}`

class TextToSpeech {

  constructor() {}

  createAudio(text, index, outputPath) {

    let resolve, reject;

    const deffered = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    
    let spawn = require('child_process').spawn;

    let fantProc = spawn('sh', [
      '-c', `echo ${text} | text2wave -o ${outputPath}/${TMP_AUDIO_PREFIX}${index}.${AUDIO_FORMAT}`
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

  async say(text, index, silenceDuration, outputPath) {
    await this.createAudio(text, index, outputPath);
    await this.addSilence(silenceDuration,
      `${outputPath}/${TMP_AUDIO_PREFIX}${index}.${AUDIO_FORMAT}`,
      `${outputPath}/${FINAL_AUDIO_PREFIX}${index}.${AUDIO_FORMAT}`);
  }
}


module.exports = {
  say: async (text, index, silenceDuration, outputPath) => {
    const tts = new TextToSpeech();
    await tts.say(text, index, silenceDuration, outputPath);
  },
  generateAudio: (outputPath) => {
    let files = fs.readdirSync(outputPath).
      filter(fn => fn.match(/^audio_[0-9]+\.wav$/g));
    
    const tts = new TextToSpeech();
    tts.concatAudios(
      ...files.map(f => `${outputPath}/${f}`),
      `${outputPath}/final_audio.wav`);
  }
}