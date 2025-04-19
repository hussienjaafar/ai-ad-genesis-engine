
import { ContentType } from '../../models/Content';

class ResponseParser {
  public parseResponse(contentType: ContentType, response: string): Record<string, any> {
    try {
      // First try to parse as JSON
      try {
        return JSON.parse(response);
      } catch (e) {
        // If not valid JSON, use content type specific parsers
        switch (contentType) {
          case 'metaAdCopy':
            return this.parseFacebookResponse(response);
          case 'googleAdCopy':
            return this.parseGoogleResponse(response);
          case 'videoScript':
            return this.parseVideoScriptResponse(response);
          default:
            return { text: response };
        }
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return { text: response, parsingError: true };
    }
  }

  private parseFacebookResponse(response: string): Record<string, any> {
    const headlineMatch = response.match(/headline[:\s]+["']?([^"'\n]+)["']?/i);
    const primaryTextMatch = response.match(/primary text[:\s]+["']?([^"'\n]+)["']?/i);
    const ctaMatch = response.match(/call to action[:\s]+["']?([^"'\n]+)["']?/i);

    return {
      headline: headlineMatch?.[1] || 'Untitled Ad',
      primaryText: primaryTextMatch?.[1] || response,
      callToAction: ctaMatch?.[1] || 'Learn More',
    };
  }

  private parseGoogleResponse(response: string): Record<string, any> {
    const headlines: string[] = [];
    const descriptions: string[] = [];

    const headlineMatches = response.matchAll(/headline\s\d+[:\s]+["']?([^"'\n]+)["']?/gi);
    for (const match of headlineMatches) {
      if (match[1]) headlines.push(match[1]);
    }

    const descriptionMatches = response.matchAll(/description\s\d+[:\s]+["']?([^"'\n]+)["']?/gi);
    for (const match of descriptionMatches) {
      if (match[1]) descriptions.push(match[1]);
    }

    return {
      headlines: headlines.length > 0 ? headlines : ['Untitled Ad'],
      descriptions: descriptions.length > 0 ? descriptions : [response],
    };
  }

  private parseVideoScriptResponse(response: string): Record<string, any> {
    const titleMatch = response.match(/title[:\s]+["']?([^"'\n]+)["']?/i);
    const introMatch = response.match(/intro[:\s]+["']?([^"'\n]+)["']?/i);
    const mainContentMatch = response.match(/main content[:\s]+["']?([^"'\n]+)["']?/i);
    const ctaMatch = response.match(/call to action[:\s]+["']?([^"'\n]+)["']?/i);
    const visualNotesMatch = response.match(/visual notes[:\s]+["']?([^"'\n]+)["']?/i);

    return {
      title: titleMatch?.[1] || 'Untitled Video',
      intro: introMatch?.[1] || '',
      mainContent: mainContentMatch?.[1] || response,
      callToAction: ctaMatch?.[1] || 'Learn More',
      visualNotes: visualNotesMatch?.[1] || '',
    };
  }
}

export default new ResponseParser();
