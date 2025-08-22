# 3D Checkout Experience

An innovative 3D checkout experience that combines Three.js for stunning visual effects with Braintree's hosted fields for secure payment processing.

![3D Checkout Demo](https://via.placeholder.com/800x400/1e3c72/ffffff?text=3D+Checkout+Experience)

## 🚀 Features

- **Immersive 3D Environment**: Beautiful Three.js scene with floating credit card and particle effects
- **Secure Payment Processing**: Braintree hosted fields ensure PCI compliance
- **Real-time Visual Feedback**: 3D animations respond to form interactions
- **Interactive Credit Card**: Card flips, glows, and updates based on user input
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Multiple Themes**: Switch between default, cyberpunk, and space themes
- **Post-processing Effects**: Bloom and other visual enhancements
- **Smooth Animations**: Tween-based animations for fluid interactions

## 🛠 Technical Stack

- **Backend**: Node.js, Express.js, Braintree SDK
- **Frontend**: Three.js, Braintree Hosted Fields, Vanilla JavaScript
- **Styling**: Modern CSS3 with glassmorphism effects
- **Security**: PCI-compliant payment processing with Braintree

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Braintree sandbox account

## 🚦 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd 3d-checkout
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Setup Braintree Credentials

1. Sign up for a [Braintree sandbox account](https://www.braintreepayments.com/sandbox)
2. Get your sandbox credentials from the Braintree Control Panel
3. Copy \`.env.example\` to \`.env\` and fill in your credentials:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit \`.env\`:
\`\`\`env
BRAINTREE_ENVIRONMENT=sandbox
BRAINTREE_MERCHANT_ID=your_merchant_id_here
BRAINTREE_PUBLIC_KEY=your_public_key_here
BRAINTREE_PRIVATE_KEY=your_private_key_here

PORT=3000
NODE_ENV=development
\`\`\`

### 4. Start the Application

\`\`\`bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
\`\`\`

### 5. Open in Browser

Navigate to \`http://localhost:3000\` to see the 3D checkout experience!

## 🎮 Usage

### Basic Checkout Flow

1. **Load the Application**: The 3D scene initializes with a floating credit card
2. **Enter Payment Details**: Use the hosted fields on the right side
3. **Real-time Feedback**: Watch the 3D card respond to your input
4. **Secure Processing**: Complete the payment with Braintree's secure backend
5. **Success Animation**: Enjoy the celebration effects upon successful payment

### Interactive Controls

- **🎯 Reset Camera**: Return camera to default position
- **🌙 Toggle Theme**: Switch between visual themes
- **✨ Toggle Particles**: Enable/disable particle effects
- **⌨️ Keyboard Shortcuts**:
  - \`Esc\`: Reset camera position
  - \`Ctrl + Enter\`: Submit form (if valid)
  - \`Ctrl + Space\`: Toggle particles

### Test Credit Card Numbers

Use these test numbers in the sandbox environment:

- **Visa**: 4111111111111111
- **Mastercard**: 5555555555554444
- **American Express**: 378282246310005
- **Discover**: 6011111111111117

**Expiry**: Any future date (e.g., 12/25)  
**CVV**: Any 3-4 digit number

## 🏗 Project Structure

\`\`\`
3d-checkout/
├── server.js                 # Express server with Braintree integration
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (not in repo)
├── .env.example              # Environment template
├── public/                   # Static frontend files
│   ├── index.html           # Main HTML structure
│   ├── css/
│   │   └── styles.css       # Styling and responsive design
│   ├── js/
│   │   ├── three-scene.js   # Three.js scene and 3D objects
│   │   ├── braintree-integration.js  # Braintree hosted fields
│   │   └── checkout-3d.js   # Main application logic
│   └── assets/              # Static assets (textures, models)
└── README.md                 # This file
\`\`\`

## 🎨 Customization

### Themes

The application supports multiple visual themes:

1. **Default**: Blue gradient with cool tones
2. **Cyberpunk**: Neon colors with futuristic feel
3. **Space**: Dark theme with cosmic elements

Add new themes by modifying the \`applyTheme()\` method in \`three-scene.js\`.

### 3D Models

Replace or enhance the credit card model by modifying the \`createCreditCard()\` method. You can:

- Load external 3D models using Three.js loaders
- Add more detailed geometry
- Implement custom shaders
- Add texture mapping

### Animations

Customize animations in the Three.js scene:

- Modify tween parameters for different effects
- Add new particle systems
- Implement custom shaders for advanced effects
- Create theme-specific animations

## 🔒 Security Considerations

- **PCI Compliance**: Braintree hosted fields ensure sensitive data never touches your servers
- **Environment Variables**: All credentials are stored securely in environment variables
- **HTTPS**: Use HTTPS in production for secure communication
- **CORS**: Configure CORS policies appropriately for your domain
- **Input Validation**: Server-side validation for all payment requests

## 📱 Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 11+
- **Edge**: 79+
- **Mobile**: iOS Safari 11+, Android Chrome 60+

WebGL support is required for 3D functionality.

## 🚀 Production Deployment

### Environment Setup

1. **Set Environment to Production**:
   \`\`\`env
   NODE_ENV=production
   BRAINTREE_ENVIRONMENT=production
   \`\`\`

2. **Use Production Braintree Credentials**:
   - Switch to live Braintree credentials
   - Ensure proper merchant verification

3. **Enable HTTPS**:
   - Configure SSL certificates
   - Update CORS policies
   - Set secure cookie flags

### Deployment Options

- **Heroku**: Easy deployment with automatic HTTPS
- **AWS**: EC2, Elastic Beanstalk, or Lambda
- **Vercel**: Serverless deployment
- **DigitalOcean**: VPS deployment

## 🐛 Troubleshooting

### Common Issues

1. **Braintree Initialization Fails**:
   - Check credentials in \`.env\` file
   - Verify sandbox vs production environment
   - Ensure network connectivity

2. **3D Scene Not Loading**:
   - Check browser WebGL support
   - Verify Three.js CDN links
   - Check console for JavaScript errors

3. **Payment Processing Errors**:
   - Verify test card numbers
   - Check Braintree transaction logs
   - Ensure proper server-side validation

### Debug Mode

Enable debug logging by setting:
\`\`\`env
NODE_ENV=development
\`\`\`

This will provide detailed console output for troubleshooting.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature-name\`
3. Commit changes: \`git commit -am 'Add feature'\`
4. Push to branch: \`git push origin feature-name\`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js**: Amazing 3D graphics library
- **Braintree**: Secure payment processing
- **Community**: Various open-source contributors

## 📞 Support

For support, email support@example.com or create an issue in the repository.

---

**Made with ❤️ and WebGL magic**
