import { describe, expect, it } from "vitest";

import { uploadFiles } from "@/services/7tv";

const files = [
  { name: "1x.png", format: "PNG", size: 3_000 },
  { name: "4x.png", format: "PNG", size: 30_000 },
  { name: "1x.gif", format: "GIF", size: 90_000 },
  { name: "2x.gif", format: "GIF", size: 200_000 },
  { name: "4x.gif", format: "GIF", size: 400_000 },
  { name: "4x.webp", format: "WEBP", size: 10_000 },
];

function names(picked: ReturnType<typeof uploadFiles>) {
  return picked.map((f) => f.name);
}

describe("uploadFiles", () => {
  it("lists PNGs under Slack's limit from largest to smallest for static emotes", () => {
    expect(names(uploadFiles(files, false))).toEqual(["4x.png", "1x.png", "4x.webp"]);
  });

  it("lists GIFs then WebPs under Slack's limit for animated emotes", () => {
    expect(names(uploadFiles(files, true))).toEqual(["1x.gif", "4x.webp"]);
  });

  it("falls back to the smallest file when all exceed the limit", () => {
    expect(names(uploadFiles(files.slice(3, 5), true))).toEqual(["2x.gif"]);
  });
});
