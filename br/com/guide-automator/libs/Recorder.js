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
      
        const start = async (page) => {
          // Clear the buffers and cuts and reset the timestamp from the previous recording
          buffers = [];
          session = await page.target().createCDPSession();
          await session.send('Page.startScreencast');
          session.on('Page.screencastFrame', event => {
            buffers.push({data: event.data, timestamp: performance.now()});
          });
        }

        const self = this;
      
        const stop = async (end) => {
          await session.send('Page.stopScreencast');
          // Drop the first frame because it always has wrong dimensions
          const lastBuff = buffers.shift(0);

          //Adds last frame with delay of the first frame that have been removed
          buffers.push({data: buffers[buffers.length-1].data, timestamp: end + (lastBuff.timestamp - self.timestamp)});

          resolve(self.makeApng(buffers, self.timestamp));
        }
      
        await setup(start, stop);
        return deffered;
    }

    makeApng(buffers, timestamp) {
        
      buffers.sort((a, b) => a.timestamp - b.timestamp);
        
      const delays = buffers.reduce((a, c, i) => { a.push(c.timestamp
        - (buffers[i - 1] ? buffers[i - 1].timestamp : timestamp)); return a; }, []);
        
      return apng(buffers.map(b => Buffer.from(b.data, 'base64')), 
        index => ({ numerator: delays[index] >= 0 ? delays[index] : delays[index] * -1, denominator: 1000 }));
    }
}

module.exports = (setup, start) => {
    const recorder = new Recorder(start);
    return recorder.recordUsingScreencast(setup);
}