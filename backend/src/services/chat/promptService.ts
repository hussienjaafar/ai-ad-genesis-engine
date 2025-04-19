
import fs from 'fs';
import path from 'path';
import { IBusiness } from '../../models/Business';

class PromptService {
  private systemPromptTemplate: any;

  constructor() {
    this.systemPromptTemplate = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../prompts/refinement/systemPrompt.json'), 'utf8')
    );
  }

  public buildSystemPrompt(businessName: string, context: string): string {
    const { refinementMode } = this.systemPromptTemplate;
    
    let systemPrompt = `${refinementMode.instructions}\n\n`;
    systemPrompt += `Business Name: ${businessName}\n\n`;
    
    systemPrompt += 'REFINEMENT GUIDELINES:\n';
    refinementMode.refinementGuidelines.forEach((guideline: string, index: number) => {
      systemPrompt += `${index + 1}. ${guideline}\n`;
    });
    systemPrompt += '\n';
    
    systemPrompt += 'RESPONSE GUIDELINES:\n';
    refinementMode.responseGuidelines.forEach((guideline: string, index: number) => {
      systemPrompt += `${index + 1}. ${guideline}\n`;
    });
    systemPrompt += '\n';
    
    if (context) {
      systemPrompt += 'CONTEXT:\n' + context + '\n';
    }
    
    return systemPrompt;
  }
}

export default new PromptService();
