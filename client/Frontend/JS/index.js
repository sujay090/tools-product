/**
 * ToolsHub Pro - Modern JavaScript Application
 * Enhanced with modern features, performance optimizations, and better UX
 */

class ToolsHubApp {
  constructor() {
    this.isMenuOpen = false;
    this.loadingScreen = null;
    this.observers = new Map();
    
    // Initialize app when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    try {
      this.setupLoadingScreen();
      this.setupThemeSystem();
      this.setupNavigation();
      this.setupAnimations();
      this.setupCounters();
      this.setupPerformanceOptimizations();
      this.setupAnalytics();
      this.updateYear();
      
      console.log('🚀 ToolsHub Pro initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing ToolsHub Pro:', error);
    }
  }

  // ===== LOADING SCREEN =====
  setupLoadingScreen() {
    this.loadingScreen = document.getElementById('loading-screen');
    
    if (this.loadingScreen) {
      // Hide loading screen after a short delay
      setTimeout(() => {
        this.loadingScreen.style.opacity = '0';
        this.loadingScreen.style.transition = 'opacity 0.5s ease-in-out';
        
        setTimeout(() => {
          this.loadingScreen.style.display = 'none';
        }, 500);
      }, 1000);
    }
  }

  // ===== THEME SYSTEM =====
  setupThemeSystem() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.themeToggleMobile = document.getElementById('theme-toggle-mobile');
    
    // Apply saved theme or system preference
    this.applyTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.applyTheme();
      }
    });
    
    // Add event listeners
    this.themeToggle?.addEventListener('click', () => this.toggleTheme());
    this.themeToggleMobile?.addEventListener('click', () => this.toggleTheme());
  }

  updateThemeIcon() {
    const isDark = document.documentElement.classList.contains('dark');
    const sunIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`;
    const moonIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;
    
    const icon = isDark ? moonIcon : sunIcon;
    if (this.themeToggle) this.themeToggle.innerHTML = icon;
    if (this.themeToggleMobile) this.themeToggleMobile.innerHTML = icon;
  }

  applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemDark);
    
    document.documentElement.classList.toggle('dark', shouldBeDark);
    this.updateThemeIcon();
    
    // Update theme-color meta tag
    const themeColor = shouldBeDark ? '#1F2937' : '#6366F1';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
  }

  toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const newTheme = isDark ? 'light' : 'dark';
    
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
    this.updateThemeIcon();
    
    // Animate the theme change
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  // ===== NAVIGATION =====
  setupNavigation() {
    this.setupMobileMenu();
    this.setupSmoothScrolling();
    this.setupDropdowns();
  }

  setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuButton?.addEventListener('click', () => {
      this.isMenuOpen = !this.isMenuOpen;
      mobileMenu?.classList.toggle('hidden');
      
      // Animate hamburger icon
      const icon = mobileMenuButton.querySelector('svg');
      if (icon) {
        icon.style.transform = this.isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        icon.style.transition = 'transform 0.3s ease';
      }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && mobileMenuButton && mobileMenu) {
        const isOutside = !mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target);
        if (isOutside) {
          this.isMenuOpen = false;
          mobileMenu.classList.add('hidden');
        }
      }
    });
  }

  setupSmoothScrolling() {
    // Enhanced smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  setupDropdowns() {
    const dropdowns = document.querySelectorAll('[class*="group"]');
    
    dropdowns.forEach(dropdown => {
      const menu = dropdown.querySelector('[class*="group-hover"]');
      if (menu) {
        // Add keyboard navigation
        dropdown.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            menu.classList.add('opacity-0', 'invisible');
          }
        });
      }
    });
  }

  // ===== ANIMATIONS =====
  setupAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('section > div').forEach(el => {
      observer.observe(el);
    });
    
    this.observers.set('scroll', observer);
  }

  // ===== COUNTERS =====
  setupCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    
    const countUp = (element, target) => {
      const increment = target / 100;
      let current = 0;
      
      const updateCounter = () => {
        if (current < target) {
          current += increment;
          if (target >= 1000) {
            element.textContent = (current / 1000).toFixed(1) + 'K';
          } else {
            element.textContent = Math.floor(current);
          }
          requestAnimationFrame(updateCounter);
        } else {
          if (target >= 1000) {
            element.textContent = (target / 1000).toFixed(1) + 'K';
          } else {
            element.textContent = target;
          }
        }
      };
      
      updateCounter();
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseFloat(entry.target.getAttribute('data-counter'));
          countUp(entry.target, target);
          counterObserver.unobserve(entry.target);
        }
      });
    });
    
    counters.forEach(counter => counterObserver.observe(counter));
    this.observers.set('counter', counterObserver);
  }

  // ===== PERFORMANCE OPTIMIZATIONS =====
  setupPerformanceOptimizations() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
    this.observers.set('images', imageObserver);
    
    // Debounce scroll events
    let scrollTimeout;
    const debouncedScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Handle scroll events here if needed
        this.updateScrollProgress();
      }, 10);
    };
    
    window.addEventListener('scroll', debouncedScroll, { passive: true });
  }

  updateScrollProgress() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    // Update any scroll progress indicators here
    document.documentElement.style.setProperty('--scroll-progress', `${scrolled}%`);
  }

  // ===== ANALYTICS =====
  setupAnalytics() {
    // Track user interactions (privacy-friendly)
    const trackEvent = (event, data) => {
      // Only track if user hasn't opted out
      if (!localStorage.getItem('analytics-disabled')) {
        console.log(`📊 Event: ${event}`, data);
        // Add your analytics implementation here
      }
    };
    
    // Track theme changes
    this.themeToggle?.addEventListener('click', () => {
      trackEvent('theme_toggle', { theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light' });
    });
    
    // Track page load performance
    window.addEventListener('load', () => {
      const perfData = performance.timing;
      const loadTime = perfData.loadEventEnd - perfData.navigationStart;
      trackEvent('page_load', { loadTime: loadTime });
    });
  }

  // ===== UTILITIES =====
  updateYear() {
    const yearElement = document.getElementById('year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  // Cleanup method
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('🔧 SW registered:', registration))
      .catch(error => console.log('❌ SW registration failed:', error));
  });
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (event) => {
  console.error('🚨 Global error:', event.error);
  // Send error to monitoring service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// ===== INITIALIZE APPLICATION =====
const app = new ToolsHubApp();

// ===== EXPOSE TO GLOBAL SCOPE =====
window.ToolsHubApp = app;
