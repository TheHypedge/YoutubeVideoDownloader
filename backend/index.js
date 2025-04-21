import express from "express";
import cors from "cors";
import youtubedl from "youtube-dl-exec";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
const app = express();
const PORT = 4000;

app.use(cors());

// Get video info
app.get("/download", async (req, res) => {
	const videoURL = req.query.url;

	try {
		const info = await youtubedl(videoURL, {
			dumpSingleJson: true,
			noCheckCertificates: true,
			referer: "https://www.youtube.com",
			addHeader: ["referer:youtube.com", "user-agent:googlebot"],
		});

		const formats = info.formats
			.filter((f) => f.vcodec !== "none" && f.acodec !== "none")
			.sort((a, b) => b.quality - a.quality);

		res.json({
			title: info.title,
			thumbnail: info.thumbnail,
			formats: formats,
		});
	} catch (error) {
		console.error("Error:", error);
		res.status(500).send("Error fetching video info");
	}
});

// Download endpoint
app.get("/downloadFile", async (req, res) => {
	const videoURL = decodeURIComponent(req.query.url);
	const quality = req.query.quality || "best";

	try {
		const info = await youtubedl(videoURL, {
			dumpSingleJson: true,
			noCheckCertificates: true,
		});

		const title = info.title.replace(/[^\w\s]/gi, "");
		const filename = `${title}.mp4`;

		res.header({
			"Content-Disposition": `attachment; filename="${filename}"`,
			"Content-Type": "video/mp4",
		});

		// Stream the video directly
		youtubedl
			.exec(videoURL, {
				format: quality,
				o: "-",
				noCheckCertificates: true,
				referer: "https://www.youtube.com",
				addHeader: ["referer:youtube.com", "user-agent:googlebot"],
			})
			.stdout.pipe(res);
	} catch (error) {
		console.error("Download error:", error);
		res.status(500).send("Download failed");
	}
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
