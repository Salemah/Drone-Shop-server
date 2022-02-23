const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://mydb1:mydb1@cluster0.rojhc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
      await client.connect();
      const database = client.db("droneshop");
      const dronesCollection = database.collection("drones");
console.log('connection success');
      //drones get
      app.get('/alldrone',async(req,res)=>{

        const result = await dronesCollection.find({}).toArray();
        res.send(result);
        console.log(result);
      })
      
      
    } 
    finally {
      //await client.close();
    }
  }
  run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})