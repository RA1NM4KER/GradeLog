import React from "react";
import { readFileSync } from "node:fs";
import path from "node:path";

const logoDataUri = `data:image/png;base64,${readFileSync(
  path.join(process.cwd(), "public", "logo-mark.png"),
).toString("base64")}`;

export function PwaIcon({ size }: { size: number }) {
  return (
    <div
      style={{
        alignItems: "center",
        background: "#000000",
        borderRadius: size * 0.22,
        display: "flex",
        height: "100%",
        justifyContent: "center",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <img
        alt="GradeLog logo"
        height={size}
        src={logoDataUri}
        style={{
          height: "100%",
          objectFit: "cover",
          width: "100%",
        }}
        width={size}
      />
    </div>
  );
}
