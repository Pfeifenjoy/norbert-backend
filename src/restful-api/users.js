/**
 * @author Arwed Mett
 */
import { Router } from 'express';
import assert from 'assert';

const router = new Router;

router.get('/', function(req, res){
	res.send('Hello world!');
})

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

module.exports = router;
