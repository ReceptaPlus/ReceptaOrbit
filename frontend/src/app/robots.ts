import type { MetadataRoute } from "next";

/* App privado (dashboard de farmácia) — não deve ser indexado por buscadores. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
