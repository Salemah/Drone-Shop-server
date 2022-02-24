const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
const admin = require("firebase-admin");

const serviceAccount = require("./jst.json");




app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1]
    try {
      const decodedUser = await admin.auth().verifyIdToken(token);
      req.decodedEmail = decodedUser.email;
      console.log(req.decodedEmail);

    }
    catch {

    }
  }
  next();
}



const uri = "mongodb+srv://mydb1:mydb1@cluster0.rojhc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const database = client.db("droneshop");
    const dronesCollection = database.collection("drones");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");
    const reviewCollection = database.collection("review");
    // console.log('connection success');
    //drones get
    app.get('/alldrone', async (req, res) => {

      const result = await dronesCollection.find({}).toArray();
      res.send(result);

    })
    //
     //drones delete
     app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await dronesCollection.deleteOne(query);
      res.json(result);
      console.log(result)
    });
    //add products
    app.post('/addproducts', async (req, res) => {
      const result = await dronesCollection.insertOne(req.body);
      res.send(result);
    });
    // order
    app.post('/orders', async (req, res) => {
      const result = await ordersCollection.insertOne(req.body);
      res.send(result);
    });
    //myorder
    app.get('/myorder', async (req, res) => {
      const email = req.query.email;
      const query = { email: email }

      const result = await ordersCollection.find(query).toArray();
      res.send(result);
      console.log(result);
    })
    //inser user
    app.post('/adduser', async (req, res) => {
      const user = req.body;
      //console.log(user);
      const result = await usersCollection.insertOne(user);
      res.send(result);

    })
    //put user
    app.put('/adduser', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updatedoc = { $set: user }
      const result = await usersCollection.updateOne(filter, updatedoc, options);
      res.send(result);

    })
    //admin check
    //get user
    app.get('/adduser/:email', async (req, res) => {
      const user = req.params.email;
      const query = { email: user }
      //console.log(user);
      const result = await usersCollection.findOne(query);
      let isAdmin = false;
      if (result?.role === 'admin') {
        isAdmin = true;
      }
      res.send({ admin: isAdmin });

    });
    app.put('/users/makeadmin', verifyToken, async (req, res) => {
     
      const user = req.body;
      const requester = req.decodedEmail;
      if (requester) {
        const requesterAccount = await usersCollection.findOne({ email: requester });
        if (requesterAccount.role === 'admin') {
          const filter = { email: user.email };
          const updatedoc = { $set: { role: 'admin' } }
          const result = await usersCollection.updateOne(filter, updatedoc);
          res.send(result);
        }}
        else {
          res.status(403).json({ message: 'Acces denied' })
        }
   
    })
      //all order
      app.get('/allorder', async (req, res) => {
        const cursor = await ordersCollection.find({}).toArray();
        res.send(cursor);
      });
      //DELETE APOI
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    
    });
    //put order status
    app.put("/order/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "approved"
        },
      };
      const result = await ordersCollection.updateOne(filter, updateDoc);
      res.json(result);
    
    });
     //review post
     app.post('/review', async (req, res) => {

      const cursor = await reviewCollection.insertOne(req.body);
      res.send(cursor);
    });
    //get review
    app.get('/review', async (req, res) => {
     

      const result = await reviewCollection.find({}).toArray();
      res.send(result);
   
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