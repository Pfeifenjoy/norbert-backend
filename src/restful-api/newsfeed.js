/**
 * @author Simon Oswald
 */
import { Router } from 'express';
import assert from 'assert';

const router = new Router();

router.get('/', (req,res) =>{
    //console.log(req.app.core.getNewsfeed(req.session.user.id));
    req.app.core.getNewsfeed(req.session.user.id)
      .then(newsfeed => {
        let merged = splitNmerge(newsfeed);
        let newsfeedJson = merged.map(newsfeedObject => newsfeedObject.userRepresentation);
        res.status(200).send(newsfeedJson)
        /*sortNewsfeed(merged)
        .then(sorted_newsfeed => {
          res.send(sorted_newsfeed);
        })*/
      })
        /*.then(newsfeed => {
            let newsfeedJson = newsfeed.map(newsfeedObject => newsfeedObject.userRepresentation);
            res.status(200).send(newsfeedJson);
        })*/.catch(err => {
            res.status(500);
            console.log(err);
        });
        //let newsfeedJson = newsfeed.map(newsfeedObject =>  newsfeedObject.userRepresentation);
        //res.status(200).send(newsfeed);
})

function splitNmerge([a,b]){
  return a.concat(b);
}

function sortNewsfeed(newsfeed){
  console.log(1);
   return new Promise(function (fulfill,reject){
    let sortedŃewsfeed = newsfeed.sort(compare);
    console.log(2);
      resolve(sortedŃewsfeed);
    })
}

function compare(a,b){
  let relevA = Math.abs(a.created_at - Date.now());
  let relevB = Math.abs(b.created_at - Date.now());
  console.log(relevA, relveB);
  if(relevA > relevB) 
    return -1;
  else if(relevA < relevB) 
    return 1;
  else 
    return 0;
}

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
