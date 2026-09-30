import React, { useState, useEffect, useRef } from 'react';
import {
  Sprout,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RefreshCw,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Compass,
  ArrowRight
} from 'lucide-react';
import { aiAPI } from '../services/api';

const DEFAULT_SUGGESTIONS = [
  'What should I grow this season?',
  'How often should I irrigate tomatoes?',
  'Will heavy rain affect my crop?',
  'What should I do if my leaves turn yellow?'
];

export default function AskAgriLinkAi({ farmerLocation, showToast }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Namaste! I am AgriLink's Agricultural AI Assistant. I can help you with crop selection, soil management, drip irrigation, weather adaptation, pest diagnosis, and harvest practices. What is on your mind today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (showToast) showToast('Could not hear voice clearly. Please try typing.', 'info');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleVoiceInput = () => {
    if (!speechSupported || !recognitionRef.current) {
      if (showToast) showToast('Voice recognition is not supported on this browser. Please type your query.', 'warning');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        if (showToast) showToast('Listening... Speak your agricultural question now.', 'info');
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  const speakText = (msgId, text) => {
    if (!('speechSynthesis' in window)) {
      if (showToast) showToast('Text-to-speech is not supported on this device.', 'warning');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#•]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend) => {
    const text = String(textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const historyContext = messages.slice(-4).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        text: m.text
      }));

      const res = await aiAPI.askAgriLinkAi({
        query: text,
        conversationHistory: historyContext,
        location: farmerLocation
      });

      if (res.data?.success) {
        const aiMsg = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: res.data.answer || res.data.reply,
          isOffTopic: res.data.isOffTopic,
          suggestedQuestions: res.data.suggestedQuestions || DEFAULT_SUGGESTIONS,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(res.data?.message || 'Unable to get advice');
      }
    } catch (err) {
      const aiErrorMsg = {
        id: `ai_err_${Date.now()}`,
        sender: 'ai',
        text: 'The AI assistant is temporarily busy. Please try again in a moment.',
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiErrorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 170px)',
      minHeight: '520px',
      maxHeight: '750px',
      background: 'linear-gradient(145deg, rgba(8, 26, 20, 0.95), rgba(4, 18, 14, 0.98))',
      border: '1.5px solid rgba(74, 222, 128, 0.35)',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(5, 20, 16, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
          }}>
            <Sprout size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: '#effbe7' }}>
                🌱 Ask AgriLink AI
              </h3>
              <span style={{
                background: 'rgba(52, 211, 153, 0.15)',
                border: '1px solid rgba(52, 211, 153, 0.4)',
                color: '#34d399',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: '800'
              }}>
                VOICE + TEXT
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#a3c2b0' }}>
              Agricultural Agronomy Advisory, Soils, Weather & Crop Guidance
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#9db5aa',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Reset Conversation"
        >
          <RefreshCw size={12} />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {messages.map((m) => {
          const isAi = m.sender === 'ai';
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                justifyContent: isAi ? 'flex-start' : 'flex-end',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              {isAi && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(52, 211, 153, 0.18)',
                  border: '1px solid rgba(52, 211, 153, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                  flexShrink: 0
                }}>
                  <Sprout size={16} />
                </div>
              )}

              <div style={{
                maxWidth: '82%',
                background: isAi ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, #10b981, #059669)',
                border: isAi ? '1px solid rgba(74, 222, 128, 0.2)' : 'none',
                borderRadius: isAi ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                padding: '12px 16px',
                color: '#effbe7',
                fontSize: '13.5px',
                lineHeight: '1.55',
                boxShadow: isAi ? 'none' : '0 4px 16px rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{ whiteSpace: 'pre-line' }}>
                  {m.text}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '6px',
                  gap: '10px',
                  fontSize: '10px',
                  color: isAi ? '#86a899' : 'rgba(255,255,255,0.75)'
                }}>
                  <span>{m.timestamp}</span>

                  {isAi && (
                    <button
                      onClick={() => speakText(m.id, m.text)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: speakingMsgId === m.id ? '#34d399' : '#a3c2b0',
                        cursor: 'pointer',
                        padding: '2px 6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}
                      title="Read aloud"
                    >
                      {speakingMsgId === m.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                      <span>{speakingMsgId === m.id ? 'Stop' : 'Listen'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'rgba(52, 211, 153, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}>
              <RefreshCw size={14} className="animate-spin" />
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(74, 222, 128, 0.2)',
              borderRadius: '4px 18px 18px 18px',
              padding: '10px 16px',
              color: '#9db5aa',
              fontSize: '12.5px'
            }}>
              Analyzing agricultural parameters...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pills */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        background: 'rgba(0, 0, 0, 0.25)',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        <span style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <Sparkles size={12} /> Suggested:
        </span>
        {DEFAULT_SUGGESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={loading}
            style={{
              background: 'rgba(55, 189, 120, 0.12)',
              border: '1px solid rgba(55, 189, 120, 0.3)',
              color: '#a7f3d0',
              padding: '5px 12px',
              borderRadius: '16px',
              fontSize: '11px',
              cursor: loading ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              transition: 'background 0.2s ease'
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(5, 20, 16, 0.9)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* Voice Input Button */}
        <button
          onClick={toggleVoiceInput}
          disabled={loading}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: isListening ? '#ef4444' : 'rgba(52, 211, 153, 0.15)',
            border: `1.5px solid ${isListening ? '#ef4444' : '#34d399'}`,
            color: isListening ? '#ffffff' : '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: isListening ? '0 0 16px #ef4444' : 'none',
            transition: 'all 0.2s ease'
          }}
          title={isListening ? 'Stop listening' : 'Speak into microphone'}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          placeholder={isListening ? 'Listening to voice...' : 'Ask about crops, soil, irrigation, weather, diseases...'}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          disabled={loading}
          style={{
            flex: 1,
            minHeight: '46px',
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1.5px solid rgba(52, 211, 153, 0.35)',
            color: '#effbe7',
            fontSize: '13.5px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />

        {/* Send Button */}
        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !inputText.trim()}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: (!inputText.trim() || loading) ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none',
            color: (!inputText.trim() || loading) ? '#6b7280' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: (!inputText.trim() || loading) ? 'not-allowed' : 'pointer',
            flexShrink: 0
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
