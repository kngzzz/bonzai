/**
 * ReAct Agent Chat - Thinking Process Visualization
 * Handles the display and interaction with the agent's thinking process
 */

class ThinkingProcessManager {
    constructor() {
        // DOM elements
        this.thinkingProcessDiv = document.getElementById('thinking-process');
        this.timelineTrack = document.querySelector('.timeline-track');
        this.collapseAllBtn = document.getElementById('collapse-all');
        this.expandAllBtn = document.getElementById('expand-all');
        
        // State
        this.entries = [];
        this.isProcessing = false;
        
        // Initialize
        this.init();
    }
    
    init() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Set up SSE connection for thinking logs
        this.setupSSEConnection();
        
        console.log('Thinking Process Manager initialized');
    }
    
    setupEventListeners() {
        // Collapse all thinking entries
        this.collapseAllBtn.addEventListener('click', () => {
            document.querySelectorAll('.thinking-entry.expanded').forEach(entry => {
                this.toggleThinkingEntry(entry);
            });
        });
        
        // Expand all thinking entries
        this.expandAllBtn.addEventListener('click', () => {
            document.querySelectorAll('.thinking-entry:not(.expanded)').forEach(entry => {
                this.toggleThinkingEntry(entry);
            });
        });
    }
    
    setupSSEConnection() {
        // The main SSE connection is already established in the main script
        // We just need to listen for the 'log' event type and handle it
        
        // This is a workaround to hook into the existing SSE connection
        // We'll override the existing onmessage handler to also handle thinking logs
        const originalOnMessage = EventSource.prototype.onmessage;
        
        EventSource.prototype.onmessage = function(event) {
            // Call the original handler
            if (originalOnMessage) {
                originalOnMessage.call(this, event);
            }
            
            // Our custom handling for thinking logs
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'log') {
                    const thinkingManager = window.thinkingManager;
                    if (thinkingManager) {
                        thinkingManager.appendThinkingLog(data.content);
                    }
                }
            } catch (error) {
                console.error('Error processing SSE message:', error);
            }
        };
    }
    
    clearThinkingProcess() {
        this.thinkingProcessDiv.innerHTML = '';
        this.timelineTrack.innerHTML = '';
        this.entries = [];
        this.isProcessing = false;
    }
    
    appendThinkingLog(content) {
        // If this is the first entry, clear the placeholder
        if (this.thinkingProcessDiv.querySelector('.text-neutral-400')) {
            this.thinkingProcessDiv.innerHTML = '';
        }
        
        // Set processing state
        this.isProcessing = true;
        
        // Create thinking entry
        const entryDiv = document.createElement('div');
        entryDiv.className = 'thinking-entry bg-white rounded-md shadow-sm border border-neutral-200 overflow-hidden fade-in expanded';
        
        // Create header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'thinking-header flex justify-between items-center p-2 bg-neutral-50 border-b border-neutral-200 cursor-pointer';
        headerDiv.addEventListener('click', () => this.toggleThinkingEntry(entryDiv));
        
        // Add timestamp and type indicator
        const timestamp = document.createElement('span');
        timestamp.className = 'text-xs text-neutral-500';
        timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const typeIndicator = document.createElement('span');
        typeIndicator.className = 'text-xs font-medium px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-800';
        
        // Determine the type of thinking from the content
        if (content.includes('SEARCH')) {
            typeIndicator.textContent = 'Search';
            typeIndicator.className = 'text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800';
        } else if (content.includes('DECISION')) {
            typeIndicator.textContent = 'Decision';
            typeIndicator.className = 'text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-800';
        } else if (content.includes('ERROR') || content.includes('error')) {
            typeIndicator.textContent = 'Error';
            typeIndicator.className = 'text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800';
        } else if (content.includes('TOOL')) {
            typeIndicator.textContent = 'Tool Use';
            typeIndicator.className = 'text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800';
        } else if (content.includes('✨ Manus\'s thoughts:')) {
            typeIndicator.textContent = 'Thinking';
            content = content.replace('✨ Manus\'s thoughts:', '<strong>Thinking:</strong>');
        } else if (content.includes('🛠️ Manus selected')) {
            typeIndicator.textContent = 'Planning';
            content = content.replace('🛠️ Manus selected', '<strong>Planning:</strong> Selected');
        } else if (content.includes('🧰 Tools being prepared:')) {
            typeIndicator.textContent = 'Preparation';
            content = content.replace('🧰 Tools being prepared:', '<strong>Preparing tools:</strong>');
        } else if (content.includes('🔧 Activating tool:')) {
            typeIndicator.textContent = 'Tool Activation';
            content = content.replace('🔧 Activating tool:', '<strong>Activating tool:</strong>');
        } else if (content.includes('🎯 Tool')) {
            typeIndicator.textContent = 'Tool Result';
            content = content.replace('🎯 Tool', '<strong>Tool</strong>');
        } else {
            typeIndicator.textContent = 'Thinking';
        }
        
        headerDiv.appendChild(typeIndicator);
        headerDiv.appendChild(timestamp);
        
        // Create content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'thinking-content p-3 font-mono text-xs whitespace-pre-wrap';
        
        // Parse markdown in the content
        if (content.includes('```') || content.includes('`') || content.includes('*') || content.includes('[') || content.includes('<strong>')) {
            try {
                contentDiv.innerHTML = window.MarkdownLite ? window.MarkdownLite.parse(content) : content;
                
                // Apply syntax highlighting to code blocks
                setTimeout(() => {
                    const codeBlocks = contentDiv.querySelectorAll('pre.code-block code');
                    codeBlocks.forEach(block => {
                        if (window.Prism) {
                            window.Prism.highlightElement(block);
                        }
                    });
                }, 0);
            } catch (error) {
                console.error('Error parsing markdown:', error);
                contentDiv.textContent = content;
            }
        } else {
            contentDiv.textContent = content;
        }
        
        entryDiv.appendChild(headerDiv);
        entryDiv.appendChild(contentDiv);
        
        this.thinkingProcessDiv.appendChild(entryDiv);
        this.thinkingProcessDiv.scrollTop = this.thinkingProcessDiv.scrollHeight;
        
        // Add timeline marker
        this.addTimelineMarker(typeIndicator.textContent);
        
        // Store entry
        this.entries.push({
            element: entryDiv,
            type: typeIndicator.textContent,
            timestamp: new Date(),
            content: content
        });
    }
    
    toggleThinkingEntry(entry) {
        const content = entry.querySelector('.thinking-content');
        
        if (entry.classList.contains('expanded')) {
            content.style.display = 'none';
            entry.classList.remove('expanded');
        } else {
            content.style.display = 'block';
            entry.classList.add('expanded');
        }
    }
    
    addTimelineMarker(type) {
        const totalMarkers = this.timelineTrack.querySelectorAll('.timeline-marker').length;
        
        // Calculate position (0-100%)
        const position = totalMarkers === 0 ? 0 : Math.min(totalMarkers * 10, 95);
        
        const marker = document.createElement('div');
        marker.className = 'timeline-marker';
        marker.style.left = `${position}%`;
        
        // Color based on type
        switch(type) {
            case 'Search':
                marker.style.backgroundColor = '#3b82f6'; // blue
                break;
            case 'Decision':
                marker.style.backgroundColor = '#8b5cf6'; // purple
                break;
            case 'Error':
                marker.style.backgroundColor = '#ef4444'; // red
                break;
            case 'Tool Use':
            case 'Tool Activation':
            case 'Tool Result':
                marker.style.backgroundColor = '#10b981'; // green
                break;
            case 'Planning':
            case 'Preparation':
                marker.style.backgroundColor = '#f59e0b'; // amber
                break;
            default:
                marker.style.backgroundColor = '#8b5cf6'; // default purple
        }
        
        // Add tooltip
        marker.title = `${type} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
        
        this.timelineTrack.appendChild(marker);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.thinkingManager = new ThinkingProcessManager();
});
