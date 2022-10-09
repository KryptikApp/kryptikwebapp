import { getAllDocs } from "../../src/helpers/docs"

export default function handler(req:any, res:any) {
    // Get data submitted in request's body.
    const body = req.body
  
    try{
        const allDocs = getAllDocs({
            fields:[
            "slug",
            "title",
            "lastUpdate",
            "image",
            "oneLiner",
            "content",
            "category",
            "emoji"
        ],
        isDevDocs:true})
        return res.status(200).json({devDocs:allDocs})
    }
    catch(e){
        console.log(e);
        return res.status(400).json({devDocs:null});
    }
  }