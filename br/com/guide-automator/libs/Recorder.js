// Took it from node-puppeteer apng to modify
// https://github.com/TomasHubelbauer/node-puppeteer-apng

const apng = require('node-apng');
const { performance } = require('perf_hooks');

class Recorder {

    constructor(start) {
        this.timestamp = start;
    }

    async recordUsingScreencast(setup) {
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
      
        async function start(page) {
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

        const self = this;
      
        async function stop() {
          await session.send('Page.stopScreencast');
          // Drop the first frame because it always has wrong dimensions
        //   buffers.shift(0);
        //   cuts.shift(0);
          resolve(self.makeApng(buffers, cuts, self.timestamp));
        }
      
        await setup(start, stop);
        return deffered;
    }

    makeApng(buffers, cuts, timestamp) {
        const delays = cuts.reduce((a, c, i) => { a.push(c - (cuts[i - 1] || timestamp)); return a; }, []);
        return apng(buffers, index => ({ numerator: delays[index], denominator: 1000 }));
    }
}

module.exports = (setup, start) => {
    const recorder = new Recorder(start);
    return recorder.recordUsingScreencast(setup);
}