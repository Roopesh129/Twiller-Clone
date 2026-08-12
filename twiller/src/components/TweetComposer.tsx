"use client";

import { useAuth } from "@/context/AuthContext";
import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { 
  Image as ImageIcon, 
  Smile, 
  CalendarClock, 
  MapPin, 
  ListPlus, 
  Globe, 
  Mic, 
  Square, 
  X, 
  Upload, 
  Play, 
  Pause,
  Flag
} from "lucide-react";
import { Separator } from "./ui/separator";
import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";

const TweetComposer = ({ onTweetPosted }: any) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageurl, setimageurl] = useState("");
  
  // Audio States
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  
  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Emoji Picker State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const basicEmojis = ["😀", "😂", "🥰", "😎", "🤔", "🙌", "👍", "🔥", "✨", "💯", "🎉", "❤️", "🚀", "👀", "🙏", "😭"];

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxLength = 200;

  // Auto-resize textarea to mimic real-time Twitter behavior
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const processAudioBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const tempAudio = new Audio(url);

    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration > 300) {
        alert("Audio duration exceeds maximum limit of 5 minutes (300 seconds).");
        cancelAudio();
        return;
      }
      setAudioDuration(Math.round(tempAudio.duration));
      setAudioBlob(blob);
      setAudioPreviewUrl(url);
    };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const recordedBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        processAudioBlob(recordedBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (file.size > 100 * 1024 * 1024) {
      return alert("Audio file exceeds the maximum 100 MB limit.");
    }

    processAudioBlob(file);
  };

  const cancelAudio = () => {
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
    }
    setAudioBlob(null);
    setAudioPreviewUrl(null);
    setAudioDuration(0);
    setIsPlayingPreview(false);
  };

  const togglePreviewPlayback = () => {
    if (!previewAudioRef.current) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
    } else {
      previewAudioRef.current.play();
    }
    setIsPlayingPreview(!isPlayingPreview);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    
    if (audioBlob) {
      try {
        setIsLoading(true);
        const res = await axiosInstance.post("/api/audio-tweet/request-otp", { email: user?.email });
        alert(res.data.message || "OTP sent to registered email!");
        setShowOtpModal(true);
      } catch (error: any) {
        alert(error.response?.data?.error || "Failed to dispatch authorization OTP.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!content.trim() && !imageurl) return;

    try {
      setIsLoading(true);
      const tweetdata = {
        author: user?._id,
        content,
        image: imageurl,
        userEmail: user?.email
      };

      const res = await axiosInstance.post('/post', tweetdata);
      if (onTweetPosted) onTweetPosted(res.data);
      setContent("");
      setimageurl("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        alert(error.response.data.error || error.response.data.message);
      } else {
        const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Unknown error";
        alert(`An error occurred while posting your tweet: ${errMsg}`);
        console.error("Post Tweet Error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalAudioSubmit = async () => {
    if (!otpCode.trim()) return alert("Please enter the verification OTP code.");

    const formData = new FormData();
    formData.append("audio", audioBlob!, "voice-tweet.webm");
    formData.append("email", user?.email || "");
    formData.append("otp", otpCode);
    formData.append("duration", audioDuration.toString());
    formData.append("content", content);
    formData.append("author", user?._id || ""); 

    try {
      setIsLoading(true);
      const res = await axiosInstance.post("/api/audio-tweet/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Voice tweet published successfully!");
      
      const newAudioTweet = res.data.tweet;
      if (typeof newAudioTweet.author === 'string') {
        newAudioTweet.author = user; 
      }

      if (onTweetPosted) onTweetPosted(newAudioTweet);
      
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      cancelAudio();
      setOtpCode("");
      setShowOtpModal(false);
    } catch (error: any) {
      const errMsg = error.response?.data?.error || error.message || "Unknown error";
      alert(`Failed to publish audio tweet: ${errMsg}`);
      console.error("Audio Post Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsLoading(true);
    const image = e.target.files[0];
    
    // Quick size validation
    if (image.size > 32 * 1024 * 1024) {
      setIsLoading(false);
      return alert("Image is too large. Max size is 32MB.");
    }

    const formdataimg = new FormData();
    formdataimg.set("image", image);
    try {
      const res = await axiosInstance.post("/api/upload-image", formdataimg, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data.url;
      if (url) {
        setimageurl(url);
      } else {
        alert("Upload succeeded but no image URL was returned.");
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.error?.message || error.message || "Unknown error";
      alert(`Image upload failed: ${errMsg}`);
      console.error("ImgBB Upload Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > maxLength;
  const isNearLimit = characterCount > maxLength * 0.8;
  const isPostDisabled = (!content.trim() && !imageurl && !audioBlob) || isOverLimit || isLoading;
  
  if (!user) return null;

  const handleEmojiClick = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="px-4 pt-3 pb-2 flex gap-3 w-full bg-transparent relative">
      
      {/* Left Column: Avatar */}
      <div className="shrink-0 pt-1">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar} alt={user.displayName} />
          <AvatarFallback className="bg-slate-300 text-slate-600 font-bold">{user.displayName[0]}</AvatarFallback>
        </Avatar>
      </div>

      {/* Right Column: Input & Actions */}
      <div className="flex-1 flex flex-col">
        <form onSubmit={handleSubmit} className="w-full">
          
          {/* Text Area */}
          <textarea
            ref={textareaRef}
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent text-foreground text-xl placeholder-muted-foreground border-none focus:ring-0 outline-none resize-none min-h-[48px] overflow-hidden p-0 m-0 mt-1"
            rows={1}
          />

          {/* Image Preview */}
          {imageurl && (
            <div className="relative mt-3 mb-2 rounded-2xl overflow-hidden border border-border inline-block w-full max-h-[400px]">
              <img src={imageurl} alt="Upload preview" className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={() => setimageurl("")}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-sm transition flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {audioPreviewUrl && (
            <div className="my-2 flex items-center justify-between bg-primary/10 border border-primary/30 p-3 rounded-2xl text-primary">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={togglePreviewPlayback}
                  className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold hover:scale-105 transition"
                >
                  {isPlayingPreview ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                </button>
                <div className="text-sm font-semibold">
                  <span>Audio Preview ({Math.floor(audioDuration / 60)}m {audioDuration % 60}s)</span>
                </div>
              </div>
              
              <audio
                ref={previewAudioRef}
                src={audioPreviewUrl}
                onEnded={() => setIsPlayingPreview(false)}
                className="hidden"
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={cancelAudio}
                className="h-8 w-8 p-0 rounded-full hover:bg-primary/20 text-muted-foreground hover:text-primary"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Privacy Pill */}
          <div className="mt-1 mb-2">
            <div className="flex items-center text-primary font-bold text-[14px] cursor-pointer hover:bg-primary/10 w-fit px-3 py-0.5 rounded-full transition-colors -ml-3">
              <Globe className="h-4 w-4 mr-1.5" />
              Everyone can reply
            </div>
          </div>

          {/* Faint Divider Line */}
          <div className="w-full h-[1px] bg-border mb-3 mt-1"></div>

          {/* Icons & Post Button Row */}
          <div className="flex items-center justify-between">
            
            {/* The exact icon row from the image */}
            <div className="flex items-center gap-1 text-slate-400 -ml-2">
              
              {/* 1. Image */}
              <label htmlFor="tweetImage" className="p-2 hover:bg-primary/10 hover:text-primary rounded-full cursor-pointer transition-colors" title="Upload Image">
                <ImageIcon className="h-5 w-5" strokeWidth={1.5} />
                <input type="file" accept="image/*" id="tweetImage" className="hidden" onChange={handlePhotoUpload} disabled={isLoading || !!audioBlob} />
              </label>

              {/* 2. Custom GIF Icon (Now functional for GIF uploads) */}
              <label className="p-2 hover:bg-primary/10 hover:text-primary rounded-full cursor-pointer transition-colors hidden sm:block" title="Upload GIF">
                 <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.5}>
                    <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                    <text x="6" y="15" fontSize="8" fontWeight="bold" stroke="none" className="fill-current">GIF</text>
                 </svg>
                 <input type="file" accept="image/gif" className="hidden" onChange={handlePhotoUpload} disabled={isLoading || !!audioBlob} />
              </label>

              {/* 3. Audio/Mic (Replacing the slashed icon for functionality) */}
              <div className="flex items-center">
                <label htmlFor="tweetAudioFile" className={`p-2 hover:bg-primary/10 hover:text-primary rounded-full cursor-pointer transition-colors ${!!audioBlob ? "opacity-50 cursor-not-allowed" : ""}`} title="Upload Audio File">
                  <Upload className="h-5 w-5" strokeWidth={1.5} />
                  <input type="file" accept="audio/*" id="tweetAudioFile" className="hidden" onChange={handleAudioFileUpload} disabled={isLoading || !!audioBlob} />
                </label>

                {!isRecording ? (
                  <button type="button" onClick={startRecording} disabled={isLoading || !!audioBlob} className="p-2 hover:bg-primary/10 hover:text-primary rounded-full cursor-pointer transition-colors" title="Record Live Voice Tweet">
                    <Mic className="h-5 w-5" strokeWidth={1.5} />
                  </button>
                ) : (
                  <button type="button" onClick={stopRecording} className="p-2 bg-red-500/20 text-red-500 rounded-full animate-pulse hover:bg-red-500/30 transition-colors" title="Stop Recording">
                    <Square className="h-5 w-5 fill-current" />
                  </button>
                )}
              </div>

              {/* 4. Poll/List */}
              <button type="button" onClick={() => alert("Poll creation coming soon!")} className="p-2 hover:bg-primary/10 hover:text-primary rounded-full cursor-pointer transition-colors hidden sm:block" title="Create Poll">
                <ListPlus className="h-5 w-5" strokeWidth={1.5} />
              </button>
              
              {/* 5. Emoji/Smile */}
              <div className="relative">
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 hover:bg-primary/10 hover:text-primary rounded-full cursor-pointer transition-colors hidden sm:block" title="Add Emoji">
                  <Smile className="h-5 w-5" strokeWidth={1.5} />
                </button>
                
                {/* Emoji Picker Popup */}
                {showEmojiPicker && (
                  <div className="absolute top-10 left-0 bg-background border border-border shadow-xl rounded-xl p-3 z-50 w-[220px] grid grid-cols-4 gap-2 animate-in fade-in zoom-in-95 duration-200">
                    {basicEmojis.map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-2xl hover:bg-muted p-1.5 rounded-lg transition-colors flex justify-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 6. Calendar/Schedule */}
              <button type="button" onClick={() => alert("Tweet scheduling coming soon!")} className="p-2 hover:bg-primary/10 hover:text-primary rounded-full cursor-pointer transition-colors hidden sm:block" title="Schedule">
                <CalendarClock className="h-5 w-5" strokeWidth={1.5} />
              </button>
              
              {/* 7. Location */}
              <button type="button" onClick={() => alert("Location tagging coming soon!")} className="p-2 hover:bg-primary/10 hover:text-primary rounded-full cursor-pointer transition-colors hidden sm:block" title="Location">
                <MapPin className="h-5 w-5" opacity={0.5} strokeWidth={1.5} />
              </button>

              {/* 8. Flag */}
              <button type="button" className="p-2 hover:bg-primary/10 hover:text-primary rounded-full cursor-pointer transition-colors hidden sm:block">
                <Flag className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Post Button & Progress Ring */}
            <div className="flex items-center space-x-3">
              {characterCount > 0 && !audioBlob && (
                <div className="flex items-center space-x-2">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <svg className="w-6 h-6 transform -rotate-90">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" className="text-border" />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 10}`}
                        strokeDashoffset={`${2 * Math.PI * 10 * (1 - characterCount / maxLength)}`}
                        className={isOverLimit ? "text-red-500" : isNearLimit ? "text-yellow-500" : "text-primary"}
                      />
                    </svg>
                  </div>
                  <Separator orientation="vertical" className="h-6 bg-border mx-2" />
                </div>
              )}

              {/* Matched the exact disabled gray style from the image */}
              <Button
                type="submit"
                disabled={isPostDisabled}
                className={`font-bold rounded-full px-5 py-1.5 h-auto transition-opacity ${
                  isPostDisabled 
                    ? "bg-[#C4C4C4] text-white opacity-70 cursor-not-allowed hover:bg-[#C4C4C4]" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isLoading ? "Posting..." : audioBlob ? "Post Voice" : "Post"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background p-6 rounded-2xl max-w-sm w-full space-y-4 border border-border text-foreground shadow-xl">
            <h3 className="text-xl font-bold">Voice Tweet Authorization</h3>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit verification code sent to <strong className="text-foreground">{user?.email}</strong>
            </p>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full border border-border bg-background p-3 rounded-xl text-center font-mono text-xl outline-none text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="px-4 py-2 text-sm font-bold hover:bg-accent rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalAudioSubmit}
                disabled={isLoading}
                className="px-5 py-2 bg-foreground text-background text-sm font-bold rounded-full hover:bg-foreground/90 transition-colors"
              >
                {isLoading ? "Verifying..." : "Verify & Tweet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TweetComposer;