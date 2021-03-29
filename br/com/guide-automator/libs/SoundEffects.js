const fs = require('fs');
const Util = require('./Util');

const TMP_AUDIO_PREFIX = 'tmp_audio_file';
const AUDIO_FORMAT = 'wav'

class TextToSpeech {

  constructor() {}

  createVoiceFromText(text) {

    let resolve, reject;

    const deffered = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    
    let spawn = require('child_process').spawn;

    let fantProc = spawn('sh', [
      '-c', `espeak -vbrazil-mbrola-4 "${text}" -s 130 --stdout | ffmpeg -i pipe:0 -f s16le -ar 44100 -ac 1 - > /tmp/gapFakeMic`
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
      '-c', `ffmpeg -i ${tmpAudio} -f s16le -ar 44100 -ac 1 - > /tmp/gapFakeMic`
    ]);

    concatProc.on('close', () => {
      resolve();
    });

    return deffered;
  }

  async say(text, outputPath) {

    let tmpAudioFile = `${outputPath}/${TMP_AUDIO_PREFIX}.${AUDIO_FORMAT}`;

    await this.createVoiceFromText(text, tmpAudioFile);
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
  say: async (text) => {
    const tts = new TextToSpeech();
    await tts.say(text);
  },
}