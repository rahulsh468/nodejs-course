const mongoose = require('mongoose');
const redis = require('redis');
const exec = mongoose.Query.prototype.exec;
const util = require('util');

const redisURl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisURl);
client.get = util.promisify(client.get);

// here impleting a .cache function to be added to mongoose queries to let
// know which to cache which to not
// always use function keyword as arrow function will mess with logic of (this)
mongoose.Query.prototype.cache = function () {
    this.useCache = true;
    // this will make it chainable like
    // now we can add like .limit().sort() etc
    return this;
}

mongoose.Query.prototype.exec = async function () {

    if (!this.useCache) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));
    // see if this key already has an value
    const cachedValue = await client.get(key);
    // if there is return that
    if (cachedValue) {
        console.log('From cache')
        // this needs to be changes from array of records for each instance in cache to single record
        // const doc = new this.model(JSON.parse(cachedValue));

        const doc = JSON.parse(cachedValue);

        return Array.isArray(doc)
            ? doc.map(item => new this.model(item))
            : new this.model(doc)

        // return doc;
    }
    console.log('Not from cache')
    // Execute mongodb query and store the result and return the same
    const result = await exec.apply(this, arguments);

    client.set(key, JSON.stringify(result));

    return result;
}