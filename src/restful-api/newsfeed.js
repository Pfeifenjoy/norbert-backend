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

router.delete('/recommendation/:id', (req,res) => {
  let entryID = req.params.id;
  req.app.core.deleteRecommendation(entryID,req.session.user.id)
  .then(() =>{
    res.send("Kappa");
  })
  .catch((e) => {
    console.log(e);
  })
})

router.get('/reccomendation' , (req,res) => {
  var cursor = req.app.core.getReccomendations(req.session.user.id)
  var recommendations = [];
  cursor.each(function(err,doc){
      assert.equal(err,null);
      if(doc != null){
          recommendations.push(doc);
          }else{
        console.log(recommendations);
        res.send(recommendations);
        }   
    });  
})

module.exports = router;
