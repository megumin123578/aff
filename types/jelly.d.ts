import type { DetailedHTMLProps, HTMLAttributes } from "react";

type JellyElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  active?: boolean;
  checked?: boolean;
  label?: string;
  mode?: string;
  size?: string;
  squish?: boolean;
  variant?: string;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'jelly-theme': JellyElementProps;
      'jelly-button': JellyElementProps;
      'jelly-card': JellyElementProps;
      'jelly-badge': JellyElementProps;
      'jelly-switch': JellyElementProps;
      'jelly-checkbox': JellyElementProps;
      'jelly-input': JellyElementProps;
      'jelly-select': JellyElementProps;
      'jelly-slider': JellyElementProps;
      'jelly-segmented': JellyElementProps;
      'jelly-chip': JellyElementProps;
      'jelly-alert': JellyElementProps;
    }
  }
}
