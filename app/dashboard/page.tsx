"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Play, Share2, SkipForward, ThumbsDown, ThumbsUp } from "lucide-react";
import { YT_REGEX } from "../lib/utils";
import { Appbar } from "../components/Appbar";
import { ToastContainer, toast } from "react-toastify";

interface Video {
  id: string;
  title: string;
  votes: number;
  userVote: "none" | "upvote" | "downvote";
}

export default function Dashboard() {
  const [videoLink, setVideoLink] = useState("");
  const [previewId, setPreviewId] = useState("");
  const [queue, setQueue] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const REFRESH_INTERVAL_MS = 10000;
  const creatorId = "3d008513-2163-4a1c-9a12-f5b9fc9b2d3b"; // Replace this with actual user ID from your auth system

  // Fetch queue from the backend
  const refreshStreams = async () => {
    try {
      const res = await axios.get<{ streams: { id: string; title: string; upvotes: number; userVote: string }[] }>(
        "/api/streams/get"
      );

      setQueue(
        res.data.streams.map((stream) => ({
          id: stream.id,
          title: stream.title,
          votes: stream.upvotes,
          userVote:
            stream.userVote === "upvote"
              ? "upvote"
              : stream.userVote === "downvote"
              ? "downvote"
              : "none",
        }))
      );
    } catch (err) {
      console.error("Error fetching streams:", err);
      setError("Failed to load streams. Please try again later.");
    }
  };

  // Update queue periodically
  useEffect(() => {
    refreshStreams();
    const interval = setInterval(refreshStreams, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // Handle input change for YouTube link
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const link = e.target.value;
    setVideoLink(link);
    const id = link.includes("v=") ? link.split("v=")[1].split("&")[0] : "";
    setPreviewId(id);
  };

  // Add new video to the queue
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!previewId || !videoLink.match(YT_REGEX)) {
      setError("Invalid YouTube link. Please provide a valid URL.");
      return;
    }
    setLoading(true);
    try {
      const creatorId = "3d008513-2163-4a1c-9a12-f5b9fc9b2d3b"; // Replace this with actual user ID from your auth system
      await axios.post("/api/streams", { 
        creatorId,
        url: videoLink
    });
      await refreshStreams();
      setVideoLink("");
      setPreviewId("");
    } catch (err) {
      console.error("Error adding stream:", err);
      setError("Failed to add stream. Please try again later.");
    } finally {
        setLoading(false);
    }
  };

  // Handle voting logic (upvote or downvote)
  const handleVote = async (id: string, isUpvote: boolean) => {
    const endpoint = isUpvote ? "/api/streams/upvote" : "/api/streams/downvote";
    try {
      await axios.post(endpoint, { streamId: id });
      refreshStreams();
    } catch (err) {
      console.error("Error voting:", err);
      setError("Failed to submit your vote. Please try again later.");
    }
  };

  // Play the next song
  const playNextSong = () => {
    if (queue.length > 0) {
      setCurrentVideo(queue[0].id);
      setQueue(queue.slice(1));
    } else {
      setCurrentVideo("");
    }
  };

  // Share functionality
  const handleShare = async () => {
    const shareUrl = `${window.location.hostname}/creator/${creatorId}`;

    try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        console.error("Error sharing:", err);
        toast.error("Failed to share the link. Please try again.");
      }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
        <Appbar />
      <h1 className="text-3xl font-bold text-center mb-8 text-teal-400">MuSync</h1>

      <div className="max-w-4xl mx-auto grid gap-8 grid-cols-1 md:grid-cols-2">
        {/* Currently Playing Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-teal-400">Currently Playing</h2>
          <div className="aspect-video mb-4">
            {currentVideo ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${currentVideo}`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            ) : (
              <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">No video playing</p>
              </div>
            )}
          </div>
          <Button
            onClick={playNextSong}
            className="w-full bg-teal-500 text-gray-900 hover:bg-teal-400"
            disabled={queue.length === 0}
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Play Next Song
          </Button>
          <Button
            onClick={handleShare}
            className="w-full mt-2 bg-purple-700 text-gray-100 hover:bg-purple-800"
          >
            <Share2 className="h-4 w-4 mr-2" />
            <ToastContainer />
            Share Stream
          </Button>
        </div>

        {/* Add to Queue Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-teal-400">Add to Queue</h2>
          <form className="space-y-4">
            <Input
              type="text"
              placeholder="Paste YouTube link here"
              value={videoLink}
              onChange={handleInputChange}
              className="bg-gray-800 border-gray-700 text-gray-100"
            />
            <Button
              type="submit"
              className="w-full bg-teal-500 text-gray-900 hover:bg-teal-400"
              onClick={handleSubmit}
            >
              {loading ? "Adding..." : "Add to Queue"}
            </Button>
          </form>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          {previewId && videoLink.match(YT_REGEX) && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2 text-teal-400">Preview</h3>
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${previewId}`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Songs Section */}
      <div className="max-w-4xl mx-auto mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-teal-400">Upcoming Songs</h2>
        <div className="space-y-4">
          {queue.map((video) => (
            <Card key={video.id} className="bg-gray-800 border-gray-700">
              <CardContent className="flex items-center justify-between p-4 text-gray-200">
                <div className="flex items-center space-x-4">
                  <Play className="text-teal-400" />
                  <span>{video.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>{video.votes}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleVote(video.id, true)}
                    className={`text-teal-400 ${video.userVote === "upvote" ? "opacity-50" : ""}`}
                    disabled={video.userVote === "upvote"}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleVote(video.id, false)}
                    className={`text-red-400 ${video.userVote === "downvote" ? "opacity-50" : ""}`}
                    disabled={video.userVote === "downvote"}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
