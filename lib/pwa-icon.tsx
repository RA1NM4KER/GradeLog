import React from "react";

const brandBackground = "#171717";
const brandForeground = "#f6f2ea";
const brandAccent = "#d6c4a2";

export function PwaIcon({ size }: { size: number }) {
  const titleFontSize = Math.round(size * 0.34);
  const subtitleFontSize = Math.round(size * 0.12);

  return (
    <div
      style={{
        alignItems: "center",
        background: brandBackground,
        borderRadius: size * 0.22,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          border: `${Math.max(4, Math.round(size * 0.015))}px solid ${brandAccent}`,
          borderRadius: size * 0.18,
          height: size * 0.72,
          inset: "14%",
          opacity: 0.9,
          position: "absolute",
          width: size * 0.72,
        }}
      />
      <div
        style={{
          color: brandForeground,
          display: "flex",
          flexDirection: "column",
          fontFamily: "Georgia, serif",
          fontSize: titleFontSize,
          fontWeight: 700,
          letterSpacing: "-0.05em",
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        <span>G</span>
      </div>
      <div
        style={{
          color: brandAccent,
          fontFamily: "Arial, sans-serif",
          fontSize: subtitleFontSize,
          fontWeight: 600,
          letterSpacing: "0.32em",
          marginTop: size * 0.05,
          paddingLeft: size * 0.03,
          textTransform: "uppercase",
        }}
      >
        Gradeflow
      </div>
    </div>
  );
}
