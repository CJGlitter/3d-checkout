/**
 * 3D Checkout Application Server
 * Express server with Braintree integration for secure payment processing
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Braintree SDK
const braintree = require('braintree');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Braintree gateway
const gateway = new braintree.BraintreeGateway({
  environment: process.env.BRAINTREE_ENVIRONMENT === 'production' 
    ? braintree.Environment.Production 
    : braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

/**
 * Generate and return a client token for Braintree hosted fields
 */
app.get('/client-token', async (req, res) => {
  try {
    const response = await gateway.clientToken.generate({
      // Optional: specify customer ID if you have one
      // customerId: 'customer_id'
    });
    
    res.json({
      success: true,
      clientToken: response.clientToken,
    });
  } catch (error) {
    console.error('Error generating client token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate client token',
    });
  }
});

/**
 * Process payment transaction
 */
app.post('/checkout', async (req, res) => {
  const { paymentMethodNonce, amount } = req.body;
  
  // Validate required fields
  if (!paymentMethodNonce || !amount) {
    return res.status(400).json({
      success: false,
      error: 'Payment method nonce and amount are required',
    });
  }
  
  try {
    // Create transaction
    const result = await gateway.transaction.sale({
      amount: amount,
      paymentMethodNonce: paymentMethodNonce,
      options: {
        submitForSettlement: true,
      },
    });
    
    if (result.success) {
      res.json({
        success: true,
        transaction: {
          id: result.transaction.id,
          amount: result.transaction.amount,
          status: result.transaction.status,
          createdAt: result.transaction.createdAt,
        },
      });
    } else {
      console.error('Transaction failed:', result.message);
      res.status(400).json({
        success: false,
        error: result.message || 'Transaction failed',
      });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * Serve the main application
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Error handling middleware
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 3D Checkout server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💳 Braintree Environment: ${process.env.BRAINTREE_ENVIRONMENT}`);
  console.log(`📱 Access the app at: http://localhost:${PORT}`);
});

module.exports = app;
