"use client";

import { useEffect } from "react";

/** Registers the @material/web elements in the browser (they cannot load during SSR). */
export function MdLoader() {
  useEffect(() => {
    void import("@material/web/button/filled-button.js");
    void import("@material/web/button/filled-tonal-button.js");
    void import("@material/web/button/outlined-button.js");
    void import("@material/web/chips/assist-chip.js");
    void import("@material/web/chips/filter-chip.js");
    void import("@material/web/iconbutton/icon-button.js");
    void import("@material/web/progress/circular-progress.js");
  }, []);
  return null;
}
