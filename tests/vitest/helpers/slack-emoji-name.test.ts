import { describe, expect, it } from "vitest";

import type { EmoteCode } from "@/types/emote";
import { parseSlackEmojiName, slackEmojiNameFromEmoteCode } from "@/helpers/slack-emoji-name";

describe("SlackEmojiName", () => {
  it("lowercases emote codes", () => {
    expect(slackEmojiNameFromEmoteCode("PepeG" as EmoteCode)).toBe("pepeg");
  });

  it("replaces characters Slack rejects", () => {
    expect(slackEmojiNameFromEmoteCode(":tf:" as EmoteCode)).toBe("tf");
    expect(slackEmojiNameFromEmoteCode("D:" as EmoteCode)).toBe("d");
    expect(slackEmojiNameFromEmoteCode("monka.S" as EmoteCode)).toBe("monka_s");
  });

  it("rejects codes with nothing usable", () => {
    expect(slackEmojiNameFromEmoteCode("<3" as EmoteCode)).toBe("3");
    expect(slackEmojiNameFromEmoteCode(":)" as EmoteCode)).toBeUndefined();
  });

  it("validates user input", () => {
    expect(parseSlackEmojiName(" Pepe_G ")).toBe("pepe_g");
    expect(parseSlackEmojiName("pepe g")).toBeUndefined();
    expect(parseSlackEmojiName("")).toBeUndefined();
  });
});
