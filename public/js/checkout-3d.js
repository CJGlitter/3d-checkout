/**
 * Main 3D Checkout Application
 * Coordinates between Three.js scene and Braintree integration
 */

class CheckoutApp {
  constructor() {
    this.scene = null;
    this.braintree = null;
    this.isInitialized = false;
    this.loadingScreen = null;
    
    // DOM elements
    this.canvas = null;
    this.checkoutForm = null;
    this.submitButton = null;
    this.sceneControls = null;
    
    // Application state
    this.currentStep = 'loading'; // loading, form, processing, complete
    this.paymentAmount = '29.99';
  }
  
  /**
   * Initialize the complete application
   */
  async initialize() {
    try {
      console.log('🚀 Initializing 3D Checkout Application...');
      
      // Get DOM elements
      try {
        this.getDOMElements();
        console.log('✅ DOM elements found');
      } catch (error) {
        console.error('❌ DOM elements error:', error);
        throw new Error(`DOM setup failed: ${error.message}`);
      }
      
      // Show loading screen
      this.showLoadingScreen();
      
      // Initialize Three.js scene
      try {
        console.log('🎨 Starting Three.js initialization...');
        await this.initializeScene();
        console.log('✅ Three.js scene initialized');
      } catch (error) {
        console.error('❌ Three.js initialization error:', error);
        throw new Error(`3D scene initialization failed: ${error.message}`);
      }
      
      // Initialize Braintree integration
      try {
        console.log('💳 Starting Braintree initialization...');
        await this.initializeBraintree();
        console.log('✅ Braintree integration initialized');
      } catch (error) {
        console.error('❌ Braintree initialization error:', error);
        throw new Error(`Braintree initialization failed: ${error.message}`);
      }
      
      // Setup event listeners
      try {
        this.setupEventListeners();
        console.log('✅ Event listeners setup');
      } catch (error) {
        console.error('❌ Event listeners error:', error);
        throw new Error(`Event setup failed: ${error.message}`);
      }
      
      // Hide loading screen and show app
      this.hideLoadingScreen();
      
      // Setup initial animations
      try {
        this.setupInitialAnimations();
        console.log('✅ Initial animations setup');
      } catch (error) {
        console.error('❌ Animation setup error:', error);
        // Don't throw here, animations are not critical
      }
      
      this.isInitialized = true;
      this.currentStep = 'form';
      
      console.log('✅ 3D Checkout Application initialized successfully!');
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      this.showError(`Failed to initialize checkout: ${error.message}. Please refresh and try again.`);
      throw error;
    }
  }
  
  /**
   * Get references to DOM elements
   */
  getDOMElements() {
    this.loadingScreen = document.getElementById('loading-screen');
    this.canvas = document.getElementById('three-canvas');
    this.checkoutForm = document.getElementById('checkout-form');
    this.submitButton = document.getElementById('submit-button');
    this.sceneControls = document.getElementById('scene-controls');
    
    // Validate required elements
    const requiredElements = [
      { element: this.loadingScreen, name: 'loading-screen' },
      { element: this.canvas, name: 'three-canvas' },
      { element: this.checkoutForm, name: 'checkout-form' },
      { element: this.submitButton, name: 'submit-button' },
    ];
    
    for (const { element, name } of requiredElements) {
      if (!element) {
        throw new Error(`Required element not found: ${name}`);
      }
    }
  }
  
  /**
   * Initialize Three.js scene
   */
  async initializeScene() {
    try {
      console.log('🎨 Initializing 3D scene...');
      
      this.scene = new ThreeScene(this.canvas);
      
      // Set up scene event callbacks
      this.scene.onCardUpdate = this.handleCardUpdate.bind(this);
      this.scene.onFieldFocus = this.handleFieldFocus.bind(this);
      this.scene.onFieldBlur = this.handleFieldBlur.bind(this);
      
      console.log('✅ 3D scene initialized');
    } catch (error) {
      console.error('❌ Error initializing 3D scene:', error);
      throw error;
    }
  }
  
