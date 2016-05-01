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
    })
})

router.get('/' , (req,res) => {
    req.app.core.getRecommendations(req.session.user.id)
    .then(recommendations => {
        res.json(recommendations)
    })
    .catch(e => {
        console.error(e);
        res.status(500).send("Could not get recommendations.");
    });
})

export default router;
