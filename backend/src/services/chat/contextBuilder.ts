
import { Types } from 'mongoose';
import { IChatSession } from '../../models/ChatSession';
import MediaAssetModel from '../../models/MediaAsset';
import InsightService from '../insightService';
import ContentModel from '../../models/Content';

class ContextBuilder {
  public async buildContextForSession(chatSession: IChatSession): Promise<string> {
    let context = '';

    // Add media context if available
    if (chatSession.mediaId) {
      const media = await MediaAssetModel.findById(chatSession.mediaId);
      if (media) {
        context += '### MEDIA CONTEXT:\n';
        
        if (media.assetType === 'video' && media.transcript) {
          context += `Video Transcript: ${media.transcript}\n`;
        }
        
        if (media.detectedText && media.detectedText.length > 0) {
          context += `Detected Text: ${media.detectedText.join(' ')}\n`;
        }
        
        if (media.labels && media.labels.length > 0) {
          context += `Visual Elements: ${media.labels.map((label: any) => 
            `${label.name} (${Math.round(label.confidence * 100)}%)`).join(', ')}\n`;
        }
        
        if (media.toneAnalysis) {
          context += 'Tone Analysis: ';
          for (const [tone, score] of Object.entries(media.toneAnalysis)) {
            context += `${tone}: ${score}, `;
          }
          context = context.slice(0, -2) + '\n';
        }
      }
    }

    // Add insight context if available
    if (chatSession.insightId) {
      try {
        const elementSnippet = await InsightService.getElementSnippet(chatSession.insightId.toString());
        if (elementSnippet) {
          context += '### PERFORMANCE INSIGHT CONTEXT:\n';
          context += `High-Performing Element: "${elementSnippet}"\n`;
        }
      } catch (error) {
        console.error('Error fetching insight data:', error);
      }
    }

    // Add original content if available
    if (chatSession.originalContentId) {
      const content = await ContentModel.findById(chatSession.originalContentId);
      if (content) {
        context += '### ORIGINAL CONTENT:\n';
        context += `Content Type: ${content.contentType}\n`;
        context += `Content: ${JSON.stringify(content.parsedContent)}\n`;
      }
    }

    return context;
  }
}

export default new ContextBuilder();
