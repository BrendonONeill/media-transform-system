 import fs from 'fs';

export class Logger{
    active = false;
    logsQueue = [];
    constructor(type,fileLocation)
    {
        this.type = type;
        this.fileLocation = fileLocation;
    }

    async write()
    {
        while(this.logsQueue.length >= 1)
        {
            try {
                let log = this.logsQueue.shift();
                fs.appendFileSync(this.fileLocation,log,'utf8');
            } catch (error) {
                //handle error
            }
        }
    }

    async addToQueue(value)
    {
        this.logsQueue.push(`${this.time()} ${value} \n`);
        if(!this.active)
        {
            this.active = true;
            await this.write()
            this.active = false;

        }
    }

    actionSpacer()
    {
        this.logsQueue.push(`/////////////////////////////////////////////////////////////////////////////////////// \n`);
    }

    time()
    {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        return `[${day}-${month}-${year}] | ${hours}:${minutes}:${seconds} | `;
    }


    cleanupQueue()
    {
        if(this.active)
        {
            return
        }

        this.active = true;

        while(this.logsQueue.length >= 1)
        {
            try {
                let log = this.logsQueue.shift();   
                fs.appendFileSync(this.fileLocation,log,'utf8');
            } catch (error) {
                //handle error
            }
        }
    }
}