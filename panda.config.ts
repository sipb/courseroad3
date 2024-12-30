import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";

import neutral from "@park-ui/panda-preset/colors/neutral";

export default defineConfig({
  preflight: true,
  presets: [
    "@pandacss/preset-base",
    createPreset({
      accentColor: neutral,
      grayColor: neutral,
      radius: "sm",
    }),
  ],
  include: ["./src/**/*.{js,jsx,ts,tsx}"],
  jsxFramework: "solid",
  outdir: "styled-system",
});
