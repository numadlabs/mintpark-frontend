import { NewCollectionData } from "@/components/createn-flow/CreationFlowProvider";

export const collectiontFormData = (data: any): FormData => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    if (key === "files") {
      if (Array.isArray(data[key])) {
        data[key].forEach((file: File) => {
          formData.append("files", file);
        });
      } else if (data[key] instanceof File) {
        formData.append("files", data[key]);
      } else {
        console.warn(`Invalid 'files' data:`, data[key]);
      }
    } else if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key].toString());
    }
  });

  return formData;
};

export const collectibleFormData = (data: any): FormData => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    if (key === "file" && data[key]) {
      // Only append logo if it exists
      if (data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (data[key].uri) {
        formData.append(key, {
          uri: data[key].uri,
          type: data[key].type,
          name: data[key].name,
        } as any);
      }
    } else if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });

  return formData;
};

export const newCollectibleFormData = (data: any): FormData => {
  const formData = new FormData();

  console.log("collectibleFormData input:", data); 

  Object.keys(data).forEach((key) => {
    console.log(`Processing key: ${key}, value:`, data[key]); 

    if ((key === "file" || key === "logo") && data[key]) {
      if (data[key] instanceof File) {
        console.log(`Appending file for key: ${key}`);
        formData.append(key, data[key]);
      } else if (data[key].uri) {
        console.log(`Appending file object for key: ${key}`);
        formData.append(key, {
          uri: data[key].uri,
          type: data[key].type,
          name: data[key].name,
        } as any);
      }
    } else if (data[key] !== undefined && data[key] !== null) {
      console.log(`Appending regular field: ${key} = ${data[key]}`);
      formData.append(key, data[key]);
    } else {
      console.log(`Skipping key: ${key} (undefined or null)`);
    }
  });

  return formData;
};
