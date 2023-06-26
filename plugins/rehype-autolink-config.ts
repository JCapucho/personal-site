import type { Options } from "rehype-autolink-headings";

export const autolinkConfig: Options = {
  behavior: "prepend",
  properties: {
    className: "autolink-header",
    ariaHidden: true,
    tabIndex: -1,
  },
  content: () => [{ type: "text", value: "#" }],
};
