import { supabase } from "./supabase";

// ============================================
// 1. IMPROVED CACHING SYSTEM
// ============================================
const getCacheKey = (str, language, mode = 'standard') => {
  let hash = 0;
  const combined = `${str}|${language}|${mode}`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `sf_refine_${Math.abs(hash)}`;
};

// ============================================
// 2. ENHANCED SYSTEM PROMPT WITH ORDERING LOGIC
// ============================================
const SYSTEM_PROMPT = `
You are an expert code refactoring engine. Analyze the provided code and return ONLY a valid JSON object with this exact structure:
{
  "refinedCode": "...",
  "suggestedTitle": "...",
  "explanation": "..."
}

### CRITICAL REFACTORING RULES (Apply in this exact order):

#### PHASE 1: DATA TYPE & STRUCTURE ANALYSIS
- Map out all variable mutations and type changes through the entire code pipeline
- For Pandas: Track DataFrame column dtypes at each operation step
- Identify where operations will fail due to type mismatches
- Flag implicit type conversions that could cause runtime errors

#### PHASE 2: FIX OPERATION ORDERING (MOST CRITICAL FOR PANDAS)
**This is the most common source of bugs. Follow this order strictly:**
1. Type conversions FIRST: pd.to_numeric(), pd.to_datetime(), astype() with errors='coerce'
2. String operations SECOND: .str.lower(), .str.upper(), .str.replace(), .str.strip()
3. Handle missing values LAST: fillna(), dropna(), replace()
4. NEVER place fillna(0) before string operations - it converts strings to integers
5. NEVER use inplace=True without careful consideration

#### PHASE 3: SYNTAX & DEPRECATION FIXES
- Replace deprecated Pandas methods:
  * .append() → pd.concat()
  * .sort(columns=) → .sort_values(by=)
  * .ix[] → .loc[] or .iloc[]
  * .get_values() → .values
- Fix chained indexing: df[df['A']>5]['B'] = x → df.loc[df['A']>5, 'B'] = x
- Always use .copy() when creating modified DataFrames to avoid SettingWithCopyWarning

#### PHASE 4: PERFORMANCE OPTIMIZATION
- Replace loops with vectorized operations: df['col'] * 2 instead of for loops
- Use df.query() or df.loc[] for readable filtering
- Replace .apply() with vectorized alternatives where possible
- Prefer pd.concat() over repeated DataFrame modifications

#### PHASE 5: CODE QUALITY
- Fix inconsistent naming: prefer snake_case for Python, camelCase for JavaScript
- Handle exceptions properly: no bare 'except: pass' or 'except:'
- Remove redundant operations and dead code
- Use f-strings for Python string formatting
- Ensure groupby() operations have reset_index() when converting to DataFrame

### LANGUAGE-SPECIFIC RULES:

**Python/Pandas:**
- Variable naming: df_sales, customer_data (descriptive prefixes)
- Use df.loc[] for label-based selection, df.iloc[] for positional
- Check for SettingWithCopyWarning patterns
- Ensure column name consistency (case-sensitive)

**JavaScript:**
- Use === instead of ==
- Proper async/await error handling
- Remove console.log in production code
- Use const/let appropriately, avoid var

**HTML:**
- Ensure proper tag nesting
- Add alt attributes to images
- Use semantic HTML5 elements

**CSS:**
- Fix specificity conflicts
- Remove duplicate declarations
- Add vendor prefixes where needed

### EXPLANATION FORMAT (Use Markdown):
### 🔍 Issues Found
- List each problem with severity (🔴Critical 🟡Warning 🔵Suggestion)
- Explain why each issue is problematic

### 🔧 Step-by-Step Fixes
1. What was changed and why
2. How it prevents potential errors
3. Performance implications
4. Before/After code comparison for critical fixes

### 📊 Impact Summary
- Code quality improvement
- Performance gains
- Maintainability benefits

### 🚀 Best Practices Applied
- List the conventions and patterns used

CRITICAL: Start response with { and end with }. No markdown backticks, no introductory text whatsoever.
`;

// ============================================
// 3. LANGUAGE DETECTION
// ============================================
const detectLanguage = (code) => {
  if (!code || typeof code !== 'string') return 'python';
  
  const indicators = {
    python: ['import pandas', 'import numpy', 'def ', 'print(', 'df.', 'plt.'],
    javascript: ['const ', 'let ', 'function ', '=>', 'console.log', 'import React'],
    html: ['<!DOCTYPE', '<html', '<div', '<script'],
    css: ['{', '}', '@media', 'font-size:', 'color:', 'margin:']
  };
  
  let bestMatch = 'python';
  let maxScore = 0;
  
  for (const [lang, patterns] of Object.entries(indicators)) {
    const score = patterns.filter(p => code.includes(p)).length;
    if (score > maxScore) {
      maxScore = score;
      bestMatch = lang;
    }
  }
  
  return bestMatch;
};

