import cluster from "cluster";

function run() {
    console.log("dksfn");
}

class Core {

    start() {
        setTimeout(function() {
            process.nextTick(run);
            console.log("ksdfjlksdf")
        }, 0)
    }

    set db(db) {
        this._db = db;
    }
    set downtime(t) {
        this._downtime = t;
    }
}

const core = new Core;

export default core;
