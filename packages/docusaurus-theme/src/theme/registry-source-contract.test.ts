import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Generated with shadcn@4.12.0, style=base-nova, Base UI, neutral, Lucide.
// The only source normalization is import paths plus React imports required by
// this package's TypeScript compiler. Any registry source edit must be checked
// against the pinned generator before updating these hashes.
const registrySourceHashes: Record<string, string> = {
  "accordion.tsx":
    "7a1b912ead4d52c7f44cd766a73ea34f93ae6ce31fdb47a9bda67ff16c17d38b",
  "alert.tsx":
    "248c809fd03466b4c93eeaef407297592f83ed2571094849e80e4c350a964392",
  "badge.tsx":
    "aa57e996fe34842c225f04513be7bee26b2641da71ef2333e4b4761165c9b68a",
  "breadcrumb.tsx":
    "9187c092d5cdb1e8d39e1a679da21aea2a5789563c9a4a04491d94ceabf3fcf2",
  "button.tsx":
    "5fed4c5ad875cfcd4b53974405e07572197eac46313800c66086d8909856ee9c",
  "button-group.tsx":
    "0195f8887c826cdaa732c9f49f6122e06c64ad6bc536cfdfb34793ccaea74b85",
  "card.tsx":
    "20abb8b39325e2b7dcde3606c4d6cb5b4e03066f43f7b7d77a05698b716b27ac",
  "collapsible.tsx":
    "75b084a80ec195a51db8af53f0b756db94fdcac690b72ce3b1965100d2a11459",
  "dropdown-menu.tsx":
    "a3e24b15f9e56d1f8134ab6d70aea2988703b66c3316a2bed08d34c0d307c301",
  "input.tsx":
    "93e660da8111f477622740665f585ffdd9adc76b1451e8e619e31b3cd87c1387",
  "kbd.tsx": "18db74165f4f879927aeb0eefe43f1ccc1f3d8d07c8216bf317403e208a9f4b9",
  "navigation-menu.tsx":
    "8195846bf9299ab91a82bcfb32d83e9a1bc821f3cdc3cd4b796ee6dedf059abb",
  "separator.tsx":
    "62fb2029c4b61a65c22944a0c17c9d5b17e0ad5f41b4866f5418014d1e79d9cb",
  "sheet.tsx":
    "389bb6dcd64ec21f9cc0cc5c0721d309dc42c9c3040b6cc5af53a5ffa6f8c113",
  "sidebar.tsx":
    "45dac17711ca0844318143707d7981d550446b74d7c2bf7963cdb19c501e66ff",
  "skeleton.tsx":
    "3edbbb6e1bdf27afabae7b592fb239849f27a0444dcd37a4c1597ae053e29382",
  "table.tsx":
    "4fa843ddd60591eb0a3e32facf626e713330258af692cb7de5cbe83aad70a034",
  "tabs.tsx":
    "f58b08e8726f06dad754f30b4c58ae5d76d543861e40b6dfdb376ab590acc657",
  "tooltip.tsx":
    "098a32c6d3703b6bb097786c6ee71d0e85f0e0f60322dc34d264c063419cf4a3",
};

describe("pinned Base Nova registry source", () => {
  it.each(Object.entries(registrySourceHashes))(
    "keeps %s byte-exact after approved import normalization",
    (fileName, expectedHash) => {
      const source = fs.readFileSync(
        path.join(__dirname, "components/ui", fileName)
      );
      expect(crypto.createHash("sha256").update(source).digest("hex")).toBe(
        expectedHash
      );
    }
  );
});
