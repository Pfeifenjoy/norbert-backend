/**
 * @author Arwed Mett, Simon Oswald
 *
 * These routes are used to create and manage user accounts
 * Requests directed to /api/v1/users are handled here
 * The corresponding database queries etc. can be found in /core/user-queries.js
 */
import { Router } from 'express';
import assert from 'assert';

let router = new Router;
var count = 0;

//Route to create a new user
router.post('/', (req, res) => {
    let { username, name, password } = req.body;
    if(count == 0){
        //Ensure that the username has to be unique
        req.app.core.initUserCollection();
        count += 1;
    }
    //Create the user
    req.app.core.createUser(username, name, password)
    	.then(function (){
	        res.send('User created.');
    	})
    	.catch(function(e){
	        res.status(500).send('Username ' + username +' is already in use');
    	});  
});

//Route to edit a user
router.put('/', (req, res) => {
    let { password_old, password_new } = req.body;
    //Check if the supplied old password is correct
    req.app.core.authUser(req.session.user.username, password_old)
    .then(user => {
        //If its correct, update the user with the new password
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


//Route to delete a user
router.delete("/:userId", (req,res) => {
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

//Route to login and auth the user
router.post("/login", (req, res) => {
    let {username, password} = req.body;  
    if (username === undefined || password === undefined) {
        res.status(400).send('Both username and password have to be provided.');
        return;
    }

    //If password and username are correct, auth the user
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


//Route to log out and clear the session
router.post("/logout" ,(req,res) =>{
    delete req.session.authenticated
    delete req.session.user;
    res.send('User succesfully logged out');
})


//Function used to check if the user is authenticated
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
