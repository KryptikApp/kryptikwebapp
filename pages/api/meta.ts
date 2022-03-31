import { defaultUploadFileResult, IUploadResult, uploadJsonToIpfs, uploadStreamToIpfs } from "../../helpers/ipfs";


export default function handler(req:any, res:any) {
    console.log("Submit metadata intitated....");
    // Get data submitted in request's body.
    const body = JSON.parse(req.body)
    console.log("Body:");
    console.log(body);
    // Optional logging to see the responses
    // in the command line where next.js app is running.

    const metadata = {
        name: body.name,
        image: body.image,
        description: body.description
      };
    
      console.log(metadata);
    
    uploadJsonToIpfs(metadata).then((result)=>{
        console.log("Pinned! Here is the link:");
        console.log(result);
    }).catch((err)=>{
        console.log(err);
    });

    // Guard clause checks for first and last name,
    // and returns early if they are not found
    if (!body.name) {
      // Sends a HTTP bad request error code
      return res.status(400).
      json({ data: 'Invalid upload: JSON metadata' })
    }
    
    // Found the json meta
    // Sends a HTTP success code
    res.status(200).json({ data: {} })
  }