/**
 * @author Arwed Mett, Simon Oswald
 */
import { Router } from "express";
import assert from "assert";

let router = new Router;

router.delete('/:id', (req,res) => {
    let entryID = req.params.id;
    req.app.core.deleteRecommendation(entryID,req.session.user.id)
    .then(() =>{
        res.send("Recommendation deleted.");
    })
    .catch((e) => {
        console.log(e);
        res.status(500).send("Could not delete recommendation.");
    });
});

router.get('/' , (req,res) => {
    req.app.core.getRecommendations(req.session.user.id)
    .then(recommendations => {
        res.json(recommendations)
    })
    .catch(e => {
        console.error(e);
        res.status(500).send("Could not get recommendations.");
    });
});

router.post("/:recommendationId", (req, res) => {
    let { recommendationId } = req.params;

    // get the user id 
    let userId = req.session.user.id;

    // get the entry 
    let entry = req.app.core.getEntry(recommendationId);

    // accept 
    let accepted = entry.then(entry => {
        return req.app.core.acceptRecommendation(userId, entry);
    });

    // send a response
    let done = accepted
        .then(newEntry => {
            res.status(200).json(newEntry.userRepresentation);
        })
        .catch(e => {
            res.status(500).send('Could not accept recommendation.');
        });

});

export default router;
