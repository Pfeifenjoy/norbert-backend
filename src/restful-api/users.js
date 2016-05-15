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

router.put('/', (req, res) => {
    let { password_old, password_new } = req.body;
    req.app.core.authUser(req.session.user.username, password_old)
    .then(user => {
        req.app.core.updateUser(user.username, password_new)
        .then(() => {
             res.send('User updated.');
        })
        .catch(e => {
            console.error(e);
            res.status(500).send("Could not update");
        })
    })
    .catch(e => {
            console.error(e);
            res.status(500).send("Could not update");
    })
});

router.delete("/:userId", (req,res) => {
    if(req.params.userId !== req.session.user.username) {
        return res.status(403).send("Unauthorized.");
    }
    req.app.core.deleteUser(req.session.user.username)
    .then(function(){
        res.send('User ' + req.session.user.username + ' was succesfully deleted.');
        delete req.session.user;
    })
    .catch(function(e){
        console.error("could not delete user: " + e);
        res.status(500).send('User ' + req.session.user.username + ' could not be deleted.');
    });   
});


router.post("/login", (req, res) => {
    console.log(req.body);
    let {username, password} = req.body;  
    if (username === undefined || password === undefined) {
        res.status(400).send('Both username and password have to be provided.');
        return;
    }
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
    delete req.session.authenticated
    delete req.session.user;
    res.send('User succesfully logged out');
})

router.authenticate = (req, res, next) => {
    if(req.session.authenticated) {
        console.log('Authenticated ' + req.session.user.username);
        next();
    }
    else {
        console.log('Authentication failed.');
        res.status(403).send('Could not authenticate');
    }
};

module.exports = router;
