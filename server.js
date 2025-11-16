import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv" ;

dotenv.config();
const app=express();

app.get("/test",(req,res)=>{
      res.status(200).json({message:"le serveur est actif"});
});
app.get("/proxy",async(req,res)=>{
      try{
       const url=req.query.url;
       if(!url)
       return res.status(404).json({error:"you missed the url"});
       
       const response= await fetch(url);
       const data= await response.json();
       
       res.json(data);
      } catch(err){
        console.error(err);
        res.status(500).json({error:"error with the socialcount"});
      } 
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{console.log("le serveur est en marche")})
