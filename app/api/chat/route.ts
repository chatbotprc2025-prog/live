import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
<<<<<<< HEAD
import { detectIntent, getStaffInfo, getFeeInfo, getRoomDirections, getClassTimetable, getExamTimetable } from '@/lib/chatHelpers';
=======
import { detectIntent, getStaffInfo, getFeeInfo, getRoomDirections } from '@/lib/chatHelpers';
>>>>>>> cb6b7604b1cc40647a2c26fd3c0d15f8fd157eff
import { searchKnowledge } from '@/lib/knowledge';
import { callGroqLLM } from '@/lib/groqLlmService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationId } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Detect intent
    const intent = detectIntent(message);
     const isSimpleGreeting = intent === 'GREETING';

    // Query database based on intent
    const data: any = {};
    let knowledge: any[] = [];
    
    // For simple greetings, skip all data fetching - just respond naturally
    if (!isSimpleGreeting) {
      // Always try to get relevant data based on intent
      if (intent === 'FEES_INFO') {
        data.fees = await getFeeInfo(message);
      }
      if (intent === 'STAFF_INFO') {
        data.staff = await getStaffInfo(message);
      }
      if (intent === 'DIRECTIONS') {
        data.room = await getRoomDirections(message);
      }
<<<<<<< HEAD
      if (intent === 'TIMETABLE_INFO') {
        data.classTimetable = await getClassTimetable(message);
      }
      if (intent === 'EXAM_INFO') {
        data.examTimetable = await getExamTimetable(message);
      }
      if (intent === 'ADMISSION_INFO' || intent === 'GENERAL_INFO') {
        // For admission and general queries, try to get relevant data from all sources
        const msgLower = message.toLowerCase();
        
        // Staff/Faculty queries
        if (msgLower.includes('facult') || msgLower.includes('staff') || 
            msgLower.includes('teacher') || msgLower.includes('professor') ||
            msgLower.includes('hod') || msgLower.includes('head of department')) {
          data.staff = await getStaffInfo(message);
        }
        
        // Fee queries
        if (msgLower.includes('fee') || msgLower.includes('cost') || 
            msgLower.includes('tuition') || msgLower.includes('payment') ||
            msgLower.includes('price') || msgLower.includes('charges')) {
          data.fees = await getFeeInfo(message);
        }
        
        // Room/Location queries
        if (msgLower.includes('room') || msgLower.includes('location') || 
            msgLower.includes('where') || msgLower.includes('building') ||
            msgLower.includes('directions') || msgLower.includes('find')) {
          data.room = await getRoomDirections(message);
        }
        
        // Class timetable queries
        if (msgLower.includes('timetable') || msgLower.includes('schedule') || 
            msgLower.includes('class time') || msgLower.includes('when is class') ||
            msgLower.includes('period') || msgLower.includes('subject') ||
            msgLower.includes('when is') || msgLower.includes('what time')) {
          data.classTimetable = await getClassTimetable(message);
        }
        
        // Exam timetable queries
        if (msgLower.includes('exam') || msgLower.includes('examination') ||
            msgLower.includes('exam date') || msgLower.includes('exam schedule') ||
            msgLower.includes('test') || msgLower.includes('when is exam')) {
          data.examTimetable = await getExamTimetable(message);
        }
=======
      if (intent === 'ADMISSION_INFO' || intent === 'GENERAL_INFO') {
        // For admission and general queries, also try to get staff/fees if relevant
        if (message.toLowerCase().includes('facult') || message.toLowerCase().includes('staff')) {
          data.staff = await getStaffInfo(message);
        }
        if (message.toLowerCase().includes('fee') || message.toLowerCase().includes('cost')) {
          data.fees = await getFeeInfo(message);
        }
>>>>>>> cb6b7604b1cc40647a2c26fd3c0d15f8fd157eff
      }

      // ALWAYS search knowledge base first - it's the primary learning source
      // Get more results for better context
      knowledge = await searchKnowledge(message, 15);
      
      // Prioritize knowledge base content
      if (knowledge.length > 0) {
        data.knowledge = knowledge;
        // If we have strong knowledge base matches, prioritize them
        // by placing them first in the data structure
        data.priority = 'knowledge_base';
      }
    }

    // Construct sources for UI (RAG-style) from knowledge base
    // Skip sources for simple greetings
    const sources = isSimpleGreeting ? [] : (
      data.knowledge?.map((k: any) => ({
        title: k.name || 'Knowledge Entry',
        source: k.source || 'Admin',
        type: k.type || 'General',
        snippet: k.text?.slice(0, 200) + (k.text?.length > 200 ? '...' : ''),
<<<<<<< HEAD
        imageUrl: k.imageUrl || null,
        imageDescription: k.imageDescription || null,
      })) || []
    );

    // Extract images from knowledge base for display
    const images = isSimpleGreeting ? [] : (
      data.knowledge?.filter((k: any) => {
        const hasImage = k.imageUrl && 
                        k.imageUrl.trim() && 
                        k.imageUrl !== 'null' && 
                        k.imageUrl !== 'undefined' &&
                        k.imageUrl.trim().length > 0;
        return hasImage;
      }).map((k: any) => {
        // Ensure URL starts with / for proper path resolution
        let imageUrl = k.imageUrl.trim();
        if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
          imageUrl = '/' + imageUrl;
        }
        return {
          url: imageUrl,
          description: k.imageDescription || k.name || 'Image from knowledge base',
          title: k.name || 'Knowledge Entry',
        };
      }) || []
    );
    
    // Debug logging
    console.log('Knowledge entries with images check:', data.knowledge?.map((k: any) => ({
      name: k.name,
      hasImageUrl: !!k.imageUrl,
      imageUrl: k.imageUrl
    })) || []);
    console.log('Images extracted:', images.length);
    if (images.length > 0) {
      console.log('Image URLs:', images.map((img: any) => img.url));
    }

