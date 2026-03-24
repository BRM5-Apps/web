import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { RequestOptions } from "@/lib/api-client";

export interface DiscordUploadResult {
  url: string;
  filename: string;
  contentType: string;
  size: number;
}

interface UseDiscordUploadOptions {
  serverId?: string;
  onSuccess?: (result: DiscordUploadResult) => void;
  onError?: (error: Error) => void;
}

export function useDiscordUpload(options: UseDiscordUploadOptions = {}) {
  const { serverId, onSuccess, onError } = options;
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(
    async (file: File): Promise<DiscordUploadResult | null> => {
      if (!serverId) {
        const error = new Error("Server ID is required for file uploads");
        onError?.(error);
        return null;
      }

      setIsUploading(true);
      setProgress(0);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("filename", file.name);
        formData.append("contentType", file.type);

        // Upload to backend, which will upload to Discord CDN
        const result = await apiClient.post<DiscordUploadResult>(
          `/servers/${serverId}/upload`,
          formData,
          {
            signal: undefined,
          } as RequestOptions,
        );

        setProgress(100);
        onSuccess?.(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Upload failed");
        onError?.(err);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [serverId, onSuccess, onError],
  );

  const uploadFromDataUrl = useCallback(
    async (dataUrl: string, filename: string): Promise<DiscordUploadResult | null> => {
      if (!serverId) {
        const error = new Error("Server ID is required for file uploads");
        onError?.(error);
        return null;
      }

      setIsUploading(true);
      setProgress(0);

      try {
        // Convert data URL to blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], filename, { type: blob.type });

        return await uploadFile(file);
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Upload failed");
        onError?.(err);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [serverId, uploadFile, onError],
  );

  return {
    uploadFile,
    uploadFromDataUrl,
    isUploading,
    progress,
  };
}

// Hook specifically for component v2 file uploads
export function useComponentFileUpload(serverId?: string) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, DiscordUploadResult>>({});

  const { uploadFile, isUploading, progress } = useDiscordUpload({
    serverId,
    onSuccess: (result) => {
      setUploadedFiles((prev) => ({
        ...prev,
        [result.filename]: result,
      }));
    },
  });

  const handleFileSelect = useCallback(
    async (file: File): Promise<string | null> => {
      const result = await uploadFile(file);
      return result?.url || null;
    },
    [uploadFile],
  );

  const handleDataUrlUpload = useCallback(
    async (dataUrl: string, filename: string): Promise<string | null> => {
      const { uploadFromDataUrl } = useDiscordUpload({ serverId });
      const result = await uploadFromDataUrl(dataUrl, filename);
      return result?.url || null;
    },
    [serverId],
  );

  return {
    handleFileSelect,
    handleDataUrlUpload,
    isUploading,
    progress,
    uploadedFiles,
  };
}
