function getVideoInformation(file)
{
    // need to figure out best solution for output
    const results = spawnSync('ffmpeg',['-i', `temp/${file}`],{})
}