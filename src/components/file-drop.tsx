import { useCallback, useRef, useState } from "react";
import { Upload, FileCheck2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileDrop({
  onFile,
  accept = "image/*,.pdf",
  busy,
}: {
  onFile: (f: File) => void;
  accept?: string;
  busy?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const f = files?.[0];
      if (!f) return;
      setName(f.name);
      onFile(f);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "rounded-2xl border-2 border-dashed border-border p-6 text-center cursor-pointer transition",
        hover && "border-accent/60 bg-accent/5",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="grid place-items-center gap-2 text-muted-foreground">
        {busy ? (
          <Loader2 className="animate-spin" />
        ) : name ? (
          <FileCheck2 className="text-accent" />
        ) : (
          <Upload />
        )}
        <div className="text-sm">
          {name ? (
            <span className="text-foreground">{name}</span>
          ) : (
            <>
              <span className="text-foreground font-medium">
                Click to upload
              </span>{" "}
              or drag & drop
            </>
          )}
        </div>
        <div className="text-xs">PDF or image, up to 10MB</div>
      </div>
    </div>
  );
}