  /**
   * Initialize Braintree integration
   */
  async initializeBraintree() {
    try {
      console.log('💳 Initializing Braintree integration...');
      
      this.braintree = new BraintreeIntegration();
      
      // Set up Braintree event callbacks
      this.braintree.onFieldUpdate = this.handleBraintreeFieldUpdate.bind(this);
      this.braintree.onFieldFocus = this.handleBraintreeFieldFocus.bind(this);
      this.braintree.onFieldBlur = this.handleBraintreeFieldBlur.bind(this);
      this.braintree.onValidationChange = this.handleValidationChange.bind(this);
      this.braintree.onPaymentSuccess = this.handlePaymentSuccess.bind(this);
      this.braintree.onPaymentError = this.handlePaymentError.bind(this);
      
      await this.braintree.initialize();
      
      console.log('✅ Braintree integration initialized');
    } catch (error) {
      console.error('❌ Error initializing Braintree:', error);
      throw error;
    }
  }
  
  /**
   * Setup application event listeners
   */
  setupEventListeners() {
    // Form submission
    this.checkoutForm.addEventListener('submit', this.handleFormSubmit.bind(this));
    
    // Scene control buttons
    if (this.sceneControls) {
      const resetCameraBtn = this.sceneControls.querySelector('#reset-camera');
      const toggleThemeBtn = this.sceneControls.querySelector('#toggle-theme');
      const toggleParticlesBtn = this.sceneControls.querySelector('#toggle-particles');
      
      if (resetCameraBtn) {
        resetCameraBtn.addEventListener('click', () => {
          this.scene.resetCamera();
        });
      }
      
      if (toggleThemeBtn) {
        toggleThemeBtn.addEventListener('click', () => {
          this.scene.toggleTheme();
        });
      }
      
      if (toggleParticlesBtn) {
        toggleParticlesBtn.addEventListener('click', () => {
          this.scene.toggleParticles();
        });
      }
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboard.bind(this));
    
    // Window events
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }
  
