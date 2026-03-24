import { env } from "../config/env.js";
import { buildExtensionSystemPrompt } from "./promptService.js";

function fallbackOutput() {
  return {
    title: "Generated Extension",
    files: {
      "manifest.json": JSON.stringify(
        {
          manifest_version: 3,
          name: "Image Blocker",
          version: "1.0.0",
          description: "Blocks images and replaces with red squares",
          content_scripts: [
            {
              matches: ["<all_urls>"],
              js: ["content.js"],
              run_at: "document_idle"
            }
          ],
          action: { default_popup: "popup.html" }
        },
        null,
        2
      ),
      "content.js": `
const imgs = document.querySelectorAll("img");
imgs.forEach((img) => {
  const box = document.createElement("div");
  box.style.width = (img.width || 100) + "px";
  box.style.height = (img.height || 100) + "px";
  box.style.backgroundColor = "red";
  box.style.display = "inline-block";
  box.style.verticalAlign = "middle";
  img.replaceWith(box);
});
`.trim(),
      "popup.html": `
<!doctype html>
<html>
  <body style="font-family:Arial;padding:10px;">
    <h3>Image Blocker Active</h3>
    <p>Reload page to apply on current tab.</p>
  </body>
</html>
`.trim()
    }
  };
}

export async function generateExtensionFilesFromPrompt(prompt) {
  if (!env.openAiApiKey) return fallbackOutput();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openAiApiKey}`
    },
    body: JSON.stringify({
      model: env.openAiModel,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildExtensionSystemPrompt() },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`LLM request failed: ${txt}`);
  }
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}
