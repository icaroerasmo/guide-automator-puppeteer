// Took it from node-puppeteer apng to modify
// https://github.com/TomasHubelbauer/node-puppeteer-apng
const fs = require('fs');
const apng = require('node-apng');
const { performance } = require('perf_hooks');

class Recorder {

    stdoutNum = null;

    constructor() {
    }

    async recordUsingScreencast(setup) {
      
        const self = this;

        let timestamp = performance.now();
      
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
      
        async function start(page, tmpFolder) {
          // Clear the buffers and cuts and reset the timestamp from the previous recording
          buffers = [];
          cuts = [];
          session = await page.target().createCDPSession();
          
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

          resolve(self.makeApng(buffers, cuts, timestamp));
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
  recorder: (setup) => {
    const recorder = new Recorder();
    return recorder.recordUsingScreencast(setup);
  }
}