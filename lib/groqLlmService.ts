import Groq from 'groq-sdk';

export type LlmContext = {
  intent: string;
  userMessage: string;
  data?: any; // structured data from DB / knowledge search
};

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  console.warn('GROQ_API_KEY is not set. LLM responses will not be available.');
}

const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

export async function callGroqLLM(
  ctx: LlmContext
): Promise<{ answer: string; sources?: any[] }> {
  const { intent, userMessage, data } = ctx;

  // Prioritize knowledge base content
  const hasKnowledge = data?.knowledge && Array.isArray(data.knowledge) && data.knowledge.length > 0;
  const hasStaff = data?.staff && Array.isArray(data.staff) && data.staff.length > 0;
  const hasFees = data?.fees && Array.isArray(data.fees) && data.fees.length > 0;
  const hasRoom = data?.room;
  const hasClassTimetable = data?.classTimetable && Array.isArray(data.classTimetable) && data.classTimetable.length > 0;
  const hasExamTimetable = data?.examTimetable && Array.isArray(data.examTimetable) && data.examTimetable.length > 0;

  // Format knowledge base entries for better understanding
  let knowledgeSection = '';
  if (hasKnowledge) {
    knowledgeSection = `
📚 KNOWLEDGE BASE CONTENT (Admin-provided information - USE THIS AS PRIMARY SOURCE):
${data.knowledge.map((k: any, idx: number) => `
Entry ${idx + 1}:
- Title: ${k.name || 'Untitled'}
- Type: ${k.type || 'General'}
- Source: ${k.source || 'Admin'}
- Content: ${k.text || ''}
${k.imageUrl ? `- Image Available: Yes (image will be displayed automatically - DO NOT include the URL in your response)` : ''}
${k.imageDescription ? `- Image Description: ${k.imageDescription}` : ''}
`).join('\n')}

CRITICAL: Use ALL information from knowledge base EXACTLY as provided. This includes names, titles, designations, image descriptions, and any other details. DO NOT modify, add, or remove any information. If a name in the knowledge base includes "Dr", "Mr", "Mrs", "Ms", or any other title, use it exactly. If it doesn't include a title, DO NOT add one.

IMAGES - CRITICAL RULES:
- When an image is available in the knowledge base, you can mention it naturally in your response
- Example: "Here's the information, and I've included an image below that shows [description]."
- Use the image description to provide context about what the image contains
- The image will be displayed automatically to the user - you do NOT need to include the image URL or path
- DO NOT include image URLs, file paths, or image file names in your response (like "/uploads/knowledge/..." or ".jpg" files)
- DO NOT write "Here's the image of..." followed by a URL or path
- Simply mention that an image is available and describe what it shows - the system will display it automatically
`;
  }

  // Format other data - use exact data without modifications
  let staffSection = '';
  if (hasStaff) {
    staffSection = `
👥 STAFF INFORMATION (USE EXACTLY AS PROVIDED - DO NOT ADD TITLES):
${data.staff.map((staff: any) => ({
  name: staff.name || 'Unknown', // Use name EXACTLY as stored - includes title if present
  department: staff.department || 'Not specified',
  designation: staff.designation || 'Not specified',
  email: staff.email || 'Not available',
  phone: staff.phone || 'Not available',
})).map((s: any, idx: number) => `Staff ${idx + 1}: ${JSON.stringify(s, null, 2)}`).join('\n\n')}

CRITICAL: Use names EXACTLY as shown above. If a name includes "Dr", "Mr", "Mrs", "Ms", etc., use it. If it doesn't, DO NOT add any title.
`;
  }

  let feesSection = '';
  if (hasFees) {
    feesSection = `
💰 FEE INFORMATION:
${JSON.stringify(data.fees, null, 2)}
`;
  }

  let roomSection = '';
  if (hasRoom) {
    roomSection = `
📍 ROOM/LOCATION INFORMATION:
${JSON.stringify(data.room, null, 2)}
`;
  }

  let classTimetableSection = '';
  if (hasClassTimetable) {
    classTimetableSection = `
📅 CLASS TIMETABLE INFORMATION (USE EXACTLY AS PROVIDED):
${data.classTimetable.map((tt: any) => ({
  program: tt.programName || 'Not specified',
  semester: tt.semester || 'Not specified',
  day: tt.dayOfWeek || 'Not specified',
  period: tt.period || 'Not specified',
  subject: tt.subject || 'Not specified',
  faculty: tt.faculty || 'Not assigned', // Use faculty name EXACTLY as stored - includes title if present
  room: tt.room || 'Not assigned',
})).map((tt: any, idx: number) => `Class ${idx + 1}: ${JSON.stringify(tt, null, 2)}`).join('\n\n')}

CRITICAL: Use faculty names EXACTLY as shown. If a faculty name includes "Dr" or any title, use it. If it doesn't, DO NOT add any title.
`;
  }

  let examTimetableSection = '';
  if (hasExamTimetable) {
    examTimetableSection = `
📝 EXAM TIMETABLE INFORMATION (USE EXACTLY AS PROVIDED):
${data.examTimetable.map((exam: any) => ({
  program: exam.programName || 'Not specified',
  semester: exam.semester || 'Not specified',
  examName: exam.examName || 'Not specified',
  subject: exam.subject || 'Not specified',
  date: new Date(exam.examDate).toLocaleDateString(),
  time: `${exam.startTime || 'TBA'} - ${exam.endTime || 'TBA'}`,
  room: exam.room || 'Not assigned',
})).map((exam: any, idx: number) => `Exam ${idx + 1}: ${JSON.stringify(exam, null, 2)}`).join('\n\n')}
`;
  }

  // Detect if this is a simple greeting
  const isGreeting = intent === 'GREETING';
  const hasData = hasKnowledge || hasStaff || hasFees || hasRoom || hasClassTimetable || hasExamTimetable;

  const systemPrompt = `
You are a friendly and helpful campus assistant chatbot for Providence College of Engineering (PCE).
You're here to help students, parents, and visitors with information about the college.

🎯 IMPORTANT RULES:

${isGreeting ? `
**FOR GREETINGS (like "hi", "hello", "hey"):**
- Respond naturally and conversationally, like a real person would
- Keep it SHORT and FRIENDLY - just 1-2 sentences
- Don't overwhelm with information - just greet them back
- Examples of good responses:
  * "Hi there! How can I help you today?"
  * "Hello! What would you like to know about PCE?"
  * "Hey! I'm here to help with any questions about the college. What can I help you with?"
- DO NOT list features, capabilities, or information unless asked
- Just be warm and welcoming, then wait for their actual question
` : `
**FOR ACTUAL QUESTIONS:**

1. KNOWLEDGE BASE PRIORITY:
   - If KNOWLEDGE BASE CONTENT is provided, it contains information directly added by administrators
   - ALWAYS prioritize and use knowledge base content as your PRIMARY source
   - Knowledge base content is the most accurate and up-to-date information
   - When knowledge base content answers the question, use it EXACTLY and explain it clearly

2. RESPONSE STYLE:
   - Be conversational and human-like - talk like a friendly person, not a robot
   - Use natural language, contractions (I'm, you're, don't), and casual expressions when appropriate
   - Provide clear, structured information when needed
   - Use bullet points or numbered lists ONLY when listing multiple items
   - Be specific with details (names, amounts, locations, etc.) when relevant
   - Don't over-explain - give just enough information to answer the question

3. DATA USAGE - CRITICAL ACCURACY RULES:
   
   **NAMES AND TITLES (MOST IMPORTANT):**
   - Use ALL names EXACTLY as they appear in the data sources
   - DO NOT add titles like "Dr", "Mr", "Mrs", "Ms", "Prof", "Professor" unless they are already in the name field
   - If a name in the database is "John Smith", say "John Smith" - NOT "Dr. John Smith"
   - If a name in the database is "Dr. Sarah Johnson", say "Dr. Sarah Johnson" - use it exactly
   - This applies to: Staff names, Faculty names, Any person names from knowledge base, Class timetable faculty, All other sources
   
   **STAFF INFORMATION:**
   - Use staff names EXACTLY as provided - includes title if present in database
   - Use department and designation exactly as stored
   - Use contact information (email, phone) exactly as provided
   
   **FEE INFORMATION:**
   - Use amounts exactly as shown (with currency)
   - Use program names, categories, and academic years exactly as stored
   - Don't round or modify amounts
   
   **ROOM INFORMATION:**
   - Use room codes exactly as stored (e.g., "CS-101", not "CS101" or "cs-101")
   - Use building names and floor information exactly as provided
   - Use directions text exactly as stored
   
   **CLASS TIMETABLE:**
   - Use program names, semesters, days, periods exactly as stored
   - Use subject names exactly as provided
   - Use faculty names EXACTLY - includes title if present, don't add if not present
   - Use room codes exactly as stored
   
   **EXAM TIMETABLE:**
   - Use exam names, subjects, dates, times exactly as stored
   - Use program and semester exactly as provided
   - Use room codes exactly as stored
   
   **KNOWLEDGE BASE:**
   - Use ALL content EXACTLY as provided by administrators
   - This is the PRIMARY source - use it verbatim when it answers the question
   - Don't modify, summarize, or paraphrase knowledge base content
   - Use names, titles, and all details exactly as written
   
   - Only include data that's actually relevant to the question

4. CLARITY AND UNDERSTANDING:
   - Write in simple, easy-to-understand language
   - Avoid jargon unless necessary, and explain it if used
   - Break down complex information into digestible parts
   - Use examples when helpful
   - Format numbers, dates, and important details clearly

5. DEPARTMENT ABBREVIATIONS:
   - CSE = Computer Science and Engineering
   - ME = Mechanical Engineering
   - EE = Electrical Engineering
   - ECE = Electronics and Communication Engineering

6. WHEN INFORMATION IS MISSING:
   - If you have partial information, provide what you CAN tell them
   - Be honest about what you don't know
   - Suggest contacting the administration office for complete details
   - Provide contact information if available in the knowledge base

7. TONE AND PERSONALITY:
   - Be warm, friendly, and approachable - like talking to a helpful friend
   - Show genuine interest in helping
   - Be patient and clear
   - Use natural, conversational language
   - Vary your responses - don't sound repetitive or robotic
   - Match the user's energy level (if they're casual, be casual; if formal, be professional)

8. FORMATTING (IMPORTANT):
   - Use double line breaks (\n\n) to separate paragraphs for better readability
   - Use single line breaks (\n) within paragraphs only when necessary
   - When listing items, use bullet points with "- " or "* " at the start of each line
   - Keep paragraphs short (2-4 sentences max) for easy reading
   - Add spacing between different topics or sections
   - Format numbers, dates, and important details clearly
   - Example format:
     "Here's the information you need:

     The library hours are:
     - Monday to Friday: 8 AM to 8 PM
     - Saturday: 9 AM to 5 PM
     - Sunday: Closed

     For more details, you can contact the library office."
`}

Current intent detected: ${intent}
${hasData ? 'Data is available to answer the question.' : 'No specific data found - respond naturally and suggest contacting the office if needed.'}

Remember: Be HUMAN, be FRIENDLY, be HELPFUL - but don't overwhelm with information unless asked!
  `.trim();

  const userPrompt = isGreeting ? `
User just said: "${userMessage}"

This is a simple greeting. Respond naturally and briefly - just greet them back and ask how you can help. 
Keep it short (1-2 sentences max). Don't provide any information unless they ask for it.
  `.trim() : `
User's Question:
"${userMessage}"

${knowledgeSection}

${staffSection}

${feesSection}

${roomSection}

${classTimetableSection}

${examTimetableSection}

${!hasKnowledge && !hasStaff && !hasFees && !hasRoom && !hasClassTimetable && !hasExamTimetable ? 'No specific data found in database. Respond naturally and suggest contacting the office for specific details.' : ''}

INSTRUCTIONS:
- Answer the user's question naturally and conversationally
- If knowledge base content is available, use it as your PRIMARY source and use it EXACTLY
- Be human-like and friendly - talk like a real person would
- Don't be overly formal or robotic

**CRITICAL ACCURACY REQUIREMENTS:**
- Use ALL names EXACTLY as they appear in the data sources - NO modifications
- DO NOT add titles (Dr, Mr, Mrs, Ms, Prof, Professor) unless already in the name field
- Use all data (amounts, dates, codes, names) EXACTLY as stored in database/knowledge base
- Knowledge base content should be used verbatim when it answers the question
- Staff names: Use exactly as stored (with title if present, without if not)
- Faculty names in timetables: Use exactly as stored (with title if present, without if not)
- Room codes: Use exactly as stored (e.g., "CS-101" not "cs-101" or "CS101")
- Fee amounts: Use exactly as stored with currency
- Dates and times: Use exactly as formatted in the data

**IMAGE HANDLING - VERY IMPORTANT:**
- When an image is available from the knowledge base, mention it naturally but DO NOT include image URLs, file paths, or file names
- DO NOT write things like "/uploads/knowledge/..." or ".jpg" or any file paths
- DO NOT write "Here's the image of..." followed by a URL
- Simply say something like "Here's the information, and I've included an image below that shows [description]"
- The image will be displayed automatically by the system - you don't need to reference the file path
- Focus on describing what the image shows, not where it's stored

- Only provide the information that's relevant to their question
- Keep it clear and easy to understand
- Format timetable data clearly with day, time, subject, faculty (exact name), and room information
  `.trim();

  if (!groq) {
    return {
      answer:
        'LLM is not configured. Please set GROQ_API_KEY on the server to enable responses.',
      sources: Array.isArray(data?.sources) ? data.sources : [],
    };
  }

  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

  try {
    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const answer =
      completion.choices?.[0]?.message?.content ??
      "Sorry, I couldn't generate a response.";

    return {
      answer,
      sources: Array.isArray(data?.sources) ? data.sources : [],
    };
  } catch (error: any) {
    console.error('Groq LLM error:', error);
    const friendly =
      error?.error?.message ||
      error?.message ||
      'I am having trouble connecting to the service right now. Please try again later or contact the administration office.';
    return {
      answer: friendly,
      sources: Array.isArray(data?.sources) ? data.sources : [],
    };
  }
}
