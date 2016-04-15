/**
 * @author Arwed Mett
 */
import { Router } from "express";
import assert from "assert";

const router = new Router;


router.post("/users", (req, res) => {
    let { username, password } = req.body;
    req.app.db.collection("users").insertOne({
        username, password
    }, (err, result) => {
        assert.equal(err, null);
        res.send("User created.");
    })
});

export default router;
