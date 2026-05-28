import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from "react";

type ModelViewerElement = HTMLAttributes<HTMLElement> & {
  ref?: Ref<HTMLElement>;
  src?: string;
  "ios-src"?: string;
  alt?: string;
  ar?: boolean;
  "ar-modes"?: string;
  "ar-scale"?: string;
  "ar-placement"?: string;
  "camera-controls"?: boolean;
  "auto-rotate"?: boolean;
  "shadow-intensity"?: string;
  exposure?: string;
  "camera-orbit"?: string;
  "field-of-view"?: string;
  "touch-action"?: string;
  loading?: string;
  reveal?: string;
  crossOrigin?: "anonymous" | "use-credentials";
  style?: CSSProperties;
  children?: ReactNode;
};

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerElement;
    }
  }
}
