"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Play, Share2, SkipForward, ThumbsDown, ThumbsUp } from "lucide-react";
import { YT_REGEX } from "../lib/utils";
import { Appbar } from "../components/Appbar";
import { ToastContainer, toast } from "react-toastify";
//@ts-ignore
import YouTube, { YouTubeProps } from 'react-youtube';

interface Video {
  id: string;
  title: string;
  votes: number;
  userVote: "none" | "upvote" | "downvote";
  extractedId: string;
}

export default function StreamView({
  creatorId,
  playVideo = false,
}: {
  creatorId: string;
  playVideo: boolean;
}) {
  const [videoLink, setVideoLink] = useState("");
  const [previewId, setPreviewId] = useState("");
  const [queue, setQueue] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshStreams = async () => {
    try {
      const res = await axios.get(`/api/streams/?creatorId=${creatorId}`, {
        withCredentials: true,
      });

      const { streams, activeStream } = res.data;

      // Update the queue
      setQueue(
        streams
          .filter((stream: any) => stream.id !== activeStream?.streamId) // Exclude active stream
          .map((stream: any) => ({
            id: stream.id,
            title: stream.title,
            votes: stream.upvotes || 0,
            userVote:
              stream.userVote === "upvote"
                ? "upvote"
                : stream.userVote === "downvote"
                ? "downvote"
                : "none",
            extractedId: stream.extractedId,
          }))
      );

      // Preserve the currently playing video if it matches the active stream
      if (
        activeStream &&
        (!currentVideo || currentVideo.id !== activeStream.streamId)
      ) {
        const activeStreamDetails = streams.find(
          (stream: any) => stream.id === activeStream.streamId
        );
        if (activeStreamDetails) {
          setCurrentVideo({
            id: activeStreamDetails.id,
            title: activeStreamDetails.title,
            votes: activeStreamDetails.upvotes || 0,
            userVote:
              activeStreamDetails.userVote === "upvote"
                ? "upvote"
                : activeStreamDetails.userVote === "downvote"
                ? "downvote"
                : "none",
            extractedId: activeStreamDetails.extractedId,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching streams:", err);
      setError("Failed to load streams. Please try again later.");
    }
  };

  useEffect(() => {
    refreshStreams();
  }, []);

  function player () {
    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        event.target.playVideo();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const link = e.target.value;
    setVideoLink(link);
    const id = link.includes("v=") ? link.split("v=")[1].split("&")[0] : "";
    setPreviewId(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!previewId || !videoLink.match(YT_REGEX)) {
      setError("Invalid YouTube link. Please provide a valid URL.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/streams", { creatorId, url: videoLink });
      await refreshStreams(); // Refresh streams after adding a new one
      setVideoLink("");
      setPreviewId("");
    } catch (err) {
      console.error("Error adding stream:", err);
      setError("Failed to add stream. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id: string, isUpvote: boolean) => {
    const endpoint = isUpvote ? "/api/streams/upvote" : "/api/streams/downvote";
    try {
      await axios.post(endpoint, { streamId: id });
      await refreshStreams();
    } catch (err) {
      console.error("Error voting:", err);
      setError("Failed to submit your vote. Please try again later.");
    }
  };

  const playNextSong = async () => {
    try {
      if (queue.length > 0) {
        const nextVideo = queue[0]; 
        setCurrentVideo(nextVideo); 
        setQueue((prev) => prev.slice(1)); // Remove the played song
  
        await axios.get(`/api/streams/skip`, {
          withCredentials: true,
        });
      } else {
        console.log("Queue is empty, no next song to play.");
      }
    } catch (error) {
      console.error("Error playing next song:", error);
      setError("Failed to play the next song. Please try again later.");
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/creator/${creatorId}`;
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
      <div className="max-w-7xl mx-auto flex flex-wrap md:flex-nowrap gap-10 mt-4">
        {/* Currently Playing */}
        <div className="flex-auto md:w-1/2">
          <h2 className="text-2xl font-semibold mb-4 text-teal-400">Currently Playing</h2>
          <div className="aspect-video lg:aspect-[16/9] mb-4 ">
            {currentVideo ? (
              <YouTube
                iframeClassName="w-full h-[550px] rounded-lg overflow-hidden"
                key={currentVideo.id}
                videoId={currentVideo.extractedId}
                opts={{
                  playerVars: { autoplay: 1, rel: 0 },
                }}
                onReady={player}
                onEnd={playNextSong}
              />
            ) : (
              <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">No video playing</p>
              </div>
            )}
          </div>
          <div className="flex space-x-4">
            {playVideo && (
              <Button
                onClick={playNextSong}
                className="w-full md:w-1/2 bg-teal-500 text-gray-900 hover:bg-teal-400"
                disabled={queue.length === 0}
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Play Next Song
              </Button>
            )}
            <Button
              onClick={handleShare}
              className="w-full md:w-1/2 bg-purple-700 text-gray-100 hover:bg-purple-800"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Stream
            </Button>
          </div>
          {/* Add to Queue */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-teal-400">Add to Queue</h2>
            <div className="flex flex-wrap md:flex-nowrap gap-4">
              <div className="flex-1 md:w-1/2 space-y-4">
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
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add to Queue"}
                </Button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </div>
              {previewId && videoLink.match(YT_REGEX) && (
                <div className="flex-1 md:w-1/2">
                  <h3 className="text-xl font-semibold mb-2 text-teal-400">Preview</h3>
                  <div className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${previewId}`}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      className="rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Songs */}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold mb-4 text-teal-400">Upcoming Songs</h2>
          <div className="space-y-4">
            {queue.map((video) => (
              <Card key={video.id} className="bg-gray-800 border-gray-700">
                <CardContent className="flex items-center justify-between p-4 text-gray-200">
                  <div className="flex items-center space-x-4">
                    <Play className="text-teal-400" />
                    <span>
                      {video.title.length > 35
                        ? `${video.title.substring(0, 35)}...`
                        : video.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="pl-2">{video.votes}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleVote(video.id, true)}
                      className={`text-teal-400 ${
                        video.userVote === "upvote" ? "opacity-50" : ""
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleVote(video.id, false)}
                      className={`text-red-500 ${
                        video.userVote === "downvote" ? "opacity-50" : ""
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {queue.length === 0 && (
              <p className="text-gray-400">No upcoming songs in the queue.</p>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}
