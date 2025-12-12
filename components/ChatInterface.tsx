import { Chat, GenerateContentResponse, Part } from '@google/genai';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { INITIAL_MESSAGES, QUICK_REPLIES } from '../constants';
import { createChatSession, getTrendReport } from '../services/geminiService';
import { Message, ResponseImage } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { ChatMessage, LoadingMessage } from './ChatMessage';
import QuickReply from './QuickReply';
import UserInput from './UserInput';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(true);


  useEffect(() => {
    chatRef.current = createChatSession();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const parseResponseForImages = (text: string): { cleanedText: string; images: ResponseImage[] } => {
    const imageRegex = /\[image:\s*(.*?)\s*\]/g;
    const images: ResponseImage[] = [];
    let match;

    while ((match = imageRegex.exec(text)) !== null) {
      const query = match[1].trim();
      if (query) {
        images.push({
          url: `https://source.unsplash.com/random/800x800/?${encodeURIComponent(query)}&sig=${Math.random()}`,
          alt: query,
        });
      }
    }
    const cleanedText = text.replace(imageRegex, '').trim();
    return { cleanedText, images };
  };


  const handleSend = useCallback(async (text: string, imageFile: File | null) => {
    setIsLoading(true);
    setError(null);
    setShowQuickReplies(false);

    let userMessageImage: string | undefined = undefined;
    if (imageFile) {
      try {
        userMessageImage = await fileToBase64(imageFile);
      } catch (error) {
        console.error("Error converting file to base64:", error);
        setError("Sorry, there was a problem with your image. Please try a different one.");
        setIsLoading(false);
        return;
      }
    }

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text, image: userMessageImage };
    setMessages(prev => [...prev, userMessage]);

    try {
      let responseText: string = "";
      let responseSources = undefined;

      const trendKeywords = ['trend', 'trending', 'season'];
      if (!imageFile && trendKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
          const { text: reportText, sources } = await getTrendReport(text);
          responseText = reportText;
          responseSources = sources;
      } else {
        if (!chatRef.current) {
            throw new Error("Chat session not initialized.");
        }

        let response: GenerateContentResponse;
        if (imageFile && userMessageImage) {
            const imageBase64Data = userMessageImage.split(',')[1];
            const imagePart: Part = {
                inlineData: {
                    mimeType: imageFile.type,
                    data: imageBase64Data,
                },
            };
            const textPrompt = text || "This is a visual mood board. Analyze the aesthetic and suggest how to build on it. What items would you add?";
            const textPart: Part = { text: textPrompt };
            // FIX: The `sendMessage` method expects a `SendMessageParameters` object, which has a `message` property containing the content.
            response = await chatRef.current.sendMessage({ message: [textPart, imagePart] });
        } else {
            // FIX: The `sendMessage` method expects a `SendMessageParameters` object, which has a `message` property containing the content.
            response = await chatRef.current.sendMessage({ message: text });
        }
        responseText = response.text;
      }
      
      const { cleanedText, images: responseImages } = parseResponseForImages(responseText);

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: cleanedText,
        sources: responseSources,
        responseImages: responseImages
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError("Sorry, I'm having a bit of trouble right now. Please try again later.");
      const errorResponseMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: "Oh no, my circuits are in a tangle! I couldn't process that. Could you try asking again in a different way?"
      };
      setMessages(prev => [...prev, errorResponseMessage]);
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <LoadingMessage />}
        {error && <div className="text-center text-red-500 p-4">{error}</div>}
      </div>
      <div className="shrink-0">
        {showQuickReplies && messages.length <= 1 && <QuickReply suggestions={QUICK_REPLIES} onSelect={(text) => handleSend(text, null)} isLoading={isLoading} />}
        <UserInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatInterface;