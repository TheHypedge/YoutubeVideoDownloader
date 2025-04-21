import { useState } from "react";
import axios from "axios";
import "./index.css";

function App() {
  const [urlValue, setUrlValue] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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
        thumbnail: response.data.thumbnail,
        formats: response.data.formats,
        originalURL: urlValue
      });
      
    } catch (err) {
      console.error("Error fetching video info:", err);
      setError(err.message || "Failed to fetch video info");
    } finally {
      setIsFetching(false);
    }
  };

  const handleDownload = async (quality = 'best') => {
    try {
      setIsDownloading(true);
      const downloadUrl = `http://localhost:4000/downloadFile?url=${encodeURIComponent(
        data.originalURL
      )}&quality=${quality}`;
      
      // Open in new tab
      const newWindow = window.open(downloadUrl, '_blank');
      
      // Check if new window was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        throw new Error("Popup blocked! Please allow popups for this site.");
      }
      
    } catch (err) {
      console.error("Download error:", err);
      setError(err.message);
    } finally {
      // Reset after 2 seconds to allow download initiation
      setTimeout(() => setIsDownloading(false), 2000);
    }
  };

  return (
    <div className="bg-black/20 flex flex-col items-center min-h-screen pt-30">
      <div className="flex flex-row justify-center items-center">
        <div className="text-4xl font-bold">
          <div className="flex gap-x-6 text-5xl">
            <span className="text-[#ff0033]">YouTube</span>
            <span className="text-white">Downloader</span>
          </div>
        </div>
      </div>

      <div className="mt-16 flex flex-col gap-y-8">
        <input
          type="text"
          placeholder="Enter youtube video URL"
          value={urlValue}
          onChange={(e) => setUrlValue(e.target.value)}
          className="min-w-[40rem] outline-none py-4 px-5 shadow-[-1px_2px_17px_8px_rgba(100,_100,_111,_0.2)] placeholder:font placeholder:text rounded-lg md:mr-4"
        />
        
        <button
          onClick={handleFetch}
          disabled={isFetching}
          className="w-fit mx-auto bg-black text-white/90 py-3.5 px-8 rounded-lg cursor-pointer font-semibold tracking-wide upp disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFetching ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin">🌀</span>
              Fetching...
            </div>
          ) : (
            "Fetch Video"
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          Error: {error}
        </div>
      )}

      {data && (
        <div className="mt-20">
          <iframe
            className="rounded-lg"
            width="570"
            height="320"
            src={data.url}
            title="video"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

          <div className="mt-14 mx-auto w-fit flex gap-4">
            <button
              onClick={() => handleDownload('best')}
              disabled={isDownloading}
              className="bg-blue-600 text-white py-3.5 px-8 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin">🌀</span>
                  Preparing Download...
                </div>
              ) : (
                "Download HD Quality"
              )}
            </button>
            
            <button
              onClick={() => handleDownload('360')}
              disabled={isDownloading}
              className="bg-green-600 text-white py-3.5 px-8 rounded-lg cursor-pointer hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin">🌀</span>
                  Preparing Download...
                </div>
              ) : (
                "Download SD Quality"
              )}
            </button>
          </div>

          {data.formats && (
            <div className="mx-auto w-[110%] grid grid-cols-3 gap-x-2 gap-y-4 place-items-left my-16">
              {data.formats.map((format, index) => (
                <div key={index}>
                  <a
                    href={format.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline italic hover:text-blue-500"
                  >
                    {format.ext} - {format.format_note || format.format} -{' '}
                    {format.filesize
                      ? `${Math.round(format.filesize / 1024 / 1024)}MB`
                      : 'Size unknown'}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!data && !isFetching && (
        <div className="text-black font-bold mt-40">
          {error ? "Error occurred - please try again" : "No video fetched yet"}
        </div>
      )}
    </div>
  );
}

export default App;