import { createReadStream } from "fs"
import multer from "multer";
import { defaultUploadFileResult, IUploadResult, uploadStreamToIpfs } from "../../src/helpers/ipfs";


const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/jpg'];

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: function(req:any, file:any, cb:any) {
    if (ALLOWED_FORMATS.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Not supported file type!'), false);
    }
  }
})


export default function handler(req:any, res:any) {
    // Get data submitted in request's body.
    const body = req.body
  
    // Optional logging to see the responses
    // in the command line where next.js app is running.
    console.log('body: ', body)
    let fileStreamer = createReadStream(body.file);
    let resultFileUpload:IUploadResult = defaultUploadFileResult;
    
    uploadStreamToIpfs(fileStreamer).then((result) =>{
        resultFileUpload = result;
        console.log(resultFileUpload);
    }).catch((err) => {
        //handle error here
        console.log(err);
    });
    // Guard clause checks name and description,
    // and returns early if they are not found
    if (!body.name || !body.description || !body.file) {
      // Sends a HTTP bad request error code
      return res.status(400).
      json({ data: 'Invalid upload: Missing some data' })
    }
    
    // Found the name.
    // Sends a HTTP success code
    res.status(200).json({ data: {} })
  }