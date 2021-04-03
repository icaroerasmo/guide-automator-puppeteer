const cursorImg = require('../libs/CursorImage');
const query = 'puppeteer-mouse-pointer';
const mouseHelper = require('../libs/MouseHelper');

class MouseSimulator{

    constructor(instance) {
        this.instance = instance;
        this.page = instance.page;
        mouseHelper(this.page);
    }

    async initializeCursorStyle() {
        await this.page.evaluate((query, cursorImg) => {
           let cursor = document.querySelector(query);
            if(!cursor.style['background']) {
                cursor.style['border'] = '1px solid white';
                cursor.style['background'] = 'rgba(0,0,0,.4)';
                cursor.style['background-image'] = `url('${cursorImg}')`;
                cursor.style['background-size'] = '1vw 1.5vw';
                cursor.style['background-repeat'] = 'no-repeat';
                cursor.style['background-position'] = 'center';
            }
        }, query, cursorImg)
    }

    async getScreenSizes() {
        return await this.page.evaluate(() => {
            return { width: window.innerWidth,
                 height: window.innerHeight };
        });
    }
    
    async setPosition(x, y) {
        await this.page.evaluate((selector, x, y) => {
            let el = document.querySelector(selector);
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
        }, query, x, y);
    }

    async getCursorPosition() {
        await this.page.waitForSelector(query);
        return await this.page.evaluate((query) => {
            let cursor = document.querySelector(query);

            const x = Number(cursor.style.left.replace(/px/g, '').trim());
            const y = Number(cursor.style.top.replace(/px/g, '').trim());
            
            if( x === 0 && y === 0 ) {
                return { 
                    currentX: Math.round(window.innerWidth/2),
                    currentY: Math.round(window.innerHeight/2) 
                }
            }
            
            return { currentX: x, currentY: y };
        }, query);
    }

    async getDxDy(boundingBox) {

        const destX = Math.round(boundingBox.x + (boundingBox.width/2));
        const destY = Math.round(boundingBox.y + (boundingBox.height/2));

        let coord = await this.getCursorPosition();

        let dX = destX - coord.currentX;
        let dY = destY - coord.currentY;

        return { dX, dY };
    }

    async calcDistance(boundingBox) {
        
        let coord = await this.getDxDy(boundingBox);
        let dx = coord.dX;
        let dy = coord.dY;

        if(dx < 0) {
            dx = dx * -1;
        }

        if(dy < 0) {
            dy = dy * -1;
        }

        return dx + dy;
    }

    async moveCursorToCoordinates(boundingBox) {

        if(boundingBox == null) {
            return;
        }

        await this.initializeCursorStyle();

        const stepSize = 10;

        while(await this.calcDistance(boundingBox) > stepSize) {

            const currCoord = await this.getCursorPosition();
            let diffCoord = await this.getDxDy(boundingBox);

            let movX = currCoord.currentX, movY = currCoord.currentY;

            if(diffCoord.dX < 0) {
                movX = movX - stepSize;
            } else if(diffCoord.dX > 0) {
                movX = movX + stepSize;
            }

            if(diffCoord.dY < 0) {
                movY = movY - stepSize;
            } else if(diffCoord.dY > 0) {
                movY = movY + stepSize;
            }

            await this.setPosition(movX, movY);
        }
    }
}

module.exports = MouseSimulator;