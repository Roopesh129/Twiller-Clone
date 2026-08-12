"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Search, Send, MessageSquare, ArrowLeft } from "lucide-react";
import LoadingSpinner from "./loading-spinner";
import { Input } from "./ui/input";

export default function MessagesPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/api/user/all");
      // Filter out the current user
      const otherUsers = res.data.filter((u: any) => u._id !== user?._id);
      setUsers(otherUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchMessages = async () => {
    if (!user?._id || !selectedUser?._id) return;
    setLoadingChat(true);
    try {
      const res = await axiosInstance.get(`/api/messages/${user._id}/${selectedUser._id}`);
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser?._id || !user?._id) return;

    try {
      const res = await axiosInstance.post("/api/messages", {
        sender: user._id,
        receiver: selectedUser._id,
        content: newMessage,
      });
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div className="flex h-screen bg-background border-r border-border max-w-[600px] w-full mx-auto">
      {/* Left Pane: User List */}
      <div className={`w-full sm:w-2/5 border-r border-border flex flex-col ${selectedUser ? "hidden sm:flex" : "flex"}`}>
        <div className="p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10 h-14 flex items-center justify-between">
          <h2 className="font-bold text-xl">Messages</h2>
        </div>
        
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              type="text" 
              placeholder="Search Direct Messages" 
              className="pl-10 rounded-full bg-accent/50 border-none focus-visible:ring-1 focus-visible:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loadingUsers ? (
            <div className="flex justify-center p-8">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            users.map((u) => (
              <div 
                key={u._id}
                onClick={() => setSelectedUser(u)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-accent transition-colors ${selectedUser?._id === u._id ? 'bg-accent/80 border-r-2 border-sky-500' : ''}`}
              >
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarImage src={u.avatar} />
                  <AvatarFallback className="bg-slate-300 text-slate-700 font-bold">{u.displayName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1">
                    <span className="font-bold truncate">{u.displayName}</span>
                  </div>
                  <div className="text-muted-foreground text-sm truncate">@{u.username}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: Chat Window */}
      <div className={`flex-1 flex flex-col ${!selectedUser ? "hidden sm:flex" : "flex"}`}>
        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Select a message</h1>
            <p className="text-muted-foreground max-w-sm mb-6">
              Choose from your existing conversations, start a new one, or just keep swimming.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10 h-14 flex items-center gap-3">
              <button 
                className="sm:hidden p-2 -ml-2 rounded-full hover:bg-accent"
                onClick={() => setSelectedUser(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-bold text-lg">{selectedUser.displayName}</h2>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {loadingChat ? (
                <div className="flex justify-center p-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 text-sm">
                  This is the beginning of your direct message history with @{selectedUser.username}.
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                  return (
                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-sky-500 text-white rounded-br-sm' : 'bg-accent text-foreground rounded-bl-sm'}`}>
                        <div className="text-[15px]">{msg.content}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-border bg-background">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-accent/50 rounded-2xl p-1 px-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Start a new message"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] py-2.5 outline-none text-foreground"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="p-2 text-sky-500 hover:bg-sky-500/10 rounded-full transition disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
