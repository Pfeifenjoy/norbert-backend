/**
 * @author Arwed Mett, Tobias Dorra
 * 
 * These routes are used to upload files
 * Requests directed to /api/v1/files are handled here
 */
import { Router } from "express";
import Busboy from "busboy";
import { File, states, buildTempFileName } from "../core/file";
import fs from 'fs';
import scheduler from '../task-scheduler/scheduler';

let router = new Router;

//Route to upload a file to the server and then ultimately store it in the attached dropbox
router.post("/", (req, res) => {
    let busboy = new Busboy({ headers: req.headers });

    let entryId, componentId, originalFileName;     // data that has to be provided in the request
    let tmpFileName;                                // the name of the temporary file on the server

    busboy.on("file", function(fieldname, data, filename, encoding, mimetype) {

        // do not accept multiple files
        if (tmpFileName) {
            return;
        }

        // use a temporary file to save the uploaded document.
        tmpFileName = buildTempFileName();
        
        // remember the file's name.
        originalFileName = filename || 'unknown';

        // stream it to the local temporary file.
        let stream = fs.createWriteStream(tmpFileName);

        stream.on("error", error => {
            console.error(error);
            res.send("File could not be uploaded.");
        });

        stream.on("close", () => { /* Can this be removed? */ });

        data.pipe(stream);
    })
    .on("field", function(fieldname, val) {

        // remember the incoming fields.
        if(fieldname === "entryId"){
            entryId = val;
        } else if (fieldname === "componentId") {
            componentId = val;
        } else {
            res.send("unknown field: " + fieldname);
        }
    })
    .on("finish", function() {

        // store the file if all required parameters where provided.
        if(entryId && componentId && originalFileName && tmpFileName) {

            // get the entry where the file was uploaded for.
            let entry = req.app.core.getEntry(entryId);

            entry.catch(e => {
                console.error(e);
                res.status(400).send("Entry does not exist.");
            });

            // attach the file to the entry
            let changedEntry = entry.then(entry => {
                if(entry.owned_by !== req.session.user.id) throw Error("Unauthorized");
                let components = entry.components;
                components[componentId].file.setToLocalFile(tmpFileName, originalFileName);
                entry.components = components;
                return entry;
            });

            // save the entry in the database.
            let done = changedEntry.then(entry => {
                return res.app.core.updateEntry(entry);
            });

            // answer the http query
            done.then(() => {
                res.send("Upload complete");
            });

            done.catch(() => {
                res.status(500).send('Error');
            });

            // trigger the scheduler to upload the document to dropbox.
            scheduler.trigger();
            
        } else {
            res.status(400).send('Input was incomplete');
        }
        
    })

    req.pipe(busboy)
});

export default router;
