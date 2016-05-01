/**
 * @author Simon Oswald
 */
import { Router } from 'express';

let router = new Router();

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