/**
 * @author Arwed Mett, Simon Oswald
 */
import { Router } from 'express';
import assert from 'assert';

const router = new Router;
var count = 0;



router.post('/', (req, res) => {
    let { username, name, password } = req.body;
    if(count == 0){
        req.app.core.initUserCollection();
    }
    req.app.core.createUser(username, name, password)
    	.then(function (){
	        res.send('User created.');
    	})
    	.catch(function(){
	        res.send('Username ' + username +' is already in use');
    	});  
});

router.put("/:userId", (req, res) => {
    let userId = req.params.userId;
    let user = req.body;
    req.app.core.updateUser(userId, user)
        .then(function (){
            res.send('User updated.');
        })
        .catch(function(){
            res.send('Username ' + username +' is already in use');
        });  
});


module.exports = router;
