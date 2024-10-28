

interface UploadFilesArgOP {
  FilePath: string;
  FileSize: number;
  Bucket: string;
  Region: string;
  Key: string;
  onTaskReady(taskId: number): void;
}

export {
  UploadFilesArgOP
}