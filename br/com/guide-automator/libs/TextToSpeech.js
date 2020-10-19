module.exports = (text, outputPath) => {

  let resolve, reject;

  const deffered = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
  });
  
  let spawn = require('child_process').spawn;

  const args = [
    '-c', `echo ${text} | text2wave -o ${outputPath}`
  ];

  let proc = spawn('sh', args);

  proc.on('close', () => {
    resolve();
  });

  return deffered;
}