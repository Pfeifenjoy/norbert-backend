/**
 * @author Simon Oswald
 */
import { Router } from 'express';
import assert from 'assert';

const router = new Router();

router.get('/:userId', (req,res) =>{
    console.log(req.params.userId);
    if(req.params.userId === req.session.user.id){
        var cursor = req.app.core.getNewsfeed(req.params.userId);
          var entries = [];
          cursor.each(function(err,doc){
          assert.equal(err,null);
          if(doc != null){
              //console.log(doc);
              entries.push(doc);
              //console.log(entries)
              }else{
            console.log(entries);
            res.send(entries);
            }   
        });  
    }
})

module.exports = router;