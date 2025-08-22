/**
 * Three.js Scene Setup and 3D Credit Card Implementation
 * Handles all 3D rendering, animations, and visual effects
 */

class ThreeScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    this.controls = null;
    
    // 3D Objects
    this.creditCard = null;
    this.cardGroup = null;
    this.particles = null;
    this.ambientLight = null;
    this.directionalLight = null;
    
    // Animation properties
    this.clock = new THREE.Clock();
    this.isAnimating = true;
    this.currentTheme = 'default';
    this.particlesEnabled = true;
    
    // Card data
    this.cardData = {
      number: '',
      expirationDate: '',
      cvv: '',
      postalCode: '',
    };
    
    // Event listeners
    this.onCardUpdate = null;
    this.onFieldFocus = null;
    this.onFieldBlur = null;
    
    this.init();
  }
  
  /**
   * Initialize the Three.js scene
   */
  init() {
    try {
      console.log('🎨 Starting Three.js scene initialization...');
      this.setupScene();
      console.log('✅ Scene setup complete');
      
      this.setupCamera();
      console.log('✅ Camera setup complete');
      
      this.setupRenderer();
      console.log('✅ Renderer setup complete');
      
      this.setupLights();
      console.log('✅ Lights setup complete');
      
      this.setupControls();
      console.log('✅ Controls setup complete');
      
      this.createCreditCard();
      console.log('✅ Credit card created');
      
      this.createParticles();
      console.log('✅ Particles created');
      
      this.setupPostProcessing();
      console.log('✅ Post-processing setup complete');
      
      this.addEventListeners();
      console.log('✅ Event listeners added');
      
      this.animate();
      console.log('✅ Animation loop started');
    } catch (error) {
      console.error('❌ Error in Three.js scene initialization:', error);
      throw error;
    }
  }
  
  /**
   * Setup the basic Three.js scene
   */
  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x1e3c72, 10, 50);
    
    // Add background
    const loader = new THREE.CubeTextureLoader();
    const geometry = new THREE.SphereGeometry(100, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x1e3c72,
      side: THREE.BackSide,
    });
    const skybox = new THREE.Mesh(geometry, material);
    this.scene.add(skybox);
  }
  
  /**
   * Setup camera with proper positioning
   */
  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 8);
    this.camera.lookAt(0, 0, 0);
  }
  
  /**
   * Setup WebGL renderer with optimal settings
   */
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }
  
  /**
   * Setup lighting for the scene
   */
  setupLights() {
    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(this.ambientLight);
    
    // Directional light
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(5, 5, 5);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(this.directionalLight);
    
    // Point light for card highlighting
    const pointLight = new THREE.PointLight(0x4ecdc4, 0.8, 20);
    pointLight.position.set(0, 2, 4);
    this.scene.add(pointLight);
    
    // Rim light
    const rimLight = new THREE.DirectionalLight(0xff6b6b, 0.5);
    rimLight.position.set(-5, -5, -5);
    this.scene.add(rimLight);
  }
  
  /**
   * Setup camera controls
   */
  setupControls() {
    if (typeof THREE.OrbitControls === 'undefined') {
      console.warn('⚠️ OrbitControls not available, using basic camera setup');
      return;
    }
    
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;
    this.controls.maxDistance = 15;
    this.controls.minDistance = 5;
    this.controls.maxPolarAngle = Math.PI / 1.5;
    this.controls.minPolarAngle = Math.PI / 3;
  }
  
  /**
   * Create the 3D credit card
   */
  createCreditCard() {
    this.cardGroup = new THREE.Group();
    
    // Card geometry and material
    const cardGeometry = new THREE.BoxGeometry(4, 2.5, 0.1);
    const cardMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2c3e50,
      metalness: 0.1,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.9,
    });
    
    this.creditCard = new THREE.Mesh(cardGeometry, cardMaterial);
    this.creditCard.castShadow = true;
    this.creditCard.receiveShadow = true;
    this.cardGroup.add(this.creditCard);
    
    // Card details (text will be added dynamically)
    this.createCardDetails();
    
    // Card chip
    const chipGeometry = new THREE.BoxGeometry(0.3, 0.25, 0.05);
    const chipMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.1,
    });
    const chip = new THREE.Mesh(chipGeometry, chipMaterial);
    chip.position.set(-1.2, 0.5, 0.06);
    this.cardGroup.add(chip);
    
    // Card logo area
    const logoGeometry = new THREE.CircleGeometry(0.3, 32);
    const logoMaterial = new THREE.MeshBasicMaterial({
      color: 0x4ecdc4,
      transparent: true,
      opacity: 0.8,
    });
    const logo = new THREE.Mesh(logoGeometry, logoMaterial);
    logo.position.set(1.2, 0.5, 0.06);
    this.cardGroup.add(logo);
    
    // Position the card
    this.cardGroup.position.set(-3, 0, 0);
    this.cardGroup.rotation.y = Math.PI * 0.1;
    this.scene.add(this.cardGroup);
  }
  
  /**
   * Create card detail elements (number, expiry, etc.)
   */
  createCardDetails() {
    // Card number display
    this.cardNumberMesh = this.createTextMesh('**** **** **** ****', 0.2);
    this.cardNumberMesh.position.set(0, -0.3, 0.06);
    this.cardGroup.add(this.cardNumberMesh);
    
    // Expiry date display
    this.expiryMesh = this.createTextMesh('MM/YY', 0.15);
    this.expiryMesh.position.set(-0.8, -0.8, 0.06);
    this.cardGroup.add(this.expiryMesh);
    
    // CVV display (on back)
    this.cvvMesh = this.createTextMesh('***', 0.15);
    this.cvvMesh.position.set(0.8, -0.8, -0.06);
    this.cvvMesh.rotation.y = Math.PI;
    this.cardGroup.add(this.cvvMesh);
  }
  
  /**
   * Create text mesh for card details
   */
  createTextMesh(text, size) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    
    context.fillStyle = '#ffffff';
    context.font = `${size * 100}px Arial`;
    context.textAlign = 'center';
    context.fillText(text, canvas.width / 2, canvas.height / 2 + size * 30);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    
    const geometry = new THREE.PlaneGeometry(2, 0.5);
    return new THREE.Mesh(geometry, material);
  }
  
  /**
   * Create particle system
   */
  createParticles() {
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      // Position
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = (Math.random() - 0.5) * 20;
      positions[i + 2] = (Math.random() - 0.5) * 20;
      
      // Color
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.1 + 0.5, 0.7, 0.5);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }
  
  /**
   * Setup post-processing effects
   */
  setupPostProcessing() {
    // Skip post-processing for now to avoid compatibility issues
    // this.composer = new THREE.EffectComposer(this.renderer);
    
    // const renderPass = new THREE.RenderPass(this.scene, this.camera);
    // this.composer.addPass(renderPass);
    
    // const bloomPass = new THREE.UnrealBloomPass(
    //   new THREE.Vector2(window.innerWidth, window.innerHeight),
    //   0.5, // strength
    //   0.4, // radius
    //   0.85 // threshold
    // );
    // this.composer.addPass(bloomPass);
  }
  
  /**
   * Add event listeners
   */
  addEventListeners() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  /**
   * Handle window resize
   */
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Skip composer resize for now
    // if (this.composer) {
    //   this.composer.setSize(window.innerWidth, window.innerHeight);
    // }
  }
  
  /**
   * Update card data and visual representation
   */
  updateCardData(field, value) {
    this.cardData[field] = value;
    
    switch (field) {
      case 'number':
        this.updateCardNumber(value);
        break;
      case 'expirationDate':
        this.updateExpiryDate(value);
        break;
      case 'cvv':
        this.updateCVV(value);
        break;
    }
    
    // Trigger visual feedback
    this.animateCardUpdate(field);
  }
  
  /**
   * Update card number display
   */
  updateCardNumber(number) {
    const masked = number.replace(/\d(?=\d{4})/g, '*');
    const formatted = masked.replace(/(.{4})/g, '$1 ').trim();
    this.updateTextMesh(this.cardNumberMesh, formatted || '**** **** **** ****');
  }
  
  /**
   * Update expiry date display
   */
  updateExpiryDate(date) {
    this.updateTextMesh(this.expiryMesh, date || 'MM/YY');
  }
  
  /**
   * Update CVV display
   */
  updateCVV(cvv) {
    const masked = cvv.replace(/./g, '*');
    this.updateTextMesh(this.cvvMesh, masked || '***');
  }
  
  /**
   * Update text mesh content
   */
  updateTextMesh(mesh, text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    
    context.fillStyle = '#ffffff';
    context.font = '40px Arial';
    context.textAlign = 'center';
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 15);
    
    mesh.material.map.image = canvas;
    mesh.material.map.needsUpdate = true;
  }
  
  /**
   * Animate card update
   */
  animateCardUpdate(field) {
    const targetMesh = field === 'cvv' ? this.cvvMesh : this.cardNumberMesh;
    
    // Pulse animation
    const scale = { x: 1, y: 1, z: 1 };
    const tween = new TWEEN.Tween(scale)
      .to({ x: 1.1, y: 1.1, z: 1.1 }, 200)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate(() => {
        targetMesh.scale.set(scale.x, scale.y, scale.z);
      })
      .chain(
        new TWEEN.Tween(scale)
          .to({ x: 1, y: 1, z: 1 }, 200)
          .easing(TWEEN.Easing.Quadratic.Out)
          .onUpdate(() => {
            targetMesh.scale.set(scale.x, scale.y, scale.z);
          })
      );
    tween.start();
  }
  
  /**
   * Handle field focus
   */
  onFieldFocused(fieldName) {
    if (fieldName === 'cvv') {
      // Flip card to show back
      this.flipCardToBack();
    } else {
      // Ensure card is showing front
      this.flipCardToFront();
    }
    
    // Add glow effect
    this.addFieldGlow(fieldName);
  }
  
  /**
   * Handle field blur
   */
  onFieldBlurred(fieldName) {
    this.removeFieldGlow(fieldName);
  }
  
  /**
   * Flip card to back
   */
  flipCardToBack() {
    const targetRotation = { y: Math.PI };
    const tween = new TWEEN.Tween(this.cardGroup.rotation)
      .to(targetRotation, 800)
      .easing(TWEEN.Easing.Quadratic.InOut);
    tween.start();
  }
  
  /**
   * Flip card to front
   */
  flipCardToFront() {
    const targetRotation = { y: Math.PI * 0.1 };
    const tween = new TWEEN.Tween(this.cardGroup.rotation)
      .to(targetRotation, 800)
      .easing(TWEEN.Easing.Quadratic.InOut);
    tween.start();
  }
  
  /**
   * Add glow effect for field
   */
  addFieldGlow(fieldName) {
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x4ecdc4,
      transparent: true,
      opacity: 0.3,
    });
    
    const glowGeometry = new THREE.BoxGeometry(4.2, 2.7, 0.2);
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.name = 'fieldGlow';
    this.cardGroup.add(glow);
  }
  
  /**
   * Remove field glow effect
   */
  removeFieldGlow(fieldName) {
    const glow = this.cardGroup.getObjectByName('fieldGlow');
    if (glow) {
      this.cardGroup.remove(glow);
    }
  }
  
  /**
   * Animate success state
   */
  animateSuccess() {
    // Green glow animation
    const successMaterial = new THREE.MeshBasicMaterial({
      color: 0x51cf66,
      transparent: true,
      opacity: 0.5,
    });
    
    const successGeometry = new THREE.BoxGeometry(4.5, 3, 0.3);
    const successGlow = new THREE.Mesh(successGeometry, successMaterial);
    this.cardGroup.add(successGlow);
    
    // Particle burst
    this.createSuccessParticles();
    
    // Card celebration animation
    const celebrationTween = new TWEEN.Tween(this.cardGroup.position)
      .to({ y: 1 }, 500)
      .easing(TWEEN.Easing.Quadratic.Out)
      .chain(
        new TWEEN.Tween(this.cardGroup.position)
          .to({ y: 0 }, 500)
          .easing(TWEEN.Easing.Bounce.Out)
      );
    celebrationTween.start();
  }
  
  /**
   * Create success particle burst
   */
  createSuccessParticles() {
    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 2;
      positions[i + 1] = (Math.random() - 0.5) * 2;
      positions[i + 2] = (Math.random() - 0.5) * 2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0x51cf66,
      size: 0.1,
      transparent: true,
    });
    
    const burstParticles = new THREE.Points(geometry, material);
    burstParticles.position.copy(this.cardGroup.position);
    this.scene.add(burstParticles);
    
    // Animate particles
    const expandTween = new TWEEN.Tween(burstParticles.scale)
      .to({ x: 3, y: 3, z: 3 }, 1000)
      .easing(TWEEN.Easing.Quadratic.Out);
    
    const fadeTween = new TWEEN.Tween(material)
      .to({ opacity: 0 }, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onComplete(() => {
        this.scene.remove(burstParticles);
      });
    
    expandTween.start();
    fadeTween.start();
  }
  
  /**
   * Reset camera position
   */
  resetCamera() {
    const targetPosition = { x: 0, y: 0, z: 8 };
    const tween = new TWEEN.Tween(this.camera.position)
      .to(targetPosition, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        this.camera.lookAt(0, 0, 0);
      });
    tween.start();
  }
  
  /**
   * Toggle theme
   */
  toggleTheme() {
    const themes = ['default', 'cyberpunk', 'space'];
    const currentIndex = themes.indexOf(this.currentTheme);
    this.currentTheme = themes[(currentIndex + 1) % themes.length];
    this.applyTheme(this.currentTheme);
  }
  
  /**
   * Apply theme colors and effects
   */
  applyTheme(theme) {
    switch (theme) {
      case 'cyberpunk':
        this.scene.fog.color.setHex(0x330066);
        this.creditCard.material.color.setHex(0x1a1a2e);
        break;
      case 'space':
        this.scene.fog.color.setHex(0x000011);
        this.creditCard.material.color.setHex(0x0f0f23);
        break;
      default:
        this.scene.fog.color.setHex(0x1e3c72);
        this.creditCard.material.color.setHex(0x2c3e50);
        break;
    }
  }
  
  /**
   * Toggle particles
   */
  toggleParticles() {
    this.particlesEnabled = !this.particlesEnabled;
    this.particles.visible = this.particlesEnabled;
  }
  
  /**
   * Main animation loop
   */
  animate() {
    if (!this.isAnimating) return;
    
    requestAnimationFrame(this.animate.bind(this));
    
    const deltaTime = this.clock.getDelta();
    
    // Update controls
    if (this.controls) {
      this.controls.update();
    }
    
    // Update tweens
    TWEEN.update();
    
    // Animate particles
    if (this.particles && this.particlesEnabled) {
      this.particles.rotation.y += deltaTime * 0.1;
      this.particles.rotation.x += deltaTime * 0.05;
    }
    
    // Animate card floating
    if (this.cardGroup) {
      this.cardGroup.position.y = Math.sin(this.clock.elapsedTime * 0.5) * 0.1;
      this.cardGroup.rotation.z = Math.sin(this.clock.elapsedTime * 0.3) * 0.02;
    }
    
    // Render
    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  /**
   * Dispose of resources
   */
  dispose() {
    this.isAnimating = false;
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    if (this.controls) {
      this.controls.dispose();
    }
    
    window.removeEventListener('resize', this.onWindowResize);
  }
}

// TWEEN is loaded from CDN, no fallback needed
