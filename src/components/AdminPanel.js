// High-End Luxury Merchant Suite & 360° Storefront CMS for Utsav Bazaar
import { productStore } from '../engine/ProductStore.js';

export class AdminPanel {
  constructor(container, onNavigateHome) {
    this.container = container;
    this.onNavigateHome = onNavigateHome || null;
    this.isOpen = false;
    this.isAuthenticated = sessionStorage.getItem('utsav_admin_auth') === 'true';
    this.activeTab = 'overview';
    this.orderFilter = 'all';
    this.orderSearchQuery = '';
    this.editingProduct = null;
    this.currentImageBase64 = '';
    this.currentMediaList = []; // Array of { type: 'image'|'video'|'gif', url: string, name?: string }
    this.activePreviewMediaIdx = 0;

    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="admin-modal-overlay" id="admin-modal-overlay" style="display: none;">
        ${!this.isAuthenticated ? this.renderLoginView() : this.renderDashboardView()}
      </div>

      <!-- ADD / EDIT PRODUCT MODAL (Live Storefront Post Preview + Multi-Media CMS) -->
      <div class="admin-modal-overlay" id="product-editor-modal" style="display: none; z-index: 360;">
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
                    <label>Geographic Origin *</label>
                    <input type="text" id="edit-origin" class="admin-input" placeholder="e.g. Moradabad, Uttar Pradesh" />
                  </div>
                </div>

                <div class="editor-section-title" style="margin-top: 14px;">
                  <span>2. Commercial Pricing (Zero GST • All-Inclusive)</span>
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
                    <label>Discount Badge (%)</label>
                    <input type="number" id="edit-discount" class="admin-input" min="0" max="95" placeholder="24" />
                  </div>
                </div>

                <div class="form-row-2">
                  <div class="form-group">
                    <label>Storefront Badge</label>
                    <input type="text" id="edit-badge" class="admin-input" placeholder="e.g. Best Seller / Royal Selection" />
                  </div>
                  <div class="form-group" style="display: flex; align-items: flex-end; padding-bottom: 8px;">
                    <label class="checkbox-label">
                      <input type="checkbox" id="edit-instock" checked />
                      <span>Available in Stock</span>
                    </label>
                  </div>
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
            <button class="admin-btn-secondary btn-storefront-return" id="btn-admin-return-store" title="Return to Storefront">
              <span>🏠 Return to Storefront</span>
            </button>
            <button class="admin-logout-btn" id="admin-logout-btn" title="Lock & Logout">
              <span>🔒 Logout</span>
            </button>
            <button class="admin-close-btn" id="admin-close-btn" title="Close Admin Console">✕</button>
          </div>
        </div>

        <!-- Live Orders Notification Banner -->
        <div class="admin-toast-banner" id="admin-orders-toast" style="display: none;"></div>

        <!-- Admin Navigation Tabs -->
        <div class="admin-tabs-nav">
          <button class="admin-tab-btn ${this.activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
            <span>📊</span> Overview & KPIs
          </button>
          <button class="admin-tab-btn ${this.activeTab === 'orders' ? 'active' : ''}" data-tab="orders">
            <span>🛍️</span> Live Orders & Customers
          </button>
          <button class="admin-tab-btn ${this.activeTab === 'products' ? 'active' : ''}" data-tab="products">
            <span>📦</span> Products & Pricing
          </button>
          <button class="admin-tab-btn ${this.activeTab === 'discounts' ? 'active' : ''}" data-tab="discounts">
            <span>🏷️</span> Festive Discount Bar
          </button>
          <button class="admin-tab-btn ${this.activeTab === 'gsheet' ? 'active' : ''}" data-tab="gsheet">
            <span>📈</span> Google Sheets Sync
          </button>
          <button class="admin-tab-btn ${this.activeTab === 'reviews' ? 'active' : ''}" data-tab="reviews">
            <span>🌟</span> Customer Reviews
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

          <!-- TAB 2: LIVE ORDERS & CUSTOMER DIRECTORY -->
          <div class="admin-tab-pane" id="tab-pane-orders" style="${this.activeTab === 'orders' ? 'display:block;' : 'display:none;'}">
            <div class="pane-action-bar">
              <!-- Status Filter Buttons -->
              <div class="orders-filter-group" id="orders-filter-buttons">
                <button class="filter-chip active" data-filter="all">All Orders</button>
                <button class="filter-chip" data-filter="Processing">🟡 Processing</button>
                <button class="filter-chip" data-filter="Dispatched">🔵 Dispatched</button>
                <button class="filter-chip" data-filter="Out for Delivery">🟣 Out for Delivery</button>
                <button class="filter-chip" data-filter="Delivered">🟢 Delivered</button>
              </div>

              <!-- Live Search & CSV Export -->
              <div class="pane-btn-group">
                <input type="text" id="admin-orders-search" placeholder="Search by ID, Customer Name, Email, City..." class="admin-input-sm" style="width: 260px;" />
                <button class="admin-btn-secondary" id="btn-export-orders-csv">
                  <span>📥 Export CSV</span>
                </button>
              </div>
            </div>

            <!-- Orders & Customers Master Table -->
            <div class="admin-table-wrapper">
              <table class="admin-data-table">
                <thead>
                  <tr>
                    <th style="width: 140px;">Order ID & Date</th>
                    <th>Customer & Shipping Address</th>
                    <th>Ordered Offerings</th>
                    <th>Total & Payment</th>
                    <th style="width: 170px;">Live Status Selector</th>
                    <th style="width: 140px;">Tracking & Notification</th>
                    <th style="text-align: right; width: 60px;">Action</th>
                  </tr>
                </thead>
                <tbody id="admin-orders-table-body">
                  <!-- Populated dynamically -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- TAB 3: PRODUCTS & PRICING -->
          <div class="admin-tab-pane" id="tab-pane-products" style="${this.activeTab === 'products' ? 'display:block;' : 'display:none;'}">
            <div class="pane-action-bar">
              <div class="pane-search-box">
                <input type="text" id="admin-product-search" placeholder="Search by name, category, origin..." class="admin-input-sm" />
              </div>
              <div class="pane-btn-group">
                <button class="admin-btn-secondary" id="btn-reset-default-catalog">↺ Reset to Default Offerings</button>
                <button class="admin-btn-primary" id="btn-open-add-product">
                  <span>➕ Add New Festive Offering</span>
                </button>
              </div>
            </div>

            <!-- Product Inventory Table -->
            <div class="admin-table-wrapper">
              <table class="admin-data-table">
                <thead>
                  <tr>
                    <th style="width: 70px;">Visual</th>
                    <th>Product Title & Origin</th>
                    <th>Category</th>
                    <th>Marked Price</th>
                    <th>Sale Price</th>
                    <th>Discount</th>
                    <th>Stock</th>
                    <th style="text-align: right;">Actions</th>
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

          <!-- TAB 5: GOOGLE SHEETS & EXCEL SYNC -->
          <div class="admin-tab-pane" id="tab-pane-gsheet" style="${this.activeTab === 'gsheet' ? 'display:block;' : 'display:none;'}">
            <div class="gsheet-sync-grid">
              <div class="admin-card">
                <div class="card-head">
                  <span class="c-icon">📊</span>
                  <h3>Live Google Sheets Synchronization</h3>
                </div>
                <p class="c-desc">
                  Connect any Google Sheet published as a CSV. Every time you update prices, stock, or discounts in your sheet, click "Sync Now" to instantly update the website.
                </p>

                <div class="form-group" style="margin-top: 18px;">
                  <label>Google Sheet Published CSV URL</label>
                  <input type="url" id="gsheet-url-input" class="admin-input" placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv" />
                </div>

                <div class="gsheet-actions-row">
                  <button class="admin-btn-primary" id="btn-sync-gsheet">
                    <span>⚡ Fetch & Sync Live from Google Sheet</span>
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
              <div class="admin-card">
                <div class="card-head">
                  <span class="c-icon">✍️</span>
                  <h3>Add Real Customer Review / Testimonial</h3>
                </div>
                <p class="c-desc">Post verified customer blessings, feedback, and star ratings directly to any product Quick View modal.</p>

                <div class="form-group" style="margin-top: 16px;">
                  <label>Select Product</label>
                  <select id="review-product-select" class="admin-select"></select>
                </div>

                <div class="form-row-2">
                  <div class="form-group">
                    <label>Customer Name</label>
                    <input type="text" id="rev-customer-name" class="admin-input" placeholder="e.g. Meera Singhal" />
                  </div>
                  <div class="form-group">
                    <label>Star Rating (1 to 5)</label>
                    <select id="rev-rating-val" class="admin-select">
                      <option value="5">★★★★★ (5 Stars)</option>
                      <option value="4">★★★★☆ (4 Stars)</option>
                      <option value="3">★★★☆☆ (3 Stars)</option>
                      <option value="2">★★☆☆☆ (2 Stars)</option>
                      <option value="1">★☆☆☆☆ (1 Star)</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label>Review Commentary / Blessing</label>
                  <textarea id="rev-comment-text" class="admin-textarea" rows="3" placeholder="Share how this handcrafted brass diya, urli, or toran blessed their home..."></textarea>
                </div>

                <button class="admin-btn-primary" id="btn-submit-review">
                  <span>Publish Customer Review</span>
                </button>
              </div>

              <div class="admin-card">
                <div class="card-head">
                  <span class="c-icon">🌟</span>
                  <h3>Existing Reviews on Selected Product</h3>
                </div>
                <div class="admin-reviews-list" id="admin-reviews-container">
                  <!-- Populated dynamically -->
                </div>
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
    const filterChips = this.container.querySelectorAll('.orders-filter-group .filter-chip');
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

    // Orders Table Status Change delegation
    const ordersTable = this.container.querySelector('#admin-orders-table-body');
    if (ordersTable) {
      ordersTable.addEventListener('change', (e) => {
        const select = e.target.closest('.admin-order-status-select');
        if (select) {
          const ordId = select.getAttribute('data-order-id');
          const newStatus = select.value;
          this.handleOrderStatusChange(ordId, newStatus, select);
        }
      });

      ordersTable.addEventListener('click', (e) => {
        const delBtn = e.target.closest('[data-delete-order-id]');
        if (delBtn) {
          const ordId = delBtn.getAttribute('data-delete-order-id');
          if (confirm(`Remove Order ${ordId} from merchant records?`)) {
            productStore.deleteOrder(ordId);
            this.renderOverviewTab();
            this.renderOrdersTable();
          }
        }
      });
    }

    // Product Search
    const prodSearch = this.container.querySelector('#admin-product-search');
    if (prodSearch) {
      prodSearch.addEventListener('input', (e) => {
        this.renderProductsTable(e.target.value.toLowerCase().trim());
      });
    }

    // Reset Catalog
    const resetCatalogBtn = this.container.querySelector('#btn-reset-default-catalog');
    if (resetCatalogBtn) {
      resetCatalogBtn.addEventListener('click', () => {
        if (confirm("Reset catalog back to initial offerings and pricing?")) {
          productStore.resetToDefault();
          this.renderProductsTable();
          this.renderOverviewTab();
          alert("Catalog restored to blessed defaults!");
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

    // Customer Reviews Tab
    const reviewSelect = this.container.querySelector('#review-product-select');
    if (reviewSelect) {
      reviewSelect.addEventListener('change', (e) => {
        this.renderReviewsForProduct(e.target.value);
      });
    }

    const submitReviewBtn = this.container.querySelector('#btn-submit-review');
    if (submitReviewBtn) {
      submitReviewBtn.addEventListener('click', () => {
        const prodId = this.container.querySelector('#review-product-select').value;
        const name = this.container.querySelector('#rev-customer-name').value.trim() || 'Auspicious Buyer';
        const rating = this.container.querySelector('#rev-rating-val').value;
        const comment = this.container.querySelector('#rev-comment-text').value.trim();

        if (!comment) {
          alert("Please write a short review commentary.");
          return;
        }

        productStore.addReview(prodId, { name, rating, comment });
        this.container.querySelector('#rev-comment-text').value = '';
        this.renderReviewsForProduct(prodId);
        alert("✓ Customer review published live!");
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
    if (tab === 'products') this.renderProductsTable();
    if (tab === 'discounts') this.populateDiscountSettings();
    if (tab === 'gsheet') this.populateGsheetSettings();
    if (tab === 'reviews') this.populateReviewsTab();
  }

  populateInitialData() {
    this.renderOverviewTab();
    this.renderOrdersTable();
    this.renderProductsTable();
    this.populateDiscountSettings();
    this.populateGsheetSettings();
    this.populateReviewsTab();
  }

  // --- 1. OVERVIEW & KPIS TAB ---
  renderOverviewTab() {
    const kpiContainer = this.container.querySelector('#admin-kpi-container');
    const recentOrdersTbody = this.container.querySelector('#overview-recent-orders-tbody');
    if (!kpiContainer) return;

    const stats = productStore.getDashboardStats();
    const formattedRevenue = `₹${stats.totalRevenue.toLocaleString('en-IN')}`;
    const formattedAOV = `₹${stats.avgOrderValue.toLocaleString('en-IN')}`;

    kpiContainer.innerHTML = `
      <div class="kpi-card glow-gold">
        <div class="kpi-header">
          <span class="kpi-label">GROSS STORE REVENUE</span>
          <span class="kpi-icon">💰</span>
        </div>
        <div class="kpi-value">${formattedRevenue}</div>
        <div class="kpi-meta">
          <span class="kpi-pill success">↑ +24.8% Festive Spike</span>
          <span class="kpi-subtext">Across ${stats.totalOrders} total orders</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">TOTAL ORDERS PLACED</span>
          <span class="kpi-icon">🛍️</span>
        </div>
        <div class="kpi-value">${stats.totalOrders}</div>
        <div class="kpi-meta">
          <span class="kpi-pill warning">${stats.processingCount} Awaiting Dispatch</span>
          <span class="kpi-subtext">Real-time captured</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">AVG. ORDER VALUE (AOV)</span>
          <span class="kpi-icon">🏷️</span>
        </div>
        <div class="kpi-value">${formattedAOV}</div>
        <div class="kpi-meta">
          <span class="kpi-pill info">High-Ticket Heirlooms</span>
          <span class="kpi-subtext">Solid Brass & Silk Carts</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-label">FULFILLMENT DISPATCH</span>
          <span class="kpi-icon">🚚</span>
        </div>
        <div class="kpi-value">${stats.deliveredCount} / ${stats.totalOrders}</div>
        <div class="kpi-meta">
          <span class="kpi-pill success">● ${stats.dispatchedCount + stats.outForDeliveryCount} In-Transit</span>
          <span class="kpi-subtext">Live SMS / Email Updates</span>
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
  renderOrdersTable() {
    const tbody = this.container.querySelector('#admin-orders-table-body');
    if (!tbody) return;

    let orders = productStore.getOrders();

    // 1. Filter by status
    if (this.orderFilter !== 'all') {
      orders = orders.filter(o => o.orderStatus === this.orderFilter);
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
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:36px; color:#94A3B8;">No orders match the selected filter or search query.</td></tr>`;
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
          </td>
          <td>
            <div class="status-selector-wrap">
              <select class="admin-order-status-select select-${this.getStatusSlug(o.orderStatus)}" data-order-id="${o.id}">
                <option value="Processing" ${o.orderStatus === 'Processing' ? 'selected' : ''}>🟡 Processing</option>
                <option value="Dispatched" ${o.orderStatus === 'Dispatched' ? 'selected' : ''}>🔵 Dispatched</option>
                <option value="Out for Delivery" ${o.orderStatus === 'Out for Delivery' ? 'selected' : ''}>🟣 Out for Delivery</option>
                <option value="Delivered" ${o.orderStatus === 'Delivered' ? 'selected' : ''}>🟢 Delivered</option>
              </select>
            </div>
          </td>
          <td>
            <div class="tracking-pill">${o.trackingNumber || 'UB-TRK-771822'}</div>
            <div class="email-alert-indicator">
              <span class="pulse-dot">●</span> Auto Email Active
            </div>
          </td>
          <td style="text-align: right;">
            <button class="tbl-action-btn danger" data-delete-order-id="${o.id}" title="Remove Order">🗑️</button>
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

      // Refresh overview stats
      this.renderOverviewTab();
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
      case 'Processing': return 'badge-processing';
      case 'Dispatched': return 'badge-dispatched';
      case 'Out for Delivery': return 'badge-out-for-delivery';
      case 'Delivered': return 'badge-delivered';
      default: return 'badge-processing';
    }
  }

  getStatusSlug(status) {
    return (status || 'processing').toLowerCase().replace(/\s+/g, '-');
  }

  // --- 3. PRODUCTS TAB ---
  renderProductsTable(query = '') {
    const tbody = this.container.querySelector('#admin-products-table-body');
    if (!tbody) return;

    let prods = productStore.getProducts();
    if (query) {
      prods = prods.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.origin.toLowerCase().includes(query)
      );
    }

    if (prods.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:#94A3B8;">No offerings match your search.</td></tr>`;
      return;
    }

    tbody.innerHTML = prods.map(p => {
      const orig = p.originalPriceINR ? `₹${p.originalPriceINR.toLocaleString('en-IN')}` : '—';
      const sale = `₹${p.priceINR.toLocaleString('en-IN')}`;
      const disc = p.discountPercent ? `-${p.discountPercent}%` : '0%';
      const stockBadge = p.inStock
        ? `<span class="stock-pill in-stock" data-toggle-stock-id="${p.id}" title="Click to toggle">In Stock</span>`
        : `<span class="stock-pill out-stock" data-toggle-stock-id="${p.id}" title="Click to toggle">Sold Out</span>`;

      const visual = p.imageUrl
        ? `<img src="${p.imageUrl}" class="table-thumb-img" alt="${p.name}" />`
        : `<div class="table-thumb-svg">🪔</div>`;

      return `
        <tr>
          <td>${visual}</td>
          <td>
            <div class="row-product-name">${p.name}</div>
            <div class="row-product-origin">${p.origin}</div>
          </td>
          <td><span class="category-tag-pill">${p.category}</span></td>
          <td><span class="price-strikethrough-sm">${orig}</span></td>
          <td><span class="price-sale-highlight">${sale}</span></td>
          <td><span class="discount-badge-table">${disc}</span></td>
          <td>${stockBadge}</td>
          <td style="text-align: right;">
            <button class="tbl-action-btn" data-edit-id="${p.id}" title="Edit Offering">✏️</button>
            <button class="tbl-action-btn danger" data-delete-id="${p.id}" title="Delete Offering">🗑️</button>
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

  // --- 5. GOOGLE SHEETS TAB ---
  populateGsheetSettings() {
    const urlInput = this.container.querySelector('#gsheet-url-input');
    if (urlInput) urlInput.value = productStore.googleSheetUrl || '';
  }

  // --- 6. REVIEWS TAB ---
  populateReviewsTab() {
    const select = this.container.querySelector('#review-product-select');
    if (!select) return;

    const prods = productStore.getProducts();
    select.innerHTML = prods.map(p => `
      <option value="${p.id}">${p.name} (${p.categoryName || p.category})</option>
    `).join('');

    if (prods.length > 0) {
      this.renderReviewsForProduct(prods[0].id);
    }
  }

  renderReviewsForProduct(productId) {
    const container = this.container.querySelector('#admin-reviews-container');
    if (!container) return;

    const reviews = productStore.getProductReviews(productId);
    if (reviews.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: #94A3B8; padding: 24px;">No customer reviews yet on this offering.</div>`;
      return;
    }

    container.innerHTML = reviews.map(r => `
      <div class="admin-review-card">
        <div class="rev-card-head">
          <strong class="rev-author">${r.name}</strong>
          <span class="rev-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
          <span class="rev-date">${r.date}</span>
        </div>
        <p class="rev-comment">"${r.comment}"</p>
      </div>
    `).join('');
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

    if (product) {
      title.textContent = `Edit Offering: ${product.name}`;
      this.container.querySelector('#edit-id').value = product.id;
      this.container.querySelector('#edit-name').value = product.name;
      this.container.querySelector('#edit-category').value = product.category;
      this.container.querySelector('#edit-tagline').value = product.tagline || '';
      this.container.querySelector('#edit-price').value = product.priceINR;
      this.container.querySelector('#edit-orig-price').value = product.originalPriceINR || Math.round(product.priceINR * 1.25);
      this.container.querySelector('#edit-discount').value = product.discountPercent || 20;
      this.container.querySelector('#edit-origin').value = product.origin;
      this.container.querySelector('#edit-badge').value = product.badge || 'Festive Special';
      this.container.querySelector('#edit-instock').checked = product.inStock !== false;
      this.container.querySelector('#edit-description').value = product.description || '';

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
      this.container.querySelector('#edit-instock').checked = true;
      this.container.querySelector('#edit-price').value = '2499';
      this.container.querySelector('#edit-orig-price').value = '3299';
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
    const tagline = this.container.querySelector('#edit-tagline').value.trim();
    const priceINR = parseFloat(this.container.querySelector('#edit-price').value) || 999;
    const origInput = parseFloat(this.container.querySelector('#edit-orig-price').value);
    const originalPriceINR = origInput || Math.round(priceINR * 1.25);
    const discInput = parseFloat(this.container.querySelector('#edit-discount').value);
    const discountPercent = discInput !== undefined && !isNaN(discInput) ? discInput : Math.round(((originalPriceINR - priceINR) / originalPriceINR) * 100);

    const origin = this.container.querySelector('#edit-origin').value.trim() || 'Moradabad, India';
    const badge = this.container.querySelector('#edit-badge').value.trim() || 'Festive Special';
    const inStock = this.container.querySelector('#edit-instock').checked;
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
      tagline,
      priceINR,
      originalPriceINR,
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
    this.renderProductsTable();
    this.renderOverviewTab();
    alert(`✓ Saved "${name}" to storefront!`);
  }
}

