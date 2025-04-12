const express = require('express');       // load express module
const nedb = require("nedb-promises");    // load nedb module

//bcrypt
const bcrypt=require('bcrypt');
const fs=require('fs')

const HASH_FILE='passwords.txt';
const SALT_ROUNDS=10;



const app = express();                    // init app
const db = nedb.create('users.jsonl');    // init db

app.use(express.static('public'));        // enable static routing to "./public" folder


//TODO:
// automatically decode all requests from JSON and encode all responses into JSON
app.use(express.json()) //converts all responses into json

app.get('/users',(req,response)=>{
    db.find({}) //gets all data from db
    .then(docs=>response.send(docs))
    .catch(error=>response.send({error}));
});


app.get('/users/:username',(request,response)=>{
    db.findOne({username:request.params.username}) //gets all data from db
    .then(docs=>response.send(docs))
    .catch(error=>response.send({error}));
});


app.post('/users',(request, response) => {
    const { username, password, email, name } = request.body;
  
    if (!username || !password || !email || !name) {
      return response.send({ error: 'Missing fields.' });
    }

    return bcrypt.hash(password, SALT_ROUNDS)
  .then(hashedPassword => {
    return db.insertOne({ username, password: hashedPassword, email, name })
      .then(result => {
        fs.promises.writeFile(HASH_FILE, hashedPassword);
        response.send({ ok: true, result });
      });
  })
    .catch(error => {response.send({error});
      });
  });
  
  

  app.patch('/users/:username', (request, response) => {
    db.updateOne(
      { username: request.params.username },
      { $set: request.body }
    )
    .then(result => {
      if (result === 1) {
        response.send({ ok: true });
      } else {
        response.status(404).send({ error: 'User not found.' });
      }
    })
    .catch(error => response.status(500).send({ error }));
  });

  app.delete('/users/:username', (request, response) => {
    db.deleteOne({ username: request.params.username })
      .then(result => {
        if (result === 1) {
          response.send({ ok: true });
        } else {
          response.status(404).send({ error: 'User not found.' });
        }
      })
      .catch(error => response.status(500).send({ error }));
  });
  
// default route
app.all('*',(req,res)=>{res.status(404).send('Invalid URL.')});

// start server
app.listen(3000,()=>console.log("Server started on http://localhost:3000"));
