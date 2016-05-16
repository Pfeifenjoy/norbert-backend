/**
 * @author Simon Oswald
 *
 * These routes are used to search for entries/information based on tags
 * Requests directed to /api/v1/search are handled here
 * The corresponding database queries etc. can be found in /core/search-queries.js
 */
import { Router } from 'express';
let router = new Router();

//Route to search for Entries/Information based on tags
router.get('/',(req,res) => {
	req.app.core.search(req.query.keywords,req.session.user)
	.then( results => {
		res.send(results);
	})
	.catch(e => {
		console.error(e);
		res.status(500).send('error');
	})
})

module.exports = router;
