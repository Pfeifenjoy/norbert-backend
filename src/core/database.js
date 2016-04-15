import { MongoClient } from "mongodb";
import assert from "assert";
var config = require('./../configuration.js');
var promisify = require('./../utils/promisify.js');

const url = config.get('database.url');

export default function connect() {
    return MongoClient.connect(url);
}

