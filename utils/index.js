const uuidv4 = require('uuid').v4;
const ip = require('ip');
const IPAddress = require("ip-address").Address4;
let sequenceCount = 1000;
module.exports = {
    ipToHex: ipV4 => {
        const ip = new IPAddress(ipV4);
        if(!ip.isCorrect()) {
            return ip;
        }
        return ip.toHex().replace(/:/g, '');
    },
    //https://www.sofastack.tech/en/projects/sofa-tracer/traceid-generated-rule/
    traceIdAnt: function() {
        const ipHex = this.ipToHex(ip.address());
        const dateInTimestamp = Date.now().toString();
        const sequence = sequenceCount;
        if(sequenceCount === 9000) {
            sequenceCount = 1000;
        }
        sequenceCount++;
        const pidIn5 = process.pid.toString().length > 5 ? process.pid.toString().slice(0, 4) : process.pid.toString().padStart(5, '0');
        const traceIdStr = `${ipHex}${dateInTimestamp}${sequence}${pidIn5}`;
        return traceIdStr;
    },
    traceId: () => {
        return uuidv4().replace(/-/g, '').slice(0, 16);
    }
}