"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { deleteListAction } from "@/lib/actions";

export function DeleteListButton({ listId }: { listId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!confirming) {
    return (
      <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
        Delete list
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted">Delete this list?</span>
      <Button
        variant="danger"
        size="sm"
        disabled={deleting}
        onClick={async () => {
          setDeleting(true);
          await deleteListAction(listId);
          router.push("/lists");
          router.refresh();
        }}
      >
        {deleting ? "Deleting…" : "Confirm"}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
    </div>
  );
}
