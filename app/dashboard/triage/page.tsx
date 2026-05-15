'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Upload, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { TriageResponse } from '@/lib/ai/systemPrompt';

const ANIMAL_TYPES = ['🐕 Dog', '🐈 Cat', '🐄 Cow', '🦬 Buffalo', '🐐 Goat', '🐑 Sheep', '🐓 Poultry', '🐴 Horse', '❓ Other'];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function TriagePage() {
  const [stage, setStage] = useState<'animal-select' | 'chat'>('animal-select');
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResponse | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleAnimalSelect = (animal: string) => {
    setSelectedAnimal(animal);
    setStage('chat');
    // Add initial AI message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I'm here to help with your ${animal}'s health! Please describe the symptoms or concerns you're seeing.`,
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          species: selectedAnimal,
          history: messages,
        }),
      });

      if (!response.ok) throw new Error('Failed to get diagnosis');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullResponse += decoder.decode(value, { stream: true });
      }

      // Parse and display the response
      try {
        const result = JSON.parse(fullResponse) as TriageResponse;
        setTriageResult(result);
        
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: result.explanation,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } catch {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: fullResponse,
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        // const blob = new Blob(chunks, { type: 'audio/webm' });
        // TODO: Send audio to speech-to-text API
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'green':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'amber':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'red':
        return 'bg-red-50 border-red-200 text-red-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'green':
        return <CheckCircle className="w-6 h-6" />;
      case 'amber':
        return <Clock className="w-6 h-6" />;
      case 'red':
        return <AlertCircle className="w-6 h-6" />;
      default:
        return null;
    }
  };

  if (stage === 'animal-select') {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-primary-light to-white p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl w-full"
        >
          <h2 className="text-3xl font-bold text-text-primary mb-2 text-center">
            Which animal needs help?
          </h2>
          <p className="text-text-secondary text-center mb-8">
            Select the type of animal to get started with AI triage
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ANIMAL_TYPES.map((animal, i) => (
              <motion.button
                key={animal}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleAnimalSelect(animal)}
                className="p-4 rounded-[12px] border-2 border-border-color hover:border-primary hover:bg-primary-light transition bg-white text-text-primary font-medium text-lg"
              >
                {animal}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-6 bg-white p-6">
      {/* Chat Panel - Left 60% on desktop */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-lg">
              V
            </div>
            <div>
              <h2 className="font-bold text-text-primary">VetAI Triage</h2>
              <p className="text-sm text-text-secondary">{selectedAnimal}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setStage('animal-select');
              setMessages([]);
              setTriageResult(null);
              setSelectedAnimal('');
            }}
            className="text-xs"
          >
            Change animal
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-[12px] ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-neutral text-text-primary rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-neutral rounded-[12px] rounded-bl-none px-4 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="flex gap-3">
          <div className="flex-1 flex gap-2 bg-border-color rounded-[12px] p-3">
            <input
              type="text"
              placeholder="Describe the symptoms..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-muted text-sm"
              disabled={isLoading}
            />
            <Button
              size="sm"
              variant="ghost"
              className="text-text-secondary hover:text-text-primary"
              disabled={isLoading}
            >
              <Upload className="w-5 h-5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-text-secondary hover:text-text-primary"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
            >
              <Mic className={`w-5 h-5 ${isRecording ? 'text-danger' : ''}`} />
            </Button>
          </div>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary-dark text-white"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Result Panel - Right 40% on desktop */}
      {triageResult && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex lg:flex-col lg:w-2/5 bg-neutral rounded-2xl p-6 overflow-y-auto space-y-6"
        >
          {/* Severity Badge */}
          <div
            className={`rounded-[12px] border-2 p-6 ${getSeverityColor(triageResult.severity)}`}
          >
            <div className="flex items-center gap-3 mb-2">
              {getSeverityIcon(triageResult.severity)}
              <div className="font-bold uppercase text-lg">
                {triageResult.severity === 'green'
                  ? '🟢 Non-Urgent'
                  : triageResult.severity === 'amber'
                  ? '🟡 See Vet Soon'
                  : '🔴 Emergency'}
              </div>
            </div>
            <p className="text-sm">{triageResult.severityReason}</p>
            <p className="text-sm mt-3 font-medium">{triageResult.urgency}</p>
          </div>

          {/* Possible Conditions */}
          {triageResult.possibleConditions.length > 0 && (
            <div className="bg-white rounded-[12px] p-4">
              <h4 className="font-bold text-text-primary mb-3">Possible Conditions</h4>
              <div className="space-y-2">
                {triageResult.possibleConditions.map((cond, i) => (
                  <div key={i} className="text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-text-primary">{cond.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        cond.likelihood === 'high'
                          ? 'bg-red-100 text-red-700'
                          : cond.likelihood === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {cond.likelihood}
                      </span>
                    </div>
                    <p className="text-text-secondary text-xs">{cond.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Immediate Steps */}
          {triageResult.immediateSteps.length > 0 && (
            <div className="bg-green-50 rounded-[12px] p-4 border border-green-200">
              <h4 className="font-bold text-green-900 mb-3">✓ First Aid Steps</h4>
              <ol className="space-y-2">
                {triageResult.immediateSteps.map((step, i) => (
                  <li key={i} className="text-sm text-green-900">
                    <span className="font-bold">{i + 1}.</span> {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Do NOT Do */}
          {triageResult.doNotDo.length > 0 && (
            <div className="bg-red-50 rounded-[12px] p-4 border border-red-200">
              <h4 className="font-bold text-red-900 mb-3">✗ Do NOT Do</h4>
              <ul className="space-y-1">
                {triageResult.doNotDo.map((item, i) => (
                  <li key={i} className="text-sm text-red-900">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Zoonotic Warning */}
          {triageResult.isZoonotic && triageResult.zoonoticNote && (
            <div className="bg-yellow-50 rounded-[12px] p-4 border border-yellow-200">
              <h4 className="font-bold text-yellow-900 mb-2">⚠️ Public Health Alert</h4>
              <p className="text-sm text-yellow-900">{triageResult.zoonoticNote}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-4 border-t border-border-color">
            {triageResult.needsVet && (
              <Button className="w-full bg-primary hover:bg-primary-dark text-white">
                Find Nearest Vet →
              </Button>
            )}
            <Button variant="outline" className="w-full border-border-color text-text-primary">
              Book Appointment
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
