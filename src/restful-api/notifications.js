/**
 * @author Simon Oswald
 */
import { Router } from 'express';

let router = new Router();

router.get('/' , (req,res) => {
	req.app.core.getNotifications(req.session.user.id)
	.then(result => {
		res.status(200).send(result);
	})
	.catch(e => {
		console.error(e);
		res.status(500).send('Something went wrong');
	})
})


module.exports = router;