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
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearAuthCookie",
    ()=>clearAuthCookie,
    "generateToken",
    ()=>generateToken,
    "getCurrentUser",
    ()=>getCurrentUser,
    "getTokenFromRequest",
    ()=>getTokenFromRequest,
    "hashPassword",
    ()=>hashPassword,
    "setAuthCookie",
    ()=>setAuthCookie,
    "verifyPassword",
    ()=>verifyPassword,
    "verifyToken",
    ()=>verifyToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jsonwebtoken/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
;
;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
async function hashPassword(password) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(password, 10);
}
async function verifyPassword(password, hash) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(password, hash);
}
function generateToken(payload) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].sign(payload, JWT_SECRET, {
        expiresIn: '7d'
    });
}
function verifyToken(token) {
    try {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jsonwebtoken$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].verify(token, JWT_SECRET);
    } catch  {
        return null;
    }
}
function getTokenFromRequest(request) {
    return request.cookies.get('auth-token')?.value || null;
}
async function getCurrentUser(request) {
    const token = getTokenFromRequest(request);
    if (!token) return null;
    const payload = verifyToken(token);
    if (!payload) return null;
    // Verify user still exists
    const user = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
        where: {
            id: payload.userId
        }
    });
    if (!user) return null;
    return payload;
}
function setAuthCookie(response, token) {
    response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: ("TURBOPACK compile-time value", "development") === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
    });
}
function clearAuthCookie(response) {
    response.cookies.delete('auth-token');
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
"[project]/app/api/admin/knowledge/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$learningEngine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/learningEngine.ts [app-route] (ecmascript)");
;
;
;
;
async function GET(request) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCurrentUser"])(request);
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search') || '';
        const type = searchParams.get('type') || '';
        let where = {};
        if (search) {
            where.OR = [
                {
                    name: {
                        contains: search
                    }
                },
                {
                    text: {
                        contains: search
                    }
                },
                {
                    source: {
                        contains: search
                    }
                }
            ];
        }
        if (type) {
            where.type = type;
        }
        const knowledge = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledge.findMany({
            where,
            orderBy: {
                updatedAt: 'desc'
            }
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(knowledge);
    } catch (error) {
        console.error('Knowledge GET error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Internal server error'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCurrentUser"])(request);
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Unauthorized'
            }, {
                status: 401
            });
        }
        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid JSON in request body'
            }, {
                status: 400
            });
        }
        const { source, type, name, text, imageUrl, imageDescription } = body;
        if (!source || !type || !name || !text) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'All fields are required'
            }, {
                status: 400
            });
        }
        const knowledge = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].knowledge.create({
            data: {
                source: source.trim(),
                type: type.trim(),
                name: name.trim(),
                text: text.trim(),
                imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : null,
                imageDescription: imageDescription && imageDescription.trim() ? imageDescription.trim() : null
            }
        });
        // Audit log
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].auditLog.create({
            data: {
                actorId: user.userId,
                action: 'KNOWLEDGE_CREATE',
                entityType: 'Knowledge',
                entityId: knowledge.id,
                severity: 'INFO'
            }
        });
        // Ensure learning engine is ready, then learn from new knowledge (async, don't wait)
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$learningEngine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ensureInitialized"])().then(()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$learningEngine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["learnFromKnowledgeBase"])().catch((err)=>{
                console.error('Error learning from new knowledge:', err);
            });
        }).catch(()=>{
            // If initialization fails, still try to learn
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$learningEngine$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["learnFromKnowledgeBase"])().catch((err)=>{
                console.error('Error learning from new knowledge:', err);
            });
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(knowledge, {
            status: 201
        });
    } catch (error) {
        console.error('Knowledge POST error:', error);
        console.error('Error details:', {
            message: error?.message,
            code: error?.code,
            meta: error?.meta,
            stack: error?.stack
        });
        // Ensure we always return valid JSON
        const errorMessage = error?.message || 'Internal server error';
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: errorMessage,
            code: error?.code || 'UNKNOWN_ERROR'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__58b8981e._.js.map