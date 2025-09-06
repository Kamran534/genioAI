/**
 * Utility functions for formatting and structuring article content
 */

export interface StructuredArticle {
  title: string;
  content: string;
  excerpt: string;
  wordCount: number;
  readingTime: number;
  sections: ArticleSection[];
}

export interface ArticleSection {
  type: 'heading' | 'paragraph' | 'list' | 'quote' | 'image';
  content: string;
  level?: number; // for headings (1-6)
  items?: string[]; // for lists
}

/**
 * Parses raw article content and structures it into sections
 */
export function parseArticleContent(content: string): StructuredArticle {
  const lines = content.split('\n');
  const sections: ArticleSection[] = [];
  let currentParagraph = '';
  let wordCount = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      if (currentParagraph) {
        sections.push({
          type: 'paragraph',
          content: currentParagraph.trim()
        });
        wordCount += currentParagraph.split(/\s+/).length;
        currentParagraph = '';
      }
      continue;
    }

    // Check for headings
    if (trimmedLine.startsWith('# ')) {
      if (currentParagraph) {
        sections.push({
          type: 'paragraph',
          content: currentParagraph.trim()
        });
        wordCount += currentParagraph.split(/\s+/).length;
        currentParagraph = '';
      }
      sections.push({
        type: 'heading',
        content: trimmedLine.substring(2),
        level: 1
      });
      wordCount += trimmedLine.split(/\s+/).length;
    } else if (trimmedLine.startsWith('## ')) {
      if (currentParagraph) {
        sections.push({
          type: 'paragraph',
          content: currentParagraph.trim()
        });
        wordCount += currentParagraph.split(/\s+/).length;
        currentParagraph = '';
      }
      sections.push({
        type: 'heading',
        content: trimmedLine.substring(3),
        level: 2
      });
      wordCount += trimmedLine.split(/\s+/).length;
    } else if (trimmedLine.startsWith('### ')) {
      if (currentParagraph) {
        sections.push({
          type: 'paragraph',
          content: currentParagraph.trim()
        });
        wordCount += currentParagraph.split(/\s+/).length;
        currentParagraph = '';
      }
      sections.push({
        type: 'heading',
        content: trimmedLine.substring(4),
        level: 3
      });
      wordCount += trimmedLine.split(/\s+/).length;
    } else if (trimmedLine.startsWith('> ')) {
      if (currentParagraph) {
        sections.push({
          type: 'paragraph',
          content: currentParagraph.trim()
        });
        wordCount += currentParagraph.split(/\s+/).length;
        currentParagraph = '';
      }
      sections.push({
        type: 'quote',
        content: trimmedLine.substring(2)
      });
      wordCount += trimmedLine.split(/\s+/).length;
    } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      if (currentParagraph) {
        sections.push({
          type: 'paragraph',
          content: currentParagraph.trim()
        });
        wordCount += currentParagraph.split(/\s+/).length;
        currentParagraph = '';
      }
      // Collect list items
      const listItems: string[] = [];
      let currentIndex = lines.indexOf(line);
      while (currentIndex < lines.length) {
        const currentLine = lines[currentIndex].trim();
        if (currentLine.startsWith('- ') || currentLine.startsWith('* ')) {
          listItems.push(currentLine.substring(2));
          wordCount += currentLine.split(/\s+/).length;
          currentIndex++;
        } else if (currentLine === '') {
          currentIndex++;
        } else {
          break;
        }
      }
      sections.push({
        type: 'list',
        content: '',
        items: listItems
      });
    } else {
      currentParagraph += (currentParagraph ? ' ' : '') + trimmedLine;
    }
  }

  // Add final paragraph if exists
  if (currentParagraph) {
    sections.push({
      type: 'paragraph',
      content: currentParagraph.trim()
    });
    wordCount += currentParagraph.split(/\s+/).length;
  }

  // Extract title from first heading or first line
  let title = '';
  const firstHeading = sections.find(s => s.type === 'heading' && s.level === 1);
  if (firstHeading) {
    title = firstHeading.content;
  } else if (sections.length > 0 && sections[0].type === 'paragraph') {
    title = sections[0].content.substring(0, 100) + (sections[0].content.length > 100 ? '...' : '');
  }

  // Create excerpt from first paragraph
  const firstParagraph = sections.find(s => s.type === 'paragraph');
  const excerpt = firstParagraph ? firstParagraph.content.substring(0, 160) + (firstParagraph.content.length > 160 ? '...' : '') : '';

  return {
    title,
    content,
    excerpt,
    wordCount,
    readingTime: Math.ceil(wordCount / 200),
    sections
  };
}

/**
 * Converts structured article to HTML
 */
export function structuredArticleToHTML(article: StructuredArticle): string {
  let html = '';
  
  for (const section of article.sections) {
    switch (section.type) {
      case 'heading':
        const level = section.level || 1;
        html += `<h${level}>${section.content}</h${level}>\n`;
        break;
      case 'paragraph':
        html += `<p>${section.content}</p>\n`;
        break;
      case 'list':
        if (section.items) {
          html += '<ul>\n';
          for (const item of section.items) {
            html += `<li>${item}</li>\n`;
          }
          html += '</ul>\n';
        }
        break;
      case 'quote':
        html += `<blockquote>${section.content}</blockquote>\n`;
        break;
    }
  }
  
  return html;
}

/**
 * Converts structured article to plain text with formatting
 */
export function structuredArticleToText(article: StructuredArticle): string {
  let text = '';
  
  for (const section of article.sections) {
    switch (section.type) {
      case 'heading':
        const level = section.level || 1;
        const prefix = '#'.repeat(level);
        text += `${prefix} ${section.content}\n\n`;
        break;
      case 'paragraph':
        text += `${section.content}\n\n`;
        break;
      case 'list':
        if (section.items) {
          for (const item of section.items) {
            text += `• ${item}\n`;
          }
          text += '\n';
        }
        break;
      case 'quote':
        text += `> ${section.content}\n\n`;
        break;
    }
  }
  
  return text;
}

/**
 * Extracts SEO keywords from article content
 */
export function extractSEOKeywords(content: string, maxKeywords: number = 10): string[] {
  // Simple keyword extraction - in production, you'd want more sophisticated NLP
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const wordCount: { [key: string]: number } = {};
  for (const word of words) {
    wordCount[word] = (wordCount[word] || 0) + 1;
  }
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Calculates SEO score based on content
 */
export function calculateSEOScore(article: StructuredArticle): number {
  let score = 0;
  
  // Title length (optimal: 30-60 characters)
  if (article.title.length >= 30 && article.title.length <= 60) {
    score += 25;
  } else if (article.title.length > 0) {
    score += 15;
  }
  
  // Content length (optimal: 300+ words)
  if (article.wordCount >= 300) {
    score += 25;
  } else if (article.wordCount >= 150) {
    score += 15;
  }
  
  // Has headings
  const hasHeadings = article.sections.some(s => s.type === 'heading');
  if (hasHeadings) {
    score += 20;
  }
  
  // Has lists
  const hasLists = article.sections.some(s => s.type === 'list');
  if (hasLists) {
    score += 15;
  }
  
  // Has quotes
  const hasQuotes = article.sections.some(s => s.type === 'quote');
  if (hasQuotes) {
    score += 10;
  }
  
  // Excerpt quality
  if (article.excerpt.length >= 120 && article.excerpt.length <= 160) {
    score += 5;
  }
  
  return Math.min(score, 100);
}
