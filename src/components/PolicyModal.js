// Modal Dialog for Customer Care, Support & Sacred Legal Policies
export class PolicyModal {
  constructor() {
    this.container = null;
    this.activePolicy = null;
    this.policies = {
      dispatch: {
        title: "⚡ Express 24–48h Festive Dispatch",
        subtitle: "Auspicious Express Transit Across Bharat",
        icon: "⚡",
        content: `
          <h4>1. Priority Courier Logistics</h4>
          <p>Every festive order placed on Utsav Bazaar is prioritized with our Tier-1 logistics partners (Bluedart Apex, Delhivery Express, and India Post Speed Post). Orders placed before 4:00 PM IST are sanctified, packaged, and dispatched within 24 hours.</p>
          
          <h4>2. Insured Safe Transit</h4>
          <p>All solid brass deepams, urlis, and silk heirlooms are wrapped in tamper-proof bubble armor and double-wall corrugated crates lined with sacred festive butter paper to prevent tarnishing and transit pressure.</p>

          <h4>3. Live SMS & WhatsApp Courier Tracking</h4>
          <p>Upon dispatch, you will immediately receive your official AWB tracking identifier via SMS and WhatsApp. You can track your parcel in real-time until it arrives at your courtyard door.</p>
        `
      },
      returns: {
        title: "🛡️ Courtyard Inspection & Sacred Exchange Policy",
        subtitle: "Zero-Risk Courtyard Verification for Every Customer",
        icon: "🛡️",
        content: `
          <h4>1. Open-Box Courtyard Inspection</h4>
          <p>We invite you to inspect your consecrated brassware and apparel in the presence of the delivery courier. If the artifact has any manufacturing defect or transit hairline crack, you may reject it on the spot with zero questions asked.</p>
          
          <h4>2. 7-Day Sanctified Replacement Guarantee</h4>
          <p>In the rare event of transit damage or missing puja accessories, notify us within 7 days of delivery. We will immediately dispatch a replacement artifact directly from our Jaipur / Moradabad artisan guilds free of charge.</p>

          <h4>3. 100% Refund Assurance</h4>
          <p>If a replacement artifact is unavailable due to limited-edition artisanal stock, the full order amount will be refunded directly to your original payment method (UPI / Card / Net Banking) within 48 banking hours.</p>
        `
      },
      bulk: {
        title: "🎁 Corporate & Festive Bulk Gifting Suite",
        subtitle: "Bespoke Royal Packaging & Volume Pricing for Diwali 2026",
        icon: "🎁",
        content: `
          <h4>1. Custom Brand & Family Engraving</h4>
          <p>We provide custom laser engraving of corporate emblems, family crests, and auspicious Sanskrit shlokas on virgin solid brass urlis, lamps, and dry fruit chests for orders exceeding 25 units.</p>
          
          <h4>2. Dedicated Gifting Concierge</h4>
          <p>Work directly with our Artisan Guild Concierge for multi-address dispatch across India and overseas. We handle individual custom gift notes, premium velvet gift boxing, and coordinated festive delivery schedules.</p>

          <h4>3. Tiered Festive Corporate Discounts</h4>
          <p>Enjoy wholesale direct artisan margins with certified 18% GST tax invoices:
            <br>• <strong>25–50 Units:</strong> 15% Volume Blessing
            <br>• <strong>51–200 Units:</strong> 22% Volume Blessing
            <br>• <strong>200+ Units:</strong> 28% Bespoke Guild Production Pricing
          </p>
          <p>Contact our gifting desk at <strong>support@utsavbazaar.in</strong> or call <strong>+91 800 266 7822</strong>.</p>
        `
      },
      terms: {
        title: "Terms & Auspicious Service Agreement",
        subtitle: "Fair-Trade Artisanal Commerce Code of Conduct",
        icon: "📜",
        content: `
          <h4>1. Authentic Generational Handcraft</h4>
          <p>All artifacts presented on Utsav Bazaar are individually sculpted, cast, woven, or embroidered by master artisans across Moradabad, Varanasi, Jaipur, and Thanjavur. Minor artisanal nuances in patina or weave are hallmarks of genuine handmade devotion, not defects.</p>
          
          <h4>2. Consecrated & Tarnish-Resistant Coating</h4>
          <p>Our brassware is treated with food-safe organic lacquer to preserve its golden mirror lustre. Please clean only with soft dry microfiber or warm mild soap water; avoid abrasive industrial chemicals.</p>

          <h4>3. Sacred Rights & Intellectual Heritage</h4>
          <p>All GI-tagged craft designations, photographic assets, and traditional designs are protected under Indian Geographical Indications and Copyright Acts to support our 2,400+ generational artisan families.</p>
        `
      },
      privacy: {
        title: "Privacy & Data Sanctuary Charter",
        subtitle: "Your Sacred Data Remains 100% Private and Encrypted",
        icon: "🔒",
        content: `
          <h4>1. Zero Third-Party Advertising Data Sharing</h4>
          <p>We strictly never sell, rent, or trade your name, phone number, physical address, or purchase history to third-party ad networks or brokers. Your details are used strictly to fulfill your auspicious festival delivery.</p>
          
          <h4>2. 256-Bit Financial Encryption</h4>
          <p>All payments are processed through RBI-authorized payment gateways featuring PCI-DSS Level 1 256-bit SSL encryption. Utsav Bazaar never stores raw debit/credit card numbers or UPI PINs.</p>

          <h4>3. One-Click Data Removal</h4>
          <p>You have the absolute right to request complete erasure of your courtyard delivery history and profile records from our databases at any time by messaging support@utsavbazaar.in.</p>
        `
      },
      gst: {
        title: "Transparent All-Inclusive Pricing & Zero Extra Taxes",
        subtitle: "100% Direct Artisan Pricing — No GST, No Hidden Charges",
        icon: "✨",
        content: `
          <h4>1. Pure Final Rate — No GST Charged</h4>
          <p>Utsav Bazaar operates directly as an artisanal collective guild. We do not burden customers with 18% GST (CGST/SGST) or unexpected cess. The price you see on every artifact is the 100% final, all-inclusive price.</p>
          
          <h4>2. Complete Breakdown Transparency (₹0 Extra)</h4>
          <p>Every order invoice clearly highlights your savings: CGST is ₹0.00, SGST is ₹0.00, auspicious packaging is ₹0.00 (Complimentary), and insured express courtyard shipping is ₹0.00 (Free). You never pay a single rupee extra above the listed artisan rate.</p>

          <h4>3. 100% Value Directly to Artisans</h4>
          <p>Every rupee paid goes straight to supporting generational brass crafters, weavers, and zardozi artists in Moradabad, Varanasi, and Jaipur rather than corporate overheads or multiple tax tiers.</p>
        `
      },
      fairtrade: {
        title: "Direct Artisan Fair-Trade Charter",
        subtitle: "Empowering 2,400+ Generational Indian Craftspersons",
        icon: "🤝",
        content: `
          <h4>1. Direct Craftsman Compensation</h4>
          <p>By eliminating greedy middlemen and multi-tier wholesale brokers, Utsav Bazaar channels up to 72% of product value directly into the hands of generational metalsmiths, zardozi masters, and loom weavers.</p>
          
          <h4>2. Preservation of Ancient GI Crafts</h4>
          <p>We actively support endangered Indian craft techniques including Moradabad lost-wax brass casting, Varanasi pit-loom silk weaving, and Thanjavur bell bronze metalwork with fair minimum wages and pension reserves.</p>

          <h4>3. Ethical Workshop Standards</h4>
          <p>Zero child labor, safe ventilation in casting furnaces, natural non-toxic vegetable dyes, and fair, dignified working hours are strictly audited across all participating artisan guild clusters.</p>
        `
      },
      shipping: {
        title: "Safe Transit Insurance & Courtyard Delivery Policy",
        subtitle: "100% Protected Transit From Guild Workshops to Your Shrine",
        icon: "📦",
        content: `
          <h4>1. Total Transit Insurance</h4>
          <p>Every single package is insured at 100% of its commercial value against courier handling transit shock, accidental moisture ingress, or logistical loss from the workshop dispatch bay to your doorstep.</p>
          
          <h4>2. All-India Coverage (19,000+ Pincodes)</h4>
          <p>We deliver to metro cities, tier-2/3 towns, and sacred pilgrimage centers across Bharat with door-to-door tracking and secure OTP delivery confirmation.</p>

          <h4>3. Eco-Friendly Sacred Packaging</h4>
          <p>Our outer cartons are 100% recyclable biodegradable kraft cardboard, paired with natural jute cords and reusable velvet keepsake bags to honor Mother Earth (Bhoomi Devi).</p>
        `
      }
    };

    this.init();
  }

