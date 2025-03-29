import express from "express"
import cors from "cors"
import ytdl from "@distube/ytdl-core"

const app = express();
const PORT = 4000;

app.use(cors());

app.get("/download", async (req, res) => {
  const videoURL = req.query.url;

  if (!ytdl.validateURL(videoURL)) {
    return res.status(400).send("Invalid YouTube URL");
  }

  try {
    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");

    res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);

    // Use known itag (360p mp4) to avoid format issues
      ytdl(videoURL, { quality: 18 }).pipe(res);
      

  } catch (error) {
    console.error("Error downloading video:", error);
    res.status(500).send("Error downloading video.");
  }
});


app.listen(PORT, () => {
  console.log(`RUNNING ON PORT: ${PORT}`);
});

app.get("/", (req, res) => {
    res.send("<h1>YTDL HOMEPAGE</h1>")
})
