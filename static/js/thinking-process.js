/**
 * ReAct Agent Chat - Enhanced Thinking Process Visualization
 * Handles the display and interaction with the agent's thinking process
 * with advanced visualization features
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
        this.thinkingStages = [];
        this.currentStage = null;
        this.stageStartTime = null;
        
        // Thinking stage colors
        this.stageColors = {
            'Thinking': { bg: '#f5f3ff', border: '#ddd6fe', icon: '#8b5cf6' },
            'Planning': { bg: '#fff7ed', border: '#fed7aa', icon: '#f59e0b' },
            'Search': { bg: '#eff6ff', border: '#bfdbfe', icon: '#3b82f6' },
            'Decision': { bg: '#f5f3ff', border: '#e9d5ff', icon: '#8b5cf6' },
            'Tool Use': { bg: '#ecfdf5', border: '#a7f3d0', icon: '#10b981' },
            'Tool Activation': { bg: '#ecfdf5', border: '#a7f3d0', icon: '#10b981' },
            'Tool Result': { bg: '#ecfdf5', border: '#a7f3d0', icon: '#10b981' },
            'Preparation': { bg: '#fffbeb', border: '#fde68a', icon: '#f59e0b' },
            'Error': { bg: '#fef2f2', border: '#fecaca', icon: '#ef4444' }
        };
        
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
        // Create a global message handler function
        window.handleThinkingProcessMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'log') {
                    // Process thinking logs
                    if (window.thinkingManager) {
                        window.thinkingManager.appendThinkingLog(data.content);
                    }
                }
            } catch (error) {
                console.error('Error processing SSE message:', error);
            }
        };
        
        // Add our handler to any existing EventSource
        document.addEventListener('DOMContentLoaded', () => {
            // Wait a short time to ensure the main script has created the EventSource
            setTimeout(() => {
                // Find any existing EventSource instances
                if (window.eventSource) {
                    window.eventSource.addEventListener('message', window.handleThinkingProcessMessage);
                }
            }, 500);
        });
        
        // Patch the EventSource constructor to add our handler to any new instances
        const originalEventSource = window.EventSource;
        
        if (originalEventSource) {
            window.EventSource = function(...args) {
                const instance = new originalEventSource(...args);
                
                // Add our message handler
                instance.addEventListener('message', window.handleThinkingProcessMessage);
                
                return instance;
            };
            
            // Copy prototype and properties
            window.EventSource.prototype = originalEventSource.prototype;
            Object.defineProperties(window.EventSource, Object.getOwnPropertyDescriptors(originalEventSource));
        }
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
        
        // Determine the type of thinking from the content
        let thinkingType = 'Thinking';
        let processedContent = content;
        
        if (content.includes('SEARCH')) {
            thinkingType = 'Search';
        } else if (content.includes('DECISION')) {
            thinkingType = 'Decision';
        } else if (content.includes('ERROR') || content.includes('error')) {
            thinkingType = 'Error';
        } else if (content.includes('TOOL')) {
            thinkingType = 'Tool Use';
        } else if (content.includes('✨ Manus\'s thoughts:')) {
            thinkingType = 'Thinking';
            processedContent = content.replace('✨ Manus\'s thoughts:', '<strong>Thinking:</strong>');
        } else if (content.includes('🛠️ Manus selected')) {
            thinkingType = 'Planning';
            processedContent = content.replace('🛠️ Manus selected', '<strong>Planning:</strong> Selected');
        } else if (content.includes('🧰 Tools being prepared:')) {
            thinkingType = 'Preparation';
            processedContent = content.replace('🧰 Tools being prepared:', '<strong>Preparing tools:</strong>');
        } else if (content.includes('🔧 Activating tool:')) {
            thinkingType = 'Tool Activation';
            processedContent = content.replace('🔧 Activating tool:', '<strong>Activating tool:</strong>');
        } else if (content.includes('🎯 Tool')) {
            thinkingType = 'Tool Result';
            processedContent = content.replace('🎯 Tool', '<strong>Tool</strong>');
        }
        
        // Check if this is a new thinking stage
        if (this.currentStage !== thinkingType) {
            this.startNewThinkingStage(thinkingType);
        }
        
        // Get colors for this thinking type
        const colors = this.stageColors[thinkingType] || this.stageColors['Thinking'];
        
        // Create thinking entry
        const entryDiv = document.createElement('div');
        entryDiv.className = 'thinking-entry rounded-md shadow-sm overflow-hidden fade-in expanded';
        entryDiv.style.backgroundColor = 'white';
        entryDiv.style.borderWidth = '1px';
        entryDiv.style.borderStyle = 'solid';
        entryDiv.style.borderColor = colors.border;
        entryDiv.style.marginBottom = '0.75rem';
        
        // Create header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'thinking-header flex justify-between items-center p-2 cursor-pointer';
        headerDiv.style.backgroundColor = colors.bg;
        headerDiv.style.borderBottomWidth = '1px';
        headerDiv.style.borderBottomStyle = 'solid';
        headerDiv.style.borderBottomColor = colors.border;
        headerDiv.addEventListener('click', () => this.toggleThinkingEntry(entryDiv));
        
        // Create left side of header with icon and type
        const headerLeft = document.createElement('div');
        headerLeft.className = 'flex items-center';
        
        // Add icon based on thinking type
        const icon = document.createElement('div');
        icon.className = 'mr-2 flex-shrink-0';
        icon.innerHTML = this.getIconForThinkingType(thinkingType);
        icon.style.color = colors.icon;
        
        // Add type indicator
        const typeIndicator = document.createElement('span');
        typeIndicator.className = 'text-xs font-medium px-2 py-0.5 rounded-full';
        typeIndicator.textContent = thinkingType;
        typeIndicator.style.backgroundColor = colors.bg;
        typeIndicator.style.color = colors.icon;
        typeIndicator.style.borderWidth = '1px';
        typeIndicator.style.borderStyle = 'solid';
        typeIndicator.style.borderColor = colors.border;
        
        headerLeft.appendChild(icon);
        headerLeft.appendChild(typeIndicator);
        
        // Add timestamp
        const timestamp = document.createElement('span');
        timestamp.className = 'text-xs text-neutral-500';
        timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        headerDiv.appendChild(headerLeft);
        headerDiv.appendChild(timestamp);
        
        // Create content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'thinking-content p-3 font-mono text-xs whitespace-pre-wrap line-numbers';
        
        // Detect and format code blocks
        this.formatContentWithCodeHighlighting(contentDiv, processedContent);
        
        entryDiv.appendChild(headerDiv);
        entryDiv.appendChild(contentDiv);
        
        // Add to the current stage container
        const stageContainer = document.getElementById(`thinking-stage-${this.currentStage.replace(/\s+/g, '-').toLowerCase()}`);
        if (stageContainer) {
            const entriesContainer = stageContainer.querySelector('.thinking-stage-entries');
            entriesContainer.appendChild(entryDiv);
        } else {
            // Fallback to adding directly to the thinking process div
            this.thinkingProcessDiv.appendChild(entryDiv);
        }
        
        this.thinkingProcessDiv.scrollTop = this.thinkingProcessDiv.scrollHeight;
        
        // Add timeline marker
        this.addTimelineMarker(thinkingType);
        
        // Store entry
        this.entries.push({
            element: entryDiv,
            type: thinkingType,
            timestamp: new Date(),
            content: processedContent,
            stageId: this.currentStage
        });
    }
    
    startNewThinkingStage(stageName) {
        // If there was a previous stage, calculate its duration
        if (this.currentStage && this.stageStartTime) {
            const duration = new Date() - this.stageStartTime;
            console.log(`Stage ${this.currentStage} completed in ${duration}ms`);
        }
        
        // Set the new stage
        this.currentStage = stageName;
        this.stageStartTime = new Date();
        
        // Add this stage to our list if it's not already there
        if (!this.thinkingStages.includes(stageName)) {
            this.thinkingStages.push(stageName);
        }
        
        // Create a container for this stage if it doesn't exist
        const stageId = `thinking-stage-${stageName.replace(/\s+/g, '-').toLowerCase()}`;
        if (!document.getElementById(stageId)) {
            const colors = this.stageColors[stageName] || this.stageColors['Thinking'];
            
            const stageContainer = document.createElement('div');
            stageContainer.id = stageId;
            stageContainer.className = 'thinking-stage mb-4';
            
            // Create stage header
            const stageHeader = document.createElement('div');
            stageHeader.className = 'thinking-stage-header flex items-center justify-between p-2 rounded-t-md cursor-pointer';
            stageHeader.style.backgroundColor = colors.bg;
            stageHeader.style.borderWidth = '1px';
            stageHeader.style.borderStyle = 'solid';
            stageHeader.style.borderColor = colors.border;
            
            // Add stage title with icon
            const stageTitle = document.createElement('div');
            stageTitle.className = 'flex items-center';
            
            const stageIcon = document.createElement('div');
            stageIcon.className = 'mr-2';
            stageIcon.innerHTML = this.getIconForThinkingType(stageName);
            stageIcon.style.color = colors.icon;
            
            const stageTitleText = document.createElement('span');
            stageTitleText.className = 'font-medium text-sm';
            stageTitleText.textContent = `${stageName} Stage`;
            stageTitleText.style.color = colors.icon;
            
            stageTitle.appendChild(stageIcon);
            stageTitle.appendChild(stageTitleText);
            
            // Add collapse/expand button
            const collapseBtn = document.createElement('button');
            collapseBtn.className = 'text-neutral-500 hover:text-neutral-700';
            collapseBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            `;
            
            collapseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const entriesContainer = stageContainer.querySelector('.thinking-stage-entries');
                if (entriesContainer.style.display === 'none') {
                    entriesContainer.style.display = 'block';
                    collapseBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    `;
                } else {
                    entriesContainer.style.display = 'none';
                    collapseBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                        </svg>
                    `;
                }
            });
            
            stageHeader.appendChild(stageTitle);
            stageHeader.appendChild(collapseBtn);
            
            // Create entries container
            const entriesContainer = document.createElement('div');
            entriesContainer.className = 'thinking-stage-entries';
            
            stageContainer.appendChild(stageHeader);
            stageContainer.appendChild(entriesContainer);
            
            this.thinkingProcessDiv.appendChild(stageContainer);
        }
    }
    
    formatContentWithCodeHighlighting(contentDiv, content) {
        // Check if content contains code blocks or markdown
        if (content.includes('```') || content.includes('`') || content.includes('*') || content.includes('[') || content.includes('<strong>')) {
            try {
                // Parse markdown
                contentDiv.innerHTML = window.MarkdownLite ? window.MarkdownLite.parse(content) : content;
                
                // Find and enhance code blocks
                setTimeout(() => {
                    // Apply Prism.js syntax highlighting
                    const codeBlocks = contentDiv.querySelectorAll('pre.code-block code');
                    codeBlocks.forEach(block => {
                        // Add line numbers class to parent
                        if (block.parentElement) {
                            block.parentElement.classList.add('line-numbers');
                        }
                        
                        // Try to detect language if not specified
                        if (!block.className.includes('language-')) {
                            const language = this.detectCodeLanguage(block.textContent);
                            if (language) {
                                block.className = `language-${language}`;
                            }
                        }
                        
                        // Apply syntax highlighting
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
    }
    
    detectCodeLanguage(code) {
        // Simple language detection based on keywords and syntax
        if (code.includes('function') || code.includes('const ') || code.includes('let ') || code.includes('var ') || code.includes('=>')) {
            return 'javascript';
        } else if (code.includes('def ') || code.includes('import ') || code.includes('class ') && code.includes(':')) {
            return 'python';
        } else if (code.includes('<html') || code.includes('</div>') || code.includes('<body')) {
            return 'html';
        } else if (code.includes('{') && code.includes('}') && (code.includes(':') || code.includes(';'))) {
            // Could be CSS, JSON, or other C-like language
            if (code.includes('.css') || code.includes('margin:') || code.includes('padding:')) {
                return 'css';
            } else if (code.includes('"') && code.includes(':') && !code.includes(';')) {
                return 'json';
            } else {
                return 'clike';
            }
        }
        return null;
    }
    
    getIconForThinkingType(type) {
        // Return SVG icon based on thinking type
        switch(type) {
            case 'Thinking':
                return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                </svg>`;
            case 'Planning':
                return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>`;
            case 'Search':
                return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>`;
            case 'Decision':
                return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>`;
            case 'Tool Use':
            case 'Tool Activation':
            case 'Tool Result':
                return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>`;
            case 'Preparation':
                return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                </svg>`;
            case 'Error':
                return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>`;
            default:
                return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
                </svg>`;
        }
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
        // Clear the timeline if this is the first marker of a new session
        if (this.entries.length === 0 && this.timelineTrack.querySelectorAll('.timeline-marker').length > 0) {
            this.timelineTrack.innerHTML = '';
        }
        
        const totalMarkers = this.timelineTrack.querySelectorAll('.timeline-marker').length;
        const currentTime = new Date();
        
        // Calculate position (0-100%)
        const position = totalMarkers === 0 ? 0 : Math.min(totalMarkers * 10, 95);
        
        // Get colors for this thinking type
        const colors = this.stageColors[type] || this.stageColors['Thinking'];
        
        // Create marker container
        const markerContainer = document.createElement('div');
        markerContainer.className = 'timeline-marker-container';
        markerContainer.style.position = 'absolute';
        markerContainer.style.left = `${position}%`;
        markerContainer.style.bottom = '0';
        markerContainer.style.transform = 'translateX(-50%)';
        
        // Create marker
        const marker = document.createElement('div');
        marker.className = 'timeline-marker';
        marker.style.width = '12px';
        marker.style.height = '12px';
        marker.style.borderRadius = '50%';
        marker.style.backgroundColor = colors.icon;
        marker.style.border = '2px solid white';
        marker.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2)';
        marker.style.cursor = 'pointer';
        marker.style.zIndex = '10';
        marker.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'timeline-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.bottom = '20px';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '4px 8px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '10px';
        tooltip.style.whiteSpace = 'nowrap';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.2s ease';
        tooltip.textContent = `${type} at ${currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
        
        // Add hover effects
        markerContainer.addEventListener('mouseenter', () => {
            marker.style.transform = 'scale(1.5)';
            marker.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
            tooltip.style.opacity = '1';
        });
        
        markerContainer.addEventListener('mouseleave', () => {
            marker.style.transform = 'scale(1)';
            marker.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2)';
            tooltip.style.opacity = '0';
        });
        
        // Add click handler to scroll to the corresponding entry
        const entryIndex = this.entries.length;
        markerContainer.addEventListener('click', () => {
            if (entryIndex < this.entries.length) {
                const entry = this.entries[entryIndex].element;
                if (entry) {
                    // Ensure the entry is expanded
                    if (!entry.classList.contains('expanded')) {
                        this.toggleThinkingEntry(entry);
                    }
                    
                    // Scroll to the entry
                    entry.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Highlight the entry briefly
                    entry.style.boxShadow = '0 0 0 2px ' + colors.icon;
                    setTimeout(() => {
                        entry.style.boxShadow = '';
                    }, 2000);
                }
            }
        });
        
        markerContainer.appendChild(marker);
        markerContainer.appendChild(tooltip);
        this.timelineTrack.appendChild(markerContainer);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.thinkingManager = new ThinkingProcessManager();
});
