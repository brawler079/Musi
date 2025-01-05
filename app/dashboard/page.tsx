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
import StreamView from "../components/StreamView";

interface Video {
  id: string;
  title: string;
  votes: number;
  userVote: "none" | "upvote" | "downvote";
}

const creatorId = "3d008513-2163-4a1c-9a12-f5b9fc9b2d3b";

export default function Dashboard() {
  return <StreamView creatorId={creatorId} playVideo = {true} />;
}
 