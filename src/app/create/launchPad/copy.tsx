// "use client";

// import React, { useState } from "react";
// import Banner from "@/components/section/banner";
// import Header from "@/components/layout/header";
// import {Input} from "@/components/ui/input";
// import UploadFile from "@/components/section/uploadFile";
// import ButtonLg from "@/components/ui/buttonLg";
// import { useRouter } from "next/navigation";
// import ButtonOutline from "@/components/ui/buttonOutline";
// import Layout from "@/components/layout/layout";
// import UploadCardFill from "@/components/atom/cards/uploadCardFill";
// import useFormState from "@/lib/store/useFormStore";
// import Image from "next/image";

// import {
//   createCollectibleHandler,
//   createCollectionHandler,
// } from "@/lib/service/postRequest";
// import { toast } from "sonner";
// import CollectiblePreviewCard from "@/components/atom/cards/collectiblePreviewCard";
// import { CreateCollectionType, ImageFile } from "@/lib/types";

// const Copy = () => {
//   const router = useRouter();
//   const {
//     ticker,
//     setTicker,
//     headline,
//     setHeadline,
//     imageBase64,
//     setImageBase64,
//     setImageMime,
//     supply,
//     setSupply, //add
//     description,
//     setDescription, //add
//     price,
//     setPrice, //add
//     collectionId,
//     setCollectionId,
//   } = useFormState();
//   const [step, setStep] = useState<number>(0);
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
//   const [logoImage, setImageLogo] = useState<ImageFile | null>(null);
//   const stepperData = ["Details", "Upload","Launch" ,"Confirm"];

//   const handleSubmitCollection = async () => {
//     if (!logoImage) {
//       return toast.error("image not found");
//     }

//     setIsLoading(true);

//     const data: CreateCollectionType = {
//       name: headline,
//       description,
//       ticker,
//       supply,
//       price,
//       walletLimit: 3,
//       POStartDate: new Date().getTime(),
//       logo: logoImage,
//     };

//     // Call the mintToken function for each item
//     const createResponse = await createCollectionHandler({
//       collectionData: data,
//     });
//     console.log("🚀 ~ handleSubmit ~ mintResponse:", createResponse);

//     if (createResponse.success == true) {
//       setStep(1);
//       if (!createResponse.data.id) {
//         return console.log("id not found");
//       }
//       setCollectionId(createResponse.data.id);
//       toast.success("Succesfully created collection");
//     } else {
//       toast.error(createResponse.error);
//     }
//     setIsLoading(false);
//   };

//   const handleSubmit = async () => {
//     setIsLoading(true);

//     // const testCollectionId = "764  c7e32-a9fb-425d-be5b-6967cd1d907f";
//     /* const testData = [
//       {
//         file: imageFiles[0].file,
//         meta: { name: "test 1" },
//         collectionId: collectionId,
//       },
//       {
//         file: imageFiles[1].file,
//         meta: { name: "test 2" },
//         collectionId: collectionId,
//       },
//     ]; */

//     let i = 1;
//     const data = imageFiles.map((image) => {
//       i++;
//       return {
//         file: image.file,
//         meta: { name: `${headline} #${i}` },
//         collectionId: collectionId,
//       };
//     });

//     console.log(data);

//     const collectibleResponse = await createCollectibleHandler({
//       collectionData: data,
//       collectionId: collectionId,
//     });

//     console.log(
//       "🚀 ~ handleSubmit ~ collectibleResponse:",
//       collectibleResponse,
//     );
//     if (collectibleResponse.success == true) {
//       setStep(2);

//       // setCollectionId(collectibleResponse.data.id);
//       toast.success("Succesfully uploaded images to collection");
//     } else {
//       toast.error(collectibleResponse.error);
//     }
//     setIsLoading(false);
//   };

//   const handleUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;

//     if (files) {
//       const newImageFiles: ImageFile[] = Array.from(files).map((file) => ({
//         file,
//         preview: URL.createObjectURL(file),
//       }));
//       // setImageLogo(newImageFiles);
//       setImageFiles((prevFiles) => [...prevFiles, ...newImageFiles]);
//     }
//   };

//   const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]; // Get the first file from the FileList
//     console.log("🚀 ~ handleLogoChange ~ file:", file);

//     if (file) {
//       const reader = new FileReader();

//       reader.onloadend = () => {
//         const base64 = reader.result as string;
//         const mime = base64
//           .split(",")[0]
//           .split(":")[1]
//           .split(";")[0]
//           .split("/")[1];
//         setImageBase64(base64);
//         setImageMime(mime);
//       };

