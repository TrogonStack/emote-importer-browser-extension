import { describe, expect, it } from "vitest";

import { matchesBttvQuery } from "@/services/betterttv";
import type { EmoteSearchQuery } from "@/types/emote";

const query = (value: string) => value as EmoteSearchQuery;

describe("matchesBttvQuery", () => {
  it("matches emote codes containing the query regardless of case", () => {
    expect(matchesBttvQuery("catJAM", query("jam"))).toBe(true);
    expect(matchesBttvQuery("PepeLaugh", query("PEPE"))).toBe(true);
  });

  it("rejects emote codes that do not contain the query", () => {
    expect(matchesBttvQuery("catJAM", query("pepe"))).toBe(false);
  });
});
