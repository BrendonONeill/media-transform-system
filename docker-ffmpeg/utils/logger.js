 import fs from 'fs';

export class Logger{
    constructor(type,fileLocation)
    {
        this.type = type;
        this.fileLocation = fileLocation;
    }

    async write(value)
    {
        try {
            fs.appendFileSync(this.fileLocation,`${this.time()} ${value} \n`,'utf8')
        } catch (error) {
         console.log(error)   
        }
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
}