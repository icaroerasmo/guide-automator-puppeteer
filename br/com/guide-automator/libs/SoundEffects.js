const fs = require('fs');
const Util = require('./Util');

const TMP_AUDIO_PREFIX = 'tmp_audio_file';
const FINAL_AUDIO_PREFIX = 'audio_';
const AUDIO_FORMAT = 'wav'

class TextToSpeech {

  constructor() {}

  // checkAudioDuration(path) {
  //   let resolve, reject;

  //   const deffered = new Promise((_resolve, _reject) => {
  //       resolve = _resolve;
  //       reject = _reject;
  //   });
    
  //   let spawn = require('child_process').spawn;

  //   let fantProc = spawn('sh', [
  //     '-c', `ffmpeg -i ${path} 2>&1 `+
  //     "| sed 's/Duration: \\(.*\\), start/\\1/gp'"
  //   ]);

  //   fantProc.stdout.on('data', (data) => {
  //     let duration = data.toString().
  //       match(/(?!Duration: )\d{2}:\d{2}:\d{2}\.\d{1,3}/g)[0];
  //     resolve(Util.unformattedTime(duration));
  //   });

  //   return deffered;
  // }

  // generateAudioFilePath(outputPath, index) {
  //   return `${outputPath}/${FINAL_AUDIO_PREFIX}${index}.${AUDIO_FORMAT}`;
  // }

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

  // concatAudios() {

  //   let resolve, reject;

  //   const deffered = new Promise((_resolve, _reject) => {
  //       resolve = _resolve;
  //       reject = _reject;
  //   });

  //   let spawn = require('child_process').spawn;

  //   const filterPreffix = 'concat=n='
  //   const filterSuffix = ':v=0:a=1[out]'

  //   let filterBuff = '';
  //   let args = [];

  //   for(let i = 0; i < arguments.length-1; i++) {
  //     filterBuff += `[${i}:0]`
  //     args.push('-i', arguments[i]);
  //   }

  //   args.push('-filter_complex');
  //   args.push(filterBuff+filterPreffix+(arguments.length-1)+filterSuffix);
  //   args.push('-map');
  //   args.push('[out]');
  //   args.push(arguments[arguments.length-1]);

  //   let concatProc = spawn('ffmpeg', args);

  //   concatProc.on('close', () => {
  //     resolve();
  //   });

  //   return deffered;
  // }

  appendAudioToStream(tmpAudio, finalAudio) {

    let resolve, reject;

    const deffered = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });

    let spawn = require('child_process').spawn;

    let concatProc = spawn('sh', [
      '-c', `ffmpeg -i ${tmpAudio} -f s16le -ar 16000 -ac 1 - > /tmp/gapFakeMic`
    ]);

    concatProc.on('close', () => {
      resolve();
    });

    return deffered;
  }

  async say(text, outputPath) {

    let tmpAudioFile = `${outputPath}/${TMP_AUDIO_PREFIX}.${AUDIO_FORMAT}`;

    await this.createVoiceFromText(text, tmpAudioFile);

    await this.appendAudioToStream(tmpAudioFile);
  }

  async keyboard(resourcesFolder) {

    let keySoundFile = `${resourcesFolder}/keysound.${AUDIO_FORMAT}`;
    
    await this.appendAudioToStream(keySoundFile);
  }
}


module.exports = {
  keyPressNoise: async (resourcesFolder) => {
    const tts = new TextToSpeech();
    await tts.keyboard(resourcesFolder);
  },
  say: async (text, outputPath) => {
    const tts = new TextToSpeech();
    await tts.say(text, outputPath);
  },
  // generateAudio: async (outputPath) => {

  //   const getPosition = (fileName) => Number(
  //     fileName.replace(FINAL_AUDIO_PREFIX, '').
  //     replace(AUDIO_FORMAT, ''));

  //   let files = fs.readdirSync(outputPath).
  //     filter(fn => fn.match(/^audio_[0-9]+\.wav$/g)).
  //     sort((file1, file2) => {
  //         return getPosition(file1) - getPosition(file2);
  //       }).
  //     map(f => `${outputPath}/${f}`);
    
  //   const tts = new TextToSpeech();
  //   await tts.concatAudios(...files, `${outputPath}/final_audio.wav`);
  // }
}