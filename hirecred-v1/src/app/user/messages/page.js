"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Clock } from "lucide-react";

export default function MessagesPage() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("hirecred_user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      fetchMessages(parsed.id);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation]);

  const fetchMessages = async (userId) => {
    try {
      const res = await fetch(`/api/messages?userId=${userId}`);
      const data = await res.json();
      if (res.ok) setMessages(data.conversations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromId: user.id,
          toId: selectedConversation.withUserId,
          text: newMessage,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedConversation((prev) => ({
          ...prev,
          messages: [...(prev.messages || []), data.message],
        }));
        setNewMessage("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    if (diff < 86400000) return "Today";
    if (diff < 172800000) return "Yesterday";
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="text-gray-400 text-sm mt-1">
          Your conversations with employers
        </p>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden flex h-[600px]">

        {/* Conversations List */}
        <div className="w-72 border-r border-dark-600 flex flex-col">
          <div className="px-4 py-3 border-b border-dark-600">
            <p className="text-white font-medium text-sm">Conversations</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <MessageSquare size={32} className="text-gray-600 mb-3" />
                <p className="text-gray-500 text-sm">No messages yet</p>
                <p className="text-gray-600 text-xs mt-1">
                  Employers will message you here
                </p>
              </div>
            ) : (
              messages.map((conv, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-dark-700 transition text-left border-b border-dark-600/50 ${
                    selectedConversation?.withUserId === conv.withUserId
                      ? "bg-dark-700"
                      : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {conv.withUserName?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm font-medium truncate">
                        {conv.withUserName || "Unknown"}
                      </p>
                      {conv.lastMessageAt && (
                        <p className="text-gray-600 text-xs flex-shrink-0 ml-2">
                          {formatDate(conv.lastMessageAt)}
                        </p>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs truncate mt-0.5">
                      {conv.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3 border-b border-dark-600 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold text-sm">
                  {selectedConversation.withUserName?.charAt(0).toUpperCase() ||
                    "?"}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {selectedConversation.withUserName}
                  </p>
                  <p className="text-gray-500 text-xs">Employer</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {selectedConversation.messages?.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">
                      No messages in this conversation
                    </p>
                  </div>
                ) : (
                  selectedConversation.messages?.map((msg, i) => {
                    const isOwn = msg.fromId === user?.id;
                    return (
                      <div
                        key={i}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                            isOwn
                              ? "bg-brand-600 text-white rounded-br-sm"
                              : "bg-dark-700 text-gray-200 rounded-bl-sm"
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p
                            className={`text-xs mt-1 flex items-center gap-1 ${
                              isOwn ? "text-brand-200" : "text-gray-500"
                            }`}
                          >
                            <Clock size={10} />
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="px-5 py-4 border-t border-dark-600 flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-dark-700 border border-dark-500 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 transition"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <MessageSquare size={48} className="text-gray-600 mb-4" />
              <p className="text-white font-medium">Select a conversation</p>
              <p className="text-gray-500 text-sm mt-1">
                Choose a conversation from the left to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}