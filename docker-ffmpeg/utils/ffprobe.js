import { spawnSync } from 'child_process';

export function getVideoInformation(file)
{
    const results = spawnSync('ffprobe',["-v", "quiet", "-print_format", "json", "-show_streams", "-i", `temp/${file}`],{ encoding: "utf-8"})
    return results.stdout
}