  /**
   * Show loading screen
   */
  showLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.style.display = 'flex';
      this.loadingScreen.style.opacity = '1';
    }
  }
  
  /**
   * Hide loading screen with animation
   */
  hideLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.style.opacity = '0';
      setTimeout(() => {
        this.loadingScreen.style.display = 'none';
      }, 500);
    }
  }
  
  /**
   * Setup initial animations for UI elements
   */
  setupInitialAnimations() {
    // Animate form container
    const formContainer = document.getElementById('checkout-form-container');
    if (formContainer) {
      formContainer.classList.add('slide-up');
    }
    
    // Animate header
    const header = document.querySelector('.checkout-header');
    if (header) {
      header.classList.add('fade-in');
    }
    
    // Animate scene controls
    if (this.sceneControls) {
      this.sceneControls.classList.add('fade-in');
    }
  }
  
  /**
   * Handle form submission
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    
    if (!this.braintree || !this.braintree.isFormValid()) {
      console.warn('⚠️ Form is not valid, cannot submit');
      return;
    }
    
    try {
      this.currentStep = 'processing';
      await this.braintree.processPayment(this.paymentAmount);
    } catch (error) {
      console.error('❌ Payment processing failed:', error);
      this.handlePaymentError(error.message);
    }
  }
  
  /**
   * Handle card data updates from 3D scene
   */
  handleCardUpdate(field, value) {
    console.log(`🎨 3D scene card update: ${field} = ${value}`);
    // Additional visual feedback can be added here
  }
  
  /**
   * Handle field focus from 3D scene
   */
  handleFieldFocus(fieldName) {
    console.log(`🎯 3D scene field focus: ${fieldName}`);
    // Additional visual feedback can be added here
  }
  
  /**
   * Handle field blur from 3D scene
   */
  handleFieldBlur(fieldName) {
    console.log(`👁️ 3D scene field blur: ${fieldName}`);
    // Additional visual feedback can be added here
  }
  
  /**
   * Handle field updates from Braintree
   */
  handleBraintreeFieldUpdate(fieldName, isValid) {
    console.log(`💳 Braintree field update: ${fieldName} - Valid: ${isValid}`);
    
    // Update 3D scene
    if (this.scene && isValid) {
      // For security reasons, we can't pass actual values
      // But we can trigger visual updates based on validation
      this.scene.updateCardData(fieldName, isValid ? 'valid' : '');
    }
  }
  
  /**
   * Handle field focus from Braintree
   */
  handleBraintreeFieldFocus(fieldName) {
    console.log(`🎯 Braintree field focus: ${fieldName}`);
    
    // Update 3D scene
    if (this.scene) {
      this.scene.onFieldFocused(fieldName);
    }
  }
  
  /**
   * Handle field blur from Braintree
   */
  handleBraintreeFieldBlur(fieldName) {
    console.log(`👁️ Braintree field blur: ${fieldName}`);
    
    // Update 3D scene
    if (this.scene) {
      this.scene.onFieldBlurred(fieldName);
    }
  }
  
  /**
   * Handle validation changes
   */
  handleValidationChange(fieldName, field) {
    console.log(`✅ Validation change: ${fieldName}`, field);
    
    // Add any additional validation feedback here
    if (field.isValid) {
      this.showFieldSuccess(fieldName);
    }
  }
  
  /**
   * Handle successful payment
   */
  handlePaymentSuccess(transaction) {
    console.log('🎉 Payment successful!', transaction);
    
    this.currentStep = 'complete';
    
    // Trigger 3D success animation with transaction data
    if (this.scene) {
      this.scene.animateSuccess({
        transactionId: transaction.id,
        status: 'Successful',
        environment: this.braintree.environment
      });
    }
    
    // Show success message
    this.showSuccess(`Payment completed successfully! Transaction ID: ${transaction.id}`);
    
    // Analytics or tracking can be added here
    this.trackPaymentSuccess(transaction);
  }
  
  /**
   * Handle payment error
   */
  handlePaymentError(error) {
    console.error('❌ Payment error:', error);
    
    this.currentStep = 'form';
    
    // Show error message
    this.showError(error);
    
    // Analytics or tracking can be added here
    this.trackPaymentError(error);
  }
  
  /**
   * Show field success feedback
   */
  showFieldSuccess(fieldName) {
    const container = document.getElementById(fieldName);
    if (container) {
      container.classList.add('pulse');
      setTimeout(() => {
        container.classList.remove('pulse');
      }, 1000);
    }
  }
  
  /**
   * Show success message
   */
  showSuccess(message) {
    // This could be enhanced with a proper notification system
    console.log('✅ Success:', message);
  }
  
  /**
   * Show error message
   */
  showError(message) {
    // This could be enhanced with a proper notification system
    console.error('❌ Error:', message);
    
    // Show basic alert for now
    alert(`Error: ${message}`);
  }
  
  /**
   * Handle keyboard shortcuts
   */
  handleKeyboard(event) {
    // Escape key to reset camera
    if (event.key === 'Escape') {
      if (this.scene) {
        this.scene.resetCamera();
      }
    }
    
    // Enter key to submit form (if valid)
    if (event.key === 'Enter' && event.ctrlKey) {
      if (this.braintree && this.braintree.isFormValid()) {
        this.handleFormSubmit(event);
      }
    }
    
    // Space to toggle particles
    if (event.key === ' ' && event.ctrlKey) {
      event.preventDefault();
      if (this.scene) {
        this.scene.toggleParticles();
      }
    }
  }
  
  /**
   * Handle before page unload
   */
  handleBeforeUnload(event) {
    if (this.currentStep === 'processing') {
      event.preventDefault();
      event.returnValue = 'Payment is being processed. Are you sure you want to leave?';
      return event.returnValue;
    }
  }
  
  /**
   * Track payment success for analytics
   */
  trackPaymentSuccess(transaction) {
    // Add your analytics tracking here
    console.log('📊 Tracking payment success:', transaction.id);
    
    // Example: Google Analytics, Mixpanel, etc.
    // gtag('event', 'purchase', {
    //   transaction_id: transaction.id,
    //   value: transaction.amount,
    //   currency: 'USD'
    // });
  }
  
  /**
   * Track payment error for analytics
   */
  trackPaymentError(error) {
    // Add your analytics tracking here
    console.log('📊 Tracking payment error:', error);
    
    // Example: Error tracking service
    // Sentry.captureException(new Error(error));
  }
  
  /**
   * Get application state
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      currentStep: this.currentStep,
      braintreeInitialized: this.braintree?.isInitialized || false,
      sceneInitialized: !!this.scene,
      formValid: this.braintree?.isFormValid() || false,
    };
  }
  
  /**
   * Dispose of application resources
   */
  dispose() {
    console.log('🧹 Disposing 3D Checkout Application...');
    
    // Dispose Three.js scene
    if (this.scene) {
      this.scene.dispose();
      this.scene = null;
    }
    
    // Dispose Braintree integration
    if (this.braintree) {
      this.braintree.dispose();
      this.braintree = null;
    }
    
    // Remove event listeners
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    document.removeEventListener('keydown', this.handleKeyboard);
    
    this.isInitialized = false;
    console.log('✅ Application disposed');
  }
}

// Make CheckoutApp available globally
window.CheckoutApp = CheckoutApp;
