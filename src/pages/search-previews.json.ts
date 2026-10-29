import type { APIRoute } from "astro";
import { getSearchPreviewLookup, loadDocs } from "../lib/docs";

export const GET: APIRoute = async () => {
  const previews = getSearchPreviewLookup(await loadDocs());

  return new Response(JSON.stringify(previews), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
};