// ============================================
// 4. PRE-PROCESSING FOR COMMON FIXES
// ============================================
const preProcessCode = (code, language) => {
  let processed = code;
  
  if (language === 'python' || code.includes('import pandas') || code.includes('pd.')) {
    processed = processed
      // Fix deprecated append
      .replace(/\.append\(/g, '.concat([')
      // Fix deprecated sort
      .replace(/\.sort\(columns=/g, '.sort_values(by=')
      // Fix removed ix indexer
      .replace(/\.ix\[/g, '.loc[')
      // Fix common chained indexing pattern
      .replace(/df\[df\[['"]([^'"]+)['"]\]\s*==\s*([^\]]+)\]\['"]([^'"]+)['"]\]\s*=/g, 
               (match, col, val, target) => `df.loc[df['${col}'] == ${val}, '${target}'] =`);
  }
  
  if (language === 'javascript') {
    processed = processed
      // Fix var to let/const (conservative)
      .replace(/\bvar\s+(?!require\b)/g, 'let ');
  }
  
  return processed;
};

// ============================================
// 5. ROBUST JSON EXTRACTION
// ============================================
const extractJSON = (rawText) => {
  // Strategy 1: Direct parse
  try { 
    const parsed = JSON.parse(rawText);
    if (parsed.refinedCode) return parsed;
  } catch {}
  
  // Strategy 2: Find JSON between first { and last }
  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const jsonCandidate = rawText.slice(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonCandidate);
      if (parsed.refinedCode) return parsed;
    } catch {}
  }
  
  // Strategy 3: Clean common AI artifacts and try again
  let cleaned = rawText
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .replace(/^[^{]*/, '')  // Remove text before first {
    .replace(/[^}]*$/, '')  // Remove text after last }
    .trim();
    
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed.refinedCode) return parsed;
  } catch {}
  
  // Strategy 4: Extract fields individually with regex (last resort)
  const refinedMatch = rawText.match(/"refinedCode"\s*:\s*"([^"]*?)"(?=\s*[,}])/s);
  const titleMatch = rawText.match(/"suggestedTitle"\s*:\s*"([^"]*?)"(?=\s*[,}])/);
  const explanationMatch = rawText.match(/"explanation"\s*:\s*"([^"]*?)"(?=\s*[,}])/s);
  
  if (refinedMatch) {
    return {
      refinedCode: refinedMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t'),
      suggestedTitle: titleMatch?.[1] || 'Refined Code',
      explanation: explanationMatch?.[1]?.replace(/\\n/g, '\n') || 'No explanation provided'
    };
  }
  
  throw new Error("Failed to extract valid JSON from AI response");
};

// ============================================
// 6. POST-PROCESSING VALIDATION
// ============================================
const validateRefinedCode = (originalCode, refinedCode, language) => {
  const warnings = [];
  
  if (language === 'python' || originalCode.includes('pandas')) {
    // Critical: Check fillna before string operations
    const fillnaPos = refinedCode.indexOf('.fillna(');
    const strOpsPatterns = ['.str.', '.upper()', '.lower()', '.replace(', '.strip()'];
    
    for (const pattern of strOpsPatterns) {
      const patternPos = refinedCode.indexOf(pattern);
      if (fillnaPos !== -1 && patternPos !== -1 && fillnaPos < patternPos) {
        warnings.push({
          severity: 'critical',
          message: '⚠️ fillna() appears before string operations. This can convert strings to numbers and break .str accessor.',
          fix: 'Move string operations before fillna()'
        });
        break;
      }
    }
    
    // Check for deprecated methods in refined code
    const deprecatedChecks = [
      { pattern: '.append(', replacement: 'pd.concat()' },
      { pattern: '.ix[', replacement: '.loc[] or .iloc[]' },
      { pattern: '.sort(columns=', replacement: '.sort_values(by=' },
      { pattern: '.get_values()', replacement: '.values' }
    ];
    
    for (const { pattern, replacement } of deprecatedChecks) {
      if (refinedCode.includes(pattern)) {
        warnings.push({
          severity: 'warning',
          message: `⚠️ Deprecated method found: ${pattern}`,
          fix: `Replace with ${replacement}`
        });
      }
    }
    
    // Check for chained indexing
    const chainedIndexPattern = /df\[[^\]]+\]\[[^\]]+\]\s*=/;
    if (chainedIndexPattern.test(refinedCode)) {
      warnings.push({
        severity: 'warning',
        message: '⚠️ Potential chained indexing detected (SettingWithCopyWarning)',
        fix: 'Use df.loc[] for assignments'
      });
    }
    
    // Check for bare except
    if (refinedCode.includes('except:') && !refinedCode.includes('except Exception')) {
      warnings.push({
        severity: 'suggestion',
        message: '💡 Bare except clause found. Consider specifying exception types.',
        fix: 'Use except Exception as e: or specific exception types'
      });
    }
  }
  
  if (language === 'javascript') {
    // Check for == instead of ===
    if (/[^=!]==[^=]/.test(refinedCode)) {
      warnings.push({
        severity: 'suggestion',
        message: '💡 Loose equality (==) detected. Consider using strict equality (===)',
        fix: 'Replace == with ==='
      });
    }
    
    // Check for console.log in production code
    if (refinedCode.includes('console.log(')) {
      warnings.push({
        severity: 'warning',
        message: '⚠️ console.log() found. Remove for production code.',
        fix: 'Remove or replace with proper logging'
      });
    }
  }
  
  return warnings;
};

