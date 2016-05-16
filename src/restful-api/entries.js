
/**
 * @author Arwed Mett,Simon Oswald
 *
 * These routes are used to handle actions related to the users account
 * Requests directed to /api/v1/entries are handled here
 * The corresponding database queries etc. can be found in /core/entry-queries.js
 */
import { Router } from 'express';
import assert from 'assert';
import { ObjectID }from 'mongodb';
import {Entry} from '../core/entry';

let router = new Router;

//Route to create an entry, also used when accepting a reccommendation
router.post("/", (req, res) => {
    // check the request
    let userObject = req.body;

    // create entry
    let owned_by = req.session.user.id;
    let entry = new Entry();
    entry.userRepresentation = userObject;
    entry.owned_by = owned_by;

    // store
    req.app.core.createEntry(entry).then(entry => {
        res.status(201).send(entry.userRepresentation);
    }).catch(() => {
        res.status(500).send("Could not create entry.")
    });
});

//Route to change an entry
router.put("/:entryId", (req, res) => {
    //Get the entry from the database in it's prior form
    req.app.core.getEntry(req.params.entryId)
    .then(entry => {
        //Overwrite it with the updated values, but first make sure, that the user
        //is not trying to edit someone elses entry
        if(entry.owned_by = req.session.user.id) {
            let title = req.body.title === undefined ? entry.title : req.body.title; 
            let tags = req.body.tags || entry.tags;
            let components = req.body.components || [];

            entry.userRepresentation = {
                title,
                tags,
                components
            }
            //Update the database entry
            return req.app.core.updateEntry(entry);
        }
    })
    .then(entry => {
        //Send the updated entry to the frontend
        res.json(entry.userRepresentation)
    })
    .catch(e => {
        console.error(e);
        res.status(400).send("Could not update entry.")
    })

})

//Route to fetch a specific entry by it's ID
router.get("/:entryId", (req,res) => {
    req.app.core.getEntry(req.params.entryId)
    .then(entry => {
        res.json(
            entry.userRepresentation
        )
    })
    .catch(e => {
        console.error(e);
        res.status(400).send('Could not find entry.')
    })
})

//Route to delete an entry by it's ID
router.delete("/:entryId", (req,res) => {
    //Load the entry
    req.app.core.getEntry(req.params.entryId)
    .then(entry => {
        //Make sure that the user is not trying to delete someone elses entry
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
