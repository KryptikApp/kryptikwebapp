import type { NextPage } from 'next'
import { useState } from 'react'
import { storage } from '../src/helpers/firebaseHelper'
import { getDownloadURL, ref, StorageReference, uploadBytes } from 'firebase/storage'
import toast, { Toaster } from 'react-hot-toast'


const CreateNft: NextPage = () => {

 
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("media/imgPlaceholder.png");
  let fileInit:Blob = new Blob();
  //UNCOMMENT for file uploads
  const [image, setImage] = useState(fileInit);


  const uploadToClient = (event:any) => {
    if (event.target.files && event.target.files[0]) {
      // extract file from event
      const i:any = event.target.files[0];
      // save file data
      setImage(i);
      // set local image url for display
      setImageUrl(URL.createObjectURL(i));
    }
  };

  // const handleClickUpload = async () =>{
    
    // console.log("Uploading image file!");
    // let imageStream = await fetch("media/imgPlaceholder.png");
    // console.log("browser created image stream:");
    // console.log(imageStream);
    // var result:IUploadResult = await uploadStreamToIpfs(imageStream.body);
    // console.log("IPFS upload result:");
    // console.log(result);
    // const body = new FormData();
    // body.append("file", image);
    // body.append("name", name);
    // body.append("last", description);
    // console.log("-------------------Submitting upload data----------------------");
    // let bodySubmit = JSON.stringify(body);
    // const response = await fetch("/api/form", {
    //   method: "post",
    //   body: bodySubmit
    // });
    // console.log(response);

  // }

  const urlFromRef = async(storageRef:StorageReference):Promise<string>=>{
    let urlResult:string = await getDownloadURL(storageRef);
    return urlResult;
  }

  const uploadToRemote = async():Promise<string>=>{
    console.log("firebase image upload starting....");
    const storageRef = ref(storage, imageUrl);
    // placeholder for upload return url
    let imageUploadUrl:string = "https://picsum.photos/200";
    // upload image to firebase
    uploadBytes(storageRef, image).then(async (snapshot) => {
      console.log("Snapshot:");
      console.log(snapshot);
      imageUploadUrl = await urlFromRef(storageRef);
    });
    return imageUploadUrl;
  }


  const handleClickUpload = async() =>{
    // upload file to firebase
    try{
      let urlImageUpload = await uploadToRemote();
      console.log("Image url:");
      console.log(urlImageUpload);
      toast.success("NFT succesfully uploaded!");
    }
    catch(e){
      toast.error("Error uploading image.");
    }
    
    //  THE COMMENT BELOW WILL BE USEFUL FOR UPLOADING METADATA TO IPFS
    // JUST REPLACE THE FIREBASE URL WITH IPFS PATH AS SPECIFICIED IN DOC.
    // const metadata = {
    //   name: name,
    //   image: urlImageUpload,
    //   description: description
    // };
    // let bodySubmit = JSON.stringify(metadata);
    // console.log("Submitting upload data to IPFS:");
    // console.log(bodySubmit);
    // const response = await fetch("/api/meta", {
    //   method: "post",
    //   body: bodySubmit
    // });
    // console.log(response);
  }

  return (
    
    <div>
        <Toaster/>
        <div className="h-[2rem]">
          {/* padding div for space between top and main elements */}
        </div>

        <div className="container grid md:grid-cols-2 gap-10 mx-auto place-items-center">
            <div className="w-full rounded">
              <img src={imageUrl} alt="image sneak peak" className="shadow rounded h-auto align-middle border-none" />
            </div>
            <div className="w-full rounded">
            <h5 className="mb-3 text-base font-bold text-black-900 lg:text-xl dark:text-white">
                  Create NFT
              </h5>

                      <label className="form-label inline-block mb-2 text-gray-700">
                        Image Path</label>
                        {/* <input type="text" placeholder="ex: https://picsum.photos/200/300.jpg" id="imageUrl" name="imageUrl"
                        className="block
                        w-full
                        px-2
                        py-1.5
                        text-xl
                        font-normal
                        text-gray-700
                        bg-white bg-clip-padding
                        border border-solid border-gray-300
                        rounded
                        transition
                        ease-in-out
                        m-0
                        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" required onChange={(e) => setImageUrl(e.target.value)}></input> */}
                        <input className="form-control
                        block
                        w-full
                        px-3
                        py-1.5
                        text-base
                        font-normal
                        text-gray-700
                        bg-white bg-clip-padding
                        border border-solid border-gray-300
                        rounded
                        transition
                        hover:cursor-pointer
                        ease-in-out
                        m-0
                        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" type="file" id="file" name="file" onChange={uploadToClient} required/>
                      <label className="form-label inline-block mb-2 text-gray-700">
                      Name</label>
                                
                      <input type="text" placeholder="The Big Rainbow, Red Rocket, etc." id="name" name="name"
                        className="block
                        w-full
                        px-2
                        py-1.5
                        text-xl
                        font-normal
                        text-gray-700
                        bg-white bg-clip-padding
                        border border-solid border-gray-300
                        rounded
                        transition
                        ease-in-out
                        m-0
                        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" required onChange={(e) => setName(e.target.value)}></input>
                      <label className="form-label inline-block mb-2 text-gray-700"
                                  >Description
                        </label>
                        
                        <textarea
                        className="
                        block
                        w-full
                        px-2
                        py-1.5
                        text-xl
                        font-normal
                        text-gray-700
                        bg-white bg-clip-padding
                        border border-solid border-gray-300
                        rounded
                        transition
                        ease-in-out
                        m-0
                        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
                        "
                        id="description"
                        name="description"
                        rows={3}
                        placeholder="Your description"
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        ></textarea>

                        {/* upload button */}
                        <div className="item-end">
                          <button onClick={()=>handleClickUpload()} className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded my-5">
                            Upload
                          </button>
                        </div>     
            </div>
        </div>
               

        <div className="h-[5rem]">
          {/* padding div for space between top and main elements */}
        </div>
        

    </div>
 
  )
}


export default CreateNft
