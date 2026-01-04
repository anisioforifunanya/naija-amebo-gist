"use client";
import React, { useRef, useState } from "react";

type RecorderType = "audio" | "video";
interface LiveRecorderProps {
  type?: RecorderType;
  onRecorded?: (file: { blob: Blob; filename: string; mime: string }) => void;
  maxDurationSec?: number;
}

export default function LiveRecorder({
  type = "video",
  onRecorded,
  maxDurationSec = 300,
}: LiveRecorderProps) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  const startMedia = async () => {
    try {
      setError(null);
      const constraints =
        type === "video"
          ? { audio: true, video: { width: 1280, height: 720 } }
          : { audio: true, video: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints as any);
      mediaStreamRef.current = stream;
      if (mediaRef.current && type === "video") {
        (mediaRef.current as HTMLVideoElement).srcObject = stream;
        (mediaRef.current as HTMLVideoElement).play().catch(() => {});
      } else if (mediaRef.current && type === "audio") {
        (mediaRef.current as HTMLAudioElement).srcObject = stream;
        (mediaRef.current as HTMLAudioElement).play().catch(() => {});
      }
      chunksRef.current = [];
      const options: MediaRecorderOptions = {};
      const recorder = new MediaRecorder(stream as MediaStream, options);
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: type === "video" ? "video/webm" : "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        const filename =
          (type === "video" ? "live-video-" : "live-audio-") +
          Date.now() +
          (type === "video" ? ".webm" : ".webm");
        if (onRecorded) onRecorded({ blob, filename, mime: blob.type });
        cleanupStream();
      };
    } catch (err: any) {
      setError(err?.message || "Could not access camera/microphone");
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Media devices API not supported in this browser.");
      return;
    }
    await startMedia();
    if (!recorderRef.current) {
      setError("Failed to initialize recorder.");
      return;
    }
    chunksRef.current = [];
    recorderRef.current.start();
    setRecording(true);
    setElapsed(0);
    timerRef.current = window.setInterval(() => {
      setElapsed((s) => {
        const next = s + 1;
        if (next >= maxDurationSec) stopRecording();
        return next;
      });
    }, 1000) as unknown as number;
  };

  const stopRecording = () => {
    try {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
    } catch {}
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const cleanupStream = () => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      mediaStreamRef.current = null;
      recorderRef.current = null;
      if (mediaRef.current) {
        if (type === "video") (mediaRef.current as HTMLVideoElement).srcObject = null;
        else (mediaRef.current as HTMLAudioElement).srcObject = null;
      }
    } catch {}
  };

  const downloadPreview = () => {
    if (!previewUrl) return;
    fetch(previewUrl)
      .then((r) => r.blob())
      .then((b) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(b);
        link.download = `${type}-recording-${Date.now()}.${type === "video" ? "webm" : "webm"}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="live-recorder border p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{type === "video" ? "🎥" : "🎤"}</span>
          <strong className="text-sm">Live {type === "video" ? "Video" : "Voice"} Recorder</strong>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {recording ? `Recording… ${formatTime(elapsed)}` : "Ready"}
        </span>
      </div>

      <div className="media-area mb-3 rounded-lg overflow-hidden bg-black">
        {type === "video" ? (
          <video
            ref={mediaRef as any}
            className="w-full h-48 object-cover"
            playsInline
            muted
          />
        ) : (
          <div className="w-full h-20 flex items-center justify-center text-gray-400">
            <audio ref={mediaRef as any} className="w-full" />
            {!previewUrl && !recording && <span>Microphone ready</span>}
            {recording && <span className="animate-pulse">🎙️ Recording audio...</span>}
          </div>
        )}
      </div>

      <div className="controls flex flex-wrap gap-2 mb-3">
        {!recording ? (
          <button
            onClick={startRecording}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-semibold"
            type="button"
          >
            ⏺️ Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 font-semibold"
            type="button"
          >
            ⏹️ Stop
          </button>
        )}

        {previewUrl && (
          <>
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-semibold"
            >
              👁️ Preview
            </a>
            <button
              onClick={downloadPreview}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-semibold"
            >
              📥 Download
            </button>
          </>
        )}

        <button
          onClick={() => {
            cleanupStream();
            setPreviewUrl(null);
            setError(null);
            setRecording(false);
          }}
          className="px-4 py-2 bg-gray-300 text-gray-800 text-sm rounded-lg hover:bg-gray-400 font-semibold"
        >
          🔄 Reset
        </button>
      </div>

      {error && <p className="mt-2 text-red-600 text-sm">❌ {error}</p>}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Max duration: {maxDurationSec}s • Format: webm
      </div>
    </div>
  );
}
