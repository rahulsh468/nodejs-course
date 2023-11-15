const mongoose = require('mongoose');
const redis = require('redis');
const exec = mongoose.Query.prototype.exec;
const util = require('util');

const redisURl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisURl);
client.get = util.promisify(client.get);

mongoose.Query.prototype.exec = async function () {
    const key = JSON.stringify(Object.assign({} , this.getQuery() , {
        collection: this.mongooseCollection.name
    }));

    // see if this key already has an value
    const cachedValue = client.get(key);
    // if there is return that
    if(cachedValue){
        const doc = new this.model(JSON.parse(cachedValue));
        return doc;
    }

    // Execute mongodb query and store the result and return the same
    const result = await exec.apply(this , arguments);

    client.set(key , JSON.stringify(result));

    return result;
}