/**
 * ReAct Agent Chat - Advanced Command Palette
 * Implements autocomplete, template prompts, and keyboard shortcuts
 */

class CommandPalette {
    constructor() {
        // DOM elements
        this.elements = {
            messageInput: document.getElementById('message-input'),
            sendButton: document.getElementById('send-button'),
            suggestionsContainer: document.createElement('div'),
            commandHistoryIndicator: document.getElementById('command-history-indicator'),
            historyCount: document.getElementById('history-count'),
            quickActions: document.querySelectorAll('.quick-action')
        };
        
        // State
        this.state = {
            commandHistory: [],
            historyIndex: -1,
            suggestions: [],
            activeSuggestionIndex: -1,
            isPaused: false,
            templates: [
                { name: 'Help me with...', text: 'Help me with ' },
                { name: 'Explain concept', text: 'Explain the concept of ' },
                { name: 'Code example', text: 'Show me a code example of ' },
                { name: 'Summarize', text: 'Summarize the following: ' },
                { name: 'Compare', text: 'Compare and contrast ' },
                { name: 'Troubleshoot', text: 'Help me troubleshoot this error: ' },
                { name: 'Optimize', text: 'Optimize this code: ' },
                { name: 'Generate', text: 'Generate a ' },
                { name: 'Analyze', text: 'Analyze this: ' },
                { name: 'Translate', text: 'Translate this to ' }
            ],
            commonCommands: [
                'Help me understand how you work',
                'What tools do you have access to?',
                'Can you explain your thinking process?',
                'Summarize our conversation',
                'How can I provide feedback on your performance?'
            ]
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        // Set up suggestions container
        this.setupSuggestionsContainer();
        
        // Set up command history
        this.setupCommandHistory();
        
        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Set up template prompts
        this.setupTemplateSuggestions();
        
        // Set up pause/resume functionality
        this.setupPauseResume();
        
        console.log('Command Palette initialized');
    }
    
    /**
     * Suggestions Container
     */
    setupSuggestionsContainer() {
        const container = this.elements.suggestionsContainer;
        container.className = 'suggestions-container absolute left-0 right-0 bottom-full mb-2 bg-white rounded-lg shadow-lg border border-neutral-200 max-h-48 overflow-y-auto z-10 hidden';
        this.elements.messageInput.parentNode.appendChild(container);
        
        // Show suggestions when input is focused
        this.elements.messageInput.addEventListener('focus', () => {
            this.updateSuggestions();
        });
        
        // Hide suggestions when input is blurred
        this.elements.messageInput.addEventListener('blur', () => {
            setTimeout(() => {
                container.classList.add('hidden');
            }, 200);
        });
        
        // Update suggestions as user types
        this.elements.messageInput.addEventListener('input', () => {
            this.updateSuggestions();
        });
        
        // Handle suggestion selection
        container.addEventListener('click', (e) => {
            const suggestion = e.target.closest('.suggestion-item');
            if (suggestion) {
                this.selectSuggestion(suggestion.dataset.value || suggestion.textContent);
            }
        });
    }
    
    updateSuggestions() {
        const container = this.elements.suggestionsContainer;
        const input = this.elements.messageInput.value;
        const inputLower = input.toLowerCase();
        
        // Clear previous suggestions
        this.state.suggestions = [];
        this.state.activeSuggestionIndex = -1;
        
        // If input is empty, hide suggestions
        if (!input) {
            container.classList.add('hidden');
            return;
        }
        
        // Add template suggestions
        this.state.templates.forEach(template => {
            if (template.name.toLowerCase().includes(inputLower) || 
                template.text.toLowerCase().includes(inputLower)) {
                this.state.suggestions.push({
                    text: template.name,
                    value: template.text,
                    type: 'template'
                });
            }
        });
        
        // Add command history suggestions
        this.state.commandHistory.forEach(cmd => {
            if (cmd.toLowerCase().includes(inputLower) && 
                !this.state.suggestions.some(s => s.text === cmd)) {
                this.state.suggestions.push({
                    text: cmd,
                    type: 'history'
                });
            }
        });
        
        // Add common commands
        this.state.commonCommands.forEach(cmd => {
            if (cmd.toLowerCase().includes(inputLower) && 
                !this.state.suggestions.some(s => s.text === cmd)) {
                this.state.suggestions.push({
                    text: cmd,
                    type: 'common'
                });
            }
        });
        
        // Limit to top 10 suggestions
        this.state.suggestions = this.state.suggestions.slice(0, 10);
        
        // Show/hide suggestions container
        if (this.state.suggestions.length > 0) {
            container.classList.remove('hidden');
            
            // Render suggestions
            container.innerHTML = this.state.suggestions.map((suggestion, index) => {
                const isActive = index === 0 ? 'bg-secondary-50' : '';
                return `
                    <div class="suggestion-item p-2 hover:bg-secondary-50 cursor-pointer text-sm flex items-center ${isActive}" data-value="${suggestion.value || suggestion.text}">
                        <span class="flex-1">${suggestion.text}</span>
                        <span class="text-xs text-neutral-400">
                            ${suggestion.type === 'template' ? 'Template' : 
                              suggestion.type === 'history' ? 'History' : 'Suggestion'}
                        </span>
                    </div>
                `;
            }).join('');
            
            // Apply animations to suggestions
            const items = container.querySelectorAll('.suggestion-item');
            items.forEach((item, i) => {
                // Set initial state
                item.style.opacity = '0';
                item.style.transform = 'translateY(10px)';
                
                // Animate with delay based on index
                setTimeout(() => {
                    item.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, i * 30);
            });
        } else {
            container.classList.add('hidden');
        }
    }
    
    selectSuggestion(text) {
        this.elements.messageInput.value = text;
        this.elements.messageInput.focus();
        this.elements.suggestionsContainer.classList.add('hidden');
        
        // Place cursor at the end of the text
        this.elements.messageInput.selectionStart = this.elements.messageInput.selectionEnd = text.length;
        
        // If it's a template that ends with a space, keep the suggestions open
        if (text.endsWith(' ')) {
            this.updateSuggestions();
        }
    }
    
    /**
     * Command History
     */
    setupCommandHistory() {
        // Store command in history when sent
        this.elements.sendButton.addEventListener('click', () => {
            this.addToCommandHistory();
        });
        
        // Also store command when pressing Enter
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                this.addToCommandHistory();
            }
        });
        
