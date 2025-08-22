import {redis} from 'redis';


const client = redis.createClient();

client.on('error', (err) =>{
    console.log("There was an error connecting to redis: " + err)
})



client.on('ready', ()=>{
    console.log("client is ready");
})
await client.connect();

export default client;





