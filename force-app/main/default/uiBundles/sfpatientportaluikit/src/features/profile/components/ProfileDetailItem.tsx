import { useState, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export type ProfileItemCardMode = "display" | "edit";

export type ProfileItemCardRenderProps = Readonly<{
  mode: ProfileItemCardMode;
  setMode: (mode: ProfileItemCardMode) => void;
}>;

type ProfileItemCardProps = Readonly<{
  title: string;
  children: (props: ProfileItemCardRenderProps) => ReactNode;
}>;

export function ProfileDetailItem({ title, children }: ProfileItemCardProps) {
  const [mode, setMode] = useState<ProfileItemCardMode>("display");
  const isEditing = mode === "edit";
  const actionLabel = isEditing ? `View ${title.toLowerCase()}` : `Edit ${title.toLowerCase()}`;

  return (
    <section className="mb-4 w-full rounded-2xl bg-white p-4" data-mode={mode}>
      <div className="flex items-center justify-between px-1 pb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("text-primary hover:text-primary", !isEditing && "hover:bg-sky-50")}
          onClick={() => setMode(isEditing ? "display" : "edit")}
          aria-label={`actionLabel`}
          aria-pressed={isEditing}
          title={actionLabel}
        >
          {isEditing ? <></> : <Pencil aria-hidden="true" />}
        </Button>
      </div>
      {children({ mode, setMode })}
    </section>
  );
}
