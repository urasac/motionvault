"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createListAction } from "@/lib/actions";

export function CreateListForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        + New list
      </Button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await createListAction(name, description);
    setSaving(false);
    setName("");
    setDescription("");
    setOpen(false);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label htmlFor="list-name" className="mb-1.5 block text-xs font-medium text-muted">
          List name
        </label>
        <input
          id="list-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="90s Horror"
          autoFocus
          className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/60"
        />
      </div>
      <div className="flex-1">
        <label htmlFor="list-description" className="mb-1.5 block text-xs font-medium text-muted">
          Description (optional)
        </label>
        <input
          id="list-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description"
          className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/60"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Creating…" : "Create"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
