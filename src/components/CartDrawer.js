import { soundManager } from '../engine/SoundManager.js';
import { productStore } from '../engine/ProductStore.js';

export class CartDrawer {
  constructor(container, onUpdateCount) {
    this.container = container;
    this.onUpdateCount = onUpdateCount;
    this.items = [];
    this.isOpen = false;
    this.currentCurrency = 'INR';
    this.discountPercent = 0;
    this.promoCodeApplied = '';

    // Customer guest details state (no login required)
    this.guestDetails = {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      pincode: ''
    };

    this.youpiTimerInterval = null;
    this.currentPaymentOrderId = null;
    this.currentYoupiSession = null;
    this.selectedNetBank = 'State Bank of India (SBI)';
    this.detectedCardBrand = 'VISA';

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="cart-backdrop" id="cart-backdrop"></div>
      
      <!-- Cart Drawer Panel -->
      <aside class="cart-drawer-panel" id="cart-panel" aria-label="Festive Shopping Thali">
        <!-- Header -->
        <div class="drawer-header">
          <div class="drawer-title-group">
            <span class="drawer-diya">🪔</span>
            <h3>Your Festive Thali</h3>
            <span class="drawer-count-badge" id="drawer-item-count">0 items</span>
          </div>
          <button class="drawer-close-btn" id="drawer-close-btn" aria-label="Close cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <!-- Festive Welcome Message -->
        <div class="festive-blessing-bar">
          <span>✨ Handcrafted artisan quality & complimentary gift packaging.</span>
        </div>

        <!-- Cart Items List Container -->
        <div class="cart-items-scroll">
          <div class="empty-cart-state" id="empty-cart-view">
            <span class="empty-icon">🪔</span>
            <h4>Your Thali is empty</h4>
            <p>Explore our royal collection of brass diyas, handcrafted mithai hampers, and festive lanterns.</p>
            <button class="continue-shopping-btn" id="empty-shop-now-btn">Explore Offerings</button>
          </div>
          <div class="cart-items-list-wrap" id="cart-items-container"></div>
        </div>

        <!-- Drawer Footer & Checkout -->
        <div class="drawer-footer" id="drawer-footer" style="display: none;">
          <!-- Promo Code Input -->
          <div class="promo-box">
            <input type="text" id="promo-input" placeholder="Enter coupon code (try DIWALI2026)" class="promo-input" />
            <button class="promo-apply-btn" id="promo-apply-btn">Apply</button>
          </div>
          <div class="promo-feedback" id="promo-feedback"></div>

          <!-- Price Summary -->
          <div class="price-breakdown">
            <div class="breakdown-row">
              <span>Subtotal</span>
              <span id="cart-subtotal-val">₹0</span>
            </div>
            <div class="breakdown-row discount-row" id="discount-row" style="display: none;">
              <span>Festive Discount (15%)</span>
              <span id="cart-discount-val">-₹0</span>
            </div>
            <div class="breakdown-row">
              <span>Premium Gift Packaging & Delivery</span>
              <span class="free-shipping-tag">FREE</span>
            </div>
            <div class="breakdown-row total-row">
              <span>Grand Total</span>
              <span class="grand-total-amount" id="cart-grand-total">₹0</span>
            </div>
          </div>

          <button class="proceed-checkout-btn" id="checkout-btn">
            <span>PROCEED TO GUEST CHECKOUT (NO LOGIN)</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
          
          <div class="trust-guarantee-note">
            <span>⚡ 100% Login-Free Fast Checkout • Instant Order Receipt</span>
          </div>
        </div>
      </aside>

      <!-- Multi-Stage Guest Checkout, Payment & Royal Invoice Modal -->
      <div class="checkout-modal-overlay" id="checkout-modal-overlay" style="display: none;">
        <div class="checkout-modal-window" id="checkout-modal-window">
          <!-- Close button -->
          <button class="checkout-modal-close" id="checkout-modal-close-btn" title="Close Checkout">✕</button>

          <!-- STAGE 1: 100% LOGIN-FREE GUEST CHECKOUT -->
          <div class="checkout-stage" id="stage-guest-details">
            <div class="stage-header">
              <span class="stage-tag">NO LOGIN REQUIRED • त्वरित चेकआउट</span>
              <h2 class="stage-title">Express Secure Checkout</h2>
              <p class="stage-subtitle">
                No passwords or account creation needed. Provide your delivery and email details to receive your instant Royal Tax Invoice & live tracking.
              </p>
            </div>

            <div class="guest-checkout-layout">
              <!-- Left: Contact & Address Form -->
              <form class="guest-form" id="guest-checkout-form" onsubmit="return false;">
                <div class="form-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>1. Recipient Information</span>
                </div>
                
                <div class="form-row-2">
                  <div class="form-group">
                    <label for="guest-name">Full Name *</label>
                    <input type="text" id="guest-name" required value="" class="festive-input" placeholder="e.g. Meera Singhania" />
                  </div>
                  <div class="form-group">
                    <label for="guest-phone">Phone Number *</label>
                    <input type="tel" id="guest-phone" required value="" class="festive-input" placeholder="e.g. 98765 43210" />
                  </div>
                </div>

                <div class="form-group">
                  <label for="guest-email">Email Address (For Instant Order Invoice & Receipt) *</label>
                  <input type="email" id="guest-email" required value="" class="festive-input" placeholder="your.name@example.com" />
                  <span class="input-hint">📧 We will immediately send your official order receipt and invoice here.</span>
                </div>

                <div class="form-section-title" style="margin-top: 20px; display:flex; justify-content:space-between; align-items:center;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>2. Delivery Courtyard Address</span>
                  </div>
                  <!-- GPS Auto-Detect Location Button -->
                  <button type="button" class="btn-locate-gps" id="btn-locate-me" title="Auto-detect current location via browser GPS">
                    <span class="gps-icon">🎯</span>
                    <span id="locate-me-btn-text">Locate Me (Auto-Detect)</span>
                  </button>
                </div>

                <div class="gps-status-indicator" id="gps-status-indicator" style="display:none;"></div>

                <div class="form-group">
                  <label for="guest-address">Street / Courtyard Address *</label>
                  <input type="text" id="guest-address" required value="" class="festive-input" placeholder="Apartment, building, street address" />
                </div>

                <div class="form-row-3">
                  <div class="form-group">
                    <label for="guest-city">City / District *</label>
                    <input type="text" id="guest-city" required value="" class="festive-input" placeholder="City" />
                  </div>
                  <div class="form-group">
                    <label for="guest-state">State / Province *</label>
                    <input type="text" id="guest-state" required value="" class="festive-input" placeholder="State" />
                  </div>
                  <div class="form-group">
                    <label for="guest-pincode">Postal PIN Code *</label>
                    <input type="text" id="guest-pincode" required value="" class="festive-input" placeholder="PIN Code" />
                  </div>
                </div>

                <div class="form-group">
                  <label for="guest-landmark">Nearby Landmark (Optional for Courtyard Dropoff)</label>
                  <input type="text" id="guest-landmark" value="" class="festive-input" placeholder="e.g. Opposite City Palace, Near Metro Station" />
                </div>

                <!-- 3. Alternate Delivery Acceptor (If primary customer is not available) -->
                <div class="form-section-title" style="margin-top: 20px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span>3. Alternate Delivery Acceptor (Required in case you are unavailable)</span>
                </div>
                <div class="alternate-info-banner">
                  🛡️ To prevent return courier charges & guarantee smooth festive handoff, please provide an alternate family member or neighbor.
                </div>

                <div class="form-row-2">
                  <div class="form-group">
                    <label for="guest-alt-name">Alternate Acceptor Full Name *</label>
                    <input type="text" id="guest-alt-name" required value="Sunita Sharma (Family)" class="festive-input" placeholder="Neighbor, guard, or family member" />
                  </div>
                  <div class="form-group">
                    <label for="guest-alt-phone">Alternate Contact Phone Number *</label>
                    <input type="tel" id="guest-alt-phone" required value="+91 98290 12345" class="festive-input" placeholder="+91 98290 12345" />
                  </div>
                </div>

                <button class="stage-primary-btn" id="btn-goto-payment">
                  <span>Verify Address & Continue to Payment</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </form>

              <!-- Right: Order Review Column -->
              <div class="checkout-order-summary">
                <h4 class="summary-heading">Festive Thali Breakdown</h4>
                <div class="summary-items-list" id="checkout-summary-items"></div>

                <div class="summary-totals-box">
                  <div class="s-row">
                    <span>Subtotal</span>
                    <span id="cs-subtotal">₹0</span>
                  </div>
                  <div class="s-row discount-row" id="cs-discount-row" style="display: none;">
                    <span>Festive Discount</span>
                    <span id="cs-discount">-₹0</span>
                  </div>
                  <div class="s-row">
                    <span>Premium Gift Box & Packaging</span>
                    <span class="free-shipping-tag">₹0 (COMPLIMENTARY)</span>
                  </div>
                  <div class="s-row">
                    <span>Courtyard Delivery</span>
                    <span class="free-shipping-tag">₹0 (FREE SHIPPING)</span>
                  </div>
                  <div class="s-row">
                    <span>Extra Taxes & GST</span>
                    <span id="cs-gst" style="color: #15803d; font-weight: 600;">₹0 (No GST Applicable)</span>
                  </div>
                  <div class="s-row total-row">
                    <span>Total Payable (All-Inclusive)</span>
                    <span class="cs-total-val" id="cs-total">₹0</span>
                  </div>
                </div>

                <div class="trust-pill-box">
                  <div class="trust-item">🔒 256-Bit SSL Encryption</div>
                  <div class="trust-item">🚚 Zero Shipping Fees Across Bharat</div>
                  <div class="trust-item">✨ Direct Generational Artisan Support</div>
                </div>
              </div>
            </div>
          </div>

          <!-- ADDRESS & DETAILS CONFIRMATION MODAL POPUP (With T&C to Prevent Returns) -->
          <div class="checkout-confirm-modal-overlay" id="checkout-confirm-modal" style="display: none;">
            <div class="confirm-modal-card">
              <div class="confirm-modal-header">
                <span class="confirm-shield-icon">🛡️</span>
                <h3>Verify Delivery Courtyard & Terms</h3>
                <p>Please double-check your shipping destination to avoid any return courier delays.</p>
              </div>

              <div class="confirm-details-summary-box">
                <div class="confirm-info-row">
                  <span class="c-label">Recipient Name:</span>
                  <strong class="c-val" id="cfm-name">—</strong>
                </div>
                <div class="confirm-info-row">
                  <span class="c-label">Primary Mobile:</span>
                  <strong class="c-val" id="cfm-phone">—</strong>
                </div>
                <div class="confirm-info-row">
                  <span class="c-label">Email Invoice:</span>
                  <span class="c-val" id="cfm-email">—</span>
                </div>
                <div class="confirm-info-row address-highlight-row">
                  <span class="c-label">Complete Address:</span>
                  <strong class="c-val" id="cfm-address">—</strong>
                </div>
                <div class="confirm-info-row">
                  <span class="c-label">Landmark:</span>
                  <span class="c-val" id="cfm-landmark">—</span>
                </div>
                <div class="confirm-info-row alternate-highlight-row">
                  <span class="c-label">Alternate Acceptor:</span>
                  <strong class="c-val" id="cfm-alt">—</strong>
                </div>
              </div>

              <!-- Mandatory Return Prevention Terms & Conditions Checkbox -->
              <div class="confirm-terms-box">
                <label class="terms-checkbox-label">
                  <input type="checkbox" id="terms-confirm-checkbox" />
                  <span>
                    I confirm that the delivery courtyard address, PIN code, and alternate receiver contact details are 100% accurate. I understand that handcrafted festival artifacts and blessed items cannot be returned due to incorrect address information.
                  </span>
                </label>
              </div>

              <div class="confirm-modal-actions">
                <button type="button" class="btn-edit-details" id="btn-edit-details">
                  <span>← Edit Details</span>
                </button>
                <button type="button" class="btn-confirm-proceed" id="btn-confirm-proceed" disabled>
                  <span>✓ Confirm & Proceed to Payment</span>
                </button>
              </div>
            </div>
          </div>

          <!-- STAGE 2: INSTANT PAYMENT GATEWAY SIMULATION -->
          <div class="checkout-stage" id="stage-payment-gateway" style="display: none;">
            
            <!-- Step Tracker -->
            <div class="checkout-steps-bar">
              <div class="step-pill step-completed">
                <span class="step-dot">✓</span>
                <span class="step-text">1. Courtyard Address</span>
              </div>
              <div class="step-connector active"></div>
              <div class="step-pill step-active">
                <span class="step-dot">2</span>
                <span class="step-text">2. Payment & Authorization</span>
              </div>
              <div class="step-connector"></div>
              <div class="step-pill">
                <span class="step-dot">3</span>
                <span class="step-text">3. Blessing Bill</span>
              </div>
            </div>

            <!-- Total Payable Ribbon -->
            <div class="checkout-payable-ribbon">
              <div class="ribbon-left">
                <span class="ribbon-tag">OFFICIAL FESTIVE CHECKOUT</span>
                <div class="ribbon-amount-row">
                  <span class="ribbon-label">Total Payable:</span>
                  <strong class="ribbon-amount" id="pay-stage-amount">₹0</strong>
                </div>
              </div>
              <div class="ribbon-right">
                <span class="ribbon-badge">🛡️ Zero Gateway Fees • 100% Secure</span>
              </div>
            </div>

            <!-- Payment Method Tabs -->
            <div class="payment-tabs-container">
              <div class="payment-tabs-header">
                <button class="pay-tab active" data-tab="upi">
                  <span class="tab-icon">⚡</span>
                  <span class="tab-label">UPI / QR (Instant)</span>
                  <span class="tab-badge">Fastest</span>
                </button>
                <button class="pay-tab" data-tab="card">
                  <span class="tab-icon">💳</span>
                  <span class="tab-label">Cards</span>
                </button>
                <button class="pay-tab" data-tab="netbanking">
                  <span class="tab-icon">🏛️</span>
                  <span class="tab-label">Net Banking</span>
                </button>
                <button class="pay-tab" data-tab="cod">
                  <span class="tab-icon">🪔</span>
                  <span class="tab-label">Cash on Delivery</span>
                </button>
              </div>

              <!-- UPI Tab Content (Powered by YouPI Sovereign Gateway) -->
              <div class="payment-tab-content active" id="tab-upi">
                <div class="youpi-gateway-container">
                  
                  <!-- Trust & Security Header -->
                  <div class="youpi-trust-bar">
                    <div class="youpi-badge-left">
                      <div class="youpi-brand-icon-wrap">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#FFB703"/>
                          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#FFB703" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <div class="youpi-brand-text">
                        <strong>YouPI Sovereign Gateway • NPCI Bharat Rails</strong>
                        <span>Direct-to-Artisan Bank • 0% Aggregator Fee • 256-Bit SSL</span>
                      </div>
                    </div>
                    <div class="youpi-timer-pill" id="youpi-session-timer-pill" title="Exclusive 5-minute single-slot payment session">
                      <span class="pulse-clock-dot">●</span>
                      <span>Staked Session: </span>
                      <strong id="youpi-timer-display">05:00</strong>
                    </div>
                  </div>

                  <!-- PRIMARY 1-TAP MOBILE ACTION (HIGH-CONVERTING) -->
                  <div class="youpi-mobile-primary-block">
                    <a href="#" class="youpi-primary-intent-btn" id="youpi-primary-intent-btn" title="Tap to open your default UPI app directly">
                      <div class="intent-btn-left">
                        <div class="intent-app-icons-cluster">
                          <span class="icon-circle icon-gpay" title="Google Pay">G</span>
                          <span class="icon-circle icon-phonepe" title="PhonePe">पे</span>
                          <span class="icon-circle icon-paytm" title="Paytm">Pay</span>
                        </div>
                        <div class="intent-label-group">
                          <span class="intent-headline">TAP TO PAY WITH ANY UPI APP</span>
                          <span class="intent-subline">GPay, PhonePe, Paytm, CRED, BHIM & more</span>
                        </div>
                      </div>
                      <div class="intent-btn-right">
                        <span class="intent-amount" id="youpi-btn-amount">₹0</span>
                        <span class="intent-arrow">➜</span>
                      </div>
                    </a>
                  </div>

                  <div class="youpi-body-grid">
                    <!-- Left Column: Dynamic Vector QR Box (for Desktop / Second Device) -->
                    <div class="youpi-qr-box">
                      <div class="qr-glow-frame">
                        <svg viewBox="0 0 180 180" class="upi-qr-svg" width="160" height="160" id="youpi-dynamic-qr-svg">
                          <rect width="180" height="180" fill="#FFFFFF" rx="8"/>
                          <!-- QR Corner 1 -->
                          <rect x="15" y="15" width="40" height="40" fill="#000" rx="4"/>
                          <rect x="22" y="22" width="26" height="26" fill="#FFF" rx="2"/>
                          <rect x="27" y="27" width="16" height="16" fill="#000" rx="1"/>
                          <!-- QR Corner 2 -->
                          <rect x="125" y="15" width="40" height="40" fill="#000" rx="4"/>
                          <rect x="132" y="22" width="26" height="26" fill="#FFF" rx="2"/>
                          <rect x="137" y="27" width="16" height="16" fill="#000" rx="1"/>
                          <!-- QR Corner 3 -->
                          <rect x="15" y="125" width="40" height="40" fill="#000" rx="4"/>
                          <rect x="22" y="132" width="26" height="26" fill="#FFF" rx="2"/>
                          <rect x="27" y="137" width="16" height="16" fill="#000" rx="1"/>
                          <!-- Procedural Data Matrix -->
                          <g fill="#111827">
                            <rect x="65" y="20" width="8" height="8"/><rect x="80" y="20" width="8" height="8"/><rect x="95" y="20" width="8" height="8"/><rect x="110" y="20" width="8" height="8"/>
                            <rect x="65" y="35" width="8" height="8"/><rect x="95" y="35" width="8" height="8"/>
                            <rect x="65" y="50" width="8" height="8"/><rect x="80" y="50" width="8" height="8"/><rect x="110" y="50" width="8" height="8"/>
                            <rect x="20" y="65" width="8" height="8"/><rect x="35" y="65" width="8" height="8"/><rect x="50" y="65" width="8" height="8"/><rect x="125" y="65" width="8" height="8"/><rect x="140" y="65" width="8" height="8"/>
                            <rect x="20" y="80" width="8" height="8"/><rect x="50" y="80" width="8" height="8"/><rect x="125" y="80" width="8" height="8"/><rect x="155" y="80" width="8" height="8"/>
                            <rect x="20" y="95" width="8" height="8"/><rect x="35" y="95" width="8" height="8"/><rect x="140" y="95" width="8" height="8"/><rect x="155" y="95" width="8" height="8"/>
                            <rect x="65" y="125" width="8" height="8"/><rect x="80" y="125" width="8" height="8"/><rect x="110" y="125" width="8" height="8"/>
                            <rect x="65" y="140" width="8" height="8"/><rect x="95" y="140" width="8" height="8"/><rect x="125" y="140" width="8" height="8"/>
                            <rect x="80" y="155" width="8" height="8"/><rect x="95" y="155" width="8" height="8"/><rect x="140" y="155" width="8" height="8"/>
                          </g>
                          <!-- Center Diwali Diya Logo in QR -->
                          <circle cx="90" cy="90" r="18" fill="#140E1E" stroke="#FFD700" stroke-width="2"/>
                          <text x="90" y="95" font-size="14" text-anchor="middle" fill="#FFD700">🪔</text>
                        </svg>
                      </div>

                      <div class="youpi-vpa-row">
                        <span class="vpa-label">Merchant VPA:</span>
                        <div class="vpa-copy-pill" id="youpi-vpa-copy-btn" title="Click to copy UPI ID">
                          <code id="youpi-display-vpa">utsavbazaar@okhdfcbank</code>
                          <span class="vpa-copy-icon">📋</span>
                        </div>
                      </div>
                      <div class="youpi-amount-badge">Payable: <strong id="youpi-display-amount">₹0</strong></div>
                    </div>

                    <!-- Right Column: Mobile App Switchers & UTR Verification -->
                    <div class="youpi-actions-box">
                      
                      <!-- Specific UPI Apps Selection -->
                      <div class="youpi-apps-section">
                        <div class="youpi-apps-title">
                          <span>Or open in your favorite app:</span>
                        </div>
                        <div class="youpi-apps-grid">
                          <a href="#" class="youpi-app-btn gpay-btn" id="youpi-app-gpay" title="Pay with Google Pay">
                            <span class="app-brand-icon">
                              <svg width="22" height="22" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                            </span>
                            <span class="app-brand-name">Google Pay</span>
                          </a>
                          
                          <a href="#" class="youpi-app-btn phonepe-btn" id="youpi-app-phonepe" title="Pay with PhonePe">
                            <span class="app-brand-icon">
                              <svg width="22" height="22" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#5F259F"/><path fill="#FFF" d="M15.5 8.5h-3.2v-2h-2v2H8.5v2.1h1.8v3.2c0 1.9 1.1 3.2 3.1 3.2.8 0 1.5-.1 1.8-.3v-1.9c-.3.1-.7.2-1.2.2-.9 0-1.7-.5-1.7-1.6v-2.8h3.2V8.5z"/></svg>
                            </span>
                            <span class="app-brand-name">PhonePe</span>
                          </a>
                          
                          <a href="#" class="youpi-app-btn paytm-btn" id="youpi-app-paytm" title="Pay with Paytm">
                            <span class="app-brand-icon">
                              <svg width="22" height="22" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#002E6E"/><path fill="#00BAF2" d="M5 8h3v8H5zm4 0h3v4.5c0 1.5.8 2 2 2s2-.5 2-2V8h3v4.5c0 3-1.8 4.5-5 4.5s-5-1.5-5-4.5V8z"/></svg>
                            </span>
                            <span class="app-brand-name">Paytm</span>
                          </a>
                          
                          <a href="#" class="youpi-app-btn cred-btn" id="youpi-app-cred" title="Pay with CRED or BHIM">
                            <span class="app-brand-icon">
                              <svg width="22" height="22" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#121212"/><path stroke="#D4AF37" stroke-width="2" fill="none" d="M7 6h10v12H7z M7 12h10 M12 6v12"/></svg>
                            </span>
                            <span class="app-brand-name">CRED / BHIM</span>
                          </a>
                        </div>
                      </div>

                      <!-- Step 2: 12-Digit UTR Bank Verification Box -->
                      <div class="youpi-utr-box">
                        <div class="utr-header-row">
                          <label class="utr-label" for="youpi-utr-input">
                            <strong>Step 2: Enter 12-Digit Bank UTR / Ref Number</strong>
                          </label>
                          <span class="utr-help-chip" title="Found in your UPI app receipt or SMS after completing payment">Receipt UTR</span>
                        </div>
                        <p class="utr-instruction">After transferring, copy the 12-digit transaction ID from your UPI app receipt below:</p>
                        <div class="utr-input-row">
                          <input type="text" id="youpi-utr-input" placeholder="e.g. 202611884422" maxlength="12" inputmode="numeric" pattern="[0-9]*" class="youpi-utr-field" />
                          <button class="youpi-verify-btn" id="btn-verify-youpi-utr">
                            <span>✓ Verify & Complete</span>
                          </button>
                        </div>
                        <div class="utr-status-hint" id="youpi-utr-status-hint">
                          <span>⚡ Transferred funds reach store atelier directly with zero aggregator deductions.</span>
                        </div>
                      </div>

                      <!-- Sandbox Testing Simulator Row -->
                      <div class="youpi-sim-row">
                        <button class="youpi-sim-btn" id="btn-simulate-bank-sms" title="Safe Environment Testing: Simulates instant automated bank SMS alert">
                          <span>🧪 Instant Sandbox Simulator: Auto-Detect & Settle</span>
                        </button>
                        <button class="stage-back-btn" id="btn-back-to-details">← Back to Address Details</button>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <!-- Card Tab Content (Interactive Credit & Debit Card System) -->
              <div class="payment-tab-content" id="tab-card">
                <div class="card-pay-box">
                  
                  <!-- Luxury Golden Visual Card Preview -->
                  <div class="luxury-card-preview" id="luxury-card-preview">
                    <div class="card-preview-inner">
                      <div class="card-preview-top">
                        <div class="card-chip-icon">
                          <svg width="34" height="26" viewBox="0 0 36 28" fill="none">
                            <rect width="36" height="28" rx="4" fill="#D4AF37"/>
                            <path d="M0 14h12M24 14h12M12 0v28M24 0v28M12 8h12M12 20h12" stroke="#996515" stroke-width="1.2"/>
                          </svg>
                          <span class="card-contactless">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 16.5a5 5 0 0 1 0-7M12 19a8.5 8.5 0 0 0 0-14M15.5 21.5a12 12 0 0 0 0-19"/></svg>
                          </span>
                        </div>
                        <div class="card-brand-badge" id="card-preview-brand-badge">
                          <span class="brand-text-visa">VISA</span>
                        </div>
                      </div>
                      
                      <div class="card-preview-number" id="card-preview-number-display">•••• •••• •••• ••••</div>
                      
                      <div class="card-preview-bottom">
                        <div class="card-preview-holder">
                          <span class="card-preview-label">CARDHOLDER</span>
                          <span class="card-preview-name" id="card-preview-name-display">YOUR NAME</span>
                        </div>
                        <div class="card-preview-expiry">
                          <span class="card-preview-label">VALID THRU</span>
                          <span class="card-preview-exp" id="card-preview-exp-display">MM/YY</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Card Inputs Form -->
                  <div class="card-inputs-form">
                    <div class="form-group">
                      <label for="card-num-input">Card Number <span class="req-star" style="color:#EF4444;">*</span></label>
                      <div class="card-input-with-icon">
                        <input type="text" id="card-num-input" class="festive-input" placeholder="4532 8901 2345 6789" maxlength="19" autocomplete="cc-number" inputmode="numeric" />
                        <span class="card-type-icon" id="card-detected-icon">💳</span>
                      </div>
                      <div class="field-validation-err" id="card-num-err" style="display:none;"></div>
                    </div>

                    <div class="form-row-2">
                      <div class="form-group">
                        <label for="card-exp-input">Valid Thru (MM/YY) <span class="req-star" style="color:#EF4444;">*</span></label>
                        <input type="text" id="card-exp-input" class="festive-input" placeholder="MM/YY" maxlength="5" autocomplete="cc-exp" inputmode="numeric" />
                        <div class="field-validation-err" id="card-exp-err" style="display:none;"></div>
                      </div>
                      <div class="form-group">
                        <label for="card-cvv-input">CVV / CVC <span class="req-star" style="color:#EF4444;">*</span></label>
                        <div class="cvv-input-wrap">
                          <input type="password" id="card-cvv-input" class="festive-input" placeholder="•••" maxlength="4" autocomplete="cc-csc" inputmode="numeric" />
                          <span class="cvv-info-hint" title="3 digits on back of Visa/Mastercard/RuPay, 4 digits on front for Amex">ℹ️</span>
                        </div>
                        <div class="field-validation-err" id="card-cvv-err" style="display:none;"></div>
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="cardholder-name-val">Cardholder Name <span class="req-star" style="color:#EF4444;">*</span></label>
                      <input type="text" id="cardholder-name-val" class="festive-input" placeholder="Full name as printed on card" autocomplete="cc-name" />
                      <div class="field-validation-err" id="card-name-err" style="display:none;"></div>
                    </div>

                    <div class="card-security-badges-row">
                      <div class="sec-badge-item">🔒 256-Bit SSL Encrypted</div>
                      <div class="sec-badge-item">🛡️ RBI Tokenized Safe</div>
                      <div class="sec-badge-item">✓ Zero Surcharge</div>
                    </div>

                    <button class="stage-primary-btn" id="btn-pay-card" type="button">
                      <span id="btn-pay-card-label">🔒 Pay with Credit / Debit Card</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Net Banking Tab Content (All Indian Banks Supported) -->
              <div class="payment-tab-content" id="tab-netbanking">
                <div class="netbanking-box">
                  <div class="netbanking-header-tag" style="margin-bottom: 12px;">
                    <div style="font-weight: 700; color: var(--color-gold-light); font-size: 13px; letter-spacing: 0.05em;">🏛️ POPULAR INDIAN BANKS</div>
                    <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">Select your bank for instant direct netbanking</div>
                  </div>

                  <!-- Popular Bank Quick-Select Grid -->
                  <div class="popular-banks-grid" id="popular-banks-grid">
                    <button type="button" class="bank-pill active" data-bank="State Bank of India (SBI)">
                      <span class="bank-pill-icon">🏛️</span>
                      <span class="bank-pill-name">State Bank of India</span>
                      <span class="bank-pill-check">✓</span>
                    </button>
                    <button type="button" class="bank-pill" data-bank="HDFC Bank">
                      <span class="bank-pill-icon">🏛️</span>
                      <span class="bank-pill-name">HDFC Bank</span>
                      <span class="bank-pill-check">✓</span>
                    </button>
                    <button type="button" class="bank-pill" data-bank="ICICI Bank">
                      <span class="bank-pill-icon">🏛️</span>
                      <span class="bank-pill-name">ICICI Bank</span>
                      <span class="bank-pill-check">✓</span>
                    </button>
                    <button type="button" class="bank-pill" data-bank="Axis Bank">
                      <span class="bank-pill-icon">🏛️</span>
                      <span class="bank-pill-name">Axis Bank</span>
                      <span class="bank-pill-check">✓</span>
                    </button>
                    <button type="button" class="bank-pill" data-bank="Kotak Mahindra Bank">
                      <span class="bank-pill-icon">🏛️</span>
                      <span class="bank-pill-name">Kotak Mahindra</span>
                      <span class="bank-pill-check">✓</span>
                    </button>
                    <button type="button" class="bank-pill" data-bank="Punjab National Bank (PNB)">
                      <span class="bank-pill-icon">🏛️</span>
                      <span class="bank-pill-name">Punjab National Bank</span>
                      <span class="bank-pill-check">✓</span>
                    </button>
                  </div>

                  <!-- All Other Banks Dropdown -->
                  <div class="all-banks-selector-group" style="margin: 14px 0;">
                    <label for="all-banks-select" style="font-size: 12px; font-weight: 600; color: #CBD5E1; display: block; margin-bottom: 4px;">Or choose from all other Indian banks:</label>
                    <select id="all-banks-select" class="festive-select-dropdown">
                      <option value="">-- Select Another Indian Bank --</option>
                      <optgroup label="Public Sector Banks">
                        <option value="Bank of Baroda">Bank of Baroda</option>
                        <option value="Canara Bank">Canara Bank</option>
                        <option value="Union Bank of India">Union Bank of India</option>
                        <option value="Bank of India">Bank of India</option>
                        <option value="Central Bank of India">Central Bank of India</option>
                        <option value="Indian Bank">Indian Bank</option>
                        <option value="Indian Overseas Bank">Indian Overseas Bank</option>
                        <option value="UCO Bank">UCO Bank</option>
                        <option value="Punjab & Sind Bank">Punjab & Sind Bank</option>
                        <option value="Bank of Maharashtra">Bank of Maharashtra</option>
                      </optgroup>
                      <optgroup label="Private Banks">
                        <option value="IndusInd Bank">IndusInd Bank</option>
                        <option value="Yes Bank">Yes Bank</option>
                        <option value="Federal Bank">Federal Bank</option>
                        <option value="IDFC FIRST Bank">IDFC FIRST Bank</option>
                        <option value="IDBI Bank">IDBI Bank</option>
                        <option value="RBL Bank">RBL Bank</option>
                        <option value="South Indian Bank">South Indian Bank</option>
                        <option value="Karur Vysya Bank">Karur Vysya Bank</option>
                        <option value="Bandhan Bank">Bandhan Bank</option>
                        <option value="City Union Bank">City Union Bank</option>
                        <option value="Tamilnad Mercantile Bank">Tamilnad Mercantile Bank</option>
                        <option value="Jammu & Kashmir Bank">Jammu & Kashmir Bank</option>
                      </optgroup>
                      <optgroup label="Small Finance & Payment Banks">
                        <option value="AU Small Finance Bank">AU Small Finance Bank</option>
                        <option value="Equitas Small Finance Bank">Equitas Small Finance Bank</option>
                        <option value="Ujjivan Small Finance Bank">Ujjivan Small Finance Bank</option>
                        <option value="Paytm Payments Bank">Paytm Payments Bank</option>
                        <option value="Airtel Payments Bank">Airtel Payments Bank</option>
                        <option value="India Post Payments Bank">India Post Payments Bank</option>
                      </optgroup>
                    </select>
                  </div>

                  <div class="selected-bank-status" id="selected-bank-status-display">
                    <span class="sel-indicator">✓</span>
                    <span>Selected Bank: <strong id="current-selected-bank-name">State Bank of India (SBI)</strong></span>
                  </div>

                  <div class="netbanking-security-note" style="font-size: 11px; color: #94A3B8; margin: 10px 0 16px;">
                    <span>🛡️ You will be securely authorized via 128-bit encrypted banking gateway. Zero convenience fee applied.</span>
                  </div>

                  <button class="stage-primary-btn" id="btn-pay-nb" type="button">
                    <span id="btn-pay-nb-label">Pay via State Bank of India NetBanking</span>
                  </button>
                </div>
              </div>

              <!-- COD Tab Content -->
              <div class="payment-tab-content" id="tab-cod">
                <div class="cod-box">
                  <span class="cod-icon">🪔</span>
                  <h4>Cash on Festive Delivery</h4>
                  <p>Pay cash or scan QR at your doorstep when your sacred Diwali packages arrive safely.</p>
                  <button class="stage-primary-btn" id="btn-pay-cod">
                    <span>Confirm Cash on Delivery</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Card 3D-Secure 2.0 Bank Verification Modal -->
            <div class="card-otp-modal" id="card-otp-modal" style="display: none;">
              <div class="card-otp-backdrop" id="card-otp-backdrop"></div>
              <div class="card-otp-card">
                <div class="otp-modal-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(212,175,55,0.3); padding-bottom:12px; margin-bottom:14px;">
                  <div style="font-weight:700; color:#FFD700; font-size:14px; display:flex; align-items:center; gap:6px;">
                    <span>🛡️</span> <span>Bank 3D-Secure 2.0 Gateway</span>
                  </div>
                  <button class="otp-close-btn" id="btn-close-card-otp" style="background:none; border:none; color:#CBD5E1; font-size:16px; cursor:pointer;">✕</button>
                </div>
                <div class="otp-modal-body">
                  <div style="font-size:12px; color:#CBD5E1; margin-bottom:4px;">Merchant: <strong style="color:#FFF;">UTSAV BAZAAR ATELIER</strong></div>
                  <div style="font-size:12px; color:#CBD5E1; margin-bottom:4px;">Amount Payable: <strong style="color:#FFD700;" id="otp-amount-display">₹0</strong></div>
                  <div style="font-size:12px; color:#CBD5E1; margin-bottom:12px;">Card: <strong style="color:#FFF;" id="otp-card-masked">•••• •••• •••• 8821</strong></div>
                  <p style="font-size:11px; color:#94A3B8; margin-bottom:12px; line-height:1.4;">An OTP has been dispatched to your mobile number registered with your issuing bank.</p>
                  
                  <div style="margin-bottom:12px;">
                    <label style="font-size:11px; font-weight:700; color:#CBD5E1; display:block; margin-bottom:4px;">ENTER 6-DIGIT OTP</label>
                    <div style="display:flex; gap:8px;">
                      <input type="text" id="card-otp-code-input" maxlength="6" placeholder="847291" class="festive-input" value="847291" style="font-size:18px; letter-spacing:0.25em; text-align:center; font-weight:700;" />
                      <button type="button" class="admin-btn-secondary" id="btn-otp-quick-fill" style="padding:0 12px; font-size:11px; white-space:nowrap; cursor:pointer;">Auto-Fill</button>
                    </div>
                  </div>
                  
                  <div style="font-size:11px; color:#64748B; margin-bottom:16px; text-align:center;">
                    Resend code in <strong style="color:#FFDF73;" id="otp-countdown">00:45</strong>
                  </div>
                  
                  <button class="stage-primary-btn" id="btn-submit-card-otp" type="button" style="width:100%;">
                    <span>✓ Authorize & Confirm Payment</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- NetBanking Bank Gateway Simulation Dialog -->
            <div class="netbanking-modal" id="netbanking-modal" style="display: none;">
              <div class="nb-backdrop" id="nb-backdrop"></div>
              <div class="nb-dialog">
                <div class="nb-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(212,175,55,0.3); padding-bottom:12px; margin-bottom:16px;">
                  <div style="font-weight:700; color:#FFD700; font-size:14px; display:flex; align-items:center; gap:6px;">
                    <span id="nb-modal-bank-logo">🏛️ State Bank of India</span>
                  </div>
                  <span style="font-size:11px; background:rgba(16,185,129,0.15); color:#34D399; padding:3px 8px; border-radius:12px; border:1px solid rgba(16,185,129,0.3);">🔒 256-Bit SSL</span>
                </div>
                <div class="nb-body" style="text-align:center;">
                  <div style="font-size:13px; color:#CBD5E1; margin-bottom:8px;">
                    Authorizing Direct NetBanking transfer of <strong style="color:#FFD700;" id="nb-modal-amount">₹0</strong>
                  </div>
                  <p style="font-size:11px; color:#94A3B8; margin-bottom:16px; line-height:1.4;">
                    Secure bank session established. Click approve to simulate instant retail banking authorization.
                  </p>
                  <div style="display:flex; flex-direction:column; gap:10px;">
                    <button class="stage-primary-btn" id="btn-confirm-nb-auth" type="button">
                      <span>✓ Approve & Complete Transfer</span>
                    </button>
                    <button class="stage-back-btn" id="btn-cancel-nb-auth" type="button" style="padding:10px;">Cancel</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Processing Loader Overlay -->
            <div class="payment-processing-overlay" id="pay-processing-overlay" style="display: none;">
              <div class="payment-spinner"></div>
              <h3 class="proc-title">Authorizing Sacred Payment...</h3>
              <p class="proc-desc">Contacting National Payments Corporation & Banking Node</p>
            </div>
          </div>

          <!-- STAGE 3: ROYAL TAX INVOICE & ORDER CONFIRMATION EMAIL RECEIPT -->
          <div class="checkout-stage" id="stage-invoice-confirmation" style="display: none;">
            <!-- Order Success Top Banner -->
            <div class="invoice-success-banner">
              <div class="banner-sparkle">✨</div>
              <h2 class="banner-title">Order Confirmed Successfully!</h2>
              <div class="banner-email-tag">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span>Tax Invoice & Order Receipt sent to: <strong id="inv-email-recipient">customer@email.com</strong></span>
              </div>
            </div>

            <!-- Printable Royal Tax Invoice Card -->
            <div class="royal-invoice-document" id="printable-tax-invoice">
              <!-- Invoice Header -->
              <div class="invoice-top-row">
                <div class="invoice-brand-col">
                  <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
                    <span style="font-size:26px; line-height:1;">🪔</span>
                    <div>
                      <div class="invoice-company-name" style="margin:0;">UTSAV BAZAAR</div>
                      <div style="font-size:11px; font-weight:700; color:#B45309; letter-spacing:0.06em; text-transform:uppercase;">Artisanal Home Decor & Festive Lifestyle</div>
                    </div>
                  </div>
                  <div class="invoice-reg-address" style="margin-top:6px; font-size:11px; color:#475569; line-height:1.55;">
                    <div><strong>Registered Store:</strong> Utsav Bazaar Crafts</div>
                    <div>Heritage Craft District, Johari Bazaar, Jaipur, Rajasthan — 302003, India</div>
                    <div><strong>GSTIN:</strong> 08AAACU1234F1Z5 • <strong>CIN:</strong> U52100RJ2026PTC084210</div>
                    <div><strong>Email:</strong> support@utsavbazaar.in | <strong>Tel:</strong> +91 800 266 7822</div>
                  </div>
                </div>
                <div class="invoice-meta-col">
                  <div class="tax-invoice-badge" style="background:#0F172A; color:#FFFFFF; font-size:11px; font-weight:800; letter-spacing:0.1em; padding:4px 12px; border-radius:4px; display:inline-block; margin-bottom:4px;">RETAIL TAX INVOICE</div>
                  <div style="font-size:10px; color:#64748B; font-weight:600; text-transform:uppercase; margin-bottom:6px;">Original For Recipient</div>
                  <div class="inv-meta-row"><strong>Invoice No:</strong> <span id="inv-number-val">UB-INV-2026-98421</span></div>
                  <div class="inv-meta-row"><strong>Order ID:</strong> <span id="inv-order-id-val">#UB-ORD-884102</span></div>
                  <div class="inv-meta-row"><strong>Invoice Date:</strong> <span id="inv-date-val">18 October 2026</span></div>
                  <div class="inv-meta-row"><strong>Place of Supply:</strong> <span id="inv-pos-val">Rajasthan (08)</span></div>
                  <div class="inv-meta-row"><strong>Payment Mode:</strong> <span id="inv-paymode-val" style="color:#047857; font-weight:700;">UPI / Verified Online</span></div>
                </div>
              </div>

              <!-- Customer Billed To & Shipped To -->
              <div class="invoice-customer-row">
                <div class="cust-col">
                  <span class="cust-label">BILLED & SHIPPED TO:</span>
                  <div class="cust-val-name" id="inv-cust-name">—</div>
                  <div class="cust-val-addr" id="inv-cust-addr">—</div>
                  <div class="cust-val-city" id="inv-cust-city">—</div>
                  <div class="cust-val-contact" style="font-size:11px; color:#475569; margin-top:4px;">
                    Phone: <span id="inv-cust-phone" style="font-weight:600; color:#0F172A;">—</span> | 
                    Email: <span id="inv-cust-email" style="font-weight:600; color:#0F172A;">—</span>
                  </div>
                </div>
                <div class="compliance-col">
                  <div class="gov-seal" style="background:#F8FAFC; border:1px solid #E2E8F0; padding:10px 14px; border-radius:8px; font-size:11px; color:#334155;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="font-size:18px;">🛡️</span>
                      <div>
                        <strong style="color:#0F172A; display:block;">Verified Order & Dispatch</strong>
                        <span style="font-size:10px; color:#64748B;">All-Inclusive GST • Insured Safe Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Itemized Products Table -->
              <table class="invoice-table">
                <thead>
                  <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 48%;">Description of Goods</th>
                    <th style="width: 17%;">Category / HSN</th>
                    <th style="width: 10%; text-align: center;">Qty</th>
                    <th style="width: 10%; text-align: right;">Unit Price</th>
                    <th style="width: 10%; text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody id="invoice-items-tbody">
                  <!-- Generated dynamically from cart items -->
                </tbody>
              </table>

              <!-- Invoice Bottom Totals & Breakdown -->
              <div class="invoice-bottom-grid">
                <div class="invoice-blessing-note">
                  <h4 style="font-size:12px; font-weight:700; color:#0F172A; margin:0 0 6px 0;">Terms & Declarations:</h4>
                  <ul style="margin:0 0 16px 0; padding-left:18px; font-size:11px; line-height:1.6; color:#64748B;">
                    <li>Prices are all-inclusive of applicable GST and handling fees.</li>
                    <li>Handcrafted by authentic generational artisan collectives.</li>
                    <li>Insured transit warranty against damage during courier transit.</li>
                    <li>For customer care, tracking or questions: support@utsavbazaar.in.</li>
                  </ul>
                  <div class="signatory-box" style="border-top:1px solid #CBD5E1; padding-top:6px; display:inline-block;">
                    <div class="sign-line" style="font-family:'Plus Jakarta Sans', sans-serif; font-size:12px; font-weight:700; color:#0F172A;">For Utsav Bazaar Crafts</div>
                    <div class="sign-sub" style="font-size:10px; color:#94A3B8;">Authorized Signatory [Computer-Generated Tax Invoice]</div>
                  </div>
                </div>

                <div class="invoice-summary-calc">
                  <div class="calc-row">
                    <span>Taxable Subtotal:</span>
                    <span id="inv-calc-subtotal" style="font-weight:600; color:#0F172A;">₹0</span>
                  </div>
                  <div class="calc-row" id="inv-calc-discount-row" style="display: none;">
                    <span>Festive Discount Applied:</span>
                    <span id="inv-calc-discount" style="color:#B91C1C; font-weight:700;">-₹0</span>
                  </div>
                  <div class="calc-row">
                    <span>GST (Included in Product Prices):</span>
                    <span style="color:#047857; font-weight:600;">All-Inclusive (₹0 Extra)</span>
                  </div>
                  <div class="calc-row">
                    <span>Festive Gift Box & Packaging:</span>
                    <span class="free-shipping-tag" style="color:#047857; font-weight:600;">Complimentary</span>
                  </div>
                  <div class="calc-row">
                    <span>Insured Doorstep Courier Delivery:</span>
                    <span class="free-shipping-tag" style="color:#047857; font-weight:600;">FREE Delivery</span>
                  </div>
                  <div class="calc-row total-highlight">
                    <span>TOTAL AMOUNT PAYABLE:</span>
                    <span class="grand-val" id="inv-calc-grand-total">₹0</span>
                  </div>
                  <div style="font-size:11px; color:#475569; margin-top:6px; text-align:right;" id="inv-words-container">
                    <strong>Amount in Words:</strong> <span id="inv-words-val" style="color:#0F172A; font-weight:600;">—</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons for Invoice -->
            <div class="invoice-actions-footer">
              <button class="stage-primary-btn" id="btn-download-pdf">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span>📥 Download PDF Invoice</span>
              </button>
              <button class="stage-primary-btn" id="btn-print-invoice" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color:#FFF;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                <span>🖨️ Print / Save as PDF</span>
              </button>
              <button class="stage-secondary-btn" id="btn-return-to-bazaar">
                <span>✨ Return to Bazaar (Continue Shopping)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    window.addEventListener('open-cart-drawer', () => this.open());

    // 1. Drawer open/close
    const closeBtn = this.container.querySelector('#drawer-close-btn');
    const backdrop = this.container.querySelector('#cart-backdrop');
    const emptyShopBtn = this.container.querySelector('#empty-shop-now-btn');

    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (backdrop) backdrop.addEventListener('click', () => this.close());
    if (emptyShopBtn) {
      emptyShopBtn.addEventListener('click', () => {
        this.close();
        const shop = document.querySelector('#bazaar-storefront');
        if (shop) shop.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // 2. Promo code apply
    const promoBtn = this.container.querySelector('#promo-apply-btn');
    const promoInput = this.container.querySelector('#promo-input');
    const promoFeedback = this.container.querySelector('#promo-feedback');

    if (promoBtn && promoInput) {
      promoBtn.addEventListener('click', () => {
        const code = promoInput.value.trim().toUpperCase();
        if (code === 'DIWALI2026' || code === 'UTSAV2026') {
          this.discountPercent = 0.15;
          this.promoCodeApplied = code;
          promoFeedback.innerHTML = `<span style="color:#0E8A5E;">✓ Auspicious 15% Festive Blessing Applied!</span>`;
          this.updateTotals();
        } else {
          promoFeedback.innerHTML = `<span style="color:#C9184A;">Invalid coupon. Try 'DIWALI2026'</span>`;
        }
      });
    }

    // 3. Item quantity delegation
    const itemsContainer = this.container.querySelector('#cart-items-container');
    if (itemsContainer) {
      itemsContainer.addEventListener('click', (e) => {
        const plusBtn = e.target.closest('[data-qty-plus]');
        const minusBtn = e.target.closest('[data-qty-minus]');
        const removeBtn = e.target.closest('[data-remove]');

        if (plusBtn) {
          const id = plusBtn.getAttribute('data-qty-plus');
          this.changeQuantity(id, 1);
        } else if (minusBtn) {
          const id = minusBtn.getAttribute('data-qty-minus');
          this.changeQuantity(id, -1);
        } else if (removeBtn) {
          const id = removeBtn.getAttribute('data-remove');
          this.removeItem(id);
        }
      });
    }

    // 4. Open Guest Checkout Flow
    const checkoutBtn = this.container.querySelector('#checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (this.items.length === 0) return;
        this.close();
        this.openGuestCheckout();
      });
    }

    // 5. Checkout Modal Close Button
    const modalCloseBtn = this.container.querySelector('#checkout-modal-close-btn');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        this.closeCheckoutModal();
      });
    }

    // 5b. Locate Me Button (Browser Geolocation API + Reverse Geocoding)
    const locateBtn = this.container.querySelector('#btn-locate-me');
    const locateBtnText = this.container.querySelector('#locate-me-btn-text');
    const gpsStatus = this.container.querySelector('#gps-status-indicator');

    if (locateBtn) {
      locateBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
          alert("Geolocation is not supported by your browser.");
          return;
        }

        if (locateBtnText) locateBtnText.textContent = 'Detecting GPS...';
        if (gpsStatus) {
          gpsStatus.style.display = 'block';
          gpsStatus.className = 'gps-status-indicator loading';
          gpsStatus.innerHTML = '<span>📡 Requesting device GPS coordinates...</span>';
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            if (gpsStatus) {
              gpsStatus.innerHTML = `<span>📍 Found (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). Resolving city & postal code...</span>`;
            }

            try {
              // OpenStreetMap Nominatim reverse geocode
              const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
                headers: { 'Accept-Language': 'en' }
              });
              const data = await resp.json();
              const addr = data.address || {};

              const city = addr.city || addr.town || addr.village || addr.county || 'Jaipur';
              const state = addr.state || 'Rajasthan';
              const postcode = addr.postcode || '302001';
              const road = addr.road || addr.suburb || addr.neighbourhood || 'Heritage Lane';
              const house = addr.house_number ? `${addr.house_number}, ` : '';

              const cityInput = this.container.querySelector('#guest-city');
              const stateInput = this.container.querySelector('#guest-state');
              const pinInput = this.container.querySelector('#guest-pincode');
              const addrInput = this.container.querySelector('#guest-address');

              if (cityInput) cityInput.value = city;
              if (stateInput) stateInput.value = state;
              if (pinInput) pinInput.value = postcode;
              if (addrInput) addrInput.value = `${house}${road}, ${city}`;

              if (gpsStatus) {
                gpsStatus.className = 'gps-status-indicator success';
                gpsStatus.innerHTML = `<span>✓ Location Detected: <strong>${city}, ${state} (${postcode})</strong>. You may edit anytime below.</span>`;
              }
              if (locateBtnText) locateBtnText.textContent = '✓ Located!';
              setTimeout(() => {
                if (locateBtnText) locateBtnText.textContent = 'Locate Me (Auto-Detect)';
              }, 4000);
            } catch (err) {
              // Fallback to coordinates
              if (gpsStatus) {
                gpsStatus.className = 'gps-status-indicator success';
                gpsStatus.innerHTML = `<span>✓ Coordinates detected (${latitude.toFixed(2)}, ${longitude.toFixed(2)}). Please verify your street details.</span>`;
              }
              if (locateBtnText) locateBtnText.textContent = 'Locate Me (Auto-Detect)';
            }
          },
          (error) => {
            let msg = "Could not retrieve location.";
            if (error.code === 1) msg = "Location permission was denied. Please fill in your address manually.";
            else if (error.code === 2) msg = "Position unavailable. Please type your city and PIN code.";
            else if (error.code === 3) msg = "Location request timed out.";

            if (gpsStatus) {
              gpsStatus.className = 'gps-status-indicator error';
              gpsStatus.innerHTML = `<span>⚠️ ${msg}</span>`;
            }
            if (locateBtnText) locateBtnText.textContent = 'Locate Me (Auto-Detect)';
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      });
    }

    // 6. Stage 1 -> Confirmation Modal Popup (Mandatory Review to Prevent Returns)
    const gotoPayBtn = this.container.querySelector('#btn-goto-payment');
    const confirmModal = this.container.querySelector('#checkout-confirm-modal');
    const termsCheckbox = this.container.querySelector('#terms-confirm-checkbox');
    const confirmProceedBtn = this.container.querySelector('#btn-confirm-proceed');
    const editDetailsBtn = this.container.querySelector('#btn-edit-details');

    if (gotoPayBtn) {
      gotoPayBtn.addEventListener('click', () => {
        // Collect guest details
        const name = this.container.querySelector('#guest-name').value.trim();
        const email = this.container.querySelector('#guest-email').value.trim();
        const phone = this.container.querySelector('#guest-phone').value.trim();
        const address = this.container.querySelector('#guest-address').value.trim();
        const city = this.container.querySelector('#guest-city').value.trim();
        const state = (this.container.querySelector('#guest-state') ? this.container.querySelector('#guest-state').value.trim() : 'Rajasthan');
        const pincode = this.container.querySelector('#guest-pincode').value.trim();
        const landmark = (this.container.querySelector('#guest-landmark') ? this.container.querySelector('#guest-landmark').value.trim() : '');
        const altName = (this.container.querySelector('#guest-alt-name') ? this.container.querySelector('#guest-alt-name').value.trim() : '');
        const altPhone = (this.container.querySelector('#guest-alt-phone') ? this.container.querySelector('#guest-alt-phone').value.trim() : '');

        // Validation
        if (!name || !email || !phone || !address || !city || !pincode) {
          alert("Please fill in all required primary recipient and address fields marked with *.");
          return;
        }

        if (!altName || !altPhone) {
          alert("Please provide alternate acceptor name & phone number. Handcrafted festive items cannot be re-routed if you are unavailable at drop-off.");
          return;
        }

        this.guestDetails = {
          name,
          email,
          phone,
          address,
          city,
          state,
          pincode,
          landmark,
          altName,
          altPhone
        };

        // Populate Confirmation Modal Summary
        const cfmName = this.container.querySelector('#cfm-name');
        const cfmPhone = this.container.querySelector('#cfm-phone');
        const cfmEmail = this.container.querySelector('#cfm-email');
        const cfmAddress = this.container.querySelector('#cfm-address');
        const cfmLandmark = this.container.querySelector('#cfm-landmark');
        const cfmAlt = this.container.querySelector('#cfm-alt');

        if (cfmName) cfmName.textContent = name;
        if (cfmPhone) cfmPhone.textContent = phone;
        if (cfmEmail) cfmEmail.textContent = email;
        if (cfmAddress) cfmAddress.textContent = `${address}, ${city}, ${state} - ${pincode}`;
        if (cfmLandmark) cfmLandmark.textContent = landmark || 'None provided';
        if (cfmAlt) cfmAlt.textContent = `${altName} • ${altPhone}`;

        // Reset terms checkbox
        if (termsCheckbox) termsCheckbox.checked = false;
        if (confirmProceedBtn) confirmProceedBtn.disabled = true;

        // Show Confirmation Modal
        if (confirmModal) confirmModal.style.display = 'flex';
      });
    }

    // Terms & Conditions checkbox enabling Confirm button
    if (termsCheckbox && confirmProceedBtn) {
      termsCheckbox.addEventListener('change', (e) => {
        confirmProceedBtn.disabled = !e.target.checked;
      });
    }

    // Edit details button inside confirmation modal
    if (editDetailsBtn && confirmModal) {
      editDetailsBtn.addEventListener('click', () => {
        confirmModal.style.display = 'none';
      });
    }

    // Confirm & Proceed to Payment Gateway
    if (confirmProceedBtn && confirmModal) {
      confirmProceedBtn.addEventListener('click', () => {
        confirmModal.style.display = 'none';
        this.showPaymentStage();
      });
    }

    // 7. Stage 2 Back to Stage 1
    const backBtn = this.container.querySelector('#btn-back-to-details');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.showStage('stage-guest-details');
      });
    }

    // 8. Payment Tabs Switching
    const tabs = this.container.querySelectorAll('.pay-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.getAttribute('data-tab');

        this.container.querySelectorAll('.payment-tab-content').forEach(c => c.classList.remove('active'));
        const activeContent = this.container.querySelector(`#tab-${target}`);
        if (activeContent) activeContent.classList.add('active');
      });
    });

    // 9. YouPI Sovereign Gateway & Other Payment Confirmation Handlers
    const vpaCopyBtn = this.container.querySelector('#youpi-vpa-copy-btn');
    if (vpaCopyBtn) {
      vpaCopyBtn.addEventListener('click', () => {
        const vpaText = this.container.querySelector('#youpi-display-vpa')?.textContent || 'utsavbazaar@icici';
        navigator.clipboard?.writeText(vpaText).then(() => {
          const original = vpaCopyBtn.innerHTML;
          vpaCopyBtn.innerHTML = `<code>${vpaText}</code> <span style="color:#10B981; font-weight:700;">✓ Copied</span>`;
          setTimeout(() => { vpaCopyBtn.innerHTML = original; }, 2000);
        });
      });
    }

    const btnVerifyUtr = this.container.querySelector('#btn-verify-youpi-utr');
    if (btnVerifyUtr) {
      btnVerifyUtr.addEventListener('click', () => {
        const utrInput = this.container.querySelector('#youpi-utr-input');
        const hint = this.container.querySelector('#youpi-utr-status-hint');
        const utr = (utrInput?.value || '').trim();

        if (!/^[0-9]{12}$/.test(utr)) {
          if (hint) hint.innerHTML = `<span style="color:#EF4444; font-weight:600;">⚠️ Please enter a valid 12-digit numeric Bank UTR (e.g. 428901847120) from your UPI receipt.</span>`;
          if (utrInput) utrInput.focus();
          return;
        }

        btnVerifyUtr.disabled = true;
        btnVerifyUtr.innerHTML = '<span>⏳ Contacting Bank Node...</span>';
        if (hint) hint.innerHTML = `<span>📡 Reconciling UTR <code>${utr}</code> with NPCI banking network...</span>`;

        setTimeout(() => {
          btnVerifyUtr.innerHTML = '<span style="color:#10B981;">✓ Bank Matched!</span>';
          if (hint) hint.innerHTML = `<span style="color:#10B981; font-weight:700;">✓ 100% Verified! Payment confirmed direct to atelier account.</span>`;
          setTimeout(() => {
            this.processPayment(`UPI (YouPI Verified - UTR: ${utr})`, utr, 'BANK_SMS');
          }, 800);
        }, 1500);
      });
    }

    const btnSimulateBankSMS = this.container.querySelector('#btn-simulate-bank-sms');
    if (btnSimulateBankSMS) {
      btnSimulateBankSMS.addEventListener('click', () => {
        const simUtr = `428901${Math.floor(100000 + Math.random() * 900000)}`;
        const utrInput = this.container.querySelector('#youpi-utr-input');
        const hint = this.container.querySelector('#youpi-utr-status-hint');
        if (utrInput) utrInput.value = simUtr;

        btnSimulateBankSMS.disabled = true;
        btnSimulateBankSMS.innerHTML = '<span>⚡ Ingesting Bank SMS Alert...</span>';
        if (hint) hint.innerHTML = `<span>📡 Simulated Cellular SMS Received: Credit of verified amount. Ref: <code>${simUtr}</code>. Auto-verifying...</span>`;

        setTimeout(() => {
          this.processPayment(`UPI (YouPI Auto-Verified - UTR: ${simUtr})`, simUtr, 'BANK_SMS');
        }, 1200);
      });
    }

    // App Switcher click tracking
    ['gpay', 'phonepe', 'paytm', 'cred'].forEach(app => {
      const btn = this.container.querySelector(`#youpi-app-${app}`);
      if (btn) {
        btn.addEventListener('click', () => {
          const hint = this.container.querySelector('#youpi-utr-status-hint');
          if (hint) {
            hint.innerHTML = `<span style="color:#38BDF8;">📲 App opened! Complete the payment in ${app.toUpperCase()} and enter the 12-digit UTR below.</span>`;
          }
        });
      }
    });

    // --- INTERACTIVE CARD PAYMENT HANDLERS ---
    const cardNumInput = this.container.querySelector('#card-num-input');
    const cardExpInput = this.container.querySelector('#card-exp-input');
    const cardCvvInput = this.container.querySelector('#card-cvv-input');
    const cardHolderInput = this.container.querySelector('#cardholder-name-val');
    const cardPreviewNumber = this.container.querySelector('#card-preview-number-display');
    const cardPreviewExp = this.container.querySelector('#card-preview-exp-display');
    const cardPreviewName = this.container.querySelector('#card-preview-name-display');
    const cardDetectedIcon = this.container.querySelector('#card-detected-icon');
    const cardBrandBadge = this.container.querySelector('#card-preview-brand-badge');

    // Card Number Input: Formatting (XXXX XXXX XXXX XXXX), Brand Detection & Live Preview
    if (cardNumInput) {
      cardNumInput.addEventListener('input', (e) => {
        let clean = e.target.value.replace(/\D/g, '').slice(0, 16);
        let formatted = clean.replace(/(.{4})/g, '$1 ').trim();
        e.target.value = formatted;

        // Detect Card Network
        let brand = 'VISA';
        let icon = '💳';
        if (clean.startsWith('4')) {
          brand = 'VISA';
          icon = '💳 Visa';
        } else if (/^(5[1-5]|2[2-7])/.test(clean)) {
          brand = 'MASTERCARD';
          icon = '💳 Mastercard';
        } else if (/^(60|65|81|82)/.test(clean)) {
          brand = 'RUPAY';
          icon = '💳 RuPay';
        } else if (/^(34|37)/.test(clean)) {
          brand = 'AMEX';
          icon = '💳 Amex';
        }

        this.detectedCardBrand = brand;
        if (cardDetectedIcon) cardDetectedIcon.textContent = icon;
        if (cardBrandBadge) cardBrandBadge.innerHTML = `<span class="brand-text-${brand.toLowerCase()}">${brand}</span>`;

        // Update visual card preview
        if (cardPreviewNumber) {
          cardPreviewNumber.textContent = formatted || '•••• •••• •••• ••••';
        }

        const errEl = this.container.querySelector('#card-num-err');
        if (errEl) errEl.style.display = 'none';
      });
    }

    // Expiry Date Input: Formatting (MM/YY) & Live Preview
    if (cardExpInput) {
      cardExpInput.addEventListener('input', (e) => {
        let clean = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (clean.length >= 3) {
          e.target.value = clean.slice(0, 2) + '/' + clean.slice(2);
        } else {
          e.target.value = clean;
        }

        if (cardPreviewExp) {
          cardPreviewExp.textContent = e.target.value || 'MM/YY';
        }

        const errEl = this.container.querySelector('#card-exp-err');
        if (errEl) errEl.style.display = 'none';
      });
    }

    // CVV Input
    if (cardCvvInput) {
      cardCvvInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
        const errEl = this.container.querySelector('#card-cvv-err');
        if (errEl) errEl.style.display = 'none';
      });
    }

    // Cardholder Name Input: Live Preview
    if (cardHolderInput) {
      cardHolderInput.addEventListener('input', (e) => {
        if (cardPreviewName) {
          cardPreviewName.textContent = (e.target.value.trim() || 'YOUR NAME').toUpperCase();
        }
        const errEl = this.container.querySelector('#card-name-err');
        if (errEl) errEl.style.display = 'none';
      });
    }

    // Pay via Card Button Click: Validation & 3D-Secure 2.0 OTP Modal Trigger
    const btnPayCard = this.container.querySelector('#btn-pay-card');
    if (btnPayCard) {
      btnPayCard.addEventListener('click', () => {
        let hasError = false;
        const numClean = (cardNumInput?.value || '').replace(/\D/g, '');
        const expVal = (cardExpInput?.value || '').trim();
        const cvvVal = (cardCvvInput?.value || '').trim();
        const nameVal = (cardHolderInput?.value || '').trim();

        if (numClean.length < 15) {
          const errEl = this.container.querySelector('#card-num-err');
          if (errEl) {
            errEl.textContent = 'Please enter a valid 15 or 16-digit card number.';
            errEl.style.display = 'block';
          }
          if (cardNumInput) cardNumInput.focus();
          hasError = true;
        }

        const [mm, yy] = expVal.split('/');
        const monthNum = parseInt(mm, 10);
        if (!mm || !yy || monthNum < 1 || monthNum > 12 || yy.length < 2) {
          const errEl = this.container.querySelector('#card-exp-err');
          if (errEl) {
            errEl.textContent = 'Enter valid expiry (MM/YY).';
            errEl.style.display = 'block';
          }
          if (!hasError && cardExpInput) cardExpInput.focus();
          hasError = true;
        }

        if (cvvVal.length < 3) {
          const errEl = this.container.querySelector('#card-cvv-err');
          if (errEl) {
            errEl.textContent = 'Enter 3 or 4-digit CVV.';
            errEl.style.display = 'block';
          }
          if (!hasError && cardCvvInput) cardCvvInput.focus();
          hasError = true;
        }

        if (nameVal.length < 2) {
          const errEl = this.container.querySelector('#card-name-err');
          if (errEl) {
            errEl.textContent = 'Please enter the cardholder name.';
            errEl.style.display = 'block';
          }
          if (!hasError && cardHolderInput) cardHolderInput.focus();
          hasError = true;
        }

        if (hasError) return;

        // Open 3D-Secure OTP Simulation Modal
        const otpModal = this.container.querySelector('#card-otp-modal');
        const amountDisplay = this.container.querySelector('#pay-stage-amount')?.textContent || '₹0';
        const otpAmount = this.container.querySelector('#otp-amount-display');
        const otpMasked = this.container.querySelector('#otp-card-masked');

        if (otpAmount) otpAmount.textContent = amountDisplay;
        if (otpMasked) otpMasked.textContent = `•••• •••• •••• ${numClean.slice(-4)}`;
        if (otpModal) otpModal.style.display = 'flex';
      });
    }

    // Card 3D-Secure OTP Modal Handlers
    const closeOtpBtn = this.container.querySelector('#btn-close-card-otp');
    const otpBackdrop = this.container.querySelector('#card-otp-backdrop');
    const quickFillOtpBtn = this.container.querySelector('#btn-otp-quick-fill');
    const submitOtpBtn = this.container.querySelector('#btn-submit-card-otp');

    const hideOtpModal = () => {
      const otpModal = this.container.querySelector('#card-otp-modal');
      if (otpModal) otpModal.style.display = 'none';
    };

    if (closeOtpBtn) closeOtpBtn.addEventListener('click', hideOtpModal);
    if (otpBackdrop) otpBackdrop.addEventListener('click', hideOtpModal);

    if (quickFillOtpBtn) {
      quickFillOtpBtn.addEventListener('click', () => {
        const otpInput = this.container.querySelector('#card-otp-code-input');
        if (otpInput) otpInput.value = '847291';
      });
    }

    if (submitOtpBtn) {
      submitOtpBtn.addEventListener('click', () => {
        const otpInput = this.container.querySelector('#card-otp-code-input');
        const code = (otpInput?.value || '').trim();
        if (code.length < 4) {
          alert('Please enter the 6-digit OTP sent to your registered mobile.');
          return;
        }

        submitOtpBtn.disabled = true;
        submitOtpBtn.innerHTML = '<span>⏳ Authorizing Card with Issuing Bank...</span>';

        setTimeout(() => {
          hideOtpModal();
          submitOtpBtn.disabled = false;
          submitOtpBtn.innerHTML = '<span>✓ Authorize & Confirm Payment</span>';
          
          const numClean = (cardNumInput?.value || '').replace(/\D/g, '');
          const last4 = numClean.slice(-4) || '8821';
          const cardDesc = `Credit/Debit Card (${this.detectedCardBrand || 'Card'} - ending in ${last4})`;
          const txnId = `CARD-${Date.now().toString().slice(-8)}`;
          
          this.processPayment(cardDesc, txnId, 'CARD_GATEWAY');
        }, 1200);
      });
    }

    // --- INTERACTIVE NET BANKING HANDLERS ---
    const bankPills = this.container.querySelectorAll('#popular-banks-grid .bank-pill');
    const allBanksSelect = this.container.querySelector('#all-banks-select');
    const selectedBankDisplay = this.container.querySelector('#current-selected-bank-name');
    const btnPayNB = this.container.querySelector('#btn-pay-nb');
    const btnPayNBLabel = this.container.querySelector('#btn-pay-nb-label');

    const updateSelectedBank = (bankName) => {
      this.selectedNetBank = bankName;
      if (selectedBankDisplay) selectedBankDisplay.textContent = bankName;
      const amountStr = this.container.querySelector('#pay-stage-amount')?.textContent || '';
      if (btnPayNBLabel) {
        btnPayNBLabel.textContent = `Pay ${amountStr} via ${bankName} NetBanking`;
      }
    };

    bankPills.forEach(pill => {
      pill.addEventListener('click', () => {
        bankPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        if (allBanksSelect) allBanksSelect.value = '';
        const bName = pill.getAttribute('data-bank');
        updateSelectedBank(bName);
      });
    });

    if (allBanksSelect) {
      allBanksSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          bankPills.forEach(p => p.classList.remove('active'));
          updateSelectedBank(val);
        }
      });
    }

    // Net Banking Modal Handlers
    const nbModal = this.container.querySelector('#netbanking-modal');
    const nbModalBankLogo = this.container.querySelector('#nb-modal-bank-logo');
    const nbModalAmount = this.container.querySelector('#nb-modal-amount');
    const btnConfirmNBAuth = this.container.querySelector('#btn-confirm-nb-auth');
    const btnCancelNBAuth = this.container.querySelector('#btn-cancel-nb-auth');
    const nbBackdrop = this.container.querySelector('#nb-backdrop');

    const hideNBModal = () => {
      if (nbModal) nbModal.style.display = 'none';
    };

    if (btnPayNB) {
      btnPayNB.addEventListener('click', () => {
        const amountDisplay = this.container.querySelector('#pay-stage-amount')?.textContent || '₹0';
        if (nbModalBankLogo) nbModalBankLogo.textContent = `🏛️ ${this.selectedNetBank}`;
        if (nbModalAmount) nbModalAmount.textContent = amountDisplay;
        if (nbModal) nbModal.style.display = 'flex';
      });
    }

    if (btnCancelNBAuth) btnCancelNBAuth.addEventListener('click', hideNBModal);
    if (nbBackdrop) nbBackdrop.addEventListener('click', hideNBModal);

    if (btnConfirmNBAuth) {
      btnConfirmNBAuth.addEventListener('click', () => {
        btnConfirmNBAuth.disabled = true;
        btnConfirmNBAuth.innerHTML = '<span>⏳ Authorizing Bank Transfer...</span>';

        setTimeout(() => {
          hideNBModal();
          btnConfirmNBAuth.disabled = false;
          btnConfirmNBAuth.innerHTML = '<span>✓ Approve & Complete Transfer</span>';
          
          const txnId = `NETB-${Date.now().toString().slice(-8)}`;
          this.processPayment(`Net Banking (${this.selectedNetBank})`, txnId, 'NET_BANKING');
        }, 1200);
      });
    }

    const btnPayCOD = this.container.querySelector('#btn-pay-cod');
    if (btnPayCOD) btnPayCOD.addEventListener('click', () => this.processPayment('Cash on Delivery', 'COD-CASH-COLL', 'CASH_DELIVERY'));

    // 10. High-Resolution PDF File Generation & Download
    const downloadPdfBtn = this.container.querySelector('#btn-download-pdf');
    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener('click', () => {
        this.downloadInvoicePDF();
      });
    }

    // 10b. Clean Isolated Print / Save as PDF Button
    const printBtn = this.container.querySelector('#btn-print-invoice');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        this.printInvoiceIsolated();
      });
    }

    // 11. Return to Bazaar / Clear Cart
    const returnBazaarBtn = this.container.querySelector('#btn-return-to-bazaar');
    if (returnBazaarBtn) {
      returnBazaarBtn.addEventListener('click', () => {
        this.clearCart();
        this.closeCheckoutModal();
        const shop = document.querySelector('#bazaar-storefront');
        if (shop) shop.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // 12. Currency update
    window.addEventListener('currency-changed', (e) => {
      this.currentCurrency = e.detail.currency;
      this.renderCartItems();
      this.updateTotals();
    });
  }

  openGuestCheckout() {
    const modalOverlay = this.container.querySelector('#checkout-modal-overlay');
    if (!modalOverlay) return;

    this.showStage('stage-guest-details');
    this.renderCheckoutSummary();
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  closeCheckoutModal() {
    const modalOverlay = this.container.querySelector('#checkout-modal-overlay');
    if (modalOverlay) modalOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  showStage(stageId) {
    const stages = ['stage-guest-details', 'stage-payment-gateway', 'stage-invoice-confirmation'];
    stages.forEach(s => {
      const el = this.container.querySelector(`#${s}`);
      if (el) el.style.display = (s === stageId) ? 'block' : 'none';
    });
    // Ensure modal dialog resets scroll position so invoice/stage opens at the very top
    const modalWin = this.container.querySelector('.checkout-modal-window');
    if (modalWin) modalWin.scrollTop = 0;
    const modalOverlay = this.container.querySelector('#checkout-modal-overlay');
    if (modalOverlay) modalOverlay.scrollTop = 0;
  }

  downloadInvoicePDF() {
    const invoiceEl = this.container.querySelector('#printable-tax-invoice');
    if (!invoiceEl) return;

    const invNum = this.container.querySelector('#inv-number-val')?.textContent?.trim() || `UB-INV-${Date.now().toString().slice(-6)}`;
    const downloadPdfBtn = this.container.querySelector('#btn-download-pdf');

    if (downloadPdfBtn) {
      downloadPdfBtn.disabled = true;
      downloadPdfBtn.innerHTML = `
        <svg style="animation:spin 1s linear infinite;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-linecap="round"></path>
        </svg>
        <span>⏳ Generating Crisp PDF...</span>
      `;
    }

    const restoreBtn = (success = true) => {
      if (!downloadPdfBtn) return;
      downloadPdfBtn.disabled = false;
      downloadPdfBtn.innerHTML = success ? `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>✓ PDF Downloaded!</span>
      ` : `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span>📥 Download PDF Invoice</span>
      `;
      setTimeout(() => {
        downloadPdfBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>📥 Download PDF Invoice</span>
        `;
      }, 3000);
    };

    if (typeof window.html2pdf === 'function') {
      // Build dedicated off-screen container rendered at standard A4 desktop width (794px)
      const exportContainer = document.createElement('div');
      exportContainer.id = 'pdf-export-container';
      exportContainer.style.position = 'fixed';
      exportContainer.style.left = '-9999px';
      exportContainer.style.top = '0';
      exportContainer.style.width = '794px';
      exportContainer.style.background = '#FFFFFF';
      exportContainer.style.color = '#0F172A';
      exportContainer.style.fontFamily = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      exportContainer.style.padding = '36px 40px';
      exportContainer.style.borderTop = '8px solid #D4AF37';
      exportContainer.style.boxSizing = 'border-box';
      exportContainer.style.zIndex = '-9999';
      exportContainer.innerHTML = invoiceEl.innerHTML;

      document.body.appendChild(exportContainer);

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Utsav-Bazaar-Tax-Invoice-${invNum}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2.5,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          scrollX: 0
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      };

      window.html2pdf().set(opt).from(exportContainer).save().then(() => {
        if (exportContainer.parentNode) exportContainer.parentNode.removeChild(exportContainer);
        restoreBtn(true);
      }).catch(err => {
        console.error("html2pdf generation error:", err);
        if (exportContainer.parentNode) exportContainer.parentNode.removeChild(exportContainer);
        this.printInvoiceIsolated();
        restoreBtn(false);
      });
    } else {
      this.printInvoiceIsolated();
      restoreBtn(true);
    }
  }

  printInvoiceIsolated() {
    const invoiceEl = this.container.querySelector('#printable-tax-invoice');
    if (!invoiceEl) return;

    const invNum = this.container.querySelector('#inv-number-val')?.textContent?.trim() || `UB-INV-${Date.now().toString().slice(-6)}`;

    const oldFrame = document.getElementById('utsav-invoice-print-frame');
    if (oldFrame) oldFrame.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'utsav-invoice-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>Utsav Bazaar - Tax Invoice ${invNum}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            background: #FFFFFF !important;
            color: #0F172A !important;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 12px;
            line-height: 1.5;
          }
          .royal-invoice-wrapper {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            background: #FFFFFF;
            padding: 32px 36px;
            border: 1.5px solid #E2E8F0;
            border-top: 6px solid #D4AF37;
            border-radius: 8px;
            box-shadow: none;
          }
          .invoice-top-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #E2E8F0;
            padding-bottom: 16px;
            margin-bottom: 16px;
          }
          .invoice-brand-col {
            flex: 1;
          }
          .invoice-company-name {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 22px;
            font-weight: 800;
            color: #0F172A;
            letter-spacing: 0.03em;
            margin-bottom: 3px;
          }
          .invoice-reg-address {
            font-size: 11px;
            line-height: 1.5;
            color: #64748B;
          }
          .invoice-meta-col {
            text-align: right;
          }
          .tax-invoice-badge {
            display: inline-block;
            background: #D4AF37;
            color: #000000;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.1em;
            padding: 4px 10px;
            border-radius: 4px;
            margin-bottom: 6px;
          }
          .inv-meta-row {
            font-size: 12px;
            color: #334155;
            margin-bottom: 2px;
          }
          .invoice-customer-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            background: #F8FAFC;
            padding: 14px 18px;
            border-radius: 8px;
            border: 1px solid #E2E8F0;
          }
          .cust-label {
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.08em;
            color: #64748B;
            display: block;
            margin-bottom: 4px;
          }
          .cust-val-name {
            font-size: 15px;
            font-weight: 700;
            color: #0F172A;
          }
          .cust-val-addr, .cust-val-city {
            font-size: 12px;
            color: #475569;
          }
          .cust-val-contact {
            font-size: 11px;
            color: #64748B;
            margin-top: 4px;
          }
          .gov-seal {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #ECFDF5;
            border: 1px solid #A7F3D0;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 10px;
            color: #065F46;
            max-width: 260px;
          }
          .seal-icon {
            font-size: 18px;
          }
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .invoice-table th {
            background: #F1F5F9;
            color: #334155;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 10px 12px;
            border-bottom: 2px solid #CBD5E1;
            text-align: left;
          }
          .invoice-table td {
            padding: 10px 12px;
            font-size: 12px;
            color: #1E293B;
            border-bottom: 1px solid #E2E8F0;
          }
          .invoice-bottom-grid {
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            gap: 24px;
            border-top: 2px solid #E2E8F0;
            padding-top: 16px;
          }
          .invoice-blessing-note h4 {
            font-size: 12px;
            font-weight: 700;
            color: #0F172A;
            margin: 0 0 4px 0;
          }
          .invoice-blessing-note p {
            font-size: 11px;
            line-height: 1.5;
            color: #64748B;
            margin: 0 0 16px 0;
          }
          .signatory-box {
            display: inline-block;
            border-top: 1px solid #CBD5E1;
            padding-top: 4px;
          }
          .sign-line {
            font-family: 'Cinzel', Georgia, serif;
            font-size: 12px;
            font-weight: 700;
            color: #D4AF37;
          }
          .sign-sub {
            font-size: 9px;
            color: #94A3B8;
            letter-spacing: 0.08em;
          }
          .invoice-summary-calc {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .calc-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #475569;
          }
          .calc-row.total-highlight {
            font-size: 15px;
            font-weight: 800;
            color: #0F172A;
            border-top: 2px solid #0F172A;
            padding-top: 8px;
            margin-top: 4px;
          }
          .grand-val {
            color: #B45309;
          }
          .free-shipping-tag {
            color: #10B981;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="royal-invoice-wrapper">
          ${invoiceEl.innerHTML}
        </div>
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 400);
  }

  renderCheckoutSummary() {
    const summaryItems = this.container.querySelector('#checkout-summary-items');
    if (!summaryItems) return;

    summaryItems.innerHTML = this.items.map(item => {
      const p = item.product;
      const priceText = this.getFormattedAmount(p.priceINR * item.quantity, p.priceUSD * item.quantity);
      return `
        <div class="summary-item-row">
          <div class="sum-name">${p.name} <span class="sum-qty">× ${item.quantity}</span></div>
          <div class="sum-price">${priceText}</div>
        </div>
      `;
    }).join('');

    const subtotalINR = this.items.reduce((sum, i) => sum + (i.product.priceINR * i.quantity), 0);
    const subtotalUSD = this.items.reduce((sum, i) => sum + (i.product.priceUSD * i.quantity), 0);

    const discountINR = subtotalINR * this.discountPercent;
    const discountUSD = subtotalUSD * this.discountPercent;

    const totalINR = subtotalINR - discountINR;
    const totalUSD = subtotalUSD - discountUSD;

    const gstINR = totalINR * 0.18;
    const gstUSD = totalUSD * 0.18;

    this.container.querySelector('#cs-subtotal').textContent = this.getFormattedAmount(subtotalINR, subtotalUSD);

    const discRow = this.container.querySelector('#cs-discount-row');
    if (this.discountPercent > 0) {
      discRow.style.display = 'flex';
      this.container.querySelector('#cs-discount').textContent = `-${this.getFormattedAmount(discountINR, discountUSD)}`;
    } else {
      discRow.style.display = 'none';
    }

    this.container.querySelector('#cs-gst').innerHTML = '<span style="color:#10B981; font-weight:700;">₹0 (No GST Applicable)</span>';
    this.container.querySelector('#cs-total').textContent = this.getFormattedAmount(totalINR, totalUSD);
  }

  showPaymentStage() {
    this.showStage('stage-payment-gateway');
    const subtotalINR = this.items.reduce((sum, i) => sum + (i.product.priceINR * i.quantity), 0);
    const subtotalUSD = this.items.reduce((sum, i) => sum + (i.product.priceUSD * i.quantity), 0);
    const totalINR = subtotalINR * (1 - this.discountPercent);
    const totalUSD = subtotalUSD * (1 - this.discountPercent);

    const totalStr = this.getFormattedAmount(totalINR, totalUSD);
    const amountEl = this.container.querySelector('#pay-stage-amount');
    if (amountEl) amountEl.textContent = totalStr;

    // Update cardholder name from guest name
    const chInput = this.container.querySelector('#cardholder-name-val');
    if (chInput) chInput.value = this.guestDetails.name;
    const cardPreviewName = this.container.querySelector('#card-preview-name-display');
    if (cardPreviewName) cardPreviewName.textContent = (this.guestDetails.name || 'YOUR NAME').toUpperCase();

    // Update payment button labels with current checkout amount
    const btnPayCardLabel = this.container.querySelector('#btn-pay-card-label');
    if (btnPayCardLabel) btnPayCardLabel.textContent = `🔒 Pay ${totalStr} with Credit / Debit Card`;

    const btnPayNBLabel = this.container.querySelector('#btn-pay-nb-label');
    if (btnPayNBLabel) btnPayNBLabel.textContent = `Pay ${totalStr} via ${this.selectedNetBank || 'State Bank of India'} NetBanking`;

    // Initialize YouPI Sovereign Session
    this.initYoupiSession(totalINR);
  }

  initYoupiSession(totalINR) {
    const settings = productStore.getYoupiSettings();
    const vpa = settings.merchantVpa || settings.upiVpa || 'utsavbazaar@okhdfcbank';
    const merchantName = settings.merchantName || 'Utsav Bazaar Master Atelier';
    const tempOrderId = `UB-ORD-${Date.now().toString().slice(-6)}`;
    this.currentPaymentOrderId = tempOrderId;

    // Update UI elements
    const vpaEl = this.container.querySelector('#youpi-display-vpa');
    if (vpaEl) vpaEl.textContent = vpa;

    const formattedAmount = `₹${Math.round(totalINR).toLocaleString('en-IN')}`;
    const amountEl = this.container.querySelector('#youpi-display-amount');
    if (amountEl) amountEl.textContent = formattedAmount;

    const btnAmountEl = this.container.querySelector('#youpi-btn-amount');
    if (btnAmountEl) btnAmountEl.textContent = formattedAmount;

    // Construct NPCI Standard UPI URI
    const upiUri = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(merchantName)}&am=${totalINR.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Utsav Bazaar ' + tempOrderId)}`;

    // Set Primary 1-Tap Mobile Intent Link (Opens any installed UPI app on device)
    const primaryIntentBtn = this.container.querySelector('#youpi-primary-intent-btn');
    if (primaryIntentBtn) {
      primaryIntentBtn.href = upiUri;
      primaryIntentBtn.onclick = () => {
        const hint = this.container.querySelector('#youpi-utr-status-hint');
        if (hint) {
          hint.innerHTML = `<span style="color:#38BDF8; font-weight:600;">📲 UPI App opened! Complete your transaction in GPay/PhonePe and paste the 12-digit UTR below to confirm.</span>`;
        }
      };
    }

    // Set mobile app switcher links
    const gpayBtn = this.container.querySelector('#youpi-app-gpay');
    const phonepeBtn = this.container.querySelector('#youpi-app-phonepe');
    const paytmBtn = this.container.querySelector('#youpi-app-paytm');
    const credBtn = this.container.querySelector('#youpi-app-cred');

    if (gpayBtn) gpayBtn.href = `gpay://upi/pay?pa=${vpa}&pn=${encodeURIComponent(merchantName)}&am=${totalINR.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Utsav Bazaar ' + tempOrderId)}`;
    if (phonepeBtn) phonepeBtn.href = `phonepe://upi/pay?pa=${vpa}&pn=${encodeURIComponent(merchantName)}&am=${totalINR.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Utsav Bazaar ' + tempOrderId)}`;
    if (paytmBtn) paytmBtn.href = `paytmmp://upi/pay?pa=${vpa}&pn=${encodeURIComponent(merchantName)}&am=${totalINR.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Utsav Bazaar ' + tempOrderId)}`;
    if (credBtn) credBtn.href = upiUri;

    // Clear input & hints
    const utrInput = this.container.querySelector('#youpi-utr-input');
    if (utrInput) utrInput.value = '';

    const hint = this.container.querySelector('#youpi-utr-status-hint');
    if (hint) {
      hint.innerHTML = `<span>⚡ Tap the button above to pay on phone, or scan the QR code. Enter the 12-digit UTR to confirm.</span>`;
    }

    // Record session in ProductStore (for admin live staking visibility!)
    this.currentYoupiSession = productStore.recordPaymentSession({
      orderId: tempOrderId,
      amountINR: totalINR,
      customer: {
        name: this.guestDetails.name,
        phone: this.guestDetails.phone,
        email: this.guestDetails.email
      },
      paymentMode: 'UPI_QR',
      status: 'PENDING'
    });

    // Start 5-minute countdown timer (300 seconds)
    this.startYoupiSessionTimer(300);
  }

  startYoupiSessionTimer(seconds = 300) {
    if (this.youpiTimerInterval) {
      clearInterval(this.youpiTimerInterval);
      this.youpiTimerInterval = null;
    }

    let remaining = seconds;
    const timerDisplay = this.container.querySelector('#youpi-timer-display');
    const updateDisplay = () => {
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      if (timerDisplay) {
        timerDisplay.textContent = formatted;
        if (remaining <= 60) {
          timerDisplay.style.color = '#EF4444';
        } else {
          timerDisplay.style.color = '';
        }
      }
    };

    updateDisplay();
    this.youpiTimerInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(this.youpiTimerInterval);
        this.youpiTimerInterval = null;
        if (timerDisplay) timerDisplay.textContent = '00:00 (Expired)';
        const hint = this.container.querySelector('#youpi-utr-status-hint');
        if (hint) {
          hint.innerHTML = '<span style="color:#EF4444;">⚠️ This 5-minute payment session has expired. Please refresh checkout to generate a fresh QR code.</span>';
        }
        if (this.currentYoupiSession) {
          productStore.updatePaymentStatus(this.currentYoupiSession.id, 'EXPIRED');
        }
      } else {
        updateDisplay();
      }
    }, 1000);
  }

  stopYoupiSessionTimer() {
    if (this.youpiTimerInterval) {
      clearInterval(this.youpiTimerInterval);
      this.youpiTimerInterval = null;
    }
  }

  numberToIndianWords(num) {
    if (!num || isNaN(num) || num <= 0) return 'Zero Rupees Only';
    num = Math.round(num);
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
      if (n < 20) return a[n];
      const digit = n % 10;
      return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
    };

    let words = '';
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const hundred = Math.floor(num / 100);
    const rem = num % 100;

    if (crore) words += inWords(crore) + ' Crore ';
    if (lakh) words += inWords(lakh) + ' Lakh ';
    if (thousand) words += inWords(thousand) + ' Thousand ';
    if (hundred) words += inWords(hundred) + ' Hundred ';
    if (rem) {
      if (words !== '') words += 'and ';
      words += inWords(rem) + ' ';
    }
    return 'INR ' + words.trim() + ' Only';
  }

  processPayment(paymentMode, utr = '', channel = '') {
    this.stopYoupiSessionTimer();
    const overlay = this.container.querySelector('#pay-processing-overlay');
    if (overlay) overlay.style.display = 'flex';

    // Simulate 1.2s bank authorization
    setTimeout(() => {
      if (overlay) overlay.style.display = 'none';
      this.generateAndShowTaxInvoice(paymentMode, utr, channel);
    }, 1200);
  }

  generateAndShowTaxInvoice(paymentMode, utr = '', channel = '') {
    const subtotalINR = this.items.reduce((sum, i) => sum + (i.product.priceINR * i.quantity), 0);
    const subtotalUSD = this.items.reduce((sum, i) => sum + (i.product.priceUSD * i.quantity), 0);

    const discountINR = subtotalINR * this.discountPercent;
    const discountUSD = subtotalUSD * this.discountPercent;

    const totalINR = subtotalINR - discountINR;
    const totalUSD = subtotalUSD - discountUSD;

    const invNum = `UB-INV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const ordId = `#UB-ORD-${Date.now().toString().slice(-6)}`;
    const today = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Populate confirmation banner
    this.container.querySelector('#inv-email-recipient').textContent = this.guestDetails.email;

    // Populate invoice fields
    this.container.querySelector('#inv-number-val').textContent = invNum;
    this.container.querySelector('#inv-order-id-val').textContent = ordId;
    this.container.querySelector('#inv-date-val').textContent = today;
    this.container.querySelector('#inv-paymode-val').textContent = paymentMode;

    const posEl = this.container.querySelector('#inv-pos-val');
    if (posEl) {
      posEl.textContent = `${this.guestDetails.city || 'State'} (${this.guestDetails.pincode ? this.guestDetails.pincode.slice(0, 2) : '08'})`;
    }

    // Customer fields
    this.container.querySelector('#inv-cust-name').textContent = this.guestDetails.name;
    this.container.querySelector('#inv-cust-addr').textContent = this.guestDetails.address;
    this.container.querySelector('#inv-cust-city').textContent = `${this.guestDetails.city} - ${this.guestDetails.pincode}`;
    this.container.querySelector('#inv-cust-phone').textContent = this.guestDetails.phone;
    this.container.querySelector('#inv-cust-email').textContent = this.guestDetails.email;

    // Table rows
    const tbody = this.container.querySelector('#invoice-items-tbody');
    if (tbody) {
      tbody.innerHTML = this.items.map((item, idx) => {
        const p = item.product;
        const rateStr = this.getFormattedAmount(p.priceINR, p.priceUSD);
        const lineTotalStr = this.getFormattedAmount(p.priceINR * item.quantity, p.priceUSD * item.quantity);
        const categoryHsn = `${p.category || 'Handicrafts'} (HSN 9703)`;

        return `
          <tr>
            <td style="font-weight:600; color:#64748B;">${idx + 1}</td>
            <td>
              <strong style="color:#0F172A; font-size:12px;">${p.name}</strong>
              <div style="font-size:10px; color:#64748B; margin-top:2px;">Origin: ${p.origin || 'India'} • Certified Artisan Handcraft</div>
            </td>
            <td><span style="font-size:11px; font-weight:600; color:#475569;">${categoryHsn}</span></td>
            <td style="text-align: center; font-weight:600; color:#0F172A;">${item.quantity}</td>
            <td style="text-align: right; color:#334155;">${rateStr}</td>
            <td style="text-align: right; font-weight:700; color:#0F172A;">${lineTotalStr}</td>
          </tr>
        `;
      }).join('');
    }

    // Calculation summary
    this.container.querySelector('#inv-calc-subtotal').textContent = this.getFormattedAmount(subtotalINR, subtotalUSD);

    const discRow = this.container.querySelector('#inv-calc-discount-row');
    if (this.discountPercent > 0) {
      discRow.style.display = 'flex';
      this.container.querySelector('#inv-calc-discount').textContent = `-${this.getFormattedAmount(discountINR, discountUSD)}`;
    } else {
      discRow.style.display = 'none';
    }

    this.container.querySelector('#inv-calc-grand-total').textContent = this.getFormattedAmount(totalINR, totalUSD);

    const wordsVal = this.container.querySelector('#inv-words-val');
    if (wordsVal) {
      wordsVal.textContent = this.numberToIndianWords(totalINR);
    }

    // Save order directly into Merchant Suite pipeline
    try {
      const orderData = {
        id: ordId,
        invoiceNumber: invNum,
        date: today,
        timestamp: Date.now(),
        customer: {
          name: this.guestDetails.name,
          email: this.guestDetails.email,
          phone: this.guestDetails.phone,
          address: this.guestDetails.address,
          city: this.guestDetails.city,
          pincode: this.guestDetails.pincode
        },
        items: this.items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          category: item.product.category,
          priceINR: item.product.priceINR,
          quantity: item.quantity,
          subtotalINR: item.product.priceINR * item.quantity
        })),
        subtotalINR,
        discountINR,
        taxINR: 0,
        totalINR,
        paymentMode: paymentMode,
        paymentStatus: paymentMode.includes('COD') ? 'Pending (COD)' : 'Paid (Verified)',
        orderStatus: 'New Order',
        trackingNumber: `UB-TRK-${Math.floor(1000000 + Math.random() * 9000000)}`
      };
      productStore.recordOrder(orderData);

      // Settle the payment session in ProductStore ledger
      if (this.currentYoupiSession) {
        const finalUtr = utr || `${Math.floor(400000000000 + Math.random() * 599999999999)}`;
        const finalChannel = channel || (paymentMode.includes('COD') ? 'CASH_DELIVERY' : 'BANK_SMS');
        const finalStatus = paymentMode.includes('COD') ? 'SUCCESS_COD' : 'SUCCESS';
        productStore.updatePaymentStatus(this.currentYoupiSession.id, finalStatus, finalUtr, finalChannel, paymentMode);
        this.currentYoupiSession = null;
      }
    } catch (e) {
      console.warn("Could not record order in merchant store", e);
    }

    // Audio celebration chime!
    soundManager.playCelebrationChime();

    // Show Stage 3
    this.showStage('stage-invoice-confirmation');
  }

  addItem(product) {
    const existing = this.items.find(i => i.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({ product, quantity: 1 });
    }
    this.renderCartItems();
    this.updateTotals();
    this.open();
  }

  changeQuantity(productId, delta) {
    const item = this.items.find(i => i.product.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(productId);
    } else {
      this.renderCartItems();
      this.updateTotals();
    }
  }

  removeItem(productId) {
    this.items = this.items.filter(i => i.product.id !== productId);
    this.renderCartItems();
    this.updateTotals();
  }

  clearCart() {
    this.items = [];
    this.renderCartItems();
    this.updateTotals();
  }

  open() {
    this.isOpen = true;
    this.container.querySelector('#cart-panel').classList.add('open');
    this.container.querySelector('#cart-backdrop').classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    this.container.querySelector('#cart-panel').classList.remove('open');
    this.container.querySelector('#cart-backdrop').classList.remove('visible');
    document.body.style.overflow = '';
  }

  renderCartItems() {
    const container = this.container.querySelector('#cart-items-container');
    const emptyView = this.container.querySelector('#empty-cart-view');
    const footer = this.container.querySelector('#drawer-footer');
    const countBadge = this.container.querySelector('#drawer-item-count');

    const totalCount = this.items.reduce((sum, i) => sum + i.quantity, 0);
    if (countBadge) countBadge.textContent = `${totalCount} item${totalCount === 1 ? '' : 's'}`;
    if (this.onUpdateCount) this.onUpdateCount(totalCount);

    if (this.items.length === 0) {
      if (container) container.innerHTML = '';
      if (emptyView) emptyView.style.display = 'block';
      if (footer) footer.style.display = 'none';
      return;
    }

    if (emptyView) emptyView.style.display = 'none';
    if (footer) footer.style.display = 'block';

    const itemsHtml = this.items.map(item => {
      const p = item.product;
      const unitPrice = this.getFormattedAmount(p.priceINR, p.priceUSD);
      const linePrice = this.getFormattedAmount(p.priceINR * item.quantity, p.priceUSD * item.quantity);

      return `
        <div class="cart-item-row" data-id="${p.id}">
          <div class="cart-item-symbol" style="border-color:${p.accentColor || '#D4AF37'}">
            ${p.imageUrl ? `<img src="${p.imageUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:6px;" alt="${p.name}"/>` : `<span>🪔</span>`}
          </div>
          <div class="cart-item-details">
            <h4 class="cart-item-title">${p.name}</h4>
            <div class="cart-item-meta">${p.origin}</div>
            <div class="cart-item-unit-price">
              ${unitPrice} each
              ${p.originalPriceINR && p.originalPriceINR > p.priceINR ? `<span style="text-decoration:line-through; color:#64748B; font-size:10px; margin-left:6px;">₹${p.originalPriceINR}</span>` : ''}
            </div>

            <div class="cart-item-actions">
              <div class="qty-stepper">
                <button class="qty-btn" data-qty-minus="${p.id}">−</button>
                <span class="qty-number">${item.quantity}</span>
                <button class="qty-btn" data-qty-plus="${p.id}">+</button>
              </div>
              <button class="item-remove-link" data-remove="${p.id}">Remove</button>
            </div>
          </div>
          <div class="cart-item-total-col">
            <span class="item-line-price">${linePrice}</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = itemsHtml;
  }

  updateTotals() {
    const subtotalINR = this.items.reduce((sum, i) => sum + (i.product.priceINR * i.quantity), 0);
    const subtotalUSD = this.items.reduce((sum, i) => sum + (i.product.priceUSD * i.quantity), 0);

    const discountINR = subtotalINR * this.discountPercent;
    const discountUSD = subtotalUSD * this.discountPercent;

    const totalINR = subtotalINR - discountINR;
    const totalUSD = subtotalUSD - discountUSD;

    const subtotalEl = this.container.querySelector('#cart-subtotal-val');
    const discountRow = this.container.querySelector('#discount-row');
    const discountEl = this.container.querySelector('#cart-discount-val');
    const grandTotalEl = this.container.querySelector('#cart-grand-total');

    if (subtotalEl) subtotalEl.textContent = this.getFormattedAmount(subtotalINR, subtotalUSD);

    if (this.discountPercent > 0) {
      if (discountRow) discountRow.style.display = 'flex';
      if (discountEl) discountEl.textContent = `-${this.getFormattedAmount(discountINR, discountUSD)}`;
    } else {
      if (discountRow) discountRow.style.display = 'none';
    }

    if (grandTotalEl) grandTotalEl.textContent = this.getFormattedAmount(totalINR, totalUSD);
  }

  getFormattedAmount(inr, usd) {
    switch (this.currentCurrency) {
      case 'USD':
        return `$${Math.round(usd)}`;
      case 'EUR':
        return `€${Math.round(usd * 0.92)}`;
      case 'GBP':
        return `£${Math.round(usd * 0.79)}`;
      case 'INR':
      default:
        return `₹${Math.round(inr).toLocaleString('en-IN')}`;
    }
  }
}
