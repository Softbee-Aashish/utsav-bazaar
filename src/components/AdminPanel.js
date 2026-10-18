// High-End Luxury Merchant Suite & 360° Storefront CMS for Utsav Bazaar
import { productStore } from '../engine/ProductStore.js';

export class AdminPanel {
  constructor(container, onNavigateHome) {
    this.container = container;
    this.onNavigateHome = onNavigateHome || null;
    this.isOpen = false;
    this.isAuthenticated = sessionStorage.getItem('utsav_admin_auth') === 'true';
    this.activeTab = 'overview';
    this.orderFilter = 'unshipped';
    this.orderSearchQuery = '';
    this.paymentFilter = 'all';
    this.paymentSearchQuery = '';
    this.stakingTimerInterval = null;
    this.catalogFestivalFilter = 'all';
    this.catalogSearchQuery = '';
    this.editingProduct = null;
    this.currentImageBase64 = '';
    this.currentMediaList = []; // Array of { type: 'image'|'video'|'gif', url: string, name?: string }
    this.activePreviewMediaIdx = 0;
    this.currentRevAvatarBase64 = '';
    this.currentRevPhotoBase64 = '';
    this.reviewsViewFilter = 'selected'; // 'selected' | 'all'

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="admin-modal-overlay" id="admin-modal-overlay" style="display: none;">
        ${!this.isAuthenticated ? this.renderLoginView() : this.renderDashboardView()}
      </div>

      <!-- ADD / EDIT PRODUCT MODAL (Live Storefront Post Preview + Multi-Media CMS) -->
      <div class="admin-modal-overlay" id="product-editor-modal" style="display: none; z-index: 100005;">
        <div class="admin-window editor-window">
          <div class="admin-header">
            <div class="admin-title-group">
              <span class="admin-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #D4AF37;">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </span>
              <div>
                <h3 class="admin-title" id="editor-dialog-title">Festive Offering Editor & Live Storefront Preview</h3>
                <span class="admin-subtitle">Real-time storefront simulation • Multi-image, GIF & HD Video showcase</span>
              </div>
            </div>
            <button class="admin-close-btn" id="btn-close-editor" title="Close Editor">✕</button>
          </div>
          
          <div class="admin-content-body editor-content-body">
            <form id="product-editor-form" class="editor-form-grid" onsubmit="return false;">
              <input type="hidden" id="edit-id" />
              
              <!-- LEFT COLUMN: Offering Data, Pricing & Rich Description -->
              <div class="form-col-left">
                <div class="editor-section-title">
                  <span>1. Offering Details & Lineage</span>
                </div>

                <div class="form-group">
                  <label>Offering Name / Title *</label>
                  <input type="text" id="edit-name" class="admin-input" required placeholder="e.g. Royal Moradabad Peacock Brass Diya" />
                </div>

                <div class="form-row-2">
                  <div class="form-group">
                    <label>Category *</label>
                    <select id="edit-category" class="admin-select">
                      <option value="diyas">Royal Brass Diyas</option>
                      <option value="decor">Royal Urlis & Home Decor</option>
                      <option value="apparel">Royal Silk & Attire (Cloths)</option>
                      <option value="torans">Torans & Wall Hangings</option>
                      <option value="lanterns">Jali Lanterns</option>
                      <option value="hampers">Festive Hampers</option>
                      <option value="heirlooms">Kundan Heirlooms</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Festive Occasion / Mahotsav *</label>
                    <select id="edit-festival" class="admin-select">
                      <option value="diwali">🪔 Diwali (Deepavali Mahotsav)</option>
                      <option value="dhanteras">🪙 Dhanteras (Auspicious Gold & Brass)</option>
                      <option value="karwa-chauth">🌕 Karwa Chauth (Shringar & Vrat)</option>
                      <option value="bhai-dooj">🌸 Bhai Dooj (Sister-Brother Blessings)</option>
                      <option value="chhath-puja">☀️ Chhath Puja (Surya Mahaparv)</option>
                      <option value="navratri">🌺 Navratri & Durga Puja (Shakti Mahotsav)</option>
                      <option value="wedding">👑 Shahi Vivah & Royal Weddings</option>
                      <option value="general">✨ All-Year Auspicious Heritage</option>
                    </select>
                  </div>
                </div>

                <div class="form-row-2">
                  <div class="form-group">
                    <label>Geographic Origin *</label>
                    <input type="text" id="edit-origin" class="admin-input" placeholder="e.g. Moradabad, Uttar Pradesh" />
                  </div>
                  <div class="form-group">
                    <label>Custom Festive Tag / Collection Name</label>
                    <input type="text" id="edit-festival-tag" class="admin-input" placeholder="e.g. Laxmi-Ganesh Pujan Special" />
                  </div>
                </div>

                <div class="editor-section-title" style="margin-top: 14px;">
                  <span>2. Commercial Pricing & Profit Intelligence (Zero GST)</span>
                </div>

                <div class="form-row-3">
                  <div class="form-group">
                    <label>Sale Price (₹ INR) *</label>
                    <input type="number" id="edit-price" class="admin-input" required min="1" placeholder="2499" />
                  </div>
                  <div class="form-group">
                    <label>Marked Original Price (₹)</label>
                    <input type="number" id="edit-orig-price" class="admin-input" min="1" placeholder="3299" />
                  </div>
                  <div class="form-group">
                    <label>Artisan Cost Price (₹)</label>
                    <input type="number" id="edit-cost-price" class="admin-input" min="0" placeholder="1350" />
                    <span class="admin-hint-text">Used to calculate your real Net Profit.</span>
                  </div>
                </div>

                <div class="editor-section-title" style="margin-top: 14px;">
                  <span>3. Inventory & Logistics (SKU / Exact Units)</span>
                </div>

                <div class="form-row-3">
                  <div class="form-group">
                    <label>Stock Quantity (Units) *</label>
                    <input type="number" id="edit-stock-qty" class="admin-input" required min="0" placeholder="25" />
                  </div>
                  <div class="form-group">
                    <label>Low Stock Warning Limit</label>
                    <input type="number" id="edit-low-stock" class="admin-input" min="1" placeholder="5" />
                  </div>
                  <div class="form-group">
                    <label>Discount Badge (%)</label>
                    <input type="number" id="edit-discount" class="admin-input" min="0" max="95" placeholder="24" />
                  </div>
                </div>

                <div class="form-row-3">
                  <div class="form-group">
                    <label>Unique SKU Code</label>
                    <input type="text" id="edit-sku" class="admin-input" placeholder="e.g. UB-DIYA-MBD-01" />
                  </div>
                  <div class="form-group">
                    <label>HSN Code (Brass / Craft)</label>
                    <input type="text" id="edit-hsn" class="admin-input" placeholder="e.g. 7419" />
                  </div>
                  <div class="form-group">
                    <label>Storefront Badge</label>
                    <input type="text" id="edit-badge" class="admin-input" placeholder="e.g. Best Seller / Royal Selection" />
                  </div>
                </div>

                <div class="form-group" style="padding-bottom: 4px;">
                  <label class="checkbox-label">
                    <input type="checkbox" id="edit-instock" checked />
                    <span>Storefront Available for Customer Orders</span>
                  </label>
                </div>

                <div class="form-group">
                  <label>Hero Summary / Tagline *</label>
                  <input type="text" id="edit-tagline" class="admin-input" placeholder="e.g. Handcrafted Moradabad solid brass diya with intricate filigree peacock crest" />
                  <span class="admin-hint-text">Appears prominently above buy buttons and quick specs on storefront.</span>
                </div>

                <div class="form-group">
                  <div class="rte-label-row">
                    <label>Artisanal Description & Highlights</label>
                    <div class="rte-toolbar" id="editor-rte-toolbar">
                      <button type="button" class="rte-btn" data-rte="bold" title="Bold"><strong>B</strong></button>
                      <button type="button" class="rte-btn" data-rte="italic" title="Italic"><em>I</em></button>
                      <button type="button" class="rte-btn" data-rte="underline" title="Underline"><u>U</u></button>
                      <button type="button" class="rte-btn" data-rte="list" title="Bullet List">• List</button>
                      <button type="button" class="rte-btn" data-rte="h3" title="Heading">H3</button>
                      <div class="rte-color-picker-wrap" title="Text Color">
                        <span class="color-indicator" id="rte-color-indicator" style="background:#D4AF37;"></span>
                        <input type="color" id="rte-color-input" value="#D4AF37" />
                      </div>
                    </div>
                  </div>
                  <textarea id="edit-description" class="admin-textarea" rows="4" placeholder="Detailed artisanal story, dimensions, material grade, and styling notes..."></textarea>
                </div>
              </div>

              <!-- RIGHT COLUMN: Multi-Media Manager + Live Storefront Post Preview -->
              <div class="form-col-right editor-preview-column">
                <div class="editor-section-title">
                  <span>3. Multi-Media Showcase (Images, GIFs, Videos)</span>
                </div>

                <!-- Media Uploader Card -->
                <div class="media-manager-card">
                  <div class="upload-actions-bar">
                    <label class="admin-btn-secondary upload-btn-label" title="Upload Photos, Animated GIFs or MP4/WebM Videos">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span>Upload Files (Images / GIF / Video)</span>
                      <input type="file" id="edit-multi-file-input" accept="image/*,video/mp4,video/webm" multiple style="display: none;" />
                    </label>
                  </div>

                  <div class="url-add-row">
                    <input type="url" id="edit-direct-media-url" class="admin-input" placeholder="Paste Direct Image, GIF or Video URL (https://...)" />
                    <button type="button" class="admin-btn-secondary" id="btn-add-media-url" style="padding: 0 16px; white-space: nowrap;">
                      + Add URL
                    </button>
                  </div>

                  <!-- Multi-Media Thumbnails Strip -->
                  <div class="media-strip-container">
                    <div class="media-strip-label">
                      <span>Media Assets (<span id="media-count-badge">0</span> items)</span>
                      <small style="color: #94A3B8;">Click thumb to preview • Drag/Order • First is primary</small>
                    </div>
                    <div class="media-thumbs-strip" id="editor-media-strip">
                      <!-- Rendered dynamically -->
                    </div>
                  </div>
                </div>

                <!-- LIVE STOREFRONT CARD PREVIEW (Real-time Mirror) -->
                <div class="editor-section-title" style="margin-top: 18px;">
                  <span>4. Live Storefront Card Preview</span>
                  <span class="live-pulse-badge">● LIVE STOREFRONT PREVIEW</span>
                </div>

                <div class="live-preview-container">
                  <div class="live-card-mockup" id="live-card-mockup">
                    <div class="mockup-img-wrap" id="mockup-media-display">
                      <!-- Active media item (img or video) rendered here -->
                      <div class="mockup-placeholder">No Media Uploaded</div>
                    </div>
                    <div class="mockup-badge" id="mockup-badge">FESTIVE SPECIAL</div>
                    <div class="mockup-body">
                      <div class="mockup-origin" id="mockup-origin">Moradabad, Uttar Pradesh</div>
                      <h4 class="mockup-title" id="mockup-title">Royal Moradabad Peacock Brass Diya</h4>
                      <p class="mockup-tagline" id="mockup-tagline">Handcrafted solid brass with peacock filigree crest</p>
                      
                      <div class="mockup-price-row">
                        <div class="mockup-prices">
                          <span class="mockup-sale-price" id="mockup-sale-price">₹2,499</span>
                          <span class="mockup-orig-price" id="mockup-orig-price">₹3,299</span>
                          <span class="mockup-discount-pill" id="mockup-discount-pill">-24%</span>
                        </div>
                        <div class="mockup-delivery-perk">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>FREE INSURED DELIVERY</span>
                        </div>
                      </div>

                      <div class="mockup-action-btn">
                        <span>🛍️ View Offering & Add to Thali</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div class="admin-footer">
            <button class="admin-btn-secondary" id="btn-cancel-edit">Cancel</button>
            <button class="admin-btn-primary" id="btn-save-offering">
              <span>✓ Save Offering to Storefront</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderLoginView() {
    return `
      <div class="admin-login-window">
        <div class="login-brand-header">
          <div class="login-crest">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="royal-crest-svg">
              <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5z"></path>
              <circle cx="12" cy="4" r="1.5" fill="#D4AF37"></circle>
              <circle cx="2" cy="4" r="1.5" fill="#D4AF37"></circle>
              <circle cx="22" cy="4" r="1.5" fill="#D4AF37"></circle>
            </svg>
          </div>
          <h2 class="login-title">Shahi Merchant Suite</h2>
          <div class="login-devanagari">शाही व्यापारी नियंत्रण केंद्र</div>
          <p class="login-subtitle">Restricted Access • Private Management Console for Store Owner Only</p>
        </div>

        <form id="admin-login-form" class="login-form-box" onsubmit="return false;">
          <div class="form-group">
            <label>Merchant Username</label>
            <input type="text" id="admin-username-input" class="admin-input" value="admin" autocomplete="username" />
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label style="margin: 0;">Store Owner Passcode</label>
              <button type="button" id="btn-toggle-pass-visibility" class="toggle-pass-btn">👁️ Show</button>
            </div>
            <input type="password" id="admin-passcode-input" class="admin-input" placeholder="Enter owner passcode" autocomplete="current-password" autofocus />
          </div>

          <div class="login-passcode-hint">
            <span>🔑 Merchant Passcode:</span> <code>utsav2026</code>
          </div>

          <div class="login-error-msg" id="admin-login-error" style="display: none;">
            ⚠️ Invalid credentials. Access is restricted to store owner only.
          </div>

          <div class="login-actions">
            <button type="submit" class="admin-btn-primary btn-unlock-dashboard" id="btn-admin-login-submit">
              <span>🔓 Unlock Merchant Command Center</span>
            </button>
            <button type="button" class="admin-btn-secondary" id="btn-close-login">
              <span>Return to Storefront</span>
            </button>
          </div>
        </form>
      </div>
    `;
  }

  renderDashboardView() {
    return `
      <div class="admin-window">
        <!-- Admin Header -->
        <div class="admin-header">
          <div class="admin-title-group">
            <span class="admin-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="royal-crest-svg">
                <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5z"></path>
                <circle cx="12" cy="4" r="1.5" fill="#D4AF37"></circle>
                <circle cx="2" cy="4" r="1.5" fill="#D4AF37"></circle>
                <circle cx="22" cy="4" r="1.5" fill="#D4AF37"></circle>
              </svg>
            </span>
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <h2 class="admin-title">Utsav Bazaar • 360° Merchant Command Center</h2>
                <span class="super-powers-badge">⚡ ALL SUPERPOWERS UNLOCKED</span>
              </div>
              <span class="admin-subtitle">Live Orders Pipeline, Customer Directory, Real-Time Status Dispatch & Catalog CMS</span>
            </div>
          </div>
          <div class="admin-header-actions">
            <span class="live-status-pill">● Store Live</span>
            <button class="theme-toggle-btn admin-theme-toggle" id="btn-admin-theme-toggle" title="Switch Light/Dark Mode">
              <span id="admin-theme-icon">☀️ Light Mode</span>
            </button>
            <button class="admin-btn-secondary btn-storefront-return" id="btn-admin-return-store" title="Return to Storefront">
              <span>Return to Storefront</span>
            </button>
            <button class="admin-logout-btn" id="admin-logout-btn" title="Lock & Logout">
              <span>Lock Console</span>
            </button>
            <button class="admin-close-btn" id="admin-close-btn" title="Close Admin Console">✕</button>
          </div>
        </div>

        <!-- Live Orders Notification Banner -->
        <div class="admin-toast-banner" id="admin-orders-toast" style="display: none;"></div>

        <!-- Admin Navigation Tabs with Luxury PNG Icons -->
        <div class="admin-tabs-nav">
          <button class="admin-tab-btn ${this.activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
            <img src="/assets/icons/icon-overview.png" class="tab-png-icon" alt="" />
            <span>Overview & KPIs</span>
          </button>
          <button class="admin-tab-btn ${this.activeTab === 'orders' ? 'active' : ''}" data-tab="orders">
            <img src="/assets/icons/icon-orders.png" class="tab-png-icon" alt="" />
            <span>Orders & Dispatch</span>
          </button>
          <button class="admin-tab-btn ${this.activeTab === 'crm' ? 'active' : ''}" data-tab="crm">
            <img src="/assets/icons/icon-customers.png" class="tab-png-icon" alt="" />
            <span>Customer CRM</span>
          </button>
          <button class="admin-tab-btn ${this.activeTab === 'products' ? 'active' : ''}" data-tab="products">
            <img src="/assets/icons/icon-products.png" class="tab-png-icon" alt="" />
            <span>Catalog & Inventory</span>
          </button>
          <button class="admin-tab-btn ${this.activeTab === 'discounts' ? 'active' : ''}" data-tab="discounts">
            <img src="/assets/icons/icon-discounts.png" class="tab-png-icon" alt="" />
            <span>Festive Discounts</span>
          </button>
          <button class="admin-tab-btn ${this.activeTab === 'gsheet' ? 'active' : ''}" data-tab="gsheet">
            <img src="/assets/icons/icon-gsheet.png" class="tab-png-icon" alt="" />
            <span>Google Sheets & Backend</span>
          </button>
          <button class="admin-tab-btn ${this.activeTab === 'reviews' ? 'active' : ''}" data-tab="reviews">
            <img src="/assets/icons/icon-reviews.png" class="tab-png-icon" alt="" />
            <span>Customer Reviews</span>
          </button>
          <button class="admin-tab-btn ${this.activeTab === 'payments' ? 'active' : ''}" data-tab="payments">
            <span class="tab-png-icon" style="display:inline-flex; align-items:center; justify-content:center; font-size:16px;">⚡</span>
            <span>YouPI Gateway & Staking</span>
          </button>
        </div>

        <!-- Admin Content Body -->
        <div class="admin-content-body">
          <!-- TAB 1: 360 OVERVIEW & KPIS -->
          <div class="admin-tab-pane" id="tab-pane-overview" style="${this.activeTab === 'overview' ? 'display:block;' : 'display:none;'}">
            <!-- Top 4 KPI Metrics -->
            <div class="admin-kpi-grid" id="admin-kpi-container">
              <!-- Rendered dynamically -->
            </div>

            <!-- Quick Action Shortcuts -->
            <div class="admin-quick-actions-bar">
              <span class="qa-label">⚡ Merchant Quick Actions:</span>
              <div class="qa-btn-group">
                <button class="admin-btn-secondary" id="qa-export-orders">
                  <span>📥 Export Orders (Excel CSV)</span>
                </button>
                <button class="admin-btn-primary" id="qa-add-offering">
                  <span>➕ Add New Festive Offering</span>
                </button>
                <button class="admin-btn-secondary" id="qa-open-discounts">
                  <span>🏷️ Configure Festive Bar</span>
                </button>
              </div>
            </div>

            <!-- Recent Orders Activity Pipeline -->
            <div class="admin-card" style="margin-top: 20px;">
              <div class="card-head" style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="c-icon">🕒</span>
                  <h3 style="margin:0;">Recent Festive Orders Pipeline</h3>
                </div>
                <button class="admin-btn-secondary btn-sm" id="btn-view-all-orders">View All Orders →</button>
              </div>
              <div class="admin-table-wrapper" style="margin-top: 14px;">
                <table class="admin-data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Customer Details</th>
                      <th>Items Summary</th>
                      <th>Total Amount</th>
                      <th>Live Status</th>
                    </tr>
                  </thead>
                  <tbody id="overview-recent-orders-tbody">
                    <!-- Populated dynamically -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- TAB 2: LIVE ORDERS & FULFILLMENT -->
          <div class="admin-tab-pane" id="tab-pane-orders" style="${this.activeTab === 'orders' ? 'display:block;' : 'display:none;'}">
            <div class="pane-action-bar">
              <!-- 5-Stage Order Lifecycle Filter Chips with Unshipped Default -->
              <div class="orders-filter-group" id="orders-filter-buttons">
                <button class="filter-chip active" data-filter="unshipped" title="New orders placed and packed awaiting courier dispatch">⚡ Action Needed (Unshipped)</button>
                <button class="filter-chip" data-filter="New Order" title="Stage 1: Placed by Client">1. Placed</button>
                <button class="filter-chip" data-filter="Packed" title="Stage 2: Processed & Packed">2. Packed</button>
                <button class="filter-chip" data-filter="Shipped" title="Stage 3: Shipped / In-Transit">3. Shipped</button>
                <button class="filter-chip" data-filter="Out for Delivery" title="Stage 4: Out for Delivery">4. Out for Delivery</button>
                <button class="filter-chip" data-filter="Delivered" title="Stage 5: Delivered">5. Delivered</button>
                <button class="filter-chip" data-filter="all" title="View all order history">All Orders</button>
                <button class="filter-chip" data-filter="Cancelled" style="color: #EF4444;" title="Cancelled or Returned">Cancelled / RTO</button>
              </div>

              <!-- Live Search & CSV Export -->
              <div class="pane-btn-group">
                <input type="text" id="admin-orders-search" placeholder="Search by ID, Customer Name, Email, City..." class="admin-input-sm" style="width: 260px;" />
                <button class="admin-btn-secondary" id="btn-export-orders-csv">
                  <img src="/assets/icons/icon-billing.png" class="btn-inline-icon" alt="" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <!-- Active Queue Status Banner -->
            <div class="orders-queue-banner" id="orders-queue-banner">
              <!-- Populated dynamically -->
            </div>

            <!-- Orders & Fulfillment Master Table -->
            <div class="admin-table-wrapper">
              <table class="admin-data-table">
                <thead>
                  <tr>
                    <th style="width: 140px;">Order ID & Date</th>
                    <th>Customer & Direct WhatsApp</th>
                    <th>Ordered Offerings</th>
                    <th>Total & COD Status</th>
                    <th style="width: 170px;">Live Status (Auto-Stock)</th>
                    <th style="width: 130px;">Tracking Code</th>
                    <th style="text-align: right; width: 150px;">Billing & Actions</th>
                  </tr>
                </thead>
                <tbody id="admin-orders-table-body">
                  <!-- Populated dynamically -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB 3: CUSTOMER CRM & RETARGETING DIRECTORY -->
          <div class="admin-tab-pane" id="tab-pane-crm" style="${this.activeTab === 'crm' ? 'display:block;' : 'display:none;'}">
            <div class="pane-action-bar">
              <div class="pane-search-box">
                <input type="text" id="admin-crm-search" placeholder="Search customer directory by phone, name, city..." class="admin-input-sm" style="width: 320px;" />
              </div>
              <div class="pane-btn-group">
                <span class="live-pulse-badge" id="crm-total-patrons-badge">● Customer Directory</span>
              </div>
            </div>

            <div class="admin-table-wrapper">
              <table class="admin-data-table">
                <thead>
                  <tr>
                    <th>Customer Name & VIP Status</th>
                    <th>Phone & Direct WhatsApp</th>
                    <th>Email Address</th>
                    <th>City & Pincode</th>
                    <th style="text-align: center;">Lifetime Orders</th>
                    <th>Lifetime Value (LTV)</th>
                    <th style="text-align: right;">1-Click Retargeting</th>
                  </tr>
                </thead>
                <tbody id="admin-crm-table-body">
                  <!-- Populated dynamically -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB 4: PRODUCTS & INVENTORY -->
          <div class="admin-tab-pane" id="tab-pane-products" style="${this.activeTab === 'products' ? 'display:block;' : 'display:none;'}">
            <div class="pane-action-bar">
              <div class="pane-search-box">
                <input type="text" id="admin-product-search" placeholder="Search by name, category, origin, festival..." class="admin-input-sm" />
              </div>
              <div class="pane-btn-group">
                <button class="admin-btn-secondary" id="btn-clear-all-catalog" style="border-color: rgba(239, 68, 68, 0.4); color: #EF4444;" title="Purge all items from catalog">🗑️ Clear Entire Catalog</button>
                <button class="admin-btn-secondary" id="btn-reset-default-catalog" title="Load sample festive items for testing">↺ Load Sample Offerings</button>
                <button class="admin-btn-primary" id="btn-open-add-product">
                  <span>➕ Add New Festive Offering</span>
                </button>
              </div>
            </div>

            <!-- Festival Filter Chips -->
            <div class="orders-filter-group" id="catalog-festival-filter-group" style="margin-bottom: 16px;">
              <button class="filter-chip active" data-fest-filter="all">All Festivals & Occasions</button>
              <button class="filter-chip" data-fest-filter="diwali">🪔 Diwali</button>
              <button class="filter-chip" data-fest-filter="dhanteras">🪙 Dhanteras</button>
              <button class="filter-chip" data-fest-filter="karwa-chauth">🌕 Karwa Chauth</button>
              <button class="filter-chip" data-fest-filter="bhai-dooj">🌸 Bhai Dooj</button>
              <button class="filter-chip" data-fest-filter="chhath-puja">☀️ Chhath Puja</button>
              <button class="filter-chip" data-fest-filter="navratri">🌺 Navratri & Durga Puja</button>
              <button class="filter-chip" data-fest-filter="wedding">👑 Vivah & Weddings</button>
            </div>

            <!-- Product Inventory Table -->
            <div class="admin-table-wrapper">
              <table class="admin-data-table">
                <thead>
                  <tr>
                    <th style="width: 70px;">Visual</th>
                    <th>Product Title & Origin</th>
                    <th style="width: 150px;">Category & Festival</th>
                    <th>Marked Price</th>
                    <th>Sale Price</th>
                    <th>Discount</th>
                    <th>Stock</th>
                    <th style="text-align: right; width: 180px;">Actions</th>
                  </tr>
                </thead>
                <tbody id="admin-products-table-body">
                  <!-- Populated dynamically -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB 4: DISCOUNTS & FESTIVE BANNER BAR -->
          <div class="admin-tab-pane" id="tab-pane-discounts" style="${this.activeTab === 'discounts' ? 'display:block;' : 'display:none;'}">
            <div class="discount-manager-grid">
              <div class="admin-card">
                <div class="card-head">
                  <span class="c-icon">📢</span>
                  <h3>Top Festive Announcement & Discount Bar</h3>
                </div>
                <p class="c-desc">This glowing banner appears at the very top of your site to display live coupon codes and festive announcements.</p>
                
                <div class="form-group" style="margin-top: 16px;">
                  <label class="checkbox-label">
                    <input type="checkbox" id="bar-enabled-toggle" />
                    <span>Enable Top Festive Announcement Bar</span>
                  </label>
                </div>

                <div class="form-group">
                  <label>Announcement Banner Message</label>
                  <input type="text" id="bar-text-input" class="admin-input" placeholder="e.g. 🪔 DIWALI MAHOTSAV SALE: FLAT 15% OFF ALL OFFERINGS • USE CODE: DIWALI2026" />
                </div>

                <div class="form-row-2">
                  <div class="form-group">
                    <label>Active Coupon Code</label>
                    <input type="text" id="bar-coupon-input" class="admin-input" placeholder="e.g. DIWALI2026" />
                  </div>
                  <div class="form-group">
                    <label>Cart Discount Value (%)</label>
                    <input type="number" id="bar-percent-input" class="admin-input" min="1" max="90" placeholder="15" />
                  </div>
                </div>

                <button class="admin-btn-primary" id="btn-save-discount-bar" style="margin-top: 10px;">
                  <span>✓ Save Announcement Bar Settings</span>
                </button>
              </div>

              <div class="admin-card">
                <div class="card-head">
                  <span class="c-icon">⚡</span>
                  <h3>Bulk Category Discount Applicator</h3>
                </div>
                <p class="c-desc">Instantly calculate and mark sale prices and discount badges across an entire category of offerings.</p>

                <div class="form-group" style="margin-top: 16px;">
                  <label>Target Offering Category</label>
                  <select id="bulk-category-select" class="admin-select">
                    <option value="all">Entire Storefront (All Offerings)</option>
                    <option value="decor">Urlis & Home Decor</option>
                    <option value="apparel">Royal Silk & Attire (Cloths)</option>
                    <option value="diyas">Royal Brass Diyas</option>
                    <option value="torans">Torans & Wall Hangings</option>
                    <option value="lanterns">Jali Lanterns</option>
                    <option value="hampers">Festive Hampers</option>
                    <option value="heirlooms">Kundan Heirlooms</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Discount Percentage to Apply (%)</label>
                  <input type="number" id="bulk-discount-percent" class="admin-input" min="0" max="90" value="20" placeholder="e.g. 20" />
                </div>

                <div class="bulk-preview-hint">
                  Example: A ₹3,000 brass diya will be marked at original price ₹3,750 with a sale price of ₹3,000 and a <strong>-20% OFF</strong> badge.
                </div>

                <button class="admin-btn-primary" id="btn-apply-bulk-discount" style="margin-top: 16px; background: var(--crimson-gradient); color:#FFF;">
                  <span>Apply Category Discount</span>
                </button>
              </div>
            </div>
          </div>

          <!-- TAB 6: GOOGLE SHEETS & APPS SCRIPT 2-WAY BACKEND -->
          <div class="admin-tab-pane" id="tab-pane-gsheet" style="${this.activeTab === 'gsheet' ? 'display:block;' : 'display:none;'}">
            <div class="gsheet-sync-grid">
              <div class="admin-card">
                <div class="card-head">
                  <img src="/assets/icons/icon-gsheet.png" class="card-head-png-icon" alt="" />
                  <h3>2-Way Live Google Apps Script Server Sync</h3>
                </div>
                <p class="c-desc">
                  Connect your Google Apps Script Webhook API. New customer orders, status changes, inventory deductions, and Gmail notifications sync automatically both ways for ₹0/month.
                </p>

                <div class="form-group" style="margin-top: 16px;">
                  <label>Google Apps Script Web App Webhook URL (2-Way Full-Stack API)</label>
                  <input type="url" id="apps-script-url-input" class="admin-input" placeholder="https://script.google.com/macros/s/.../exec" />
                  <span class="admin-hint-text">Paste the Web App URL from Apps Script Deploy to enable live 2-way updates.</span>
                </div>

                <div class="gsheet-actions-row" style="margin-top: 8px;">
                  <button class="admin-btn-primary" id="btn-save-apps-script">
                    <span>Save 2-Way API Webhook</span>
                  </button>
                  <button class="admin-btn-secondary" id="btn-test-apps-script">
                    <span>Test Live Connection</span>
                  </button>
                </div>

                <div class="divider-line" style="margin: 20px 0 16px;"></div>

                <div class="card-head">
                  <span class="c-icon"></span>
                  <h3>Read-Only Google Sheet Published CSV</h3>
                </div>
                <div class="form-group">
                  <label>Google Sheet URL (Supports standard sheet link or published CSV link)</label>
                  <input type="url" id="gsheet-url-input" class="admin-input" placeholder="https://docs.google.com/spreadsheets/d/.../edit or /pub?output=csv" />
                  <small style="color: #94A3B8; font-size: 11px; margin-top: 4px; display: block;">💡 Note: Ensure your Google Sheet is shared with "Anyone with the link" or published to web.</small>
                </div>

                <div class="gsheet-actions-row">
                  <button class="admin-btn-secondary" id="btn-sync-gsheet">
                    <span>Fetch & Sync from Google Sheet</span>
                  </button>
                </div>

                <div class="sync-status-box" id="gsheet-status-box" style="display: none;">
                  <span class="status-msg"></span>
                </div>

                <div class="divider-line" style="margin: 24px 0 16px;"></div>

                <div class="card-head">
                  <span class="c-icon">📥</span>
                  <h3>Offline Excel / CSV Import & Export</h3>
                </div>
                <div class="export-import-btn-group">
                  <button class="admin-btn-secondary" id="btn-export-csv">
                    <span>📥 Download Catalog as Excel CSV</span>
                  </button>
                  <label class="admin-btn-secondary file-upload-label" style="margin: 0; cursor: pointer;">
                    <span>📤 Upload Updated CSV File</span>
                    <input type="file" id="csv-file-input" accept=".csv" style="display: none;" />
                  </label>
                </div>
              </div>

              <div class="admin-card instructions-card">
                <div class="card-head">
                  <span class="c-icon">📖</span>
                  <h3>How to Connect Your Google Sheet in 3 Steps</h3>
                </div>
                
                <ol class="step-guide-list">
                  <li>
                    <strong>1. Download Template:</strong> Click <em>"Download Catalog as Excel CSV"</em> to get the exact column format, then import it into Google Sheets.
                  </li>
                  <li>
                    <strong>2. Publish to Web:</strong> In your Google Sheet, go to <code>File</code> → <code>Share</code> → <code>Publish to web</code>.
                  </li>
                  <li>
                    <strong>3. Select CSV Format:</strong> In the publish dialog, change <em>"Web page"</em> to <strong>Comma-separated values (.csv)</strong> and click <strong>Publish</strong>.
                  </li>
                  <li>
                    <strong>4. Paste Link:</strong> Copy the published link, paste it into the field on the left, and click <strong>"Fetch & Sync Live"</strong>.
                  </li>
                </ol>

                <div class="columns-reference">
                  <strong>Recognized Columns:</strong>
                  <code>ID, Name, Category, PriceINR, OriginalPriceINR, DiscountPercent, InStock, ImageURL, Origin, Badge, Tagline, Description</code>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 6: CUSTOMER REVIEWS -->
          <div class="admin-tab-pane" id="tab-pane-reviews" style="${this.activeTab === 'reviews' ? 'display:block;' : 'display:none;'}">
            <div class="reviews-admin-layout">
              <!-- Left: Add Real Customer Review / Testimonial -->
              <div class="admin-card">
                <div class="card-head">
                  <span class="c-icon">✍️</span>
                  <h3>Add Real Customer Review / Testimonial</h3>
                </div>
                <p class="c-desc">Upload real customer unboxing photos, authentic avatars, verified purchase badges, and star ratings linked directly to any product post.</p>

                <!-- 1. Select Product Offering -->
                <div class="form-group" style="margin-top: 16px;">
                  <label>Select Product Offering to Link Review *</label>
                  <select id="review-product-select" class="admin-select"></select>
                </div>

                <!-- 2. Customer Name & Location/City -->
                <div class="form-row-2">
                  <div class="form-group">
                    <label>Customer Full Name *</label>
                    <input type="text" id="rev-customer-name" class="admin-input" placeholder="e.g. Radhika Deshmukh" />
                  </div>
                  <div class="form-group">
                    <label>City / Location</label>
                    <input type="text" id="rev-customer-city" class="admin-input" placeholder="e.g. Mumbai, Maharashtra" />
                  </div>
                </div>

                <!-- 3. Customer Profile Picture / Avatar -->
                <div class="form-group review-avatar-upload-section">
                  <label>Customer Profile Picture (Avatar)</label>
                  <div class="rev-avatar-row">
                    <div class="rev-avatar-preview-circle" id="rev-avatar-preview-box">
                      <span class="avatar-placeholder-icon" id="rev-avatar-placeholder">👤</span>
                      <img id="rev-avatar-preview-img" src="" alt="Avatar preview" style="display:none;" />
                    </div>
                    <div class="rev-avatar-controls">
                      <div class="rev-file-btn-wrap">
                        <label for="rev-avatar-file-input" class="admin-btn-secondary btn-sm" style="cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
                          <span>📁 Upload Picture</span>
                        </label>
                        <input type="file" id="rev-avatar-file-input" accept="image/*" style="display:none;" />
                        <button type="button" class="tbl-action-btn danger btn-sm" id="btn-remove-rev-avatar" style="display:none; height:28px;">✕ Remove</button>
                      </div>
                      <input type="url" id="rev-avatar-url-input" class="admin-input" placeholder="Or paste image URL (https://...)" style="margin-top:6px; font-size:11px;" />
                      
                      <!-- Quick Authentic Avatar Presets -->
                      <div class="quick-avatar-presets">
                        <span class="preset-label">Quick Patrons:</span>
                        <div class="preset-avatars-row" id="preset-avatars-row">
                          <button type="button" class="preset-avatar-btn" data-avatar="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" data-name="Sunita Deshmukh" data-city="Mumbai, Maharashtra" title="Sunita (Mumbai)">
                            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" alt="Sunita" />
                          </button>
                          <button type="button" class="preset-avatar-btn" data-avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" data-name="Rajesh Kulkarni" data-city="Pune, Maharashtra" title="Rajesh (Pune)">
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" alt="Rajesh" />
                          </button>
                          <button type="button" class="preset-avatar-btn" data-avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" data-name="Pooja Malhotra" data-city="Jaipur, Rajasthan" title="Pooja (Jaipur)">
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" alt="Pooja" />
                          </button>
                          <button type="button" class="preset-avatar-btn" data-avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" data-name="Anil Singhania" data-city="New Delhi" title="Anil (Delhi)">
                            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" alt="Anil" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 4. Real Customer Product Unboxing Photo Upload -->
                <div class="form-group review-photo-upload-section">
                  <label>Customer Product Photo (Real Unboxing / In-Home Decor Photo)</label>
                  <div class="rev-product-photo-wrap">
                    <div class="rev-photo-dropzone" id="rev-photo-dropzone">
                      <input type="file" id="rev-photo-file-input" accept="image/*" style="display:none;" />
                      <div class="photo-dropzone-inner">
                        <span class="camera-icon">📸</span>
                        <span><strong>Click or drop photo here</strong> to attach real customer photo</span>
                        <small>Shows up directly on the customer's review card</small>
                      </div>
                    </div>
                    <div class="rev-photo-preview-bar" id="rev-photo-preview-bar" style="display:none;">
                      <img id="rev-photo-preview-img" src="" alt="Customer unboxing photo" />
                      <div class="photo-preview-meta">
                        <span id="rev-photo-preview-name">unboxing.jpg</span>
                        <button type="button" class="tbl-action-btn danger btn-sm" id="btn-remove-rev-photo" style="height:26px;">✕ Remove Photo</button>
                      </div>
                    </div>
                    <input type="url" id="rev-photo-url-input" class="admin-input" placeholder="Or paste product image URL (https://...)" style="margin-top:8px; font-size:11px;" />
                  </div>
                </div>

                <!-- 5. Rating & Review Headline -->
                <div class="form-row-2">
                  <div class="form-group">
                    <label>Star Rating (1 to 5) *</label>
                    <select id="rev-rating-val" class="admin-select">
                      <option value="5">★★★★★ (5 Stars - Auspicious)</option>
                      <option value="4">★★★★☆ (4 Stars - Very Good)</option>
                      <option value="3">★★★☆☆ (3 Stars - Average)</option>
                      <option value="2">★★☆☆☆ (2 Stars - Fair)</option>
                      <option value="1">★☆☆☆☆ (1 Star - Poor)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Review Headline / Title</label>
                    <input type="text" id="rev-title-input" class="admin-input" placeholder="e.g. Magnificent Moradabad brass finish!" />
                  </div>
                </div>

                <!-- 6. Review Commentary -->
                <div class="form-group">
                  <label>Review Commentary / Blessing *</label>
                  <textarea id="rev-comment-text" class="admin-textarea" rows="3" placeholder="Share how this handcrafted brass diya, urli, toran or silk attire blessed their home..."></textarea>
                </div>

                <!-- 7. Verified & Custom Date -->
                <div class="form-row-2" style="align-items:center;">
                  <div class="form-group">
                    <label>Review Date</label>
                    <input type="text" id="rev-date-input" class="admin-input" placeholder="e.g. 16 Oct 2026" />
                  </div>
                  <div class="form-group" style="padding-top:22px;">
                    <label class="checkbox-label">
                      <input type="checkbox" id="rev-verified-check" checked />
                      <span>Mark as <strong>✓ Verified Purchase</strong></span>
                    </label>
                  </div>
                </div>

                <button class="admin-btn-primary" id="btn-submit-review" style="width:100%; margin-top:10px; justify-content:center;">
                  <span>➕ Publish Real Review & Link to Product</span>
                </button>
              </div>

              <!-- Right: Existing Reviews & Deletion Command -->
              <div class="admin-card">
                <div class="card-head" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span class="c-icon">🌟</span>
                    <h3 style="margin:0;">Existing Customer Reviews</h3>
                  </div>
                  <div class="orders-filter-group" id="reviews-filter-group">
                    <button type="button" class="filter-chip active" id="btn-rev-filter-selected">Current Offering</button>
                    <button type="button" class="filter-chip" id="btn-rev-filter-all">All Offerings</button>
                  </div>
                </div>

                <div class="rev-product-summary-bar" id="rev-product-summary-bar" style="margin-top:14px;">
                  <!-- Shows selected product miniature, rating score, reviews count -->
                </div>

                <div class="admin-reviews-list" id="admin-reviews-container">
                  <!-- Populated dynamically with rich review cards and delete buttons -->
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 8: YOUPI GATEWAY & STAKING -->
          <div class="admin-tab-pane" id="tab-pane-payments" style="display:none;">
            <div class="card-head" style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
              <div>
                <div style="display:flex; align-items:center; gap:10px;">
                  <span class="c-icon" style="background:rgba(255, 183, 3, 0.15); color:#FFB703; font-size:1.4rem; padding:8px 12px; border-radius:10px; border:1px solid rgba(255,183,3,0.3);">⚡</span>
                  <div>
                    <h3 style="margin:0; font-size:1.35rem; font-family:'Cinzel', serif; letter-spacing:0.5px;">YouPI-PG Sovereign UPI Gateway & Payment Staking</h3>
                    <p style="margin:4px 0 0; font-size:0.85rem; color:var(--text-secondary);">Direct Peer-to-Merchant NPCI VPA Settlement • 0% Gatekeeper Cut • Real-Time Staking FIFO Lock & 12-Digit UTR Master Ledger</p>
                  </div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                <span class="mode-indicator-pill" id="youpi-mode-pill">🔒 Safe Sandbox Active</span>
                <button type="button" class="admin-btn-secondary btn-sm" id="btn-refresh-payments" title="Refresh live staking session and stats">
                  <span>🔄 Refresh Staking</span>
                </button>
                <button type="button" class="admin-btn-secondary btn-sm" id="btn-export-payments-csv" title="Download Master Payment History">
                  <span>📥 Export Ledger CSV</span>
                </button>
              </div>
            </div>

            <!-- Top KPIs: UPI Volume, Gatekeeper Savings, Active Staking, Verification Rate -->
            <div class="admin-kpi-grid" id="youpi-kpis-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom:22px;">
              <!-- Populated by renderPaymentsKPIs() -->
            </div>

            <!-- Middle Split: Live Staking Slot (Left) & Sovereign Gateway Settings (Right) -->
            <div class="youpi-staking-dashboard-layout" style="display:grid; grid-template-columns: 1.15fr 0.85fr; gap:20px; margin-bottom:24px;">
              
              <!-- Left: Live Staking Pipeline & Single-Slot FIFO Monitor -->
              <div class="admin-card youpi-staking-card">
                <div class="card-head" style="display:flex; justify-content:space-between; align-items:center;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span class="c-icon">⏱️</span>
                    <div>
                      <h4 style="margin:0; font-size:1.05rem;">Live Session Staking & Verification Pipeline</h4>
                      <span style="font-size:0.75rem; color:var(--text-secondary);">Single-Slot FIFO Queue guarantees exact transaction-to-order mapping</span>
                    </div>
                  </div>
                  <span class="staking-pulse-badge" id="staking-pulse-badge">
                    <span class="pulse-dot"></span> <span id="staking-pulse-label">Awaiting Session</span>
                  </span>
                </div>

                <div id="youpi-active-staking-container" style="margin-top:16px;">
                  <!-- Rendered dynamically by renderPaymentsStakingBox() -->
                </div>

                <div class="staking-rules-note" style="margin-top:16px; padding:12px; background:rgba(212,175,55,0.06); border:1px dashed rgba(212,175,55,0.25); border-radius:8px; font-size:0.8rem; line-height:1.45; color:var(--text-secondary);">
                  <strong style="color:var(--accent-gold);">🛡️ Sovereign Staking Guarantee:</strong> Every customer initiating UPI gets exclusive possession of the payment window for <strong>5:00 minutes</strong> with a <strong>30:00 minute</strong> verification window. This prevents collisions without needing third-party payment aggregator keys.
                </div>
              </div>

              <!-- Right: Gateway Node & Merchant UPI Configuration -->
              <div class="admin-card youpi-config-card">
                <div class="card-head" style="display:flex; justify-content:space-between; align-items:center;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span class="c-icon">⚙️</span>
                    <div>
                      <h4 style="margin:0; font-size:1.05rem;">Merchant Sovereign Configuration</h4>
                      <span style="font-size:0.75rem; color:var(--text-secondary);">Configure your personal/current UPI VPA handle</span>
                    </div>
                  </div>
                  <button type="button" class="admin-btn-secondary btn-xs" id="btn-test-youpi-ping" style="font-size:0.75rem; padding:4px 10px;">
                    ⚡ Ping Node
                  </button>
                </div>

                <form id="youpi-config-form" style="margin-top:16px; display:flex; flex-direction:column; gap:12px;">
                  <div class="form-group" style="margin:0;">
                    <label style="font-size:0.8rem; font-weight:600; display:flex; justify-content:space-between;">
                      <span>Environment Mode</span>
                      <span style="font-size:0.72rem; color:var(--accent-gold);">No Approval Required</span>
                    </label>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:4px;">
                      <label class="radio-card" style="padding:10px 12px; border:1px solid var(--border-gold); border-radius:8px; display:flex; align-items:flex-start; gap:8px; cursor:pointer; font-size:0.8rem; background:rgba(255,255,255,0.02);">
                        <input type="radio" name="youpi-mode-radio" value="sandbox" checked style="margin-top:2px;" />
                        <div>
                          <strong style="color:var(--color-gold-light); display:block;">Direct Bank UPI (Instant)</strong>
                          <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:2px;">★ Recommended: Zero server needed. Money deposits directly into your bank VPA 24/7.</div>
                        </div>
                      </label>
                      <label class="radio-card" style="padding:10px 12px; border:1px solid var(--border-gold); border-radius:8px; display:flex; align-items:flex-start; gap:8px; cursor:pointer; font-size:0.8rem; background:rgba(255,255,255,0.02);">
                        <input type="radio" name="youpi-mode-radio" value="connected" style="margin-top:2px;" />
                        <div>
                          <strong style="color:var(--color-gold-light); display:block;">YouPI Daemon Node</strong>
                          <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:2px;">Advanced: Pairs with background bot & phone SMS for auto-approval.</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div class="form-group" style="margin:0;">
                    <label for="cfg-youpi-vpa" style="font-size:0.8rem; font-weight:600;">Merchant UPI VPA ID (Your Real Receiving Bank Handle)</label>
                    <input type="text" id="cfg-youpi-vpa" class="admin-input" placeholder="e.g. 9625351970@axisbank" style="margin-top:4px;" required />
                    <small style="font-size:0.72rem; color:var(--text-secondary);">Customer payments from GPay, PhonePe, Paytm, or BHIM land directly into this bank account with 0% fees.</small>
                  </div>

                  <div class="form-group" style="margin:0;">
                    <label for="cfg-youpi-name" style="font-size:0.8rem; font-weight:600;">Merchant Legal / Trade Name</label>
                    <input type="text" id="cfg-youpi-name" class="admin-input" placeholder="e.g. Utsav Bazaar Crafts" style="margin-top:4px;" required />
                    <small style="font-size:0.72rem; color:var(--text-secondary);">Displayed on the customer's phone during UPI confirmation.</small>
                  </div>

                  <!-- Direct Mode Explanatory Banner -->
                  <div id="youpi-direct-mode-banner" style="display:block; padding:10px 14px; background:rgba(34, 197, 94, 0.08); border:1px solid rgba(34, 197, 94, 0.25); border-radius:8px; font-size:0.75rem; color:#4ADE80; line-height:1.45;">
                    💡 <strong>Zero Server Required:</strong> In Direct Bank UPI mode, your customers pay directly to your Axis Bank account via QR or 1-tap PhonePe/GPay buttons. <strong>No localhost:7000 or background server is needed!</strong>
                  </div>

                  <!-- Connected Mode Server Endpoint -->
                  <div class="form-group" id="cfg-youpi-endpoint-group" style="margin:0; display:none;">
                    <label for="cfg-youpi-endpoint" style="font-size:0.8rem; font-weight:600; display:flex; justify-content:space-between;">
                      <span>YouPI Daemon Server URL</span>
                      <span style="font-size:0.72rem; color:var(--accent-gold);">Port 7000</span>
                    </label>
                    <input type="text" id="cfg-youpi-endpoint" class="admin-input" placeholder="http://localhost:7000" value="http://localhost:7000" style="margin-top:4px;" />
                    <small style="font-size:0.72rem; color:var(--text-secondary);">Use <code>http://localhost:7000</code> while testing on your PC, or your Cloudflare Tunnel URL when your website is public.</small>
                  </div>

                  <button type="submit" class="admin-btn-primary" id="btn-save-youpi-settings" style="margin-top:8px; justify-content:center; width:100%;">
                    <span>💾 Save Merchant Sovereign Settings</span>
                  </button>
                </form>
              </div>
            </div>

            <!-- Bottom: Master Payment History Ledger -->
            <div class="admin-card" style="margin-top:20px;">
              <div class="card-head" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="c-icon">📜</span>
                  <div>
                    <h4 style="margin:0; font-size:1.1rem;">Master UPI Payment Ledger & Audit Trail</h4>
                    <span style="font-size:0.75rem; color:var(--text-secondary);">Direct bank settlement records with 12-digit UTR tracking</span>
                  </div>
                </div>

                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                  <div class="orders-filter-group" id="payments-filter-buttons">
                    <button type="button" class="filter-chip active" data-payment-filter="all">All</button>
                    <button type="button" class="filter-chip" data-payment-filter="completed">Settled</button>
                    <button type="button" class="filter-chip" data-payment-filter="staked">Staked / In Progress</button>
                    <button type="button" class="filter-chip" data-payment-filter="expired">Expired / Failed</button>
                  </div>

                  <div class="search-box" style="margin:0;">
                    <input type="text" id="youpi-ledger-search" class="admin-input" placeholder="Search Order ID, UTR, Customer, Phone..." style="width:230px; padding:6px 10px; font-size:0.82rem;" />
                  </div>
                </div>
              </div>

              <div class="table-responsive" style="margin-top:14px; overflow-x:auto;">
                <table class="admin-data-table" id="youpi-payments-table">
                  <thead>
                    <tr>
                      <th>Order ID & Timestamp</th>
                      <th>Customer & Phone</th>
                      <th>Settled Amount</th>
                      <th>0% Fee Savings</th>
                      <th>12-Digit UTR / Ref</th>
                      <th>Gateway Channel</th>
                      <th>Staking Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody id="youpi-payments-tbody">
                    <!-- Populated dynamically by renderPaymentsTable() -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 1. Login Events (if unauthenticated)
    const loginForm = this.container.querySelector('#admin-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.attemptLogin();
      });

      const btnCloseLogin = this.container.querySelector('#btn-close-login');
      if (btnCloseLogin) {
        btnCloseLogin.addEventListener('click', () => this.close());
      }

      const btnTogglePass = this.container.querySelector('#btn-toggle-pass-visibility');
      if (btnTogglePass) {
        btnTogglePass.addEventListener('click', () => {
          const passInput = this.container.querySelector('#admin-passcode-input');
          if (passInput) {
            const isPassword = passInput.type === 'password';
            passInput.type = isPassword ? 'text' : 'password';
            btnTogglePass.textContent = isPassword ? '🙈 Hide' : '👁️ Show';
          }
        });
      }
      return;
    }

    // 2. Authenticated Dashboard Events
    const logoutBtn = this.container.querySelector('#admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('utsav_admin_auth');
        this.isAuthenticated = false;
        this.render();
      });
    }

    const returnStoreBtn = this.container.querySelector('#btn-admin-return-store');
    if (returnStoreBtn) {
      returnStoreBtn.addEventListener('click', () => {
        this.close();
        if (this.onNavigateHome) this.onNavigateHome();
      });
    }

    const closeBtn = this.container.querySelector('#admin-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => {
      this.close();
      if (this.onNavigateHome) this.onNavigateHome();
    });

    // Theme Toggle in Admin Header (Light/Dark Switcher)
    const adminThemeToggle = this.container.querySelector('#btn-admin-theme-toggle');
    const adminThemeIcon = this.container.querySelector('#admin-theme-icon');
    const updateThemeButtonLabel = () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (adminThemeIcon) {
        adminThemeIcon.innerHTML = isLight ? '🌙 Dark Mode' : '☀️ Light Mode';
      }
    };
    updateThemeButtonLabel();

    if (adminThemeToggle) {
      adminThemeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('utsav_theme', newTheme);
        updateThemeButtonLabel();
      });
    }

    // Tabs switching
    const tabBtns = this.container.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Overview Quick Action Shortcuts
    const qaExport = this.container.querySelector('#qa-export-orders');
    if (qaExport) qaExport.addEventListener('click', () => this.exportOrdersCSV());

    const qaAdd = this.container.querySelector('#qa-add-offering');
    if (qaAdd) qaAdd.addEventListener('click', () => this.openProductEditor(null));

    const qaDiscounts = this.container.querySelector('#qa-open-discounts');
    if (qaDiscounts) qaDiscounts.addEventListener('click', () => this.switchTab('discounts'));

    const btnViewAllOrders = this.container.querySelector('#btn-view-all-orders');
    if (btnViewAllOrders) btnViewAllOrders.addEventListener('click', () => this.switchTab('orders'));

    // Orders Filtering & Search
    const filterChips = this.container.querySelectorAll('#orders-filter-buttons .filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        filterChips.forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.orderFilter = e.currentTarget.getAttribute('data-filter');
        this.renderOrdersTable();
      });
    });

    const ordersSearch = this.container.querySelector('#admin-orders-search');
    if (ordersSearch) {
      ordersSearch.addEventListener('input', (e) => {
        this.orderSearchQuery = e.target.value.toLowerCase().trim();
        this.renderOrdersTable();
      });
    }

    const exportOrdersBtn = this.container.querySelector('#btn-export-orders-csv');
    if (exportOrdersBtn) exportOrdersBtn.addEventListener('click', () => this.exportOrdersCSV());

    // Orders Table Status Change & COD Verification delegation
    const ordersTable = this.container.querySelector('#admin-orders-table-body');
    if (ordersTable) {
      ordersTable.addEventListener('change', (e) => {
        const select = e.target.closest('.admin-order-status-select');
        const codToggle = e.target.closest('.cod-verify-toggle');

        if (select) {
          const ordId = select.getAttribute('data-order-id');
          const newStatus = select.value;
          this.handleOrderStatusChange(ordId, newStatus, select);
        } else if (codToggle) {
          const ordId = codToggle.getAttribute('data-order-id');
          productStore.toggleCodVerification(ordId);
          this.renderOrdersTable();
        }
      });

      ordersTable.addEventListener('click', (e) => {
        const delBtn = e.target.closest('[data-delete-order-id]');
        const printBtn = e.target.closest('[data-print-order-id]');

        if (printBtn) {
          const ordId = printBtn.getAttribute('data-print-order-id');
          this.printOrderInvoice(ordId);
        } else if (delBtn) {
          const ordId = delBtn.getAttribute('data-delete-order-id');
          if (confirm(`Remove Order ${ordId} from merchant records?`)) {
            productStore.deleteOrder(ordId);
            this.renderOverviewTab();
            this.renderOrdersTable();
          }
        }
      });
    }

    // Customer CRM Real-Time Search
    const crmSearch = this.container.querySelector('#admin-crm-search');
    if (crmSearch) {
      crmSearch.addEventListener('input', (e) => {
        this.renderCRMTable(e.target.value.toLowerCase().trim());
      });
    }

    // Product Search
    const prodSearch = this.container.querySelector('#admin-product-search');
    if (prodSearch) {
      prodSearch.addEventListener('input', (e) => {
        this.catalogSearchQuery = e.target.value.toLowerCase().trim();
        this.renderProductsTable(this.catalogSearchQuery);
      });
    }

    // Product Festival Filter Group
    const festChips = this.container.querySelectorAll('#catalog-festival-filter-group .filter-chip');
    festChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        festChips.forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.catalogFestivalFilter = e.currentTarget.getAttribute('data-fest-filter');
        this.renderProductsTable(this.catalogSearchQuery);
      });
    });

    // Clear All Products from Catalog
    const clearCatalogBtn = this.container.querySelector('#btn-clear-all-catalog');
    if (clearCatalogBtn) {
      clearCatalogBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to completely empty the catalog? All offerings will be removed.")) {
          productStore.clearAllProducts();
          this.renderProductsTable();
          this.renderOverviewTab();
          alert("✓ Entire catalog cleared! Storefront is now clean and empty.");
        }
      });
    }

    // Load Sample Festive Catalog
    const resetCatalogBtn = this.container.querySelector('#btn-reset-default-catalog');
    if (resetCatalogBtn) {
      resetCatalogBtn.addEventListener('click', () => {
        if (confirm("Load sample festive offerings into the catalog for testing?")) {
          productStore.seedSampleFestiveCatalog();
          this.renderProductsTable();
          this.renderOverviewTab();
          alert("✓ Sample festive offerings loaded into catalog!");
        }
      });
    }

    // Add Product Modal open
    const openAddBtn = this.container.querySelector('#btn-open-add-product');
    if (openAddBtn) {
      openAddBtn.addEventListener('click', () => this.openProductEditor(null));
    }

    // Product Editor close & cancel
    const closeEditorBtn = this.container.querySelector('#btn-close-editor');
    if (closeEditorBtn) closeEditorBtn.addEventListener('click', () => this.closeProductEditor());

    const cancelEditBtn = this.container.querySelector('#btn-cancel-edit');
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => this.closeProductEditor());

    const saveOfferingBtn = this.container.querySelector('#btn-save-offering');
    if (saveOfferingBtn) saveOfferingBtn.addEventListener('click', () => this.saveProductFromEditor());

    // Multi-Media Upload Handling (Multiple Images, GIFs, Videos)
    const multiFileInput = this.container.querySelector('#edit-multi-file-input');
    if (multiFileInput) {
      multiFileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        files.forEach(file => {
          const isVideo = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov)$/i);
          const isGif = file.type === 'image/gif' || file.name.endsWith('.gif');
          const type = isVideo ? 'video' : (isGif ? 'gif' : 'image');

          const reader = new FileReader();
          reader.onload = (re) => {
            this.addMediaItem({
              type,
              url: re.target.result,
              name: file.name
            });
          };
          reader.readAsDataURL(file);
        });
        multiFileInput.value = ''; // Reset input so same file can be chosen again if needed
      });
    }

    // Add Direct Media URL (Image, GIF, Video)
    const addMediaUrlBtn = this.container.querySelector('#btn-add-media-url');
    const directUrlInput = this.container.querySelector('#edit-direct-media-url');
    if (addMediaUrlBtn && directUrlInput) {
      const handleAddUrl = () => {
        const url = directUrlInput.value.trim();
        if (!url) return;
        const isVideo = url.match(/\.(mp4|webm|mov)(\?.*)?$/i);
        const isGif = url.match(/\.gif(\?.*)?$/i);
        const type = isVideo ? 'video' : (isGif ? 'gif' : 'image');

        this.addMediaItem({
          type,
          url,
          name: url.split('/').pop().split('?')[0] || 'Web Asset'
        });
        directUrlInput.value = '';
      };

      addMediaUrlBtn.addEventListener('click', handleAddUrl);
      directUrlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddUrl();
        }
      });
    }

    // Live Storefront Card Real-Time Sync on Input Changes
    const liveFields = [
      '#edit-name', '#edit-origin', '#edit-tagline', 
      '#edit-price', '#edit-orig-price', '#edit-discount', '#edit-badge'
    ];
    liveFields.forEach(selector => {
      const el = this.container.querySelector(selector);
      if (el) {
        el.addEventListener('input', () => this.updateLiveCardPreview());
      }
    });

    const editCategory = this.container.querySelector('#edit-category');
    if (editCategory) {
      editCategory.addEventListener('change', () => this.updateLiveCardPreview());
    }

    // Rich Text Editor Toolbar Actions (Bold, Italic, Underline, Bullet List, Heading, Color)
    const rteToolbar = this.container.querySelector('#editor-rte-toolbar');
    const descTextarea = this.container.querySelector('#edit-description');
    if (rteToolbar && descTextarea) {
      rteToolbar.querySelectorAll('.rte-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const action = btn.getAttribute('data-rte');
          const start = descTextarea.selectionStart;
          const end = descTextarea.selectionEnd;
          const selectedText = descTextarea.value.substring(start, end) || 'text';
          let replacement = '';

          switch (action) {
            case 'bold':
              replacement = `<b>${selectedText}</b>`;
              break;
            case 'italic':
              replacement = `<i>${selectedText}</i>`;
              break;
            case 'underline':
              replacement = `<u>${selectedText}</u>`;
              break;
            case 'list':
              replacement = `\n• ${selectedText}`;
              break;
            case 'h3':
              replacement = `<h3>${selectedText}</h3>`;
              break;
            default:
              replacement = selectedText;
          }

          descTextarea.setRangeText(replacement, start, end, 'select');
          descTextarea.focus();
        });
      });

      const colorInput = this.container.querySelector('#rte-color-input');
      const colorIndicator = this.container.querySelector('#rte-color-indicator');
      if (colorInput) {
        colorInput.addEventListener('input', (e) => {
          const color = e.target.value;
          if (colorIndicator) colorIndicator.style.background = color;
          const start = descTextarea.selectionStart;
          const end = descTextarea.selectionEnd;
          const selectedText = descTextarea.value.substring(start, end) || 'colored text';
          const replacement = `<span style="color:${color};">${selectedText}</span>`;
          descTextarea.setRangeText(replacement, start, end, 'select');
          descTextarea.focus();
        });
      }
    }

    // Discount & Festive Bar Form
    const saveDiscountBarBtn = this.container.querySelector('#btn-save-discount-bar');
    if (saveDiscountBarBtn) {
      saveDiscountBarBtn.addEventListener('click', () => {
        const enabled = this.container.querySelector('#bar-enabled-toggle').checked;
        const text = this.container.querySelector('#bar-text-input').value.trim();
        const coupon = this.container.querySelector('#bar-coupon-input').value.trim();
        const percent = this.container.querySelector('#bar-percent-input').value;

        productStore.updateDiscountBar(enabled, text, coupon, percent);
        alert("✓ Festive Announcement & Discount Bar settings saved!");
      });
    }

    // Bulk Category Discount
    const applyBulkBtn = this.container.querySelector('#btn-apply-bulk-discount');
    if (applyBulkBtn) {
      applyBulkBtn.addEventListener('click', () => {
        const cat = this.container.querySelector('#bulk-category-select').value;
        const pct = this.container.querySelector('#bulk-discount-percent').value;
        if (confirm(`Apply ${pct}% discount across ${cat === 'all' ? 'all offerings' : cat}?`)) {
          productStore.applyCategoryDiscount(cat, pct);
          this.renderProductsTable();
          alert(`✓ Applied ${pct}% discount to ${cat}!`);
        }
      });
    }

    // Google Sheets Sync
    const syncBtn = this.container.querySelector('#btn-sync-gsheet');
    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        const url = this.container.querySelector('#gsheet-url-input').value.trim();
        const statusBox = this.container.querySelector('#gsheet-status-box');
        const statusMsg = statusBox.querySelector('.status-msg');

        if (!url) {
          alert("Please enter your Published Google Sheet CSV URL.");
          return;
        }

        statusBox.style.display = 'block';
        statusMsg.innerHTML = "⏳ Connecting to Google Sheet and parsing offerings...";

        try {
          const res = await productStore.syncFromGoogleSheet(url);
          if (res.success) {
            statusMsg.innerHTML = `✓ Successfully synchronized ${res.count} offerings from Google Sheet!`;
            statusMsg.style.color = '#10B981';
            this.renderProductsTable();
          } else {
            statusMsg.innerHTML = `❌ Error: ${res.error}`;
            statusMsg.style.color = '#EF4444';
          }
        } catch (err) {
          statusMsg.innerHTML = `❌ Failed to sync: ${err.message}`;
          statusMsg.style.color = '#EF4444';
        }
      });
    }

    // 2-Way Google Apps Script Webhook Save & Test
    const saveAppsScriptBtn = this.container.querySelector('#btn-save-apps-script');
    if (saveAppsScriptBtn) {
      saveAppsScriptBtn.addEventListener('click', () => {
        const url = this.container.querySelector('#apps-script-url-input').value.trim();
        productStore.setAppsScriptUrl(url);
        alert("✓ 2-Way Google Apps Script Webhook URL saved successfully!");
      });
    }

    const testAppsScriptBtn = this.container.querySelector('#btn-test-apps-script');
    if (testAppsScriptBtn) {
      testAppsScriptBtn.addEventListener('click', async () => {
        const url = this.container.querySelector('#apps-script-url-input').value.trim();
        if (!url) {
          alert("Please enter your Google Apps Script Web App URL first.");
          return;
        }
        testAppsScriptBtn.disabled = true;
        testAppsScriptBtn.textContent = 'Testing...';
        try {
          // Send a test ping payload
          const res = await fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'ping', store: 'Utsav Bazaar', timestamp: new Date().toISOString() })
          });
          alert("✓ Signal transmitted to Google Apps Script Web App! Check your Executions log in Google Apps Script console.");
        } catch (err) {
          alert(`Notice: ${err.message}. If using standard Google Apps Script Web App, no-cors ping has been dispatched.`);
        } finally {
          testAppsScriptBtn.disabled = false;
          testAppsScriptBtn.textContent = 'Test Live Connectivity';
        }
      });
    }

    // Catalog CSV Export
    const exportCsvBtn = this.container.querySelector('#btn-export-csv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        const csvContent = productStore.exportToCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `utsav_bazaar_catalog_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    }

    // Catalog CSV Upload
    const csvFileInput = this.container.querySelector('#csv-file-input');
    if (csvFileInput) {
      csvFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => {
            const csvText = re.target.result;
            const res = productStore.importFromCSV(csvText);
            if (res.success) {
              alert(`✓ Successfully imported ${res.count} offerings from CSV file!`);
              this.renderProductsTable();
            } else {
              alert(`❌ Failed to import CSV: ${res.error}`);
            }
          };
          reader.readAsText(file);
        }
      });
    }

    // Customer Reviews Tab Events
    const reviewSelect = this.container.querySelector('#review-product-select');
    if (reviewSelect) {
      reviewSelect.addEventListener('change', () => {
        this.renderReviewsView();
      });
    }

    // Filter Buttons (Current Offering vs All Offerings)
    const btnFilterSelected = this.container.querySelector('#btn-rev-filter-selected');
    const btnFilterAll = this.container.querySelector('#btn-rev-filter-all');
    if (btnFilterSelected && btnFilterAll) {
      btnFilterSelected.addEventListener('click', () => {
        this.reviewsViewFilter = 'selected';
        this.renderReviewsView();
      });
      btnFilterAll.addEventListener('click', () => {
        this.reviewsViewFilter = 'all';
        this.renderReviewsView();
      });
    }

    // Avatar File Upload
    const avatarFileInput = this.container.querySelector('#rev-avatar-file-input');
    if (avatarFileInput) {
      avatarFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          if (!file.type.startsWith('image/')) {
            alert('Please select an image file (PNG, JPG, WebP).');
            return;
          }
          const reader = new FileReader();
          reader.onload = (re) => {
            this.setReviewAvatar(re.target.result);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Avatar URL Input
    const avatarUrlInput = this.container.querySelector('#rev-avatar-url-input');
    if (avatarUrlInput) {
      avatarUrlInput.addEventListener('change', (e) => {
        const url = e.target.value.trim();
        if (url) this.setReviewAvatar(url);
      });
    }

    // Remove Avatar Button
    const btnRemoveAvatar = this.container.querySelector('#btn-remove-rev-avatar');
    if (btnRemoveAvatar) {
      btnRemoveAvatar.addEventListener('click', () => {
        this.clearReviewAvatar();
      });
    }

    // Preset Patron Avatar Buttons
    this.container.querySelectorAll('.preset-avatar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const avatarUrl = btn.getAttribute('data-avatar');
        const patronName = btn.getAttribute('data-name');
        const patronCity = btn.getAttribute('data-city');

        if (avatarUrl) this.setReviewAvatar(avatarUrl);

        const nameInput = this.container.querySelector('#rev-customer-name');
        const cityInput = this.container.querySelector('#rev-customer-city');
        if (nameInput && !nameInput.value.trim() && patronName) {
          nameInput.value = patronName;
        }
        if (cityInput && !cityInput.value.trim() && patronCity) {
          cityInput.value = patronCity;
        }
      });
    });

    // Customer Product Photo Dropzone & File Input
    const photoFileInput = this.container.querySelector('#rev-photo-file-input');
    const photoDropzone = this.container.querySelector('#rev-photo-dropzone');
    const photoUrlInput = this.container.querySelector('#rev-photo-url-input');
    const btnRemovePhoto = this.container.querySelector('#btn-remove-rev-photo');

    if (photoDropzone && photoFileInput) {
      photoDropzone.addEventListener('click', () => photoFileInput.click());

      photoDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        photoDropzone.style.borderColor = '#D4AF37';
        photoDropzone.style.background = 'rgba(212, 175, 55, 0.12)';
      });

      photoDropzone.addEventListener('dragleave', () => {
        photoDropzone.style.borderColor = '';
        photoDropzone.style.background = '';
      });

      photoDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        photoDropzone.style.borderColor = '';
        photoDropzone.style.background = '';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          const file = e.dataTransfer.files[0];
          const reader = new FileReader();
          reader.onload = (re) => {
            this.setReviewPhoto(re.target.result, file.name);
          };
          reader.readAsDataURL(file);
        }
      });

      photoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => {
            this.setReviewPhoto(re.target.result, file.name);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (photoUrlInput) {
      photoUrlInput.addEventListener('change', (e) => {
        const url = e.target.value.trim();
        if (url) this.setReviewPhoto(url, 'Product Photo URL');
      });
    }

    if (btnRemovePhoto) {
      btnRemovePhoto.addEventListener('click', () => {
        this.clearReviewPhoto();
      });
    }

    // Review Submission
    const submitReviewBtn = this.container.querySelector('#btn-submit-review');
    if (submitReviewBtn) {
      submitReviewBtn.addEventListener('click', () => {
        const select = this.container.querySelector('#review-product-select');
        const prodId = select ? select.value : null;
        if (!prodId) {
          alert('Please select a product offering first.');
          return;
        }

        const nameInput = this.container.querySelector('#rev-customer-name');
        const cityInput = this.container.querySelector('#rev-customer-city');
        const ratingSelect = this.container.querySelector('#rev-rating-val');
        const titleInput = this.container.querySelector('#rev-title-input');
        const commentText = this.container.querySelector('#rev-comment-text');
        const dateInput = this.container.querySelector('#rev-date-input');
        const verifiedCheck = this.container.querySelector('#rev-verified-check');

        const name = nameInput ? nameInput.value.trim() : '';
        const city = cityInput ? cityInput.value.trim() : '';
        const rating = ratingSelect ? ratingSelect.value : 5;
        const title = titleInput ? titleInput.value.trim() : '';
        const comment = commentText ? commentText.value.trim() : '';
        const date = dateInput ? dateInput.value.trim() : '';
        const verified = verifiedCheck ? verifiedCheck.checked : true;

        if (!comment) {
          alert('Please write a review commentary / blessing.');
          if (commentText) commentText.focus();
          return;
        }

        const newReview = productStore.addReview(prodId, {
          name: name || 'Auspicious Patron',
          city: city || 'Verified Buyer',
          avatarUrl: this.currentRevAvatarBase64 || '',
          photoUrl: this.currentRevPhotoBase64 || '',
          rating,
          title,
          comment,
          date,
          verified
        });

        // Reset form inputs & previews
        if (nameInput) nameInput.value = '';
        if (cityInput) cityInput.value = '';
        if (titleInput) titleInput.value = '';
        if (commentText) commentText.value = '';
        this.clearReviewAvatar();
        this.clearReviewPhoto();

        // Refresh views
        this.renderReviewsView();
        this.renderProductsTable();

        alert(`✓ Real review published and linked to product offering! (ID: ${newReview.id})`);
      });
    }

    // Delete Review Click Delegation on #admin-reviews-container
    const reviewsContainer = this.container.querySelector('#admin-reviews-container');
    if (reviewsContainer) {
      reviewsContainer.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.btn-delete-review');
        if (delBtn) {
          e.stopPropagation();
          const revId = delBtn.getAttribute('data-del-review-id');
          const prodId = delBtn.getAttribute('data-del-prod-id');

          if (!revId || !prodId) return;

          if (confirm('Are you sure you want to delete this customer review? The product average rating and review count will be updated automatically.')) {
            const success = productStore.deleteReview(prodId, revId);
            if (success) {
              this.renderReviewsView();
              this.renderProductsTable();
              alert('✓ Customer review deleted successfully!');
            } else {
              alert('Could not find the review to delete.');
            }
          }
        }
      });
    }

    // Table Actions Delegation for Products (Edit / Delete / Toggle Stock)
    const tableBody = this.container.querySelector('#admin-products-table-body');
    if (tableBody) {
      tableBody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('[data-edit-id]');
        const deleteBtn = e.target.closest('[data-delete-id]');
        const stockToggle = e.target.closest('[data-toggle-stock-id]');

        if (editBtn) {
          const id = editBtn.getAttribute('data-edit-id');
          const p = productStore.getProductById(id);
          this.openProductEditor(p);
        } else if (deleteBtn) {
          const id = deleteBtn.getAttribute('data-delete-id');
          if (confirm("Remove this festive offering from the storefront?")) {
            productStore.deleteProduct(id);
            this.renderProductsTable();
          }
        } else if (stockToggle) {
          const id = stockToggle.getAttribute('data-toggle-stock-id');
          const p = productStore.getProductById(id);
          if (p) {
            productStore.saveProduct({ ...p, inStock: !p.inStock });
            this.renderProductsTable();
          }
        }
      });
    }

    // Reactive store listeners
    window.addEventListener('products-updated', () => {
      this.renderProductsTable();
    });

    window.addEventListener('orders-updated', () => {
      this.renderOverviewTab();
      this.renderOrdersTable();
    });

    window.addEventListener('reviews-updated', () => {
      if (this.activeTab === 'reviews') {
        this.renderReviewsView();
      }
    });

    // Payments / YouPI Gateway Event Handlers
    const refreshPaymentsBtn = this.container.querySelector('#btn-refresh-payments');
    if (refreshPaymentsBtn) {
      refreshPaymentsBtn.addEventListener('click', () => {
        this.renderPaymentsTab();
        alert("✓ Staking queue & payments ledger refreshed!");
      });
    }

    const exportPaymentsBtn = this.container.querySelector('#btn-export-payments-csv');
    if (exportPaymentsBtn) {
      exportPaymentsBtn.addEventListener('click', () => {
        this.exportPaymentsCSV();
      });
    }

    const pingYoupiBtn = this.container.querySelector('#btn-test-youpi-ping');
    if (pingYoupiBtn) {
      pingYoupiBtn.addEventListener('click', () => {
        this.testYoupiConnection();
      });
    }

    const youpiConfigForm = this.container.querySelector('#youpi-config-form');
    if (youpiConfigForm) {
      youpiConfigForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const modeRadio = this.container.querySelector('input[name="youpi-mode-radio"]:checked');
        const vpaInput = this.container.querySelector('#cfg-youpi-vpa');
        const nameInput = this.container.querySelector('#cfg-youpi-name');
        const endpointInput = this.container.querySelector('#cfg-youpi-endpoint');

        const mode = modeRadio ? modeRadio.value : 'sandbox';
        const vpa = vpaInput ? vpaInput.value.trim() : 'utsavbazaar@okhdfcbank';
        const merchantName = nameInput ? nameInput.value.trim() : 'Utsav Bazaar Crafts';
        const endpoint = endpointInput ? endpointInput.value.trim() : 'http://localhost:7000';

        productStore.saveYoupiSettings({
          mode,
          merchantVpa: vpa,
          upiVpa: vpa,
          merchantName,
          endpointUrl: endpoint,
          gatewayUrl: endpoint
        });

        this.renderPaymentsTab();
        alert("✓ Merchant Sovereign Gateway settings saved! Storefront checkout now routes directly to your UPI ID: " + vpa);
      });

      const modeRadios = this.container.querySelectorAll('input[name="youpi-mode-radio"]');
      modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
          this.updateYoupiModeUI(e.target.value);
        });
      });
    }

    const paymentSearchInput = this.container.querySelector('#youpi-ledger-search');
    if (paymentSearchInput) {
      paymentSearchInput.addEventListener('input', (e) => {
        this.paymentSearchQuery = e.target.value.trim();
        this.renderPaymentsTable();
      });
    }

    const paymentFilterChips = this.container.querySelectorAll('#payments-filter-buttons .filter-chip');
    paymentFilterChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        paymentFilterChips.forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.paymentFilter = e.currentTarget.getAttribute('data-payment-filter') || 'all';
        this.renderPaymentsTable();
      });
    });

    const paymentTbody = this.container.querySelector('#youpi-payments-tbody');
    if (paymentTbody) {
      paymentTbody.addEventListener('click', (e) => {
        const verifyBtn = e.target.closest('[data-verify-payment-id]');
        const copyUtrBtn = e.target.closest('[data-copy-utr]');

        if (verifyBtn) {
          const pid = verifyBtn.getAttribute('data-verify-payment-id');
          this.handleManualUtrVerify(pid);
        } else if (copyUtrBtn) {
          const utr = copyUtrBtn.getAttribute('data-copy-utr');
          if (utr) {
            navigator.clipboard.writeText(utr).then(() => {
              alert(`✓ Copied UTR: ${utr} to clipboard!`);
            }).catch(() => {
              prompt("Copy UTR:", utr);
            });
          }
        }
      });
    }

    const activeStakingContainer = this.container.querySelector('#youpi-active-staking-container');
    if (activeStakingContainer) {
      activeStakingContainer.addEventListener('click', (e) => {
        const verifyStakedBtn = e.target.closest('#btn-manual-verify-staked');
        const cancelStakedBtn = e.target.closest('#btn-cancel-staked-session');

        if (verifyStakedBtn) {
          const input = this.container.querySelector('#manual-staked-utr-input');
          const utr = input ? input.value.trim() : '';
          const activeSession = productStore.getActiveStakingSession();
          if (!activeSession) {
            alert('No active staking session found.');
            return;
          }
          if (utr && !/^\d{12}$/.test(utr)) {
            alert('UTR must be exactly 12 numeric digits (e.g. 202611884422).');
            return;
          }
          productStore.manualVerifyPayment(activeSession.paymentId, utr || '2026' + Math.floor(10000000 + Math.random() * 90000000));
          this.renderPaymentsTab();
          alert('✓ Staking session manually approved & marked Settled in ledger!');
        } else if (cancelStakedBtn) {
          if (confirm('Cancel and clear the active staking lock?')) {
            productStore.clearActiveStakingSession();
            this.renderPaymentsTab();
          }
        }
      });
    }

    window.addEventListener('payments-updated', () => {
      if (this.activeTab === 'payments') {
        this.renderPaymentsTab();
      }
    });
  }

  attemptLogin() {
    const passInput = this.container.querySelector('#admin-passcode-input');
    const errBox = this.container.querySelector('#admin-login-error');
    const passcode = passInput ? passInput.value.trim() : '';

    if (passcode === 'utsav2026') {
      sessionStorage.setItem('utsav_admin_auth', 'true');
      this.isAuthenticated = true;
      this.render();
      this.populateInitialData();
      history.pushState(null, '', `#/admin/${this.activeTab}`);
    } else {
      if (errBox) {
        errBox.style.display = 'block';
        errBox.textContent = '⚠️ Incorrect passcode. Access restricted to store owner.';
      }
      if (passInput) {
        passInput.classList.add('input-error-shake');
        setTimeout(() => passInput.classList.remove('input-error-shake'), 600);
      }
    }
  }

  open(tab = 'overview', syncHash = true) {
    this.isOpen = true;
    const overlay = this.container.querySelector('#admin-modal-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.scrollTop = 0;
    }
    document.body.classList.add('admin-mode-active');
    document.body.style.overflow = 'hidden';
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (this.isAuthenticated) {
      this.populateInitialData();
      if (tab && tab !== this.activeTab) {
        this.switchTab(tab, false);
      }
    }

    if (syncHash) {
      const targetHash = this.isAuthenticated ? `#/admin/${this.activeTab}` : '#/admin/login';
      if (window.location.hash !== targetHash) {
        history.pushState(null, '', targetHash);
      }
    }
  }

  close(syncHash = true) {
    this.isOpen = false;
    const overlay = this.container.querySelector('#admin-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    document.body.classList.remove('admin-mode-active');
    document.body.style.overflow = '';

    if (syncHash && window.location.hash.startsWith('#/admin')) {
      history.pushState(null, '', '#/');
    }
  }

  switchTab(tab, updateHash = true) {
    this.activeTab = tab;
    const tabBtns = this.container.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(b => {
      if (b.getAttribute('data-tab') === tab) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    const panes = this.container.querySelectorAll('.admin-tab-pane');
    panes.forEach(p => p.style.display = 'none');
    const activePane = this.container.querySelector(`#tab-pane-${tab}`);
    if (activePane) activePane.style.display = 'block';

    if (updateHash && window.location.hash.startsWith('#/admin')) {
      history.pushState(null, '', `#/admin/${tab}`);
    }

    if (tab === 'overview') this.renderOverviewTab();
    if (tab === 'orders') this.renderOrdersTable();
    if (tab === 'crm') this.renderCRMTable();
    if (tab === 'products') this.renderProductsTable();
    if (tab === 'discounts') this.populateDiscountSettings();
    if (tab === 'gsheet') this.populateGsheetSettings();
    if (tab === 'reviews') this.populateReviewsTab();
    if (tab === 'payments') this.renderPaymentsTab();
  }

  populateInitialData() {
    this.renderOverviewTab();
    this.renderOrdersTable();
    this.renderCRMTable();
    this.renderProductsTable();
    this.populateDiscountSettings();
    this.populateGsheetSettings();
    this.populateReviewsTab();
    this.renderPaymentsTab();
  }

  // --- 1. OVERVIEW & KPIS TAB ---
  renderOverviewTab() {
    const kpiContainer = this.container.querySelector('#admin-kpi-container');
    const recentOrdersTbody = this.container.querySelector('#overview-recent-orders-tbody');
    if (!kpiContainer) return;

    const stats = productStore.getDashboardStats();
    const formattedRevenue = `₹${stats.totalRevenue.toLocaleString('en-IN')}`;
    const formattedProfit = `₹${stats.netProfit.toLocaleString('en-IN')}`;
    const formattedAOV = `₹${stats.avgOrderValue.toLocaleString('en-IN')}`;

    kpiContainer.innerHTML = `
      <div class="kpi-card glow-gold">
        <div class="kpi-header">
          <span class="kpi-label">GROSS STORE REVENUE</span>
          <img src="/assets/icons/icon-billing.png" class="kpi-png-icon" alt="" />
        </div>
        <div class="kpi-value">${formattedRevenue}</div>
        <div class="kpi-meta">
          <span class="kpi-pill ${stats.totalOrders > 0 ? 'success' : 'info'}">${stats.totalOrders > 0 ? `● ${stats.totalOrders} Live Order(s)` : '● Store Ready'}</span>
          <span class="kpi-subtext">Across ${stats.totalOrders} total orders</span>
        </div>
      </div>

      <div class="kpi-card glow-profit">
        <div class="kpi-header">
          <span class="kpi-label">ESTIMATED NET PROFIT</span>
          <img src="/assets/icons/icon-overview.png" class="kpi-png-icon" alt="" />
        </div>
        <div class="kpi-value profit-highlight">${formattedProfit}</div>
        <div class="kpi-meta">
          <span class="kpi-pill ${stats.profitMargin > 0 ? 'success' : 'info'}">${stats.profitMargin > 0 ? `${stats.profitMargin}% Net Margin` : 'Calculated Real-Time'}</span>
          <span class="kpi-subtext">Post artisan, courier & packing costs</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">TOTAL ORDERS PLACED</span>
          <img src="/assets/icons/icon-orders.png" class="kpi-png-icon" alt="" />
        </div>
        <div class="kpi-value">${stats.totalOrders}</div>
        <div class="kpi-meta">
          <span class="kpi-pill ${stats.unshippedCount > 0 ? 'warning' : 'info'}">⚡ ${stats.unshippedCount} Action Needed</span>
          <span class="kpi-subtext">${stats.newOrdersCount} New • ${stats.packedCount} Packed</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">PREPAID VS COD SPLIT</span>
          <img src="/assets/icons/icon-discounts.png" class="kpi-png-icon" alt="" />
        </div>
        <div class="kpi-value">${stats.prepaidCount} Prep / ${stats.codCount} COD</div>
        <div class="kpi-meta">
          <span class="kpi-pill info">₹${stats.prepaidAmount.toLocaleString('en-IN')} Prepaid</span>
          <span class="kpi-subtext">₹${stats.codAmount.toLocaleString('en-IN')} Cash on Delivery</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">DISPATCH FULFILLMENT</span>
          <img src="/assets/icons/icon-products.png" class="kpi-png-icon" alt="" />
        </div>
        <div class="kpi-value">${stats.deliveredCount} Delivered</div>
        <div class="kpi-meta">
          <span class="kpi-pill ${(stats.shippedCount + stats.outForDeliveryCount) > 0 ? 'success' : 'info'}">● ${stats.shippedCount + stats.outForDeliveryCount} In-Transit</span>
          <span class="kpi-subtext">${stats.deliveredCount} Delivered • Avg: ${formattedAOV}</span>
        </div>
      </div>
    `;

    // Populate recent 4 orders in overview
    if (recentOrdersTbody) {
      const orders = productStore.getOrders().slice(0, 4);
      if (orders.length === 0) {
        recentOrdersTbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#94A3B8;">No customer orders placed yet.</td></tr>`;
      } else {
        recentOrdersTbody.innerHTML = orders.map(o => {
          const itemsSummary = (o.items || []).map(i => `${i.name} (x${i.quantity})`).join(', ');
          const statusClass = this.getStatusBadgeClass(o.orderStatus);

          return `
            <tr>
              <td><span class="order-id-badge">${o.id}</span></td>
              <td>${o.date}</td>
              <td>
                <div class="cust-name-bold">${o.customer?.name || 'Guest Customer'}</div>
                <div class="cust-email-dim">${o.customer?.email || '—'}</div>
              </td>
              <td><div class="items-summary-cell" title="${itemsSummary}">${itemsSummary}</div></td>
              <td><strong style="color:var(--color-gold-light);">₹${(o.totalINR || 0).toLocaleString('en-IN')}</strong></td>
              <td><span class="status-badge ${statusClass}">${o.orderStatus}</span></td>
            </tr>
          `;
        }).join('');
      }
    }
  }

  // --- 2. LIVE ORDERS & CUSTOMER DIRECTORY TAB ---
  updateOrderFilterBadges() {
    const stats = productStore.getDashboardStats();
    const btnGroup = this.container.querySelector('#orders-filter-buttons');
    if (!btnGroup) return;

    const chips = btnGroup.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
      const f = chip.getAttribute('data-filter');
      let label = '';
      if (f === 'unshipped') {
        label = `⚡ Action Needed (${stats.unshippedCount})`;
      } else if (f === 'New Order') {
        label = `1. Placed (${stats.newOrdersCount})`;
      } else if (f === 'Packed') {
        label = `2. Packed (${stats.packedCount})`;
      } else if (f === 'Shipped') {
        label = `3. Shipped (${stats.shippedCount})`;
      } else if (f === 'Out for Delivery') {
        label = `4. Out for Delivery (${stats.outForDeliveryCount})`;
      } else if (f === 'Delivered') {
        label = `5. Delivered (${stats.deliveredCount})`;
      } else if (f === 'all') {
        label = `All Orders (${stats.totalOrders})`;
      } else if (f === 'Cancelled') {
        label = `Cancelled / RTO (${stats.cancelledCount})`;
      }
      if (label) chip.textContent = label;
      if (f === this.orderFilter) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    const banner = this.container.querySelector('#orders-queue-banner');
    if (banner) {
      if (this.orderFilter === 'unshipped') {
        banner.innerHTML = `
          <div class="queue-banner-inner alert-amber">
            <span class="queue-icon">⚡</span>
            <div class="queue-text">
              <strong>Merchant Fulfillment Queue (Default View):</strong> Showing <strong>${stats.unshippedCount} order(s)</strong> awaiting packaging & shipping. Dispatched & delivered orders are safely archived under their respective stage filters to keep your workspace clear.
            </div>
            <button class="queue-view-all-link" id="btn-show-all-orders-banner">View All History (${stats.totalOrders})</button>
          </div>
        `;
        const viewAllBtn = banner.querySelector('#btn-show-all-orders-banner');
        if (viewAllBtn) {
          viewAllBtn.addEventListener('click', () => {
            this.orderFilter = 'all';
            this.renderOrdersTable();
          });
        }
      } else {
        const stageTitles = {
          'New Order': 'Stage 1: Placed by Client (Awaiting Processing)',
          'Packed': 'Stage 2: Processed & Packed in Luxury Boxes',
          'Shipped': 'Stage 3: Shipped / In-Transit with Courier',
          'Out for Delivery': 'Stage 4: Out for Delivery in Local Hubs',
          'Delivered': 'Stage 5: Delivered to Patrons',
          'Cancelled': 'Cancelled or Returned (RTO)',
          'all': 'All Historic Customer Orders'
        };
        banner.innerHTML = `
          <div class="queue-banner-inner">
            <span class="queue-icon">📋</span>
            <div class="queue-text">
              Showing: <strong>${stageTitles[this.orderFilter] || this.orderFilter}</strong>.
            </div>
            <button class="queue-view-all-link" id="btn-back-to-unshipped-banner">⚡ Back to Action Needed (${stats.unshippedCount})</button>
          </div>
        `;
        const backBtn = banner.querySelector('#btn-back-to-unshipped-banner');
        if (backBtn) {
          backBtn.addEventListener('click', () => {
            this.orderFilter = 'unshipped';
            this.renderOrdersTable();
          });
        }
      }
    }
  }

  renderOrdersTable() {
    const tbody = this.container.querySelector('#admin-orders-table-body');
    if (!tbody) return;

    this.updateOrderFilterBadges();

    let orders = productStore.getOrders();

    // 1. Filter by 5-Stage Lifecycle
    if (this.orderFilter === 'unshipped') {
      // By default: Only show orders not yet shipped (New Order / Packed / Processing)
      orders = orders.filter(o => ['New Order', 'Processing', 'Packed'].includes(o.orderStatus));
    } else if (this.orderFilter !== 'all') {
      orders = orders.filter(o => 
        o.orderStatus === this.orderFilter ||
        (this.orderFilter === 'Shipped' && o.orderStatus === 'Dispatched') ||
        (this.orderFilter === 'New Order' && o.orderStatus === 'Processing')
      );
    }

    // 2. Search query filter
    if (this.orderSearchQuery) {
      const q = this.orderSearchQuery;
      orders = orders.filter(o => 
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(q)) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(q)) ||
        (o.customer?.email && o.customer.email.toLowerCase().includes(q)) ||
        (o.customer?.phone && o.customer.phone.toLowerCase().includes(q)) ||
        (o.customer?.city && o.customer.city.toLowerCase().includes(q))
      );
    }

    if (orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:48px 24px; color:#94A3B8;">
            <div style="font-size:24px; margin-bottom:8px;">📦</div>
            <div style="font-weight:600; color:var(--text-primary); margin-bottom:4px;">No orders found in this view</div>
            <div style="font-size:12px;">${this.orderFilter === 'unshipped' ? 'Great job! All customer orders have been processed and shipped.' : 'Try selecting another lifecycle stage or clearing your search filter.'}</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = orders.map(o => {
      const cust = o.customer || {};
      const itemsList = (o.items || []).map(i => `
        <div class="order-item-chip">
          <span class="item-chip-qty">${i.quantity}x</span>
          <span class="item-chip-name">${i.name}</span>
          <span class="item-chip-sub">₹${(i.subtotalINR || 0).toLocaleString('en-IN')}</span>
        </div>
      `).join('');

      return `
        <tr>
          <td>
            <div class="order-id-badge">${o.id}</div>
            <div class="order-inv-num">${o.invoiceNumber}</div>
            <div class="order-date-text">${o.date}</div>
          </td>
          <td>
            <div class="cust-name-bold">${cust.name || 'Festive Guest'}</div>
            <a href="mailto:${cust.email}" class="cust-email-link" title="Send Direct Email">${cust.email || '—'}</a>
            <div class="cust-phone-dim">${cust.phone || ''}</div>
            <div class="cust-address-dim">${cust.city ? `${cust.city} (${cust.pincode || ''})` : ''}</div>
            ${cust.phone ? `
              <a href="https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Namaste ${cust.name || ''}! Thank you for ordering from Utsav Bazaar. Your order ${o.id} is confirmed with Insured Delivery. Tracking: ${o.trackingNumber || ''}`)}" target="_blank" rel="noopener noreferrer" class="whatsapp-direct-link" title="Chat on WhatsApp">
                <img src="/assets/icons/icon-whatsapp.png" class="wa-inline-icon" alt="" />
                <span>Chat Customer</span>
              </a>
            ` : ''}
          </td>
          <td>
            <div class="order-items-column">
              ${itemsList}
            </div>
          </td>
          <td>
            <div class="order-total-amount">₹${(o.totalINR || 0).toLocaleString('en-IN')}</div>
            <span class="paymode-pill">${o.paymentMode || 'Instant UPI'}</span>
            <div class="paystatus-sub ${o.paymentStatus?.includes('Paid') ? 'paid' : 'pending'}">
              ● ${o.paymentStatus || 'Verified'}
            </div>
            ${o.paymentMode && o.paymentMode.includes('COD') ? `
              <label class="cod-verify-checkbox" title="Confirm COD before shipping heavy brass items">
                <input type="checkbox" class="cod-verify-toggle" data-order-id="${o.id}" ${o.codVerified ? 'checked' : ''} />
                <span>${o.codVerified ? 'COD Confirmed' : 'Confirm COD'}</span>
              </label>
            ` : ''}
          </td>
          <td>
            <div class="status-selector-wrap">
              <select class="admin-order-status-select select-${this.getStatusSlug(o.orderStatus)}" data-order-id="${o.id}">
                <option value="New Order" ${o.orderStatus === 'New Order' || o.orderStatus === 'Processing' ? 'selected' : ''}>1. New Order (Client Placed)</option>
                <option value="Packed" ${o.orderStatus === 'Packed' ? 'selected' : ''}>2. Processed & Packed</option>
                <option value="Shipped" ${o.orderStatus === 'Shipped' || o.orderStatus === 'Dispatched' ? 'selected' : ''}>3. Shipped (In-Transit)</option>
                <option value="Out for Delivery" ${o.orderStatus === 'Out for Delivery' ? 'selected' : ''}>4. Out for Delivery</option>
                <option value="Delivered" ${o.orderStatus === 'Delivered' ? 'selected' : ''}>5. Delivered</option>
                <option value="Cancelled" ${o.orderStatus === 'Cancelled' ? 'selected' : ''}>Cancelled (Restock)</option>
                <option value="Returned" ${o.orderStatus === 'Returned' ? 'selected' : ''}>Returned (RTO)</option>
              </select>
            </div>
          </td>
          <td>
            <div class="tracking-pill">${o.trackingNumber || 'UB-TRK-771822'}</div>
            <div class="email-alert-indicator">
              <span class="pulse-dot">●</span> 2-Way Sync
            </div>
          </td>
          <td style="text-align: right;">
            <div class="order-actions-stack">
              <button class="tbl-action-btn-print" data-print-order-id="${o.id}" title="1-Click Print Tax Invoice & Shipping Label">
                <img src="/assets/icons/icon-print.png" class="btn-action-png" alt="" />
                <span>Bill</span>
              </button>
              <button class="tbl-action-btn danger" data-delete-order-id="${o.id}" title="Remove Order Record">
                <span>Delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  handleOrderStatusChange(orderId, newStatus, selectElement) {
    const updated = productStore.updateOrderStatus(orderId, newStatus);
    if (updated) {
      const order = productStore.getOrderById(orderId);
      const custEmail = order?.customer?.email || 'customer';

      // Update selector styling class
      selectElement.className = `admin-order-status-select select-${this.getStatusSlug(newStatus)}`;

      // Show toast notification
      const toast = this.container.querySelector('#admin-orders-toast');
      if (toast) {
        toast.innerHTML = `
          <strong>✓ Order ${orderId} Status Updated to "${newStatus}"!</strong>
          <span>Simulated status dispatch notification triggered to <em>${custEmail}</em>.</span>
        `;
        toast.style.display = 'block';
        toast.className = 'admin-toast-banner show-toast';
        setTimeout(() => {
          toast.className = 'admin-toast-banner';
          setTimeout(() => { if (toast) toast.style.display = 'none'; }, 400);
        }, 4000);
      }

      // Refresh overview stats & update badge counts
      this.renderOverviewTab();
      this.updateOrderFilterBadges();

      // If merchant is currently on unshipped view and marked item Shipped/Delivered/Cancelled,
      // refresh table smoothly after a moment
      if (this.orderFilter === 'unshipped') {
        setTimeout(() => {
          this.renderOrdersTable();
        }, 500);
      }
    }
  }

  printOrderInvoice(orderId) {
    const o = productStore.getOrderById(orderId);
    if (!o) {
      alert(`Order ${orderId} not found.`);
      return;
    }

    const items = o.items || [];
    const cust = o.customer || {};
    const invoiceNum = o.invoiceNumber || `UB-INV-2026-${orderId.replace(/[^0-9]/g, '').slice(-6) || '881204'}`;
    const trackingNum = o.trackingNumber || `UB-TRK-${orderId.replace(/[^0-9]/g, '').slice(-6) || '771822'}`;
    const totalINR = o.totalINR || 0;
    const isPrepaid = (o.paymentMethod || 'prepaid').toLowerCase().includes('prepaid') || (o.paymentMethod || '').toLowerCase().includes('card') || (o.paymentMethod || '').toLowerCase().includes('upi');

    const printHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Invoice & Shipping Label - ${invoiceNum}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
          body { background: #FFF; color: #111; padding: 24px; font-size: 13px; line-height: 1.4; }
          .print-container { max-width: 800px; margin: 0 auto; }
          
          /* SECTION 1: OFFICIAL PACKING INVOICE (INSIDE BOX) */
          .invoice-box { border: 2px solid #111; border-radius: 8px; padding: 24px; margin-bottom: 24px; }
          .inv-head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #D4AF37; padding-bottom: 16px; margin-bottom: 16px; }
          .brand-title { font-size: 24px; font-weight: 800; color: #92400E; letter-spacing: 0.05em; }
          .brand-subtitle { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.1em; }
          .inv-meta { text-align: right; }
          .inv-num { font-size: 16px; font-weight: 800; color: #111; }
          .inv-date { font-size: 12px; color: #555; }
          
          .grid-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; background: #FAF8F5; padding: 12px 16px; border-radius: 6px; }
          .party-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #92400E; margin-bottom: 4px; }
          
          table.inv-items { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          table.inv-items th { background: #F3F4F6; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #CCC; }
          table.inv-items td { padding: 8px 10px; border-bottom: 1px solid #EEE; font-size: 12px; }
          
          .inv-totals { display: flex; justify-content: flex-end; margin-bottom: 16px; }
          .totals-table { width: 280px; }
          .totals-table tr td { padding: 4px 0; }
          .totals-table tr.grand-total td { font-size: 15px; font-weight: 800; border-top: 2px solid #111; padding-top: 6px; color: #92400E; }
          
          .legal-zero-gst { font-size: 10.5px; color: #047857; background: #ECFDF5; border: 1px solid #A7F3D0; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; }
          
          /* CUT LINE */
          .cut-divider { border-top: 2px dashed #999; margin: 30px 0; position: relative; text-align: center; }
          .cut-label { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: #FFF; padding: 0 12px; font-size: 11px; font-weight: 700; color: #666; text-transform: uppercase; }
          
          /* SECTION 2: SHIPPING BOX STICKER (OUTSIDE BOX) */
          .shipping-label-box { border: 3px solid #000; border-radius: 8px; padding: 20px; background: #FFF; }
          .label-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 14px; }
          .courier-badge { font-size: 16px; font-weight: 900; background: #000; color: #FFF; padding: 4px 12px; border-radius: 4px; }
          .trk-badge { font-size: 14px; font-weight: 800; font-family: monospace; }
          
          .ship-dest { font-size: 15px; font-weight: 700; line-height: 1.5; margin-bottom: 14px; border: 1.5px solid #111; padding: 12px; border-radius: 6px; background: #FFF; }
          .ship-dest .dest-name { font-size: 18px; font-weight: 900; color: #000; }
          
          .label-footer-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; align-items: center; }
          .pay-mode-stamp { border: 2px solid #000; padding: 10px; text-align: center; border-radius: 6px; }
          .pay-mode-stamp.prepaid { background: #ECFDF5; border-color: #059669; color: #047857; font-weight: 900; font-size: 15px; }
          .pay-mode-stamp.cod { background: #FEF2F2; border-color: #DC2626; color: #B91C1C; font-weight: 900; font-size: 15px; }
          
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="no-print" style="margin-bottom: 16px; display: flex; justify-content: space-between;">
            <button onclick="window.print()" style="padding: 10px 24px; background: #92400E; color: #FFF; border: none; border-radius: 6px; font-weight: 700; cursor: pointer;">🖨️ Print Tax Invoice & Box Label</button>
            <button onclick="window.close()" style="padding: 10px 16px; background: #EEE; border: 1px solid #CCC; border-radius: 6px; cursor: pointer;">Close Window</button>
          </div>

          <!-- DOCUMENT 1: OFFICIAL PACKING SLIP & RETAIL INVOICE -->
          <div class="invoice-box">
            <div class="inv-head">
              <div>
                <div class="brand-title">UTSAV BAZAAR</div>
                <div class="brand-subtitle">Artisanal Heritage Store • All-Inclusive Retail Invoice</div>
              </div>
              <div class="inv-meta">
                <div class="inv-num">${invoiceNum}</div>
                <div class="inv-date">Order ID: ${o.id} • ${o.date}</div>
              </div>
            </div>

            <div class="grid-parties">
              <div>
                <div class="party-title">Dispatched From (Merchant):</div>
                <strong>Utsav Bazaar Master Atelier</strong><br>
                Moradabad Crafts Enclave, Uttar Pradesh, PIN 244001<br>
                Email: care@utsavbazaar.in | Web: utsavbazaar.in
              </div>
              <div>
                <div class="party-title">Customer Shipping Details:</div>
                <strong>${cust.name || 'Valued Patron'}</strong><br>
                ${cust.address || 'Standard Address'}<br>
                ${cust.city || 'City'}, ${cust.state || 'State'} - ${cust.pincode || 'Postal PIN'}<br>
                Phone: ${cust.phone || '—'}
              </div>
            </div>

            <table class="inv-items">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Offering Description</th>
                  <th>SKU</th>
                  <th>HSN</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Rate (₹)</th>
                  <th style="text-align: right;">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((it, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${it.name}</strong></td>
                    <td><code>${it.sku || 'UB-HAND-7718'}</code></td>
                    <td><code>${it.hsnCode || '7419'}</code></td>
                    <td style="text-align: center;">${it.quantity}</td>
                    <td style="text-align: right;">₹${it.priceINR.toLocaleString('en-IN')}</td>
                    <td style="text-align: right;">₹${(it.priceINR * it.quantity).toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="inv-totals">
              <table class="totals-table">
                <tr>
                  <td>Subtotal:</td>
                  <td style="text-align: right;">₹${totalINR.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>GST / CGST / SGST:</td>
                  <td style="text-align: right; color: #047857; font-weight: 700;">₹0 (All-Inclusive)</td>
                </tr>
                <tr>
                  <td>Insured Express Delivery:</td>
                  <td style="text-align: right; color: #047857; font-weight: 700;">₹0 (FREE)</td>
                </tr>
                <tr class="grand-total">
                  <td>Total Payable:</td>
                  <td style="text-align: right;">₹${totalINR.toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>

            <div class="legal-zero-gst">
              ✓ <strong>Zero GST • All-Inclusive Pricing Guarantee:</strong> You saved 100% on taxes and delivery fees with Utsav Bazaar! The rate shown above is the final net price paid.
            </div>

            <div style="font-size: 11px; color: #777; text-align: center; border-top: 1px solid #EEE; padding-top: 8px;">
              Thank you for supporting traditional Indian artisans. Handcrafted with reverence and devotion.
            </div>
          </div>

          <!-- CUT SCISSORS DIVIDER -->
          <div class="cut-divider">
            <span class="cut-label">✂ CUT HERE • AFFIX LABEL BELOW TO OUTSIDE OF SHIPPING BOX</span>
          </div>

          <!-- DOCUMENT 2: SHIPPING BOX LABEL -->
          <div class="shipping-label-box">
            <div class="label-head">
              <div>
                <span class="courier-badge">EXPRESS LOGISTICS</span>
              </div>
              <div class="trk-badge">
                TRACKING AWB: <strong>${trackingNum}</strong>
              </div>
            </div>

            <div class="ship-dest">
              <div style="font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 2px;">DELIVER SHIPMENT TO:</div>
              <div class="dest-name">${cust.name || 'Valued Patron'}</div>
              <div>${cust.address || ''}</div>
              <div><strong>${cust.city || 'City'}, ${cust.state || ''} - ${cust.pincode || ''}</strong></div>
              <div style="margin-top: 4px;">CONTACT: <strong>${cust.phone || '—'}</strong></div>
            </div>

            <div class="label-footer-grid">
              <div>
                <div style="font-size: 11px; color: #555;"><strong>RETURN / SHIPPER:</strong> Utsav Bazaar Master Atelier, Moradabad, UP 244001</div>
                <div style="font-size: 10px; color: #777; margin-top: 2px;">Fragile Artisanal Artifact • Handle with Extreme Care</div>
              </div>
              <div>
                <div class="pay-mode-stamp ${isPrepaid ? 'prepaid' : 'cod'}">
                  ${isPrepaid ? 'PAID PREPAID<br><span style="font-size:11px; font-weight:normal;">Do not collect cash</span>' : `COLLECT COD<br>₹${totalINR.toLocaleString('en-IN')}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=900,height=800');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printHtml);
      printWin.document.close();
      printWin.focus();
    } else {
      alert("Please allow pop-ups for this site to view and print invoices.");
    }
  }

  exportOrdersCSV() {
    const csvData = productStore.exportOrdersToCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utsav_bazaar_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  getStatusBadgeClass(status) {
    switch (status) {
      case 'New Order':
      case 'Processing': return 'badge-new-order';
      case 'Packed': return 'badge-packed';
      case 'Shipped':
      case 'Dispatched': return 'badge-shipped';
      case 'Out for Delivery': return 'badge-out-for-delivery';
      case 'Delivered': return 'badge-delivered';
      case 'Cancelled': return 'badge-cancelled';
      case 'Returned': return 'badge-returned';
      default: return 'badge-new-order';
    }
  }

  getStatusSlug(status) {
    return (status || 'new-order').toLowerCase().replace(/\s+/g, '-');
  }

  // --- 3. PRODUCTS TAB ---
  renderProductsTable(query = '') {
    const tbody = this.container.querySelector('#admin-products-table-body');
    if (!tbody) return;

    let prods = productStore.getProducts();

    // 1. Festival Filter
    if (this.catalogFestivalFilter && this.catalogFestivalFilter !== 'all') {
      prods = prods.filter(p => {
        const fest = (p.festival || 'diwali').toLowerCase();
        const tag = (p.festivalTag || '').toLowerCase();
        const filt = this.catalogFestivalFilter.toLowerCase();
        return fest === filt || fest.includes(filt) || tag.includes(filt);
      });
    }

    // 2. Search Query Filter
    if (query) {
      const q = query.toLowerCase();
      prods = prods.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.origin.toLowerCase().includes(q) ||
        (p.festival && p.festival.toLowerCase().includes(q)) ||
        (p.festivalTag && p.festivalTag.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    if (prods.length === 0) {
      const allTotal = productStore.getProducts().length;
      if (allTotal === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align:center; padding: 48px 20px;">
              <div style="max-width: 440px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 10px;">
                <span style="font-size: 36px;">🪔</span>
                <h3 style="margin: 0; color: var(--color-gold-light); font-size: 17px; font-weight: 700;">Catalog is Clean & Empty</h3>
                <p style="margin: 0; color: #94A3B8; font-size: 13px; line-height: 1.5;">
                  All static demo products have been removed. You can add offerings manually, import CSV, sync with Google Sheets / Supabase, or load sample festival items for testing.
                </p>
                <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; justify-content: center;">
                  <button class="admin-btn-primary" id="btn-empty-add-offering">➕ Add First Offering</button>
                  <button class="admin-btn-secondary" id="btn-empty-load-sample">↺ Load Sample Festive Items</button>
                </div>
              </div>
            </td>
          </tr>
        `;
        const addBtn = tbody.querySelector('#btn-empty-add-offering');
        if (addBtn) addBtn.addEventListener('click', () => this.openProductEditor(null));
        const sampleBtn = tbody.querySelector('#btn-empty-load-sample');
        if (sampleBtn) sampleBtn.addEventListener('click', () => {
          productStore.seedSampleFestiveCatalog();
          this.renderProductsTable();
          this.renderOverviewTab();
        });
      } else {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:36px; color:#94A3B8;">No festive offerings match your selected filter or search query.</td></tr>`;
      }
      return;
    }

    tbody.innerHTML = prods.map(p => {
      const orig = p.originalPriceINR ? `₹${p.originalPriceINR.toLocaleString('en-IN')}` : '—';
      const sale = `₹${p.priceINR.toLocaleString('en-IN')}`;
      const disc = p.discountPercent ? `-${p.discountPercent}%` : '0%';
      const stockQty = p.stockQty !== undefined ? p.stockQty : (p.inStock ? 25 : 0);
      const isLowStock = stockQty <= (p.lowStockThreshold || 5) && stockQty > 0;
      const isSoldOut = stockQty <= 0 || !p.inStock;

      const stockBadge = isSoldOut
        ? `<span class="stock-pill out-stock" data-toggle-stock-id="${p.id}" title="Click to restock">Sold Out (0)</span>`
        : (isLowStock
          ? `<span class="stock-pill low-stock" data-toggle-stock-id="${p.id}" title="Low stock alert!">${stockQty} Left (Low)</span>`
          : `<span class="stock-pill in-stock" data-toggle-stock-id="${p.id}" title="Click to adjust">${stockQty} in Stock</span>`);

      const visual = p.imageUrl
        ? `<img src="${p.imageUrl}" class="table-thumb-img" alt="${p.name}" />`
        : `<div class="table-thumb-svg"></div>`;

      const festivalLabel = p.festivalTag || this.formatFestivalName(p.festival || 'diwali');

      return `
        <tr>
          <td>${visual}</td>
          <td>
            <div class="row-product-name">${p.name}</div>
            <div class="row-product-meta">
              <span class="row-sku-badge">${p.sku || `UB-${p.id}`}</span>
              <span class="row-origin-text">${p.origin || 'Moradabad'}</span>
            </div>
          </td>
          <td>
            <div class="row-category-stack">
              <span class="category-tag-pill">${p.categoryName || p.category}</span>
              <span class="festival-tag-pill" title="Festive Occasion">${festivalLabel}</span>
            </div>
          </td>
          <td><span class="price-strikethrough-sm">${orig}</span></td>
          <td><span class="price-sale-highlight">${sale}</span></td>
          <td><span class="discount-badge-table">${disc}</span></td>
          <td>${stockBadge}</td>
          <td style="text-align: right;">
            <div class="product-actions-stack">
              <button class="tbl-action-btn btn-edit-product" data-edit-id="${p.id}" title="Edit Offering Details & Stock">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>Edit</span>
              </button>
              <button class="tbl-action-btn danger btn-delete-product" data-delete-id="${p.id}" title="Remove Offering">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                <span>Delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  formatFestivalName(fest) {
    switch (fest) {
      case 'diwali': return '🪔 Diwali';
      case 'dhanteras': return '🪙 Dhanteras';
      case 'karwa-chauth': return '🌕 Karwa Chauth';
      case 'bhai-dooj': return '🌸 Bhai Dooj';
      case 'chhath-puja': return '☀️ Chhath Puja';
      case 'navratri': return '🌺 Navratri';
      case 'wedding': return '👑 Shahi Vivah';
      default: return '✨ Auspicious';
    }
  }

  // --- CUSTOMER CRM & RETARGETING TAB ---
  renderCRMTable(query = '') {
    const tbody = this.container.querySelector('#admin-crm-table-body');
    const badge = this.container.querySelector('#crm-total-patrons-badge');
    if (!tbody) return;

    let patrons = productStore.getCustomerDirectory();
    if (badge) badge.textContent = `● ${patrons.length} Lifetime Customers`;

    if (query) {
      const q = query.toLowerCase();
      patrons = patrons.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }

    if (patrons.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:#94A3B8;">No customer profiles match your search.</td></tr>`;
      return;
    }

    tbody.innerHTML = patrons.map(c => {
      const vipBadge = c.vip
        ? `<span class="vip-crown-badge">★ VIP Repeat Patron</span>`
        : `<span class="guest-patron-badge">Registered Patron</span>`;

      const cleanPhone = c.phone.replace(/[^0-9]/g, '');
      const waMsg = encodeURIComponent(`Namaste ${c.name}! We hope your handcrafted treasures from Utsav Bazaar brought auspicious blessings to your home. Here is an exclusive 15% VIP festive coupon: DIWALI2026 for your next order!`);

      return `
        <tr>
          <td>
            <div class="cust-name-bold">${c.name}</div>
            ${vipBadge}
          </td>
          <td>
            <div class="cust-phone-dim">${c.phone || '—'}</div>
            ${cleanPhone ? `
              <a href="https://wa.me/${cleanPhone}?text=${waMsg}" target="_blank" rel="noopener noreferrer" class="whatsapp-direct-link" style="margin-top:4px;">
                <img src="/assets/icons/icon-whatsapp.png" class="wa-inline-icon" alt="" />
                <span>WhatsApp VIP Perk</span>
              </a>
            ` : ''}
          </td>
          <td><a href="mailto:${c.email}" class="cust-email-link">${c.email || '—'}</a></td>
          <td>
            <div>${c.city || '—'}</div>
            <small style="color:#94A3B8;">${c.pincode || ''}</small>
          </td>
          <td style="text-align: center;">
            <strong style="font-size: 14px; color: var(--color-gold);">${c.totalOrders}</strong>
          </td>
          <td>
            <strong style="color: var(--color-gold-light); font-size: 14px;">₹${c.totalSpent.toLocaleString('en-IN')}</strong>
          </td>
          <td style="text-align: right;">
            <button class="admin-btn-secondary btn-sm" onclick="alert('VIP Festive Offer WhatsApp message opened for ${c.name}!')">
              <span>Send Promo</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // --- 4. DISCOUNTS TAB ---
  populateDiscountSettings() {
    const s = productStore.discountSettings;
    const toggle = this.container.querySelector('#bar-enabled-toggle');
    const textInput = this.container.querySelector('#bar-text-input');
    const couponInput = this.container.querySelector('#bar-coupon-input');
    const pctInput = this.container.querySelector('#bar-percent-input');

    if (toggle) toggle.checked = !!s.enabled;
    if (textInput) textInput.value = s.text || '';
    if (couponInput) couponInput.value = s.couponCode || 'DIWALI2026';
    if (pctInput) pctInput.value = s.discountPercent || 15;
  }

  // --- 5. GOOGLE SHEETS & APPS SCRIPT SETTINGS ---
  populateGsheetSettings() {
    const urlInput = this.container.querySelector('#gsheet-url-input');
    if (urlInput) urlInput.value = productStore.googleSheetUrl || '';

    const appsScriptInput = this.container.querySelector('#apps-script-url-input');
    if (appsScriptInput) appsScriptInput.value = productStore.getAppsScriptUrl() || '';
  }

  // --- 6. REVIEWS TAB ---
  populateReviewsTab() {
    const select = this.container.querySelector('#review-product-select');
    if (!select) return;

    const prods = productStore.getProducts();
    const currentVal = select.value;
    select.innerHTML = prods.map(p => `
      <option value="${p.id}" ${currentVal === p.id ? 'selected' : ''}>${p.name} (${p.categoryName || p.category})</option>
    `).join('');

    // Pre-fill today's date if empty
    const dateInput = this.container.querySelector('#rev-date-input');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    this.renderReviewsView();
  }

  setReviewAvatar(urlOrData) {
    if (!urlOrData) return;
    this.currentRevAvatarBase64 = urlOrData;
    const img = this.container.querySelector('#rev-avatar-preview-img');
    const placeholder = this.container.querySelector('#rev-avatar-placeholder');
    const removeBtn = this.container.querySelector('#btn-remove-rev-avatar');
    const urlInput = this.container.querySelector('#rev-avatar-url-input');

    if (img) {
      img.src = urlOrData;
      img.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'inline-flex';
    if (urlInput && urlOrData.startsWith('http')) {
      urlInput.value = urlOrData;
    }
  }

  clearReviewAvatar() {
    this.currentRevAvatarBase64 = '';
    const img = this.container.querySelector('#rev-avatar-preview-img');
    const placeholder = this.container.querySelector('#rev-avatar-placeholder');
    const removeBtn = this.container.querySelector('#btn-remove-rev-avatar');
    const fileInput = this.container.querySelector('#rev-avatar-file-input');
    const urlInput = this.container.querySelector('#rev-avatar-url-input');

    if (img) {
      img.src = '';
      img.style.display = 'none';
    }
    if (placeholder) placeholder.style.display = 'block';
    if (removeBtn) removeBtn.style.display = 'none';
    if (fileInput) fileInput.value = '';
    if (urlInput) urlInput.value = '';
  }

  setReviewPhoto(urlOrData, filename = 'customer_photo.jpg') {
    if (!urlOrData) return;
    this.currentRevPhotoBase64 = urlOrData;
    const dropzone = this.container.querySelector('#rev-photo-dropzone');
    const previewBar = this.container.querySelector('#rev-photo-preview-bar');
    const img = this.container.querySelector('#rev-photo-preview-img');
    const nameEl = this.container.querySelector('#rev-photo-preview-name');
    const urlInput = this.container.querySelector('#rev-photo-url-input');

    if (img) img.src = urlOrData;
    if (nameEl) nameEl.textContent = filename;
    if (previewBar) previewBar.style.display = 'flex';
    if (dropzone) dropzone.style.display = 'none';
    if (urlInput && urlOrData.startsWith('http')) {
      urlInput.value = urlOrData;
    }
  }

  clearReviewPhoto() {
    this.currentRevPhotoBase64 = '';
    const dropzone = this.container.querySelector('#rev-photo-dropzone');
    const previewBar = this.container.querySelector('#rev-photo-preview-bar');
    const img = this.container.querySelector('#rev-photo-preview-img');
    const fileInput = this.container.querySelector('#rev-photo-file-input');
    const urlInput = this.container.querySelector('#rev-photo-url-input');

    if (img) img.src = '';
    if (previewBar) previewBar.style.display = 'none';
    if (dropzone) dropzone.style.display = 'block';
    if (fileInput) fileInput.value = '';
    if (urlInput) urlInput.value = '';
  }

  renderReviewsView() {
    const filterSelectedBtn = this.container.querySelector('#btn-rev-filter-selected');
    const filterAllBtn = this.container.querySelector('#btn-rev-filter-all');
    if (filterSelectedBtn && filterAllBtn) {
      if (this.reviewsViewFilter === 'all') {
        filterSelectedBtn.classList.remove('active');
        filterAllBtn.classList.add('active');
      } else {
        filterSelectedBtn.classList.add('active');
        filterAllBtn.classList.remove('active');
      }
    }

    if (this.reviewsViewFilter === 'all') {
      this.renderAllReviews();
    } else {
      const select = this.container.querySelector('#review-product-select');
      const prodId = select ? select.value : null;
      if (prodId) {
        this.renderReviewsForProduct(prodId);
      } else {
        const prods = productStore.getProducts();
        if (prods.length > 0) this.renderReviewsForProduct(prods[0].id);
      }
    }
  }

  renderReviewsForProduct(productId) {
    const container = this.container.querySelector('#admin-reviews-container');
    const summaryBar = this.container.querySelector('#rev-product-summary-bar');
    if (!container) return;

    const prod = productStore.getProductById(productId);
    const reviews = productStore.getProductReviews(productId);

    if (summaryBar && prod) {
      summaryBar.innerHTML = `
        <div class="rev-summary-inner">
          <img src="${prod.imageUrl || '/assets/products/diya_peacock.jpg'}" class="rev-summary-img" alt="${prod.name}" />
          <div class="rev-summary-details">
            <h4 class="rev-summary-title">${prod.name}</h4>
            <div class="rev-summary-meta">
              <span class="rev-stars-highlight">${'★'.repeat(Math.round(prod.rating || 5))}</span>
              <strong>${prod.rating || 5.0}</strong>
              <span>(${reviews.length} total customer reviews)</span>
              <span class="rev-cat-pill">${prod.categoryName || prod.category}</span>
            </div>
          </div>
        </div>
      `;
    }

    if (reviews.length === 0) {
      container.innerHTML = `
        <div class="admin-empty-reviews-state">
          <div class="empty-diya">🪔</div>
          <h4>No Reviews Yet on This Offering</h4>
          <p>Use the form on the left to add a customer blessing, avatar, and unboxing photo!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = reviews.map(r => this.generateReviewCardHtml(r, productId, false)).join('');
  }

  renderAllReviews() {
    const container = this.container.querySelector('#admin-reviews-container');
    const summaryBar = this.container.querySelector('#rev-product-summary-bar');
    if (!container) return;

    const allReviews = productStore.getAllReviewsList();

    if (summaryBar) {
      summaryBar.innerHTML = `
        <div class="rev-summary-inner">
          <div class="rev-summary-all-badge">📚</div>
          <div class="rev-summary-details">
            <h4 class="rev-summary-title">All Store Customer Reviews & Blessings</h4>
            <div class="rev-summary-meta">
              <span>Showing <strong>${allReviews.length} verified customer reviews</strong> across all festive offerings</span>
            </div>
          </div>
        </div>
      `;
    }

    if (allReviews.length === 0) {
      container.innerHTML = `
        <div class="admin-empty-reviews-state">
          <div class="empty-diya">🪔</div>
          <h4>No Customer Reviews Recorded Yet</h4>
          <p>Add your first customer review using the form on the left.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = allReviews.map(r => this.generateReviewCardHtml(r, r.productId, true)).join('');
  }

  generateReviewCardHtml(r, productId, isAllMode = false) {
    const hasAvatar = !!(r.avatarUrl && r.avatarUrl.trim().length > 5);
    const hasPhoto = !!((r.photoUrl || r.imageUrl) && (r.photoUrl || r.imageUrl).trim().length > 5);
    const photoSrc = r.photoUrl || r.imageUrl || '';
    const initial = (r.name || 'P').trim().charAt(0).toUpperCase();

    return `
      <div class="admin-real-review-card" data-card-review-id="${r.id}" data-card-prod-id="${productId}">
        <div class="admin-rev-card-header">
          <div class="rev-user-info-cluster">
            ${hasAvatar ? `
              <img src="${r.avatarUrl}" class="admin-rev-avatar-img" alt="${r.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
              <div class="admin-rev-avatar-fallback" style="display:none;">${initial}</div>
            ` : `
              <div class="admin-rev-avatar-fallback">${initial}</div>
            `}
            <div class="rev-user-meta">
              <div class="rev-user-name-line">
                <strong class="rev-author-name">${r.name}</strong>
                ${r.verified !== false ? `<span class="rev-verified-tag">✓ Verified Purchase</span>` : ''}
              </div>
              <div class="rev-sub-meta">
                ${r.city ? `<span class="rev-city-tag">📍 ${r.city}</span> <span class="meta-dot">•</span> ` : ''}
                <span class="rev-date-tag">${r.date || 'Recent'}</span>
              </div>
            </div>
          </div>

          <div class="rev-header-right-actions">
            <button type="button" class="tbl-action-btn danger btn-delete-review" data-del-review-id="${r.id}" data-del-prod-id="${productId}" title="Delete this review">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div class="admin-rev-rating-headline">
          <span class="rev-stars-gold">${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}</span>
          <span class="rev-rating-num">${r.rating || 5}.0</span>
          ${r.title ? `<strong class="rev-headline-text">${r.title}</strong>` : ''}
        </div>

        <p class="admin-rev-comment-body">"${r.comment}"</p>

        ${hasPhoto ? `
          <div class="admin-rev-attached-photo">
            <img src="${photoSrc}" class="admin-rev-thumb-photo" alt="Customer unboxing photo" onclick="window.open(this.src, '_blank')" title="Click to open full unboxing photo" />
            <span class="photo-ugc-pill">📸 Real Unboxing Photo</span>
          </div>
        ` : ''}

        ${isAllMode && r.productName ? `
          <div class="admin-rev-linked-product-bar">
            <small>Linked Offering:</small> <strong>${r.productName}</strong>
          </div>
        ` : ''}
      </div>
    `;
  }

  // --- PRODUCT EDITOR & MULTI-MEDIA CMS ---
  addMediaItem(item) {
    if (!item || !item.url) return;
    this.currentMediaList.push(item);
    this.activePreviewMediaIdx = this.currentMediaList.length - 1;
    this.renderMediaStrip();
    this.updateLiveCardPreview();
  }

  removeMediaItem(idx) {
    if (idx >= 0 && idx < this.currentMediaList.length) {
      this.currentMediaList.splice(idx, 1);
      if (this.activePreviewMediaIdx >= this.currentMediaList.length) {
        this.activePreviewMediaIdx = Math.max(0, this.currentMediaList.length - 1);
      }
      this.renderMediaStrip();
      this.updateLiveCardPreview();
    }
  }

  selectMediaForPreview(idx) {
    if (idx >= 0 && idx < this.currentMediaList.length) {
      this.activePreviewMediaIdx = idx;
      this.renderMediaStrip();
      this.updateLiveCardPreview();
    }
  }

  renderMediaStrip() {
    const strip = this.container.querySelector('#editor-media-strip');
    const badge = this.container.querySelector('#media-count-badge');
    if (badge) badge.textContent = this.currentMediaList.length;
    if (!strip) return;

    if (this.currentMediaList.length === 0) {
      strip.innerHTML = `
        <div class="empty-media-note">
          <span>No media files added yet. Upload files or paste a direct URL above.</span>
        </div>
      `;
      return;
    }

    strip.innerHTML = this.currentMediaList.map((item, idx) => {
      const isSelected = idx === this.activePreviewMediaIdx;
      const isPrimary = idx === 0;
      const isVideo = item.type === 'video';

      let mediaThumbHtml = '';
      if (isVideo) {
        mediaThumbHtml = `
          <div class="thumb-video-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span class="video-label-badge">VIDEO</span>
          </div>
        `;
      } else {
        mediaThumbHtml = `<img src="${item.url}" alt="Thumbnail ${idx + 1}" />`;
      }

      return `
        <div class="media-thumb-item ${isSelected ? 'active' : ''}" data-idx="${idx}">
          ${mediaThumbHtml}
          ${isPrimary ? `<span class="primary-tag" title="Primary image on catalog cards">PRIMARY</span>` : ''}
          ${item.type === 'gif' ? `<span class="gif-tag">GIF</span>` : ''}
          <button type="button" class="btn-del-media" data-del-idx="${idx}" title="Remove Media">✕</button>
        </div>
      `;
    }).join('');

    // Bind thumb clicks
    strip.querySelectorAll('.media-thumb-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.btn-del-media')) return;
        const idx = parseInt(el.getAttribute('data-idx'), 10);
        this.selectMediaForPreview(idx);
      });
    });

    // Bind delete clicks
    strip.querySelectorAll('.btn-del-media').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-del-idx'), 10);
        this.removeMediaItem(idx);
      });
    });
  }

  updateLiveCardPreview() {
    const mockupDisplay = this.container.querySelector('#mockup-media-display');
    const mockupBadge = this.container.querySelector('#mockup-badge');
    const mockupOrigin = this.container.querySelector('#mockup-origin');
    const mockupTitle = this.container.querySelector('#mockup-title');
    const mockupTagline = this.container.querySelector('#mockup-tagline');
    const mockupSale = this.container.querySelector('#mockup-sale-price');
    const mockupOrig = this.container.querySelector('#mockup-orig-price');
    const mockupDisc = this.container.querySelector('#mockup-discount-pill');

    const nameVal = this.container.querySelector('#edit-name')?.value.trim() || 'Royal Moradabad Peacock Brass Diya';
    const originVal = this.container.querySelector('#edit-origin')?.value.trim() || 'Moradabad, Uttar Pradesh';
    const taglineVal = this.container.querySelector('#edit-tagline')?.value.trim() || 'Handcrafted solid brass with intricate filigree crest';
    const badgeVal = this.container.querySelector('#edit-badge')?.value.trim() || 'FESTIVE SPECIAL';
    
    const priceVal = parseFloat(this.container.querySelector('#edit-price')?.value) || 2499;
    const origInput = parseFloat(this.container.querySelector('#edit-orig-price')?.value);
    const origVal = origInput || Math.round(priceVal * 1.25);
    const discInput = parseFloat(this.container.querySelector('#edit-discount')?.value);
    const discVal = (discInput !== undefined && !isNaN(discInput)) ? discInput : Math.max(0, Math.round(((origVal - priceVal) / origVal) * 100));

    if (mockupTitle) mockupTitle.textContent = nameVal;
    if (mockupOrigin) mockupOrigin.textContent = originVal;
    if (mockupTagline) mockupTagline.textContent = taglineVal;
    if (mockupBadge) mockupBadge.textContent = badgeVal.toUpperCase();
    if (mockupSale) mockupSale.textContent = `₹${priceVal.toLocaleString('en-IN')}`;
    if (mockupOrig) mockupOrig.textContent = origVal > priceVal ? `₹${origVal.toLocaleString('en-IN')}` : '';
    if (mockupDisc) {
      if (discVal > 0) {
        mockupDisc.style.display = 'inline-block';
        mockupDisc.textContent = `-${discVal}%`;
      } else {
        mockupDisc.style.display = 'none';
      }
    }

    if (mockupDisplay) {
      const activeMedia = this.currentMediaList[this.activePreviewMediaIdx] || this.currentMediaList[0];
      if (activeMedia) {
        if (activeMedia.type === 'video') {
          mockupDisplay.innerHTML = `
            <video src="${activeMedia.url}" autoplay loop muted playsinline class="mockup-video-el"></video>
            <span class="preview-video-badge">▶ LIVE VIDEO</span>
          `;
        } else {
          mockupDisplay.innerHTML = `<img src="${activeMedia.url}" alt="${nameVal}" class="mockup-img-el" onerror="this.src='/assets/products/diya_peacock.jpg';" />`;
        }
      } else {
        mockupDisplay.innerHTML = `
          <div class="mockup-placeholder">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span>No Media Uploaded</span>
            <small style="color: #94A3B8; font-size: 11px;">Upload photo, GIF or video above</small>
          </div>
        `;
      }
    }
  }

  // --- PRODUCT EDITOR MODAL ---
  openProductEditor(product) {
    this.editingProduct = product;
    const modal = this.container.querySelector('#product-editor-modal');
    const title = this.container.querySelector('#editor-dialog-title');
    modal.style.display = 'flex';
    modal.scrollTop = 0;

    if (product) {
      title.textContent = `Edit Offering: ${product.name}`;
      this.container.querySelector('#edit-id').value = product.id;
      this.container.querySelector('#edit-name').value = product.name;
      this.container.querySelector('#edit-category').value = product.category;
      if (this.container.querySelector('#edit-festival')) {
        this.container.querySelector('#edit-festival').value = product.festival || 'diwali';
      }
      if (this.container.querySelector('#edit-festival-tag')) {
        this.container.querySelector('#edit-festival-tag').value = product.festivalTag || '';
      }
      this.container.querySelector('#edit-tagline').value = product.tagline || '';
      this.container.querySelector('#edit-price').value = product.priceINR;
      this.container.querySelector('#edit-orig-price').value = product.originalPriceINR || Math.round(product.priceINR * 1.25);
      this.container.querySelector('#edit-discount').value = product.discountPercent || 20;
      this.container.querySelector('#edit-origin').value = product.origin;
      this.container.querySelector('#edit-badge').value = product.badge || 'Festive Special';
      this.container.querySelector('#edit-instock').checked = product.inStock !== false;
      this.container.querySelector('#edit-description').value = product.description || '';
      this.container.querySelector('#edit-stock-qty').value = product.stockQty !== undefined ? product.stockQty : 25;
      this.container.querySelector('#edit-low-stock').value = product.lowStockThreshold || 5;
      this.container.querySelector('#edit-cost-price').value = product.costPriceINR || Math.round(product.priceINR * 0.55);
      this.container.querySelector('#edit-sku').value = product.sku || `UB-${product.category.toUpperCase().slice(0, 4)}-${product.id.replace('ub-', '')}`;
      this.container.querySelector('#edit-hsn').value = product.hsnCode || '7419';

      // Populate media list
      this.currentMediaList = [];
      if (Array.isArray(product.media) && product.media.length > 0) {
        this.currentMediaList = [...product.media];
      } else if (product.imageUrl) {
        const isVid = product.imageUrl.match(/\.(mp4|webm|mov)(\?.*)?$/i);
        const isGif = product.imageUrl.match(/\.gif(\?.*)?$/i);
        this.currentMediaList = [{
          type: isVid ? 'video' : (isGif ? 'gif' : 'image'),
          url: product.imageUrl,
          name: product.name
        }];
      }
      this.activePreviewMediaIdx = 0;
    } else {
      title.textContent = "Add New Festive Offering";
      this.container.querySelector('#product-editor-form').reset();
      this.container.querySelector('#edit-id').value = '';
      if (this.container.querySelector('#edit-festival')) {
        this.container.querySelector('#edit-festival').value = 'diwali';
      }
      if (this.container.querySelector('#edit-festival-tag')) {
        this.container.querySelector('#edit-festival-tag').value = 'Diwali Mahotsav Special';
      }
      this.container.querySelector('#edit-instock').checked = true;
      this.container.querySelector('#edit-price').value = '2499';
      this.container.querySelector('#edit-orig-price').value = '3299';
      this.container.querySelector('#edit-cost-price').value = '1350';
      this.container.querySelector('#edit-stock-qty').value = '25';
      this.container.querySelector('#edit-low-stock').value = '5';
      this.container.querySelector('#edit-sku').value = `UB-HAND-${Date.now().toString().slice(-4)}`;
      this.container.querySelector('#edit-hsn').value = '7419';
      this.container.querySelector('#edit-discount').value = '24';
      this.container.querySelector('#edit-badge').value = 'Royal Selection';
      this.container.querySelector('#edit-origin').value = 'Moradabad, Uttar Pradesh';
      this.container.querySelector('#edit-tagline').value = 'Artisanal handcraft created with timeless legacy';
      this.currentMediaList = [];
      this.activePreviewMediaIdx = 0;
    }

    this.renderMediaStrip();
    this.updateLiveCardPreview();
  }

  closeProductEditor() {
    this.container.querySelector('#product-editor-modal').style.display = 'none';
    this.editingProduct = null;
    this.currentMediaList = [];
    this.activePreviewMediaIdx = 0;
  }

  saveProductFromEditor() {
    const id = this.container.querySelector('#edit-id').value.trim() || `ub-${Date.now().toString().slice(-4)}`;
    const name = this.container.querySelector('#edit-name').value.trim();
    if (!name) {
      alert("Please provide an Offering Name / Title.");
      return;
    }

    const category = this.container.querySelector('#edit-category').value;
    const festival = this.container.querySelector('#edit-festival')?.value || 'diwali';
    const festivalTag = this.container.querySelector('#edit-festival-tag')?.value.trim() || this.formatFestivalName(festival);
    const tagline = this.container.querySelector('#edit-tagline').value.trim();
    const priceINR = parseFloat(this.container.querySelector('#edit-price').value) || 999;
    const origInput = parseFloat(this.container.querySelector('#edit-orig-price').value);
    const originalPriceINR = origInput || Math.round(priceINR * 1.25);
    const discInput = parseFloat(this.container.querySelector('#edit-discount').value);
    const discountPercent = discInput !== undefined && !isNaN(discInput) ? discInput : Math.round(((originalPriceINR - priceINR) / originalPriceINR) * 100);

    const costPriceINR = parseFloat(this.container.querySelector('#edit-cost-price').value) || Math.round(priceINR * 0.55);
    const stockQty = parseInt(this.container.querySelector('#edit-stock-qty').value, 10) || 0;
    const lowStockThreshold = parseInt(this.container.querySelector('#edit-low-stock').value, 10) || 5;
    const sku = this.container.querySelector('#edit-sku').value.trim() || `UB-${category.toUpperCase().slice(0, 4)}-${id}`;
    const hsnCode = this.container.querySelector('#edit-hsn').value.trim() || '7419';

    const origin = this.container.querySelector('#edit-origin').value.trim() || 'Moradabad, India';
    const badge = this.container.querySelector('#edit-badge').value.trim() || 'Festive Special';
    const inStock = this.container.querySelector('#edit-instock').checked && stockQty > 0;
    const description = this.container.querySelector('#edit-description').value.trim() || 'Handcrafted artisanal offering with pure heritage.';

    // Primary image is first image/video in currentMediaList, or fallback
    const primaryMedia = this.currentMediaList[0];
    const imageUrl = primaryMedia ? primaryMedia.url : '/assets/products/diya_peacock.jpg';

    const existing = this.editingProduct || {};

    const productData = {
      ...existing,
      id,
      name,
      category,
      categoryName: productStore.getCategoryDisplayName(category),
      festival,
      festivalTag,
      tagline,
      priceINR,
      originalPriceINR,
      costPriceINR,
      stockQty,
      lowStockThreshold,
      sku,
      hsnCode,
      priceUSD: Math.round(priceINR * 0.012),
      discountPercent,
      origin,
      badge,
      inStock,
      imageUrl,
      media: this.currentMediaList,
      description,
      rating: existing.rating || 5.0,
      reviewsCount: existing.reviewsCount || 1,
      accentColor: existing.accentColor || '#D4AF37',
      svgIcon: existing.svgIcon || (category === 'diyas' ? 'diya' : (category === 'apparel' ? 'apparel' : (category === 'torans' ? 'toran' : 'urli')))
    };

    productStore.saveProduct(productData);
    this.closeProductEditor();
    this.renderProductsTable(this.catalogSearchQuery);
    this.renderOverviewTab();
    alert(`✓ Saved "${name}" under ${festivalTag} (${stockQty} units) to storefront!`);
  }

  // --- 8. YOUPI-PG SOVEREIGN UPI GATEWAY & STAKING ---
  renderPaymentsTab() {
    this.renderPaymentsKPIs();
    this.renderPaymentsStakingBox();
    this.populateYoupiConfigForm();
    this.renderPaymentsTable();
    this.startStakingMonitor();
  }

  startStakingMonitor() {
    if (this.stakingTimerInterval) clearInterval(this.stakingTimerInterval);
    this.stakingTimerInterval = setInterval(() => {
      if (this.activeTab !== 'payments' || !this.isOpen) {
        clearInterval(this.stakingTimerInterval);
        this.stakingTimerInterval = null;
        return;
      }
      this.renderPaymentsStakingBox(true); // pass true for lightweight timer tick
    }, 1000);
  }

  stopStakingMonitor() {
    if (this.stakingTimerInterval) {
      clearInterval(this.stakingTimerInterval);
      this.stakingTimerInterval = null;
    }
  }

  renderPaymentsKPIs() {
    const kpiGrid = this.container.querySelector('#youpi-kpis-grid');
    if (!kpiGrid) return;

    const stats = productStore.getPaymentAnalytics();

    kpiGrid.innerHTML = `
      <div class="kpi-card" style="border-left: 4px solid #FFB703;">
        <div class="kpi-label">TOTAL UPI SETTLED</div>
        <div class="kpi-value">₹${stats.totalSettledAmount.toLocaleString('en-IN')}</div>
        <div class="kpi-subtext" style="color:var(--text-secondary);">${stats.settledCount} Direct Peer Orders Completed</div>
      </div>

      <div class="kpi-card" style="border-left: 4px solid #22C55E;">
        <div class="kpi-label">GATEKEEPER FEES SAVED</div>
        <div class="kpi-value" style="color:#22C55E;">₹${stats.totalFeesSaved.toLocaleString('en-IN')}</div>
        <div class="kpi-subtext" style="color:#22C55E;">🛡️ 100% Retained (0% Aggregator Cut)</div>
      </div>

      <div class="kpi-card" style="border-left: 4px solid #3B82F6;">
        <div class="kpi-label">STAKING SESSIONS</div>
        <div class="kpi-value">${stats.stakedCount > 0 ? `<span style="color:#3B82F6;">${stats.stakedCount} Active</span>` : '0 Active'}</div>
        <div class="kpi-subtext" style="color:var(--text-secondary);">${stats.totalSessions} Total Sessions Initiated</div>
      </div>

      <div class="kpi-card" style="border-left: 4px solid #A855F7;">
        <div class="kpi-label">VERIFICATION RATE</div>
        <div class="kpi-value">${stats.verificationRate}%</div>
        <div class="kpi-subtext" style="color:var(--text-secondary);">Direct Bank UTR Match Accuracy</div>
      </div>
    `;
  }

  renderPaymentsStakingBox(isTickOnly = false) {
    const stakingContainer = this.container.querySelector('#youpi-active-staking-container');
    const pulseBadge = this.container.querySelector('#staking-pulse-badge');
    const pulseLabel = this.container.querySelector('#staking-pulse-label');
    if (!stakingContainer) return;

    const active = productStore.getActiveStakingSession();

    if (!active) {
      if (pulseBadge) pulseBadge.className = 'staking-pulse-badge idle';
      if (pulseLabel) pulseLabel.textContent = 'Gateway Idle (FIFO Ready)';

      if (!isTickOnly) {
        const settings = productStore.getYoupiSettings();
        stakingContainer.innerHTML = `
          <div class="staking-idle-state" style="padding:24px 16px; text-align:center; background:rgba(212,175,55,0.03); border:1px solid var(--border-gold); border-radius:12px;">
            <div style="font-size:2rem; margin-bottom:8px;">🟢</div>
            <h4 style="margin:0 0 6px; font-size:1rem; font-family:'Cinzel', serif;">Single-Slot FIFO Pipeline Idle</h4>
            <p style="margin:0 auto 12px; max-width:440px; font-size:0.8rem; color:var(--text-secondary); line-height:1.4;">
              When a shopper initiates payment on the storefront, their order acquires exclusive possession of the payment window for 5 minutes with a live countdown and automated 12-digit UTR bank matching.
            </p>
            <div style="display:inline-flex; align-items:center; gap:8px; padding:6px 14px; background:rgba(0,0,0,0.12); border-radius:20px; font-size:0.75rem;">
              <span style="color:var(--text-secondary);">Current Receiving VPA:</span>
              <strong style="color:var(--accent-gold); font-family:monospace;">${settings.merchantVpa}</strong>
            </div>
          </div>
        `;
      }
      return;
    }

    // Active session present
    const now = Date.now();
    const createdTime = new Date(active.createdAt).getTime();
    const expiresTime = active.expiresAt ? new Date(active.expiresAt).getTime() : (createdTime + 300000);
    const msRemaining = Math.max(0, expiresTime - now);
    const totalDuration = 300000;
    const progressPercent = Math.min(100, Math.max(0, (msRemaining / totalDuration) * 100));

    const minutes = Math.floor(msRemaining / 60000);
    const seconds = Math.floor((msRemaining % 60000) / 1000);
    const formattedTimer = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (pulseBadge) pulseBadge.className = 'staking-pulse-badge active-staked';
    if (pulseLabel) pulseLabel.textContent = `🔒 Slot Staked: ${active.orderId}`;

    if (isTickOnly) {
      // Just update countdown display and progress bar to prevent DOM thrashing
      const timerDisplay = stakingContainer.querySelector('#staking-live-countdown-text');
      const progressBar = stakingContainer.querySelector('#staking-live-progress-fill');
      if (timerDisplay) timerDisplay.textContent = formattedTimer;
      if (progressBar) progressBar.style.width = `${progressPercent}%`;
      return;
    }

    stakingContainer.innerHTML = `
      <div class="staking-active-slot" style="padding:18px; border:1px solid #FFB703; background:rgba(255, 183, 3, 0.05); border-radius:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
          <div>
            <span style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.8px; color:#FFB703; font-weight:700;">⏱️ Active Staking Session</span>
            <h4 style="margin:2px 0 0; font-size:1.15rem; font-family:monospace; color:var(--text-primary);">${active.orderId}</h4>
          </div>
          <div style="text-align:right;">
            <div style="font-size:1.35rem; font-weight:700; color:#22C55E;">₹${Number(active.amount).toLocaleString('en-IN')}</div>
            <div style="font-size:0.72rem; color:var(--text-secondary);">Zero Platform Fee Cut</div>
          </div>
        </div>

        <div style="margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-secondary); margin-bottom:4px;">
            <span>Exclusive Window Expiry:</span>
            <strong id="staking-live-countdown-text" style="color:#FFB703; font-family:monospace; font-size:0.9rem;">${formattedTimer}</strong>
          </div>
          <div style="height:6px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
            <div id="staking-live-progress-fill" style="height:100%; width:${progressPercent}%; background:linear-gradient(90deg, #22C55E, #FFB703); transition:width 1s linear;"></div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px; font-size:0.78rem; padding:10px; background:rgba(0,0,0,0.1); border-radius:8px; margin-bottom:14px;">
          <div>
            <span style="color:var(--text-secondary);">Customer:</span>
            <div style="font-weight:600;">${active.customerName || 'Online Shopper'}</div>
          </div>
          <div>
            <span style="color:var(--text-secondary);">Phone:</span>
            <div style="font-weight:600;">${active.customerPhone || 'N/A'}</div>
          </div>
          <div>
            <span style="color:var(--text-secondary);">Gateway Mode:</span>
            <div style="font-weight:600; color:var(--accent-gold);">${active.channel || 'Sovereign UPI'}</div>
          </div>
          <div>
            <span style="color:var(--text-secondary);">Status:</span>
            <div style="font-weight:600; color:#FFB703;">${active.status.toUpperCase()}</div>
          </div>
        </div>

        <!-- Manual 1-Click Verification in Staking Box -->
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <input type="text" id="manual-staked-utr-input" class="admin-input" placeholder="Enter 12-digit UTR from SMS..." maxlength="12" style="flex:1; min-width:180px; font-family:monospace; font-size:0.85rem; padding:8px 12px;" />
          <button type="button" class="admin-btn-primary" id="btn-manual-verify-staked" style="padding:8px 16px; font-size:0.82rem;">
            <span>⚡ Verify & Settle Now</span>
          </button>
          <button type="button" class="admin-btn-secondary btn-sm" id="btn-cancel-staked-session" title="Clear staking slot lock" style="padding:8px 12px; font-size:0.82rem;">
            Release Slot
          </button>
        </div>
      </div>
    `;
  }

  populateYoupiConfigForm() {
    const settings = productStore.getYoupiSettings();
    const modeRadio = this.container.querySelector(`input[name="youpi-mode-radio"][value="${settings.mode}"]`);
    if (modeRadio) modeRadio.checked = true;

    const vpaInput = this.container.querySelector('#cfg-youpi-vpa');
    if (vpaInput) vpaInput.value = settings.merchantVpa || settings.upiVpa || '9625351970@axisbank';

    const nameInput = this.container.querySelector('#cfg-youpi-name');
    if (nameInput) nameInput.value = settings.merchantName || 'Utsav Bazaar Crafts';

    const endpointInput = this.container.querySelector('#cfg-youpi-endpoint');
    if (endpointInput) endpointInput.value = settings.endpointUrl || settings.gatewayUrl || 'http://localhost:7000';

    this.updateYoupiModeUI(settings.mode);
  }

  updateYoupiModeUI(mode) {
    const isConnected = mode === 'connected';
    const directBanner = this.container.querySelector('#youpi-direct-mode-banner');
    const endpointGroup = this.container.querySelector('#cfg-youpi-endpoint-group');
    const modePill = this.container.querySelector('#youpi-mode-pill');
    const pingBtn = this.container.querySelector('#btn-test-youpi-ping');

    if (directBanner) directBanner.style.display = isConnected ? 'none' : 'block';
    if (endpointGroup) endpointGroup.style.display = isConnected ? 'block' : 'none';

    if (modePill) {
      if (isConnected) {
        modePill.textContent = '🌐 YouPI Node Active (Port 7000)';
        modePill.style.background = 'rgba(59, 130, 246, 0.15)';
        modePill.style.color = '#60A5FA';
        modePill.style.borderColor = 'rgba(59, 130, 246, 0.3)';
      } else {
        modePill.textContent = '⚡ Direct Bank UPI Active';
        modePill.style.background = 'rgba(34, 197, 94, 0.15)';
        modePill.style.color = '#4ADE80';
        modePill.style.borderColor = 'rgba(34, 197, 94, 0.3)';
      }
    }

    if (pingBtn) {
      pingBtn.textContent = isConnected ? '⚡ Ping Local Node' : '⚡ Test Node Status';
    }
  }

  renderPaymentsTable() {
    const tbody = this.container.querySelector('#youpi-payments-tbody');
    if (!tbody) return;

    let ledger = productStore.getPaymentLedger();

    // 1. Filter by status
    if (this.paymentFilter === 'completed') {
      ledger = ledger.filter(p => p.status === 'completed');
    } else if (this.paymentFilter === 'staked') {
      ledger = ledger.filter(p => p.status === 'staked' || p.status === 'pending');
    } else if (this.paymentFilter === 'expired') {
      ledger = ledger.filter(p => p.status === 'expired' || p.status === 'failed');
    }

    // 2. Filter by search query
    if (this.paymentSearchQuery) {
      const q = this.paymentSearchQuery.toLowerCase();
      ledger = ledger.filter(p => {
        return (
          (p.orderId && p.orderId.toLowerCase().includes(q)) ||
          (p.utr && p.utr.toLowerCase().includes(q)) ||
          (p.customerName && p.customerName.toLowerCase().includes(q)) ||
          (p.customerPhone && p.customerPhone.toLowerCase().includes(q)) ||
          (p.merchantVpa && p.merchantVpa.toLowerCase().includes(q))
        );
      });
    }

    if (!ledger.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:36px 16px; color:var(--text-secondary);">
            <div style="font-size:1.8rem; margin-bottom:6px;">📜</div>
            <div>No UPI payment transactions found matching filter "<strong>${this.paymentFilter}</strong>".</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = ledger.map(p => {
      const formattedDate = new Date(p.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      let statusBadge = '';
      if (p.status === 'completed') {
        statusBadge = '<span class="status-badge status-delivered" style="background:rgba(34,197,94,0.15); color:#22C55E; border:1px solid rgba(34,197,94,0.3);">✓ Settled</span>';
      } else if (p.status === 'staked' || p.status === 'pending') {
        statusBadge = '<span class="status-badge status-processing" style="background:rgba(255,183,3,0.15); color:#FFB703; border:1px solid rgba(255,183,3,0.3);">⏱️ Staked</span>';
      } else {
        statusBadge = '<span class="status-badge status-cancelled" style="background:rgba(239,68,68,0.15); color:#EF4444; border:1px solid rgba(239,68,68,0.3);">⚠️ Expired</span>';
      }

      const utrContent = p.utr ? `
        <div style="display:flex; align-items:center; gap:6px;">
          <code style="font-family:monospace; background:rgba(0,0,0,0.15); padding:2px 6px; border-radius:4px; font-size:0.8rem; color:var(--accent-gold);">${p.utr}</code>
          <button type="button" class="admin-btn-secondary btn-xs" data-copy-utr="${p.utr}" title="Copy 12-digit UTR" style="padding:2px 6px; font-size:0.75rem;">📋</button>
        </div>
      ` : `<span style="color:var(--text-secondary); font-size:0.75rem; font-style:italic;">Awaiting Customer UTR</span>`;

      const actionBtn = p.status !== 'completed' ? `
        <button type="button" class="admin-btn-secondary btn-xs" data-verify-payment-id="${p.paymentId || p.orderId}" style="color:#22C55E; border-color:rgba(34,197,94,0.4); padding:4px 8px; font-size:0.75rem;">
          ✓ Approve
        </button>
      ` : `<span style="color:var(--text-secondary); font-size:0.75rem;">✓ Direct Bank Credit</span>`;

      return `
        <tr>
          <td>
            <strong style="font-family:monospace; color:var(--text-primary);">${p.orderId}</strong>
            <div style="font-size:0.72rem; color:var(--text-secondary); margin-top:2px;">${formattedDate}</div>
          </td>
          <td>
            <div style="font-weight:600; color:var(--text-primary);">${p.customerName || 'Shopper'}</div>
            <div style="font-size:0.72rem; color:var(--text-secondary);">${p.customerPhone || 'N/A'}</div>
          </td>
          <td>
            <strong style="font-size:0.95rem; color:var(--text-primary);">₹${Number(p.amount).toLocaleString('en-IN')}</strong>
          </td>
          <td>
            <span style="color:#22C55E; font-weight:600; font-size:0.85rem;">+₹${Number(p.feeSavings).toLocaleString('en-IN')}</span>
            <div style="font-size:0.68rem; color:var(--text-secondary);">2.95% saved</div>
          </td>
          <td>${utrContent}</td>
          <td>
            <span class="channel-badge" style="display:inline-block; padding:2px 8px; border-radius:12px; font-size:0.72rem; background:rgba(212,175,55,0.1); color:var(--accent-gold); border:1px solid rgba(212,175,55,0.25);">
              ${p.channel || 'YouPI Gateway'}
            </span>
          </td>
          <td>${statusBadge}</td>
          <td>${actionBtn}</td>
        </tr>
      `;
    }).join('');
  }

  handleManualUtrVerify(paymentId) {
    const defaultUtr = '2026' + Math.floor(10000000 + Math.random() * 90000000);
    const utr = prompt(`Enter 12-digit bank UTR / Ref for payment ${paymentId}:`, defaultUtr);
    if (!utr) return;

    if (!/^\d{12}$/.test(utr.trim())) {
      alert("UTR must be exactly 12 numeric digits.");
      return;
    }

    const res = productStore.manualVerifyPayment(paymentId, utr.trim());
    if (res.success) {
      this.renderPaymentsTab();
      alert(`✓ Payment ${paymentId} verified and settled with UTR ${utr.trim()}! Order status updated to Processing.`);
    } else {
      alert(`Could not verify payment: ${res.error}`);
    }
  }

  async testYoupiConnection() {
    const settings = productStore.getYoupiSettings();
    const cleanUrl = (settings.endpointUrl || settings.gatewayUrl || 'http://localhost:7000').replace(/\/+$/, '');

    const pingBtn = this.container.querySelector('#btn-test-youpi-ping');
    if (pingBtn) {
      pingBtn.disabled = true;
      pingBtn.textContent = 'Pinging...';
    }

    try {
      const probePaths = ['/status', '/health', '/'];
      let reached = false;
      let data = null;
      let okStatus = 0;

      for (const p of probePaths) {
        try {
          const res = await fetch(`${cleanUrl}${p}`, { method: 'GET', mode: 'cors' });
          if (res && res.ok) {
            reached = true;
            okStatus = res.status;
            try { data = await res.json(); } catch {}
            break;
          }
        } catch (e) {
          // Probe next fallback path
        }
      }

      if (reached) {
        const node = data?.node || 'YouPI-PG Gateway Node';
        const service = data?.service || 'checkout-portal';
        const ver = data?.version || '1.0.0';
        const upMsg = data?.message || 'Sovereign gateway daemon is responding properly.';

        alert(`🟢 YouPI-PG Node Online & Verified! (HTTP ${okStatus})\n\n` +
          `• Endpoint: ${cleanUrl}\n` +
          `• Service: ${node} (${service} v${ver})\n` +
          `• Active Ports: 7000 (Checkout Portal) & 6100 (Core Payment API)\n` +
          `• Observation Engines: SMS Observer (:6002) & Gmail Observer (:6003)\n` +
          `• Message: ${upMsg}\n\n` +
          `${settings.mode === 'sandbox' ? '💡 Tip: Your store is currently in Safe Sandbox mode. Select "Connected Node" above and click "Save Merchant Sovereign Settings" to route all checkout transactions directly through this node!' : '✅ Connected Node mode is active! All storefront UPI payments and auto-credit verifications will route through this node.'}`);
      } else {
        alert(`⚠️ Could not reach YouPI-PG daemon at ${cleanUrl}.\n\n` +
          `Ensure the background server is running:\n` +
          `  1. Open terminal in the YouPI repository\n` +
          `  2. Run: node scripts/dev.js\n\n` +
          `Tip: Safe Sandbox mode is active and works 100% in-browser with zero external server required!`);
      }
    } catch (err) {
      alert(`⚠️ Connection Error: ${err.message}\nEnsure local node server is running on ${cleanUrl}`);
    } finally {
      if (pingBtn) {
        pingBtn.disabled = false;
        pingBtn.textContent = '⚡ Ping Node';
      }
    }
  }

  exportPaymentsCSV() {
    const csvContent = productStore.exportPaymentsToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utsav_bazaar_payments_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