// ============================================
// 7. QUALITY SCORE CALCULATION
// ============================================
const calculateQualityScore = (originalCode, refinedCode, explanation, warnings) => {
  let score = 100;
  
  // Penalize if refined code is nearly identical
  if (originalCode.trim() === refinedCode.trim()) score -= 50;
  
  // Penalize if explanation is too short (less than 100 chars)
  if (!explanation || explanation.length < 100) score -= 20;
  else if (explanation.length < 200) score -= 10;
  
  // Penalize for each critical warning
  const criticalWarnings = warnings.filter(w => w.severity === 'critical').length;
  score -= criticalWarnings * 25;
  
  // Penalize for each warning
  const regularWarnings = warnings.filter(w => w.severity === 'warning').length;
  score -= regularWarnings * 10;
  
  // Penalize for each suggestion
  const suggestions = warnings.filter(w => w.severity === 'suggestion').length;
  score -= suggestions * 5;
  
  // Bonus points for good practices
  if (refinedCode.includes('.loc[') && originalCode.includes('df[')) score += 5;
  if (refinedCode.includes('.copy()') && !originalCode.includes('.copy()')) score += 3;
  if (refinedCode.includes('pd.to_numeric') && !originalCode.includes('pd.to_numeric')) score += 3;
  
  return Math.max(0, Math.min(100, Math.round(score)));
};

// ============================================
// 8. MAIN REFINEMENT FUNCTION
// ============================================
export const refineSnippetWithFailover = async (currentCode, options = {}) => {
  if (!currentCode) return null;
  
  const { 
    language = 'auto', 
    mode = 'standard',
    timeout = 30000 
  } = options;
  
  const codeString = typeof currentCode === 'string' 
    ? currentCode 
    : (currentCode.code || String(currentCode));
  
  // Detect language if not specified
  const detectedLanguage = language === 'auto' 
    ? detectLanguage(codeString) 
    : language;
  
  console.log(`🔍 Detected language: ${detectedLanguage}`);
  
  // Pre-process to fix obvious issues before sending to AI
  const preprocessedCode = preProcessCode(codeString, detectedLanguage);
  
  // Generate cache key
  const cacheKey = getCacheKey(codeString, detectedLanguage, mode);
  
  // Check cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      console.log('📦 Returning cached result');
      return { ...parsed, fromCache: true };
    }
  } catch (cacheError) {
    console.warn('Cache read error:', cacheError);
  }

  // Try primary AI provider (Groq)
  try {
    console.log('📡 Calling Groq via Edge Function...');
    const result = await routeToAI(preprocessedCode, 'groq', detectedLanguage, timeout);
    
    if (result?.refinedCode) {
      // Post-process validation
      const warnings = validateRefinedCode(codeString, result.refinedCode, detectedLanguage);
      const qualityScore = calculateQualityScore(codeString, result.refinedCode, result.explanation, warnings);
      
      const enrichedResult = {
        ...result,
        warnings,
        qualityScore,
        language: detectedLanguage,
        provider: 'groq',
        refinedAt: new Date().toISOString(),
        stats: {
          originalLines: codeString.split('\n').length,
          refinedLines: result.refinedCode.split('\n').length,
          issuesFixed: warnings.length
        }
      };
      
      // Cache successful result
      try {
        localStorage.setItem(cacheKey, JSON.stringify(enrichedResult));
      } catch (storageError) {
        console.warn('Cache write error (storage might be full):', storageError);
      }
      
      return enrichedResult;
    }
    throw new Error("Invalid Groq Response - missing refinedCode");
    
  } catch (primaryError) {
    console.warn('⚠️ Groq failed:', primaryError.message);
    console.log('🔄 Switching to Hugging Face Fallback...');
    
    // Try fallback provider (Hugging Face)
    try {
      const result = await routeToAI(preprocessedCode, 'huggingface', detectedLanguage, timeout);
      
      if (result?.refinedCode) {
        const warnings = validateRefinedCode(codeString, result.refinedCode, detectedLanguage);
        const qualityScore = calculateQualityScore(codeString, result.refinedCode, result.explanation, warnings);
        
        const enrichedResult = {
          ...result,
          warnings,
          qualityScore,
          language: detectedLanguage,
          provider: 'huggingface',
          fallback: true,
          refinedAt: new Date().toISOString(),
          stats: {
            originalLines: codeString.split('\n').length,
            refinedLines: result.refinedCode.split('\n').length,
            issuesFixed: warnings.length
          }
        };
        
        // Cache fallback result
        try {
          localStorage.setItem(cacheKey, JSON.stringify(enrichedResult));
        } catch (storageError) {
          console.warn('Cache write error:', storageError);
        }
        
        return enrichedResult;
      }
      throw new Error("Invalid Hugging Face Response");
      
    } catch (fallbackError) {
      console.error('❌ Both AI providers failed:', fallbackError.message);
      
      // Return graceful error with suggestions
      return {
        error: true,
        message: 'Code refinement is temporarily unavailable. Both AI providers failed.',
        suggestion: 'Please try again in a few moments or check your internet connection.',
        refinedCode: codeString, // Return original code
        suggestedTitle: 'Refinement Failed',
        explanation: 'The refinement service is currently experiencing issues. Your original code has been preserved.',
        qualityScore: 0,
        language: detectedLanguage,
        provider: 'none',
        refinedAt: new Date().toISOString()
      };
    }
  }
};

