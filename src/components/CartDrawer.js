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
      name: 'Aarav Sharma',
      email: 'aarav.sharma@utsavbazaar.in',
      phone: '+91 98765 43210',
      address: 'House 14, Royal Courtyard, M.G. Road',
      city: 'Jaipur',
      pincode: '302001'
    };

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

        <!-- Festive Blessing Message -->
        <div class="festive-blessing-bar">
          <span>✨ Blessed with sacred temple kumkum & handcrafted gift packaging.</span>
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
              <span>Sacred Packaging & Delivery</span>
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
            <span>⚡ 100% Login-Free Fast Checkout • Instant Royal Tax Invoice</span>
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
              <h2 class="stage-title">Express Sacred Checkout</h2>
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
                    <input type="text" id="guest-name" required value="Aarav Sharma" class="festive-input" placeholder="e.g. Aarav Sharma" />
                  </div>
                  <div class="form-group">
                    <label for="guest-phone">Phone Number *</label>
                    <input type="tel" id="guest-phone" required value="+91 98765 43210" class="festive-input" placeholder="+91 98765 43210" />
                  </div>
                </div>

                <div class="form-group">
                  <label for="guest-email">Email Address (For Instant Tax Invoice & Confirmation) *</label>
                  <input type="email" id="guest-email" required value="aarav.sharma@utsavbazaar.in" class="festive-input" placeholder="your.name@example.com" />
                  <span class="input-hint">📧 We will immediately send your official GST Tax Invoice and order receipt here.</span>
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
                  <input type="text" id="guest-address" required value="House 14, Royal Courtyard, M.G. Road" class="festive-input" placeholder="Apartment, building, street address" />
                </div>

                <div class="form-row-3">
                  <div class="form-group">
                    <label for="guest-city">City / District *</label>
                    <input type="text" id="guest-city" required value="Jaipur" class="festive-input" placeholder="City" />
                  </div>
                  <div class="form-group">
                    <label for="guest-state">State / Province *</label>
                    <input type="text" id="guest-state" required value="Rajasthan" class="festive-input" placeholder="State" />
                  </div>
                  <div class="form-group">
                    <label for="guest-pincode">Postal PIN Code *</label>
                    <input type="text" id="guest-pincode" required value="302001" class="festive-input" placeholder="PIN Code" />
                  </div>
                </div>

                <div class="form-group">
                  <label for="guest-landmark">Nearby Landmark (Optional for Courtyard Dropoff)</label>
                  <input type="text" id="guest-landmark" value="Near Hawa Mahal Gate 2" class="festive-input" placeholder="e.g. Opposite Shiva Temple, Near Metro Station" />
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
                    <span>Sacred Temple Kumkum & Box</span>
                    <span class="free-shipping-tag">INCLUDED</span>
                  </div>
                  <div class="s-row">
                    <span>GST (18% Included)</span>
                    <span id="cs-gst">₹0</span>
                  </div>
                  <div class="s-row total-row">
                    <span>Total Payable</span>
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
                  <strong class="c-val" id="cfm-name">Aarav Sharma</strong>
                </div>
                <div class="confirm-info-row">
                  <span class="c-label">Primary Mobile:</span>
                  <strong class="c-val" id="cfm-phone">+91 98765 43210</strong>
                </div>
                <div class="confirm-info-row">
                  <span class="c-label">Email Invoice:</span>
                  <span class="c-val" id="cfm-email">aarav.sharma@utsavbazaar.in</span>
                </div>
                <div class="confirm-info-row address-highlight-row">
                  <span class="c-label">Complete Address:</span>
                  <strong class="c-val" id="cfm-address">House 14, Royal Courtyard, M.G. Road, Jaipur, Rajasthan - 302001</strong>
                </div>
                <div class="confirm-info-row">
                  <span class="c-label">Landmark:</span>
                  <span class="c-val" id="cfm-landmark">Near Hawa Mahal Gate 2</span>
                </div>
                <div class="confirm-info-row alternate-highlight-row">
                  <span class="c-label">Alternate Acceptor:</span>
                  <strong class="c-val" id="cfm-alt">Sunita Sharma (Family) • +91 98290 12345</strong>
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
            <div class="stage-header">
              <span class="stage-tag">SECURE PAYMENT • भुगतान द्वार</span>
              <h2 class="stage-title">Select Payment Method</h2>
              <p class="stage-subtitle">
                Total Amount: <strong class="pay-highlight" id="pay-stage-amount">₹0</strong> • Complete your auspicious order.
              </p>
            </div>

            <!-- Payment Method Tabs -->
            <div class="payment-tabs-container">
              <div class="payment-tabs-header">
                <button class="pay-tab active" data-tab="upi">
                  <span class="tab-icon">⚡</span>
                  <span class="tab-label">UPI / QR Code</span>
                  <span class="tab-badge">Instant</span>
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

              <!-- UPI Tab Content -->
              <div class="payment-tab-content active" id="tab-upi">
                <div class="upi-pay-box">
                  <div class="upi-qr-card">
                    <div class="qr-glow-frame">
                      <!-- Procedural SVG QR Code with Festive Diwali Center Motif -->
                      <svg viewBox="0 0 180 180" class="upi-qr-svg" width="160" height="160">
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
                        <!-- QR Synthetic Matrix Data -->
                        <g fill="#1A1A1A">
                          <rect x="65" y="20" width="8" height="8"/>
                          <rect x="80" y="20" width="8" height="8"/>
                          <rect x="95" y="20" width="8" height="8"/>
                          <rect x="110" y="20" width="8" height="8"/>
                          <rect x="65" y="35" width="8" height="8"/>
                          <rect x="95" y="35" width="8" height="8"/>
                          <rect x="65" y="50" width="8" height="8"/>
                          <rect x="80" y="50" width="8" height="8"/>
                          <rect x="110" y="50" width="8" height="8"/>
                          <rect x="20" y="65" width="8" height="8"/>
                          <rect x="35" y="65" width="8" height="8"/>
                          <rect x="50" y="65" width="8" height="8"/>
                          <rect x="125" y="65" width="8" height="8"/>
                          <rect x="140" y="65" width="8" height="8"/>
                          <rect x="20" y="80" width="8" height="8"/>
                          <rect x="50" y="80" width="8" height="8"/>
                          <rect x="125" y="80" width="8" height="8"/>
                          <rect x="155" y="80" width="8" height="8"/>
                          <rect x="20" y="95" width="8" height="8"/>
                          <rect x="35" y="95" width="8" height="8"/>
                          <rect x="140" y="95" width="8" height="8"/>
                          <rect x="155" y="95" width="8" height="8"/>
                          <rect x="65" y="125" width="8" height="8"/>
                          <rect x="80" y="125" width="8" height="8"/>
                          <rect x="110" y="125" width="8" height="8"/>
                          <rect x="65" y="140" width="8" height="8"/>
                          <rect x="95" y="140" width="8" height="8"/>
                          <rect x="125" y="140" width="8" height="8"/>
                          <rect x="80" y="155" width="8" height="8"/>
                          <rect x="95" y="155" width="8" height="8"/>
                          <rect x="140" y="155" width="8" height="8"/>
                        </g>
                        <!-- Center Diwali Diya Logo in QR -->
                        <circle cx="90" cy="90" r="18" fill="#140E1E" stroke="#FFD700" stroke-width="2"/>
                        <text x="90" y="95" font-size="14" text-anchor="middle" fill="#FFD700">🪔</text>
                      </svg>
                    </div>
                    <div class="qr-label">Scan with any UPI App: GPay, PhonePe, Paytm, BHIM</div>
                    <div class="upi-id-pill">Merchant: <strong>utsavbazaar@icici</strong></div>
                  </div>

                  <div class="upi-action-col">
                    <p class="upi-desc">Or click below to simulate an instant authorized payment from your linked UPI account:</p>
                    <button class="stage-primary-btn" id="btn-pay-upi">
                      <span>⚡ Simulate Instant UPI Payment</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </button>
                    <button class="stage-back-btn" id="btn-back-to-details">← Back to Delivery Details</button>
                  </div>
                </div>
              </div>

              <!-- Card Tab Content -->
              <div class="payment-tab-content" id="tab-card">
                <div class="card-pay-box">
                  <div class="form-group">
                    <label>Card Number</label>
                    <input type="text" class="festive-input" value="4532 •••• •••• 8821" readonly />
                  </div>
                  <div class="form-row-2">
                    <div class="form-group">
                      <label>Valid Thru</label>
                      <input type="text" class="festive-input" value="10/29" readonly />
                    </div>
                    <div class="form-group">
                      <label>CVV</label>
                      <input type="password" class="festive-input" value="888" readonly />
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Cardholder Name</label>
                    <input type="text" class="festive-input" id="cardholder-name-val" value="Aarav Sharma" />
                  </div>
                  <button class="stage-primary-btn" id="btn-pay-card">
                    <span>🔒 Pay via Sacred Encrypted Card</span>
                  </button>
                </div>
              </div>

              <!-- Net Banking Tab Content -->
              <div class="payment-tab-content" id="tab-netbanking">
                <div class="netbanking-grid">
                  <div class="bank-pill active">🏛️ State Bank of India</div>
                  <div class="bank-pill">🏛️ HDFC Bank</div>
                  <div class="bank-pill">🏛️ ICICI Bank</div>
                  <div class="bank-pill">🏛️ Axis Bank</div>
                </div>
                <button class="stage-primary-btn" id="btn-pay-nb" style="margin-top: 20px;">
                  <span>Pay via Selected Bank</span>
                </button>
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
              <div class="banner-sparkle">🎆</div>
              <h2 class="banner-title">Shubh Deepavali! Order Confirmed</h2>
              <div class="banner-email-tag">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <span>Order Confirmation & Royal Tax Invoice dispatched to: <strong id="inv-email-recipient">customer@email.com</strong></span>
              </div>
            </div>

            <!-- Printable Royal Tax Invoice Card -->
            <div class="royal-invoice-document" id="printable-tax-invoice">
              <!-- Invoice Header -->
              <div class="invoice-top-row">
                <div class="invoice-brand-col">
                  <div class="invoice-company-name">UTSAV BAZAAR PRIVATE LIMITED</div>
                  <div class="invoice-reg-address">
                    Heritage Craft District, Johari Bazaar, Jaipur, Rajasthan 302003<br/>
                    GSTIN: <strong>08AAACU5678K1Z3</strong> | CIN: U52100RJ2026PTC049821<br/>
                    Email: blessings@utsavbazaar.in | Web: www.utsavbazaar.in
                  </div>
                </div>
                <div class="invoice-meta-col">
                  <div class="tax-invoice-badge">TAX INVOICE / कर बीजक</div>
                  <div class="inv-meta-row"><strong>Invoice No:</strong> <span id="inv-number-val">UB-INV-2026-98421</span></div>
                  <div class="inv-meta-row"><strong>Order ID:</strong> <span id="inv-order-id-val">#UB-ORD-884102</span></div>
                  <div class="inv-meta-row"><strong>Date:</strong> <span id="inv-date-val">15 October 2026</span></div>
                  <div class="inv-meta-row"><strong>Payment Mode:</strong> <span id="inv-paymode-val">UPI / Verified Online</span></div>
                </div>
              </div>

              <!-- Customer Billed To & Shipped To -->
              <div class="invoice-customer-row">
                <div class="cust-col">
                  <span class="cust-label">BILLED & SHIPPED TO:</span>
                  <div class="cust-val-name" id="inv-cust-name">Aarav Sharma</div>
                  <div class="cust-val-addr" id="inv-cust-addr">House 14, Royal Courtyard, M.G. Road</div>
                  <div class="cust-val-city" id="inv-cust-city">Jaipur, 302001</div>
                  <div class="cust-val-contact">
                    Phone: <span id="inv-cust-phone">+91 98765 43210</span> | 
                    Email: <span id="inv-cust-email">aarav.sharma@utsavbazaar.in</span>
                  </div>
                </div>
                <div class="compliance-col">
                  <div class="gov-seal">
                    <span class="seal-icon">🏛️</span>
                    <div>
                      <strong>ALL INDIA HANDICRAFTS BOARD COMPLIANCE</strong>
                      <div>Govt. of India Artisanal Metalcraft & Home Decor Standards</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Itemized Products Table -->
              <table class="invoice-table">
                <thead>
                  <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 45%;">Description of Festive Goods</th>
                    <th style="width: 15%;">HSN/SAC</th>
                    <th style="width: 10%; text-align: center;">Qty</th>
                    <th style="width: 12%; text-align: right;">Unit Rate</th>
                    <th style="width: 13%; text-align: right;">Total Amount</th>
                  </tr>
                </thead>
                <tbody id="invoice-items-tbody">
                  <!-- Generated dynamically from cart items -->
                </tbody>
              </table>

              <!-- Invoice Bottom Totals & GST Summary -->
              <div class="invoice-bottom-grid">
                <div class="invoice-blessing-note">
                  <h4>✨ Sacred Guarantee</h4>
                  <p>
                    Every offering in this sacred box is sanctified with holy Ganga jal and pure temple kumkum. Thank you for empowering our generational artisan families across Bharat.
                  </p>
                  <div class="signatory-box">
                    <div class="sign-line">Shubh Deepavali 2026</div>
                    <div class="sign-sub">UTSAV BAZAAR AUTHORIZED SIGNATORY</div>
                  </div>
                </div>

                <div class="invoice-summary-calc">
                  <div class="calc-row">
                    <span>Taxable Value (Subtotal):</span>
                    <span id="inv-calc-subtotal">₹0</span>
                  </div>
                  <div class="calc-row" id="inv-calc-discount-row" style="display: none;">
                    <span>Festive Blessing Discount:</span>
                    <span id="inv-calc-discount">-₹0</span>
                  </div>
                  <div class="calc-row">
                    <span>Central GST (CGST 9%):</span>
                    <span id="inv-calc-cgst">₹0</span>
                  </div>
                  <div class="calc-row">
                    <span>State GST (SGST 9%):</span>
                    <span id="inv-calc-sgst">₹0</span>
                  </div>
                  <div class="calc-row">
                    <span>Sacred Packaging & Insured Transit:</span>
                    <span class="free-shipping-tag">FREE (₹0.00)</span>
                  </div>
                  <div class="calc-row total-highlight">
                    <span>TOTAL INVOICE VALUE:</span>
                    <span class="grand-val" id="inv-calc-grand-total">₹0</span>
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

    // 9. Payment Confirmation Handlers (UPI, Card, NetBanking, COD)
    const btnPayUPI = this.container.querySelector('#btn-pay-upi');
    const btnPayCard = this.container.querySelector('#btn-pay-card');
    const btnPayNB = this.container.querySelector('#btn-pay-nb');
    const btnPayCOD = this.container.querySelector('#btn-pay-cod');

    if (btnPayUPI) btnPayUPI.addEventListener('click', () => this.processPayment('UPI (GPay/PhonePe)'));
    if (btnPayCard) btnPayCard.addEventListener('click', () => this.processPayment('Sacred Encrypted Card'));
    if (btnPayNB) btnPayNB.addEventListener('click', () => this.processPayment('Net Banking (SBI/HDFC)'));
    if (btnPayCOD) btnPayCOD.addEventListener('click', () => this.processPayment('Cash on Delivery'));

    // 10. Direct PDF File Generation & Download
    const downloadPdfBtn = this.container.querySelector('#btn-download-pdf');
    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener('click', () => {
        const invoiceEl = this.container.querySelector('#printable-tax-invoice');
        if (!invoiceEl) return;

        const invNum = this.container.querySelector('#inv-number-val')?.textContent || 'UB-INV';
        downloadPdfBtn.disabled = true;
        downloadPdfBtn.innerHTML = '<span>⏳ Generating PDF...</span>';

        // Generate printable standalone HTML document for high quality PDF export
        const invoiceHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Tax Invoice - ${invNum}</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; color: #1e293b; background: #fff; }
              .invoice-top-row { display: flex; justify-content: space-between; border-bottom: 2px solid #D4AF37; padding-bottom: 15px; margin-bottom: 20px; }
              .invoice-company-name { font-size: 20px; font-weight: 800; color: #111; letter-spacing: 0.05em; }
              .invoice-reg-address { font-size: 11px; color: #64748b; line-height: 1.4; margin-top: 4px; }
              .tax-invoice-badge { font-size: 13px; font-weight: 800; color: #D4AF37; text-align: right; margin-bottom: 6px; letter-spacing: 0.05em; }
              .inv-meta-row { font-size: 12px; color: #334155; margin-bottom: 2px; text-align: right; }
              .invoice-customer-row { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 24px; }
              .cust-label { font-size: 10px; font-weight: 800; color: #64748b; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
              .cust-val-name { font-size: 15px; font-weight: 700; color: #0f172a; }
              .cust-val-addr, .cust-val-city, .cust-val-contact { font-size: 12px; color: #334155; margin-top: 2px; }
              .gov-seal { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #047857; font-weight: 700; }
              .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
              .invoice-table th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 10px; font-size: 11px; text-transform: uppercase; color: #475569; text-align: left; }
              .invoice-table td { border: 1px solid #e2e8f0; padding: 10px; font-size: 12px; }
              .invoice-bottom-grid { display: flex; justify-content: space-between; gap: 20px; }
              .invoice-blessing-note { flex: 1; font-size: 12px; color: #64748b; line-height: 1.5; }
              .invoice-summary-calc { width: 340px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
              .calc-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; color: #334155; }
              .total-highlight { border-top: 2px solid #D4AF37; padding-top: 8px; font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 8px; }
              .free-shipping-tag { color: #059669; font-weight: 700; }
            </style>
          </head>
          <body>
            ${invoiceEl.innerHTML}
          </body>
          </html>
        `;

        // Direct Download as HTML/PDF or Print Dialog
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(invoiceHTML);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 350);
        } else {
          // If popup blocked, create downloadable file
          const blob = new Blob([invoiceHTML], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Tax-Invoice-${invNum}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }

        setTimeout(() => {
          downloadPdfBtn.disabled = false;
          downloadPdfBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>📥 Download PDF Invoice</span>
          `;
        }, 1200);
      });
    }

    // 10b. Print / Save as PDF Button
    const printBtn = this.container.querySelector('#btn-print-invoice');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
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

    this.container.querySelector('#cs-gst').textContent = this.getFormattedAmount(gstINR, gstUSD);
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
  }

  processPayment(paymentMode) {
    const overlay = this.container.querySelector('#pay-processing-overlay');
    if (overlay) overlay.style.display = 'flex';

    // Simulate 1.2s bank authorization
    setTimeout(() => {
      if (overlay) overlay.style.display = 'none';
      this.generateAndShowTaxInvoice(paymentMode);
    }, 1200);
  }

  generateAndShowTaxInvoice(paymentMode) {
    const subtotalINR = this.items.reduce((sum, i) => sum + (i.product.priceINR * i.quantity), 0);
    const subtotalUSD = this.items.reduce((sum, i) => sum + (i.product.priceUSD * i.quantity), 0);

    const discountINR = subtotalINR * this.discountPercent;
    const discountUSD = subtotalUSD * this.discountPercent;

    const totalINR = subtotalINR - discountINR;
    const totalUSD = subtotalUSD - discountUSD;

    const cgstINR = (totalINR * 0.09);
    const sgstINR = (totalINR * 0.09);
    const cgstUSD = (totalUSD * 0.09);
    const sgstUSD = (totalUSD * 0.09);

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
        const hsn = p.category === 'fireworks' ? '3604' : (p.category === 'diyas' ? '7418' : '9505');

        return `
          <tr>
            <td>${idx + 1}</td>
            <td>
              <strong>${p.name}</strong>
              <div style="font-size:10px; color:#64748B;">Origin: ${p.origin} • Blessed Edition</div>
            </td>
            <td>${hsn}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${rateStr}</td>
            <td style="text-align: right; font-weight:700;">${lineTotalStr}</td>
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

    this.container.querySelector('#inv-calc-cgst').textContent = this.getFormattedAmount(cgstINR, cgstUSD);
    this.container.querySelector('#inv-calc-sgst').textContent = this.getFormattedAmount(sgstINR, sgstUSD);
    this.container.querySelector('#inv-calc-grand-total').textContent = this.getFormattedAmount(totalINR, totalUSD);

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
        taxINR: cgstINR + sgstINR,
        totalINR,
        paymentMode: paymentMode,
        paymentStatus: paymentMode.includes('COD') ? 'Pending (COD)' : 'Paid (Verified)',
        orderStatus: 'Processing',
        trackingNumber: `UB-TRK-${Math.floor(1000000 + Math.random() * 9000000)}`
      };
      productStore.recordOrder(orderData);
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
