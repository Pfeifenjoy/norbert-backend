/**
 * @author Arwed Mett, Simon Oswald
 *
 * These routes are used to handle actions related to recommendations
 * Requests directed to /api/v1/recommedations are handled here
 * The corresponding database queries etc. can be found in /core/newsfeed-queries.js
 */
import { Router } from "express";
import assert from "assert";

let router = new Router;

//Route to remove a recommendation for this user
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

//Route to fetch the recommendations for this user
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
