const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

/**
 * System prompt for LLM
 */
const SYSTEM_PROMPT = `You are an expert trading coach and educator. You will analyze a single trade's structured data and free-text notes. RETURN ONLY valid JSON and nothing else. This is educational content only — DO NOT give buy/sell signals or financial advice. Use concise tags and short suggestions.`;

/**
 * Build user prompt from trade data
 */
function buildUserPrompt(tradeData, ocrText) {
  const sanitizedOCR = ocrText ? ocrText.substring(0, 2000) : '';
  
  return `Analyze this trade and return ONLY valid JSON:

Trade Data:
- Symbol: ${tradeData.symbol || 'N/A'}
- Side: ${tradeData.side || 'N/A'}
- Entry Price: ${tradeData.entryPrice || 'N/A'}
- Exit Price: ${tradeData.exitPrice || 'N/A'}
- Stop Loss: ${tradeData.stopLoss || 'N/A'}
- Quantity: ${tradeData.qty || 'N/A'}
- P&L: ${tradeData.pnl || 'N/A'} (${tradeData.pnlPercent || 0}%)
- Notes: ${tradeData.notes || 'None'}
${sanitizedOCR ? `\nOCR Text from screenshot:\n${sanitizedOCR}` : ''}

Return JSON in this exact format (no markdown, no code blocks, just raw JSON):
{
  "qualityScore": <number 0-100>,
  "mistakes": [<string>, <string>, <string>],
  "emotionTags": [{"tag": "fear"|"greed"|"overconfidence"|"revenge"|"hesitation"|"neutral", "confidence": <number 0-1>}],
  "suggestions": [<string>, <string>, <string>],
  "explainers": "<1-2 sentence explanation>",
  "confidence": <number 0-1>
}`;
}

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

/**
 * Call Gemini API (Vertex AI placeholder)
 * 
 * TO IMPLEMENT GEMINI:
 * 1. Set up Google Cloud Project and enable Vertex AI API
 * 2. Create a service account with Vertex AI User role
 * 3. Download service account key JSON
 * 4. Set GOOGLE_APPLICATION_CREDENTIALS env var or use admin.credential.cert()
 * 5. Install @google-cloud/aiplatform package
 * 6. Replace this function with actual Vertex AI call:
 * 
 * const {PredictionServiceClient} = require('@google-cloud/aiplatform');
 * const client = new PredictionServiceClient();
 * 
 * const project = 'your-project-id';
 * const location = 'us-central1';
 * const model = 'gemini-pro';
 * 
 * const request = {
 *   endpoint: `projects/${project}/locations/${location}/publishers/google/models/${model}`,
 *   instances: [{
 *     structValue: {
 *       fields: {
 *         contents: {
 *           listValue: {
 *             values: [
 *               { structValue: { fields: { role: { stringValue: 'user' }, parts: { listValue: { values: [{ structValue: { fields: { text: { stringValue: prompt } } } }] } } } } }
 *             ]
 *           }
 *         }
 *       }
 *     }
 *   }],
 *   parameters: { structValue: { fields: { temperature: { numberValue: 0.7 } } } }
 * };
 * 
 * const [response] = await client.predict(request);
 * return response.predictions[0].structValue.fields.candidates.listValue.values[0].structValue.fields.content.structValue.fields.parts.listValue.values[0].structValue.fields.text.stringValue;
 * 
 * For now, return sample JSON for testing
 */
async function callGemini(prompt) {
  // PLACEHOLDER: Return sample JSON
  // Replace with actual Gemini/Vertex AI call as described above
  console.log('Gemini placeholder called. Implement Vertex AI integration.');
  
  return JSON.stringify({
    qualityScore: 65,
    mistakes: ['No stop loss set', 'Entered on emotion'],
    emotionTags: [
      { tag: 'fear', confidence: 0.7 },
      { tag: 'hesitation', confidence: 0.5 }
    ],
    suggestions: [
      'Always set a stop loss before entering',
      'Wait for confirmation signals',
      'Review your trading plan'
    ],
    explainers: 'This trade shows emotional decision-making. Consider following a systematic approach.',
    confidence: 0.75
  });
}

/**
 * Parse and validate LLM response JSON
 */
