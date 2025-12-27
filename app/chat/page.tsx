'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { detectLanguage } from '@/lib/languageDetection';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  createdAt: string;
  images?: Array<{
    url: string;
    description?: string;
    title?: string;
  }>;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  messages?: Message[];
}

interface Source {
  title: string;
  snippet: string;
  documentId?: string;
}

/**
 * Format message content for better readability
 */
function formatMessageContent(content: string) {
  // Split by double newlines (paragraphs)
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
  
  return paragraphs.map((paragraph, idx) => {
    const trimmed = paragraph.trim();
    
    // Check if it's a list (starts with -, *, or number)
    if (/^[-*•]\s/.test(trimmed) || /^\d+[.)]\s/.test(trimmed)) {
      const listItems = trimmed.split(/\n(?=[-*•\d])/).filter(item => item.trim());
      return (
        <ul key={idx} className="list-none space-y-1.5 my-2 pl-0">
          {listItems.map((item, itemIdx) => {
            const cleanItem = item.replace(/^[-*•]\s|^\d+[.)]\s/, '').trim();
            return (
              <li key={itemIdx} className="flex items-start gap-2">
                <span className="text-charcoal/60 mt-1.5 shrink-0">•</span>
                <span className="flex-1">{cleanItem}</span>
              </li>
            );
          })}
        </ul>
      );
    }
    
    // Regular paragraph
    const lines = trimmed.split('\n').filter(line => line.trim());
    return (
      <p key={idx} className="mb-2 last:mb-0">
        {lines.map((line, lineIdx) => (
          <span key={lineIdx}>
            {line.trim()}
            {lineIdx < lines.length - 1 && <br className="mb-1" />}
          </span>
        ))}
      </p>
    );
  });
}
export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [showPolicyBanner, setShowPolicyBanner] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientUser, setClientUser] = useState<{ email: string; userType: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Voice recording state (using Web Speech API - FREE)
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const recognitionRef = useRef<any>(null);
  const shouldStopRef = useRef<boolean>(false); // Track if user wants to stop
  const streamRef = useRef<MediaStream | null>(null); // Track audio stream
  
  // Text-to-speech state (using Web Speech API - FREE)
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check if user has registered and verified email before allowing access to chat
    const isLoggedIn = localStorage.getItem('clientUserLoggedIn');
    const clientUserId = localStorage.getItem('clientUserId');
    const clientUserEmail = localStorage.getItem('clientUserEmail') || '';
    const clientUserType = localStorage.getItem('clientUserType') || 'student';
    const emailVerified = localStorage.getItem('emailVerified');
    
    // Basic check - redirect if not logged in
    if (isLoggedIn !== 'true' || !clientUserId) {
      localStorage.removeItem('clientUserLoggedIn');
      localStorage.removeItem('clientUserId');
      localStorage.removeItem('clientUserType');
      localStorage.removeItem('clientUserEmail');
      localStorage.removeItem('emailVerified');
      router.push('/');
      return;
    }
    
    // CRITICAL: Check if email is verified
    if (emailVerified !== 'true') {
      // Email not verified - redirect to registration/OTP screen
      console.log('❌ Email not verified. Redirecting to registration...');
      localStorage.removeItem('clientUserLoggedIn');
      localStorage.removeItem('clientUserId');
      localStorage.removeItem('clientUserType');
      localStorage.removeItem('clientUserEmail');
      localStorage.removeItem('emailVerified');
      router.push('/');
      return;
    }
    
    // User is logged in and email is verified - allow access
    setIsAuthorized(true);
    setClientUser({ email: clientUserEmail, userType: clientUserType });
    loadConversations();
  }, [router]);

  // Filter conversations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = conversations.filter((conv) =>
        conv.title.toLowerCase().includes(query)
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  useEffect(() => {
    if (activeConversation) {
      loadConversationMessages(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    // Scroll to bottom when messages change
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 150);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  // Load voices on mount for better TTS performance
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Trigger voice loading
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Monitor network status for speech recognition
  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ Network connection restored');
    };
    
    const handleOffline = () => {
      console.warn('⚠️ Network connection lost - speech recognition will not work');
      // Stop recording if network is lost
      if (isRecording) {
        shouldStopRef.current = true;
        setIsRecording(false);
        setIsTranscribing(false);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
            recognitionRef.current.abort();
          } catch (e) {
            // Ignore errors
          }
        }
        alert('Network connection lost. Speech recognition requires an internet connection. Please reconnect and try again.');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isRecording]);

  // Cleanup speech resources on unmount
  useEffect(() => {
    return () => {
      // Set stop flag
      shouldStopRef.current = true;
      
      // Stop speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore errors during cleanup
        }
        recognitionRef.current = null;
      }
      
      // Stop audio stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Stop speech synthesis
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const scrollToBottom = () => {
    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      const container = messagesContainerRef.current;
      if (container) {
        // Scroll to bottom immediately
        container.scrollTop = container.scrollHeight;
      }
      // Also try the ref method as fallback
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });
  };

  const loadConversations = async () => {
    try {
      const clientUserId = localStorage.getItem('clientUserId');
      if (!clientUserId) {
        console.error('No client user ID found');
        return;
      }

      const res = await fetch(`/api/conversations?clientUserId=${clientUserId}`);
      
      // Check if response is OK before parsing JSON
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        console.error('Failed to load conversations:', res.status, errorText);
        setConversations([]);
        setFilteredConversations([]);
        return;
      }

      // Check if response has content before parsing
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType);
        setConversations([]);
        setFilteredConversations([]);
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setConversations(list);
      setFilteredConversations(list);
      if (list.length > 0 && !activeConversation) {
        setActiveConversation(list[0]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
      setFilteredConversations([]);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    const confirmed = window.confirm('Delete this conversation? This cannot be undone.');
    if (!confirmed) return;

    try {
      const clientUserId = localStorage.getItem('clientUserId');
      if (!clientUserId) {
        alert('User session expired. Please login again.');
        router.push('/');
        return;
      }

      setDeletingConversationId(conversationId);
      const res = await fetch(`/api/conversations/${conversationId}?clientUserId=${clientUserId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to delete conversation' }));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }

      setConversations((prev) => {
        const updated = prev.filter((conv) => conv.id !== conversationId);
        const deletedActive = activeConversation?.id === conversationId;

        if (deletedActive) {
          const nextActive = updated[0] || null;
          setActiveConversation(nextActive);

          if (nextActive) {
            loadConversationMessages(nextActive.id);
          } else {
            setMessages([]);
            setSources([]);
          }
        }

        return updated;
      });
      // Refresh from server to keep ordering/metadata in sync
      loadConversations();
    } catch (error: any) {
      console.error('Failed to delete conversation:', error);
      alert(error.message || 'Failed to delete conversation. Please try again.');
    } finally {
      setDeletingConversationId(null);
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const clientUserId = localStorage.getItem('clientUserId');
      if (!clientUserId) {
        console.error('No client user ID found');
        return;
      }

      const res = await fetch(`/api/conversations/${conversationId}?clientUserId=${clientUserId}`);
      
      // Check if response is OK before parsing JSON
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        console.error('Failed to load messages:', res.status, errorText);
        setMessages([]);
        setSources([]);
        return;
      }

      // Check if response has content before parsing
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType);
        setMessages([]);
        setSources([]);
        return;
      }

      const data = await res.json();
      
      // Process messages to ensure images are properly formatted
      const processedMessages = (data.messages || []).map((msg: any) => {
        let images = undefined;
        
        // Handle images - could be array (from API) or string (from DB that needs parsing)
        if (msg.images) {
          if (typeof msg.images === 'string') {
            try {
              images = JSON.parse(msg.images);
            } catch (e) {
              console.warn('Failed to parse images JSON:', e);
              images = undefined;
            }
          } else if (Array.isArray(msg.images)) {
            images = msg.images;
          }
          
          // Filter valid images
          if (images && Array.isArray(images) && images.length > 0) {
            images = images.filter((img: any) => img && img.url && typeof img.url === 'string' && img.url.trim().length > 0);
            if (images.length === 0) {
              images = undefined;
            }
          } else {
            images = undefined;
          }
        }
        
        return {
          ...msg,
          images,
        };
      });
      
      console.log('📥 Loaded messages with images:', processedMessages.filter((m: any) => m.images).length);
      setMessages(processedMessages);
      setSources([]);
      // Scroll to bottom after loading messages
      setTimeout(() => scrollToBottom(), 300);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message to UI immediately
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    // Scroll after adding user message
    setTimeout(() => scrollToBottom(), 100);

    try {
      const clientUserId = localStorage.getItem('clientUserId');
      if (!clientUserId) {
        alert('User session expired. Please login again.');
        router.push('/');
        return;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId: activeConversation?.id,
          clientUserId: clientUserId,
        }),
      });

       if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to get response' }));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }

      const data = await res.json();

      if (!data.answer) {
        throw new Error('No answer received from server');
      }

      // Remove temp user message and add real one
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
      
      // Add user message back (will be saved by API)
      setMessages(prev => [...prev, tempUserMessage]);

      // Add assistant response with images if available
      console.log('Received data from API:', { 
        hasAnswer: !!data.answer, 
        hasImages: !!data.images, 
        imageCount: data.images?.length || 0,
        images: data.images 
      });
      
      // Process images to ensure they're valid
      let processedImages = undefined;
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        processedImages = data.images
          .filter((img: any) => {
            const isValid = img && img.url && typeof img.url === 'string' && img.url.trim().length > 0;
            if (!isValid) {
              console.warn('Invalid image object filtered out:', img);
            }
            return isValid;
          })
          .map((img: any) => ({
            url: img.url.trim(),
            description: img.description || img.title || undefined,
            title: img.title || undefined,
          }));
        if (processedImages.length === 0) {
          processedImages = undefined;
        } else {
          console.log('✅ Processed images for display:', processedImages);
        }
      } else {
        console.log('⚠️ No images in response or empty array');
      }
      
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: data.answer || 'Sorry, I could not generate a response. Please try again.',
        createdAt: new Date().toISOString(),
        images: processedImages,
      };
      
      console.log('📝 Assistant message created:', {
        hasImages: !!assistantMessage.images,
        imageCount: assistantMessage.images?.length || 0,
        messageId: assistantMessage.id,
        images: assistantMessage.images,
      });
      
      // Add message with images - ensure images persist
      setMessages(prev => {
        const updated = [...prev, assistantMessage];
        console.log('📋 Messages after adding:', updated.length, 'messages, last one has images:', !!updated[updated.length - 1].images);
        return updated;
      });

      // Set sources if available
       if (data.sources && Array.isArray(data.sources)) {
        setSources(data.sources);
      } else {
        setSources([]);
      }

      // Ensure scroll happens after message is added
      setTimeout(() => scrollToBottom(), 300);

       // Update active conversation
      if (data.conversationId) {
        const updatedConv: Conversation = {
          id: data.conversationId,
          title: activeConversation?.title || userMessage.substring(0, 50),
          updatedAt: new Date().toISOString(),
        };
        setActiveConversation(updatedConv);
        loadConversations();
      }
     } catch (error: any) {
      console.error('Failed to send message:', error);
      
      // Remove temp user message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again.`,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setTimeout(() => scrollToBottom(), 200);
     } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  // Helper function to format transcribed text for better readability
  const formatTranscribedText = (text: string): string => {
    if (!text) return '';
    
    return text
      // Remove extra spaces
      .replace(/\s+/g, ' ')
      // Add period after sentences (if missing)
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
      // Capitalize first letter
      .replace(/^[a-z]/, (char) => char.toUpperCase())
      // Fix common punctuation issues
      .replace(/\s+([,.!?])/g, '$1')
      .replace(/([,.!?])([A-Za-z])/g, '$1 $2')
      // Trim and clean
      .trim();
  };

  // Voice recording functions (using Web Speech API - FREE, no API key needed)
  // Improved with better accuracy, punctuation, and efficiency
  const startRecording = () => {
    // Reset stop flag
    shouldStopRef.current = false;
    
    try {
      // Check if browser supports Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      // Check network connectivity (speech recognition requires internet)
      if (!navigator.onLine) {
        setNetworkError(true);
        alert('Internet connection required for speech recognition.\n\nPlease check your network connection and try again.\n\nNote: Speech recognition uses Google\'s servers and requires an active internet connection.');
        setTimeout(() => setNetworkError(false), 5000);
        return;
      }
      
      // Clear any previous network errors
      setNetworkError(false);

      // Stop any existing recognition first
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore errors when stopping existing recognition
        }
      }

      const recognition = new SpeechRecognition();
      
      // Optimized settings for better accuracy and efficiency
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English (browsers don't support comma-separated language lists)
      recognition.maxAlternatives = 1; // Use best match only for efficiency

      let finalTranscript = '';
      let interimTranscript = '';

      recognition.onstart = () => {
        if (!shouldStopRef.current) {
          setIsRecording(true);
          setIsTranscribing(true);
          finalTranscript = '';
          interimTranscript = '';
          console.log('🎤 Recording started');
        }
      };

      recognition.onresult = (event: any) => {
        if (shouldStopRef.current) return;
        
        interimTranscript = '';
        let newFinalText = '';
        
        // Process results efficiently - only process new results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript.trim();
          
          if (!transcript) continue;
          
          if (result.isFinal) {
            // Capitalize first letter and add proper spacing
            const capitalized = transcript.charAt(0).toUpperCase() + transcript.slice(1);
            finalTranscript += (finalTranscript ? ' ' : '') + capitalized;
            newFinalText = finalTranscript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update input with proper formatting
        if (newFinalText || finalTranscript || interimTranscript) {
          const displayText = (newFinalText || finalTranscript) + (interimTranscript ? ' ' + interimTranscript : '');
          const formatted = formatTranscribedText(displayText);
          setInputMessage(formatted);
        }
      };

      recognition.onerror = (event: any) => {
        // Handle expected events first - these are not errors
        
        // "aborted" - Expected when user stops recording
        if (event.error === 'aborted') {
          console.log('⏹️ Recognition aborted (expected when user stops recording)');
          setIsRecording(false);
          setIsTranscribing(false);
          shouldStopRef.current = true;
          return; // Exit early - don't treat as error
        }
        
        // "no-speech" - Expected when no speech detected yet (not an error)
        if (event.error === 'no-speech') {
          // This is normal - happens when user pauses or no speech detected
          // Recognition will auto-restart via onend handler if still recording
          if (isRecording && !shouldStopRef.current) {
            console.log('⏸️ No speech detected (user may be pausing) - will continue listening');
            // Don't stop recording - let it continue via auto-restart
            // The onend handler will restart if user is still recording
          } else {
            // User stopped or wants to stop - this is fine
            console.log('⏸️ No speech detected (recording stopped)');
          }
          return; // Exit early - don't treat as error
        }
        
        // Handle specific errors first (before general error logging)
        if (event.error === 'service-not-allowed') {
          setIsRecording(false);
          setIsTranscribing(false);
          shouldStopRef.current = true;
          console.warn('⚠️ Speech recognition service not available');
          alert('Speech recognition service is not available. Please try again later or use a different browser.');
          return; // Exit early - don't log as error
        }
        
        if (event.error === 'bad-grammar') {
          // Grammar error - not critical, just log
          console.warn('⚠️ Grammar error in speech recognition');
          return; // Exit early - don't log as error
        }
        
        // Log actual errors (only for unhandled cases)
        console.error('❌ Speech recognition error:', event.error);
        
        // Critical errors - stop recording
        if (event.error === 'audio-capture') {
          setIsRecording(false);
          setIsTranscribing(false);
          shouldStopRef.current = true;
          alert('No microphone found. Please connect a microphone and try again.');
        } else if (event.error === 'not-allowed') {
          setIsRecording(false);
          setIsTranscribing(false);
          shouldStopRef.current = true;
          alert('Microphone permission denied. Please allow microphone access in your browser settings and refresh the page.');
        } else if (event.error === 'network') {
          // Network error - speech recognition requires internet connection
          setIsRecording(false);
          setIsTranscribing(false);
          setNetworkError(true);
          shouldStopRef.current = true;
          
          // Provide helpful message about network requirement
          const errorMsg = 'Network connection required for speech recognition.\n\n' +
            'Please check:\n' +
            '• Your internet connection\n' +
            '• Firewall settings\n' +
            '• Try refreshing the page\n\n' +
            'Note: Speech recognition requires an active internet connection to work.';
          alert(errorMsg);
          
          // Clear network error after 5 seconds
          setTimeout(() => setNetworkError(false), 5000);
        } else if (event.error === 'language-not-supported') {
          setIsRecording(false);
          setIsTranscribing(false);
          shouldStopRef.current = true;
          alert('The selected language is not supported for speech recognition. Please try speaking in English.');
        } else {
          // Other errors - log and stop
          console.warn('⚠️ Speech recognition error:', event.error);
          setIsRecording(false);
          setIsTranscribing(false);
          shouldStopRef.current = true;
          
          // Only show alert for unknown errors
          if (event.error && event.error !== 'interrupted') {
            alert(`Speech recognition error: ${event.error}. Please try again.`);
          }
        }
      };

      recognition.onend = () => {
        console.log('🎤 Recording ended, shouldStop:', shouldStopRef.current, 'isRecording:', isRecording);
        
        // Check stop flag FIRST - if user wants to stop, don't restart
        if (shouldStopRef.current) {
          console.log('🛑 User requested stop - not restarting');
          setIsRecording(false);
          setIsTranscribing(false);
          
          if (finalTranscript) {
            const formatted = formatTranscribedText(finalTranscript);
            setInputMessage(formatted);
          }
          
          // Clean up
          recognitionRef.current = null;
          return; // Exit early - don't restart
        }
        
        // Only auto-restart if user hasn't explicitly stopped AND still recording
        if (isRecording && !shouldStopRef.current) {
          // Small delay before restart to prevent rapid restart loops
          setTimeout(() => {
            // Double-check stop flag and state before restarting
            if (!shouldStopRef.current && isRecording && recognitionRef.current) {
              try {
                console.log('🔄 Auto-restarting recognition...');
                recognitionRef.current.start();
              } catch (e) {
                console.error('Failed to restart recognition:', e);
                setIsRecording(false);
                setIsTranscribing(false);
                if (finalTranscript) {
                  const formatted = formatTranscribedText(finalTranscript);
                  setInputMessage(formatted);
                }
                recognitionRef.current = null;
              }
            } else {
              // State changed or user stopped - don't restart
              console.log('⏹️ Not restarting - state changed or user stopped');
              setIsRecording(false);
              setIsTranscribing(false);
              if (finalTranscript) {
                const formatted = formatTranscribedText(finalTranscript);
                setInputMessage(formatted);
              }
            }
          }, 150);
        } else {
          // Not recording or user stopped - finalize transcript
          setIsRecording(false);
          setIsTranscribing(false);
          
          if (finalTranscript) {
            const formatted = formatTranscribedText(finalTranscript);
            setInputMessage(formatted);
          }
          
          // Clean up
          recognitionRef.current = null;
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error: any) {
      console.error('Error starting speech recognition:', error);
      alert('Failed to start speech recognition. Please check your browser settings and microphone permissions.');
      setIsRecording(false);
      setIsTranscribing(false);
      shouldStopRef.current = false;
    }
  };

  const stopRecording = () => {
    console.log('🛑 Stopping recording...');
    
    // Set stop flag FIRST to prevent any auto-restart
    shouldStopRef.current = true;
    
    // Update state IMMEDIATELY to prevent race conditions
    setIsRecording(false);
    setIsTranscribing(false);
    
    if (recognitionRef.current) {
      try {
        // Stop the recognition immediately
        recognitionRef.current.stop();
        // Small delay then abort to ensure it stops completely
        setTimeout(() => {
          try {
            if (recognitionRef.current) {
              recognitionRef.current.abort();
            }
          } catch (e) {
            // Ignore abort errors
          }
        }, 50);
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
      
      // Clean up after a brief delay to ensure stop completes
      setTimeout(() => {
        recognitionRef.current = null;
      }, 100);
    }
    
    // Stop any audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    console.log('✅ Recording stopped');
  };

  // Advanced Text-to-speech function (using Web Speech API - FREE, no API key needed)
  // Supports multiple languages: English, Malayalam, Hindi, Tamil, and more
  const playTextToSpeech = (text: string, messageId: string) => {
    // Check if browser supports Speech Synthesis
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    // If this message is already playing, stop it
    if (playingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setPlayingMessageId(null);
      return;
    }

    // Stop any currently playing speech
    window.speechSynthesis.cancel();

    try {
      setPlayingMessageId(messageId);
      
      // Detect language of the text
      const detectedLang = detectLanguage(text);
      console.log('🌐 Detected language for TTS:', detectedLang);
      
      // Clean and prepare text for better speech (preserve language-specific characters)
      const cleanText = text
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\n+/g, '. ') // Convert line breaks to pauses
        .replace(/\*\*/g, '') // Remove markdown bold
        .replace(/\*/g, '') // Remove markdown italic
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links, keep text
        .replace(/`([^`]+)`/g, '$1') // Remove code backticks
        // Don't remove non-English characters - preserve language-specific characters
        .replace(/\s+/g, ' ') // Normalize whitespace again
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Set language based on detection with proper locale codes
      // Map language codes to browser-supported language codes with proper accents
      const languageMap: { [key: string]: string } = {
        'en': 'en-US', // English - American accent (normal/default)
        'ml': 'ml-IN', // Malayalam - Indian variant
        'hi': 'hi-IN', // Hindi - Indian variant  
        'ta': 'ta-IN', // Tamil - Indian variant
      };
      
      // Set initial language - will be updated by selected voice
      utterance.lang = languageMap[detectedLang] || (detectedLang === 'en' ? 'en-US' : detectedLang + '-IN') || 'en-US';
      console.log('🔊 TTS Language detected:', detectedLang, '→ Setting to:', utterance.lang);
      
      // Optimized speech parameters for natural sound - language-specific tuning
      // Adjust rate based on language for better clarity
      const rateMap: { [key: string]: number } = {
        'ml': 0.90, // Slightly slower for Malayalam (complex script)
        'hi': 0.92, // Slightly slower for Hindi (complex script)
        'ta': 0.90, // Slightly slower for Tamil (complex script)
        'en': 0.95, // Standard rate for English
      };
      
      utterance.rate = rateMap[detectedLang] || 0.95; // Slightly slower for clarity
      utterance.pitch = 1.0; // Natural pitch
      utterance.volume = 1.0; // Full volume
      
      console.log('🎚️ Speech parameters - Rate:', utterance.rate, 'Pitch:', utterance.pitch, 'Volume:', utterance.volume);

      // Function to select best voice for detected language with proper accents
      const selectBestVoice = (voices: SpeechSynthesisVoice[], targetLang: string): SpeechSynthesisVoice | null => {
        const langCode = targetLang.split('-')[0]; // Get base language code (e.g., 'ml' from 'ml-IN')
        const langName = langCode.toLowerCase();
        
        console.log('🔍 Selecting voice for language:', langCode, 'from', voices.length, 'available voices');
        
        // Priority order for each language - optimized for proper accents
        const priorities: Array<(v: SpeechSynthesisVoice) => boolean> = [];
        
        if (langCode === 'ml') {
          // Malayalam voices - prioritize Indian Malayalam voices
          priorities.push(
            (v) => v.lang === 'ml-IN' && (v.name.toLowerCase().includes('neural') || v.name.toLowerCase().includes('enhanced')),
            (v) => v.lang === 'ml-IN',
            (v) => v.lang.startsWith('ml-') && (v.name.toLowerCase().includes('malayalam') || v.name.toLowerCase().includes('ml')),
            (v) => v.lang === 'ml',
            (v) => v.lang.startsWith('ml'),
            (v) => v.name.toLowerCase().includes('malayalam'),
          );
        } else if (langCode === 'hi') {
          // Hindi voices - prioritize Indian Hindi voices
          priorities.push(
            (v) => v.lang === 'hi-IN' && (v.name.toLowerCase().includes('neural') || v.name.toLowerCase().includes('enhanced')),
            (v) => v.lang === 'hi-IN',
            (v) => v.lang.startsWith('hi-') && (v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('hi')),
            (v) => v.lang === 'hi',
            (v) => v.lang.startsWith('hi'),
            (v) => v.name.toLowerCase().includes('hindi'),
          );
        } else if (langCode === 'ta') {
          // Tamil voices - prioritize Indian Tamil voices
          priorities.push(
            (v) => v.lang === 'ta-IN' && (v.name.toLowerCase().includes('neural') || v.name.toLowerCase().includes('enhanced')),
            (v) => v.lang === 'ta-IN',
            (v) => v.lang.startsWith('ta-') && (v.name.toLowerCase().includes('tamil') || v.name.toLowerCase().includes('ta')),
            (v) => v.lang === 'ta',
            (v) => v.lang.startsWith('ta'),
            (v) => v.name.toLowerCase().includes('tamil'),
          );
        } else {
          // English voices - prioritize American English (normal accent), then others
          priorities.push(
            // US English (American accent) - NORMAL/STANDARD
            (v) => v.lang === 'en-US' && (v.name.toLowerCase().includes('neural') || v.name.toLowerCase().includes('enhanced')),
            (v) => v.lang === 'en-US' && (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural')),
            (v) => v.lang === 'en-US',
            // Any US English variant
            (v) => v.lang.startsWith('en-US'),
            // British English (fallback)
            (v) => v.lang.startsWith('en-GB') && (v.name.toLowerCase().includes('neural') || v.name.toLowerCase().includes('enhanced')),
            (v) => v.lang.startsWith('en-GB') && (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural')),
            (v) => v.lang.startsWith('en-GB'),
            // Australian/New Zealand English (fallback)
            (v) => (v.lang.startsWith('en-AU') || v.lang.startsWith('en-NZ')) && (v.name.toLowerCase().includes('neural') || v.name.toLowerCase().includes('enhanced')),
            (v) => v.lang.startsWith('en-AU') || v.lang.startsWith('en-NZ'),
            // Indian English (fallback)
            (v) => v.lang === 'en-IN' && (v.name.toLowerCase().includes('neural') || v.name.toLowerCase().includes('enhanced')),
            (v) => v.lang === 'en-IN',
            // Any English with quality indicators
            (v) => v.lang.startsWith('en') && (v.name.toLowerCase().includes('neural') || v.name.toLowerCase().includes('enhanced')),
            (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('google'),
            (v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('natural'),
            // Any English voice (last resort)
            (v) => v.lang.startsWith('en'),
          );
        }

        // Try each priority
        for (const priority of priorities) {
          const voice = voices.find(priority);
          if (voice) {
            console.log('✅ Selected voice:', voice.name, voice.lang, 'for language:', targetLang);
            return voice;
          }
        }

        // Fallback: Try to find any voice with matching language code
        const fallback = voices.find(v => {
          const vLang = v.lang.toLowerCase();
          return vLang.startsWith(langCode) || vLang.includes(langName);
        });
        
        if (fallback) {
          console.log('⚠️ Using fallback voice:', fallback.name, fallback.lang);
          return fallback;
        }

        // Last resort: Use first available voice
        if (voices.length > 0) {
          console.log('⚠️ Using first available voice as last resort:', voices[0].name, voices[0].lang);
          return voices[0];
        }

        return null;
      };

      // Get voices and select best one for detected language
      const getVoicesAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        
        if (voices.length === 0) {
          console.warn('⚠️ No voices available');
          // Still try to speak with default language
          window.speechSynthesis.speak(utterance);
          return;
        }
        
        // Log available voices for debugging
        console.log('🔊 Available voices:', voices.length);
        const langVoices = voices.filter(v => v.lang.startsWith(detectedLang));
        if (langVoices.length > 0) {
          console.log(`✅ Found ${langVoices.length} voices for ${detectedLang}:`, 
            langVoices.map(v => `${v.name} (${v.lang})`));
        }
        
        const selectedVoice = selectBestVoice(voices, utterance.lang);
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          utterance.lang = selectedVoice.lang; // Use voice's actual language for proper accent
          console.log('🎤 Selected voice:', selectedVoice.name, 'Language:', selectedVoice.lang, 'Accent:', selectedVoice.lang);
          
          // Verify the voice is actually set
          if (utterance.voice) {
            console.log('✅ Voice confirmed:', utterance.voice.name, utterance.voice.lang);
          }
        } else if (voices.length > 0) {
          // Fallback: Use first available voice or English voice
          const fallback = voices.find(v => v.lang.startsWith(detectedLang)) 
                        || voices.find(v => v.lang.startsWith('en')) 
                        || voices[0];
          if (fallback) {
            utterance.voice = fallback;
            utterance.lang = fallback.lang;
            console.log('⚠️ Using fallback voice:', fallback.name, fallback.lang);
          }
        }

        // Speak the text with selected voice and accent
        console.log('🗣️ Speaking with:', utterance.voice?.name || 'default', 'in', utterance.lang);
        window.speechSynthesis.speak(utterance);
      };

      // Load voices if not already loaded - with retry mechanism
      const loadVoicesAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        
        if (voices.length === 0) {
          console.log('⏳ No voices loaded yet, waiting...');
          // Wait for voices to load with timeout
          let retryCount = 0;
          const maxRetries = 10;
          
          const voicesChangedHandler = () => {
            retryCount++;
            const updatedVoices = window.speechSynthesis.getVoices();
            console.log(`🔄 Voice load attempt ${retryCount}, found ${updatedVoices.length} voices`);
            
            if (updatedVoices.length > 0 || retryCount >= maxRetries) {
              if (updatedVoices.length > 0) {
                getVoicesAndSpeak();
              } else {
                console.warn('⚠️ No voices loaded after retries, using default');
                // Speak with default settings
                window.speechSynthesis.speak(utterance);
              }
              window.speechSynthesis.onvoiceschanged = null; // Remove handler
            }
          };
          
          window.speechSynthesis.onvoiceschanged = voicesChangedHandler;
          
          // Trigger voice loading
          window.speechSynthesis.getVoices();
          
          // Fallback timeout
          setTimeout(() => {
            const finalVoices = window.speechSynthesis.getVoices();
            if (finalVoices.length > 0 && window.speechSynthesis.onvoiceschanged) {
              getVoicesAndSpeak();
              window.speechSynthesis.onvoiceschanged = null;
            } else if (finalVoices.length === 0) {
              console.warn('⚠️ No voices available, speaking with default settings');
              window.speechSynthesis.speak(utterance);
            }
          }, 1000);
        } else {
          // Voices already loaded
          getVoicesAndSpeak();
        }
      };
      
      loadVoicesAndSpeak();

      utterance.onend = () => {
        setPlayingMessageId(null);
        console.log('✅ Speech completed');
      };

      utterance.onerror = (event: any) => {
        // Handle error more gracefully - event.error might be undefined or empty
        const errorType = event?.error;
        const errorMessage = event?.message;
        
        setPlayingMessageId(null);
        
        // Check if this is actually an error or just a browser quirk
        const isEmptyError = !errorType && !errorMessage && Object.keys(event || {}).length === 0;
        const isExpectedError = errorType === 'interrupted' || errorType === 'canceled' || errorType === 'audio-busy';
        
        // Only log as error if it's a real error
        if (isEmptyError) {
          // Empty error object - browser quirk, not a real error
          // Don't log as error, just silently handle it
          return;
        }
        
        if (isExpectedError) {
          // Expected errors - don't log as errors
          if (errorType === 'audio-busy') {
            console.log('⏸️ Audio system busy, speech canceled');
          }
          return;
        }
        
        // Real error - log it
        console.warn('⚠️ Speech synthesis error:', {
          error: errorType || 'unknown',
          message: errorMessage || 'No error message',
          charIndex: event?.charIndex,
          charLength: event?.charLength,
          type: event?.type,
        });
        
        // Only show alert for critical errors
        if (errorType === 'language-not-supported' || errorType === 'voice-not-found') {
          alert(`Voice for ${detectedLang} language may not be available in your browser. Please try a different browser or install language packs.`);
        } else if (errorType === 'synthesis-failed' || errorType === 'synthesis-unavailable') {
          alert('Text-to-speech is currently unavailable. Please try again later.');
        } else if (errorType === 'network') {
          alert('Network error while generating speech. Please check your connection.');
        } else if (errorType && errorType !== 'unknown') {
          // Only show alert for known error types (not empty/unknown)
          console.warn('⚠️ Speech synthesis issue:', errorType);
          // Don't show alert for minor/unknown errors to avoid annoying users
        }
      };

      utterance.onpause = () => {
        console.log('⏸️ Speech paused');
      };

      utterance.onresume = () => {
        console.log('▶️ Speech resumed');
      };

      synthRef.current = window.speechSynthesis;
    } catch (error: any) {
      console.error('❌ Error playing text-to-speech:', error);
      setPlayingMessageId(null);
      alert('Failed to speak text. Please try again.');
    }
  };

  const handleNewConversation = async () => {
    try {
      const clientUserId = localStorage.getItem('clientUserId');
      if (!clientUserId) {
        alert('User session expired. Please login again.');
        router.push('/');
        return;
      }

      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Conversation',
          clientUserId: clientUserId,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        throw new Error(`Failed to create conversation: ${errorText}`);
      }

      // Check if response has content before parsing
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response type from server');
      }

      const newConversation = await res.json();
      
      // Clear current messages
      setMessages([]);
      setSources([]);
      
      // Set new conversation as active
      setActiveConversation(newConversation);
      
      // Reload conversations list
      await loadConversations();
    } catch (error: any) {
      console.error('Failed to create conversation:', error);
      alert(error.message || 'Failed to create new conversation. Please try again.');
    }
  };

  const quickLinks = [
    { icon: 'school', label: 'Academics' },
    { icon: 'calendar_month', label: 'Timetable' },
    { icon: 'receipt_long', label: 'Fees' },
    { icon: 'local_library', label: 'Library' },
    { icon: 'map', label: 'Campus Map' },
    { icon: 'contacts', label: 'Contacts' },
  ];

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-700 font-medium">Checking registration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Left Sidebar - Conversations - Glassmorphic */}
      <aside className="hidden lg:flex w-[320px] flex-col glass-card border-r" style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255, 255, 255, 0.18)' }}>
        <div className="shrink-0 p-4">
          <div className="flex items-center gap-3 px-2 pt-2 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl relative overflow-hidden animate-float" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <p className="text-xl font-bold text-white relative z-10">PCE</p>
            </div>
            <p className="text-charcoal text-lg font-bold gradient-text" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PCE Assistant</p>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/60 z-10">
              search
            </span>
            <input
              className="modern-input w-full rounded-2xl py-3 pl-10 pr-4 text-sm text-charcoal placeholder-charcoal/60"
              placeholder="Search conversations..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">
                Conversations
              </h3>
              <button
                onClick={handleNewConversation}
                className="flex items-center justify-center w-7 h-7 rounded-full text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)' }}
                title="New Conversation"
              >
                <span className="material-symbols-outlined text-base">add</span>
              </button>
            </div>
            <ul className="flex flex-col gap-1">
              {filteredConversations.length === 0 && searchQuery ? (
                <li className="px-3 py-4 text-sm text-charcoal/60 text-center">
                  No conversations found matching "{searchQuery}"
                </li>
              ) : (
                filteredConversations.map((conv) => (
                <li
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`flex h-12 cursor-pointer items-center gap-3 rounded-xl px-3 transition-all hover-lift ${
                    activeConversation?.id === conv.id
                      ? 'neu-card-inset'
                      : 'hover:bg-white/20'
                  }`}
                  style={activeConversation?.id === conv.id ? { background: 'rgba(102, 126, 234, 0.15)', boxShadow: 'inset 4px 4px 8px rgba(163, 177, 198, 0.2), inset -4px -4px 8px rgba(255, 255, 255, 0.8)' } : {}}
                >
                  <span
                    className={`material-symbols-outlined text-[22px] ${
                      activeConversation?.id === conv.id ? 'text-primary' : 'text-charcoal/80'
                    }`}
                  >
                    chat_bubble
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-tight truncate ${
                        activeConversation?.id === conv.id
                          ? 'text-primary font-semibold'
                          : 'text-charcoal font-medium'
                      }`}
                    >
                      {conv.title}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.id);
                    }}
                    disabled={deletingConversationId === conv.id}
                    className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-white/30 text-charcoal/70 disabled:opacity-50"
                    title="Delete conversation"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </li>
                ))
              )}
            </ul>
          </div>
          <div>
            <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-charcoal/50 mb-2">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-1">
              {quickLinks.map((link) => (
                <li
                  key={link.label}
                  className="flex h-12 cursor-pointer items-center gap-3 rounded-xl px-3 transition-all hover-lift hover:bg-white/20"
                >
                  <span className="material-symbols-outlined text-charcoal/80 text-[22px]">
                    {link.icon}
                  </span>
                  <p className="text-charcoal text-sm font-medium leading-tight truncate">
                    {link.label}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* User Info Card and Settings Button */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.18)' }}>
          <div className="mb-3 p-3 rounded-xl glass-card" style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}>
            <p className="text-xs text-gray-500 mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-charcoal truncate">{clientUser?.email || 'Student'}</p>
            {clientUser?.userType && (
              <p className="text-xs text-gray-500 mt-1 capitalize">{clientUser.userType}</p>
            )}
          </div>
          <Link
            href="/settings"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white hover-lift transition-all"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}
          >
            <span className="material-symbols-outlined text-lg">settings</span>
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col relative">
        <header className="flex shrink-0 items-center justify-between glass-card p-4" style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255, 255, 255, 0.18)' }}>
          <button className="flex size-10 items-center justify-center text-charcoal lg:hidden">
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <h1 className="text-charcoal text-lg font-bold leading-tight gradient-text" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {activeConversation?.title || 'Campus Assistant'}
          </h1>
          <div className="w-12" />
        </header>

        <main
          ref={messagesContainerRef}
           className="flex-1 overflow-y-auto p-4 pb-24 space-y-6 scroll-smooth"
          style={{ 
            maxHeight: 'calc(100vh - 140px)',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
         >
          {showPolicyBanner && (
            <div className="flex items-center justify-between rounded-2xl glass-card p-4 animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
              <div className="flex flex-col gap-1">
                <p className="text-charcoal text-sm font-semibold leading-tight">
                  Policy Information
                </p>
                <p className="text-gray-500 text-sm font-normal leading-normal">
                  Your conversations help improve our service. Please don't share personal information.
                </p>
              </div>
              <button
                onClick={() => setShowPolicyBanner(false)}
                className="text-sm font-medium leading-normal text-gray-500 hover:text-charcoal"
              >
                Dismiss
              </button>
            </div>
          )}

          {messages.length === 0 && (
            <div className="flex items-end gap-3 animate-fade-in">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-12 shrink-0 relative overflow-hidden animate-float flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <span className="material-symbols-outlined text-white relative z-10 text-2xl">support_agent</span>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 items-start">
                <p className="text-charcoal/70 text-[13px] font-medium leading-normal max-w-[360px]">
                  Campus Assistant
                </p>
                <div className="flex flex-col gap-2 items-start">
                  <p className="chat-bubble-assistant text-base font-normal leading-normal flex max-w-[360px] rounded-2xl rounded-bl-none px-5 py-4 text-charcoal">
                    Hello! I'm the PCE Campus Assistant. How can I help you today? You can ask me about library hours, fee deadlines, and more.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => handleSuggestionClick('What are the library hours?')}
                      className="rounded-xl glass-card px-4 py-2 text-sm text-charcoal hover-lift transition-all"
                      style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}
                    >
                      What are the library hours?
                    </button>
                    <button
                      onClick={() => handleSuggestionClick('When is the fee deadline?')}
                      className="rounded-xl glass-card px-4 py-2 text-sm text-charcoal hover-lift transition-all"
                      style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}
                    >
                      When is the fee deadline?
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}
            >
              {message.sender === 'assistant' && (
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-12 shrink-0 relative overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 8px 30px rgba(102, 126, 234, 0.3)' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <span className="material-symbols-outlined text-white relative z-10 text-xl">support_agent</span>
                </div>
              )}
              <div
                className={`flex flex-1 flex-col gap-1.5 items-${message.sender === 'user' ? 'end' : 'start'}`}
              >
                <p
                  className={`text-charcoal/70 text-[13px] font-medium leading-normal max-w-[360px] ${
                    message.sender === 'user' ? 'text-right' : ''
                  }`}
                >
                  {message.sender === 'user' ? 'You' : 'Campus Assistant'}
                </p>
                 <div className="flex items-start gap-2">
                  <div
                    className={`text-base font-normal leading-relaxed flex max-w-[360px] rounded-2xl px-5 py-4 shadow-soft animate-slide-up break-words ${
                       message.sender === 'user'
                        ? 'chat-bubble-user text-white rounded-br-none'
                        : 'chat-bubble-assistant text-charcoal rounded-bl-none'
                    }`}
                     style={message.sender === 'user' ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)' } : { lineHeight: '1.7' }}
                  >
                    <div className="w-full space-y-2.5">
                      {formatMessageContent(message.content)}
                    </div>
                  </div>
                  {message.sender === 'assistant' && (
                    <button
                      onClick={() => playTextToSpeech(message.content, message.id)}
                      className="mt-2 flex items-center justify-center w-8 h-8 rounded-full text-charcoal/70 hover:text-charcoal hover:bg-white/20 transition-all shrink-0"
                      title={playingMessageId === message.id ? 'Stop audio' : 'Play audio'}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {playingMessageId === message.id ? 'volume_up' : 'volume_down'}
                      </span>
                    </button>
                  )}
                </div>
                {/* Display images if available - simplified, no extras */}
                {message.sender === 'assistant' && message.images && Array.isArray(message.images) && message.images.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    {message.images.map((img, idx) => {
                      if (!img || !img.url) {
                        console.warn('Invalid image object:', img);
                        return null;
                      }
                      
                      // Ensure URL is properly formatted
                      let imageUrl = String(img.url).trim();
                      if (!imageUrl) {
                        return null;
                      }
                      
                      // Ensure URL starts with / for proper path resolution
                      if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
                        imageUrl = '/' + imageUrl;
                      }
                      
                      console.log('🖼️ Rendering image:', { idx, imageUrl, messageId: message.id });
                      
                      return (
                        <img
                          key={`img-${message.id}-${idx}`}
                          src={imageUrl}
                          alt={img.description || img.title || 'Knowledge base image'}
                          className="max-w-[400px] h-auto rounded-lg shadow-sm"
                          loading="lazy"
                          onError={(e) => {
                            console.error('❌ Image failed to load:', imageUrl, 'Full img object:', img);
                            const target = e.target as HTMLImageElement;
                            target.style.border = '2px solid red';
                            target.alt = 'Failed to load: ' + imageUrl;
                          }}
                          onLoad={() => {
                            console.log('✅ Image loaded successfully:', imageUrl);
                          }}
                        />
                      );
                    })}
                  </div>
                )}
               </div>
              {message.sender === 'user' && (
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-12 shrink-0 relative overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', boxShadow: '0 8px 30px rgba(79, 172, 254, 0.3)' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <span className="material-symbols-outlined text-white relative z-10 text-xl">person</span>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-end gap-3">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-12 shrink-0 relative overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 8px 30px rgba(102, 126, 234, 0.3)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <span className="material-symbols-outlined text-white relative z-10 text-xl">support_agent</span>
              </div>
              <div className="flex items-center justify-center rounded-2xl rounded-bl-none px-5 py-4 glass-card" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)' }}>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></span>
                  <span className="size-2 rounded-full animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite_0.2s]" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></span>
                  <span className="size-2 rounded-full animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite_0.4s]" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></span>
                </div>
              </div>
            </div>
          )}

          {sources.length > 0 && (
            <div className="flex flex-col gap-3 ml-12">
              <h3 className="text-charcoal/80 text-sm font-bold leading-tight tracking-[-0.015em] px-1 pt-2">
                Sources
              </h3>
              <div className="flex flex-col items-stretch justify-start rounded-2xl glass-card overflow-hidden animate-slide-up" style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                {sources.map((source, index) => (
                  <div
                    key={index}
                    className={`flex w-full min-w-72 grow flex-col items-stretch justify-center gap-2 p-4 ${
                      index < sources.length - 1 ? 'border-b border-soft-gray/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-7 rounded-full font-semibold text-xs text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                        <span className="relative z-10">{index + 1}</span>
                      </div>
                      <p className="text-primary text-sm font-semibold leading-normal flex-1">
                        {source.title}
                      </p>
                    </div>
                    <p className="text-charcoal text-sm font-normal leading-normal pl-9">
                      {source.snippet}
                    </p>
                    <div className="flex items-end gap-3 justify-end pt-1">
                      <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden h-9 px-4 text-charcoal text-sm font-medium leading-normal rounded-xl hover-lift transition-all" style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}>
                        <span className="truncate">View document</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

           <div ref={messagesEndRef} style={{ height: '1px' }} />
         </main>

        <footer className="absolute bottom-0 left-0 right-0 glass-card" style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255, 255, 255, 0.18)' }}>
          <div className="flex items-center gap-3 p-4">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="modern-input w-full rounded-2xl py-4 px-5 text-charcoal placeholder-charcoal/60"
              placeholder={isTranscribing ? 'Transcribing...' : 'Ask about exams, timetables, admissions...'}
              type="text"
              disabled={isTranscribing}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isRecording) {
                  stopRecording();
                } else {
                  // Check network before starting
                  if (!navigator.onLine) {
                    alert('Internet connection required for speech recognition. Please check your network connection.');
                    return;
                  }
                  startRecording();
                }
              }}
              disabled={(isTranscribing && !isRecording) || isLoading || networkError}
              className={`btn-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white relative overflow-hidden group transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording 
                  ? 'animate-pulse' 
                  : ''
              }`}
              style={isRecording 
                ? { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }
                : networkError
                ? { background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }
                : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
              }
              title={
                networkError 
                  ? 'Network error - Check internet connection' 
                  : isRecording 
                  ? 'Stop recording (click to stop)' 
                  : 'Start voice recording (click to start - requires internet)'
              }
            >
              <span className="material-symbols-outlined relative z-10">
                {networkError ? 'wifi_off' : isRecording ? 'stop' : 'mic'}
              </span>
              {isRecording && (
                <span className="absolute inset-0 bg-red-400 rounded-2xl animate-ping opacity-75"></span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            <button
              onClick={handleSendMessage}
              disabled={isLoading || isTranscribing}
              className="btn-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white relative overflow-hidden group disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <span className="material-symbols-outlined relative z-10">send</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

