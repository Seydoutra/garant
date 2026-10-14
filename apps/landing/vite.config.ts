import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { content, settings } from "./src/content";
export default defineConfig({
  plugins: [
    react(),
    tailwind(),
    {
      name: "garant-metadata",
      transformIndexHtml(html: string) {
        const escape = (value: string) =>
          value
            .replaceAll("&", "&amp;")
            .replaceAll('"', "&quot;")
            .replaceAll("<", "&lt;");
        return html
          .replaceAll("__SITE_TITLE__", escape(content.seo.title))
          .replaceAll("__SITE_DESCRIPTION__", escape(content.seo.description))
          .replaceAll("__SHARE_TITLE__", escape(content.seo.shareTitle))
          .replaceAll(
            "__SHARE_DESCRIPTION__",
            escape(content.seo.shareDescription),
          );
      },
    },
  ],
  base:
    process.env.VITE_BASE_PATH ||
    (process.env.GITHUB_ACTIONS
      ? `/${process.env.GITHUB_REPOSITORY_NAME || settings.GITHUB_REPOSITORY_NAME}/`
      : "/"),
});
