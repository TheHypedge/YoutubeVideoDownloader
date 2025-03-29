import express from "express";
import cors from "cors";
import ytdl from "@distube/ytdl-core";

const app = express();
const PORT = 4000;

app.use(cors());

// Endpoint to fetch video info and embed URL
app.get("/download", async (req, res) => {
    const videoURL = req.query.url;

    // Validate URL
    if (!ytdl.validateURL(videoURL)) {
        return res.status(400).send("Invalid YouTube URL");
    }

    try {
        const videoId = await ytdl.getURLVideoID(videoURL);
        const info = await ytdl.getInfo(videoURL);
        
        // Return embed URL and available formats
        let data = {
            url: `https://www.youtube.com/embed/${videoId}`,
            info: info.formats // Formats provided for reference; these links may be blocked directly
        };
        return res.send(data);
    } catch (error) {
        console.error("Error fetching video info:", error);
        return res.status(500).send("Error fetching video info.");
    }
});

// Endpoint to download/stream the video via the server proxy
app.get("/downloadFile", async (req, res) => {
  const videoURL = req.query.url;

  if (!ytdl.validateURL(videoURL)) {
      return res.status(400).send("Invalid YouTube URL");
  }

  try {
      const info = await ytdl.getInfo(videoURL);
      const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");
      res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);

      // Add additional headers to mimic a browser request.
      ytdl(videoURL, {
          quality: 18,
          requestOptions: {
              headers: {
                  "User-Agent":
                      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
                  "Referer": "https://www.youtube.com/"
              }
          }
      }).pipe(res);
  } catch (error) {
      console.error("Error downloading video:", error);
      res.status(500).send("Error downloading video.");
  }
});


app.get("/", (req, res) => {
    res.send("<h1>YTDL HOMEPAGE</h1>");
});

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});
