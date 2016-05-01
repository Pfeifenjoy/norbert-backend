/**
 * @author Arwed Mett
 */
import { Router } from "express";
import Busboy from "busboy";
import { UniqueFile, states } from "../core/file";

let router = new Router;

router.post("/", (req, res) => {
    let busboy = new Busboy({ headers: req.headers });
    let entryId, componentId;
    let file = new UniqueFile;
    let originalFileName = "unknown";

    function updateEntry() {
        if(entryId && componentId && file.state === states.local_file) {
            req.app.core.getEntry(entryId)
            .then(entry => {
                if(entry.owned_by !== req.session.user.id) throw Error("Unauthorized");
                let { components } = entry;
                components[componentId].file = file;
                components[componentId].originalFileName = originalFileName;
                entry.components = components;
                return req.app.core.updateEntry(entry);
            })
            .catch(e => {
                console.error(e);
                res.status(400).send("Entry does not exist.");
            });
        }
    }

    busboy.on("file", function(fieldname, data, filename, encoding, mimetype) {
        let { stream } = file;
        stream.on("error", error => {
            console.error(error);
            res.send("File could not be uploaded");
        })
        stream.on("close", () => {
            file.state = states.local_file
            originalFileName = filename;
            updateEntry();
        })
        data.pipe(stream);
    })
    .on("field", function(fieldname, val) {
        if(fieldname === "entryId"){
            entryId = val;
        } else if (fieldname === "componentId") {
            componentId = val;
        } else {
            res.send("unknown field: " + fieldname);
        }
        updateEntry();
    })
    .on("finish", function() {
        res.send("Upload complete");
    })

    req.pipe(busboy)
});

export default router;
