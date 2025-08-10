// ==============================================
// Slide Navigation Component - Vanilla JavaScript
// ==============================================
// Self-contained navigation script for slide presentations
// No external dependencies, works with Tailwind CSS
// Export as string template for injection into HTML

export const slideNavigationScript = `
<script>
(function() {
  'use strict';
  
  // Slide Navigation Controller
  class SlideNavigator {
    constructor() {
      this.slides = [];
      this.currentSlide = 0;
      this.isInitialized = false;
      
      // Bind methods to preserve context
      this.nextSlide = this.nextSlide.bind(this);
      this.prevSlide = this.prevSlide.bind(this);
      this.goToSlide = this.goToSlide.bind(this);
      this.handleKeyboard = this.handleKeyboard.bind(this);
    }
    
    // Initialize the slide navigator
    init() {
      if (this.isInitialized) return;
      
      // Auto-detect slide sections
      this.detectSlides();
      
      if (this.slides.length === 0) {
        console.warn('No slides found. Expected elements with class "slide" or sections with IDs starting with "slide-"');
        return;
      }
      
      // Create navigation UI
      this.createNavigationUI();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize first slide
      this.goToSlide(0);
      
      this.isInitialized = true;
      console.log(\`Slide navigator initialized with \${this.slides.length} slides\`);
    }
    
    // Auto-detect slide sections in the HTML
    detectSlides() {
      // Look for elements with class 'slide' first
      let slideElements = document.querySelectorAll('.slide');
      
      // If no .slide elements found, look for sections with IDs starting with 'slide-'
      if (slideElements.length === 0) {
        slideElements = document.querySelectorAll('section[id^="slide-"]');
      }
      
      // If still no slides found, look for any section elements
      if (slideElements.length === 0) {
        slideElements = document.querySelectorAll('section');
      }
      
      this.slides = Array.from(slideElements);
      
      // Setup initial styling
      this.slides.forEach((slide, index) => {
        slide.dataset.slideIndex = index;
        
        // Ensure slide class exists
        if (!slide.classList.contains('slide')) {
          slide.classList.add('slide');
        }
        
        // Initially hide all slides except the first
        if (index === 0) {
          slide.classList.add('slide-active');
        } else {
          slide.classList.remove('slide-active');
        }
        
        // Only add essential transition styling if not already present
        if (!slide.classList.contains('transition-opacity')) {
          slide.classList.add('transition-opacity', 'duration-500', 'ease-in-out');
        }
        
        // Add minimum required styling for slide presentation if not present
        if (!slide.classList.contains('min-h-screen')) {
          slide.classList.add('min-h-screen', 'w-full');
        }
      });
    }
    
    // Create navigation UI elements
    createNavigationUI() {
      // Create navigation container
      const navContainer = document.createElement('div');
      navContainer.id = 'slide-navigation';
      navContainer.className = 'fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-4 rounded-full px-6 py-3';
      
      // Previous button
      const prevButton = document.createElement('button');
      prevButton.id = 'slide-prev';
      prevButton.className = 'flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
      prevButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
      prevButton.title = 'Previous slide (Arrow Left)';
      prevButton.onclick = this.prevSlide;
      
      // Slide counter
      const slideCounter = document.createElement('div');
      slideCounter.id = 'slide-counter';
      slideCounter.className = 'flex items-center justify-center h-10 text-white font-mono text-sm px-3 bg-white/10 rounded-full';
      slideCounter.textContent = \`1 / \${this.slides.length}\`;
      
      // Next button
      const nextButton = document.createElement('button');
      nextButton.id = 'slide-next';
      nextButton.className = 'flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
      nextButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>';
      nextButton.title = 'Next slide (Arrow Right)';
      nextButton.onclick = this.nextSlide;
      
      // Fullscreen button
      const fullscreenButton = document.createElement('button');
      fullscreenButton.id = 'slide-fullscreen';
      fullscreenButton.className = 'flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-150 ml-2';
      fullscreenButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
      fullscreenButton.title = 'Toggle fullscreen (F)';
      fullscreenButton.onclick = this.toggleFullscreen.bind(this);
      
      // Assemble navigation
      navContainer.appendChild(prevButton);
      navContainer.appendChild(slideCounter);
      navContainer.appendChild(nextButton);
      navContainer.appendChild(fullscreenButton);
      
      // Add to page
      document.body.appendChild(navContainer);
      
      // Store references for easy access
      this.navElements = {
        container: navContainer,
        prevButton,
        nextButton,
        counter: slideCounter,
        fullscreenButton
      };
      
      // Update button states
      this.updateNavigationState();
    }
    
    // Setup event listeners
    setupEventListeners() {
      // Keyboard navigation
      document.addEventListener('keydown', this.handleKeyboard);
      
      // Touch/swipe support for mobile
      this.setupTouchEvents();
      
      // Window resize handler
      window.addEventListener('resize', () => {
        this.updateSlideLayout();
      });
      
      // Handle fullscreen changes across different browsers
      document.addEventListener('fullscreenchange', () => {
        this.updateFullscreenButton();
      });
      document.addEventListener('webkitfullscreenchange', () => {
        this.updateFullscreenButton();
      });
      document.addEventListener('mozfullscreenchange', () => {
        this.updateFullscreenButton();
      });
      document.addEventListener('msfullscreenchange', () => {
        this.updateFullscreenButton();
      });
      
      // Also listen for resize events that might indicate fullscreen changes
      window.addEventListener('resize', () => {
        // Small delay to ensure screen dimensions are updated
        setTimeout(() => this.updateFullscreenButton(), 100);
      });
    }
    
    // Handle keyboard navigation
    handleKeyboard(event) {
      switch (event.key) {
        case 'ArrowRight':
        case ' ': // Space bar
          event.preventDefault();
          this.nextSlide();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          this.prevSlide();
          break;
        case 'Home':
          event.preventDefault();
          this.goToSlide(0);
          break;
        case 'End':
          event.preventDefault();
          this.goToSlide(this.slides.length - 1);
          break;
        case 'Escape':
          event.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
        case 'f':
        case 'F':
          event.preventDefault();
          this.toggleFullscreen();
          break;
      }
    }
    
    // Setup touch events for mobile
    setupTouchEvents() {
      let startX = 0;
      let endX = 0;
      
      document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
      });
      
      document.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        this.handleTouch();
      });
      
      this.handleTouch = () => {
        const threshold = 50; // Minimum swipe distance
        const diff = startX - endX;
        
        if (Math.abs(diff) > threshold) {
          if (diff > 0) {
            // Swipe left - next slide
            this.nextSlide();
          } else {
            // Swipe right - previous slide
            this.prevSlide();
          }
        }
      };
    }
    
    // Navigate to next slide
    nextSlide() {
      if (this.currentSlide < this.slides.length - 1) {
        this.goToSlide(this.currentSlide + 1);
      }
    }
    
    // Navigate to previous slide
    prevSlide() {
      if (this.currentSlide > 0) {
        this.goToSlide(this.currentSlide - 1);
      }
    }
    
    // Navigate to specific slide
    goToSlide(index) {
      if (index < 0 || index >= this.slides.length) return;
      
      // Hide current slide
      if (this.slides[this.currentSlide]) {
        this.slides[this.currentSlide].classList.remove('slide-active');
      }
      
      // Show new slide
      this.currentSlide = index;
      this.slides[this.currentSlide].classList.add('slide-active');
      
      // Update navigation state
      this.updateNavigationState();
      
      // Scroll to top of new slide
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Trigger custom event
      const event = new CustomEvent('slideChange', {
        detail: { currentSlide: this.currentSlide, totalSlides: this.slides.length }
      });
      document.dispatchEvent(event);
    }
    
    // Update navigation button states and counter
    updateNavigationState() {
      if (!this.navElements) return;
      
      // Update counter
      this.navElements.counter.textContent = \`\${this.currentSlide + 1} / \${this.slides.length}\`;
      
      // Update button states
      this.navElements.prevButton.disabled = this.currentSlide === 0;
      this.navElements.nextButton.disabled = this.currentSlide === this.slides.length - 1;
    }
    
    // Update slide layout on resize
    updateSlideLayout() {
      this.slides.forEach(slide => {
        // Ensure slides maintain full height
        slide.style.minHeight = window.innerHeight + 'px';
      });
    }
    
    // Toggle fullscreen mode
    toggleFullscreen() {
      try {
        if (!document.fullscreenElement) {
          // Try different approaches for fullscreen
          const requestFullscreen = document.documentElement.requestFullscreen || 
                                   document.documentElement.webkitRequestFullscreen || 
                                   document.documentElement.mozRequestFullScreen || 
                                   document.documentElement.msRequestFullscreen;
          
          if (requestFullscreen) {
            requestFullscreen.call(document.documentElement).catch(err => {
              console.log(\`Error attempting to enable fullscreen: \${err.message}\`);
              // If iframe context, try to communicate with parent
              if (window.parent && window.parent !== window) {
                try {
                  window.parent.postMessage({ action: 'requestFullscreen' }, '*');
                } catch (e) {
                  console.log('Could not communicate with parent window for fullscreen');
                }
              }
            });
          } else {
            console.log('Fullscreen API not supported');
          }
        } else {
          // Exit fullscreen
          const exitFullscreen = document.exitFullscreen || 
                                document.webkitExitFullscreen || 
                                document.mozCancelFullScreen || 
                                document.msExitFullscreen;
          
          if (exitFullscreen) {
            exitFullscreen.call(document).catch(err => {
              console.log(\`Error attempting to exit fullscreen: \${err.message}\`);
            });
          }
        }
      } catch (error) {
        // Fallback for browsers that don't support fullscreen API or in iframe contexts
        console.warn('Fullscreen API not supported or blocked:', error.message);
        
        // Try to communicate with parent window as fallback
        if (window.parent && window.parent !== window) {
          try {
            window.parent.postMessage({ 
              action: document.fullscreenElement ? 'exitFullscreen' : 'requestFullscreen' 
            }, '*');
          } catch (e) {
            console.log('Could not communicate with parent window for fullscreen');
          }
        }
      }
    }
    
    // Update fullscreen button icon
    updateFullscreenButton() {
      if (!this.navElements) return;
      
      // Check for fullscreen across different browsers and contexts
      const isFullscreen = document.fullscreenElement || 
                          document.webkitFullscreenElement || 
                          document.mozFullScreenElement || 
                          document.msFullscreenElement ||
                          // Check if we're in an iframe that might be fullscreen
                          (window.parent !== window && window.screen.height === window.innerHeight);
      
      if (isFullscreen) {
        // Compress/exit fullscreen icon
        this.navElements.fullscreenButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>';
        this.navElements.fullscreenButton.title = 'Exit fullscreen (F)';
      } else {
        // Expand/enter fullscreen icon
        this.navElements.fullscreenButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
        this.navElements.fullscreenButton.title = 'Toggle fullscreen (F)';
      }
    }
    
    // Public API methods
    getCurrentSlide() {
      return this.currentSlide;
    }
    
    getTotalSlides() {
      return this.slides.length;
    }
    
    destroy() {
      // Remove event listeners
      document.removeEventListener('keydown', this.handleKeyboard);
      document.removeEventListener('fullscreenchange', this.updateFullscreenButton);
      document.removeEventListener('webkitfullscreenchange', this.updateFullscreenButton);
      document.removeEventListener('mozfullscreenchange', this.updateFullscreenButton);
      document.removeEventListener('msfullscreenchange', this.updateFullscreenButton);
      
      // Remove navigation UI
      if (this.navElements && this.navElements.container) {
        this.navElements.container.remove();
      }
      
      // Reset slide styling
      this.slides.forEach(slide => {
        slide.classList.remove('slide-active');
      });
      
      this.isInitialized = false;
    }
  }
  
  // Initialize when DOM is ready
  function initSlideNavigation() {
    const navigator = new SlideNavigator();
    navigator.init();
    
    // Make navigator globally accessible
    window.slideNavigator = navigator;
  }
  
  // Auto-initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlideNavigation);
  } else {
    initSlideNavigation();
  }
  
})();
</script>

<style>
/* Additional CSS for slide transitions and styling */
.slide {
  display: none;
  opacity: 1;
  transform: translateX(0);
  transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
}

.slide.slide-active {
  display: flex;
}

.slide.slide-entering {
  opacity: 0;
  transform: translateX(50px);
}

.slide.slide-exiting {
  opacity: 0;
  transform: translateX(-50px);
}

/* Hide navigation in print mode */
@media print {
  #slide-navigation {
    display: none !important;
  }
  
  .slide {
    page-break-after: always;
    min-height: 100vh !important;
    display: block !important;
  }
}

/* Responsive navigation for mobile */
@media (max-width: 640px) {
  #slide-navigation {
    bottom: 1rem;
    padding: 0.5rem 1rem;
    gap: 0.5rem;
  }
  
  #slide-navigation button {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  #slide-counter {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    height: 2.5rem;
  }
}
</style>
`;

// Export function to inject navigation into HTML
export const injectSlideNavigation = (htmlContent) => {
  // Check if navigation script is already injected to prevent duplicates
  if (htmlContent.includes('id="slide-navigation"')) {
    return htmlContent;
  }
  
  // Find the closing body tag and insert navigation script before it
  const bodyCloseIndex = htmlContent.lastIndexOf('</body>');
  if (bodyCloseIndex === -1) {
    // If no closing body tag found, append to end
    return htmlContent + slideNavigationScript;
  }
  
  return htmlContent.slice(0, bodyCloseIndex) + 
         slideNavigationScript + 
         htmlContent.slice(bodyCloseIndex);
};

// Export raw script content for direct usage
export const getSlideNavigationScript = () => slideNavigationScript;