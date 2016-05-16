/**
 * @author Simon Oswald, Arwed Mett
 *
 * These routes are used to supply the Newsfeed to the user
 * Requests directed to /api/v1/newsfeed are handled here
 * The corresponding database queries etc. can be found in /core/newsfeed-queries.js
 */
import { Router } from 'express';
import assert from 'assert';

let router = new Router();

// Route used to get the newsfeed for this user
router.get('/', (req,res) =>{
    //Filter is used to limit the number of elements in the newsfeed
    //By default the number is 50
	let filter = parseInt(req.query.filter) + 1;
	if (req.query.filter === undefined){
		filter = undefined;
	}
    //Build the newsfeed
    req.app.core.getNewsfeed(req.session.user.id, filter)
        .then(newsfeed => {
            res.json(newsfeed)
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("could not generate newsfeed.");
        });
})

module.exports = router;
