/**
 * @author Simon Oswald
 */
import { Router } from 'express';
import assert from 'assert';

const router = new Router();

router.get('/', (req,res) =>{
    req.app.core.getNewsfeed(req.session.user.id)
        .then(newsfeed => {
            let newsfeedJson = newsfeed.map(entry => entry.userRepresentation);
            res.status(200).send(newsfeedJson);
        }).catch(err => {
            res.status(500);
            console.log(err);
        });
})

module.exports = router;