function parseLLMResponse(responseText) {
  // Try to extract JSON from response (handle markdown code blocks)
  let jsonText = responseText.trim();
  
  // Remove markdown code blocks if present
  jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  jsonText = jsonText.trim();
  
  // Try to find JSON object
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonText = jsonMatch[0];
  }
  
  try {
    const parsed = JSON.parse(jsonText);
    
    // Validate structure
    if (typeof parsed.qualityScore !== 'number' || parsed.qualityScore < 0 || parsed.qualityScore > 100) {
      throw new Error('Invalid qualityScore');
    }
    if (!Array.isArray(parsed.mistakes)) {
      throw new Error('Invalid mistakes array');
    }
    if (!Array.isArray(parsed.emotionTags)) {
      throw new Error('Invalid emotionTags array');
    }
    if (!Array.isArray(parsed.suggestions)) {
      throw new Error('Invalid suggestions array');
    }
    if (typeof parsed.explainers !== 'string') {
      throw new Error('Invalid explainers');
    }
    if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
      throw new Error('Invalid confidence');
    }
    
    return parsed;
  } catch (error) {
    throw new Error(`JSON parse error: ${error.message}. Raw response: ${jsonText.substring(0, 500)}`);
  }
}

/**
 * Check and increment analysis quota
 */
async function checkAndIncrementQuota(uid) {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const userRef = db.doc(`users/${uid}`);
  
  return db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }
    
    const userData = userDoc.data();
    const plan = userData.plan || 'free';
    let analysisCount = userData.analysisCount || 0;
    let analysisMonth = userData.analysisMonth || currentMonth;
    
    // Reset count if month changed
    if (analysisMonth !== currentMonth) {
      analysisCount = 0;
      analysisMonth = currentMonth;
    }
    
    // Check quota for free plan
    if (plan === 'free' && analysisCount >= 50) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'Free monthly analyses reached. Please wait until next month.',
        { code: 'quota_exceeded' }
      );
    }
    
    // Increment count
    analysisCount++;
    
    // Update user document
    transaction.update(userRef, {
      analysisCount,
      analysisMonth,
    });
    
    return { analysisCount, analysisMonth };
  });
}

/**
 * Analyze trade with LLM
 */
exports.analyzeTrade = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const uid = context.auth.uid;
  const { tradeId } = data;
  
  if (!tradeId) {
    throw new functions.https.HttpsError('invalid-argument', 'tradeId is required');
  }
  
  try {
    // Check and increment quota
    await checkAndIncrementQuota(uid);
    
    // Fetch trade data
    const tradeRef = db.doc(`users/${uid}/trades/${tradeId}`);
    const tradeDoc = await tradeRef.get();
    
    if (!tradeDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Trade not found');
    }
    
    const tradeData = tradeDoc.data();
    
    // Build prompt
    const prompt = buildUserPrompt(tradeData, tradeData.ocrText || '');
    
    // Get LLM provider from environment
    // For Firebase Functions v2, use functions.config() or process.env
    // Set via: firebase functions:config:set llm.provider="openai"
    // Or use environment variables in Firebase Console > Functions > Configuration
    let llmProvider, openaiKey;
    try {
      const config = functions.config();
      llmProvider = process.env.LLM_PROVIDER || config.llm?.provider || 'openai';
      openaiKey = process.env.OPENAI_API_KEY || config.openai?.api_key;
    } catch (e) {
      // Fallback if config() fails
      llmProvider = process.env.LLM_PROVIDER || 'openai';
      openaiKey = process.env.OPENAI_API_KEY;
    }
    
    let llmResponse;
    let retries = 0;
    const maxRetries = 2;
    let analysisResult = null;
    let lastError = null;
    
    // Try to get valid JSON response (with retries)
    while (retries <= maxRetries) {
      try {
        if (llmProvider === 'openai') {
          if (!openaiKey) {
            throw new functions.https.HttpsError(
              'failed-precondition',
              'OPENAI_API_KEY not configured'
            );
          }
          llmResponse = await callOpenAI(prompt, openaiKey);
        } else if (llmProvider === 'gemini') {
          llmResponse = await callGemini(prompt);
        } else {
          throw new functions.https.HttpsError(
            'failed-precondition',
            `Unknown LLM_PROVIDER: ${llmProvider}. Use 'openai' or 'gemini'`
          );
        }
        
        // Parse and validate JSON
        analysisResult = parseLLMResponse(llmResponse);
        break; // Success, exit retry loop
        
      } catch (error) {
        lastError = error;
        retries++;
        
        if (retries > maxRetries) {
          // Max retries reached, save error
          analysisResult = {
            errorRaw: llmResponse || error.message,
            qualityScore: 0,
            mistakes: [],
            emotionTags: [],
            suggestions: ['Analysis failed. Please try again.'],
            explainers: 'Unable to analyze this trade due to an error.',
            confidence: 0,
          };
        } else {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    }
    
    // Update trade with analysis
    await tradeRef.update({
      aiAnalysis: analysisResult,
      analysisAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    if (lastError && retries > maxRetries) {
      throw new functions.https.HttpsError(
        'internal',
        'Analysis completed but with errors. Check aiAnalysis.errorRaw',
        { analysis: analysisResult }
      );
    }
    
    return { success: true, analysis: analysisResult };
    
  } catch (error) {
    console.error('analyzeTrade error:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to analyze trade: ' + error.message
    );
  }
});

