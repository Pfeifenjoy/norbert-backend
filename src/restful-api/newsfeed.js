/**
 * @author Simon Oswald, Arwed Mett
 */
import { Router } from 'express';
import assert from 'assert';

const router = new Router();
// Route used to get the newsfeed
router.get('/', (req,res) =>{
	let filter = parseInt(req.query.filter) + 1;
	if (req.query.filter === undefined){
		filter = undefined;
	}
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
