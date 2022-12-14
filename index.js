const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

app.use(cors())
app.use(express.json());


app.get('/', (req, res)=>{
    res.send('server is running')
})
//connect to database


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@crumb-cooking.shezpsi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//service collection
const serviceCollection = client.db('cooking').collection('services')
//service collection
const reviewCollection = client.db('cooking').collection('review')

async function run(){
    try{
                                    ///////////////////
        ////////////////////////////////service area//////////////////
                                    ///////////////////
        //get all services data
        app.get('/services', async(req, res)=>{
            const size = parseInt(req.query.size)
            const query = {}
            const options = {
                sort: { "time": -1 },
              };
            const cursor = serviceCollection.find(query, options)
            const result = await cursor.limit(size).toArray()
            res.send(result)
        })

        //get single service data
        app.get('/serviceDetail/:id', async(req, res)=>{
            const id = req.params.id;
            const query ={_id: ObjectId(id)}
            const result = await serviceCollection.findOne(query);
            res.send(result)
        })

        //add service
        app.post('/services', async(req, res)=>{
            const service = req.body;
            const result = await serviceCollection.insertOne(service)
            res.send(result);
        })
                                    ///////////////////
        ////////////////////////////////Review area//////////////////
                                    ///////////////////

        //post Reviews
        app.post('/reviews', async(req, res) =>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result)
        })

        //get review by id (service detail page)
        app.get('/review/:id',async(req, res)=>{
            let query = {}
            const id = req.params.id
            if(id){
                query ={
                    service: id
                }
            }
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray()
            res.send(result)
        })

        //delete review (my review page)
        app.delete('/review/:id', async(req, res)=>{
            const id = req.params.id
            const query= {_id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })

        //get myReview by email (my review page)
        app.get('/myReviews', async(req, res)=>{
            let query ={}
            const email = req.query.email;
            if(email){
                query={
                    email: email
                }
            }
            const cursor = reviewCollection.find(query);
            const result =await cursor.toArray();
            res.send(result)
        })

            //////////////////////review edit page/////////////

        //get review single data (reviewEdit page)
        app.get('/reviewEdit/:id',async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await reviewCollection.findOne(query);
            res.send(result)
        })

        //edit review (reviewEdit page)
        app.patch('/reviewEdit/:id', async(req, res)=>{
            const id = req.params.id;
            const dataInfo = req.body;
            const query = {_id: ObjectId(id)}
            const updateReview = {
                $set: {
                    review : dataInfo.review
                }
            }
            const result = await reviewCollection.updateOne(query, updateReview)
            res.send(result)
        })
    }
    finally{}
}

run().catch(err =>console.error(err))


app.listen(port)