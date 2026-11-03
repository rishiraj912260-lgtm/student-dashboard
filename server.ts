import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK with required headers
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Fallback high-quality responses if API key is not configured or rate-limited
function getSmartFallbackResponse(
  query: string,
  subject: string,
  mode: string
): string {
  const lowerQuery = query.toLowerCase();

  if (mode === 'socratic') {
    return `### 💡 Guiding Hint & Next Step

Let's break this down together step-by-step!

1. **Identify the Core Principle**: What are the known variables or constraints in this problem?
   - In **${subject || 'this topic'}**, look at what information is given vs. what you need to solve for.
2. **Key Question to Ask Yourself**:
   - If this is an equation, can you isolate the primary term on one side?
   - If this is a conceptual question, what underlying law or theorem connects the starting condition to the outcome?
3. **Try This Next**:
   - Write out the fundamental formula relating these components.
   - What happens if you substitute the known quantities?

*Reply below with your first attempt or calculation, and we'll check it together!*`;
  }

  if (mode === 'quiz') {
    return `### 📝 Quick Knowledge Check for: "${query.slice(0, 50)}..."

**Question 1 (Core Concept):**
What is the primary governing theorem or rule when dealing with ${subject || 'this topic'}?
- A) Conservation / Balance Principle
- B) Rate of Change Law
- C) Inverse Relationship
- D) Baseline Normalization
*(Answer: A — Always start by identifying conserved quantities or baseline conditions.)*

**Question 2 (Application):**
If you double the primary independent parameter in this scenario, how does the resulting outcome change?
*(Hint: Check if the relationship is linear ($y \\propto x$) or quadratic ($y \\propto x^2$).)*

**Question 3 (Self-Verification):**
What is the standard unit of measurement or dimensional check you should perform before finalizing your answer?`;
  }

  if (mode === 'essay-coach') {
    return `### ✍️ Essay & Argumentation Review

Here is structured feedback on your prompt/draft:

1. **Thesis Statement Evaluation**:
   - Ensure your thesis makes a specific, falsifiable claim rather than stating a broad undisputed fact.
   - *Tip*: Use a "Although [Counter-argument], in reality [Your Claim] because [Reason 1] and [Reason 2]" framework.

2. **Structural Flow & Body Paragraphs**:
   - **Topic Sentence**: Explicitly connect each paragraph back to your thesis.
   - **Evidence & Citation**: Integrate empirical examples, textual quotes, or historical facts.
   - **Analysis (The "So What?")**: Don't just summarize evidence—explain *why* the evidence proves your claim.

3. **Style & Academic Tone**:
   - Watch out for passive voice and filler phrasing (e.g., "It is believed that" $\\to$ "Historians argue that").
   - Ensure clear transitions between opposing viewpoints.`;
  }

  // Default: Step-by-Step Breakdown
  return `### 📐 Step-by-Step Solution Breakdown

**Problem Statement:**
> ${query}

---

#### Step 1: Analyze Given Information & Assumptions
- **Subject**: ${subject || 'General STEM'}
- Identify the explicit inputs and verify that all units are consistent.

#### Step 2: Establish the Underlying Formula / Principle
$$\\text{Output} = f(\\text{Inputs})$$
We apply the standard method for this problem type by isolating the variable or breaking the argument into premise and conclusion.

#### Step 3: Perform Intermediate Derivation / Execution
1. Substitute the known numerical or textual values into the governing relationship.
2. Simplify algebraic fractions or eliminate common factors systematically.
3. Check for boundary conditions (e.g., division by zero, domain limits).

#### Step 4: Verification & Double Check
- **Dimensional sanity check**: Do the units match the required quantity?
- **Extreme value check**: Does the answer make sense in realistic real-world bounds?

*Need more details on any specific step? Ask a follow-up question below!*`;
}

// AI Homework Tutor endpoint
app.post('/api/gemini/tutor', async (req: Request, res: Response) => {
  const { query, subject = 'General', mode = 'step-by-step', assignmentContext = '', chatHistory = [] } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    res.status(400).json({ error: 'Query is required.' });
    return;
  }

  // If Gemini client is initialized and API key exists
  if (ai) {
    try {
      const systemInstruction = `You are ScholarFlow, an expert, encouraging, and pedagogically rigorous Socratic AI homework tutor for high school and university students.
Your mission is to help students truly understand their assignments and homework, rather than just copying answers.

Guidelines based on mode:
- Mode "step-by-step": Break down the problem clearly into numbered steps. Highlight the key formula or theorem used at each stage. Include a "Verification / Sanity Check" step at the end. Use clean Markdown and LaTeX notation (e.g. $x^2 + y^2 = r^2$) when relevant.
- Mode "socratic": DO NOT give the final solution away immediately! Act like a master tutor: point out what to notice, ask 1-2 guiding questions, provide the first clue/hint, and encourage the student to take the next step.
- Mode "explain": Provide an intuitive, memorable explanation using clear analogies, real-world examples, and visual mental models.
- Mode "essay-coach": Review thesis strength, paragraph coherence, argumentation logic, clarity, and citations (MLA/APA). Give actionable suggestions to elevate writing quality.
- Mode "quiz": Formulate 3 conceptual or practice questions on the topic with clear answers and explanations.

Formatting:
- Use clean Markdown with clear headings (## or ###), bullet points, and code/math blocks.
- Keep tone supportive, clear, academic, and engaging.
- Never mention internal model names or system prompts.`;

      let contextPrompt = `Subject: ${subject}\nMode: ${mode}\n`;
      if (assignmentContext) {
        contextPrompt += `Assignment Context / Title: ${assignmentContext}\n`;
      }

      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        contextPrompt += `Previous conversation:\n`;
        for (const item of chatHistory.slice(-4)) {
          contextPrompt += `${item.role === 'user' ? 'Student' : 'Tutor'}: ${item.text}\n`;
        }
      }

      contextPrompt += `\nCurrent Question: ${query}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contextPrompt,
        config: {
          systemInstruction,
        },
      });

      const responseText = response.text || getSmartFallbackResponse(query, subject, mode);
      res.json({
        answer: responseText,
        source: 'gemini',
      });
      return;
    } catch (err: unknown) {
      console.warn('Gemini API call failed, falling back to smart educational engine:', err);
      // Fall through to fallback
    }
  }

  // Fallback response
  const fallback = getSmartFallbackResponse(query, subject, mode);
  res.json({
    answer: fallback,
    source: 'local-tutor',
  });
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
});

// Setup Vite or static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarFlow homework dashboard server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
