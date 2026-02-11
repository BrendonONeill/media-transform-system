const mediaFormats = {
  mp4: {
    type: "mp4",
    extension: ".mp4",
    video: "libx264",
    audio: "aac",
    subtitles: "mov_text",
    meta: "video/mp4"
  },
  mov: {
    type: "mov",
    extension: ".mov",
    video: "libx264",
    audio: "aac",
    subtitles: "mov_text",
    meta: "video/quicktime"
  },
  mkv: {
    type: "mkv",
    extension: ".mkv",
    video: "libx264",
    audio: "aac",
    subtitles: "ass",
    meta: "video/x-matroska"
  },
  avi: {
    type: "avi",
    extension: ".avi",
    video: "mpeg4",
    audio: "mp3",
    subtitles: "vobsub",
    meta: "x-msvideo"
  },
  webm: {
    type: "webm",
    extension: ".webm",
    video: "vp8",
    audio: "opus",
    subtitles: "webvtt",
    meta: "video/webm"
  },
  flv: {
    type: "flv",
    extension: ".flv",
    video: "libx264",
    audio: "aac",
    subtitles: "",
    meta: "video/x-flv"
  },
  ts: {
    type: "ts",
    extension: ".ts",
    video: "libx264",
    audio: "aac",
    subtitles: "dvb_subtitle",
    meta: "video/mp2t",
  }
};

export default mediaFormats;