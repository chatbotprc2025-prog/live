import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { detectIntent, getStaffInfo, getFeeInfo, getRoomDirections, getClassTimetable, getExamTimetable } from '@/lib/chatHelpers';
import { searchKnowledge } from '@/lib/knowledge';
import { callGroqLLM } from '@/lib/groqLlmService';
import { detectLanguage } from '@/lib/languageDetection';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId, clientUserId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!clientUserId) {
      return NextResponse.json(
        { error: 'Client user ID is required' },
        { status: 400 }
      );
    }

    // Detect language and intent
    const detectedLanguage = detectLanguage(message);
    const intent = detectIntent(message);
    const isSimpleGreeting = intent === 'GREETING';

    // Query database based on intent - IMPROVED: Search all sources efficiently
    const data: any = {};
    let knowledge: any[] = [];
    
    // For simple greetings, skip all data fetching - just respond naturally
    if (!isSimpleGreeting) {
      const msgLower = message.toLowerCase();
      
      // IMPROVED: Search all sources in parallel for better efficiency
      // This allows the chatbot to learn from multiple sources simultaneously
      const searchPromises: Promise<any>[] = [];
      
      // 1. Search knowledge base - EQUAL PRIORITY with other sources
      // Optimized: Get fewer but more relevant results for better learning efficiency
      searchPromises.push(
        searchKnowledge(message, 8).then(k => {
          knowledge = k;
          if (k.length > 0) {
            // Only keep top relevant results to avoid overwhelming the LLM
            data.knowledge = k.slice(0, 5);
          }
        })
      );
      
      // 2. Search based on intent - but also check for cross-references
      if (intent === 'FEES_INFO' || msgLower.includes('fee') || msgLower.includes('cost') || 
          msgLower.includes('tuition') || msgLower.includes('payment') ||
          msgLower.includes('price') || msgLower.includes('charges')) {
        searchPromises.push(
          getFeeInfo(message).then(fees => {
            if (fees && fees.length > 0) data.fees = fees;
          })
        );
      }
      
      if (intent === 'STAFF_INFO' || msgLower.includes('facult') || msgLower.includes('staff') || 
          msgLower.includes('teacher') || msgLower.includes('professor') ||
          msgLower.includes('hod') || msgLower.includes('head of department')) {
        searchPromises.push(
          getStaffInfo(message).then(staff => {
            if (staff && staff.length > 0) data.staff = staff;
          })
        );
      }
      
      if (intent === 'DIRECTIONS' || msgLower.includes('room') || msgLower.includes('location') || 
          msgLower.includes('where') || msgLower.includes('building') ||
          msgLower.includes('directions') || msgLower.includes('find')) {
        searchPromises.push(
          getRoomDirections(message).then(room => {
            if (room) data.room = room;
          })
        );
      }
      
      if (intent === 'TIMETABLE_INFO' || msgLower.includes('timetable') || msgLower.includes('schedule') || 
          msgLower.includes('class time') || msgLower.includes('when is class') ||
          msgLower.includes('period') || msgLower.includes('subject') ||
          msgLower.includes('when is') || msgLower.includes('what time')) {
        searchPromises.push(
          getClassTimetable(message).then(timetable => {
            if (timetable && timetable.length > 0) data.classTimetable = timetable;
          })
        );
      }
      
      if (intent === 'EXAM_INFO' || msgLower.includes('exam') || msgLower.includes('examination') ||
          msgLower.includes('exam date') || msgLower.includes('exam schedule') ||
          msgLower.includes('test') || msgLower.includes('when is exam')) {
        searchPromises.push(
          getExamTimetable(message).then(exams => {
            if (exams && exams.length > 0) data.examTimetable = exams;
          })
        );
      }
      
      // IMPROVED: For general queries, intelligently search across all sources
      // This helps the chatbot learn from multiple data sources
      if (intent === 'ADMISSION_INFO' || intent === 'GENERAL_INFO') {
        // Search all sources in parallel for comprehensive learning
        if (!data.fees) {
          searchPromises.push(
            getFeeInfo(message).then(fees => {
              if (fees && fees.length > 0) data.fees = fees;
            })
          );
        }
        if (!data.staff) {
          searchPromises.push(
            getStaffInfo(message).then(staff => {
              if (staff && staff.length > 0) data.staff = staff;
            })
          );
        }
        if (!data.room) {
          searchPromises.push(
            getRoomDirections(message).then(room => {
              if (room) data.room = room;
            })
          );
        }
        if (!data.classTimetable) {
          searchPromises.push(
            getClassTimetable(message).then(timetable => {
              if (timetable && timetable.length > 0) data.classTimetable = timetable;
            })
          );
        }
        if (!data.examTimetable) {
          searchPromises.push(
            getExamTimetable(message).then(exams => {
              if (exams && exams.length > 0) data.examTimetable = exams;
            })
          );
        }
      }
      
      // Wait for all searches to complete in parallel
      await Promise.all(searchPromises);
    }

    // Construct sources for UI (RAG-style) from knowledge base
    // Skip sources for simple greetings
    const sources = isSimpleGreeting ? [] : (
      data.knowledge?.map((k: any) => ({
        title: k.name || 'Knowledge Entry',
        source: k.source || 'Admin',
        type: k.type || 'General',
        snippet: k.text?.slice(0, 200) + (k.text?.length > 200 ? '...' : ''),
        imageUrl: k.imageUrl || null,
        imageDescription: k.imageDescription || null,
      })) || []
    );

    // Extract images from knowledge base for display - ONLY from highly relevant entries
    // Only show images from the MOST relevant knowledge entry that actually answers the question
    const images = isSimpleGreeting ? [] : (() => {
      if (!data.knowledge || data.knowledge.length === 0) {
        return [];
      }
      
      // Get the top knowledge entry (most relevant)
      const topKnowledge = data.knowledge[0];
      
      // Check if it has an image and is actually relevant to the query
      const hasImage = topKnowledge.imageUrl && 
                      topKnowledge.imageUrl.trim() && 
                      topKnowledge.imageUrl !== 'null' && 
                      topKnowledge.imageUrl !== 'undefined' &&
                      topKnowledge.imageUrl.trim().length > 0;
      
      // Only include image if the knowledge entry is highly relevant (it's the top result)
      // and the query is asking about something that the knowledge entry actually covers
      if (!hasImage) {
        return [];
      }
      
      // Extract query intent and key terms for STRICT relevance checking
      const queryLower = message.toLowerCase().trim();
      const queryTerms = queryLower
        .split(/\s+/)
        .filter(w => w.length > 2 && !['what', 'when', 'where', 'who', 'how', 'which', 'about', 'the', 'is', 'are', 'can', 'will'].includes(w));
      
      const knowledgeText = (topKnowledge.text || '').toLowerCase();
      const knowledgeName = (topKnowledge.name || '').toLowerCase();
      const knowledgeType = (topKnowledge.type || '').toLowerCase();
      
      // STRICT EXCLUSION RULES - Don't show images if type doesn't match query intent
      const queryIntent = detectIntent(message);
      
      // If query is about admission, don't show staff/faculty images
      if (queryIntent === 'ADMISSION' || queryLower.includes('admission') || queryLower.includes('admit')) {
        if (knowledgeType.includes('staff') || knowledgeType.includes('faculty') || 
            knowledgeName.includes('faculty') || knowledgeName.includes('staff') ||
            knowledgeText.includes('faculty') || knowledgeText.includes('staff member') ||
            knowledgeName.toLowerCase().includes('nidhin')) {
          return [];
        }
      }
      
      // If query is about staff/faculty, only show staff/faculty images
      if (queryIntent === 'STAFF' || queryLower.includes('staff') || queryLower.includes('faculty') || 
          queryLower.includes('teacher') || queryLower.includes('professor')) {
        if (!knowledgeType.includes('staff') && !knowledgeType.includes('faculty') &&
            !knowledgeName.includes('faculty') && !knowledgeName.includes('staff')) {
          return [];
        }
      }
      
      // If query is about fees, only show fee-related images
      if (queryIntent === 'FEE' || queryLower.includes('fee') || queryLower.includes('payment') || 
          queryLower.includes('tuition') || queryLower.includes('cost')) {
        if (!knowledgeType.includes('fee') && !knowledgeName.includes('fee') && 
            !knowledgeText.includes('fee') && !knowledgeText.includes('payment')) {
          return [];
        }
      }
      
      // Count matching terms
      const matchingTerms = queryTerms.filter(term => 
        knowledgeText.includes(term) || 
        knowledgeName.includes(term) ||
        knowledgeType.includes(term)
      ).length;
      
      // Calculate relevance score
      const relevanceScore = queryTerms.length > 0 ? matchingTerms / queryTerms.length : 0;
      
      // STRICT RELEVANCE CHECK - Only show if:
      // 1. At least 2 key terms match OR relevance score > 0.5
      // 2. Knowledge entry actually contains query-related content
      const isRelevant = matchingTerms >= 2 || relevanceScore > 0.5 || 
                        (queryTerms.length <= 1 && matchingTerms > 0);
      
      if (!isRelevant) {
        return [];
      }
      
      // Ensure URL starts with / for proper path resolution
      let imageUrl = topKnowledge.imageUrl.trim();
      if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
        imageUrl = '/' + imageUrl;
      }
      
      return [{
        url: imageUrl,
        description: topKnowledge.imageDescription || topKnowledge.name || 'Image from knowledge base',
        title: topKnowledge.name || 'Knowledge Entry',
      }];
    })();
    

    // Enhance data with metadata for better LLM understanding
    const enhancedData = {
      ...data,
      sources,
      metadata: {
        hasKnowledge: knowledge.length > 0,
        knowledgeCount: knowledge.length,
        hasStaff: data.staff && data.staff.length > 0,
        hasFees: data.fees && data.fees.length > 0,
        hasRoom: !!data.room,
        hasClassTimetable: data.classTimetable && data.classTimetable.length > 0,
        hasExamTimetable: data.examTimetable && data.examTimetable.length > 0,
        intent,
      },
    };

    // Call Groq LLM with enhanced context and detected language
    const llmResponse = await callGroqLLM({
      intent,
      userMessage: message,
      data: enhancedData,
      language: detectedLanguage, // Pass detected language
     });

    // Clean up the answer to remove any image URLs that might have been included
    let cleanedAnswer = llmResponse.answer;
    if (images.length > 0) {
      // Remove image URLs and file paths from the answer
      images.forEach((img: any) => {
        // Remove the image URL if it appears in the text
        if (img.url) {
          cleanedAnswer = cleanedAnswer.replace(new RegExp(img.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
        }
        // Remove common patterns like "/uploads/knowledge/..." or file extensions
        cleanedAnswer = cleanedAnswer.replace(/\/uploads\/knowledge\/[^\s\)]+/gi, '');
        cleanedAnswer = cleanedAnswer.replace(/\([^)]*\.(jpg|jpeg|png|gif|webp)[^)]*\)/gi, '');
      });
      // Clean up any double spaces or awkward spacing
      cleanedAnswer = cleanedAnswer.replace(/\s+/g, ' ').trim();
    }

    // Get or create conversation - ensure it belongs to this client user
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
      
      // Verify the conversation belongs to this client user
      if (conversation && conversation.clientUserId !== clientUserId) {
        return NextResponse.json(
          { error: 'Unauthorized: Conversation does not belong to this user' },
          { status: 403 }
        );
      }
    }

    if (!conversation) {
      // Create new conversation with title from first message, associated with client user
      const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
      conversation = await prisma.conversation.create({
        data: { 
          title,
          clientUserId: clientUserId,
        },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'user',
        content: message,
      },
    });

    // Save assistant response with images if available
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'assistant',
        content: cleanedAnswer,
        images: images.length > 0 ? JSON.stringify(images) : null,
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });
    
    console.log('📤 Sending response with:', {
      answerLength: cleanedAnswer.length,
      imagesCount: images.length,
      imageUrls: images.map((img: any) => img.url),
    });
    
    return NextResponse.json({
      answer: cleanedAnswer,
      sources: llmResponse.sources,
      images: images, // Include images from knowledge base
      conversationId: conversation.id,
    });
   } catch (error: any) {
    console.error('Chat API error:', error);
    console.error('Error stack:', error?.stack);
    return NextResponse.json(
      { 
        error: error?.message || 'Internal server error',
        answer: "I'm sorry, I encountered an error processing your request. Please try again or contact support if the issue persists.",
        sources: []
      },
       { status: 500 }
    );
  }
}

