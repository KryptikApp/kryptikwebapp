import pinataClient, { PinataClient } from "@pinata/sdk";
import axios from "axios";
import { ReadStream } from "fs";

const urlPinataFile:string = "https://api.pinata.cloud/pinning/pinFileToIPFS";

if(!process.env.PINATA_PUBLIC_KEY || !process.env.PINATA_PRIVATE_KEY){
    throw(new Error("Error: PInata api keys not set as environment variable."));
}

let pinata = pinataClient(process.env.PINATA_PUBLIC_KEY, process.env.PINATA_PRIVATE_KEY);


export interface IUploadResult {
    // This is the IPFS multi-hash provided back for your content
    IpfsHash: string,
    // This is how large (in bytes) the content you just pinned is
    PinSize: number,
    // This is the timestamp for your content pinning (represented in ISO 8601 format)
    Timestamp: string,
    IpfsUrl: string
}

export const defaultUploadFileResult:IUploadResult = {
    IpfsHash: "set me!",
    PinSize: 0,
    // This is the timestamp for your content pinning (represented in ISO 8601 format)
    Timestamp: "set me!",
    IpfsUrl: "set me!"
}

const urlFromHash = (hash:string) =>{
    return "https://gateway.pinata.cloud/ipfs/" + hash;
}

// uploads filestream to Ipfs via pinata
export const uploadStreamToIpfs = async (readableStreamForFile:ReadStream): Promise<IUploadResult> => {
    let newIpfsResult = defaultUploadFileResult;
    if(!process.env.PINATA_PUBLIC_KEY || !process.env.PINATA_PRIVATE_KEY){
        throw(new Error("Error: PInata api keys not set as environment variable."));
    }
    axios
    .post(urlPinataFile, readableStreamForFile, {
        headers: {
            pinata_api_key: process.env.PINATA_PUBLIC_KEY,
            pinata_secret_api_key: process.env.PINATA_PRIVATE_KEY,
        }
    }).then((result)=>{
        //handle results here
        console.log("Pinata file upload result");
        console.log(result);
        newIpfsResult = {
            ...result.data,
            IpfsUrl: urlFromHash(result.data.IpfsHash)
        }
    }).catch((err) => {
        //handle error here
        console.log(err);
    });
    
    return newIpfsResult;
}

// uses pinata to upload json to ipfs.. return link to that data
// used for uploading nft metadata
export const uploadJsonToIpfs = async(jsonInput:Object): Promise<string> => {
    let pinUrl: string = "Not set yet!";
    console.log("Sending json input:");
    console.log(jsonInput);
    
    pinata.pinJSONToIPFS(jsonInput).then((result)=>{
        console.log("Pinata upload result:");
        console.log(result);
        pinUrl = urlFromHash(result.IpfsHash);
    }).catch((err)=>{
        // handle error
        console.log(err);
    });
    // axios
    // .post(urlPinataFile, jsonInput, {
    //     headers: {
    //         pinata_api_key: pinataConfig.apiKey,
    //         pinata_secret_api_key: pinataConfig.apiKeySecret,
    //     }
    // }).then((result)=>{
    //     //handle results here
    //     console.log("Pinata file upload result");
    //     console.log(result);
    //     pinUrl = urlFromHash(result.data.IpfsHash);
    // }).catch((err) => {
    //     //handle error here
    //     console.log(err);
    // });
    return pinUrl;
}