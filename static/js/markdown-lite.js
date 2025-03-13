/**
 * Markdown-Lite.js
 * A lightweight markdown parser for the ReAct Agent Chat
 */

class MarkdownLite {
    /**
     * Parse markdown text to HTML
     * @param {string} text - The markdown text to parse
     * @returns {string} - The HTML representation
     */
    static parse(text) {
        if (!text) return '';
        
        // Process code blocks first (```code```)
        text = this.parseCodeBlocks(text);
        
        // Process inline code (`code`)
        text = this.parseInlineCode(text);
        
        // Process bold (**text**)
        text = this.parseBold(text);
        
        // Process italic (*text*)
        text = this.parseItalic(text);
        
        // Process links [text](url)
        text = this.parseLinks(text);
        
        // Process lists
        text = this.parseLists(text);
        
        // Process paragraphs and line breaks
        text = this.parseParagraphs(text);
        
        return text;
    }
    
    /**
     * Parse code blocks
     */
    static parseCodeBlocks(text) {
        const codeBlockRegex = /```(?:([\w-]+)\n)?([\s\S]*?)```/g;
        
        return text.replace(codeBlockRegex, (match, language, code) => {
            language = language || 'plaintext';
            
            // Escape HTML in the code
            code = this.escapeHtml(code.trim());
            
            return `<pre class="code-block ${language}"><code>${code}</code></pre>`;
        });
    }
    
    /**
     * Parse inline code
     */
    static parseInlineCode(text) {
        return text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    }
    
    /**
     * Parse bold text
     */
    static parseBold(text) {
        return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    }
    
    /**
     * Parse italic text
     */
    static parseItalic(text) {
        return text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    }
    
    /**
     * Parse links
     */
    static parseLinks(text) {
        return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-secondary-600 hover:text-secondary-800 underline">$1</a>');
    }
    
    /**
     * Parse unordered and ordered lists
     */
    static parseLists(text) {
        // Split by lines
        const lines = text.split('\n');
        let inList = false;
        let listType = null;
        let result = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check for unordered list item
            if (line.trim().match(/^[-*] (.+)$/)) {
                if (!inList || listType !== 'ul') {
                    // Start a new list if not in one or if switching types
                    if (inList) result.push('</ol>');
                    result.push('<ul class="list-disc pl-5 my-2">');
                    inList = true;
                    listType = 'ul';
                }
                
                // Add the list item
                const content = line.trim().replace(/^[-*] (.+)$/, '$1');
                result.push(`<li>${content}</li>`);
            }
            // Check for ordered list item
            else if (line.trim().match(/^\d+\. (.+)$/)) {
                if (!inList || listType !== 'ol') {
                    // Start a new list if not in one or if switching types
                    if (inList) result.push('</ul>');
                    result.push('<ol class="list-decimal pl-5 my-2">');
                    inList = true;
                    listType = 'ol';
                }
                
                // Add the list item
                const content = line.trim().replace(/^\d+\. (.+)$/, '$1');
                result.push(`<li>${content}</li>`);
            }
            else {
                // Not a list item, close any open list
                if (inList) {
                    result.push(listType === 'ul' ? '</ul>' : '</ol>');
                    inList = false;
                    listType = null;
                }
                
                // Add the line as is
                result.push(line);
            }
        }
        
        // Close any open list at the end
        if (inList) {
            result.push(listType === 'ul' ? '</ul>' : '</ol>');
        }
        
        return result.join('\n');
    }
    
    /**
     * Parse paragraphs and line breaks
     */
    static parseParagraphs(text) {
        // Split by double newlines (paragraphs)
        const paragraphs = text.split(/\n\n+/);
        
        return paragraphs.map(p => {
            // Skip if it's already a special element
            if (p.trim().startsWith('<pre') || 
                p.trim().startsWith('<ul') || 
                p.trim().startsWith('<ol') ||
                p.trim().startsWith('<h')) {
                return p;
            }
            
            // Handle single line breaks
            const withLineBreaks = p.replace(/\n/g, '<br>');
            
            // Wrap in paragraph tag if not empty
            return p.trim() ? `<p>${withLineBreaks}</p>` : '';
        }).join('\n');
    }
    
    /**
     * Escape HTML special characters
     */
    static escapeHtml(text) {
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, match => escapeMap[match]);
    }
}
