const express = require('express');       // load express module
const nedb = require("nedb-promises");    // load nedb module

const app = express();                    // init app
const db = nedb.create('users.jsonl');    // init db

app.use(express.static('public'));        // enable static routing to "./public" folder

//TODO:
// automatically decode all requests from JSON and encode all responses into JSON
app.use(express.json()) //converts all responses into json

//TODO:
// create route to get all user records (GET /users)
//   use db.find to get the records, then send them
//   use .catch(error=>res.send({error})) to catch and send errors
app.get('/users',(req,response)=>{
    db.find({}) //gets all data from db
    .then(docs=>response.send(docs))
    .catch(error=>response.send({error}));
});

//TODO:
// create route to get user record (GET /users/:username)
//   use db.findOne to get user record
//     if record is found, send it
//     otherwise, send {error:'Username not found.'}
//   use .catch(error=>res.send({error})) to catch and send other errors
app.get('/users/:username',(request,response)=>{
    db.findOne({username:request.params.username}) //gets all data from db
    .then(docs=>response.send(docs))
    .catch(error=>response.send({error}));
});
//TODO:
// create route to register user (POST /users)
//   ensure all fields (username, password, email, name) are specified; if not, send {error:'Missing fields.'}
//   use findOne to check if username already exists in db
//     if username exists, send {error:'Username already exists.'}
//     otherwise,
//       use insertOne to add document to database
//       if all goes well, send returned document
//   use .catch(error=>res.send({error})) to catch and send other errors

app.post('/users', (request, response) => {
    const { username, password, email, name } = request.body;
  
    if (!username || !password || !email || !name) {
      return response.send({ error: 'Missing fields.' });
    }

    db.findOne({ username })
      .then(exists => {
        if (exists) {
          return response.send({ error: 'Username already exists.' });
        }
        return db.insertOne({ username, password, email, name })
          .then(result => {
            response.send(result); 
          });
      })
      .catch(error => {response.send({error});
      });
  });
  
  
//TODO:
// create route to update user doc (PATCH /users/:username)
//   use updateOne to update document in database
//     updateOne resolves to 0 if no records were updated, or 1 if record was updated
//     if 0 records were updated, send {error:'Something went wrong.'}
//     otherwise, send {ok:true}
//   use .catch(error=>res.send({error})) to catch and send other errors
app.patch('/users/:username',(request,response)=>{
    const update= db.updateOne(
        {username:request.params.username},
        {$set:request.body}
    )
    .then(()=> {
        if(update==1){
            response=>response.send({ok:true})
            console.log('yes updated')
        }else{
            error('something went wrong')
        }
})
    .catch(error=>response.send(error))
}
)


//TODO:
// create route to delete user doc (DELETE /users/:username)
//   use deleteOne to update document in database
//     deleteOne resolves to 0 if no records were deleted, or 1 if record was deleted
//     if 0 records were deleted, send {error:'Something went wrong.'}
//     otherwise, send {ok:true}
//   use .catch(error=>res.send({error})) to catch and send other errors

app.delete('/users/:username',(request,response)=>{
    const deleted = db.deleteOne(
        {username:request.params.username})
        .then(()=>{
            if(deleted==1){
                response=>response.send({ok:true})
                //console.log('yes deleted')
            }else{
                error('something went wrong')
            }
        })
        .catch(error=>response.send(error))
})
// default route
app.all('*',(req,res)=>{res.status(404).send('Invalid URL.')});

// start server
app.listen(3000,()=>console.log("Server started on http://localhost:3000"));
