import { Router } from "express";
import Busboy from "busboy";

let router = new Router;

router.post("/", (req, res) => {
    let busboy = new Busboy({ headers: req.headers });
    busboy.on("file", function(fieldname, file, filename, encoding, mimetype) {
        let fsStream = req.app.core.createTmpFileStream()
        fsStream.on("error", () => {
            res.send("File could not be uploaded");
        })
        fsStream.on("close", () => {
            console.log("end");
        })
        file.pipe(fsStream);
    })
    .on("finish", function() {
        res.send("Upload complete");
    })

    req.pipe(busboy)
});

export default router;
