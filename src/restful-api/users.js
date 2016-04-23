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
    	.catch(function(e){
	        res.status(500).send('Username ' + username +' is already in use');
    	});  
});

router.put("/:userId", (req, res) => {
    let userId = req.params.userId;
    let user = req.body;
    if(req.session.user.username === userId){
    req.app.core.updateUser(userId, user)
        .then(function (){

            res.send('User updated.');
        })
        .catch(function(){
            res.status(500).send('Username ' + username +' is already in use');
        });
    }else res.send(403).send('You can not change other users');  
});

router.delete("/:userId", (req,res) => {
    let userId = req.params.userId;
    console.log(userId);
    if(req.session.user.username === userId){
    req.app.core.deleteUser(userId)
        .then(function(){
            res.send('User ' + userId + ' was succesfully deleted.');
        })
        .catch(function(){
            res.status(500).send('User ' + userId + ' could not be deleted.');
        });
    }else res.status(403).send('You can not delete other users');
        
});


router.post("/login", (req, res) => {
    let {username, password} = req.body;  
    req.app.core.authUser(username, password)
    .then(user => {
        req.session.user = {
            id      : user._id,
            username: user.username
        };
        req.session.authenticated = true;
        res.send('Succesfully authenticated user ' + username );
    })
    .catch(function(e){
        console.log(e);
        res.status(403).send('Authentication for user ' + username + ' failed');
        });
});

router.post("/logout" ,(req,res) =>{
    let {username} = req.body;
    if(req.session.user.username == username){
        req.session.authenticated = false;
        //because its faster than delete
        req.session.user = undefined;
        res.send('User succesfully logged out');
    }
})

router.authenticate = (req, res, next) => {
    console.log("authentication: " + req.session);
    if(req.session.authenticated) {
        next();
    }
    else {
        res.status(403).send('Could not authenticate');
    }
};

module.exports = router;