=======
      })) || []
    );

>>>>>>> cb6b7604b1cc40647a2c26fd3c0d15f8fd157eff
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
<<<<<<< HEAD
        hasClassTimetable: data.classTimetable && data.classTimetable.length > 0,
        hasExamTimetable: data.examTimetable && data.examTimetable.length > 0,
=======
>>>>>>> cb6b7604b1cc40647a2c26fd3c0d15f8fd157eff
        intent,
      },
    };

    // Call Groq LLM with enhanced context
    const llmResponse = await callGroqLLM({
      intent,
      userMessage: message,
      data: enhancedData,
     });

<<<<<<< HEAD
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

=======
>>>>>>> cb6b7604b1cc40647a2c26fd3c0d15f8fd157eff
    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
    }

    if (!conversation) {
      // Create new conversation with title from first message
      const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
      conversation = await prisma.conversation.create({
        data: { title },
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

<<<<<<< HEAD
    // Save assistant response with images if available
=======
    // Save assistant response
>>>>>>> cb6b7604b1cc40647a2c26fd3c0d15f8fd157eff
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'assistant',
<<<<<<< HEAD
        content: cleanedAnswer,
        images: images.length > 0 ? JSON.stringify(images) : null,
=======
        content: llmResponse.answer,
>>>>>>> cb6b7604b1cc40647a2c26fd3c0d15f8fd157eff
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });
<<<<<<< HEAD
    
    console.log('📤 Sending response with:', {
      answerLength: cleanedAnswer.length,
      imagesCount: images.length,
      imageUrls: images.map((img: any) => img.url),
    });
    
    return NextResponse.json({
      answer: cleanedAnswer,
      sources: llmResponse.sources,
      images: images, // Include images from knowledge base
=======

    return NextResponse.json({
      answer: llmResponse.answer,
      sources: llmResponse.sources,
>>>>>>> cb6b7604b1cc40647a2c26fd3c0d15f8fd157eff
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

