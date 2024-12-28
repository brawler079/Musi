'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import axios from "axios"
import { Play, Share2, SkipForward, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import z from 'zod';


interface Video {
  id: string
  title: string
  votes: number
  userVote: 'none' | 'upvote' | 'downvote'
}

export default function Dashboard() {
  const [videoLink, setVideoLink] = useState('')
  const [previewId, setPreviewId] = useState('')
  const [queue, setQueue] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState('')
  const [isClient, setIsClient] = useState(false)

  const REFRESH_INTERVAL_MS = 10 * 1000

  // Ensure rendering only happens after client hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch queue from the backend and include userVote state
  const refreshStreams = async () => {
    try {
      const res = await axios.get<{ streams: { id: string; title: string; upvotes: number; userVote: string }[] }>('/api/streams/get')
      setQueue(
        res.data.streams.map((stream) => ({
          id: stream.id,
          title: stream.title,
          votes: stream.upvotes,
          userVote: stream.userVote === 'upvote' ? 'upvote' : (stream.userVote === 'downvote' ? 'downvote' : 'none'),
        }))
      )
    } catch (error) {
      console.error('Error fetching streams:', error)
    }
  }

  useEffect(() => {
    refreshStreams()
    const interval = setInterval(refreshStreams, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  // Handle input change for YouTube link
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoLink(e.target.value)
    const id = e.target.value.includes('v=') ? e.target.value.split('v=')[1].split('&')[0] : ''
    setPreviewId(id)
  }

  // Add new video to the queue
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (previewId) {
      setQueue([...queue, { id: previewId, title: `New Song (${previewId})`, votes: 0, userVote: 'none' }])
      setVideoLink('')
      setPreviewId('')

      // Optionally send this new video to the server
      await axios.post('/api/streams', { videoId: previewId })
    } else {
      alert('Invalid YouTube link')
    }
  }

  // Handle voting logic (upvote or downvote)
  const handleVote = async (id: string, isUpvote: boolean) => {
    // Send the updated vote to the server
    const endpoint = isUpvote ? '/api/streams/upvote' : '/api/streams/downvote';

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streamId: id,
        }),
      });

      // After voting, refetch the queue to get the updated votes from the server
      refreshStreams();
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  // Play the next song
  const playNextSong = () => {
    if (queue.length > 0) {
      setCurrentVideo(queue[0].id)
      setQueue(queue.slice(1))
    } else {
      setCurrentVideo('')
    }
  }

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: 'Join my MuSync stream!',
      text: 'Help me choose the next song for my stream!',
      url: window.location.href,
    }

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch((err) => console.error('Error copying link:', err))
    }
  }

  if (!isClient) {
    return null // Prevent rendering on the server to avoid hydration mismatch
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-teal-400">MuSync</h1>

      <div className="max-w-4xl mx-auto grid gap-8 grid-cols-1 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-teal-400">Currently Playing</h2>
          <div className="aspect-video mb-4">
            {currentVideo ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${currentVideo}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
            Share Stream
          </Button>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-teal-400">Add to Queue</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Paste YouTube link here"
              value={videoLink}
              onChange={handleInputChange}
              className="bg-gray-800 border-gray-700 text-gray-100"
            />
            <Button type="submit" onClick={() => {
                fetch('/api/streams', {
                    method: 'POST',
                    body: JSON.stringify({ 
                        creatorId: creatorId,
                        url: videoLink
                     }),
                })
            }} className="w-full bg-teal-500 text-gray-900 hover:bg-teal-400">
              Add to Queue
            </Button>
          </form>
          {previewId && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2 text-teal-400">Preview</h3>
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${previewId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>

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
                    onClick={() => handleVote(video.id, true)} // upvote
                    className={`text-teal-400 ${video.userVote === 'upvote' ? 'opacity-50 cursor-not-allowed' : 'hover:text-teal-300 hover:bg-gray-700'}`}
                    disabled={video.userVote === 'upvote'}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleVote(video.id, false)} // downvote
                    className={`text-pink-400 ${video.userVote === 'downvote' ? 'opacity-50 cursor-not-allowed' : 'hover:text-pink-300 hover:bg-gray-700'}`}
                    disabled={video.userVote === 'downvote'}
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
  )
}
