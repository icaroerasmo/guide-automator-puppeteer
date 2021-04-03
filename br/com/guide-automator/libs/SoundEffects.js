const fs = require('fs');
const Util = require('./Util');
const { performance } = require('perf_hooks');

const TMP_AUDIO_PREFIX = 'tmp_audio_file';
const FINAL_AUDIO_PREFIX = 'audio_';
const AUDIO_FORMAT = 'wav'

let index = 0;
let lastTimestamp;
let delay = 0;
let buffer = '';

class TextToSpeech {

  constructor() {}

  async checkAudioDuration(path) {
    let audioDuration;
    await Util.externalCall({
      exec: 'sh',
      onStdout: (data) => {
        let duration = data.toString().
          match(/(?!Duration: )\d{2}:\d{2}:\d{2}\.\d{1,3}/g)[0];
        audioDuration = Util.unformattedTime(duration);
      },
      params: [
        '-c', `ffmpeg -i ${path} 2>&1 `+
        "| sed 's/Duration: \\(.*\\), start/\\1/gp'"
      ],
    });

    return audioDuration;
  }

  createVoiceFromText(text, outputPath) {
    return Util.externalCall({
      exec: 'sh',
      params: [
        '-c', `espeak -vbrazil-mbrola-4 "${text}" `+
        `-s 130 --stdout > ${outputPath}`
      ]
    });
  }

  concatAudios() {

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

    return Util.externalCall({
      exec: 'ffmpeg',
      params: args,
    });
  }

  addSilence(silenceDuration, tmpAudio, finalAudio) {
    return Util.externalCall({
      exec: 'ffmpeg',
      params: [
        '-i', tmpAudio, '-af',
        `adelay=${silenceDuration}|0`,
        finalAudio
      ]
    });
  }

  playAudio(audioPath) {
    return Util.externalCall({
      exec: 'aplay',
      params: [audioPath]
    });
  }

  calcDelay(currentTimestamp) {

    if(!lastTimestamp) {
      return currentTimestamp - process.env.startTime;
    }

    return currentTimestamp - lastTimestamp;
  }

  async say(text, index, outputPath) {

    let tmpAudioFile = this.generateTmpAudioFilePath(outputPath);

    let currentTimestamp = performance.now();

    delay = this.calcDelay(currentTimestamp)
    
    lastTimestamp = currentTimestamp

    // Subtitle beggining in ms
    let _beginning = Util.formattedTime(performance.now());

    await this.createVoiceFromText(text, tmpAudioFile);

    let finalPath = this.generateAudioFilePath(outputPath, index);

    await this.addSilence(delay, tmpAudioFile, finalPath);

    let audioDuration = await this.checkAudioDuration(finalPath);

    await Util.sleep(audioDuration);

    // Subtitle end in ms
    let _end = Util.formattedTime(performance.now());

    // Adds subtitle to buffer
    buffer += `${index+1}\n${_beginning} --> ${_end}\n${text}\n\n`;
  }

  async keyboard(index, resourcesFolder, outputPath) {

    let keySoundFile = `${resourcesFolder}/keysound.${AUDIO_FORMAT}`;

    lastTimestamp = performance.now()
    
    let finalPath = this.generateAudioFilePath(outputPath, index);
    
    await this.addSilence(0, keySoundFile, finalPath);

    let audioDuration = await this.checkAudioDuration(finalPath);

    await Util.sleep(audioDuration);
  }

  generateTmpAudioFilePath(outputPath) {
    return `${outputPath}/${TMP_AUDIO_PREFIX}.${AUDIO_FORMAT}`;
  }

  generateAudioFilePath(outputPath, index) {
    return `${outputPath}/${FINAL_AUDIO_PREFIX}${index}.${AUDIO_FORMAT}`;
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

    fs.writeFileSync(`${outputPath}/subtitles.srt`, buffer, 'utf8', () => {});
    
    return tts.concatAudios(...files, `${outputPath}/final_audio.wav`);
  },
  checkAudioDuration: (index, outputPath) => {
    let finalPath = tts.generateAudioFilePath(outputPath, index);
    return tts.checkAudioDuration(finalPath);
  }
}