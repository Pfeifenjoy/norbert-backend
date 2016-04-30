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

router.get('/recomendation' , (req,res) => {
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

/*router.get('/information' ,  (req,res) => {
  req.app.core.getInformation(req.session.user.id)
        .then(newsfeed => {
            let newsfeedJson = newsfeed.map(entry => entry.dbRepresentation);
            res.status(200).send(newsfeedJson);
        }).catch(err => {
            res.status(500);
            console.log(err);
        });
})*/

module.exports = router;
