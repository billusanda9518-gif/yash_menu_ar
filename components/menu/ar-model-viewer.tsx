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
  activateAR?: () => Promise<void>;
};

function toAbsoluteAssetUrl(path: string) {
  if (typeof window === "undefined") return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return new URL(path, window.location.origin).href;
}

function getAndroidVersion() {
  if (typeof window === "undefined") return 0;
  const match = navigator.userAgent.match(/Android (\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function getDeviceProfile() {
  if (typeof window === "undefined") {
    return { isIOS: false, isAndroid: false, androidVersion: 0, arModes: "scene-viewer", preferWebXR: false };
  }
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const androidVersion = isAndroid ? getAndroidVersion() : 0;

  if (isIOS) {
    return { isIOS: true, isAndroid: false, androidVersion: 0, arModes: "quick-look", preferWebXR: false };
  }
  if (isAndroid) {
    const preferWebXR = androidVersion >= 16;
    return {
      isIOS: false, isAndroid: true, androidVersion,
      arModes: preferWebXR ? "webxr" : "webxr scene-viewer",
      preferWebXR,
    };
  }
  return { isIOS: false, isAndroid: false, androidVersion: 0, arModes: "scene-viewer webxr quick-look", preferWebXR: false };
}

function buildSceneViewerUrl(modelUrl: string, title: string, mode: "ar_preferred" | "3d_preferred") {
  const params = new URLSearchParams({ file: modelUrl, mode, title });
  return `https://arvr.google.com/scene-viewer/1.0?${params.toString()}`;
}

export function ARModelViewer({ src, alt, iosSrc }: ModelViewerProps) {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [arStatus, setArStatus] = useState<ARStatus>("loading");
  const [arMessage, setArMessage] = useState("");
  const [modelSrc, setModelSrc] = useState(src);
  const [iosModelSrc, setIosModelSrc] = useState<string | undefined>(undefined);
  const [arModes, setArModes] = useState("scene-viewer");
  const [sceneViewer3dUrl, setSceneViewer3dUrl] = useState("");
  const [isAndroid16Plus, setIsAndroid16Plus] = useState(false);
  const [isLaunchingAr, setIsLaunchingAr] = useState(false);

  const candidateIosSrc = useMemo(() => {
    if (iosSrc) return iosSrc;
    if (!src.endsWith(".glb")) return undefined;
    return src.replace(/\.glb$/i, ".usdz");
  }, [src, iosSrc]);

  useEffect(() => { void import("@google/model-viewer"); }, []);

  useEffect(() => {
    const absoluteModelSrc = toAbsoluteAssetUrl(src);
    const profile = getDeviceProfile();
    setModelSrc(absoluteModelSrc);
    setArModes(profile.arModes);
    setIsAndroid16Plus(profile.isAndroid && profile.androidVersion >= 16);
    setSceneViewer3dUrl(buildSceneViewerUrl(absoluteModelSrc, alt, "3d_preferred"));
    setArStatus("loading");
    setArMessage(
      profile.preferWebXR
        ? 'Android 16 detected: use "View in AR (Chrome)" — Scene Viewer may close instantly.'
        : ""
    );
    setIosModelSrc(undefined);
    if (!candidateIosSrc) return;
    const absoluteIosSrc = toAbsoluteAssetUrl(candidateIosSrc);
    void fetch(absoluteIosSrc, { method: "HEAD" })
      .then((r) => { if (r.ok) setIosModelSrc(absoluteIosSrc); })
      .catch(() => { setIosModelSrc(undefined); });
  }, [alt, candidateIosSrc, src]);

  const handleViewInAR = async () => {
    const viewer = viewerRef.current;
    if (!viewer?.canActivateAR) {
      setArMessage("WebXR AR unavailable. Update Chrome and install Google Play Services for AR.");
      return;
    }
    try {
      setIsLaunchingAr(true);
      await viewer.activateAR?.();
    } catch (error) {
      console.error("[AR] WebXR launch failed", error);
      setArMessage("WebXR failed to start. Update Chrome + Google Play Services for AR.");
    } finally {
      setIsLaunchingAr(false);
    }
  };

  const attachViewerListeners = useCallback(
    (viewer: ModelViewerElement) => {
      const onLoad = () => {
        setArStatus("ready");
        if (!isAndroid16Plus) {
          setArMessage(
            viewer.canActivateAR
              ? 'Tap "View in AR" or the AR button on the model.'
              : "Model loaded. Try the Scene Viewer 3D link below."
          );
        }
      };
      const onError = () => { setArStatus("error"); setArMessage("Model failed to load."); };
      const onArStatus = (event: Event) => {
        const detail = (event as CustomEvent<{ status?: string }>).detail;
        if (detail?.status === "failed") {
          setArMessage('AR session ended. On Android 16, use "View in AR (Chrome)".');
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
    [isAndroid16Plus]
  );

  const setViewerRef = useCallback(
    (node: ModelViewerElement | null) => {
      viewerRef.current = node;
      if (!node) return;
      return attachViewerListeners(node);
    },
    [attachViewerListeners]
  );

  return (
    <div key={modelSrc} className="relative h-full min-h-[430px] w-full">
      <model-viewer
        ref={setViewerRef}
        className="h-full min-h-[430px] w-full bg-[radial-gradient(circle_at_50%_10%,#fff7ed_0,#fafaf8_42%,#f0ebe4_100%)]"
        src={modelSrc}
        {...(iosModelSrc ? { "ios-src": iosModelSrc } : {})}
        alt={alt}
        ar
        ar-modes={arModes}
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
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center gap-2 px-4">
        <button
          type="button"
          onClick={handleViewInAR}
          disabled={isLaunchingAr || arStatus === "loading" || arStatus === "error"}
          className="pointer-events-auto inline-flex w-full max-w-xs items-center justify-center rounded-full bg-orange-500 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLaunchingAr ? "Starting AR..." : "View in AR (Chrome)"}
        </button>

        {!isAndroid16Plus && sceneViewer3dUrl && (
          <a
            href={sceneViewer3dUrl}
            className="pointer-events-auto inline-flex w-full max-w-xs items-center justify-center rounded-full border border-[#d5d0c4] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1a1a1a] transition hover:bg-[#f5f5f0]"
          >
            Scene Viewer (3D)
          </a>
        )}
      </div>

      <div className="pointer-events-none absolute left-4 top-4 max-w-[92%] space-y-2">
        <div className="rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
          {arStatus === "loading" && "Loading model..."}
          {arStatus === "ready" && "Model ready"}
          {arStatus === "error" && "Model failed to load"}
        </div>
        {arMessage && (
          <p className="rounded-xl bg-black/60 px-3 py-2 text-xs leading-5 text-white">
            {arMessage}
          </p>
        )}
      </div>
    </div>
  );
}