        // Update command history indicator
        this.updateCommandHistoryIndicator();
        
        // Add click handler for history indicator
        this.elements.commandHistoryIndicator.addEventListener('click', () => {
            this.showCommandHistory();
        });
    }
    
    addToCommandHistory() {
        const command = this.elements.messageInput.value.trim();
        if (command && !this.state.commandHistory.includes(command)) {
            this.state.commandHistory.unshift(command);
            // Limit history to 50 items
            if (this.state.commandHistory.length > 50) {
                this.state.commandHistory.pop();
            }
            this.state.historyIndex = -1;
            this.updateCommandHistoryIndicator();
        }
    }
    
    updateCommandHistoryIndicator() {
        if (this.state.commandHistory.length > 0) {
            this.elements.commandHistoryIndicator.classList.remove('hidden');
            this.elements.historyCount.textContent = this.state.commandHistory.length;
            
            // Apply a subtle animation to the indicator
            this.elements.commandHistoryIndicator.style.transition = 'transform 0.5s ease-out, background-color 0.5s ease-out';
            this.elements.commandHistoryIndicator.style.transform = 'scale(1.1)';
            this.elements.commandHistoryIndicator.style.backgroundColor = 'rgb(196, 181, 253)'; // secondary-300
            
            setTimeout(() => {
                this.elements.commandHistoryIndicator.style.transform = 'scale(1)';
                this.elements.commandHistoryIndicator.style.backgroundColor = 'rgb(229, 229, 229)'; // neutral-200
            }, 500);
        } else {
            this.elements.commandHistoryIndicator.classList.add('hidden');
        }
    }
    
    showCommandHistory() {
        if (this.state.commandHistory.length === 0) return;
        
        // Create and show history dropdown
        const historyDropdown = document.createElement('div');
        historyDropdown.className = 'absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-neutral-200 max-h-48 overflow-y-auto z-10';
        
        // Add history items
        historyDropdown.innerHTML = this.state.commandHistory.map((cmd, index) => {
            const isActive = index === this.state.historyIndex ? 'bg-secondary-50' : '';
            return `
                <div class="history-item p-2 hover:bg-neutral-100 cursor-pointer text-sm flex items-center ${isActive}">
                    ${cmd}
                </div>
            `;
        }).join('');
        
        // Add to DOM
        this.elements.messageInput.parentNode.appendChild(historyDropdown);
        
        // Apply animations
        historyDropdown.style.opacity = '0';
        historyDropdown.style.transform = 'translateY(-10px)';
        
        // Force reflow
        historyDropdown.offsetHeight;
        
        // Animate in
        historyDropdown.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
        historyDropdown.style.opacity = '1';
        historyDropdown.style.transform = 'translateY(0)';
        
        // Handle item selection
        historyDropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.history-item');
            if (item) {
                const index = Array.from(historyDropdown.children).indexOf(item);
                this.elements.messageInput.value = this.state.commandHistory[index];
                this.elements.messageInput.focus();
                
                // Animate out and remove
                historyDropdown.style.opacity = '0';
                historyDropdown.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    historyDropdown.remove();
                }, 200);
                
                // Place cursor at the end
                this.elements.messageInput.selectionStart = this.elements.messageInput.selectionEnd = this.elements.messageInput.value.length;
            }
        });
    }
    
    navigateCommandHistory(direction) {
        if (this.state.commandHistory.length === 0) return;
        
        if (direction === 'up') {
            this.state.historyIndex = Math.min(this.state.historyIndex + 1, this.state.commandHistory.length - 1);
        } else {
            this.state.historyIndex = Math.max(this.state.historyIndex - 1, -1);
        }
        
        if (this.state.historyIndex === -1) {
            this.elements.messageInput.value = '';
        } else {
            this.elements.messageInput.value = this.state.commandHistory[this.state.historyIndex];
            // Move cursor to end of input
            setTimeout(() => {
                this.elements.messageInput.selectionStart = this.elements.messageInput.selectionEnd = this.elements.messageInput.value.length;
            }, 0);
        }
    }
    
    /**
     * Keyboard Shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+/ or Cmd+/ to focus message input
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.elements.messageInput.focus();
            }
            
            // Escape to blur message input and hide suggestions
            if (e.key === 'Escape') {
                if (document.activeElement === this.elements.messageInput) {
                    this.elements.messageInput.blur();
                }
                this.elements.suggestionsContainer.classList.add('hidden');
            }
            
            // Up/Down arrows to navigate command history when suggestions are hidden
            if (document.activeElement === this.elements.messageInput) {
                if (e.key === 'ArrowUp' && (this.elements.messageInput.value === '' || this.state.historyIndex >= 0)) {
                    e.preventDefault();
                    this.navigateCommandHistory('up');
                } else if (e.key === 'ArrowDown' && this.state.historyIndex >= 0) {
                    e.preventDefault();
                    this.navigateCommandHistory('down');
                }
            }
        });
    }
    
    /**
     * Template Suggestions
     */
    setupTemplateSuggestions() {
        // Add template suggestions to quick actions
        const templateButton = document.createElement('button');
        templateButton.className = 'quick-action px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 transition-colors border border-green-200 shadow-sm';
        templateButton.innerHTML = '<span>Templates</span>';
        
        // Add to quick actions container
        const quickActionsContainer = this.elements.quickActions[0].parentNode;
        quickActionsContainer.appendChild(templateButton);
        
        // Show template dropdown on click
        templateButton.addEventListener('click', () => {
            this.showTemplateDropdown(templateButton);
        });
    }
    
    showTemplateDropdown(button) {
        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-neutral-200 z-20 w-64';
        
        // Add header
        dropdown.innerHTML = `
            <div class="p-2 border-b border-neutral-200 bg-neutral-50 rounded-t-lg">
                <h3 class="text-sm font-medium text-neutral-700">Template Prompts</h3>
            </div>
            <div class="p-2 max-h-48 overflow-y-auto">
                ${this.state.templates.map(template => `
                    <div class="template-item p-2 hover:bg-neutral-100 cursor-pointer text-sm rounded">
                        ${template.name}
                    </div>
                `).join('')}
            </div>
        `;
        
        // Position dropdown
        dropdown.style.position = 'absolute';
        button.parentNode.style.position = 'relative';
        button.parentNode.appendChild(dropdown);
        
        // Handle template selection
        dropdown.querySelectorAll('.template-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.elements.messageInput.value = this.state.templates[index].text;
                this.elements.messageInput.focus();
                
                // Place cursor at the end
                this.elements.messageInput.selectionStart = this.elements.messageInput.selectionEnd = this.elements.messageInput.value.length;
                
                // Remove dropdown
                dropdown.remove();
            });
        });
    }
    
    /**
     * Pause/Resume Functionality
     */
    setupPauseResume() {
        // Find the pause button
        const pauseButton = Array.from(this.elements.quickActions).find(btn => 
            btn.textContent.trim().includes('Pause agent')
        );
        
        if (pauseButton) {
            pauseButton.addEventListener('click', () => {
                this.togglePauseResume();
            });
        }
    }
    
    togglePauseResume() {
        this.state.isPaused = !this.state.isPaused;
        
        // Show feedback message
        const messagesDiv = document.getElementById('messages');
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'system-message text-center text-neutral-500 text-sm italic py-2 fade-in';
        feedbackDiv.textContent = this.state.isPaused ? 
            'Agent is paused. You can provide guidance or corrections.' : 
            'Agent is resumed and ready for your commands.';
        messagesDiv.appendChild(feedbackDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    // Placeholder for hideGuidanceInput method
    hideGuidanceInput() {
        const container = document.getElementById('guidance-container');
        if (container) {
            container.remove();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.commandPalette = new CommandPalette();
});
