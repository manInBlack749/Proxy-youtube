const express from "express";
const fetch from "node-fetch";
const dotenv from "dotenv" ;

dotenv.config();
const app=express();

app.get("/proxy",async(req,res)=>{
      try{
       const url=req.query.url;
       if(!url)
       res.status(404).json({error:"you missed the url"});
       
       const response= await fetch(url);
       const data= await response.json();
       
       res.json(data);
      } catch(err){
        console.error(err);
        res.status(500).json({error:"error with the socialcount");
      } 
});

const PORT = process.env.PORT || 3000;
app.listener(PORT,()=>{console.log("le serveur est en marche")})
