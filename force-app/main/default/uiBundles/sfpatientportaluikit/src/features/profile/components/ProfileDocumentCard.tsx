import { useEffect, useState, type ChangeEvent } from "react";
import { Download, FileText, Upload, X } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ProfileItemCardMode } from "./ProfileDetailItem";

export type ProfileDocumentUpdate = Readonly<{
  file: File | null;
  removeExistingDocument: boolean;
}>;

type ProfileDocumentCardProps = Readonly<{
  label: string;
  fileName?: string;
  mode: ProfileItemCardMode;
  className?: string;
  onCancel: () => void;
  onDownload?: () => void;
  onSave: (update: ProfileDocumentUpdate) => void;
}>;

export function ProfileDocumentCard({
  label,
  fileName,
  mode,
  className,
  onCancel,
  onDownload,
  onSave,
}: ProfileDocumentCardProps) {
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [removeExistingDocument, setRemoveExistingDocument] = useState(false);

  const displayedFileName = pendingFile?.name ?? (removeExistingDocument ? undefined : fileName);

  const selectFile = (file?: File) => {
    if (file) {
      setPendingFile(file);
      setRemoveExistingDocument(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleCancel = () => {
    setPendingFile(null);
    setRemoveExistingDocument(false);
    onCancel();
  };

  const handleSave = () => {
    onSave({ file: pendingFile, removeExistingDocument });
  };

  useEffect(() => {
    if (mode === "edit") {
      setPendingFile(null);
      setRemoveExistingDocument(false);
    }
  }, [mode]);

  if (mode === "display") {
    return (
      <div className={cn("grid gap-2 sm:grid-cols-[12rem_1fr] sm:items-center", className)}>
        <span className="text-muted-foreground text-xs">{label}</span>
        {fileName ? (
          <div className="border-input flex h-8 items-center gap-2 rounded-lg border px-2.5 text-sm">
            <FileText className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{fileName}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-foreground"
              onClick={onDownload}
              aria-label={`Download ${fileName}`}
              title={`Download ${fileName}`}
            >
              <Download aria-hidden="true" />
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">No document uploaded</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {displayedFileName && (
        <div className="border-input flex h-8 items-center gap-2 rounded-lg border px-2.5 text-sm">
          <FileText className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{displayedFileName}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              setPendingFile(null);
              setRemoveExistingDocument(true);
            }}
            aria-label={`Remove ${displayedFileName}`}
            title={`Remove ${displayedFileName}`}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      )}

      <div className="border-muted-foreground/60 relative flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-3">
        <Input
          type="file"
          accept="application/pdf,image/*"
          className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
          aria-label="Select or drop a document file"
          onChange={handleFileChange}
        />
        <Button type="button" variant="secondary" className="pointer-events-none">
          <Upload aria-hidden="true" />
          Select a file
        </Button>
        <p className="text-muted-foreground pointer-events-none text-xs">or drop a file here</p>
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="ghost" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}