  init() {
    this.container = document.createElement('div');
    this.container.id = 'policy-modal-container';
    this.container.innerHTML = `
      <div class="policy-modal-backdrop" id="policy-backdrop"></div>
      <div class="policy-modal-window" id="policy-window" role="dialog" aria-modal="true">
        <button class="policy-modal-close" id="policy-close-btn" aria-label="Close dialog">✕</button>
        <div class="policy-modal-header">
          <div class="policy-header-badge" id="policy-header-badge">✦ UTSAV BAZAAR CHARTER ✦</div>
          <h2 class="policy-header-title" id="policy-header-title">Policy Title</h2>
          <p class="policy-header-sub" id="policy-header-sub">Policy Subtitle</p>
        </div>
        <div class="policy-modal-body" id="policy-modal-body">
          <!-- Dynamic Content -->
        </div>
        <div class="policy-modal-footer">
          <button class="policy-primary-btn" id="policy-ok-btn">I Understand & Accept</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.container);

    this.bindEvents();
  }

  bindEvents() {
    const backdrop = this.container.querySelector('#policy-backdrop');
    const closeBtn = this.container.querySelector('#policy-close-btn');
    const okBtn = this.container.querySelector('#policy-ok-btn');

    const closeHandler = () => this.close();
    if (backdrop) backdrop.addEventListener('click', closeHandler);
    if (closeBtn) closeBtn.addEventListener('click', closeHandler);
    if (okBtn) okBtn.addEventListener('click', closeHandler);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  open(policyKey) {
    const policy = this.policies[policyKey];
    if (!policy) return;

    this.activePolicy = policyKey;
    const titleEl = this.container.querySelector('#policy-header-title');
    const subEl = this.container.querySelector('#policy-header-sub');
    const bodyEl = this.container.querySelector('#policy-modal-body');

    if (titleEl) titleEl.innerHTML = `${policy.icon} ${policy.title}`;
    if (subEl) subEl.textContent = policy.subtitle;
    if (bodyEl) bodyEl.innerHTML = policy.content;

    const windowEl = this.container.querySelector('#policy-window');
    const backdrop = this.container.querySelector('#policy-backdrop');

    if (windowEl) windowEl.classList.add('visible');
    if (backdrop) backdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  close() {
    const windowEl = this.container.querySelector('#policy-window');
    const backdrop = this.container.querySelector('#policy-backdrop');

    if (windowEl) windowEl.classList.remove('visible');
    if (backdrop) backdrop.classList.remove('visible');
    document.body.style.overflow = '';
  }

  isOpen() {
    const windowEl = this.container.querySelector('#policy-window');
    return windowEl && windowEl.classList.contains('visible');
  }
}
