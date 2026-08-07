import React, { useState, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Volume2, Mic, RefreshCw } from 'lucide-react';
import { Medication, UserProfile } from '../types';

interface AIChatViewProps {
  userProfile: UserProfile;
  medications: Medication[];
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export const AIChatView: React.FC<AIChatViewProps> = ({ userProfile, medications }) => {
  const userName = userProfile.fullName || 'User';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: `Hello ${userName}! I'm DoseBuddy, your AI health companion. How can I help you with your medications, meal timing, or blood sugar today?`,
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Update initial greeting when userProfile changes
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === '1') {
        return [
          {
            id: '1',
            sender: 'bot',
            text: `Hello ${userName}! I'm DoseBuddy, your AI health companion. How can I help you with your medications, meal timing, or blood sugar today?`,
            time: 'Just now',
          },
        ];
      }
      return prev;
    });
  }, [userProfile.fullName]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          patientProfile: { 
            name: userName, 
            age: userProfile.age || 68, 
            condition: userProfile.medicalConditions?.join(', ') || 'Health Management' 
          },
          medicationList: medications,
        }),
      });
      const data = await res.json();

      const botMsg: Message = {
        id: `b_${Date.now()}`,
        sender: 'bot',
        text: data.reply || `I am here with you, ${userName}! Remember to take your medications regularly with food.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const fallbackMsg: Message = {
        id: `b_${Date.now()}`,
        sender: 'bot',
        text: `I am always here for you, ${userName}! Please make sure to check your blood glucose before your insulin and stay hydrated.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-sky-700 to-teal-700 text-white rounded-2xl shadow-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
            <Sparkles className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">DoseBuddy AI Care Assistant</h2>
            <p className="text-sky-100 text-sm">
              Powered by Gemini 3.6 Flash • Ask about diabetes food pairings, blood glucose levels, or dosage timing
            </p>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-slate-500 uppercase flex-shrink-0">Quick Questions:</span>
        {[
          "Should I take Metformin before or after breakfast?",
          "What do I do if my blood sugar is below 80 mg/dL?",
          "Can I take Lisinopril with my morning coffee?",
        ].map((promptText, i) => (
          <button
            key={i}
            onClick={() => setInput(promptText)}
            className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold rounded-full border border-sky-200 flex-shrink-0 transition"
          >
            "{promptText}"
          </button>
        ))}
      </div>

      {/* Messages Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[400px] max-h-[500px] overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                m.sender === 'user' ? 'bg-sky-700 text-white' : 'bg-teal-600 text-white'
              }`}
            >
              {m.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>

            <div
              className={`max-w-[80%] p-4 rounded-2xl space-y-1 ${
                m.sender === 'user'
                  ? 'bg-sky-700 text-white rounded-tr-none'
                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold opacity-75">
                  {m.sender === 'user' ? userName : 'DoseBuddy AI'}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] opacity-70">{m.time}</span>
                  {m.sender === 'bot' && (
                    <button
                      onClick={() => speakText(m.text)}
                      className="p-1 hover:bg-slate-200 rounded text-slate-600 transition"
                      title="Read Aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-base leading-relaxed font-medium">{m.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-500 font-medium text-sm p-3 bg-slate-50 rounded-xl w-fit">
            <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
            <span>DoseBuddy AI is thinking...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask DoseBuddy AI a question about your medication or health..."
          className="flex-1 px-5 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:border-sky-600 focus:outline-none text-slate-800 font-medium text-lg shadow-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-4 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-2xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      </form>
    </div>
  );
};
