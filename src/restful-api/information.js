/**
 * @author Simon Oswald
 *
 * These routes are used to handle actions regarding specific Information
 * Requests directed to /api/v1/information are handled here
 * The corresponding database queries etc. can be found in /core/information-queries.js
 */
import { Router } from 'express';

let router = new Router();

//Route to hide a specific Information for this user
router.delete("/:informationId", (req,res) => {
	req.app.core.hideInformation(req.session.user.id,req.params.informationId)
	.then(() => {
		res.send('Succesfully hid Information');
	})
	.catch(e => {
		console.error(e);
		res.status(500).send('Could not hide Information');
	})
})

module.exports = router;