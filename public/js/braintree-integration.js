/**
 * Braintree Integration Module
 * Handles Braintree hosted fields setup and payment processing
 */

class BraintreeIntegration {
  constructor() {
    this.client = null;
    this.hostedFields = null;
    this.clientToken = null;
    this.isInitialized = false;
    
    // Field state tracking
    this.fieldStates = {
      number: { valid: false, focused: false },
      expirationDate: { valid: false, focused: false },
      cvv: { valid: false, focused: false },
      postalCode: { valid: false, focused: false },
    };
    
    // Event callbacks
    this.onFieldUpdate = null;
    this.onFieldFocus = null;
    this.onFieldBlur = null;
    this.onValidationChange = null;
    this.onPaymentSuccess = null;
    this.onPaymentError = null;
  }
  
  /**
   * Initialize Braintree integration
   */
  async initialize() {
    try {
      // Get client token from server
      await this.getClientToken();
      
      // Create Braintree client
      await this.createClient();
      
      // Setup hosted fields
      await this.setupHostedFields();
      
      this.isInitialized = true;
      console.log('✅ Braintree integration initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Braintree:', error);
      throw error;
    }
  }
  
  /**
   * Get client token from server
   */
  async getClientToken() {
    try {
      const response = await fetch('/client-token');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get client token');
      }
      
      this.clientToken = data.clientToken;
      console.log('✅ Client token received');
    } catch (error) {
      console.error('❌ Error getting client token:', error);
      throw error;
    }
  }
  
  /**
   * Create Braintree client
   */
  async createClient() {
    try {
      this.client = await braintree.client.create({
        authorization: this.clientToken,
      });
      
      console.log('✅ Braintree client created');
    } catch (error) {
      console.error('❌ Error creating Braintree client:', error);
      throw error;
    }
  }
  
  /**
   * Setup Braintree hosted fields
   */
  async setupHostedFields() {
    try {
      this.hostedFields = await braintree.hostedFields.create({
        client: this.client,
        styles: this.getFieldStyles(),
        fields: {
          number: {
            container: '#card-number',
            placeholder: '1234 5678 9012 3456',
          },
          expirationDate: {
            container: '#expiration-date',
            placeholder: 'MM/YY',
          },
          cvv: {
            container: '#cvv',
            placeholder: '123',
          },
          postalCode: {
            container: '#postal-code',
            placeholder: '12345',
          },
        },
      });
      
      this.setupEventListeners();
      console.log('✅ Hosted fields created');
    } catch (error) {
      console.error('❌ Error creating hosted fields:', error);
      throw error;
    }
  }
  
  /**
   * Get styles for hosted fields - Updated for card overlay
   */
  getFieldStyles() {
    return {
      input: {
        'font-size': '14px',
        'font-family': 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        'font-weight': '500',
        color: '#333333',
        'background-color': 'transparent',
        border: 'none',
        outline: 'none',
        'line-height': '20px',
        height: '100%',
        width: '100%',
        padding: '8px 12px',
        'box-sizing': 'border-box',
        '::placeholder': {
          color: 'rgba(51, 51, 51, 0.6)',
          'font-style': 'italic',
        },
      },
      ':focus': {
        color: '#222222',
      },
      '.valid': {
        color: '#2d5016',
      },
      '.invalid': {
        color: '#cc0000',
      },
    };
  }
  
  /**
   * Setup event listeners for hosted fields
   */
  setupEventListeners() {
    // Field focus events
    this.hostedFields.on('focus', (event) => {
      this.handleFieldFocus(event);
    });
    
    // Field blur events
    this.hostedFields.on('blur', (event) => {
      this.handleFieldBlur(event);
    });
    
    // Field validation events
    this.hostedFields.on('validityChange', (event) => {
      this.handleValidityChange(event);
    });
    
    // Card type detection
    this.hostedFields.on('cardTypeChange', (event) => {
      this.handleCardTypeChange(event);
    });
    
    // Input events for real-time updates
    this.hostedFields.on('inputSubmitRequest', (event) => {
      this.processPayment();
    });
  }
  
  /**
   * Handle field focus
   */
  handleFieldFocus(event) {
    const fieldName = event.emittedBy;
    this.fieldStates[fieldName].focused = true;
    
    // Update field container styling
    this.updateFieldStyling(fieldName, 'focused');
    
    // Notify 3D scene
    if (this.onFieldFocus) {
      this.onFieldFocus(fieldName);
    }
    
    console.log(`🎯 Field focused: ${fieldName}`);
  }
  
  /**
   * Handle field blur
   */
  handleFieldBlur(event) {
    const fieldName = event.emittedBy;
    this.fieldStates[fieldName].focused = false;
    
    // Update field container styling
    this.updateFieldStyling(fieldName, 'blurred');
    
    // Notify 3D scene
    if (this.onFieldBlur) {
      this.onFieldBlur(fieldName);
    }
    
    console.log(`👁️ Field blurred: ${fieldName}`);
  }
  
  /**
   * Handle field validity changes
   */
  handleValidityChange(event) {
    const fieldName = event.emittedBy;
    const field = event.fields[fieldName];
    
    this.fieldStates[fieldName].valid = field.isValid;
    
    // Update field container styling
    if (field.isValid) {
      this.updateFieldStyling(fieldName, 'valid');
    } else if (!field.isPotentiallyValid) {
      this.updateFieldStyling(fieldName, 'invalid');
      this.showFieldError(fieldName, 'Please enter a valid value');
    } else {
      this.updateFieldStyling(fieldName, 'neutral');
      this.hideFieldError(fieldName);
    }
    
    // Update submit button state
    this.updateSubmitButtonState();
    
    // Notify 3D scene about field updates
    if (this.onFieldUpdate && field.isValid) {
      // Note: We can't get the actual values for security reasons
      // But we can trigger visual updates
      this.onFieldUpdate(fieldName, field.isValid);
    }
    
    // Notify validation change callback
    if (this.onValidationChange) {
      this.onValidationChange(fieldName, field);
    }
    
    console.log(`✅ Field validation changed: ${fieldName} - Valid: ${field.isValid}`);
  }
  
  /**
   * Handle card type changes
   */
  handleCardTypeChange(event) {
    const cardType = event.cards[0];
    
    if (cardType) {
      console.log(`💳 Card type detected: ${cardType.type}`);
      
      // Update card visual in 3D scene
      if (this.onFieldUpdate) {
        this.onFieldUpdate('cardType', cardType.type);
      }
    }
  }
  
  /**
   * Update field container styling
   */
  updateFieldStyling(fieldName, state) {
    const container = document.getElementById(fieldName);
    if (!container) return;
    
    // Remove existing state classes
    container.classList.remove('focused', 'valid', 'invalid', 'neutral');
    
    // Add new state class
    container.classList.add(state);
  }
  
  /**
   * Show field error message
   */
  showFieldError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }
  }
  
  /**
   * Hide field error message
   */
  hideFieldError(fieldName) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.remove('show');
    }
  }
  
  /**
   * Update submit button state
   */
  updateSubmitButtonState() {
    const submitButton = document.getElementById('submit-button');
    if (!submitButton) return;
    
    const allFieldsValid = Object.values(this.fieldStates).every(field => field.valid);
    
    submitButton.disabled = !allFieldsValid;
    
    if (allFieldsValid) {
      submitButton.classList.add('pulse');
    } else {
      submitButton.classList.remove('pulse');
    }
  }
  
  /**
   * Process payment
   */
  async processPayment(amount = '29.99') {
    if (!this.isInitialized || !this.hostedFields) {
      throw new Error('Braintree not initialized');
    }
    
    try {
      // Show loading state
      this.setPaymentProcessing(true);
      
      // Tokenize the payment method
      const payload = await this.hostedFields.tokenize();
      
      if (!payload.nonce) {
        throw new Error('Failed to tokenize payment method');
      }
      
      console.log('🔐 Payment method tokenized successfully');
      
      // Send payment to server
      const response = await fetch('/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodNonce: payload.nonce,
          amount: amount,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Payment successful
        console.log('🎉 Payment successful:', result.transaction);
        this.handlePaymentSuccess(result.transaction);
      } else {
        // Payment failed
        console.error('💳 Payment failed:', result.error);
        this.handlePaymentError(result.error);
      }
    } catch (error) {
      console.error('❌ Payment processing error:', error);
      this.handlePaymentError(error.message || 'Payment processing failed');
    } finally {
      // Hide loading state
      this.setPaymentProcessing(false);
    }
  }
  
  /**
   * Set payment processing state
   */
  setPaymentProcessing(processing) {
    const submitButton = document.getElementById('submit-button');
    const btnText = submitButton.querySelector('.btn-text');
    const btnSpinner = submitButton.querySelector('.btn-spinner');
    
    if (processing) {
      submitButton.disabled = true;
      btnText.style.display = 'none';
      btnSpinner.style.display = 'block';
    } else {
      submitButton.disabled = !Object.values(this.fieldStates).every(field => field.valid);
      btnText.style.display = 'block';
      btnSpinner.style.display = 'none';
    }
  }
  
  /**
   * Handle successful payment
   */
  handlePaymentSuccess(transaction) {
    this.showPaymentStatus('success', `Payment successful! Transaction ID: ${transaction.id}`);
    
    // Notify callback
    if (this.onPaymentSuccess) {
      this.onPaymentSuccess(transaction);
    }
    
    // Reset form after delay
    setTimeout(() => {
      this.resetForm();
    }, 3000);
  }
  
  /**
   * Handle payment error
   */
  handlePaymentError(error) {
    this.showPaymentStatus('error', `Payment failed: ${error}`);
    
    // Notify callback
    if (this.onPaymentError) {
      this.onPaymentError(error);
    }
  }
  
  /**
   * Show payment status message
   */
  showPaymentStatus(type, message) {
    const statusElement = document.getElementById('payment-status');
    const statusIcon = statusElement.querySelector('.status-icon');
    const statusMessage = statusElement.querySelector('.status-message');
    
    // Set status content
    statusIcon.textContent = type === 'success' ? '✅' : '❌';
    statusMessage.textContent = message;
    
    // Set status styling
    statusElement.className = `payment-status ${type}`;
    statusElement.style.display = 'block';
    
    // Hide after delay
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 5000);
  }
  
  /**
   * Reset form to initial state
   */
  resetForm() {
    // Clear hosted fields
    if (this.hostedFields) {
      this.hostedFields.clear();
    }
    
    // Reset field states
    Object.keys(this.fieldStates).forEach(fieldName => {
      this.fieldStates[fieldName] = { valid: false, focused: false };
      this.updateFieldStyling(fieldName, 'neutral');
      this.hideFieldError(fieldName);
    });
    
    // Reset submit button
    this.updateSubmitButtonState();
    
    // Hide payment status
    const statusElement = document.getElementById('payment-status');
    statusElement.style.display = 'none';
  }
  
  /**
   * Get current field states
   */
  getFieldStates() {
    return { ...this.fieldStates };
  }
  
  /**
   * Check if all fields are valid
   */
  isFormValid() {
    return Object.values(this.fieldStates).every(field => field.valid);
  }
  
  /**
   * Dispose of Braintree resources
   */
  dispose() {
    if (this.hostedFields) {
      this.hostedFields.teardown();
      this.hostedFields = null;
    }
    
    this.client = null;
    this.clientToken = null;
    this.isInitialized = false;
    
    console.log('🧹 Braintree integration disposed');
  }
}

// Export for use in other modules
window.BraintreeIntegration = BraintreeIntegration;
