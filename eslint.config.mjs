import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: ["**/android/**", "**/ios/**", "**/out/**", "**/.next/**"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;
