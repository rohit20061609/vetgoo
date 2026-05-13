'use client';

import { useEffect, useRef, useState } from 'react';
import { useConversationStore } from '@/store/app';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPage() {
  const {
    conversationId,
    messages,
    isLoading,
    addMessage,
    setIsLoading,
    clearConversation,
  } = useConversationStore();

  const [inputValue, setInputValue] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    setInputValue('');
    addMessage('user', userMessage);
    setCurrentResponse('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullResponse += chunk;
        setCurrentResponse(fullResponse);
      }

      addMessage('assistant', fullResponse);
      setCurrentResponse('');
    } catch (error) {
      console.error('Error:', error);
      setCurrentResponse('Sorry, an error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    clearConversation();
    setInputValue('');
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 md:p-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🤖 AI Veterinarian</h2>
            <p className="text-gray-600 text-sm">
              Chat with our intelligent veterinary assistant
            </p>
          </div>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleNewConversation}>
              New Chat
            </Button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && currentResponse === '' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center py-12"
            >
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to VetGo AI Veterinarian
              </h3>
              <p className="text-gray-600 mb-8 max-w-md">
                Ask me anything about your pet&apos;s health, nutrition, behavior, or
                general wellness. I&apos;m here to help 24/7!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'What should I feed my dog?',
                  'Why is my cat acting strange?',
                  'When should I vaccinate my puppy?',
                  'How do I brush my rabbit?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInputValue(suggestion)}
                    className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left text-sm text-gray-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xl px-4 py-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {currentResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-xl px-4 py-3 rounded-lg bg-gray-100 text-gray-900">
                <p className="text-sm whitespace-pre-wrap">{currentResponse}</p>
                {isLoading && (
                  <motion.span
                    animate={{ opacity: [0.5, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block ml-1"
                  >
                    ▌
                  </motion.span>
                )}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 md:p-6 bg-white">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="Ask me anything about your pet's health..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? '⏳' : '📤'} Send
          </Button>
        </form>
        <p className="text-xs text-gray-500 text-center mt-2">
          Disclaimer: This is for informational purposes. Always consult a licensed
          veterinarian for professional medical advice.
        </p>
      </div>
    </div>
  );
}
