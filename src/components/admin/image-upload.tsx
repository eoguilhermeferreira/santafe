"use client";

import Image from "next/image";
import * as React from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

type Bucket = "products" | "categories" | "banners";

export function ImageUpload({
  bucket,
  value,
  onChange,
  name,
}: {
  bucket: Bucket;
  value: string | null;
  onChange: (url: string | null) => void;
  name?: string;
}) {
  const [isUploading, setIsUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setIsUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (error) {
      console.error(error);
      toast.error("Falha ao enviar imagem");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      {value ? (
        <div className="relative size-28 overflow-hidden rounded-md border border-border">
          <Image src={value} alt="" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex size-28 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-input text-xs text-muted-foreground hover:bg-secondary"
        >
          {isUploading ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
          Enviar
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
