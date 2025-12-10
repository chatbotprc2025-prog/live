module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[externals]/pg [external] (pg, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("pg", () => require("pg"));

module.exports = mod;
}),
"[externals]/better-sqlite3 [external] (better-sqlite3, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("better-sqlite3", () => require("better-sqlite3"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
// Lazy initialization - only create client when first accessed
function getPrismaClient() {
    if (globalForPrisma.prisma) {
        return globalForPrisma.prisma;
    }
    // Safely get and clean DATABASE_URL
    const rawDatabaseUrl = process.env.DATABASE_URL;
    if (!rawDatabaseUrl || typeof rawDatabaseUrl !== 'string') {
        throw new Error('DATABASE_URL environment variable is not set. Please add it to your .env file.');
    }
    // Ensure it's a string and clean it
    let databaseUrl;
    try {
        databaseUrl = String(rawDatabaseUrl).trim();
        if (databaseUrl) {
            databaseUrl = databaseUrl.replace(/^["']|["']$/g, '');
        }
    } catch (error) {
        throw new Error(`Failed to parse DATABASE_URL: ${error}`);
    }
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is empty after parsing.');
    }
    let client;
    if (databaseUrl && databaseUrl.startsWith('file:')) {
        // SQLite - use better-sqlite3 adapter (required for Prisma 7)
        try {
            const { PrismaBetterSqlite3 } = __turbopack_context__.r("[project]/node_modules/@prisma/adapter-better-sqlite3/dist/index.js [app-route] (ecmascript)");
            const Database = __turbopack_context__.r("[externals]/better-sqlite3 [external] (better-sqlite3, cjs)");
            const path = __turbopack_context__.r("[externals]/path [external] (path, cjs)");
            // Extract database path from DATABASE_URL
            // Format: "file:./prisma/dev.db" or "file:///absolute/path" or "file://relative/path"
            let dbPath = databaseUrl.replace(/^file:/i, '').replace(/^\/+/, '');
            dbPath = dbPath.replace(/^["']|["']$/g, ''); // Remove quotes
            // Handle relative paths
            if (dbPath.startsWith('./')) {
                dbPath = dbPath.substring(2);
            }
            // Resolve to absolute path
            const absolutePath = path.resolve(process.cwd(), dbPath);
            // Create adapter - pass config object with url property
            const adapter = new PrismaBetterSqlite3({
                url: absolutePath
            });
            client = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
                adapter,
                log: ("TURBOPACK compile-time truthy", 1) ? [
                    'error',
                    'warn'
                ] : "TURBOPACK unreachable"
            });
        } catch (error) {
            console.error('Failed to initialize SQLite with adapter:', error);
            console.error('Database URL:', databaseUrl);
            console.error('Error details:', error?.message, error?.stack);
            throw new Error(`Failed to initialize Prisma with SQLite: ${error?.message || error}`);
        }
    } else if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
        // PostgreSQL - use adapter
        try {
            const { PrismaPg } = __turbopack_context__.r("[project]/node_modules/@prisma/adapter-pg/dist/index.js [app-route] (ecmascript)");
            const { Pool } = __turbopack_context__.r("[externals]/pg [external] (pg, cjs)");
            const pool = new Pool({
                connectionString: databaseUrl
            });
            const adapter = new PrismaPg(pool);
            client = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
                adapter,
                log: ("TURBOPACK compile-time truthy", 1) ? [
                    'error',
                    'warn'
                ] : "TURBOPACK unreachable"
            });
        } catch (error) {
            console.error('Failed to create postgres adapter:', error);
            client = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
                log: ("TURBOPACK compile-time truthy", 1) ? [
                    'error',
                    'warn'
                ] : "TURBOPACK unreachable"
            });
        }
    } else {
        // Default: try standard client
        client = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
            log: ("TURBOPACK compile-time truthy", 1) ? [
                'error',
                'warn'
            ] : "TURBOPACK unreachable"
        });
    }
    if ("TURBOPACK compile-time truthy", 1) {
        globalForPrisma.prisma = client;
    }
    return client;
}
const prisma = new Proxy({}, {
    get (_target, prop) {
        const client = getPrismaClient();
        const value = client[prop];
        if (typeof value === 'function') {
            return value.bind(client);
        }
        return value;
    }
});
const __TURBOPACK__default__export__ = prisma;
}),
"[project]/lib/chatHelpers.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "detectIntent",
    ()=>detectIntent,
    "getClassTimetable",
    ()=>getClassTimetable,
    "getExamTimetable",
    ()=>getExamTimetable,
    "getFeeInfo",
    ()=>getFeeInfo,
    "getRoomDirections",
    ()=>getRoomDirections,
    "getStaffInfo",
    ()=>getStaffInfo,
    "isGreeting",
    ()=>isGreeting
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
function isGreeting(message) {
    const lowerMessage = message.toLowerCase().trim();
    const greetingPatterns = [
        /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|sup|what's up|wassup)$/i,
        /^(hi|hello|hey)\s*[!.]*$/i,
        /^(hi|hello|hey)\s+(there|everyone|all)$/i
    ];
    return greetingPatterns.some((pattern)=>pattern.test(lowerMessage));
}
function detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    // Check for greetings first
    if (isGreeting(message)) {
        return 'GREETING';
    }
    // Fees intent - expanded keywords
    if (lowerMessage.includes('fee') || lowerMessage.includes('tuition') || lowerMessage.includes('payment') || lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('charges')) {
        return 'FEES_INFO';
    }
    // Staff/Faculty intent - expanded keywords and department abbreviations
    if (lowerMessage.includes('teacher') || lowerMessage.includes('professor') || lowerMessage.includes('hod') || lowerMessage.includes('faculty') || lowerMessage.includes('staff') || lowerMessage.includes('head') || lowerMessage.includes('faculties') || lowerMessage.includes('facult') || lowerMessage.includes('cse') || lowerMessage.includes('computer science') || lowerMessage.includes('me') || lowerMessage.includes('mechanical') || lowerMessage.includes('ee') || lowerMessage.includes('electrical') || lowerMessage.includes('department') || lowerMessage.includes('dept')) {
        return 'STAFF_INFO';
    }
    // Directions intent
    if (lowerMessage.includes('where') || lowerMessage.includes('location') || lowerMessage.includes('room') || lowerMessage.includes('building') || lowerMessage.includes('directions') || lowerMessage.includes('find') || lowerMessage.includes('how to reach') || lowerMessage.includes('how to get')) {
        return 'DIRECTIONS';
    }
    // Events intent
    if (lowerMessage.includes('event') || lowerMessage.includes('announcement') || lowerMessage.includes('news') || lowerMessage.includes('upcoming')) {
        return 'EVENTS_INFO';
    }
    // Admission intent
    if (lowerMessage.includes('admission') || lowerMessage.includes('admit') || lowerMessage.includes('enroll') || lowerMessage.includes('enrollment') || lowerMessage.includes('apply') || lowerMessage.includes('application')) {
        return 'ADMISSION_INFO';
    }
    // Timetable intent
    if (lowerMessage.includes('timetable') || lowerMessage.includes('schedule') || lowerMessage.includes('class time') || lowerMessage.includes('when is class') || lowerMessage.includes('what time') || lowerMessage.includes('period')) {
        return 'TIMETABLE_INFO';
    }
    // Exam intent
    if (lowerMessage.includes('exam') || lowerMessage.includes('examination') || lowerMessage.includes('test') || lowerMessage.includes('when is exam') || lowerMessage.includes('exam date') || lowerMessage.includes('exam schedule')) {
        return 'EXAM_INFO';
    }
    return 'GENERAL_INFO';
}
async function getStaffInfo(query) {
    const queryLower = query.toLowerCase().trim();
    // Department abbreviation mapping
    const deptMap = {
        'cse': [
            'computer science',
            'cs'
        ],
        'cs': [
            'computer science',
            'cse'
        ],
        'me': [
            'mechanical',
            'mechanical engineering'
        ],
        'ee': [
            'electrical',
            'electrical engineering'
        ],
        'ece': [
            'electronics',
            'electronics and communication'
        ]
    };
    // Expand department abbreviations
    const expandedTerms = [
        queryLower
    ];
    for (const [abbr, fullNames] of Object.entries(deptMap)){
        if (queryLower.includes(abbr)) {
            expandedTerms.push(...fullNames);
        }
    }
    // SQLite doesn't support case-insensitive mode, so fetch all active staff
    const allStaff = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].staff.findMany({
        where: {
            status: 'ACTIVE'
        },
        take: 50
    });
    // Filter for case-insensitive matches with expanded terms
    const filtered = allStaff.filter((staff)=>{
        const nameLower = staff.name.toLowerCase();
        const deptLower = staff.department.toLowerCase();
        const desigLower = staff.designation.toLowerCase();
        const emailLower = (staff.email || '').toLowerCase();
        // Check if any expanded term matches
        return expandedTerms.some((term)=>{
            // Remove common words for better matching
            const cleanTerm = term.replace(/\b(all|the|tell|me|about|names|faculties|faculty)\b/g, '').trim();
            if (!cleanTerm) return false;
            return nameLower.includes(cleanTerm) || deptLower.includes(cleanTerm) || desigLower.includes(cleanTerm) || emailLower.includes(cleanTerm);
        });
    });
    // If no specific match, return all staff if query is generic
    if (filtered.length === 0 && (queryLower.includes('all') || queryLower.includes('facult') || queryLower.includes('staff'))) {
        return allStaff.slice(0, 10);
    }
    return filtered.slice(0, 10);
}
async function getFeeInfo(query) {
    const queryLower = query.toLowerCase();
    // SQLite doesn't support case-insensitive mode, so fetch all fees
    // and filter in memory
    const allFees = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].fee.findMany({
        take: 50
    });
    // Filter for case-insensitive matches
    const filtered = allFees.filter((fee)=>{
        const programLower = fee.programName.toLowerCase();
        const yearLower = fee.academicYear.toLowerCase();
        const categoryLower = fee.category.toLowerCase();
        return programLower.includes(queryLower) || yearLower.includes(queryLower) || categoryLower.includes(queryLower);
    });
    return filtered.slice(0, 10);
}
async function getRoomDirections(query) {
    const queryLower = query.toLowerCase();
    // SQLite doesn't support case-insensitive mode, so fetch all rooms
    // and filter in memory
    const allRooms = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].room.findMany({
        take: 50
    });
    // Try to find by room code first (exact match preferred)
    const roomByCode = allRooms.find((room)=>room.roomCode.toLowerCase().includes(queryLower));
    if (roomByCode) return roomByCode;
    // Then try building name or floor
    const roomByBuilding = allRooms.find((room)=>room.buildingName.toLowerCase().includes(queryLower) || room.floor.toLowerCase().includes(queryLower));
    return roomByBuilding || null;
}
async function getClassTimetable(query) {
    const queryLower = query.toLowerCase();
    // Fetch all class timetables
    const allTimetables = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].classTimetable.findMany({
        take: 100
    });
    // Filter based on query terms
    const filtered = allTimetables.filter((tt)=>{
        const programLower = (tt.programName || '').toLowerCase();
        const semesterLower = (tt.semester || '').toLowerCase();
        const subjectLower = (tt.subject || '').toLowerCase();
        const dayLower = (tt.dayOfWeek || '').toLowerCase();
        const facultyLower = (tt.faculty || '').toLowerCase();
        const roomLower = (tt.room || '').toLowerCase();
        // Clean query - remove common words
        const cleanQuery = queryLower.replace(/\b(all|the|tell|me|about|show|list|timetable|schedule|class)\b/g, '').trim();
        return programLower.includes(cleanQuery) || semesterLower.includes(cleanQuery) || subjectLower.includes(cleanQuery) || dayLower.includes(cleanQuery) || facultyLower.includes(cleanQuery) || roomLower.includes(cleanQuery) || cleanQuery.length < 3 && queryLower.includes('timetable'); // Generic timetable query
    });
    return filtered.slice(0, 20);
}
async function getExamTimetable(query) {
    const queryLower = query.toLowerCase();
    // Fetch all exam timetables
    const allExams = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].examTimetable.findMany({
        take: 100,
        orderBy: {
            examDate: 'asc'
        }
    });
    // Filter based on query terms
    const filtered = allExams.filter((exam)=>{
        const programLower = (exam.programName || '').toLowerCase();
        const semesterLower = (exam.semester || '').toLowerCase();
        const examNameLower = (exam.examName || '').toLowerCase();
        const subjectLower = (exam.subject || '').toLowerCase();
        const roomLower = (exam.room || '').toLowerCase();
        // Clean query - remove common words
        const cleanQuery = queryLower.replace(/\b(all|the|tell|me|about|show|list|exam|examination|timetable|schedule)\b/g, '').trim();
        return programLower.includes(cleanQuery) || semesterLower.includes(cleanQuery) || examNameLower.includes(cleanQuery) || subjectLower.includes(cleanQuery) || roomLower.includes(cleanQuery) || cleanQuery.length < 3 && (queryLower.includes('exam') || queryLower.includes('timetable'));
    });
    return filtered.slice(0, 20);
}
}),
"[project]/lib/learningEngine.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureInitialized",
    ()=>ensureInitialized,
    "getLearnedPatterns",
    ()=>getLearnedPatterns,
    "getLearnedSynonyms",
    ()=>getLearnedSynonyms,
    "getRelatedKnowledge",
    ()=>getRelatedKnowledge,
    "initializeLearning",
    ()=>initializeLearning,
    "learnFromKnowledgeBase",
    ()=>learnFromKnowledgeBase,
    "recordKnowledgeUsage",
    ()=>recordKnowledgeUsage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
