const mediaFormats = {
  mp4: {
    type: "mp4",
    extension: ".mp4",
    video: "libx264",
    audio: "aac",
    subtitles: "mov_text"
  },
  mov: {
    type: "mov",
    extension: ".mov",
    video: "libx264",
    audio: "aac",
    subtitles: "mov_text"
  },
  mkv: {
    type: "mkv",
    extension: ".mkv",
    video: "libx264",
    audio: "aac",
    subtitles: "ass"
  },
  avi: {
    type: "avi",
    extension: ".avi",
    video: "mpeg4",
    audio: "mp3",
    subtitles: "vobsub"
  },
  webm: {
    type: "webm",
    extension: ".webm",
    video: "vp8",
    audio: "opus",
    subtitles: "webvtt"
  },
  flv: {
    type: "flv",
    extension: ".flv",
    video: "libx264",
    audio: "aac",
    subtitles: ""
  },
  ts: {
    type: "ts",
    extension: ".ts",
    video: "libx264",
    audio: "aac",
    subtitles: "dvb_subtitle",
  },
  ogv: {
    type: "ogv",
    extension: ".ogv",
    video: "vp8",
    audio: "vorbis",
    subtitles: ""
  }
};

export default mediaFormats;