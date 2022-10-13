import { getAllDocs } from "../../src/helpers/docs"
import { DocTypeEnum } from "../../src/helpers/docs/types";

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
        docEnum:DocTypeEnum.DevDoc})
        return res.status(200).json({devDocs:allDocs})
    }
    catch(e){
        console.log(e);
        return res.status(400).json({devDocs:null});
    }
  }