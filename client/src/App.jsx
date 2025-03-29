import { useState } from "react";
import axios from "axios";
import "./App.css";
import "./index.css";

function App() {
  const [urlValue, setUrlValue] = useState("");
  const [data, setData] = useState(null);

  const handleDownload = async () => {
    try {
      // Request video info from the server
      const response = await axios.get(
        `http://localhost:4000/download?url=${urlValue}`
      );
      // Save video info along with the original URL
      setData({ ...response.data, originalURL: urlValue });
      setUrlValue("");
    } catch (error) {
      console.error("Error fetching video info:", error);
    }
  };

  return (
    <div className="bg- flex flex-col justify-center items-center min-h-screen">
      <div className="flex flex-row justify-center items-center">
        <div className="text-4xl font-bold">
          <h1>
            <span className="text-red-700">YouTube</span> Downloader
          </h1>
        </div>
      </div>
      <div className="flex flex-row my-4">
        <input
          type="text"
          placeholder="Enter URL"
          value={urlValue}
          onChange={(e) => setUrlValue(e.target.value)}
          className="outline-none p-2 bg-yellow-500 border-2 border-gray-500 rounded-md md:mr-4"
        />
        <button
          onClick={handleDownload}
          className="bg-black text-yellow-500 py-2 px-6 rounded-md cursor-pointer"
        >
          Get Video Info
        </button>
      </div>

      {data && (
        <div className="my-4">
          <iframe width="570" height="320" src={data.url} title="video" />
          <div className="mt-4">
            {data.info.map((format, index) => (
              <div key={index}>
                <a
                  href={format.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline italic"
                >
                  {format.mimeType.split(";")[0]}{" "}
                  {format.hasVideo ? `${format.height}p` : ""}
                </a>
              </div>
            ))}
          </div>
          <div className="mt-6">
            {/* Download video file via server proxy */}
            <a
              href={`http://localhost:4000/downloadFile?url=${data.originalURL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-yellow-500 py-2 px-6 rounded-md cursor-pointer inline-block"
            >
              Download Video File
            </a>
          </div>
        </div>
      )}

      {!data && (
        <div className="text-red-700 font-bold mt-10">
          No download yet
        </div>
      )}
    </div>
  );
}

export default App;
