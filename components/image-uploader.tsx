"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Crop } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop as CropType,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Subfolder inside the portfolio-images bucket */
  folder?: string;
  /** CSS aspect-ratio string, e.g. "1/1", "16/9", "16/5" */
  aspectRatio?: string;
  /** Show crop UI before uploading */
  enableCrop?: boolean;
  /** Locked crop aspect ratio (width/height). If omitted, free crop. */
  cropAspect?: number;
}

/* ── canvas crop helper ─────────────────────────────────────────── */
function getCroppedBlob(
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
  ext: string
): Promise<Blob> {
  // PixelCrop coords are in *display* pixels — scale to natural image pixels
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const naturalX = Math.round(pixelCrop.x * scaleX);
  const naturalY = Math.round(pixelCrop.y * scaleY);
  const naturalW = Math.round(pixelCrop.width * scaleX);
  const naturalH = Math.round(pixelCrop.height * scaleY);

  const canvas = document.createElement("canvas");
  canvas.width = naturalW;
  canvas.height = naturalH;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, naturalX, naturalY, naturalW, naturalH, 0, 0, naturalW, naturalH);

  const mime = ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : "image/jpeg";
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("canvas is empty"))),
      mime,
      0.92
    )
  );
}

/* ── CropModal ──────────────────────────────────────────────────── */
function CropModal({
  src,
  ext,
  aspect,
  onConfirm,
  onCancel,
}: {
  src: string;
  ext: string;
  aspect?: number;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
      const initial = centerCrop(
        aspect
          ? makeAspectCrop({ unit: "%", width: 90 }, aspect, w, h)
          : { unit: "%", width: 90, height: 90 },
        w,
        h
      );
      setCrop(initial);
    },
    [aspect]
  );

  const handleConfirm = async () => {
    if (!imgRef.current || !completedCrop) return;
    const blob = await getCroppedBlob(imgRef.current, completedCrop, ext);
    onConfirm(blob);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col gap-0 overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Crop size={15} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-800 lowercase">
              crop image
            </span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="h-7 w-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-gray-500" />
          </button>
        </div>

        {/* crop area */}
        <div className="flex items-center justify-center bg-gray-900 p-4 max-h-[60vh] overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            minWidth={20}
            minHeight={20}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt="crop preview"
              onLoad={onImageLoad}
              style={{ maxHeight: "55vh", display: "block" }}
            />
          </ReactCrop>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 lowercase">
            drag to reposition · drag corners to resize
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-8 px-4 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors lowercase"
            >
              cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!completedCrop}
              className="h-8 px-4 rounded-xl bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold transition-colors lowercase disabled:opacity-40"
            >
              crop &amp; upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── ImageUploader ──────────────────────────────────────────────── */
export function ImageUploader({
  label,
  value,
  onChange,
  folder = "uploads",
  aspectRatio = "16/9",
  enableCrop = false,
  cropAspect,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState("");

  // crop modal state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingExt, setPendingExt] = useState<string>("jpg");

  const SAFE_EXTS = ["jpg", "jpeg", "png", "gif", "webp"];

  const uploadBlob = async (blob: Blob, ext: string) => {
    setUploading(true);
    setError(null);
    try {
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("portfolio-images")
        .upload(path, blob, { upsert: true, contentType: blob.type });
      if (uploadErr) throw uploadErr;
      const { data } = supabase.storage
        .from("portfolio-images")
        .getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!file.type.startsWith("image/") || !SAFE_EXTS.includes(ext)) {
      setError("only jpg, png, gif, or webp files allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("image must be under 10 mb");
      return;
    }

    if (enableCrop) {
      // read as data url and open crop modal
      const reader = new FileReader();
      reader.onload = () => {
        setCropSrc(reader.result as string);
        setPendingExt(ext);
      };
      reader.readAsDataURL(file);
      return;
    }

    await uploadBlob(file, ext);
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropSrc(null);
    await uploadBlob(blob, pendingExt);
  };

  const handleCropCancel = () => {
    setCropSrc(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const commitUrl = () => {
    const raw = urlDraft.trim();
    if (!raw) return;
    try {
      const parsed = new URL(raw);
      if (parsed.protocol !== "https:") {
        setError("only https:// urls are allowed");
        return;
      }
      onChange(parsed.href);
      setUrlDraft("");
      setError(null);
    } catch {
      setError("invalid url");
    }
  };

  return (
    <>
      {cropSrc && (
        <CropModal
          src={cropSrc}
          ext={pendingExt}
          aspect={cropAspect}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
          {label}
        </label>

        {/* Preview area */}
        <div
          className="relative w-full rounded-xl border border-gray-200 bg-gray-50 overflow-hidden"
          style={{ aspectRatio }}
        >
          {value ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
              >
                <X size={12} className="text-white" />
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
              <ImageIcon size={22} className="text-gray-300" />
              <span className="text-[10px] text-gray-300 font-medium lowercase">
                no image
              </span>
            </div>
          )}

          {/* Loading overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center gap-2">
              <Loader2 size={18} className="text-gray-600 animate-spin" />
              <span className="text-xs font-medium text-gray-600 lowercase">
                uploading…
              </span>
            </div>
          )}
        </div>

        {/* Upload button + paste-URL row */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 lowercase transition-colors disabled:opacity-50 flex-shrink-0 whitespace-nowrap"
          >
            <Upload size={13} />
            {uploading ? "uploading…" : "upload"}
          </button>

          <input
            type="text"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onBlur={commitUrl}
            onKeyDown={(e) => e.key === "Enter" && commitUrl()}
            placeholder="or paste url…"
            className="flex-1 h-9 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 lowercase">{error}</p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>
    </>
  );
}
