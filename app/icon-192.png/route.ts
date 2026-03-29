import { ImageResponse } from "next/og";
import React from "react";

import { PwaIcon } from "@/lib/pwa-icon";

export function GET() {
  return new ImageResponse(React.createElement(PwaIcon, { size: 192 }), {
    width: 192,
    height: 192,
  });
}
