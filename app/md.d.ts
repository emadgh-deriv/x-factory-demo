import type { DetailedHTMLProps, HTMLAttributes } from "react";

type MdProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  disabled?: boolean;
  href?: string;
  target?: string;
  indeterminate?: boolean;
  "has-icon"?: boolean;
  selected?: boolean;
  label?: string;
  "aria-label"?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "md-filled-button": MdProps;
      "md-filled-tonal-button": MdProps;
      "md-outlined-button": MdProps;
      "md-icon-button": MdProps;
      "md-circular-progress": MdProps;
      "md-filter-chip": MdProps;
      "md-assist-chip": MdProps;
    }
  }
}
