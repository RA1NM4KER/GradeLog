import type { CSSProperties } from "react";

import { cn } from "@/lib/shared/utils";

export type BrandBackgroundVariant = "landing" | "overview" | "detail";

type BrandBackgroundArtProps = {
  className?: string;
  style?: CSSProperties;
  variant: BrandBackgroundVariant;
};

const art = {
  landing: {
    top: "M455 0C588 127 743 146 934 164C1111 180 1201 247 1316 319C1422 385 1530 405 1672 405V0H455Z",
    topInner:
      "M576 0C682 89 792 111 961 126C1104 138 1200 194 1300 260C1425 342 1536 390 1672 390V0H576Z",
    bottom:
      "M0 501C132 520 215 664 345 749C477 837 645 790 808 892C860 924 902 941 939 941H0V501Z",
    bottomInner:
      "M0 574C132 600 225 733 358 801C496 871 657 824 816 912C839 925 852 934 862 941H0V574Z",
  },
  overview: {
    top: "M433 0C560 105 694 111 849 85C987 61 1059 110 1169 191C1332 311 1478 244 1672 161V0H433Z",
    topInner:
      "M569 0C651 50 741 42 850 31C985 17 1068 66 1176 144C1335 259 1480 211 1672 128V0H569Z",
    bottom:
      "M0 631C128 624 224 738 370 794C521 854 703 750 880 827C1024 891 1128 911 1353 941H0V631Z",
    bottomInner:
      "M0 710C138 702 237 813 378 853C527 894 699 805 864 864C1004 914 1115 930 1210 941H0V710Z",
  },
  detail: {
    top: "M1205 0C1261 80 1377 70 1451 170C1522 264 1601 261 1672 258V0H1205Z",
    topInner:
      "M1286 0C1340 58 1413 51 1470 126C1531 210 1604 219 1672 220V0H1286Z",
    bottom:
      "M0 684C84 681 109 795 194 833C279 872 308 854 391 905C409 916 424 929 438 941H0V684Z",
    bottomInner:
      "M0 726C74 720 109 818 187 854C271 893 315 878 376 917C387 924 398 932 409 941H0V726Z",
  },
} as const;

const mobileArt = {
  landing: {
    top: "M220 0C315 65 394 177 505 222C626 271 726 254 814 344C873 404 915 458 941 486V0H220Z",
    topInner:
      "M306 0C382 56 439 149 528 191C644 245 738 230 819 306C872 355 913 421 941 453V0H306Z",
    bottom:
      "M0 1088C109 1197 120 1308 240 1360C378 1420 472 1438 579 1546C674 1641 777 1645 850 1672H0V1088Z",
    bottomInner:
      "M0 1160C96 1258 142 1370 253 1414C381 1466 468 1481 568 1572C651 1647 715 1656 748 1672H0V1160Z",
  },
  overview: {
    top: "M126 0C194 139 293 196 429 222C553 246 629 235 723 321C816 406 879 426 941 410V0H126Z",
    topInner:
      "M210 0C270 105 346 145 444 166C558 190 637 182 733 259C819 330 881 350 941 338V0H210Z",
    bottom:
      "M0 1262C150 1243 211 1345 328 1468C434 1579 588 1519 729 1627C759 1650 781 1664 797 1672H0V1262Z",
    bottomInner:
      "M0 1335C135 1323 206 1413 319 1510C424 1600 568 1551 689 1645C710 1661 721 1667 728 1672H0V1335Z",
  },
  detail: {
    top: "M620 0C704 78 773 93 830 179C882 258 914 287 941 324V0H620Z",
    topInner: "M696 0C756 57 804 77 847 142C887 203 916 228 941 259V0H696Z",
    bottom:
      "M0 1382C86 1380 104 1507 201 1563C282 1610 341 1594 424 1672H0V1382Z",
    bottomInner:
      "M0 1432C73 1430 106 1532 194 1584C263 1625 311 1619 366 1672H0V1432Z",
  },
} as const;

/** Vector equivalent of GradeLog's brand art. Colors remain CSS variables so
 * themes can change the palette without editing paths or shipping raster art. */
export function BrandBackgroundArt({
  className,
  style,
  variant,
}: BrandBackgroundArtProps) {
  const desktop = art[variant];
  const mobile = mobileArt[variant];

  function render(
    paths: {
      top: string;
      topInner: string;
      bottom: string;
      bottomInner: string;
    },
    mobileView = false,
  ) {
    const width = mobileView ? 941 : 1672;
    const height = mobileView ? 1672 : 941;
    const ringCenterX = mobileView ? 975 : 1685;
    const ringCenterY = mobileView
      ? 900
      : variant === "overview"
        ? 560
        : variant === "detail"
          ? 555
          : 680;

    return (
      <>
        <rect
          className="brand-background-art__canvas"
          height={height}
          width={width}
        />
        <path className="brand-background-art__coral-soft" d={paths.top} />
        <path className="brand-background-art__coral" d={paths.topInner} />
        <path className="brand-background-art__teal-soft" d={paths.bottom} />
        <path className="brand-background-art__teal" d={paths.bottomInner} />
        {[60, 112, 164, 216, 268].map((radius) => (
          <circle
            className="brand-background-art__ring"
            cx={ringCenterX}
            cy={ringCenterY}
            fill="none"
            key={radius}
            r={radius}
          />
        ))}
      </>
    );
  }

  return (
    <>
      <svg
        aria-hidden="true"
        className={cn("brand-background-art hidden sm:block", className)}
        preserveAspectRatio="xMidYMid slice"
        style={style}
        viewBox="0 0 1672 941"
      >
        {render(desktop)}
      </svg>
      <svg
        aria-hidden="true"
        className={cn("brand-background-art sm:hidden", className)}
        preserveAspectRatio="xMidYMid slice"
        style={style}
        viewBox="0 0 941 1672"
      >
        {render(mobile, true)}
      </svg>
    </>
  );
}
