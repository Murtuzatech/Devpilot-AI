import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Plus, 
  Copy, 
  Check, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ArrowRight,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Code2,
  Terminal,
  Cpu,
  Layers
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
}

const QUICK_CARDS = [
  {
    title: 'Code Architecture',
    desc: 'Scalable state management patterns in Next.js',
    icon: Layers,
    prompt: 'Explain clean architecture for scalable Next.js and React applications with state management.'
  },
  {
    title: 'DSA Optimization',
    desc: 'Two Sum hash map logic & complexity analysis',
    icon: Code2,
    prompt: 'Explain the optimal O(n) HashMap approach for Two Sum with time and space complexity breakdown.'
  },
  {
    title: 'Custom Hooks',
    desc: 'Build useDebounce & useThrottle in TypeScript',
    icon: Cpu,
    prompt: 'Write a production-ready useDebounce and useThrottle custom React hook in TypeScript.'
  },
  {
    title: 'Node.js & Backend',
    desc: 'Handle async errors and unhandled rejections',
    icon: Terminal,
    prompt: 'How to handle unhandled promise rejections and clean error handling middleware in Node.js?'
  }
];

const STABLE_MODEL = 'gemini-3.1-flash-lite';

export default function DevChatAI() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Compute dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Extract logged in user display name or fallback
  const getUserName = () => {
    const user = auth.currentUser;
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    return 'Murtuza';
  };

  // Load chat sessions from Firestore
  useEffect(() => {
    async function fetchChatSessions() {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data.chatSessions) && data.chatSessions.length > 0) {
            setSessions(data.chatSessions);
            const latestSession = data.chatSessions[0];
            setCurrentSessionId(latestSession.id);
            setMessages(latestSession.messages || []);
            return;
          }
        }
        
        createNewSession([], false);
      } catch (err) {
        console.error('Failed to load chat history from Firestore:', err);
      }
    }

    fetchChatSessions();
  }, []);

  // Sync sessions directly to Firestore
  const syncSessionsToFirestore = async (updatedSessions: ChatSession[]) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(
        userDocRef,
        {
          chatSessions: updatedSessions,
          chatCount: updatedSessions.reduce((acc, s) => acc + s.messages.filter(m => m.sender === 'user').length, 0),
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Failed to sync chat sessions to Firestore:', err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Speech Recognition configuration
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block omitted.');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Create a brand new session
  const createNewSession = (initialList: Message[] = [], shouldSync = true) => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: 'New Discussion',
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: initialList
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    setCurrentSessionId(newSession.id);
    setMessages(initialList);

    if (shouldSync) {
      syncSessionsToFirestore(updated);
    }
  };

  // Select a session from history
  const selectSession = (session: ChatSession) => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCurrentSessionId(session.id);
    setMessages(session.messages || []);
  };

  // Delete a session
  const deleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const filtered = sessions.filter(s => s.id !== sessionId);
    setSessions(filtered);
    syncSessionsToFirestore(filtered);

    if (currentSessionId === sessionId) {
      if (filtered.length > 0) {
        setCurrentSessionId(filtered[0].id);
        setMessages(filtered[0].messages || []);
      } else {
        createNewSession();
      }
    }
  };

  // Gemini API request
  const requestDevPilotAI = async (prompt: string): Promise<string> => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Missing VITE_GEMINI_API_KEY in your .env file.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${STABLE_MODEL}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `API Error Status: ${res.status}`);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
  };

  // Send message handler
  const handleSend = async (overridePrompt?: string) => {
    const textToSend = overridePrompt || inputText;
    if (!textToSend.trim() || loading) return;

    let targetSessionId = currentSessionId;
    let currentSessionList = [...sessions];

    if (!targetSessionId) {
      const newSession: ChatSession = {
        id: `session_${Date.now()}`,
        title: textToSend.slice(0, 26) + '...',
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages: []
      };
      targetSessionId = newSession.id;
      currentSessionList = [newSession, ...sessions];
      setCurrentSessionId(targetSessionId);
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const intermediateMessages = [...messages, userMsg];
    setMessages(intermediateMessages);
    if (!overridePrompt) setInputText('');
    setLoading(true);

    try {
      const responseText = await requestDevPilotAI(textToSend);

      const finalMessages: Message[] = [
        ...intermediateMessages,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: responseText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];

      setMessages(finalMessages);

      const updatedSessions = currentSessionList.map(s => {
        if (s.id === targetSessionId) {
          return {
            ...s,
            title: s.title === 'New Discussion' ? textToSend.slice(0, 26) + (textToSend.length > 26 ? '...' : '') : s.title,
            updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            messages: finalMessages
          };
        }
        return s;
      });

      setSessions(updatedSessions);
      await syncSessionsToFirestore(updatedSessions);
    } catch (err: any) {
      const errorMessages: Message[] = [
        ...intermediateMessages,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `DevPilot AI Notice: ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];

      setMessages(errorMessages);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].includes(' ') ? '' : lines[0];
        const code = lang ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-[#333] bg-[#0d1117] font-mono text-xs shadow-lg">
            <div className="bg-[#161b22] px-3.5 py-1.5 flex items-center justify-between text-neutral-400 text-[11px] border-b border-[#2d3345]">
              <span className="text-indigo-400 font-semibold">{lang || 'code'}</span>
              <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3.5 text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed font-mono">
              {code}
            </pre>
          </div>
        );
      }
      return (
        <p key={index} className="whitespace-pre-wrap leading-relaxed">
          {part}
        </p>
      );
    });
  };

  return (
    <div className="h-[calc(100vh-5.5rem)] flex font-sans text-neutral-300 bg-[#131314] -m-6 selection:bg-indigo-500/30 overflow-hidden">
      
      {/* 1. Chat History Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 ease-in-out bg-[#18191a] border-r border-[#2d2f31] flex flex-col shrink-0 overflow-hidden`}
      >
        <div className="p-3 border-b border-[#2d2f31] flex items-center justify-between">
          <button
            onClick={() => createNewSession()}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 py-1 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
            Recent Conversations
          </div>

          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => selectSession(session)}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs transition ${
                currentSessionId === session.id
                  ? 'bg-[#282a2c] text-white border border-[#3c4043]'
                  : 'text-neutral-400 hover:bg-[#202123] hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                <span className="truncate max-w-[140px]">{session.title}</span>
              </div>

              <button
                onClick={(e) => deleteSession(e, session.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition cursor-pointer"
                title="Delete chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#131314]">
        
        {/* Top Navbar */}
        <div className="h-12 bg-[#1e1f20] border-b border-[#2d2f31] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#282a2c] transition cursor-pointer"
              title={isSidebarOpen ? "Collapse history" : "Open history"}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4 text-indigo-400" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-white text-sm font-semibold tracking-wide">DevPilot AI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2a2b2e] text-indigo-400 font-mono border border-[#3c4043]">
                Firestore History
              </span>
            </div>
          </div>
        </div>

        {/* Message Thread or Gemini Welcome Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.length === 0 ? (
            <div className="max-w-3xl mx-auto py-12 flex flex-col justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-300">
              
              {/* Dynamic Header */}
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight">
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    {getGreeting()}, {getUserName()}
                  </span>
                </h1>
                <p className="text-2xl font-medium text-neutral-400">
                  How can I help you build today?
                </p>
              </div>

              {/* Gemini-Style Suggestion Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
                {QUICK_CARDS.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSend(card.prompt)}
                      className="p-4 rounded-2xl bg-[#1e1f20] hover:bg-[#242527] border border-[#2d2f31] hover:border-indigo-500/40 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-32 group shadow-sm hover:shadow-indigo-500/5"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-neutral-200 group-hover:text-white transition">
                          {card.title}
                        </span>
                        <div className="p-2 rounded-xl bg-[#282a2c] text-neutral-400 group-hover:text-indigo-400 group-hover:bg-indigo-950/40 transition">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="flex items-end justify-between w-full">
                        <span className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                          {card.desc}
                        </span>
                        <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition shrink-0 ml-2" />
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#282a2c] text-white rounded-tr-sm border border-[#3c4043]'
                        : 'bg-[#1e1f20] border border-[#2d2f31] text-neutral-200 rounded-tl-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-2 text-[10px] text-neutral-400">
                      <span className="font-semibold">
                        {msg.sender === 'user' ? 'You' : 'DevPilot AI'}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <span>{msg.time}</span>
                        {msg.sender === 'ai' && (
                          <>
                            <button
                              onClick={() => handleSpeak(msg.id, msg.text)}
                              className="hover:text-white transition cursor-pointer p-0.5"
                              title="Read Aloud"
                            >
                              {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopy(msg.id, msg.text)}
                              className="hover:text-white transition cursor-pointer p-0.5"
                              title="Copy text"
                            >
                              {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {renderMessageContent(msg.text)}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-[#2d2f31] border border-[#3c4043] flex items-center justify-center text-neutral-300 shrink-0 mt-0.5 font-bold text-xs">
                      U
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3.5 justify-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="bg-[#1e1f20] border border-[#2d2f31] rounded-3xl rounded-tl-sm p-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '200ms' }} />
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" style={{ animationDelay: '400ms' }} />
                    <span className="text-[11px] text-neutral-400 font-mono ml-1">DevPilot AI is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Dock */}
        <div className="p-4 bg-[#131314] shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center bg-[#1e1f20] border border-[#3c4043] focus-within:border-indigo-500 rounded-full px-4 py-2 shadow-xl transition-all">
              <button
                onClick={toggleListening}
                className={`p-2 rounded-full transition cursor-pointer mr-1 ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-bounce' 
                    : 'text-neutral-400 hover:text-white hover:bg-[#282a2c]'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Voice input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-400" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isListening ? "Listening..." : "Ask DevPilot AI..."}
                className="flex-1 bg-transparent text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none px-2"
              />

              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || loading}
                className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 disabled:hover:bg-indigo-600 transition cursor-pointer ml-1"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[10px] text-center text-neutral-500 mt-2 font-mono">
              Individual chat sessions are preserved in Cloud Firestore.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}