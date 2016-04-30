/**
 * @author Simon Oswald, Arwed Mett
 */
import { Router } from 'express';
import assert from 'assert';

const router = new Router();

router.get('/', (req,res) =>{
    req.app.core.getNewsfeed(req.session.user.id)
    .then(newsfeed => {
        res.json(newsfeed)
    })
    .catch(err => {
        console.log(err);
        res.status(500).send("could not generate newsfeed.");
    });
})

module.exports = router;
