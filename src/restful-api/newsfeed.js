/**
 * @author Simon Oswald
 */
import { Router } from 'express';
import assert from 'assert';

const router = new Router();

router.get('/', (req,res) =>{
    var cursor = req.app.core.getNewsfeed(req.session.user.id);
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
})

module.exports = router;