// In-memory cache for learned patterns (could be persisted to DB in future)
let learnedPatterns = new Map();
let knowledgeRelationships = new Map();
let dynamicSynonyms = new Map();
/**
 * Extract keywords and important terms from knowledge base entry
 */ function extractKeywords(text, name) {
    const combined = `${name} ${text}`.toLowerCase();
    // Remove common stop words
    const stopWords = new Set([
        'the',
        'a',
        'an',
        'and',
        'or',
        'but',
        'in',
        'on',
        'at',
        'to',
        'for',
        'of',
        'with',
        'by',
        'from',
        'as',
        'is',
        'was',
        'are',
        'were',
        'been',
        'be',
        'have',
        'has',
        'had',
        'this',
        'that',
        'these',
        'those',
        'i',
        'you',
        'he',
        'she',
        'it',
        'we',
        'they',
        'what',
        'which',
        'who',
        'where',
        'when',
        'why',
        'how',
        'all',
        'each',
        'every',
        'both',
        'few',
        'more',
        'most',
        'other',
        'some',
        'such',
        'no',
        'nor',
        'not',
        'only',
        'own',
        'same',
        'so',
        'than',
        'too',
        'very',
        'just',
        'about',
        'into',
        'can',
        'will',
        'would',
        'could',
        'should',
        'may',
        'might',
        'must'
    ]);
    // Extract meaningful words (3+ characters, not stop words)
    const words = combined.replace(/[^\w\s]/g, ' ').split(/\s+/).filter((w)=>w.length >= 3 && !stopWords.has(w));
    // Count word frequency
    const wordFreq = new Map();
    words.forEach((word)=>{
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });
    // Return top keywords (words that appear multiple times or are in the name)
    const nameWords = new Set(name.toLowerCase().split(/\s+/).filter((w)=>w.length >= 3));
    const keywords = Array.from(wordFreq.entries()).filter(([word, count])=>count >= 2 || nameWords.has(word)).sort((a, b)=>b[1] - a[1]).slice(0, 15).map(([word])=>word);
    return keywords;
}
/**
 * Find related terms by analyzing knowledge base content
 */ function findRelatedTerms(knowledgeEntries) {
    const termCooccurrence = new Map();
    knowledgeEntries.forEach((entry)=>{
        const keywords = extractKeywords(entry.text, entry.name);
        // Build co-occurrence matrix
        keywords.forEach((word1, i)=>{
            if (!termCooccurrence.has(word1)) {
                termCooccurrence.set(word1, new Map());
            }
            const cooccur = termCooccurrence.get(word1);
            keywords.forEach((word2, j)=>{
                if (i !== j) {
                    cooccur.set(word2, (cooccur.get(word2) || 0) + 1);
                }
            });
        });
    });
    // Build synonym/related term map
    const relatedTerms = new Map();
    const threshold = 2; // Minimum co-occurrence to consider terms related
    termCooccurrence.forEach((cooccur, term)=>{
        const related = new Set();
        cooccur.forEach((count, otherTerm)=>{
            if (count >= threshold) {
                related.add(otherTerm);
                // Also add reverse relationship
                if (!relatedTerms.has(otherTerm)) {
                    relatedTerms.set(otherTerm, new Set());
                }
                relatedTerms.get(otherTerm).add(term);
            }
        });
        if (related.size > 0) {
            relatedTerms.set(term, related);
        }
    });
    return relatedTerms;
}
/**
 * Build relationships between knowledge entries
 */ function buildKnowledgeRelationships(knowledgeEntries) {
    const relationships = new Map();
    knowledgeEntries.forEach((entry1, i)=>{
        const entry1Keywords = new Set(extractKeywords(entry1.text, entry1.name));
        const entry1Relations = [];
        knowledgeEntries.forEach((entry2, j)=>{
            if (i === j) return;
            const entry2Keywords = new Set(extractKeywords(entry2.text, entry2.name));
            // Calculate similarity (Jaccard similarity)
            const intersection = new Set([
                ...entry1Keywords
            ].filter((x)=>entry2Keywords.has(x)));
            const union = new Set([
                ...entry1Keywords,
                ...entry2Keywords
            ]);
            const similarity = intersection.size / union.size;
            if (similarity > 0.2) {
                entry1Relations.push({
                    sourceId: entry1.id,
                    targetId: entry2.id,
                    relationshipType: similarity > 0.5 ? 'similar' : 'related',
                    strength: similarity
                });
            }
        });
        // Sort by strength and keep top 5
        entry1Relations.sort((a, b)=>b.strength - a.strength);
        relationships.set(entry1.id, entry1Relations.slice(0, 5));
    });
    return relationships;
}
async function learnFromKnowledgeBase() {
    try {
        console.log('🧠 Learning from knowledge base...');
        // Fetch all knowledge entries
        const allKnowledge = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledge.findMany({
            orderBy: {
                updatedAt: 'desc'
            }
        });
        if (allKnowledge.length === 0) {
            console.log('No knowledge entries to learn from');
            return;
        }
        // Extract patterns for each knowledge entry
        const newPatterns = new Map();
        allKnowledge.forEach((entry)=>{
            const keywords = extractKeywords(entry.text, entry.name);
            const type = entry.type.toLowerCase();
            // Create or update pattern
            const patternKey = `${type}:${entry.name.toLowerCase()}`;
            const existingPattern = learnedPatterns.get(patternKey);
            newPatterns.set(patternKey, {
                keywords,
                relatedTerms: [],
                knowledgeIds: existingPattern ? [
                    ...existingPattern.knowledgeIds,
                    entry.id
                ] : [
                    entry.id
                ],
                usageCount: existingPattern?.usageCount || 0,
                lastUsed: existingPattern?.lastUsed || new Date()
            });
        });
        // Find related terms across all knowledge
        const relatedTerms = findRelatedTerms(allKnowledge);
        dynamicSynonyms = relatedTerms;
        // Build knowledge relationships
        const relationships = buildKnowledgeRelationships(allKnowledge);
        knowledgeRelationships = relationships;
        // Update learned patterns
        learnedPatterns = newPatterns;
        console.log(`✅ Learned from ${allKnowledge.length} knowledge entries`);
        console.log(`   - Extracted ${newPatterns.size} patterns`);
        console.log(`   - Found ${relatedTerms.size} term relationships`);
        console.log(`   - Built ${Array.from(relationships.values()).flat().length} knowledge relationships`);
        return {
            patternsLearned: newPatterns.size,
            relationshipsFound: Array.from(relationships.values()).flat().length,
            termsLearned: relatedTerms.size
        };
    } catch (error) {
        console.error('Error learning from knowledge base:', error);
        return null;
    }
}
function getLearnedSynonyms(term) {
    const lowerTerm = term.toLowerCase();
    const synonyms = dynamicSynonyms.get(lowerTerm);
    return synonyms ? Array.from(synonyms) : [];
}
function getRelatedKnowledge(knowledgeId, limit = 3) {
    const relationships = knowledgeRelationships.get(knowledgeId);
    if (!relationships || relationships.length === 0) {
        return [];
    }
    // Sort by strength and return top related IDs
    return relationships.sort((a, b)=>b.strength - a.strength).slice(0, limit).map((rel)=>rel.targetId);
}
function recordKnowledgeUsage(knowledgeId, query) {
    // Find matching pattern
    for (const [patternKey, pattern] of learnedPatterns.entries()){
        if (pattern.knowledgeIds.includes(knowledgeId)) {
            pattern.usageCount++;
            pattern.lastUsed = new Date();
            // Extract query terms and add to related terms if not already present
            const queryWords = query.toLowerCase().split(/\s+/).filter((w)=>w.length >= 3);
            queryWords.forEach((word)=>{
                if (!pattern.relatedTerms.includes(word)) {
                    pattern.relatedTerms.push(word);
                }
            });
            break;
        }
    }
}
function getLearnedPatterns(query) {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter((w)=>w.length >= 3);
    const matchingPatterns = [];
    learnedPatterns.forEach((pattern, key)=>{
        // Check if query matches pattern keywords or related terms
        const matches = pattern.keywords.some((kw)=>queryWords.some((qw)=>qw.includes(kw) || kw.includes(qw))) || pattern.relatedTerms.some((rt)=>queryWords.some((qw)=>qw.includes(rt) || rt.includes(qw)));
        if (matches) {
            matchingPatterns.push(pattern);
        }
    });
    // Sort by usage count (more used = more relevant)
    matchingPatterns.sort((a, b)=>b.usageCount - a.usageCount);
    return matchingPatterns;
}
// Lazy initialization flag
let isInitialized = false;
let initializationPromise = null;
async function initializeLearning() {
    if (isInitialized) {
        return;
    }
    if (initializationPromise) {
        return initializationPromise;
    }
    initializationPromise = (async ()=>{
        try {
            console.log('🚀 Initializing adaptive learning engine...');
            await learnFromKnowledgeBase();
            isInitialized = true;
            console.log('✅ Learning engine ready');
        } catch (error) {
            console.error('Error initializing learning engine:', error);
            initializationPromise = null; // Allow retry
        }
    })();
    return initializationPromise;
}
async function ensureInitialized() {
    if (!isInitialized && !initializationPromise) {
        await initializeLearning();
    }
    return initializationPromise;
}
}),
"[project]/lib/knowledge.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "searchKnowledge",
    ()=>searchKnowledge
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$learningEngine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/learningEngine.ts [app-route] (ecmascript)");
;
;
// Common stop words to ignore in search
const STOP_WORDS = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'as',
    'is',
    'was',
    'are',
    'were',
    'been',
    'be',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'can',
    'this',
    'that',
    'these',
    'those',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'what',
    'which',
    'who',
    'whom',
    'whose',
    'where',
    'when',
    'why',
    'how',
    'all',
    'each',
    'every',
    'both',
    'few',
    'more',
    'most',
    'other',
    'some',
    'such',
    'no',
    'nor',
    'not',
    'only',
    'own',
    'same',
    'so',
    'than',
    'too',
    'very',
    'just',
    'about',
    'into',
    'through',
    'during',
    'before',
    'after',
    'above',
    'below',
    'up',
    'down',
    'out',
    'off',
    'over',
    'under',
    'again',
    'further',
    'then',
    'once',
    'here',
    'there',
    'when',
    'where',
    'why',
    'how',
    'all',
    'any',
    'both',
    'each',
    'few',
    'more',
    'most',
    'other',
    'some',
    'such',
    'no',
    'nor',
    'not',
    'only',
    'own',
    'same',
    'so',
    'than',
    'too',
    'very',
    'can',
    'will',
    'just',
    'don',
    'should',
    'now',
    'hi',
    'hello',
    'hey',
    'tell',
    'me',
    'please',
    'thanks'
]);
// Synonym mapping for better matching
const SYNONYMS = {
    'admission': [
        'admit',
        'enroll',
        'enrollment',
        'apply',
        'application',
        'entry'
    ],
    'fee': [
        'fees',
        'tuition',
        'payment',
        'cost',
        'price',
        'charges',
        'amount'
    ],
    'faculty': [
        'faculties',
        'teacher',
        'teachers',
        'professor',
        'professors',
        'staff',
        'hod'
    ],
    'department': [
        'dept',
        'branch',
        'program',
        'course'
    ],
    'room': [
        'classroom',
        'lab',
        'laboratory',
        'hall',
        'office'
    ],
    'cse': [
        'computer science',
        'cs',
        'computer'
    ],
    'me': [
        'mechanical',
        'mechanical engineering'
    ],
    'ee': [
        'electrical',
        'electrical engineering'
    ],
    'location': [
        'where',
        'place',
        'address',
        'directions'
    ],
    'contact': [
        'phone',
        'email',
        'reach',
        'call'
    ]
};
/**
 * Expand query with synonyms for better matching
 * Now includes dynamically learned synonyms from knowledge base
 */ function expandQuery(query) {
    const words = query.toLowerCase().split(/\s+/);
    const expanded = [
        query.toLowerCase()
    ];
    words.forEach((word)=>{
        // Add original word
        if (word.length > 2 && !STOP_WORDS.has(word)) {
            expanded.push(word);
        }
        // Add static synonyms
        for (const [key, synonyms] of Object.entries(SYNONYMS)){
            if (word === key || synonyms.includes(word)) {
                expanded.push(...synonyms);
                expanded.push(key);
            }
        }
        // Add dynamically learned synonyms from knowledge base
        const learnedSynonyms = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$learningEngine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLearnedSynonyms"])(word);
        if (learnedSynonyms.length > 0) {
            expanded.push(...learnedSynonyms);
        }
    });
    return [
        ...new Set(expanded)
    ]; // Remove duplicates
}
/**
 * Calculate relevance score for a knowledge entry
 */ function calculateRelevance(item, queryWords, expandedTerms) {
    const textLower = item.text.toLowerCase();
    const nameLower = item.name.toLowerCase();
    const sourceLower = item.source.toLowerCase();
    const typeLower = item.type.toLowerCase();
    const combinedText = `${nameLower} ${textLower} ${sourceLower} ${typeLower}`;
    let score = 0;
    let exactMatches = 0;
    let wordMatches = 0;
    // Check for exact phrase match (highest priority)
    const exactPhrase = queryWords.join(' ');
    if (combinedText.includes(exactPhrase)) {
        score += 50;
        exactMatches++;
    }
    // Check each query word
    queryWords.forEach((word)=>{
        if (word.length < 2) return;
        // Exact word match in name (highest weight)
        if (nameLower.includes(word)) {
            score += 10;
            wordMatches++;
        }
        // Exact word match in text
        const wordCount = (textLower.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
        score += wordCount * 3;
        if (wordCount > 0) wordMatches++;
        // Match in source/type
        if (sourceLower.includes(word) || typeLower.includes(word)) {
            score += 2;
        }
    });
    // Check expanded terms (synonyms)
    expandedTerms.forEach((term)=>{
        if (term.length < 2) return;
        if (combinedText.includes(term)) {
            score += 1;
        }
    });
    // Boost score for recent entries (admin-provided content is usually recent)
    const daysSinceUpdate = (Date.now() - new Date(item.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) {
        score += 5; // Recent content gets a boost
    }
    // Boost score if multiple words match
    if (wordMatches >= queryWords.length * 0.5) {
        score += 10; // Good overall match
    }
    return score;
}
async function searchKnowledge(query, limit = 5) {
    // Ensure learning engine is initialized
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$learningEngine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureInitialized"])();
    if (!query || !query.trim()) {
        // Return recent knowledge entries for generic queries
        const results = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledge.findMany({
            orderBy: {
                updatedAt: 'desc'
            },
            take: limit
        });
        return results;
    }
    // Clean and expand query
    const cleanQuery = query.toLowerCase().replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/).filter((w)=>w.length > 0 && !STOP_WORDS.has(w)).join(' ').trim();
    if (!cleanQuery) {
        // If query is too generic, get recent knowledge entries
        const results = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledge.findMany({
            orderBy: {
                updatedAt: 'desc'
            },
            take: limit
        });
        return results;
    }
    // Get all knowledge entries for comprehensive search
    const allKnowledge = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledge.findMany({
        orderBy: {
            updatedAt: 'desc'
        },
        take: 200
    });
    // Extract meaningful words from query
    const queryWords = cleanQuery.split(/\s+/).filter((w)=>w.length > 2);
    const expandedTerms = expandQuery(cleanQuery);
    // Calculate relevance for each entry
    const scored = allKnowledge.map((item)=>({
            ...item,
            score: calculateRelevance(item, queryWords, expandedTerms)
        }));
    // Filter out entries with zero score and sort by relevance
    const relevant = scored.filter((item)=>item.score > 0).sort((a, b)=>{
        // Sort by score (descending), then by recency
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }).slice(0, limit).map(({ score, ...item })=>item);
    // If no relevant results, try using learned patterns
    if (relevant.length === 0) {
        const learnedPatterns = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$learningEngine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getLearnedPatterns"])(query);
        if (learnedPatterns.length > 0) {
            // Get knowledge IDs from learned patterns
            const patternKnowledgeIds = learnedPatterns.flatMap((p)=>p.knowledgeIds).slice(0, limit);
            const patternResults = allKnowledge.filter((k)=>patternKnowledgeIds.includes(k.id));
            if (patternResults.length > 0) {
                return patternResults;
            }
        }
        // Final fallback: return recent entries
        return allKnowledge.slice(0, limit);
    }
    // Record usage for learning
    relevant.forEach((item)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$learningEngine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["recordKnowledgeUsage"])(item.id, query);
    });
    // Add related knowledge entries based on learned relationships
    const enhancedResults = [
        ...relevant
    ];
    if (relevant.length > 0 && enhancedResults.length < limit) {
        const topResult = relevant[0];
        const relatedIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$learningEngine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRelatedKnowledge"])(topResult.id, limit - enhancedResults.length);
        const relatedEntries = allKnowledge.filter((k)=>relatedIds.includes(k.id) && !enhancedResults.some((r)=>r.id === k.id));
        enhancedResults.push(...relatedEntries);
    }
    return enhancedResults.slice(0, limit);
}
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/punycode [external] (punycode, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[project]/lib/groqLlmService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "callGroqLLM",
    ()=>callGroqLLM
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$groq$2d$sdk$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/groq-sdk/index.mjs [app-route] (ecmascript)");
;
const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
    console.warn('GROQ_API_KEY is not set. LLM responses will not be available.');
}
const groq = groqApiKey ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$groq$2d$sdk$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"]({
    apiKey: groqApiKey
}) : null;
async function callGroqLLM(ctx) {
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
${data.knowledge.map((k, idx)=>`
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
${data.staff.map((staff)=>({
                name: staff.name || 'Unknown',
                department: staff.department || 'Not specified',
                designation: staff.designation || 'Not specified',
                email: staff.email || 'Not available',
                phone: staff.phone || 'Not available'
            })).map((s, idx)=>`Staff ${idx + 1}: ${JSON.stringify(s, null, 2)}`).join('\n\n')}

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
${data.classTimetable.map((tt)=>({
                program: tt.programName || 'Not specified',
                semester: tt.semester || 'Not specified',
                day: tt.dayOfWeek || 'Not specified',
                period: tt.period || 'Not specified',
                subject: tt.subject || 'Not specified',
                faculty: tt.faculty || 'Not assigned',
                room: tt.room || 'Not assigned'
            })).map((tt, idx)=>`Class ${idx + 1}: ${JSON.stringify(tt, null, 2)}`).join('\n\n')}

CRITICAL: Use faculty names EXACTLY as shown. If a faculty name includes "Dr" or any title, use it. If it doesn't, DO NOT add any title.
`;
    }
    let examTimetableSection = '';
    if (hasExamTimetable) {
        examTimetableSection = `
📝 EXAM TIMETABLE INFORMATION (USE EXACTLY AS PROVIDED):
${data.examTimetable.map((exam)=>({
                program: exam.programName || 'Not specified',
                semester: exam.semester || 'Not specified',
                examName: exam.examName || 'Not specified',
                subject: exam.subject || 'Not specified',
                date: new Date(exam.examDate).toLocaleDateString(),
                time: `${exam.startTime || 'TBA'} - ${exam.endTime || 'TBA'}`,
                room: exam.room || 'Not assigned'
            })).map((exam, idx)=>`Exam ${idx + 1}: ${JSON.stringify(exam, null, 2)}`).join('\n\n')}
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
            answer: 'LLM is not configured. Please set GROQ_API_KEY on the server to enable responses.',
            sources: Array.isArray(data?.sources) ? data.sources : []
        };
    }
    const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    try {
        const completion = await groq.chat.completions.create({
            model,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ]
        });
        const answer = completion.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
        return {
            answer,
            sources: Array.isArray(data?.sources) ? data.sources : []
        };
    } catch (error) {
        console.error('Groq LLM error:', error);
        const friendly = error?.error?.message || error?.message || 'I am having trouble connecting to the service right now. Please try again later or contact the administration office.';
        return {
            answer: friendly,
            sources: Array.isArray(data?.sources) ? data.sources : []
        };
    }
}
}),
"[project]/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chatHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/chatHelpers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$knowledge$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/knowledge.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$groqLlmService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/groqLlmService.ts [app-route] (ecmascript)");
;
;
;
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const { message, conversationId } = body;
        if (!message || typeof message !== 'string') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Message is required'
            }, {
                status: 400
            });
        }
        // Detect intent
        const intent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chatHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["detectIntent"])(message);
        const isSimpleGreeting = intent === 'GREETING';
        // Query database based on intent
        const data = {};
        let knowledge = [];
        // For simple greetings, skip all data fetching - just respond naturally
        if (!isSimpleGreeting) {
            // Always try to get relevant data based on intent
            if (intent === 'FEES_INFO') {
                data.fees = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chatHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFeeInfo"])(message);
            }
            if (intent === 'STAFF_INFO') {
                data.staff = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chatHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStaffInfo"])(message);
            }
            if (intent === 'DIRECTIONS') {
                data.room = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chatHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRoomDirections"])(message);
            }
            if (intent === 'TIMETABLE_INFO') {
                data.classTimetable = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chatHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getClassTimetable"])(message);
            }
            if (intent === 'EXAM_INFO') {
                data.examTimetable = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chatHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getExamTimetable"])(message);
            }
            if (intent === 'ADMISSION_INFO' || intent === 'GENERAL_INFO') {
                // For admission and general queries, try to get relevant data from all sources
                const msgLower = message.toLowerCase();
                // Staff/Faculty queries
                if (msgLower.includes('facult') || msgLower.includes('staff') || msgLower.includes('teacher') || msgLower.includes('professor') || msgLower.includes('hod') || msgLower.includes('head of department')) {
                    data.staff = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chatHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getStaffInfo"])(message);
                }
                // Fee queries
                if (msgLower.includes('fee') || msgLower.includes('cost') || msgLower.includes('tuition') || msgLower.includes('payment') || msgLower.includes('price') || msgLower.includes('charges')) {
                    data.fees = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chatHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFeeInfo"])(message);
                }
                // Room/Location queries
                if (msgLower.includes('room') || msgLower.includes('location') || msgLower.includes('where') || msgLower.includes('building') || msgLower.includes('directions') || msgLower.includes('find')) {
                    data.room = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chatHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRoomDirections"])(message);
                }
                // Class timetable queries
                if (msgLower.includes('timetable') || msgLower.includes('schedule') || msgLower.includes('class time') || msgLower.includes('when is class') || msgLower.includes('period') || msgLower.includes('subject') || msgLower.includes('when is') || msgLower.includes('what time')) {
                    data.classTimetable = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chatHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getClassTimetable"])(message);
                }
                // Exam timetable queries
                if (msgLower.includes('exam') || msgLower.includes('examination') || msgLower.includes('exam date') || msgLower.includes('exam schedule') || msgLower.includes('test') || msgLower.includes('when is exam')) {
                    data.examTimetable = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$chatHelpers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getExamTimetable"])(message);
                }
            }
            // ALWAYS search knowledge base first - it's the primary learning source
            // Get more results for better context
            knowledge = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$knowledge$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["searchKnowledge"])(message, 15);
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
        const sources = isSimpleGreeting ? [] : data.knowledge?.map((k)=>({
                title: k.name || 'Knowledge Entry',
                source: k.source || 'Admin',
                type: k.type || 'General',
                snippet: k.text?.slice(0, 200) + (k.text?.length > 200 ? '...' : ''),
                imageUrl: k.imageUrl || null,
                imageDescription: k.imageDescription || null
            })) || [];
        // Extract images from knowledge base for display
        const images = isSimpleGreeting ? [] : data.knowledge?.filter((k)=>{
            const hasImage = k.imageUrl && k.imageUrl.trim() && k.imageUrl !== 'null' && k.imageUrl !== 'undefined' && k.imageUrl.trim().length > 0;
            return hasImage;
        }).map((k)=>{
            // Ensure URL starts with / for proper path resolution
            let imageUrl = k.imageUrl.trim();
            if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
                imageUrl = '/' + imageUrl;
            }
            return {
                url: imageUrl,
                description: k.imageDescription || k.name || 'Image from knowledge base',
                title: k.name || 'Knowledge Entry'
            };
        }) || [];
        // Debug logging
        console.log('Knowledge entries with images check:', data.knowledge?.map((k)=>({
                name: k.name,
                hasImageUrl: !!k.imageUrl,
                imageUrl: k.imageUrl
            })) || []);
        console.log('Images extracted:', images.length);
        if (images.length > 0) {
            console.log('Image URLs:', images.map((img)=>img.url));
        }
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
                intent
            }
        };
        // Call Groq LLM with enhanced context
        const llmResponse = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$groqLlmService$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callGroqLLM"])({
            intent,
            userMessage: message,
            data: enhancedData
        });
        // Clean up the answer to remove any image URLs that might have been included
        let cleanedAnswer = llmResponse.answer;
        if (images.length > 0) {
            // Remove image URLs and file paths from the answer
            images.forEach((img)=>{
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
        // Get or create conversation
        let conversation;
        if (conversationId) {
            conversation = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].conversation.findUnique({
                where: {
                    id: conversationId
                }
            });
        }
        if (!conversation) {
            // Create new conversation with title from first message
            const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
            conversation = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].conversation.create({
                data: {
                    title
                }
            });
        }
        // Save user message
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].message.create({
            data: {
                conversationId: conversation.id,
                sender: 'user',
                content: message
            }
        });
        // Save assistant response with images if available
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].message.create({
            data: {
                conversationId: conversation.id,
                sender: 'assistant',
                content: cleanedAnswer,
                images: images.length > 0 ? JSON.stringify(images) : null
            }
        });
        // Update conversation timestamp
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].conversation.update({
            where: {
                id: conversation.id
            },
            data: {
                updatedAt: new Date()
            }
        });
        console.log('📤 Sending response with:', {
            answerLength: cleanedAnswer.length,
            imagesCount: images.length,
            imageUrls: images.map((img)=>img.url)
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            answer: cleanedAnswer,
            sources: llmResponse.sources,
            images: images,
            conversationId: conversation.id
        });
    } catch (error) {
        console.error('Chat API error:', error);
        console.error('Error stack:', error?.stack);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error?.message || 'Internal server error',
            answer: "I'm sorry, I encountered an error processing your request. Please try again or contact support if the issue persists.",
            sources: []
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__81b4ef11._.js.map