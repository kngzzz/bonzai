/**
 * ReAct Agent Chat - CSS-based Animations
 * Implements smooth animations and micro-interactions for the UI using CSS transitions
 */

class AnimationManager {
    constructor() {
        // Store references to DOM elements
        this.elements = {
            messages: document.getElementById('messages'),
            thinkingProcess: document.getElementById('thinking-process'),
            messageInput: document.getElementById('message-input'),
            sendButton: document.getElementById('send-button'),
            statusBar: document.getElementById('agent-status-bar'),
            statusProgress: document.getElementById('agent-status-progress'),
            quickActions: document.querySelectorAll('.quick-action'),
            commandHistoryIndicator: document.getElementById('command-history-indicator'),
            settingsButton: document.getElementById('settings-button'),
            statusDot: document.getElementById('status-dot')
        };
        
        // Animation states
        this.states = {
            isThinking: false,
            isTyping: false,
            isPaused: false
        };
        
        // Initialize animations
        this.init();
    }
    
    init() {
        // Set up animations
        this.setupMessageAnimations();
        this.setupInputAnimations();
        this.setupThinkingAnimations();
        this.setupStatusAnimations();
        this.setupButtonAnimations();
        
        console.log('Animation Manager initialized');
    }
    
    /**
     * Message Animations
     */
    setupMessageAnimations() {
        // Create a MutationObserver to watch for new messages
        const messagesObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.classList && (node.classList.contains('user-message') || node.classList.contains('assistant-message'))) {
                            this.animateNewMessage(node);
                        }
                    });
                }
            });
        });
        
        // Start observing the messages container
        messagesObserver.observe(this.elements.messages, { childList: true });
    }
    
    animateNewMessage(messageElement) {
        // Use CSS classes to animate the new message
        const isUserMessage = messageElement.classList.contains('user-message');
        
        // Add animation class
        messageElement.classList.add('fade-in');
        
        // Animate the avatar with a slight delay
        const avatar = messageElement.querySelector('.w-6.h-6');
        if (avatar) {
            setTimeout(() => {
                avatar.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
                avatar.style.transform = 'scale(1)';
                avatar.style.opacity = '1';
            }, 200);
            
            // Set initial state
            avatar.style.transform = 'scale(0.8)';
            avatar.style.opacity = '0.5';
        }
    }
    
    /**
     * Input Animations
     */
    setupInputAnimations() {
        // Focus animation for message input
        this.elements.messageInput.addEventListener('focus', () => {
            this.elements.messageInput.style.transition = 'transform 0.2s ease-out, box-shadow 0.2s ease-out';
            this.elements.messageInput.style.transform = 'translateY(-2px)';
            this.elements.messageInput.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.15)';
        });
        
        this.elements.messageInput.addEventListener('blur', () => {
            this.elements.messageInput.style.transform = 'translateY(0)';
            this.elements.messageInput.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        });
        
        // Send button animation
        this.elements.sendButton.addEventListener('mouseenter', () => {
            this.elements.sendButton.style.transition = 'transform 0.15s ease-out, background-color 0.15s ease-out';
            this.elements.sendButton.style.transform = 'scale(1.05)';
            this.elements.sendButton.style.backgroundColor = 'rgb(124, 58, 237)'; // secondary-600
        });
        
        this.elements.sendButton.addEventListener('mouseleave', () => {
            this.elements.sendButton.style.transform = 'scale(1)';
            this.elements.sendButton.style.backgroundColor = 'rgb(139, 92, 246)'; // secondary-500
        });
        
        // Click animation for send button
        this.elements.sendButton.addEventListener('mousedown', () => {
            this.elements.sendButton.style.transform = 'scale(0.95)';
        });
        
        this.elements.sendButton.addEventListener('mouseup', () => {
            this.elements.sendButton.style.transform = 'scale(1.05)';
        });
    }
    
    /**
     * Thinking Process Animations
     */
    setupThinkingAnimations() {
        // Create a MutationObserver to watch for new thinking entries
        const thinkingObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.classList && node.classList.contains('thinking-entry')) {
                            this.animateThinkingEntry(node);
                        } else if (node.classList && node.classList.contains('thinking-stage')) {
                            this.animateThinkingStage(node);
                        }
                    });
                }
            });
        });
        
        // Start observing the thinking process container
        thinkingObserver.observe(this.elements.thinkingProcess, { childList: true, subtree: true });
    }
    
    animateThinkingEntry(entryElement) {
        // Set initial state
        entryElement.style.opacity = '0';
        entryElement.style.transform = 'translateY(10px) scale(0.98)';
        
        // Animate to final state
        setTimeout(() => {
            entryElement.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            entryElement.style.opacity = '1';
            entryElement.style.transform = 'translateY(0) scale(1)';
            
            // Animate the header with a slight delay
            const header = entryElement.querySelector('.thinking-header');
            if (header) {
                header.style.opacity = '0.8';
                header.style.transform = 'translateX(-5px)';
                
                setTimeout(() => {
                    header.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
                    header.style.opacity = '1';
                    header.style.transform = 'translateX(0)';
                }, 100);
            }
        }, 10);
    }
    
    animateThinkingStage(stageElement) {
        // Set initial state
        stageElement.style.opacity = '0';
        stageElement.style.transform = 'translateY(15px) scale(0.97)';
        
        // Animate to final state
        setTimeout(() => {
            stageElement.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
            stageElement.style.opacity = '1';
            stageElement.style.transform = 'translateY(0) scale(1)';
        }, 10);
    }
    
    /**
     * Status Animations
     */
    setupStatusAnimations() {
        // Create a pulsing animation for the status dot when thinking
        this.statusDotPulseInterval = null;
    }
    
    updateStatusAnimation(status) {
        // Clear any existing animations
        if (this.statusDotPulseInterval) {
            clearInterval(this.statusDotPulseInterval);
            this.statusDotPulseInterval = null;
        }
        
        switch(status) {
            case 'thinking':
                // Start pulsing animation
                this.statusDotPulseInterval = setInterval(() => {
                    this.elements.statusDot.style.transition = 'transform 0.75s ease-in-out';
                    this.elements.statusDot.style.transform = this.elements.statusDot.style.transform === 'scale(1.2)' ? 'scale(1)' : 'scale(1.2)';
                }, 750);
                
                // Animate status progress
                this.animateThinkingProgress();
                break;
                
            case 'connected':
                // Reset status dot
                this.elements.statusDot.style.transition = 'transform 0.3s ease-out, background-color 0.3s ease-out';
                this.elements.statusDot.style.transform = 'scale(1)';
                this.elements.statusDot.style.backgroundColor = 'rgb(16, 185, 129)'; // accent-success
                
                // Animate status progress to 100%
                this.elements.statusProgress.style.transition = 'width 0.5s ease-out';
                this.elements.statusProgress.style.width = '100%';
                
                // Reset after a delay
                setTimeout(() => {
                    this.elements.statusProgress.style.transition = 'width 0.8s ease-in-out';
                    this.elements.statusProgress.style.width = '0%';
                }, 1000);
                break;
                
            case 'error':
                // Animate status dot for error
                this.elements.statusDot.style.transition = 'transform 0.5s ease-out, background-color 0.5s ease-out';
                this.elements.statusDot.style.transform = 'scale(1)';
                this.elements.statusDot.style.backgroundColor = 'rgb(239, 68, 68)'; // accent-error
                
                // Animate status progress for error
                this.elements.statusProgress.style.transition = 'width 0.3s ease-out, background-color 0.3s ease-out';
                this.elements.statusProgress.style.width = '100%';
                this.elements.statusProgress.style.backgroundColor = 'rgb(239, 68, 68)'; // accent-error
                break;
                
            default:
                // Reset to disconnected state
                this.elements.statusDot.style.transition = 'transform 0.3s ease-out, background-color 0.3s ease-out';
                this.elements.statusDot.style.transform = 'scale(1)';
                this.elements.statusDot.style.backgroundColor = 'rgb(212, 212, 212)'; // neutral-300
                
                // Reset progress bar
                this.elements.statusProgress.style.transition = 'width 0.5s ease-out, background-color 0.5s ease-out';
                this.elements.statusProgress.style.width = '0%';
                this.elements.statusProgress.style.backgroundColor = '';
        }
    }
    
    animateThinkingProgress() {
        // Reset progress
        this.elements.statusProgress.style.transition = 'none';
        this.elements.statusProgress.style.width = '0%';
        
        // Force reflow to ensure the transition works
        this.elements.statusProgress.offsetHeight;
        
        // Animate to 90% (leaving room for completion)
        this.elements.statusProgress.style.transition = 'width 15s cubic-bezier(0.34, 0.53, 0.94, 0.99)';
        this.elements.statusProgress.style.width = '90%';
    }
    
    /**
     * Button Animations
     */
    setupButtonAnimations() {
        // Quick action buttons
        this.elements.quickActions.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transition = 'transform 0.2s ease-out, box-shadow 0.2s ease-out';
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            });
            
            button.addEventListener('mousedown', () => {
                button.style.transition = 'transform 0.1s ease-out';
                button.style.transform = 'scale(0.97)';
            });
            
            button.addEventListener('mouseup', () => {
                button.style.transform = 'scale(1)';
            });
        });
        
        // Settings button rotation animation
        const settingsSvg = this.elements.settingsButton.querySelector('svg');
        if (settingsSvg) {
            this.elements.settingsButton.addEventListener('mouseenter', () => {
                settingsSvg.style.transition = 'transform 0.3s ease-out';
                settingsSvg.style.transform = 'rotate(90deg)';
            });
            
            this.elements.settingsButton.addEventListener('mouseleave', () => {
                settingsSvg.style.transform = 'rotate(0deg)';
            });
        }
    }
    
    /**
     * Public API
     */
    
    // Animate message sending
    animateSendMessage() {
        // Ripple effect on send button
        const ripple = document.createElement('div');
        ripple.className = 'absolute inset-0 bg-white rounded-lg';
        ripple.style.opacity = '0.3';
        ripple.style.transform = 'scale(0)';
        this.elements.sendButton.appendChild(ripple);
        
        // Force reflow
        ripple.offsetHeight;
        
        // Animate ripple
        ripple.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        ripple.style.opacity = '0';
        ripple.style.transform = 'scale(1.5)';
        
        // Remove after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 600);
        
        // Clear input
        this.elements.messageInput.value = '';
        
        // Animate status bar
        this.updateStatusAnimation('thinking');
    }
    
    // Animate pause/resume
    animatePauseResume(isPaused) {
        this.states.isPaused = isPaused;
        
        // Find the pause button
        const pauseButton = Array.from(this.elements.quickActions).find(btn => 
            btn.textContent.trim().includes('Pause agent') || 
            btn.textContent.trim().includes('Resume agent')
        );
        
        if (pauseButton) {
            // Update button text and icon
            const buttonSpan = pauseButton.querySelector('span');
            const buttonIcon = buttonSpan.querySelector('svg');
            
            if (isPaused) {
                // Change to resume
                buttonSpan.textContent = ' Resume agent';
                buttonIcon.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                `;
                
                // Animate to resume state
                pauseButton.style.transition = 'background-color 0.3s ease-out, border-color 0.3s ease-out';
                pauseButton.style.backgroundColor = 'rgb(167, 243, 208)'; // green-200
                pauseButton.style.borderColor = 'rgb(16, 185, 129)'; // accent-success
            } else {
                // Change to pause
                buttonSpan.textContent = ' Pause agent';
                buttonIcon.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                `;
                
                // Animate to pause state
                pauseButton.style.transition = 'background-color 0.3s ease-out, border-color 0.3s ease-out';
                pauseButton.style.backgroundColor = 'rgb(254, 243, 199)'; // amber-100
                pauseButton.style.borderColor = 'rgb(245, 158, 11)'; // accent-amber
            }
            
            // Add the icon back to the span
            buttonSpan.prepend(buttonIcon);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.animationManager = new AnimationManager();
    
    // Override the original updateStatus function to add animations
    const originalUpdateStatus = window.updateStatus;
    window.updateStatus = function(status) {
        // Call the original function
        originalUpdateStatus(status);
        
        // Add animations
        if (window.animationManager) {
            window.animationManager.updateStatusAnimation(status);
        }
    };
    
    // Override the original sendMessage function to add animations
    const originalSendMessage = window.sendMessage;
    window.sendMessage = async function() {
        // Animate sending
        if (window.animationManager) {
            window.animationManager.animateSendMessage();
        }
        
        // Call the original function
        await originalSendMessage();
    };
});
