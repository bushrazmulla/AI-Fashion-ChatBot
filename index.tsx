import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import DOMPurify from 'dompurify';
import { marked } from 'marked';


// --- NEW SYSTEM PROMPT: "The Classic Curator" ---
const AURA_SYSTEM_PROMPT = `
You are "Aura," an elegant and discerning personal stylist and fashion curator. Your persona is that of a **chic, polished, and timelessly sophisticated** expert, like a top-tier personal shopper at a luxury boutique. You are *not* a fleeting trend-chaser; you are **refined, articulate, and encouraging,** focusing on quality, fit, and building a timeless wardrobe. Your goal is to help users find "requinte e sofisticação" (refinement and sophistication) in every piece.

**Core Principles:**

1.  **Elegance is Key:** Focus on clean lines, quality fabrics (silk, cashmere, linen, wool), and sophisticated tailoring.
2.  **Timeless over Trendy:** Prioritize classic, "atemporal" pieces that form the foundation of a strong wardrobe. Discuss trends only as accents to a classic base.
3.  **Refined Language:** Use sophisticated and clear vocabulary. Describe outfits with an eye for detail, fit, and "the feeling" of luxury.
    * (e.g., "Consider the structure of a perfectly tailored blazer. Paired with a simple silk camisole and dark-wash denim, it creates an effortlessly chic and timeless silhouette.")
4.  **Invest in Quality:** Gently guide users toward "investment pieces" (a great coat, a classic leather bag, a perfect pair of trousers) that will last for years.
5.  **Polished Confidence:** Your ultimate goal is to make the user feel confident, polished, and sophisticated.

**Key Capabilities (Features):**

* **1. The "Polished Ensemble" Builder:**
    * **User:** "I have a business dinner."
    * **You:** "An important evening. To ensure the perfect impression, what is the venue and industry? A classic silk blouse with wide-leg trousers is always sophisticated, or perhaps a structured sheath dress."

* **2. "The Investment Piece" Advisor:**
    * **User:** "How do I style a trench coat?"
    * **You:** "The trench coat is the cornerstone of a timeless wardrobe! A truly 'atemporal' piece.
        * **A) Weekday Chic:** Style it over tailored trousers and a knit sweater.
        * **B) Casual Elegance:** Cinch it over dark jeans and add classic loafers or white sneakers.
        * **C) Evening Sophistication:** Drape it over a simple black dress and heels."

* **3. The "Aesthetic Defined" (Style Translator):**
    * **User:** "I want to look more 'sofisticado'."
    * **You:** "A wonderful goal. 'Sofisticação' is all about curated simplicity. Your new mood board is: monochrome outfits (like all-white or all-black), structured bags, delicate gold jewelry, and investing in classic, well-fitting staples. The color palette is refined: think 'Elegante' (deep burgundy), 'Classico' (warm beige), and 'Sofisticado' (crisp white)."

* **4. The "Mindful Atelier" (Sustainable Luxury):**
    * When a user wants a new item, suggest quality over quantity.
    * "That's a beautiful addition. When looking for a new knit, I always suggest checking the fabric composition. A high percentage of wool or cashmere will not only feel more luxurious but will also last you seasons longer than synthetics."
`;

// --- NEW: On-Theme Mood Board Images (Burgundy, Beige, White) ---
const moodImages = [
  "https://images.unsplash.com/photo-1588117269370-afc406b129b3?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1620704998342-320b2f0a8f8c?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1594495894542-a46cc73e081a?q=80&w=2071&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552668693-2be5185e1b2e?q=80&w=1974&auto=format&fit=crop"
];

// --- Types ---
interface MessagePart {
  text: string;
}

interface Message {
  role: 'user' | 'model';
  parts: MessagePart[];
}

// --- React Component ---
const App: React.FC = () => {
  // --- State ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chat, setChat] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // --- Effects ---
  useEffect(() => {
    const initGenAI = () => {
      try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
          throw new Error("API_KEY environment variable not set");
        }
        const ai = new GoogleGenAI({ apiKey });

        const chatSession = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: AURA_SYSTEM_PROMPT,
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        });

        setChat(chatSession);

        // --- NEW THEME GREETING ---
        const greeting = "Welcome. How may I assist you in curating your style today?";
        setMessages([{ role: 'model', parts: [{ text: greeting }] }]);
        setIsLoading(false);

      } catch (err) {
        console.error("Error initializing AI:", err);
        setError("My apologies, I am having a slight technical issue. Please refresh the page.");
        setIsLoading(false);
      }
    };

    initGenAI();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === moodImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // --- Handlers ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chat) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);
    const currentInput = input;
    setInput('');

    try {
      const response: GenerateContentResponse = await chat.sendMessage({ message: currentInput });
      const text = response.text;
      
      const modelMessage: Message = { role: 'model', parts: [{ text }] };
      setMessages((prevMessages) => [...prevMessages, modelMessage]);

    } catch (err) {
      console.error("Error sending message:", err);
      setError("My apologies, I seem to have lost my train of thought. Could you please repeat that?");
      // Revert optimistic UI update on error
      setMessages(prev => prev.filter(msg => msg !== userMessage));
      setInput(currentInput);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f0eb' }}>
      <div className="bg-white/70 backdrop-blur-md w-full h-screen flex flex-col overflow-hidden">
        
        <div className="p-5 text-center border-b border-[#d3bfae]/50 flex flex-col items-center">
          <h1 className="text-5xl font-bold text-[#6a1a24]">
            Aura
          </h1>
          <p className="text-sm text-[#6a1a24] tracking-[0.2em] uppercase mt-1">
            Your Style Curator
          </p>
        </div>

        <div className="h-32 sm:h-40 w-full overflow-hidden relative group">
          <img
            key={currentImageIndex}
            src={moodImages[currentImageIndex]}
            alt="Sophisticated fashion mood board"
            className="w-full h-full object-cover transition-opacity duration-1000 ease-in-out animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent"></div>
        </div>

        <div className="flex-1 p-6 space-y-5 overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-4 rounded-2xl max-w-[85%] shadow-sm leading-relaxed animate-fade-in ${
                  msg.role === 'user'
                    ? 'bg-[#d3bfae] text-[#6a1a24] rounded-br-none'
                    : 'bg-[#ffffff] text-[#3a3a3a] rounded-bl-none border border-[#d3bfae]/70'
                }`}
              >
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(msg.parts[0].text)) }} />
              </div>
            </div>
          ))}

          {isLoading && messages.length > 1 && (
            <div className="flex justify-start">
              <div className="p-4 rounded-2xl max-w-[85%] shadow-sm bg-[#ffffff] text-[#3a3a3a] rounded-bl-none border border-[#d3bfae]/70 animate-fade-in">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#d3bfae] rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-[#d3bfae] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[#d3bfae] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          {error && (
             <div className="flex justify-start">
              <div className="p-4 rounded-2xl max-w-[85%] shadow-sm bg-[#fbebee] text-[#c62828] rounded-bl-none border border-[#ef9a9a] animate-fade-in">
                <p>{error}</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-5 border-t border-[#d3bfae]/50">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Ask for style advice..."
              className="flex-1 px-4 py-3 text-sm border-2 border-[#d3bfae] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6a1a24]/50 bg-white/70 placeholder:text-[#ab9a8e] text-[#3a3a3a] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 text-sm font-medium text-white bg-[#6a1a24] rounded-xl shadow-md hover:bg-[#501018] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);