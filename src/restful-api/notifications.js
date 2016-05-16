/**
 * @author Simon Oswald
 * 
 * These routes are used to fetch all entries and information with a notification component
 * Requests directed to /api/v1/notifications are handled here
 * The corresponding database queries etc. can be found in /core/notification-queries.js
 */
import { Router } from 'express';

let router = new Router();

//Route to fetch alle entries and information with a notification component
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