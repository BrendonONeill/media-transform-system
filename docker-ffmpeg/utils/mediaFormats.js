const mediaFormats = {
  mp4: {
    extension: ".mp4",
    video: "libx264",
    audio: "aac",
    subtitles: "mov_text"
  },
  mov: {
    extension: ".mov",
    video: "libx264",
    audio: "aac",
    subtitles: "mov_text"
  },
  mkv: {
    extension: ".mkv",
    video: "libx264",
    audio: "aac",
    subtitles: "ass"
  },
  avi: {
    extension: ".avi",
    video: "mpeg4",
    audio: "mp3",
    subtitles: "vobsub"
  },
  webm: {
    extension: ".webm",
    video: "vp8",
    audio: "opus",
    subtitles: "webvtt"
  },
  flv: {
    extension: ".flv",
    video: "libx264",
    audio: "aac",
    subtitles: ""
  },
  ts: {
    extension: ".ts",
    video: "libx264",
    audio: "aac",
    subtitles: "dvb_subtitle",
  },
  ogv: {
    extension: ".ogv",
    video: "vp8",
    audio: "vorbis",
    subtitles: ""
  }
};

export default mediaFormats;