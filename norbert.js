#!/usr/bin/env node
var exec = require("child_process").exec;

console.log("Starting setup.")
console.log(
" ______________________________________\n" +
"< Let's take me for a ride Norbert ;-) >\n" +
" --------------------------------------\n" +
"        \\   ^__^\n" +
"         \\  (oo)\\_______\n" +
"            (__)\\       )\\/\\\n" +
"                ||----w |\n" +
"                ||     ||\n" 
);

function handleError(errMessage) {
    console.error(errMessage);
    console.error("This is bad. Recheck the dependencies and try again.");
    system.exit(1);
}

function compileBackend(callback) {
    console.log("Starting to compile the backend.")
    exec("npm run build-production", function(err, stout, stderr) {
        if(err) {
            handleError("Could not compile the backend: " + stderr);
        }
        console.log("Compiled the backend.");
        if(callback) callback();
    })
}
function installBackend(callback) {
    console.log("Starting to install backend dependecies.");
    exec("npm install", function(err, stdout, stderr) {
        if(err) {
            handleError("Could not install Backend dependecies: " + stderr);
        }
        console.log("Installed backend dependecies.");
        compileBackend(callback);
    });
}

function buildFrontend(callback) {
    console.log("Starting to compile the frontend.");
    exec("npm run build-production", function(err, stdout, stderr) {
        if(err) {
            handleError("Could not compile the frontend: " + stderr);
        }
        console.log("Finished compiling the frontend");
        if(callback) callback();
    })
}

function installFrontend(callback) {
    console.log("Starting to install frontend dependencies.");
    exec("npm install", function(err, stdout, stderr) {
        if(err) {
            handleError("The frontend dependencies could not be installed: " + stderr);
        }
        console.log("Installed frontend dependencies.");
        buildFrontend(callback);
    })
}

function updateFrontend(callback) {
    console.log("Downloading the newest version of the frontend.");
    var lastPath = process.cwd();
    process.chdir(__dirname + "/files/frontend");
    exec("git submodule update --init", function(err, stdout, stderr) {
        if(err) {
            handleError("The frontend could not be downloaded: " + stderr + "\nPlease check if you have git installed.");
        }
        console.log("Downloaded the frontend.");
        installFrontend(function() {
            process.chdir(lastPath);
            if(callback) callback();
        });
    })
}

function finished() {
    console.log("Everything done.");
    console.log("Execute 'npm start' to take Norbert for a spinn.");
}

installBackend(updateFrontend);
