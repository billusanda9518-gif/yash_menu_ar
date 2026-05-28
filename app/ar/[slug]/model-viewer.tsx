"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ModelViewerProps = {
  src: string;
  alt: string;
  iosSrc?: string;
};

type ARStatus = "idle" | "loading" | "ready" | "error";

type ModelViewerElement = HTMLElement & {
  canActivateAR?: boolean;
};

const ASTRONAUT_MODEL_SRC =
  "https://modelviewer.dev/shared-assets/models/Astronaut.glb";

function toAbsoluteAssetUrl(path: string) {
  if (typeof window === "undefined") {
    return path;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return new URL(path, window.location.origin).href;
}

export default function ARModelViewer({ src, alt, iosSrc }: ModelViewerProps) {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [arStatus, setArStatus] = useState<ARStatus>("loading");
  const [arMessage, setArMessage] = useState<string>("");
  const [useTestModel, setUseTestModel] = useState(false);
  const [modelSrc, setModelSrc] = useState(src);
  const [iosModelSrc, setIosModelSrc] = useState<string | undefined>(iosSrc);

  useEffect(() => {
    void import("@google/model-viewer");
  }, []);

  const effectiveSrc = useTestModel ? ASTRONAUT_MODEL_SRC : src;

  const resolvedIosSrc = useMemo(() => {
    if (useTestModel) {
      return undefined;
    }

    if (iosSrc) {
      return iosSrc;
    }

    if (!effectiveSrc.endsWith(".glb")) {
      return undefined;
    }

    return effectiveSrc.replace(/\.glb$/i, ".usdz");
  }, [effectiveSrc, iosSrc, useTestModel]);

  useEffect(() => {
    setModelSrc(toAbsoluteAssetUrl(effectiveSrc));
    setIosModelSrc(
      resolvedIosSrc ? toAbsoluteAssetUrl(resolvedIosSrc) : undefined,
    );
    setArStatus("loading");
    setArMessage("");
  }, [effectiveSrc, resolvedIosSrc]);

  const attachViewerListeners = useCallback(
    (viewer: ModelViewerElement) => {
      const onLoad = () => {
        setArStatus("ready");
        setArMessage(
          viewer.canActivateAR
            ? "AR is available on this device."
            : "Model loaded, but AR is unavailable in this browser.",
        );
        console.info("[AR] model loaded", {
          src: modelSrc,
          canActivateAR: viewer.canActivateAR,
        });
      };

      const onError = (event: Event) => {
        setArStatus("error");
        setArMessage("Model failed to load. Check GLB path and CORS headers.");
        console.error("[AR] model failed to load", { src: modelSrc, event });
      };

      const onArStatus = (event: Event) => {
        const detail = (event as CustomEvent<{ status?: string }>).detail;
        console.info("[AR] ar-status", detail);
        if (detail?.status === "failed") {
          setArMessage(
            "AR launch failed. Use HTTPS, enable CORS for /models, and test with Astronaut.",
          );
        }
      };

      viewer.addEventListener("load", onLoad);
      viewer.addEventListener("error", onError);
      viewer.addEventListener("ar-status", onArStatus as EventListener);

      return () => {
        viewer.removeEventListener("load", onLoad);
        viewer.removeEventListener("error", onError);
        viewer.removeEventListener("ar-status", onArStatus as EventListener);
      };
    },
    [modelSrc],
  );

  const setViewerRef = useCallback(
    (node: ModelViewerElement | null) => {
      viewerRef.current = node;
      if (!node) {
        return;
      }

      return attachViewerListeners(node);
    },
    [attachViewerListeners],
  );

  return (
    <div key={modelSrc} className="relative h-full min-h-[430px] w-full">
      <model-viewer
        ref={setViewerRef}
        className="h-full min-h-[430px] w-full bg-[radial-gradient(circle_at_50%_10%,#fff7ed_0,#f4f7f2_42%,#dce6dc_100%)]"
        src={modelSrc}
        ios-src={iosModelSrc}
        alt={alt}
        ar
        ar-modes="scene-viewer quick-look webxr"
        ar-scale="auto"
        ar-placement="floor"
        camera-controls
        auto-rotate
        shadow-intensity="0.85"
        exposure="0.9"
        camera-orbit="35deg 68deg 2.4m"
        field-of-view="28deg"
        touch-action="pan-y"
        loading="eager"
        reveal="auto"
        crossOrigin="anonymous"
      >
        <button
          slot="ar-button"
          type="button"
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[#26382c] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#f9f4e7] shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={arStatus === "loading" || arStatus === "error"}
        >
          View in AR
        </button>
      </model-viewer>

      <div className="pointer-events-none absolute inset-x-0 bottom-20 flex flex-wrap justify-center gap-3 p-4">
        <button
          type="button"
          onClick={() => setUseTestModel((value) => !value)}
          className="pointer-events-auto inline-flex items-center justify-center rounded-full border border-[#d5d0c4] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#625d54] transition hover:bg-[#f8f8f6]"
        >
          {useTestModel ? "Use Dish Model" : "Use Astronaut Test Model"}
        </button>
      </div>

      <div className="pointer-events-none absolute left-4 top-4 max-w-[85%] space-y-2">
        <div className="rounded-full bg-black/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
          {arStatus === "loading" ? "Loading model..." : null}
          {arStatus === "ready" ? "Model ready" : null}
          {arStatus === "error" ? "Model failed to load" : null}
        </div>
        {arMessage ? (
          <p className="rounded-xl bg-black/65 px-3 py-2 text-xs leading-5 text-white">
            {arMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
