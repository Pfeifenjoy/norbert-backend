/**
 * @author Simon Oswald
 */
import { Router } from 'express';
var router = new Router();

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
