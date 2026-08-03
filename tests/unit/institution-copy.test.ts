import { describe, expect, it } from "vitest";

import { institutionCopy, NAME_TYPE_LABELS, STATUS_LABELS } from "../../src/features/institution/copy";

describe("institutionCopy", () => {
  it("has honest empty/deferred states, never corporate or engagement language", () => {
    const text = JSON.stringify({ institutionCopy, STATUS_LABELS, NAME_TYPE_LABELS }).toLowerCase();
    for (const term of ["complete your", "complete this profile", "get started", "our mission", "world-class", "leading", "trusted by", "sign up", "follow"]) {
      expect(text).not.toContain(term);
    }
    expect(institutionCopy.introduction.absent.description.toLowerCase()).toContain("has not yet been recorded");
    expect(institutionCopy.relationships.deferred.description.toLowerCase()).toContain("deferred");
  });

  it("labels every status honestly, including historical and merged", () => {
    expect(STATUS_LABELS.active).toBe("Active");
    expect(STATUS_LABELS.historical).toBe("Historical");
    expect(STATUS_LABELS.merged).toBe("Merged");
    expect(STATUS_LABELS.status_unknown).toBe("Status unknown");
  });

  it("contains no PDBFF/institution-specific language (Node Independence)", () => {
    const text = JSON.stringify({ institutionCopy, STATUS_LABELS, NAME_TYPE_LABELS }).toLowerCase();
    for (const term of ["pdbff", "netpdbff", "amazon", "manaus", "mateiro"]) {
      expect(text).not.toContain(term);
    }
  });
});
