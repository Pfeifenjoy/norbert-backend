
/**
 * @author Arwed Mett,Simon Oswald
 */
import { Router } from 'express';
import assert from 'assert';
import { ObjectID }from 'mongodb';
import {Entry} from '../core/entry';

let router = new Router;

router.post("/", (req, res) => {
    // check the request
    let userObject = req.body;

    // create entry
    let owned_by = req.session.user.id;
    let entry = new Entry();
    entry.userRepresentation = userObject;
    entry.owned_by = owned_by;

    console.log(entry);
    // store
    req.app.core.createEntry(entry).then(entry => {
        res.status(201).send(entry.userRepresentation);
    }).catch(() => {
        res.status(500).send("Could not create entry.")
    });
});


router.put("/:entryId", (req, res) => {
    req.app.core.getEntry(req.params.entryId)
    .then(entry => {
        if(entry.owned_by = req.session.user.id) {
            let {title, tags, components} = req.body;
            entry.userRepresentation = {
                title: title || entry.title,
                tags: tags || entry.tags,
                components: components || entry.components
            }
            return req.app.core.updateEntry(entry);
        }
    })
    .then(entry => {
        res.json(entry.userRepresentation)
    })
    .catch(e => {
        console.error(e);
        res.status(400).send("Could not update entry.")
    })

})

router.get("/:entryId", (req,res) => {
    req.app.core.getEntry(req.params.entryId)
    .then(entry => {
        res.json({
            entry
        })
    })
    .catch(e => {
        console.error(e);
        res.status(400).send('Could not find entry.')
    })
})

router.delete("/:entryId", (req,res) => {
    req.app.core.getEntry(req.params.entryId)
    .then(entry => {
        if(entry.owned_by = req.session.user.id) {
            return req.app.core.deleteEntry(entry);
        }
    })
    .then(function(){
        res.send('Deleted Entry.');
    })
    .catch(e => {
        console.error(e);
        res.status(500).send('Could not delete entry.');
    })
})

export default router;
