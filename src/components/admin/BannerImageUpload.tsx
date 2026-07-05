"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function BannerImageUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    const supabase = createClient();
    const path = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("banner-images").upload(path, file);

    if (uploadError) {
      setError(uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from("banner-images").getPublicUrl(path);
    onChange(data.publicUrl);
    setIsUploading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-charcoal-700">{label}</span>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-24 w-24 rounded-lg object-cover" />
      )}
      <input type="file" accept="image/*" onChange={handleUpload} disabled={isUploading} className="text-sm" />
      {isUploading && <p className="text-xs text-charcoal-500">Uploading...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
