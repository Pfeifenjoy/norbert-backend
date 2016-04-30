/**
 * @author Arwed Mett
 */
import { Router } from "express";
import Busboy from "busboy";
import { UniqueFile, local_file } from "../core/file";

let router = new Router;

router.post("/", (req, res) => {
    let busboy = new Busboy({ headers: req.headers });
    let entryId, componentId;
    let file = new UniqueFile;

    busboy.on("file", function(fieldname, data, filename, encoding, mimetype) {
        let { stream } = file;
        stream.on("error", error => {
            console.error(error);
            res.send("File could not be uploaded");
        })
        stream.on("close", () => {
            file.state = local_file
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
        if(componentId && entryId) {
            req.app.core.getEntry(entryId)
            .then(entry => {
                let { userRepresentation } = entry;
                delete userRepresentation.id;
                let documentComponent = userRepresentation.components[componentId];
                documentComponent.file = file;
                entry.userRepresentation = userRepresentation;
                return req.app.core.updateEntry(entry);
            })
            .catch(e => {
                console.error(e);
                res.status(400).send("Entry does not exist.");
            });
        }
    })
    .on("finish", function() {
        res.send("Upload complete");
    })

    req.pipe(busboy)
});

export default router;