// Export with alias for backward compatibility
export { refineSnippetWithFailover as refineSnippet };

// ============================================
// 9. AI ROUTING FUNCTION
// ============================================
async function routeToAI(code, provider, language, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refine-code`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          code, 
          action: 'refine', 
          provider, 
          language,
          prompt: SYSTEM_PROMPT 
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    // Check for HTML responses (error pages)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textError = await response.text();
      console.error(`Server returned ${contentType} instead of JSON:`, textError.substring(0, 200));
      throw new Error(`Edge Function (${provider}) returned invalid response type. Service may be down.`);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data?.error) {
      throw new Error(data.error);
    }

    let result = data;

    // Handle Hugging Face array responses
    if (Array.isArray(result)) {
      result = result[0]?.generated_text || result[0]?.refinedCode || result[0];
    }
    
    // Handle nested response structures
    if (result?.response) {
      result = result.response;
    }
    if (result?.choices?.[0]?.message?.content) {
      result = result.choices[0].message.content;
    }

    // Convert to string if needed and extract JSON
    if (typeof result === 'string') {
      result = extractJSON(result);
    } else if (typeof result === 'object' && result !== null) {
      // If it's already an object, try to find refinedCode
      if (!result.refinedCode) {
        const stringified = JSON.stringify(result);
        result = extractJSON(stringified);
      }
    }

    // Validate final result
    if (result?.refinedCode) {
      return result;
    }
    
    throw new Error(`Empty or invalid response from ${provider}`);
    
  } catch (err) {
    clearTimeout(timeoutId);
    
    if (err.name === 'AbortError') {
      console.error(`⏱️ Request to ${provider} timed out after ${timeout}ms`);
      throw new Error(`Request to ${provider} timed out. Please try again.`);
    }
    
    console.error(`Error in routeToAI (${provider}):`, err.message);
    throw err;
  }
}

// ============================================
// 10. UTILITY: CLEAR REFINEMENT CACHE
// ============================================
export const clearRefinementCache = () => {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('sf_refine_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log(`🧹 Cleared ${keysToRemove.length} cached refinements`);
  return keysToRemove.length;
};

// ============================================
// 11. UTILITY: GET REFINEMENT STATS
// ============================================
export const getRefinementStats = () => {
  const stats = {
    totalCached: 0,
    providers: { groq: 0, huggingface: 0 },
    averageQuality: 0,
    languages: {}
  };
  
  let qualitySum = 0;
  let refinementCount = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('sf_refine_')) {
      try {
        const cached = JSON.parse(localStorage.getItem(key));
        stats.totalCached++;
        
        if (cached.provider) {
          stats.providers[cached.provider] = (stats.providers[cached.provider] || 0) + 1;
        }
        
        if (cached.language) {
          stats.languages[cached.language] = (stats.languages[cached.language] || 0) + 1;
        }
        
        if (cached.qualityScore !== undefined) {
          qualitySum += cached.qualityScore;
          refinementCount++;
        }
      } catch {}
    }
  }
  
  stats.averageQuality = refinementCount > 0 ? Math.round(qualitySum / refinementCount) : 0;
  
  return stats;
};