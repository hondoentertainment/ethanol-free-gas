"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";

export function PhotoUpload({
  stationId,
  onUploaded,
}: {
  stationId: string;
  onUploaded?: () => void;
}) {
  const { user, loading: authLoading } = useUser();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/stations/${stationId}/photos`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.status === 401) {
        setMessage("Sign in to upload photos.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Upload failed");
      }

      setMessage("Photo uploaded — thanks!");
      onUploaded?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (authLoading) return null;
  if (!user) return null;

  return (
    <div className="mt-4">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={uploading}
          onChange={handleFileChange}
        />
        {uploading ? "Uploading…" : "Upload photo (+10 pts)"}
      </label>
      {message && (
        <p className="mt-2 text-sm text-zinc-600" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

export function PhotoGallery({ photos }: { photos: { id: string; url: string }[] }) {
  if (photos.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-zinc-900">Photos</h2>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {photos.map((photo) => (
          <a
            key={photo.id}
            href={photo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt="Station photo"
              className="aspect-[4/3] w-full object-cover"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
