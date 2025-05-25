'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Paperclip,
  Mic,
  MoreVertical,
  Phone,
  Video,
  Music,
  FileAudio,
  Image as ImageIcon,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

interface Message {
  id: string;
  userId: string;
  user: {
    name: string;
    image?: string;
  };
  content: string;
  type: 'text' | 'audio' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  createdAt: Date;
  readBy: string[];
}

interface CollaborationChatProps {
  collaborationId: string;
  participants: {
    id: string;
    name: string;
    image?: string;
    role: string;
    online: boolean;
  }[];
}

export function CollaborationChat({
  collaborationId,
  participants,
}: CollaborationChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize WebSocket connection for real-time chat
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/collaboration/${collaborationId}`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          setMessages((prev) => [...prev, data.message]);
          break;
        case 'typing':
          setTypingUsers(data.users);
          break;
        case 'user_joined':
          // Handle user joined
          break;
        case 'user_left':
          // Handle user left
          break;
      }
    };

    // Fetch message history
    fetchMessages();

    return () => {
      ws.close();
    };
  }, [collaborationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/collaborations/${collaborationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !session?.user) return;

    try {
      const res = await fetch(`/api/collaborations/${collaborationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          type: 'text',
        }),
      });

      if (res.ok) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/collaborations/${collaborationId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // File uploaded successfully
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isOwn = message.userId === session?.user?.id;

    return (
      <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.user.image} />
          <AvatarFallback>{message.user.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500">{message.user.name}</span>
            <span className="text-xs text-gray-400">
              {format(new Date(message.createdAt), 'h:mm a')}
            </span>
          </div>
          
          <div
            className={`rounded-lg px-4 py-2 max-w-md ${
              isOwn
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {message.type === 'text' && <p>{message.content}</p>}
            
            {message.type === 'audio' && (
              <div className="flex items-center gap-2">
                <FileAudio className="h-4 w-4" />
                <audio controls src={message.fileUrl} className="max-w-xs" />
              </div>
            )}
            
            {message.type === 'image' && (
              <img
                src={message.fileUrl}
                alt={message.fileName}
                className="rounded max-w-xs"
              />
            )}
            
            {message.type === 'file' && (
              <a
                href={message.fileUrl}
                download={message.fileName}
                className="flex items-center gap-2 underline"
              >
                <Music className="h-4 w-4" />
                {message.fileName}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Collaboration Chat</CardTitle>
            <div className="flex -space-x-2">
              {participants.slice(0, 3).map((participant) => (
                <Avatar key={participant.id} className="h-8 w-8 border-2 border-white">
                  <AvatarImage src={participant.image} />
                  <AvatarFallback>{participant.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              {participants.length > 3 && (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                  +{participants.length - 3}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost">
              <Phone className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <Video className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
            </div>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost">
            <Mic className="h-4 w-4" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1"
          />
          
          <Button onClick={sendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept="audio/*,image/*,.pdf,.doc,.docx"
            className="hidden"
          />
        </div>
      </div>
    </Card>
  );
}