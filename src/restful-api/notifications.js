import { Router } from 'express';

let router = new Router();

router.get('/' , (req,res) => {
	req.app.core.getNotifications(req.session.user.id, 'i')
	.then(([infos,entries]) => {
		let notifications = infos.concat(entries);
		var result = [];
		notifications.forEach(function(element,index){
			//console.log(element.components);
			result.push({id : element._id, created_at : element.created_at});
	})
		res.status(200).send(result);
	})
	.catch(e => {
		console.error(e);
		res.status(500).send('Something went wrong');
	})
})


module.exports = router;