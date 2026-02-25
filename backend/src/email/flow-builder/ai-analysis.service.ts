import { Injectable } from '@nestjs/common';
import { EmailAnalysisResult } from './types/flow.types';
import { FlowContext } from './types/flow.types';
import { EmailFlow } from './flow.schema';

@Injectable()
export class AIAnalysisService {
  async analyzeEmailContent(
    emailContent: string,
    context: FlowContext,
    flow: EmailFlow,
  ): Promise<EmailAnalysisResult> {
    const analysisPrompt = `
      Analyze the following email content and extract:
      1. Intent - What is the user trying to accomplish? (e.g., request information, ask question, schedule meeting)
      2. Sentiment - Is the tone positive, negative, or neutral?
      3. Key Questions - What specific questions is the user asking?
      4. Next Steps - What should be the appropriate response?
      5. Lead Quality - Is this a qualified lead? (High/Medium/Low)

      Email Content: ${emailContent}
    `;

    try {
      let analysis;

      switch (flow.aiApiSource) {
        case 'user':
          // For user AI source, we'll use default analysis for now
          analysis = `Intent: general_inquiry
Sentiment: neutral
Key Questions: []
Next Steps: Respond with general information
Lead Quality: medium`;
          break;

        case 'custom':
          // Use custom API key provided in flow settings
          analysis = await this.generateTextWithCustomApi(
            analysisPrompt,
            flow.customApiKey,
            flow.customApiProvider,
          );
          break;

        case 'platform':
        default:
          // Use platform-provided API key
          analysis = await this.generateTextWithPlatformApi(analysisPrompt);
          break;
      }

      // Parse AI response
      const result = this.parseAnalysisResult(analysis);

      return {
        intent: result.intent,
        sentiment: result.sentiment,
        keyQuestions: result.keyQuestions,
        nextSteps: result.nextSteps,
        leadQuality: result.leadQuality,
        rawAnalysis: analysis,
      };
    } catch (error) {
      // Fallback to default analysis if AI fails
      return {
        intent: 'general_inquiry',
        sentiment: 'neutral',
        keyQuestions: [],
        nextSteps: 'Respond with general information',
        leadQuality: 'medium',
        rawAnalysis: 'AI analysis failed, using default values',
      };
    }
  }

  private async generateTextWithCustomApi(
    prompt: string,
    apiKey?: string,
    provider?: string,
  ): Promise<string> {
    // This method would implement custom API calls to OpenAI, Gemini, Anthropic, etc.
    return `Intent: general_inquiry
Sentiment: neutral
Key Questions: []
Next Steps: Respond with general information
Lead Quality: medium`;
  }

  private async generateTextWithPlatformApi(prompt: string): Promise<string> {
    // This method would implement platform API calls
    return `Intent: general_inquiry
Sentiment: neutral
Key Questions: []
Next Steps: Respond with general information
Lead Quality: medium`;
  }

  private parseAnalysisResult(analysis: string): any {
    // Parse the AI analysis result
    const result: any = {};

    // Extract intent
    const intentMatch = analysis.match(/Intent: (.*)/);
    if (intentMatch) {
      result.intent = intentMatch[1].trim().toLowerCase();
    }

    // Extract sentiment
    const sentimentMatch = analysis.match(/Sentiment: (.*)/);
    if (sentimentMatch) {
      result.sentiment = sentimentMatch[1].trim().toLowerCase();
    }

    // Extract key questions
    const keyQuestionsMatch = analysis.match(/Key Questions: (.*)/);
    if (keyQuestionsMatch) {
      try {
        result.keyQuestions = JSON.parse(keyQuestionsMatch[1].trim());
      } catch (error) {
        result.keyQuestions = [];
      }
    }

    // Extract next steps
    const nextStepsMatch = analysis.match(/Next Steps: (.*)/);
    if (nextStepsMatch) {
      result.nextSteps = nextStepsMatch[1].trim();
    }

    // Extract lead quality
    const leadQualityMatch = analysis.match(/Lead Quality: (.*)/);
    if (leadQualityMatch) {
      result.leadQuality = leadQualityMatch[1].trim().toLowerCase();
    }

    return result;
  }
}
