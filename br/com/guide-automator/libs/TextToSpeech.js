const fs = require('fs');

const TMP_AUDIO_PREFIX = 'aux_';
const FINAL_AUDIO_PREFIX = 'audio_';
const AUDIO_FORMAT = 'wav'
const SILENCE_FILE = `silence.${AUDIO_FORMAT}`
const INPUT_FILE = 'input.txt';

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

  createSilence(duration, outputPath) {
    
    let resolve, reject;

    const deffered = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    
    let spawn = require('child_process').spawn;

    let createProc = spawn('ffmpeg', [
      '-y', '-f', 'lavfi', '-i',
      'anullsrc=channel_layout=stereo:sample_rate=44100',
      '-t', duration, `${outputPath}/${SILENCE_FILE}`
    ]);

    createProc.on('close', () => {
      resolve();
    });

    return deffered;
  }

  concatSilence(index, outputPath) {

    let resolve, reject;

    const deffered = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });

    console.log(index);
    console.log(outputPath);

    const inputFileTxt = `file ${SILENCE_FILE}\n`+
      `file ${TMP_AUDIO_PREFIX}${index}.${AUDIO_FORMAT}`

    fs.writeFileSync(`${outputPath}/${INPUT_FILE}`, inputFileTxt, 'utf8', () => {});

    let spawn = require('child_process').spawn;

    let concatProc = spawn('ffmpeg', [
      '-f', 'concat', '-i',  `${outputPath}/${INPUT_FILE}`, '-codec', 'copy',
      `${outputPath}/${FINAL_AUDIO_PREFIX}${index}.${AUDIO_FORMAT}`
    ]);

    console.log(`${outputPath}/${INPUT_FILE}`)
    console.log(`${outputPath}/${FINAL_AUDIO_PREFIX}${index}.${AUDIO_FORMAT}`);

    concatProc.on('close', () => {
      resolve();
    });

    return deffered;
  }

  async say(text, index, silenceDuration, outputPath) {
    await this.createSilence(silenceDuration, outputPath);
    await this.createAudio(text, index, outputPath);
    await this.concatSilence(index, outputPath);
  }
}


module.exports = async (text, index, silenceDuration, outputPath) => {
  const tts = new TextToSpeech();
  return await tts.say(text, index, silenceDuration, outputPath);
}