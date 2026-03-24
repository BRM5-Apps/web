"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, File as FileIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface FileUploadZoneProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  serverId?: string;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  placeholder?: string;
}

export function FileUploadZone({
  value,
  onChange,
  serverId,
  accept = "image/*",
  maxSizeMB = 25,
  className,
  placeholder = "Upload a file",
}: FileUploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToDiscordCDN = useCallback(
    async (file: File): Promise<string | null> => {
      if (!serverId) {
        setError("Server ID required for upload");
        return null;
      }

      // Check file size (Discord limit is 25MB for most uploads)
      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`File too large. Max size is ${maxSizeMB}MB`);
        return null;
      }

      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/servers/${serverId}/upload`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          },
        );

        clearInterval(progressInterval);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || "Upload failed");
        }

        const data = await response.json();
        setProgress(100);

        // Return the Discord CDN URL from the response
        return data.data?.url || null;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setError(message);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [serverId, maxSizeMB],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const url = await uploadToDiscordCDN(file);
      if (url) {
        onChange(url);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [uploadToDiscordCDN, onChange],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      const url = await uploadToDiscordCDN(file);
      if (url) {
        onChange(url);
      }
    },
    [uploadToDiscordCDN, onChange],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleClear = useCallback(() => {
    onChange(undefined);
    setError(null);
    setProgress(0);
  }, [onChange]);

  const isImage = value?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)($|\?)/i);
  const filename = value?.split("/").pop()?.split("?")[0];

  return (
    <div className={cn("space-y-2", className)}>
      {/* Display current file */}
      {value ? (
        <div className="relative rounded-md border border-[#3f4147] bg-[#1e1f22] p-3">
          <div className="flex items-center gap-3">
            {isImage ? (
              <img
                src={value}
                alt="Preview"
                className="h-12 w-12 rounded object-cover border border-[#3f4147]"
              />
            ) : (
              <div className="h-12 w-12 rounded bg-[#2b2d31] flex items-center justify-center border border-[#3f4147]">
                <FileIcon className="h-5 w-5 text-[#b5bac1]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">
                {filename || "Uploaded file"}
              </p>
              <p className="text-xs text-[#b5bac1] truncate">
                {isImage ? "Image" : "File"} - Discord CDN
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Upload zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed border-[#3f4147] rounded-md bg-[#1e1f22]",
              "hover:border-[#5865F2] hover:bg-[#5865F2]/5",
              "transition-colors cursor-pointer",
              "flex flex-col items-center justify-center",
              "min-h-[100px] p-4",
              isUploading && "opacity-75 cursor-not-allowed"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 text-[#5865F2] animate-spin" />
                <span className="text-sm text-[#b5bac1]">Uploading... {progress}%</span>
                <div className="w-32 h-1.5 bg-[#2b2d31] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5865F2] transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-6 w-6 text-[#b5bac1] mb-2" />
                <p className="text-sm text-[#b5bac1] text-center">
                  {placeholder}
                </p>
                <p className="text-xs text-[#80848E] text-center mt-1">
                  Click or drag & drop
                </p>
                <p className="text-xs text-[#80848E] text-center">
                  Max {maxSizeMB}MB
                </p>
              </>
            )}
          </div>

          {/* Paste URL button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-[#3f4147] text-[#b5bac1] hover:text-white"
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();
                if (text && (text.startsWith("http://") || text.startsWith("https://"))) {
                  onChange(text);
                } else {
                  setError("Clipboard does not contain a valid URL");
                }
              } catch {
                setError("Failed to read clipboard");
              }
            }}
            disabled={isUploading}
          >
            Paste URL from Clipboard
          </Button>
        </>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}
    </div>
  );
}

import { AlertCircle } from "lucide-react";
