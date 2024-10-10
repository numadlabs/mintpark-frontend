"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { create } from 'zustand';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import axiosClient from "@/lib/axios";
import { useForm } from "react-hook-form";

// Define types
type FileType = File;

type UploadStore = {
  files: FileType[];
  fee: string;
  layerType: string;
  setFiles: (files: FileType[]) => void;
  setFee: (fee: string) => void;
  setLayerType: (layerType: string) => void;
  reset: () => void;
};

// Zustand store
const useUploadStore = create<UploadStore>((set) => ({
  files: [],
  fee: '',
  layerType: '',
  setFiles: (files) => set({ files }),
  setFee: (fee) => set({ fee }),
  setLayerType: (layerType) => set({ layerType }),
  reset: () => set({ files: [], fee: '', layerType: '' }),
}));

// Custom Zod schema for FileList
const FileListSchema = z.custom<FileList>((val) => val instanceof FileList, {
  message: "Expected FileList object",
}).refine((files) => files.length > 0, "At least one file is required");

// Zod schema for form validation
const formSchema = z.object({
  fee: z.string().min(1, "Fee is required").refine((val) => !isNaN(Number(val)), {
    message: "Fee must be a number",
  }),
  layerType: z.string().min(1, "Layer Type is required"),
  files: FileListSchema,
});

type FormValues = z.infer<typeof formSchema>;

const FileUploadForm: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { files, setFiles, setFee, setLayerType, reset } = useUploadStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fee: '',
      layerType: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    setFee(data.fee);
    setLayerType(data.layerType);
    setFiles(Array.from(data.files));
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = e.target.files;
      setFiles(Array.from(fileList));
      form.setValue('files', fileList, { shouldValidate: true });
    }
  };

  const handleConfirm = async () => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('fee', form.getValues('fee'));
    formData.append('layerType', form.getValues('layerType'));

    try {
      const response = await axiosClient.post('/api/v1/orders/estimated-fee', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(JSON.stringify(response.data));
    //   reset();
    //   form.reset();
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="files"
            render={({ field: { onChange, onBlur, name, ref } }) => (
              <FormItem>
                <FormLabel>Upload Files</FormLabel>
                <Input 
                  type="file" 
                  multiple 
                  onChange={(e) => {
                    handleFileChange(e);
                    onChange(e.target.files);
                  }}
                  onBlur={onBlur}
                  name={name}
                  ref={ref}
                />
                <FormMessage />
                {form.watch('files') && (
                  <p className="text-sm text-gray-500">
                    {form.watch('files').length} file(s) selected
                  </p>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fee</FormLabel>
                <Input type="text" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="layerType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Layer Type</FormLabel>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Upload</DialogTitle>
            <DialogDescription>
              Are you sure you want to upload {files.length} file(s)?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileUploadForm;