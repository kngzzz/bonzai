/**
 * ReAct Agent Chat - Enhanced Interactivity
 * Additional JavaScript functionality for the ReAct Agent Chat interface
 */

class ReActAgentUI {
    constructor() {
        // DOM elements
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.messagesContainer = document.getElementById('messages');
        this.thinkingProcess = document.getElementById('thinking-process');
        this.quickActions = document.querySelectorAll('.quick-action');
        this.settingsButton = document.getElementById('settings-button');
        this.statusBar = document.getElementById('agent-status-bar');
        this.statusProgress = document.getElementById('agent-status-progress');
        this.commandHistoryIndicator = document.getElementById('command-history-indicator');
        this.historyCount = document.getElementById('history-count');
        
        // Command history
        this.commandHistory = [];
        this.historyIndex = -1;
        
        // Status tracking
        this.processingState = 'idle'; // idle, thinking, responding
        this.processingProgress = 0;
        this.processingInterval = null;
        
        // Command suggestions
        this.suggestions = [
            'Help me understand how you work',
            'What tools do you have access to?',
            'Can you explain your thinking process?',
            'Summarize our conversation',
            'How can I provide feedback on your performance?'
        ];
        
        // Initialize
        this.init();
    }
    
    init() {
        // Add keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Add command history navigation
        this.setupCommandHistory();
        
        // Add message actions
        this.setupMessageActions();
        
        // Add command suggestions
        this.setupCommandSuggestions();
        
        // Add settings panel
        this.setupSettingsPanel();
        
        // Add scroll animations
        this.setupScrollAnimations();
        
        // Add message hover effects
        this.setupMessageHoverEffects();
        
        console.log('ReAct Agent UI enhancements initialized');
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+/ or Cmd+/ to focus message input
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.messageInput.focus();
            }
            
            // Escape to blur message input
            if (e.key === 'Escape' && document.activeElement === this.messageInput) {
                this.messageInput.blur();
            }
            
            // Ctrl+ArrowUp or Cmd+ArrowUp to navigate command history
            if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateCommandHistory('up');
            }
            
            // Ctrl+ArrowDown or Cmd+ArrowDown to navigate command history
            if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateCommandHistory('down');
            }
        });
    }
    
    setupCommandHistory() {
        // Store command in history when sent
        this.sendButton.addEventListener('click', () => {
            const command = this.messageInput.value.trim();
            if (command && !this.commandHistory.includes(command)) {
                this.commandHistory.unshift(command);
                // Limit history to 50 items
                if (this.commandHistory.length > 50) {
                    this.commandHistory.pop();
                }
                this.historyIndex = -1;
            }
        });
        
        // Navigate command history with up/down arrows
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' && !e.ctrlKey && !e.metaKey) {
                if (this.messageInput.value === '' || this.historyIndex >= 0) {
                    e.preventDefault();
                    this.navigateCommandHistory('up');
                }
            } else if (e.key === 'ArrowDown' && !e.ctrlKey && !e.metaKey) {
                if (this.historyIndex >= 0) {
                    e.preventDefault();
                    this.navigateCommandHistory('down');
                }
            }
        });
    }
    
    navigateCommandHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        if (direction === 'up') {
            this.historyIndex = Math.min(this.historyIndex + 1, this.commandHistory.length - 1);
        } else {
            this.historyIndex = Math.max(this.historyIndex - 1, -1);
        }
        
        if (this.historyIndex === -1) {
            this.messageInput.value = '';
        } else {
            this.messageInput.value = this.commandHistory[this.historyIndex];
            // Move cursor to end of input
            setTimeout(() => {
                this.messageInput.selectionStart = this.messageInput.selectionEnd = this.messageInput.value.length;
            }, 0);
        }
    }
    
    setupMessageActions() {
        // Add action buttons to messages when hovered
        this.messagesContainer.addEventListener('mouseover', (e) => {
            const message = e.target.closest('.message');
            if (!message) return;
            
            // Don't add actions if they already exist
            if (message.querySelector('.message-actions')) return;
            
            // Create actions container
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'message-actions absolute top-2 right-2 flex space-x-1 opacity-0 transition-opacity';
            
            // Copy button
            const copyButton = document.createElement('button');
            copyButton.className = 'p-1 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-700 transition-colors';
            copyButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            `;
            copyButton.title = 'Copy message';
            copyButton.addEventListener('click', () => {
                const content = message.querySelector('.message-content').textContent;
                navigator.clipboard.writeText(content).then(() => {
                    // Show copied notification
                    const notification = document.createElement('div');
                    notification.className = 'absolute top-2 right-2 bg-neutral-800 text-white text-xs px-2 py-1 rounded fade-in';
                    notification.textContent = 'Copied!';
                    message.appendChild(notification);
                    setTimeout(() => notification.remove(), 2000);
                });
            });
            
            actionsContainer.appendChild(copyButton);
            message.style.position = 'relative';
            message.appendChild(actionsContainer);
            
            // Show actions on hover
            message.addEventListener('mouseenter', () => {
                actionsContainer.style.opacity = '1';
            });
            
            message.addEventListener('mouseleave', () => {
                actionsContainer.style.opacity = '0';
            });
        });
    }
    
    setupCommandSuggestions() {
        // Create suggestions container
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'suggestions-container absolute left-0 right-0 bottom-full mb-2 bg-white rounded-lg shadow-lg border border-neutral-200 max-h-48 overflow-y-auto z-10 hidden';
        this.messageInput.parentNode.appendChild(suggestionsContainer);
        
        // Show suggestions when input is focused
        this.messageInput.addEventListener('focus', () => {
            this.updateSuggestions();
        });
        
        // Hide suggestions when input is blurred
        this.messageInput.addEventListener('blur', () => {
            setTimeout(() => {
                suggestionsContainer.classList.add('hidden');
            }, 200);
        });
        
        // Update suggestions as user types
        this.messageInput.addEventListener('input', () => {
            this.updateSuggestions();
        });
        
        // Handle suggestion selection
        suggestionsContainer.addEventListener('click', (e) => {
            const suggestion = e.target.closest('.suggestion-item');
            if (suggestion) {
                this.messageInput.value = suggestion.textContent;
                this.messageInput.focus();
                suggestionsContainer.classList.add('hidden');
            }
        });
    }
    
    updateSuggestions() {
        const suggestionsContainer = document.querySelector('.suggestions-container');
        const input = this.messageInput.value.toLowerCase();
        
        // Filter suggestions based on input
        const filteredSuggestions = this.suggestions.filter(suggestion => 
            suggestion.toLowerCase().includes(input)
        );
        
        // Show/hide suggestions container
        if (filteredSuggestions.length > 0 && input.length > 0) {
            suggestionsContainer.classList.remove('hidden');
            
            // Render suggestions
            suggestionsContainer.innerHTML = filteredSuggestions.map(suggestion => `
                <div class="suggestion-item p-2 hover:bg-neutral-100 cursor-pointer text-sm">${suggestion}</div>
            `).join('');
        } else {
            suggestionsContainer.classList.add('hidden');
        }
    }
    
    setupSettingsPanel() {
        // Create settings panel
        const settingsPanel = document.createElement('div');
        settingsPanel.className = 'settings-panel fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50 hidden';
        settingsPanel.innerHTML = `
            <div class="bg-white w-full max-w-md h-full shadow-lg transform transition-transform duration-300 translate-x-full">
                <div class="p-4 border-b border-neutral-200 flex justify-between items-center">
                    <h2 class="text-lg font-semibold">Settings</h2>
                    <button class="close-settings p-2 rounded-full hover:bg-neutral-100">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="p-4 space-y-4">
                    <div class="space-y-2">
                        <label class="text-sm font-medium block">Interface Theme</label>
                        <div class="flex space-x-2">
                            <button class="theme-option px-3 py-1 rounded border border-neutral-300 text-sm" data-theme="light">Light</button>
                            <button class="theme-option px-3 py-1 rounded border border-neutral-300 text-sm" data-theme="dark">Dark</button>
                            <button class="theme-option px-3 py-1 rounded border border-neutral-300 text-sm" data-theme="system">System</button>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium block">Message Display</label>
                        <div class="flex items-center">
                            <input type="checkbox" id="compact-messages" class="mr-2">
                            <label for="compact-messages" class="text-sm">Compact messages</label>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium block">Keyboard Shortcuts</label>
                        <div class="bg-neutral-100 p-3 rounded text-sm">
                            <div class="flex justify-between mb-1">
                                <span>Focus command input</span>
                                <kbd class="px-2 py-0.5 bg-white rounded border border-neutral-300 text-xs">Ctrl + /</kbd>
                            </div>
                            <div class="flex justify-between mb-1">
                                <span>Previous command</span>
                                <kbd class="px-2 py-0.5 bg-white rounded border border-neutral-300 text-xs">↑</kbd>
                            </div>
                            <div class="flex justify-between">
                                <span>Next command</span>
                                <kbd class="px-2 py-0.5 bg-white rounded border border-neutral-300 text-xs">↓</kbd>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(settingsPanel);
        
        // Toggle settings panel
        this.settingsButton.addEventListener('click', () => {
            settingsPanel.classList.remove('hidden');
            setTimeout(() => {
                settingsPanel.querySelector('.bg-white').classList.remove('translate-x-full');
            }, 10);
        });
        
        // Close settings panel
        settingsPanel.querySelector('.close-settings').addEventListener('click', () => {
            settingsPanel.querySelector('.bg-white').classList.add('translate-x-full');
            setTimeout(() => {
                settingsPanel.classList.add('hidden');
            }, 300);
        });
        
        // Close settings when clicking outside
        settingsPanel.addEventListener('click', (e) => {
            if (e.target === settingsPanel) {
                settingsPanel.querySelector('.bg-white').classList.add('translate-x-full');
                setTimeout(() => {
                    settingsPanel.classList.add('hidden');
                }, 300);
            }
        });
        
        // Theme options
        settingsPanel.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                // Highlight selected option
                settingsPanel.querySelectorAll('.theme-option').forEach(opt => {
                    opt.classList.remove('bg-secondary-100', 'border-secondary-300');
                });
                option.classList.add('bg-secondary-100', 'border-secondary-300');
                
                // Apply theme (placeholder for future implementation)
                console.log(`Theme set to: ${theme}`);
            });
        });
        
        // Compact messages toggle
        const compactMessagesToggle = settingsPanel.querySelector('#compact-messages');
        compactMessagesToggle.addEventListener('change', () => {
            if (compactMessagesToggle.checked) {
                document.body.classList.add('compact-messages');
            } else {
                document.body.classList.remove('compact-messages');
            }
        });
    }
    
    setupScrollAnimations() {
        // Smooth scroll to bottom when new messages are added
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length) {
                    const isScrolledToBottom = this.messagesContainer.scrollHeight - this.messagesContainer.clientHeight <= this.messagesContainer.scrollTop + 50;
                    
                    if (isScrolledToBottom) {
                        this.messagesContainer.scrollTo({
                            top: this.messagesContainer.scrollHeight,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
        
        observer.observe(this.messagesContainer, { childList: true });
    }
    
    setupMessageHoverEffects() {
        // Add hover effects to messages
        this.messagesContainer.addEventListener('mouseover', (e) => {
            const message = e.target.closest('.message');
            if (message) {
                message.style.transform = 'translateY(-2px)';
                message.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }
        });
        
        this.messagesContainer.addEventListener('mouseout', (e) => {
            const message = e.target.closest('.message');
            if (message) {
                message.style.transform = '';
                message.style.boxShadow = '';
            }
        });
    }
}

// Add methods for status visualization and command history
ReActAgentUI.prototype.updateStatusVisualization = function(status) {
    // Clear any existing interval
    if (this.processingInterval) {
        clearInterval(this.processingInterval);
        this.processingInterval = null;
    }
    
    // Update status bar based on status
    switch(status) {
        case 'thinking':
            this.processingState = 'thinking';
            this.processingProgress = 0;
            this.statusProgress.style.width = '0%';
            this.statusProgress.style.backgroundColor = '';
            this.statusProgress.classList.add('bg-gradient-to-r', 'from-primary-500', 'to-secondary-500');
            
            // Animate progress
            this.processingInterval = setInterval(() => {
                // Increment progress, but slow down as it approaches 90%
                if (this.processingProgress < 90) {
                    this.processingProgress += (90 - this.processingProgress) * 0.01;
                }
                this.statusProgress.style.width = `${this.processingProgress}%`;
            }, 100);
            break;
            
        case 'connected':
            this.processingState = 'idle';
            this.processingProgress = 100;
            this.statusProgress.style.width = '100%';
            this.statusProgress.classList.remove('bg-gradient-to-r', 'from-primary-500', 'to-secondary-500');
            this.statusProgress.style.backgroundColor = '#10b981'; // accent-success
            
            // Reset after a delay
            setTimeout(() => {
                if (this.processingState === 'idle') {
                    this.statusProgress.style.width = '0%';
                }
            }, 1500);
            break;
            
        case 'error':
            this.processingState = 'error';
            this.processingProgress = 100;
            this.statusProgress.style.width = '100%';
            this.statusProgress.classList.remove('bg-gradient-to-r', 'from-primary-500', 'to-secondary-500');
            this.statusProgress.style.backgroundColor = '#ef4444'; // accent-error
            break;
            
        default:
            this.processingState = 'idle';
            this.processingProgress = 0;
            this.statusProgress.style.width = '0%';
    }
};

ReActAgentUI.prototype.updateCommandHistoryIndicator = function() {
    if (this.commandHistory.length > 0) {
        this.commandHistoryIndicator.classList.remove('hidden');
        this.historyCount.textContent = this.commandHistory.length;
    } else {
        this.commandHistoryIndicator.classList.add('hidden');
    }
};

// Override the original navigateCommandHistory method to update the indicator
const originalNavigateCommandHistory = ReActAgentUI.prototype.navigateCommandHistory;
ReActAgentUI.prototype.navigateCommandHistory = function(direction) {
    originalNavigateCommandHistory.call(this, direction);
    
    // Highlight the history indicator when navigating
    if (this.historyIndex >= 0) {
        this.commandHistoryIndicator.classList.add('bg-secondary-100', 'text-secondary-700');
        this.commandHistoryIndicator.classList.remove('bg-neutral-100', 'text-neutral-600');
    } else {
        this.commandHistoryIndicator.classList.remove('bg-secondary-100', 'text-secondary-700');
        this.commandHistoryIndicator.classList.add('bg-neutral-100', 'text-neutral-600');
    }
};

// Override the original setupCommandHistory method to update the indicator
const originalSetupCommandHistory = ReActAgentUI.prototype.setupCommandHistory;
ReActAgentUI.prototype.setupCommandHistory = function() {
    originalSetupCommandHistory.call(this);
    
    // Add click handler for history indicator
    this.commandHistoryIndicator.addEventListener('click', () => {
        if (this.commandHistory.length > 0) {
            // Create and show history dropdown
            const historyDropdown = document.createElement('div');
            historyDropdown.className = 'absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-neutral-200 max-h-48 overflow-y-auto z-10';
            
            // Add history items
            historyDropdown.innerHTML = this.commandHistory.map((cmd, index) => `
                <div class="history-item p-2 hover:bg-neutral-100 cursor-pointer text-sm ${index === this.historyIndex ? 'bg-secondary-50' : ''}">
                    ${cmd}
                </div>
            `).join('');
            
            // Add to DOM
            this.messageInput.parentNode.appendChild(historyDropdown);
            
            // Handle item selection
            historyDropdown.addEventListener('click', (e) => {
                const item = e.target.closest('.history-item');
                if (item) {
                    const index = Array.from(historyDropdown.children).indexOf(item);
                    this.messageInput.value = this.commandHistory[index];
                    this.messageInput.focus();
                    historyDropdown.remove();
                }
            });
            
            // Close on outside click
            document.addEventListener('click', function closeHistory(e) {
                if (!historyDropdown.contains(e.target) && e.target !== this.commandHistoryIndicator) {
                    historyDropdown.remove();
                    document.removeEventListener('click', closeHistory);
                }
            }.bind(this));
        }
    });
    
    // Update indicator on page load
    this.updateCommandHistoryIndicator();
};

// Hook into the global updateStatus function to update our visualization
const originalUpdateStatus = window.updateStatus;
window.updateStatus = function(status) {
    // Call the original function
    originalUpdateStatus(status);
    
    // Update our visualization
    if (window.reactAgentUI) {
        window.reactAgentUI.updateStatusVisualization(status);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.reactAgentUI = new ReActAgentUI();
});
