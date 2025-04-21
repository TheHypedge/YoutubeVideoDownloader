import { useState } from "react";
import axios from "axios";
import "./index.css";

function App() {
  const [urlValue, setUrlValue] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  const handleFetch = async () => {
    try {
      setIsFetching(true);
      setError(null);
      setData(null);

      const response = await axios.get(
        `http://localhost:4000/download?url=${urlValue}`
      );

      if (!response.data?.formats) {
        throw new Error("Invalid response from server");
      }

      setData({
        title: response.data.title,
        duration: response.data.duration,
        thumbnail: response.data.thumbnail,
        videoId: response.data.videoId
      });

    } catch (err) {
      console.error("Error fetching video info:", err);
      setError(err.message || "Failed to fetch video info");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="bg-black/20 flex flex-col items-center min-h-screen pt-30">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold">
          <span className="text-[#ff0033]">YouTube</span>
          <span className="text-white">Downloader</span>
        </h1>
      </header>

      <div className="w-full max-w-2xl px-4">
        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter YouTube URL"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              className="flex-1 p-4 rounded-lg border border-gray-300"
            />
            <button
              onClick={handleFetch}
              disabled={isFetching}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isFetching ? "Fetching..." : "Fetch Video"}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {data && (
            <div className="mt-8">
              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full"
                  onLoadStart={() => setIsLoadingVideo(true)}
                  onLoadedData={() => setIsLoadingVideo(false)}
                  poster={data.thumbnail}
                >
                  <source
                    src={`http://localhost:4000/downloadFile?url=${encodeURIComponent(urlValue)}`}
                    type="video/mp4"
                  />
                  {isLoadingVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="animate-spin text-white text-4xl">🌀</div>
                    </div>
                  )}
                </video>
              </div>

              <div className="mt-6 text-center">
                <h2 className="text-2xl font-bold mb-2">{data.title}</h2>
                <p className="text-gray-600">Duration: {data.duration}</p>
                
                <a
                  href={`http://localhost:4000/downloadFile?url=${encodeURIComponent(urlValue)}`}
                  download
                  className="inline-block mt-6 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Download MP4
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;