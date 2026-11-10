import { ServerCrash } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function BackendError({ error }: { error: unknown }) {
  return (
    <Alert variant="destructive">
      <ServerCrash />
      <AlertTitle>Backend unavailable</AlertTitle>
      <AlertDescription>
        <p>{error instanceof Error ? error.message : String(error)}</p>
        <p>
          Start it with{" "}
          <code className="font-mono">
            cd backend &amp;&amp; uv run fastapi dev
          </code>
        </p>
      </AlertDescription>
    </Alert>
  );
}
