"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import { Loader2, Upload, Server, Settings, AlertTriangle, CheckCircle2, FileUp, Sparkles } from "lucide-react";
import { compressPdf } from "@/lib/pdf-compressor";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dmjcwnmpu";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "samtech_reader_books";

async function uploadPdfToCloudinary(file: File): Promise<{ secure_url: string; public_id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
    { method: "POST", body: formData }
  );

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Cloudinary upload failed: ${errText}`);
  }

  const result = await uploadRes.json();
  return { secure_url: result.secure_url, public_id: result.public_id };
}

export function BookForm() {
  const [loading, setLoading] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [showSizeBanner, setShowSizeBanner] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [compressionResult, setCompressionResult] = useState<{ before: string; after: string } | null>(null);
  const [pdfDragActive, setPdfDragActive] = useState(false);
  const [coverDragActive, setCoverDragActive] = useState(false);
  const router = useRouter();

  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  function formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  async function configureUploadLimits() {
    setConfiguring(true);
    try {
      const res = await fetch("/api/cloudinary/configure-preset", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Cloudinary upload limit increased to 50MB!");
        setShowSizeBanner(false);
      } else {
        toast.error(data.error || "Could not configure limit");
      }
    } catch {
      toast.error("Could not reach server");
    } finally {
      setConfiguring(false);
    }
  }

  function handlePdfFile(file: File) {
    setPdfFile(file);
    setShowSizeBanner(false);
    setCompressionResult(null);
  }

  function handleCoverFile(file: File) {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pdfFile) {
      toast.error("Please select a PDF file");
      return;
    }

    if (pdfFile.size > MAX_FILE_SIZE) {
      toast.error(`File too large (${formatSize(pdfFile.size)}). Maximum size is 50MB.`);
      return;
    }

    setLoading(true);
    const form = e.currentTarget;

    try {
      fetch("/api/cloudinary/configure-preset", { method: "POST" }).catch(() => {});

      let uploadFile = pdfFile;
      toast.loading("Compressing PDF...");
      try {
        const compressed = await compressPdf(pdfFile);
        const saved = pdfFile.size - compressed.size;
        if (saved > 0) {
          setCompressionResult({ before: formatSize(pdfFile.size), after: formatSize(compressed.size) });
          uploadFile = compressed;
        }
      } catch { }
      toast.dismiss();

      toast.loading("Uploading PDF to cloud storage...");
      const { secure_url: cloudinaryUrl, public_id: cloudinaryPdfId } = await uploadPdfToCloudinary(uploadFile);
      toast.dismiss();

      toast.loading("Processing book content...");
      const formData = new FormData(form);
      formData.delete("pdf");
      formData.set("cloudinaryUrl", cloudinaryUrl);
      formData.set("cloudinaryPdfId", cloudinaryPdfId);
      if (coverFile) formData.set("cover", coverFile);

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");
      toast.dismiss();

      toast.success(`Book uploaded! ${data.chapterCount} chapters created.`);
      router.push("/admin/books");
      router.refresh();
    } catch (err: unknown) {
      toast.dismiss();
      const msg = err instanceof Error ? err.message : "Upload failed";
      if (msg.includes("File size too large") || msg.includes("max")) {
        setShowSizeBanner(true);
        toast.error("Upload rejected by Cloudinary. Click 'Fix Upload Limits' below to allow files up to 50MB.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <AnimatePresence>
        {showSizeBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="rounded-xl border border-amber-300/60 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-950/30 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-1">
                    Upload limit too low
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-400 mb-3">
                    Your Cloudinary upload preset rejects files over ~10MB. Click below to raise the limit to 50MB.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={configureUploadLimits}
                    disabled={configuring}
                    className="border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
                  >
                    {configuring ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Settings className="mr-2 h-4 w-4" />
                    )}
                    {configuring ? "Configuring..." : "Fix Upload Limits (50MB)"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {compressionResult && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="rounded-xl border border-green-300/60 bg-green-50 dark:border-green-700/40 dark:bg-green-950/30 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-semibold text-green-900 dark:text-green-300">
                    PDF compressed successfully
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-400 mt-1 font-mono">
                    {compressionResult.before} → {compressionResult.after}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4 text-primary" />
                Book details
              </div>
              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Book title <span className="text-destructive">*</span></Label>
                  <Input id="title" name="title" placeholder="The Great Gatsby" required className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author <span className="text-destructive">*</span></Label>
                  <Input id="author" name="author" placeholder="F. Scott Fitzgerald" required className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Input id="genre" name="genre" placeholder="Fiction, Science, etc." className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input id="tags" name="tags" placeholder="classic, novel, 1920s" className="h-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={5}
                  placeholder="A brief description of the book..."
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FileUp className="h-4 w-4 text-primary" />
                Files
              </div>
              <Separator />

              <div className="space-y-2">
                <Label>PDF file <span className="text-destructive">*</span></Label>
                <label
                  className={cn(
                    "relative block border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                    pdfDragActive
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : pdfFile
                      ? "border-primary/40 bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent/30"
                  )}
                  onDragOver={(e) => { e.preventDefault(); setPdfDragActive(true); }}
                  onDragLeave={() => setPdfDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setPdfDragActive(false);
                    const f = e.dataTransfer.files[0];
                    if (f && f.type === "application/pdf") handlePdfFile(f);
                    else toast.error("Please select a PDF file");
                  }}
                >
                  <input
                    id="pdf-upload"
                    name="pdf"
                    type="file"
                    accept=".pdf"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handlePdfFile(f);
                    }}
                  />
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-3">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  {pdfFile ? (
                    <>
                      <p className="text-sm font-semibold text-foreground">{pdfFile.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        {formatSize(pdfFile.size)} · click to change
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold">Drop your PDF here, or click to browse</p>
                      <p className="text-xs text-muted-foreground mt-1">Maximum 50MB</p>
                    </>
                  )}
                </label>
              </div>

              <div className="space-y-2">
                <Label>Cover image <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <div className="flex items-start gap-4">
                  <label
                    className={cn(
                      "flex-1 border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
                      coverDragActive
                        ? "border-primary bg-primary/5"
                        : coverFile
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-accent/30"
                    )}
                    onDragOver={(e) => { e.preventDefault(); setCoverDragActive(true); }}
                    onDragLeave={() => setCoverDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setCoverDragActive(false);
                      const f = e.dataTransfer.files[0];
                      if (f && f.type.startsWith("image/")) handleCoverFile(f);
                    }}
                  >
                    <input
                      id="cover-upload"
                      name="cover"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleCoverFile(f);
                      }}
                    />
                    <p className="text-sm text-muted-foreground">
                      {coverFile ? coverFile.name : "Click or drop an image"}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">PNG, JPG up to 10MB</p>
                  </label>
                  {coverPreview && (
                    <div className="relative w-24 h-32 rounded-lg overflow-hidden border border-border/60">
                      <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Server className="h-4 w-4 text-primary" />
                Upload info
              </div>
              <Separator className="mb-4" />
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>PDFs are automatically compressed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>Files up to 50MB supported</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>Chapters extracted automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>Available in library immediately</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & process book
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