//       const imageFile: ImageFile = {
//         file,
//         preview: URL.createObjectURL(file),
//       };

//       setImageLogo(imageFile);

//       console.log(imageBase64);

//       reader.readAsDataURL(file);
//     }
//     /*
//     if (file) {
//       const imageFile: ImageFile = {
//         file,
//         preview: URL.createObjectURL(file),
//       };

//       setImageLogo(imageFile);
//     } */
//   };

//   const handleDeleteLogo = () => {
//     setImageLogo(null);
//   };

//   return (
//     <Layout>
//       <div className="flex flex-col w-full h-max bg-background pb-[148px]">
//         <Header />
//         <div className="flex flex-col items-center gap-16 z-50">
//           <Banner
//             title={
//               step == 0 || step == 1
//                 ? "Create Collection"
//                 : "Your Collection is successfully launched!"
//             }
//             image={"/background-2.png"}
//             setStep={step}
//             stepperData={stepperData}
//           />
//           {step == 0 && (
//             <div className="w-[592px] items-start flex flex-col gap-16">
//               <div className="flex flex-col w-full gap-8">
//                 <p className="font-bold text-profileTitle text-neutral50">
//                   Details
//                 </p>
//                 <div className="flex flex-col w-full gap-6">
//                   <Input
//                     title="Name"
//                     placeholder="Collection name"
//                     value={headline}
//                     onChange={(e) => setHeadline(e.target.value)}
//                   />
//                   <Input
//                     title="Description"
//                     placeholder="Collection description"
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                   />
//                   <Input
//                     title="Ticker"
//                     placeholder="Collection ticker"
//                     value={ticker}
//                     onChange={(e) => setTicker(e.target.value)}
//                   />
//                   <Input
//                     title="Supply"
//                     placeholder="Collection supply"
//                     value={supply}
//                     onChange={(e) => setSupply(parseInt(e.target.value))}
//                     type="number"
//                   />
//                   <Input
//                     title="Price"
//                     placeholder="Collection price"
//                     value={price}
//                     onChange={(e) => setPrice(parseInt(e.target.value))}
//                     type="number"
//                   />
//                 </div>
//               </div>
//               <div className="flex flex-col w-full gap-8">
//                 <p className="font-bold text-profileTitle text-neutral50">
//                   Collection logo
//                 </p>
//                 {logoImage !== null ? (
//                   <UploadCardFill
//                     image={logoImage.preview}
//                     onDelete={handleDeleteLogo}
//                   />
//                 ) : (
//                   <UploadFile
//                     text="Accepted file types: WEBP (recommended), JPEG, PNG, SVG, and GIF."
//                     handleImageUpload={handleLogoChange}
//                   />
//                 )}
//               </div>
//               <div className="flex flex-row justify-between w-full gap-8">
//                 <ButtonOutline
//                   title="Back"
//                   onClick={() => router.push("/create")}
//                 />
//                 <ButtonLg
//                   title="Continue"
//                   isSelected={true}
//                   onClick={() => handleSubmitCollection()}
//                 >
//                   {isLoading ? "Loading..." : "Continue"}
//                 </ButtonLg>
//               </div>
//               {/* <ButtonLg
//                 title="Continue"
//                 isSelected={true}
//                 onClick={() => handleSubmit()}
//               >
//                 Test?
//               </ButtonLg> */}
//             </div>
//           )}
//           {step == 1 && (
//             <div className="w-[592px] items-start flex flex-col gap-16">
//               <div className="flex flex-col w-full gap-8">
//                 <p className="font-bold text-profileTitle text-neutral50">
//                   Upload your Collection
//                 </p>
//                 {imageFiles.length !== 0 ? (
//                   <div className="flex flex-row w-full h-full gap-8 overflow-x-auto">
//                     {imageFiles.map((item, index) => (
//                       <div key={index} className="w-full h-full">
//                         <CollectiblePreviewCard
//                           image={item.preview}
//                           key={index}
//                           title={item.file.name}
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <UploadFile
//                     text="Accepted file types: WEBP (recommended), JPEG, PNG, SVG, and GIF."
//                     handleImageUpload={handleUploadChange}
//                   />
//                 )}
//               </div>
//               {/* <div className="flex flex-col w-full gap-8">
//                 <div className="flex flex-row items-center justify-between">
//                   <p className="font-bold text-profileTitle text-neutral50">
//                     Include traits
//                   </p>
//                   <Toggle isChecked={isChecked} onChange={handleCheckBox} />
//                 </div>
//                 <p className="text-neutral100 text-lg2">
//                   Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
//                   ac ornare nisi. Aliquam eget semper risus, sed commodo elit.
//                   Curabitur sed congue magna. Donec ultrices dui nec ullamcorper
//                   aliquet. Nunc efficitur mauris id mi venenatis imperdiet.
//                   Integer mauris lectus, pretium eu nibh molestie, rutrum
//                   lobortis tortor. Duis sit amet sem fermentum, consequat est
//                   nec, ultricies justo.
//                 </p>
//                 <div className="flex flex-row rounded-xl border-neutral400 border w-[443px] gap-3 justify-center items-center py-3">
//                   <DocumentDownload size={24} color="#ffffff" />
//                   <p className="text-lg font-semibold text-neutral50">
//                     Download sample .CSV for correct formatting
//                   </p>
//                 </div>
//                 <div className={isChecked ? `flex` : `hidden`}>
//                   {jsonData.length !== 0 && jsonMetaData ? (
//                     <FileCard
//                       onDelete={handleDelete}
//                       fileName={jsonMetaData.name}
//                       fileSize={jsonMetaData.size}
//                     />
//                   ) : (
//                     <UploadFile
//                       text="Accepted file types: .JSON"
//                       handleImageUpload={handleJsonUpload}
//                       acceptedFileTypes=".json"
//                     />
//                   )}
//                 </div>
//               </div> */}
//               {/* {isLoading && (
//                 <div>
//                   <progress value={progress.value} max={progress.total} />
//                   <p>{progress.message}</p>
//                   <p>{`${progress.value}/${progress.total} NFTs minted`}</p>
//                 </div>
//               )} */}
//               {/* <div className="text-red-500">{error}</div> */}
//               <div className="flex flex-row w-full gap-8">
//                 <ButtonOutline title="Back" onClick={() => setStep(step - 1)} />
//                 <ButtonLg
//                   // type="submit"
//                   isSelected={true}
//                   onClick={() => handleSubmit()}
//                   isLoading={isLoading}
//                   // disabled={isLoading}
//                 >
//                   {isLoading ? "...loading" : "Upload"}
//                 </ButtonLg>
//               </div>
//             </div>
//           )}
//           {step == 2 && (
//             <div className="w-[800px] flex flex-col gap-16">
//               <div className="flex flex-row items-center justify-start w-full gap-8">
//                 {
//                   <Image
//                     src={imageBase64}
//                     alt="background"
//                     width={0}
//                     height={160}
//                     sizes="100%"
//                     className="w-[280px] h-[280px] object-cover rounded-3xl"
//                   />
//                 }
//                 <div className="flex flex-col gap-6">
//                   <div className="flex flex-col gap-3">
//                     <p className="text-3xl font-bold text-neutral50">
//                       {headline}
//                     </p>
//                     <p className="text-xl font-medium text-neutral100">
//                       {ticker}
//                     </p>
//                   </div>
//                   {/* <p className="text-neutral100 text-lg2">
//                     Lorem ipsum dolor sit amet, consectetur adipiscing elit.
//                     Proin ac ornare nisi. Aliquam eget semper risus, sed commodo
//                     elit. Curabitur sed congue magna. Donec ultrices dui nec
//                     ullamcorper aliquet. Nunc efficitur mauris id mi venenatis
//                     imperdiet. Integer mauris lectus, pretium eu nibh molestie,
//                     rutrum lobortis tortor. Duis sit amet sem fermentum,
//                     consequat est nec.
//                   </p> */}
//                 </div>
//               </div>
//               <div className="relative flex flex-row w-full h-auto gap-8 overflow-x-auto">
//                 {/* {mergedArray.map((item, index) => (
//                   <div key={index} className="w-full h-full">
//                     <CollectionCard
//                       image={item.base64}
//                       key={index}
//                       title={item.meta.name}
//                     />
//                   </div>
//                 ))} */}
//                 {/* todo ene gradient iig zasah */}
//                 {/* <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-neutral600 via-transparent to-neutral600" /> */}
//               </div>
//               <div className="flex flex-row gap-8">
//                 <ButtonOutline
//                   title="Go home"
//                   onClick={() => router.push("/")}
//                 />
//                 <ButtonLg isSelected={true} onClick={() => router.refresh()}>
//                   Create Again
//                 </ButtonLg>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default Copy;
