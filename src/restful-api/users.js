/**
 * @author Arwed Mett
 */
import { Router } from 'express';
import assert from 'assert';

const router = new Router;

router.post('/', (req, res) => {
    let { username, password } = req.body;
    req.app.core.createUser(username, password)
    	.then(function (){
	        res.send('User created.');
    	})
    	.catch(function(){
	        res.send('Oh oh...');
    	});
});
router.put('/:userId',(req,res) => {
    let userID = req.params.userID;
    let json = req.body;

});

module.exports = router;
