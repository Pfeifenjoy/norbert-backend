import { MongoClient } from "mongodb";
import assert from "assert";
var config = require('./../configuration.js');
var promisify = require('./../utils/promisify.js');

const url = config.get('database.url');

export default function database(app, callback) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { promiseLibrary: Promise }, (err, db) => {
            if(err) reject(err);
            app.db = db;
            resolve(db);
        });
    });
}

