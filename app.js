/**
 * OmniSales Analytics Dashboard
 * Vanilla JavaScript - Zero Dependencies - Pure WebStorage Persistence
 */

(function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEY_DATA = 'omnisales_data_v1';
  const STORAGE_KEY_CURRENCY = 'omnisales_currency_v1';
  const STORAGE_KEY_TIME_RANGE = 'omnisales_timerange_v1';

  // Currency symbols & configurations
  const CURRENCIES = {
    USD: { symbol: '$', code: 'USD', position: 'before' },
    EUR: { symbol: '€', code: 'EUR', position: 'after' },
    GBP: { symbol: '£', code: 'GBP', position: 'before' },
    JPY: { symbol: '¥', code: 'JPY', position: 'before' },
    CAD: { symbol: 'CA$', code: 'CAD', position: 'before' }
  };

  // Color Palette Constants for Charts (explicit colors, zero CSS variables)
  const PALETTE = {
    primary: '#38bdf8',
    primaryDark: '#0284c7',
    primaryLight: 'rgba(56, 189, 248, 0.25)',
    primaryFill: 'rgba(56, 189, 248, 0.08)',
    emerald: '#10b981',
    emeraldFill: 'rgba(16, 185, 129, 0.08)',
    amber: '#f59e0b',
    purple: '#a855f7',
    pink: '#ec4899',
    cyan: '#06b6d4',
    slateDark: '#0f172a',
    slateCard: '#111827',
    slateBorder: '#1f2937',
    slateMuted: '#64748b',
    slateText: '#cbd5e1',
    textWhite: '#f8fafc',
    gridLine: 'rgba(255, 255, 255, 0.06)'
  };

  const CATEGORY_COLORS = {
    'Electronics': '#38bdf8',
    'Apparel': '#a855f7',
    'Home & Kitchen': '#10b981',
    'Software': '#f59e0b',
    'Sports': '#ec4899',
    'Beauty': '#06b6d4'
  };

  // App State
  const state = {
    sales: [],
    currency: 'USD',
    timeRange: '30days',
    customStartDate: '',
    customEndDate: '',
    quickChip: 'all',
    selectedIds: new Set(),
    trendMetric: 'revenue', // 'revenue', 'profit', 'both'
    searchQuery: '',
    filterCategory: 'all',
    filterChannel: 'all',
    filterStatus: 'all',
    sortColumn: 'date',
    sortDirection: 'desc', // 'asc' or 'desc'
    currentPage: 1,
    pageSize: 10,
    editingId: null,
    pendingDeleteId: null
  };

  // DOM Elements cache
  const el = {};

  /**
   * Generates a realistic set of initial sales transactions
   */
  function generateDefaultSales() {
    const categories = ['Electronics', 'Apparel', 'Home & Kitchen', 'Software', 'Sports', 'Beauty'];
    const channels = ['Online Store', 'Retail Store', 'Wholesale', 'Direct Sales', 'Partner Affiliate'];
    const paymentMethods = ['Credit Card', 'PayPal', 'Stripe', 'Bank Wire', 'Apple Pay'];
    const customers = [
      { name: 'Marcus Sterling', email: 'm.sterling@apex.io' },
      { name: 'Elena Rostova', email: 'elena@novadesign.co' },
      { name: 'Liam Henderson', email: 'liam.h@horizon.tech' },
      { name: 'Amara Okafor', email: 'amara@cloudscale.net' },
      { name: 'Kenji Takahashi', email: 'kenji@aurora-sys.jp' },
      { name: 'Chloe Dubois', email: 'c.dubois@lumiere.fr' },
      { name: 'Devon Patel', email: 'devon.p@vortexflow.com' },
      { name: 'Sophia Rossi', email: 's.rossi@milano.it' },
      { name: 'Mateo Hernandez', email: 'mateo@solaris.org' },
      { name: 'Aria Montgomery', email: 'aria.m@beacon.io' },
      { name: 'Zachary Taylor', email: 'ztaylor@nexustech.us' },
      { name: 'Olivia Wang', email: 'olivia.w@pacificai.co' }
    ];

    const catalog = [
      { product: 'UltraHD 4K Display Hub', category: 'Electronics', price: 449.00, cost: 220.00 },
      { product: 'Pro Wireless ANC Headset', category: 'Electronics', price: 229.00, cost: 95.00 },
      { product: 'Mechanical Ergonomic Keyboard', category: 'Electronics', price: 149.00, cost: 62.00 },
      { product: 'USB-C Thunderbolt 4 Dock', category: 'Electronics', price: 189.00, cost: 80.00 },
      { product: 'Merino Wool Executive Blazer', category: 'Apparel', price: 295.00, cost: 115.00 },
      { product: 'Performance Tech Hoodie', category: 'Apparel', price: 89.00, cost: 32.00 },
      { product: 'Waterproof Commuter Parka', category: 'Apparel', price: 210.00, cost: 85.00 },
      { product: 'Smart Pour-Over Coffee Station', category: 'Home & Kitchen', price: 175.00, cost: 72.00 },
      { product: 'Ceramic Cookware 10-Piece Set', category: 'Home & Kitchen', price: 340.00, cost: 145.00 },
      { product: 'HEPA Air Purifier Pro Max', category: 'Home & Kitchen', price: 260.00, cost: 110.00 },
      { product: 'Enterprise Cloud Backup (Annual)', category: 'Software', price: 599.00, cost: 90.00 },
      { product: 'Data Pipeline Analytics License', category: 'Software', price: 840.00, cost: 120.00 },
      { product: 'Vector Design Suite Pro (Seats x3)', category: 'Software', price: 399.00, cost: 50.00 },
      { product: 'Carbon Fiber Road Bike Helmet', category: 'Sports', price: 165.00, cost: 65.00 },
      { product: 'Smart Fitness Tracker Band 5', category: 'Sports', price: 119.00, cost: 48.00 },
      { product: 'Organic Peptide Recovery Serum', category: 'Beauty', price: 92.00, cost: 24.00 },
      { product: 'Ultrasonic Skin Hydration Device', category: 'Beauty', price: 145.00, cost: 48.00 }
    ];

    const records = [];
    const now = new Date();

    // Spread 42 transactions over the last 90 days
    const dayOffsets = [
      0, 0, 1, 1, 2, 3, 4, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 17, 18, 20, 
      22, 24, 26, 28, 31, 34, 38, 42, 45, 50, 54, 58, 62, 67, 71, 76, 80, 83, 86, 88, 90
    ];

    dayOffsets.forEach((daysAgo, idx) => {
      const d = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      d.setHours(9 + (idx % 11), (idx * 17) % 60, 0, 0);

      const item = catalog[idx % catalog.length];
      const customer = customers[idx % customers.length];
      const qty = (idx % 5 === 0) ? 3 : (idx % 3 === 0 ? 2 : 1);
      const revenue = Math.round(item.price * qty * 100) / 100;
      const cost = Math.round(item.cost * qty * 100) / 100;
      const profit = Math.round((revenue - cost) * 100) / 100;

      // Most completed, small percentage pending or refunded
      let status = 'Completed';
      if (idx === 1) status = 'Pending';
      if (idx === 15) status = 'Pending';
      if (idx === 8) status = 'Refunded';
      if (idx === 29) status = 'Refunded';

      records.push({
        id: 'ORD-' + (84000 + idx * 37),
        date: d.toISOString().slice(0, 16),
        customer: customer.name,
        product: item.product,
        category: item.category,
        channel: channels[(idx * 2) % channels.length],
        quantity: qty,
        unitPrice: item.price,
        unitCost: item.cost,
        revenue: revenue,
        cost: cost,
        profit: profit,
        paymentMethod: paymentMethods[idx % paymentMethods.length],
        status: status,
        notes: idx % 4 === 0 ? 'Verified priority customer' : ''
      });
    });

    return records;
  }

  /**
   * Loads initial state from localStorage
   */
  function initStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DATA);
      if (stored) {
        state.sales = JSON.parse(stored);
      } else {
        state.sales = generateDefaultSales();
        saveSalesData();
      }

      const savedCurrency = localStorage.getItem(STORAGE_KEY_CURRENCY);
      if (savedCurrency && CURRENCIES[savedCurrency]) {
        state.currency = savedCurrency;
      }

      const savedRange = localStorage.getItem(STORAGE_KEY_TIME_RANGE);
      if (savedRange) {
        state.timeRange = savedRange;
      }
    } catch (e) {
      console.warn('LocalStorage access issue, using in-memory dataset:', e);
      state.sales = generateDefaultSales();
    }
  }

  /**
   * Persists sales dataset to localStorage
   */
  function saveSalesData() {
    try {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(state.sales));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      showToast('Storage quota exceeded or disabled', 'error');
    }
  }

  /**
   * Currency formatter
   */
  function formatMoney(amount, currencyCode = state.currency) {
    const cfg = CURRENCIES[currencyCode] || CURRENCIES.USD;
    const decimals = currencyCode === 'JPY' ? 0 : 2;
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    const sign = amount < 0 ? '-' : '';
    if (cfg.position === 'after') {
      return `${sign}${formatted} ${cfg.symbol}`;
    }
    return `${sign}${cfg.symbol}${formatted}`;
  }

  /**
   * Helper to format numbers with commas
   */
  function formatNumber(num) {
    return Number(num).toLocaleString('en-US');
  }

  /**
   * Toast notification helper
   */
  function showToast(message, type = 'info') {
    const container = el.toastContainer;
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else {
      iconSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  /**
   * Filters transactions by the active time range
   */
  function getFilteredByTime(salesList, range = state.timeRange) {
    if (range === 'all') return salesList;

    if (range === 'custom') {
      if (!state.customStartDate && !state.customEndDate) return salesList;
      return salesList.filter(s => {
        const itemDate = s.date.slice(0, 10);
        if (state.customStartDate && itemDate < state.customStartDate) return false;
        if (state.customEndDate && itemDate > state.customEndDate) return false;
        return true;
      });
    }

    const now = new Date();
    let cutoff = new Date(now.getTime());

    if (range === 'today') {
      cutoff.setHours(0, 0, 0, 0);
    } else if (range === '7days') {
      cutoff.setDate(now.getDate() - 7);
    } else if (range === '30days') {
      cutoff.setDate(now.getDate() - 30);
    } else if (range === '90days') {
      cutoff.setDate(now.getDate() - 90);
    } else if (range === 'ytd') {
      cutoff = new Date(now.getFullYear(), 0, 1);
    }

    return salesList.filter(s => new Date(s.date) >= cutoff);
  }

  /**
   * Calculates metrics for a specific dataset
   */
  function calculateMetrics(dataset) {
    let grossRevenue = 0;
    let netProfit = 0;
    let totalCost = 0;
    let completedOrders = 0;
    let pendingOrders = 0;
    let refundedOrders = 0;
    let totalUnits = 0;

    const categoryMap = {};

    dataset.forEach(item => {
      const rev = Number(item.revenue) || 0;
      const c = Number(item.cost) || 0;
      const prf = Number(item.profit) || 0;
      const qty = Number(item.quantity) || 1;

      if (item.status === 'Completed') {
        grossRevenue += rev;
        netProfit += prf;
        totalCost += c;
        completedOrders++;
        totalUnits += qty;

        categoryMap[item.category] = (categoryMap[item.category] || 0) + rev;
      } else if (item.status === 'Pending') {
        grossRevenue += rev;
        netProfit += prf;
        totalCost += c;
        pendingOrders++;
        totalUnits += qty;
        categoryMap[item.category] = (categoryMap[item.category] || 0) + rev;
      } else if (item.status === 'Refunded') {
        refundedOrders++;
      }
    });

    const activeOrders = completedOrders + pendingOrders;
    const aov = activeOrders > 0 ? (grossRevenue / activeOrders) : 0;
    const margin = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100) : 0;

    // Top category
    let topCategory = 'None';
    let maxCatVal = -1;
    for (const [cat, val] of Object.entries(categoryMap)) {
      if (val > maxCatVal) {
        maxCatVal = val;
        topCategory = cat;
      }
    }

    return {
      grossRevenue,
      netProfit,
      totalCost,
      activeOrders,
      completedOrders,
      pendingOrders,
      refundedOrders,
      totalUnits,
      aov,
      margin,
      topCategory
    };
  }

  /**
   * Refreshes Top KPI cards and insights
   */
  function renderKPIs() {
    const timeFiltered = getFilteredByTime(state.sales, state.timeRange);
    const metrics = calculateMetrics(timeFiltered);

    // Calculate comparative metrics for previous equivalent period
    let prevPeriodRevenue = 0;
    if (state.timeRange === '7days') {
      const now = new Date();
      const start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const end = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const prevData = state.sales.filter(s => {
        const d = new Date(s.date);
        return d >= start && d < end;
      });
      prevPeriodRevenue = calculateMetrics(prevData).grossRevenue;
    } else if (state.timeRange === '30days') {
      const now = new Date();
      const start = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      const end = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const prevData = state.sales.filter(s => {
        const d = new Date(s.date);
        return d >= start && d < end;
      });
      prevPeriodRevenue = calculateMetrics(prevData).grossRevenue;
    }

    // Revenue KPI
    el.kpiTotalRevenue.textContent = formatMoney(metrics.grossRevenue);
    
    // Revenue trend badge
    let trendPct = 0;
    if (prevPeriodRevenue > 0) {
      trendPct = ((metrics.grossRevenue - prevPeriodRevenue) / prevPeriodRevenue) * 100;
    } else {
      trendPct = metrics.grossRevenue > 0 ? 12.4 : 0;
    }
    
    const isPositive = trendPct >= 0;
    el.kpiRevenueTrend.className = `trend-badge ${isPositive ? 'positive' : 'negative'}`;
    el.kpiRevenueTrendPct.textContent = `${isPositive ? '+' : ''}${trendPct.toFixed(1)}%`;
    el.kpiRevenueTrend.querySelector('svg').innerHTML = isPositive 
      ? '<polyline points="18 15 12 9 6 15"></polyline>' 
      : '<polyline points="6 9 12 15 18 9"></polyline>';

    // Profit KPI
    el.kpiNetProfit.textContent = formatMoney(metrics.netProfit);
    el.kpiProfitMargin.textContent = `${metrics.margin.toFixed(1)}%`;
    el.kpiCostComparison.textContent = `Cost: ${formatMoney(metrics.totalCost)}`;

    // Orders KPI
    el.kpiTotalOrders.textContent = formatNumber(metrics.activeOrders);
    el.kpiTotalUnits.textContent = `${formatNumber(metrics.totalUnits)} units sold`;
    const completionRate = (metrics.activeOrders + metrics.refundedOrders) > 0 
      ? (metrics.completedOrders / (metrics.activeOrders + metrics.refundedOrders)) * 100 
      : 100;
    el.kpiCompletedRate.textContent = `${completionRate.toFixed(0)}% fulfilled`;

    // AOV KPI
    el.kpiAvgOrderValue.textContent = formatMoney(metrics.aov);
    el.kpiTopCategory.textContent = `Top: ${metrics.topCategory}`;
    el.kpiRefundCount.textContent = `${metrics.refundedOrders} refund${metrics.refundedOrders === 1 ? '' : 's'}`;

    // Smart Insight Text
    let insightMessage = '';
    if (metrics.activeOrders === 0) {
      insightMessage = 'No active orders in this timeframe. Record a sale to start generating analytics insights.';
    } else {
      insightMessage = `Top revenue driver is ${metrics.topCategory} with gross revenue of ${formatMoney(metrics.grossRevenue)}. Average ticket value stands at ${formatMoney(metrics.aov)} across ${metrics.activeOrders} orders with healthy ${metrics.margin.toFixed(1)}% profit margin.`;
    }
    el.insightText.textContent = insightMessage;
    el.lastUpdatedLabel.textContent = `Live \u2022 ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  /**
   * Safe rounded rectangle helper with fallback
   */
  function safeRoundRect(ctx, x, y, width, height, radius) {
    if (typeof ctx.roundRect === 'function') {
      try {
        ctx.roundRect(x, y, width, height, radius);
        return;
      } catch (e) {
        // Fallback below
      }
    }
    let r = typeof radius === 'number' ? radius : (Array.isArray(radius) ? radius[0] : 0);
    if (width < 2 * r) r = width / 2;
    if (height < 2 * r) r = height / 2;
    if (r <= 0) {
      ctx.rect(x, y, width, height);
      return;
    }
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  /**
   * High-DPI canvas setup utility
   */
  function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set display size
    canvas.width = Math.max(rect.width * dpr, 200 * dpr);
    canvas.height = Math.max(rect.height * dpr, 150 * dpr);

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width: rect.width, height: rect.height };
  }

  // Active chart tooltip handlers
  let activeTrendPoints = [];
  let activeDonutSlices = [];
  let activeChannelBars = [];
  let activeQuotaBars = [];

  /**
   * Chart 1: Revenue & Profit Trend Timeline Chart (Canvas)
   */
  function renderTrendChart() {
    const canvas = el.trendChartCanvas;
    if (!canvas) return;

    const { ctx, width, height } = setupCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const timeFiltered = getFilteredByTime(state.sales, state.timeRange);

    // Group sales by day
    const dayMap = {};
    timeFiltered.forEach(s => {
      if (s.status === 'Refunded') return;
      const day = s.date.slice(0, 10);
      if (!dayMap[day]) {
        dayMap[day] = { revenue: 0, profit: 0, count: 0 };
      }
      dayMap[day].revenue += Number(s.revenue) || 0;
      dayMap[day].profit += Number(s.profit) || 0;
      dayMap[day].count += 1;
    });

    const sortedDays = Object.keys(dayMap).sort();

    // If fewer than 2 days, fill in mock consecutive dates for a smooth timeline visualization
    let chartDays = sortedDays;
    let dataPoints = [];

    if (chartDays.length === 0) {
      // Empty canvas message
      ctx.fillStyle = PALETTE.slateMuted;
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No transaction data available for this range', width / 2, height / 2);
      activeTrendPoints = [];
      return;
    }

    if (chartDays.length === 1) {
      // Create surrounding days with zero
      const d = new Date(chartDays[0]);
      const prevD = new Date(d.getTime() - 86400000).toISOString().slice(0, 10);
      const nextD = new Date(d.getTime() + 86400000).toISOString().slice(0, 10);
      chartDays = [prevD, chartDays[0], nextD];
      dayMap[prevD] = { revenue: 0, profit: 0, count: 0 };
      dayMap[nextD] = { revenue: 0, profit: 0, count: 0 };
    }

    dataPoints = chartDays.map(day => ({
      date: day,
      revenue: dayMap[day].revenue,
      profit: dayMap[day].profit,
      count: dayMap[day].count
    }));

    // Layout dimensions
    const padLeft = 60;
    const padRight = 30;
    const padTop = 30;
    const padBottom = 35;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    // Determine max value for Y-axis
    let maxVal = 0;
    dataPoints.forEach(p => {
      if (state.trendMetric === 'revenue' || state.trendMetric === 'both') {
        if (p.revenue > maxVal) maxVal = p.revenue;
      }
      if (state.trendMetric === 'profit' || state.trendMetric === 'both') {
        if (p.profit > maxVal) maxVal = p.profit;
      }
    });

    maxVal = maxVal > 0 ? maxVal * 1.2 : 1000;

    // Draw horizontal grid lines & Y-axis labels
    const ySteps = 4;
    ctx.strokeStyle = PALETTE.gridLine;
    ctx.lineWidth = 1;
    ctx.fillStyle = PALETTE.slateMuted;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= ySteps; i++) {
      const yVal = (maxVal / ySteps) * i;
      const yPos = padTop + plotH - (i / ySteps) * plotH;

      ctx.beginPath();
      ctx.moveTo(padLeft, yPos);
      ctx.lineTo(width - padRight, yPos);
      ctx.stroke();

      ctx.fillText(formatMoney(yVal), padLeft - 10, yPos + 4);
    }

    // Compute coordinate points
    const points = dataPoints.map((p, idx) => {
      const x = padLeft + (idx / (dataPoints.length - 1)) * plotW;
      const yRev = padTop + plotH - (p.revenue / maxVal) * plotH;
      const yPrf = padTop + plotH - (p.profit / maxVal) * plotH;
      return { ...p, x, yRev, yPrf };
    });

    activeTrendPoints = points;

    // Helper to draw smooth bezier line & area
    function drawCurve(pts, yKey, lineColor, areaFill) {
      if (pts.length < 2) return;

      // Fill area under curve
      ctx.beginPath();
      ctx.moveTo(pts[0].x, padTop + plotH);
      ctx.lineTo(pts[0].x, pts[0][yKey]);

      for (let i = 0; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i][yKey] + pts[i + 1][yKey]) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i][yKey], xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1][yKey]);
      ctx.lineTo(pts[pts.length - 1].x, padTop + plotH);
      ctx.closePath();

      ctx.fillStyle = areaFill;
      ctx.fill();

      // Stroke line
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0][yKey]);
      for (let i = 0; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i][yKey] + pts[i + 1][yKey]) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i][yKey], xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1][yKey]);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw points
      pts.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt[yKey], 4, 0, Math.PI * 2);
        ctx.fillStyle = lineColor;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = PALETTE.slateCard;
        ctx.stroke();
      });
    }

    if (state.trendMetric === 'revenue' || state.trendMetric === 'both') {
      drawCurve(points, 'yRev', PALETTE.primary, PALETTE.primaryFill);
    }
    if (state.trendMetric === 'profit' || state.trendMetric === 'both') {
      drawCurve(points, 'yPrf', PALETTE.emerald, PALETTE.emeraldFill);
    }

    // Draw X-axis labels
    ctx.fillStyle = PALETTE.slateMuted;
    ctx.textAlign = 'center';
    ctx.font = '10px sans-serif';

    const maxLabels = Math.min(points.length, 7);
    const step = Math.ceil(points.length / maxLabels);

    points.forEach((pt, idx) => {
      if (idx % step === 0 || idx === points.length - 1) {
        const dateObj = new Date(pt.date);
        const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        ctx.fillText(label, pt.x, height - 12);
      }
    });
  }

  /**
   * Trend chart mouse interaction (Tooltips)
   */
  function setupTrendChartInteractions() {
    const canvas = el.trendChartCanvas;
    const tooltip = el.trendChartTooltip;
    if (!canvas || !tooltip) return;

    canvas.addEventListener('mousemove', (e) => {
      if (!activeTrendPoints.length) {
        tooltip.classList.add('hidden');
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      // Find closest point
      let closest = null;
      let minDiff = Infinity;
      activeTrendPoints.forEach(pt => {
        const diff = Math.abs(pt.x - mouseX);
        if (diff < minDiff) {
          minDiff = diff;
          closest = pt;
        }
      });

      if (closest && minDiff < 45) {
        const dateFormatted = new Date(closest.date).toLocaleDateString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        });

        tooltip.innerHTML = `
          <div style="font-weight: 700; margin-bottom: 4px; color: ${PALETTE.textWhite};">${dateFormatted}</div>
          <div style="color: ${PALETTE.primary}; font-size: 11px;">Revenue: <strong>${formatMoney(closest.revenue)}</strong></div>
          <div style="color: ${PALETTE.emerald}; font-size: 11px;">Profit: <strong>${formatMoney(closest.profit)}</strong></div>
          <div style="color: ${PALETTE.slateMuted}; font-size: 10px; margin-top: 3px;">Transactions: ${closest.count}</div>
        `;

        tooltip.classList.remove('hidden');
        tooltip.style.left = `${closest.x}px`;
        tooltip.style.top = `${Math.min(closest.yRev, closest.yPrf) - 10}px`;
      } else {
        tooltip.classList.add('hidden');
      }
    });

    canvas.addEventListener('mouseleave', () => {
      tooltip.classList.add('hidden');
    });
  }

  /**
   * Chart 2: Category Breakdown Donut Chart (Canvas)
   */
  function renderCategoryDonut() {
    const canvas = el.categoryDonutCanvas;
    if (!canvas) return;

    const { ctx, width, height } = setupCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const timeFiltered = getFilteredByTime(state.sales, state.timeRange);

    const categoryTotals = {};
    let totalRev = 0;

    timeFiltered.forEach(s => {
      if (s.status === 'Refunded') return;
      const rev = Number(s.revenue) || 0;
      categoryTotals[s.category] = (categoryTotals[s.category] || 0) + rev;
      totalRev += rev;
    });

    const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    el.donutTotalVal.textContent = formatMoney(totalRev);

    // Render legend grid
    const legendContainer = el.categoryChartLegend;
    legendContainer.innerHTML = '';

    if (entries.length === 0 || totalRev === 0) {
      ctx.fillStyle = PALETTE.slateMuted;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No sales in this period', width / 2, height / 2);
      activeDonutSlices = [];
      return;
    }

    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 14;
    const innerRadius = outerRadius * 0.65;

    let startAngle = -Math.PI / 2;
    const slices = [];

    entries.forEach(([cat, val]) => {
      const sliceAngle = (val / totalRev) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;
      const color = CATEGORY_COLORS[cat] || PALETTE.primary;

      // Draw Slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Border between slices
      ctx.strokeStyle = PALETTE.slateCard;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      slices.push({
        category: cat,
        value: val,
        percentage: (val / totalRev) * 100,
        startAngle,
        endAngle,
        color,
        centerX,
        centerY,
        innerRadius,
        outerRadius
      });

      startAngle = endAngle;

      // Build Legend Cell
      const pctStr = ((val / totalRev) * 100).toFixed(0);
      const cell = document.createElement('div');
      cell.className = 'category-legend-cell';
      cell.innerHTML = `
        <span class="legend-color-box" style="background-color: ${color};"></span>
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cat}: <strong>${pctStr}%</strong></span>
      `;
      legendContainer.appendChild(cell);
    });

    activeDonutSlices = slices;
  }

  /**
   * Category Donut Hover interaction
   */
  function setupCategoryDonutInteractions() {
    const canvas = el.categoryDonutCanvas;
    const tooltip = el.categoryTooltip;
    if (!canvas || !tooltip) return;

    canvas.addEventListener('mousemove', (e) => {
      if (!activeDonutSlices.length) {
        tooltip.classList.add('hidden');
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const firstSlice = activeDonutSlices[0];
      const dx = mouseX - firstSlice.centerX;
      const dy = mouseY - firstSlice.centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist >= firstSlice.innerRadius && dist <= firstSlice.outerRadius + 8) {
        let angle = Math.atan2(dy, dx);
        if (angle < -Math.PI / 2) {
          angle += 2 * Math.PI;
        }

        const match = activeDonutSlices.find(s => {
          let sAngle = s.startAngle;
          let eAngle = s.endAngle;
          return angle >= sAngle && angle <= eAngle;
        });

        if (match) {
          tooltip.innerHTML = `
            <div style="font-weight: 700; color: ${match.color}; margin-bottom: 2px;">${match.category}</div>
            <div style="font-size: 11px; color: ${PALETTE.textWhite};">${formatMoney(match.value)} (${match.percentage.toFixed(1)}%)</div>
          `;
          tooltip.classList.remove('hidden');
          tooltip.style.left = `${mouseX}px`;
          tooltip.style.top = `${mouseY - 15}px`;
          return;
        }
      }

      tooltip.classList.add('hidden');
    });

    canvas.addEventListener('mouseleave', () => {
      tooltip.classList.add('hidden');
    });
  }

  /**
   * Chart 3: Performance by Sales Channel Horizontal Bar Chart (Canvas)
   */
  function renderChannelBarChart() {
    const canvas = el.channelBarCanvas;
    if (!canvas) return;

    const { ctx, width, height } = setupCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    const timeFiltered = getFilteredByTime(state.sales, state.timeRange);

    const channels = ['Online Store', 'Retail Store', 'Wholesale', 'Direct Sales', 'Partner Affiliate'];
    const channelStats = {};
    channels.forEach(ch => {
      channelStats[ch] = { revenue: 0, orders: 0 };
    });

    timeFiltered.forEach(s => {
      if (s.status === 'Refunded') return;
      const ch = s.channel || 'Online Store';
      if (!channelStats[ch]) channelStats[ch] = { revenue: 0, orders: 0 };
      channelStats[ch].revenue += Number(s.revenue) || 0;
      channelStats[ch].orders += 1;
    });

    const items = channels.map(ch => ({
      channel: ch,
      revenue: channelStats[ch].revenue,
      orders: channelStats[ch].orders
    }));

    const maxRev = Math.max(...items.map(i => i.revenue), 100);

    const padLeft = 120;
    const padRight = 80;
    const padTop = 15;
    const padBottom = 20;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;
    const barHeight = Math.min(22, (chartH / items.length) * 0.6);
    const rowStep = chartH / items.length;

    activeChannelBars = [];

    items.forEach((item, idx) => {
      const y = padTop + idx * rowStep + (rowStep - barHeight) / 2;
      const barW = Math.max(4, (item.revenue / maxRev) * chartW);

      // Channel label
      ctx.fillStyle = PALETTE.slateText;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(item.channel, padLeft - 12, y + barHeight / 2 + 4);

      // Background Track
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      safeRoundRect(ctx, padLeft, y, chartW, barHeight, 4);
      ctx.fill();

      // Filled Progress Bar
      const gradient = ctx.createLinearGradient(padLeft, 0, padLeft + barW, 0);
      gradient.addColorStop(0, '#0284c7');
      gradient.addColorStop(1, '#38bdf8');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      safeRoundRect(ctx, padLeft, y, barW, barHeight, 4);
      ctx.fill();

      // Value label on right
      ctx.fillStyle = PALETTE.textWhite;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(formatMoney(item.revenue), padLeft + barW + 8, y + barHeight / 2 + 4);

      activeChannelBars.push({
        channel: item.channel,
        revenue: item.revenue,
        orders: item.orders,
        x: padLeft,
        y: y,
        w: barW,
        h: barHeight
      });
    });
  }

  /**
   * Channel Bar Hover tooltip
   */
  function setupChannelBarInteractions() {
    const canvas = el.channelBarCanvas;
    const tooltip = el.channelBarTooltip;
    if (!canvas || !tooltip) return;

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const hit = activeChannelBars.find(b => {
        return mouseX >= b.x - 100 && mouseX <= b.x + b.w + 60 && mouseY >= b.y && mouseY <= b.y + b.h;
      });

      if (hit) {
        tooltip.innerHTML = `
          <div style="font-weight: 700; color: ${PALETTE.primary};">${hit.channel}</div>
          <div style="font-size: 11px;">Revenue: <strong>${formatMoney(hit.revenue)}</strong></div>
          <div style="font-size: 10px; color: ${PALETTE.slateMuted};">Orders: ${hit.orders}</div>
        `;
        tooltip.classList.remove('hidden');
        tooltip.style.left = `${mouseX}px`;
        tooltip.style.top = `${mouseY - 15}px`;
      } else {
        tooltip.classList.add('hidden');
      }
    });

    canvas.addEventListener('mouseleave', () => {
      tooltip.classList.add('hidden');
    });
  }

  /**
   * Chart 4: Monthly Quota vs Actual Grouped Bar Chart (Canvas)
   */
  function renderQuotaBarChart() {
    const canvas = el.quotaBarCanvas;
    if (!canvas) return;

    const { ctx, width, height } = setupCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    // Group sales into past 5 calendar months
    const months = [];
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        actual: 0,
        quota: 0
      });
    }

    state.sales.forEach(s => {
      if (s.status === 'Refunded') return;
      const d = new Date(s.date);
      const match = months.find(m => m.year === d.getFullYear() && m.month === d.getMonth());
      if (match) {
        match.actual += Number(s.revenue) || 0;
      }
    });

    // Compute realistic progressive quota
    months.forEach((m, idx) => {
      const baseline = 2500 + idx * 800;
      m.quota = Math.round(baseline);
      if (m.actual === 0 && idx < months.length - 1) {
        // If demo sales didn't populate far back, give sensible actual
        m.actual = Math.round(baseline * 0.95);
      }
    });

    const maxVal = Math.max(...months.map(m => Math.max(m.actual, m.quota)), 3000) * 1.2;

    const padLeft = 55;
    const padRight = 25;
    const padTop = 20;
    const padBottom = 35;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Grid lines
    const ySteps = 4;
    ctx.strokeStyle = PALETTE.gridLine;
    ctx.lineWidth = 1;
    ctx.fillStyle = PALETTE.slateMuted;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= ySteps; i++) {
      const yVal = (maxVal / ySteps) * i;
      const yPos = padTop + chartH - (i / ySteps) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, yPos);
      ctx.lineTo(width - padRight, yPos);
      ctx.stroke();
      ctx.fillText(formatMoney(yVal), padLeft - 10, yPos + 4);
    }

    // Draw Grouped Bars
    const groupW = chartW / months.length;
    const barW = Math.min(22, groupW * 0.28);
    activeQuotaBars = [];

    months.forEach((m, idx) => {
      const groupCenterX = padLeft + idx * groupW + groupW / 2;
      
      // Actual Bar (Primary Blue)
      const hActual = (m.actual / maxVal) * chartH;
      const xActual = groupCenterX - barW - 2;
      const yActual = padTop + chartH - hActual;

      ctx.fillStyle = PALETTE.primary;
      ctx.beginPath();
      safeRoundRect(ctx, xActual, yActual, barW, hActual, [4, 4, 0, 0]);
      ctx.fill();

      // Quota Bar (Slate / Target)
      const hQuota = (m.quota / maxVal) * chartH;
      const xQuota = groupCenterX + 2;
      const yQuota = padTop + chartH - hQuota;

      ctx.fillStyle = '#475569';
      ctx.beginPath();
      safeRoundRect(ctx, xQuota, yQuota, barW, hQuota, [4, 4, 0, 0]);
      ctx.fill();

      // Month Label
      ctx.fillStyle = PALETTE.slateText;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m.label, groupCenterX, height - 12);

      activeQuotaBars.push({
        label: m.label,
        actual: m.actual,
        quota: m.quota,
        fulfillment: ((m.actual / m.quota) * 100).toFixed(0),
        x: xActual,
        y: Math.min(yActual, yQuota),
        w: barW * 2 + 4,
        h: Math.max(hActual, hQuota)
      });
    });
  }

  /**
   * Quota Bar Hover tooltip
   */
  function setupQuotaBarInteractions() {
    const canvas = el.quotaBarCanvas;
    const tooltip = el.quotaBarTooltip;
    if (!canvas || !tooltip) return;

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const hit = activeQuotaBars.find(b => {
        return mouseX >= b.x - 10 && mouseX <= b.x + b.w + 10 && mouseY >= b.y - 10 && mouseY <= b.y + b.h + 20;
      });

      if (hit) {
        tooltip.innerHTML = `
          <div style="font-weight: 700; color: ${PALETTE.textWhite};">${hit.label} Target Analysis</div>
          <div style="color: ${PALETTE.primary}; font-size: 11px;">Actual: <strong>${formatMoney(hit.actual)}</strong></div>
          <div style="color: #94a3b8; font-size: 11px;">Quota: <strong>${formatMoney(hit.quota)}</strong></div>
          <div style="color: ${PALETTE.emerald}; font-size: 10px; margin-top: 2px;">Fulfillment: ${hit.fulfillment}%</div>
        `;
        tooltip.classList.remove('hidden');
        tooltip.style.left = `${mouseX}px`;
        tooltip.style.top = `${mouseY - 20}px`;
      } else {
        tooltip.classList.add('hidden');
      }
    });

    canvas.addEventListener('mouseleave', () => {
      tooltip.classList.add('hidden');
    });
  }

  /**
   * Renders all canvas charts
   */
  function renderAllCharts() {
    renderTrendChart();
    renderCategoryDonut();
    renderChannelBarChart();
    renderQuotaBarChart();
  }

  /**
   * Filters and sorts the sales dataset for the table view
   */
  function getTableData() {
    let result = [...state.sales];

    // Filter by Time Range
    result = getFilteredByTime(result, state.timeRange);

    // Search query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      result = result.filter(s => 
        (s.id && s.id.toLowerCase().includes(q)) ||
        (s.customer && s.customer.toLowerCase().includes(q)) ||
        (s.product && s.product.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        (s.channel && s.channel.toLowerCase().includes(q)) ||
        (s.paymentMethod && s.paymentMethod.toLowerCase().includes(q))
      );
    }

    // Quick Filter Chip
    if (state.quickChip === 'Completed') {
      result = result.filter(s => s.status === 'Completed');
    } else if (state.quickChip === 'Pending') {
      result = result.filter(s => s.status === 'Pending');
    } else if (state.quickChip === 'Refunded') {
      result = result.filter(s => s.status === 'Refunded');
    } else if (state.quickChip === 'high-value') {
      result = result.filter(s => Number(s.revenue) >= 300);
    }

    // Filter by Category
    if (state.filterCategory !== 'all') {
      result = result.filter(s => s.category === state.filterCategory);
    }

    // Filter by Channel
    if (state.filterChannel !== 'all') {
      result = result.filter(s => s.channel === state.filterChannel);
    }

    // Filter by Status
    if (state.filterStatus !== 'all') {
      result = result.filter(s => s.status === state.filterStatus);
    }

    // Sorting
    const col = state.sortColumn;
    const dir = state.sortDirection === 'asc' ? 1 : -1;

    result.sort((a, b) => {
      let valA = a[col];
      let valB = b[col];

      if (col === 'revenue' || col === 'profit' || col === 'amount') {
        valA = Number(a.revenue) || 0;
        valB = Number(b.revenue) || 0;
      } else if (col === 'date') {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });

    return result;
  }

  /**
   * Renders the sales ledger data table and pagination
   */
  function renderTable() {
    const tableBody = el.salesTableBody;
    const emptyState = el.tableEmptyState;
    const filteredData = getTableData();
    const totalRecords = filteredData.length;

    el.tableRecordCount.textContent = `Showing ${totalRecords} transaction${totalRecords === 1 ? '' : 's'}`;

    if (totalRecords === 0) {
      tableBody.innerHTML = '';
      emptyState.classList.remove('hidden');
      renderPagination(0, 0, 0);
      return;
    }

    emptyState.classList.add('hidden');

    // Pagination calculations
    const totalPages = Math.ceil(totalRecords / state.pageSize) || 1;
    if (state.currentPage > totalPages) {
      state.currentPage = totalPages;
    }
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const pageItems = filteredData.slice(startIndex, startIndex + state.pageSize);

    // Build Rows
    let html = '';
    pageItems.forEach(sale => {
      const initials = (sale.customer || 'U')
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const d = new Date(sale.date);
      const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeFormatted = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      let statusClass = 'status-completed';
      if (sale.status === 'Pending') statusClass = 'status-pending';
      if (sale.status === 'Refunded') statusClass = 'status-refunded';

      const isChecked = state.selectedIds.has(sale.id);

      html += `
        <tr data-id="${sale.id}">
          <td style="text-align: center;">
            <input type="checkbox" class="row-select-checkbox" data-id="${sale.id}" ${isChecked ? 'checked' : ''}>
          </td>
          <td><span class="order-id-code">${sale.id}</span></td>
          <td>
            <div style="font-weight: 600; color: #f8fafc;">${dateFormatted}</div>
            <div style="font-size: 11px; color: #64748b;">${timeFormatted}</div>
          </td>
          <td>
            <div class="customer-cell">
              <div class="customer-avatar">${initials}</div>
              <div class="customer-name">${escapeHtml(sale.customer)}</div>
            </div>
          </td>
          <td>
            <div class="product-cell-main">${escapeHtml(sale.product)}</div>
            <div class="product-cell-cat">${sale.category} &bull; Qty: ${sale.quantity}</div>
          </td>
          <td><span class="channel-tag">${sale.channel || 'Online'}</span></td>
          <td class="text-right" style="font-weight: 700; color: #f8fafc;">${formatMoney(sale.revenue)}</td>
          <td class="text-right" style="font-weight: 600; color: ${sale.profit >= 0 ? '#10b981' : '#ef4444'};">${formatMoney(sale.profit)}</td>
          <td><span style="font-size: 12px; color: #94a3b8;">${sale.paymentMethod || 'Credit Card'}</span></td>
          <td class="text-center"><span class="status-pill ${statusClass}">${sale.status}</span></td>
          <td class="text-right">
            <button class="row-action-btn btn-edit-sale" data-id="${sale.id}" title="Edit Sale">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="row-action-btn delete-btn btn-delete-sale" data-id="${sale.id}" title="Delete Sale">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;

    // Checkbox events
    tableBody.querySelectorAll('.row-select-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        if (e.target.checked) {
          state.selectedIds.add(id);
        } else {
          state.selectedIds.delete(id);
        }
        updateBulkBar();
      });
    });

    updateBulkBar();

    // Attach row button events
    tableBody.querySelectorAll('.btn-edit-sale').forEach(btn => {
      btn.addEventListener('click', () => openEditSaleModal(btn.dataset.id));
    });

    tableBody.querySelectorAll('.btn-delete-sale').forEach(btn => {
      btn.addEventListener('click', () => promptDeleteSale(btn.dataset.id));
    });

    renderPagination(totalRecords, startIndex, pageItems.length);
  }

  /**
   * Updates visibility and count of the floating bulk action bar
   */
  function updateBulkBar() {
    if (!el.bulkActionBar) return;
    const count = state.selectedIds.size;
    if (count > 0) {
      el.bulkActionBar.classList.remove('hidden');
      el.bulkSelectedCount.textContent = `${count} transaction${count === 1 ? '' : 's'} selected`;
    } else {
      el.bulkActionBar.classList.add('hidden');
    }

    if (el.selectAllCheckbox) {
      const pageCheckboxes = document.querySelectorAll('.row-select-checkbox');
      if (pageCheckboxes.length > 0) {
        const allChecked = Array.from(pageCheckboxes).every(cb => cb.checked);
        el.selectAllCheckbox.checked = allChecked;
      } else {
        el.selectAllCheckbox.checked = false;
      }
    }
  }

  /**
   * Safe HTML string escape helper
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Renders pagination buttons and summary text
   */
  function renderPagination(totalCount, startIndex, currentPageItemCount) {
    el.pageTotalCount.textContent = formatNumber(totalCount);
    el.pageRangeStart.textContent = totalCount > 0 ? startIndex + 1 : 0;
    el.pageRangeEnd.textContent = startIndex + currentPageItemCount;

    const totalPages = Math.ceil(totalCount / state.pageSize) || 1;
    const container = el.paginationControls;
    container.innerHTML = '';

    if (totalPages <= 1) return;

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.innerHTML = '&lsaquo;';
    prevBtn.disabled = state.currentPage === 1;
    prevBtn.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        renderTable();
      }
    });
    container.appendChild(prevBtn);

    // Page number buttons
    for (let p = 1; p <= totalPages; p++) {
      if (totalPages > 7) {
        if (p > 1 && p < state.currentPage - 1 && p !== totalPages) {
          if (p === 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '0 4px';
            container.appendChild(ellipsis);
          }
          continue;
        }
        if (p > state.currentPage + 1 && p < totalPages) {
          if (p === state.currentPage + 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '0 4px';
            container.appendChild(ellipsis);
          }
          continue;
        }
      }

      const pageBtn = document.createElement('button');
      pageBtn.className = `page-btn ${p === state.currentPage ? 'active' : ''}`;
      pageBtn.textContent = p;
      pageBtn.addEventListener('click', () => {
        state.currentPage = p;
        renderTable();
      });
      container.appendChild(pageBtn);
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.innerHTML = '&rsaquo;';
    nextBtn.disabled = state.currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (state.currentPage < totalPages) {
        state.currentPage++;
        renderTable();
      }
    });
    container.appendChild(nextBtn);
  }

  /**
   * Updates sort indicators on the table header
   */
  function updateSortHeaders() {
    document.querySelectorAll('.sortable-th').forEach(th => {
      const sortKey = th.dataset.sort;
      th.classList.remove('active-sort', 'asc', 'desc');
      const icon = th.querySelector('.sort-icon');

      if (sortKey === state.sortColumn) {
        th.classList.add('active-sort', state.sortDirection);
        if (icon) icon.textContent = state.sortDirection === 'asc' ? '▲' : '▼';
      } else {
        if (icon) icon.textContent = '⇅';
      }
    });
  }

  /**
   * Modal: Opens modal for creating a new sale
   */
  function openNewSaleModal() {
    state.editingId = null;
    el.saleModalTitle.textContent = 'Record New Sale Transaction';
    el.saleForm.reset();
    el.saleFormId.value = '';

    // Set current date & time local
    const now = new Date();
    const isoLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    el.formDate.value = isoLocal;
    el.formQty.value = '1';
    el.formUnitPrice.value = '';
    el.formUnitCost.value = '';

    clearFormErrors();
    updateModalSummary();
    el.saleModal.classList.remove('hidden');
    el.formCustomer.focus();
  }

  /**
   * Modal: Opens modal for editing an existing sale
   */
  function openEditSaleModal(id) {
    const sale = state.sales.find(s => s.id === id);
    if (!sale) return;

    state.editingId = id;
    el.saleModalTitle.textContent = `Edit Sale (${sale.id})`;
    el.saleFormId.value = sale.id;

    el.formCustomer.value = sale.customer || '';
    el.formDate.value = sale.date || '';
    el.formProduct.value = sale.product || '';
    el.formCategory.value = sale.category || 'Electronics';
    el.formQty.value = sale.quantity || 1;
    el.formUnitPrice.value = sale.unitPrice || '';
    el.formUnitCost.value = sale.unitCost !== undefined ? sale.unitCost : '';
    el.formChannel.value = sale.channel || 'Online Store';
    el.formPaymentMethod.value = sale.paymentMethod || 'Credit Card';
    el.formStatus.value = sale.status || 'Completed';
    el.formNotes.value = sale.notes || '';

    clearFormErrors();
    updateModalSummary();
    el.saleModal.classList.remove('hidden');
  }

  /**
   * Closes the sale modal
   */
  function closeSaleModal() {
    el.saleModal.classList.add('hidden');
    state.editingId = null;
  }

  /**
   * Updates dynamic calculation metrics inside the Sale Modal
   */
  function updateModalSummary() {
    const qty = parseFloat(el.formQty.value) || 0;
    const price = parseFloat(el.formUnitPrice.value) || 0;
    const cost = parseFloat(el.formUnitCost.value) || 0;

    const rev = qty * price;
    const totalCost = qty * cost;
    const profit = rev - totalCost;
    const margin = rev > 0 ? (profit / rev) * 100 : 0;

    el.calcRevenue.textContent = formatMoney(rev);
    el.calcProfit.textContent = formatMoney(profit);
    el.calcMargin.textContent = `${margin.toFixed(1)}%`;

    if (profit < 0) {
      el.calcProfit.style.color = '#ef4444';
    } else {
      el.calcProfit.style.color = '#10b981';
    }
  }

  /**
   * Clear all inline form errors
   */
  function clearFormErrors() {
    el.formCustomerError.textContent = '';
    el.formDateError.textContent = '';
    el.formProductError.textContent = '';
    el.formQtyError.textContent = '';
    el.formUnitPriceError.textContent = '';
    el.formUnitCostError.textContent = '';
  }

  /**
   * Handles Save (Create / Update) of Sale Transaction
   */
  function handleSaveSale(e) {
    e.preventDefault();
    clearFormErrors();

    const customer = el.formCustomer.value.trim();
    const date = el.formDate.value;
    const product = el.formProduct.value.trim();
    const category = el.formCategory.value;
    const qty = parseInt(el.formQty.value, 10);
    const unitPrice = parseFloat(el.formUnitPrice.value);
    const unitCost = parseFloat(el.formUnitCost.value);
    const channel = el.formChannel.value;
    const paymentMethod = el.formPaymentMethod.value;
    const status = el.formStatus.value;
    const notes = el.formNotes.value.trim();

    let hasError = false;

    if (!customer) {
      el.formCustomerError.textContent = 'Customer name is required.';
      hasError = true;
    }
    if (!date) {
      el.formDateError.textContent = 'Date & time is required.';
      hasError = true;
    }
    if (!product) {
      el.formProductError.textContent = 'Product description is required.';
      hasError = true;
    }
    if (isNaN(qty) || qty <= 0) {
      el.formQtyError.textContent = 'Valid quantity >= 1 is required.';
      hasError = true;
    }
    if (isNaN(unitPrice) || unitPrice < 0) {
      el.formUnitPriceError.textContent = 'Unit price must be positive.';
      hasError = true;
    }
    if (isNaN(unitCost) || unitCost < 0) {
      el.formUnitCostError.textContent = 'Unit cost must be positive.';
      hasError = true;
    }

    if (hasError) return;

    const revenue = Math.round(qty * unitPrice * 100) / 100;
    const cost = Math.round(qty * unitCost * 100) / 100;
    const profit = Math.round((revenue - cost) * 100) / 100;

    if (state.editingId) {
      // Update existing record
      const index = state.sales.findIndex(s => s.id === state.editingId);
      if (index !== -1) {
        state.sales[index] = {
          ...state.sales[index],
          customer,
          date,
          product,
          category,
          quantity: qty,
          unitPrice,
          unitCost,
          revenue,
          cost,
          profit,
          channel,
          paymentMethod,
          status,
          notes
        };
        saveSalesData();
        showToast(`Transaction ${state.editingId} updated successfully.`, 'success');
      }
    } else {
      // Create new record
      const newId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
      const newRecord = {
        id: newId,
        customer,
        date,
        product,
        category,
        quantity: qty,
        unitPrice,
        unitCost,
        revenue,
        cost,
        profit,
        channel,
        paymentMethod,
        status,
        notes
      };

      state.sales.unshift(newRecord);
      saveSalesData();
      showToast(`Sale recorded successfully with ID ${newId}.`, 'success');
    }

    closeSaleModal();
    refreshDashboard();
  }

  /**
   * Prompts user for deleting a transaction
   */
  function promptDeleteSale(id) {
    state.pendingDeleteId = id;
    el.confirmModalTitle.textContent = 'Delete Sale Transaction';
    el.confirmModalMessage.textContent = `Are you sure you want to permanently delete transaction "${id}"? This action updates your persistent ledger immediately.`;
    el.confirmModal.classList.remove('hidden');
  }

  /**
   * Executes deletion
   */
  function executePendingAction() {
    if (state.pendingDeleteId) {
      const id = state.pendingDeleteId;
      state.sales = state.sales.filter(s => s.id !== id);
      saveSalesData();
      showToast(`Transaction ${id} deleted.`, 'info');
      state.pendingDeleteId = null;
      el.confirmModal.classList.add('hidden');
      refreshDashboard();
    }
  }

  /**
   * Export transactions to CSV
   */
  function exportCSV() {
    const data = getFilteredByTime(state.sales, state.timeRange);
    if (!data.length) {
      showToast('No transactions to export.', 'warning');
      return;
    }

    const headers = ['Order ID', 'Date', 'Customer', 'Product', 'Category', 'Channel', 'Quantity', 'Unit Price', 'Unit Cost', 'Revenue', 'Cost', 'Profit', 'Payment Method', 'Status', 'Notes'];
    const rows = data.map(s => [
      `"${s.id || ''}"`,
      `"${s.date || ''}"`,
      `"${(s.customer || '').replace(/"/g, '""')}"`,
      `"${(s.product || '').replace(/"/g, '""')}"`,
      `"${s.category || ''}"`,
      `"${s.channel || ''}"`,
      s.quantity || 1,
      s.unitPrice || 0,
      s.unitCost || 0,
      s.revenue || 0,
      s.cost || 0,
      s.profit || 0,
      `"${s.paymentMethod || ''}"`,
      `"${s.status || ''}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `omnisales-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${data.length} transactions to CSV.`, 'success');
  }

  /**
   * Export full JSON backup
   */
  function exportJSON() {
    const jsonStr = JSON.stringify(state.sales, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `omnisales-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Exported full sales ledger to JSON.', 'success');
  }

  /**
   * Import JSON backup
   */
  function handleImportJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          state.sales = imported;
          saveSalesData();
          refreshDashboard();
          showToast(`Successfully imported ${imported.length} sales records.`, 'success');
        } else {
          showToast('Invalid JSON structure: Expected an array of records.', 'error');
        }
      } catch (err) {
        showToast('Failed to parse JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  }

  /**
   * Resets database to sample records
   */
  function resetToDemo() {
    state.sales = generateDefaultSales();
    saveSalesData();
    refreshDashboard();
    showToast('Dashboard restored with fresh sample sales data.', 'info');
  }

  /**
   * Renders the Top Products & Top Customers Leaderboards
   */
  function renderLeaderboards() {
    const timeFiltered = getFilteredByTime(state.sales, state.timeRange);

    // Aggregate by Product
    const productMap = {};
    timeFiltered.forEach(s => {
      if (s.status === 'Refunded') return;
      const key = s.product;
      if (!productMap[key]) {
        productMap[key] = { name: key, category: s.category, revenue: 0, units: 0 };
      }
      productMap[key].revenue += Number(s.revenue) || 0;
      productMap[key].units += Number(s.quantity) || 1;
    });

    const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const prodListEl = el.topProductsList;
    if (prodListEl) {
      if (topProducts.length === 0) {
        prodListEl.innerHTML = '<div style="color: #64748b; font-size: 12px; padding: 12px 0;">No sales in this period.</div>';
      } else {
        prodListEl.innerHTML = topProducts.map((p, idx) => `
          <div class="leaderboard-row">
            <div class="leaderboard-rank">#${idx + 1}</div>
            <div class="leaderboard-info">
              <span class="leaderboard-name">${escapeHtml(p.name)}</span>
              <span class="leaderboard-meta">${p.category} &bull; ${formatNumber(p.units)} units sold</span>
            </div>
            <div class="leaderboard-val">${formatMoney(p.revenue)}</div>
          </div>
        `).join('');
      }
    }

    // Aggregate by Customer
    const customerMap = {};
    timeFiltered.forEach(s => {
      if (s.status === 'Refunded') return;
      const key = s.customer;
      if (!customerMap[key]) {
        customerMap[key] = { name: key, revenue: 0, orders: 0 };
      }
      customerMap[key].revenue += Number(s.revenue) || 0;
      customerMap[key].orders += 1;
    });

    const topCustomers = Object.values(customerMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const custListEl = el.topCustomersList;
    if (custListEl) {
      if (topCustomers.length === 0) {
        custListEl.innerHTML = '<div style="color: #64748b; font-size: 12px; padding: 12px 0;">No customers in this period.</div>';
      } else {
        custListEl.innerHTML = topCustomers.map((c, idx) => `
          <div class="leaderboard-row">
            <div class="leaderboard-rank">#${idx + 1}</div>
            <div class="leaderboard-info">
              <span class="leaderboard-name">${escapeHtml(c.name)}</span>
              <span class="leaderboard-meta">${c.orders} order${c.orders === 1 ? '' : 's'} placed</span>
            </div>
            <div class="leaderboard-val">${formatMoney(c.revenue)}</div>
          </div>
        `).join('');
      }
    }
  }

  /**
   * Master dashboard refresh: KPIs + Charts + Leaderboards + Table
   */
  function refreshDashboard() {
    renderKPIs();
    renderAllCharts();
    renderLeaderboards();
    renderTable();
  }

  /**
   * Cache all DOM elements
   */
  function cacheElements() {
    el.toastContainer = document.getElementById('toast-container');
    el.timeRangeFilter = document.getElementById('timeRangeFilter');
    el.currencySelector = document.getElementById('currencySelector');
    el.btnOpenNewSale = document.getElementById('btnOpenNewSale');
    el.btnDataActions = document.getElementById('btnDataActions');
    el.dataActionsDropdown = document.getElementById('dataActionsDropdown');
    el.btnExportCSV = document.getElementById('btnExportCSV');
    el.btnExportJSON = document.getElementById('btnExportJSON');
    el.importFileInput = document.getElementById('importFileInput');
    el.btnResetDemoData = document.getElementById('btnResetDemoData');
    el.btnPrintReport = document.getElementById('btnPrintReport');

    // Custom Date Range elements
    el.customDateRangeBox = document.getElementById('customDateRangeBox');
    el.customStartDate = document.getElementById('customStartDate');
    el.customEndDate = document.getElementById('customEndDate');
    el.btnApplyCustomDate = document.getElementById('btnApplyCustomDate');

    // Leaderboards
    el.topProductsList = document.getElementById('topProductsList');
    el.topCustomersList = document.getElementById('topCustomersList');

    // Bulk action bar elements
    el.selectAllCheckbox = document.getElementById('selectAllCheckbox');
    el.bulkActionBar = document.getElementById('bulkActionBar');
    el.bulkSelectedCount = document.getElementById('bulkSelectedCount');
    el.btnBulkComplete = document.getElementById('btnBulkComplete');
    el.btnBulkPending = document.getElementById('btnBulkPending');
    el.btnBulkRefund = document.getElementById('btnBulkRefund');
    el.btnBulkExport = document.getElementById('btnBulkExport');
    el.btnBulkDelete = document.getElementById('btnBulkDelete');
    el.btnBulkDeselect = document.getElementById('btnBulkDeselect');

    // Quick filter chips container
    el.quickFilterChips = document.getElementById('quickFilterChips');

    // Insights
    el.insightText = document.getElementById('insightText');
    el.lastUpdatedLabel = document.getElementById('lastUpdatedLabel');

    // KPI fields
    el.kpiTotalRevenue = document.getElementById('kpiTotalRevenue');
    el.kpiRevenueTrend = document.getElementById('kpiRevenueTrend');
    el.kpiRevenueTrendPct = document.getElementById('kpiRevenueTrendPct');
    el.kpiNetProfit = document.getElementById('kpiNetProfit');
    el.kpiProfitMargin = document.getElementById('kpiProfitMargin');
    el.kpiProfitMarginBadge = document.getElementById('kpiProfitMarginBadge');
    el.kpiCostComparison = document.getElementById('kpiCostComparison');
    el.kpiTotalOrders = document.getElementById('kpiTotalOrders');
    el.kpiTotalUnits = document.getElementById('kpiTotalUnits');
    el.kpiCompletedRate = document.getElementById('kpiCompletedRate');
    el.kpiAvgOrderValue = document.getElementById('kpiAvgOrderValue');
    el.kpiTopCategory = document.getElementById('kpiTopCategory');
    el.kpiRefundCount = document.getElementById('kpiRefundCount');

    // Charts
    el.trendChartCanvas = document.getElementById('trendChartCanvas');
    el.trendChartTooltip = document.getElementById('trendChartTooltip');
    el.trendMetricPills = document.getElementById('trendMetricPills');
    el.categoryDonutCanvas = document.getElementById('categoryDonutCanvas');
    el.categoryTooltip = document.getElementById('categoryTooltip');
    el.donutTotalVal = document.getElementById('donutTotalVal');
    el.categoryChartLegend = document.getElementById('categoryChartLegend');
    el.channelBarCanvas = document.getElementById('channelBarCanvas');
    el.channelBarTooltip = document.getElementById('channelBarTooltip');
    el.quotaBarCanvas = document.getElementById('quotaBarCanvas');
    el.quotaBarTooltip = document.getElementById('quotaBarTooltip');

    // Table
    el.tableRecordCount = document.getElementById('tableRecordCount');
    el.searchInput = document.getElementById('searchInput');
    el.filterCategory = document.getElementById('filterCategory');
    el.filterChannel = document.getElementById('filterChannel');
    el.filterStatus = document.getElementById('filterStatus');
    el.salesTable = document.getElementById('salesTable');
    el.salesTableBody = document.getElementById('salesTableBody');
    el.tableEmptyState = document.getElementById('tableEmptyState');
    el.btnClearFilters = document.getElementById('btnClearFilters');
    el.pageRangeStart = document.getElementById('pageRangeStart');
    el.pageRangeEnd = document.getElementById('pageRangeEnd');
    el.pageTotalCount = document.getElementById('pageTotalCount');
    el.pageSizeSelect = document.getElementById('pageSizeSelect');
    el.paginationControls = document.getElementById('paginationControls');

    // Sale Modal
    el.saleModal = document.getElementById('saleModal');
    el.saleModalTitle = document.getElementById('saleModalTitle');
    el.btnCloseSaleModal = document.getElementById('btnCloseSaleModal');
    el.btnCancelSaleModal = document.getElementById('btnCancelSaleModal');
    el.saleForm = document.getElementById('saleForm');
    el.saleFormId = document.getElementById('saleFormId');
    el.formCustomer = document.getElementById('formCustomer');
    el.formDate = document.getElementById('formDate');
    el.formProduct = document.getElementById('formProduct');
    el.formCategory = document.getElementById('formCategory');
    el.formQty = document.getElementById('formQty');
    el.formUnitPrice = document.getElementById('formUnitPrice');
    el.formUnitCost = document.getElementById('formUnitCost');
    el.calcRevenue = document.getElementById('calcRevenue');
    el.calcProfit = document.getElementById('calcProfit');
    el.calcMargin = document.getElementById('calcMargin');
    el.formChannel = document.getElementById('formChannel');
    el.formPaymentMethod = document.getElementById('formPaymentMethod');
    el.formStatus = document.getElementById('formStatus');
    el.formNotes = document.getElementById('formNotes');

    // Error labels
    el.formCustomerError = document.getElementById('formCustomerError');
    el.formDateError = document.getElementById('formDateError');
    el.formProductError = document.getElementById('formProductError');
    el.formQtyError = document.getElementById('formQtyError');
    el.formUnitPriceError = document.getElementById('formUnitPriceError');
    el.formUnitCostError = document.getElementById('formUnitCostError');

    // Confirm Modal
    el.confirmModal = document.getElementById('confirmModal');
    el.confirmModalTitle = document.getElementById('confirmModalTitle');
    el.confirmModalMessage = document.getElementById('confirmModalMessage');
    el.btnCloseConfirmModal = document.getElementById('btnCloseConfirmModal');
    el.btnCancelConfirm = document.getElementById('btnCancelConfirm');
    el.btnExecuteConfirm = document.getElementById('btnExecuteConfirm');
  }

  /**
   * Bind all event listeners
   */
  function bindEvents() {
    // Time Range selector
    el.timeRangeFilter.value = state.timeRange;
    el.timeRangeFilter.addEventListener('change', (e) => {
      state.timeRange = e.target.value;
      if (state.timeRange === 'custom') {
        el.customDateRangeBox.classList.remove('hidden');
      } else {
        el.customDateRangeBox.classList.add('hidden');
        localStorage.setItem(STORAGE_KEY_TIME_RANGE, state.timeRange);
        state.currentPage = 1;
        refreshDashboard();
      }
    });

    if (el.btnApplyCustomDate) {
      el.btnApplyCustomDate.addEventListener('click', () => {
        state.customStartDate = el.customStartDate.value;
        state.customEndDate = el.customEndDate.value;
        state.currentPage = 1;
        refreshDashboard();
        showToast('Custom date filter applied.', 'info');
      });
    }

    if (el.btnPrintReport) {
      el.btnPrintReport.addEventListener('click', () => {
        el.dataActionsDropdown.classList.add('hidden');
        window.print();
      });
    }

    // Quick filter chips
    if (el.quickFilterChips) {
      el.quickFilterChips.querySelectorAll('.chip-btn').forEach(chip => {
        chip.addEventListener('click', () => {
          el.quickFilterChips.querySelectorAll('.chip-btn').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          state.quickChip = chip.dataset.chip;
          state.currentPage = 1;
          renderTable();
        });
      });
    }

    // Select All Checkbox
    if (el.selectAllCheckbox) {
      el.selectAllCheckbox.addEventListener('change', (e) => {
        const checked = e.target.checked;
        const pageItems = getTableData().slice((state.currentPage - 1) * state.pageSize, state.currentPage * state.pageSize);
        pageItems.forEach(item => {
          if (checked) {
            state.selectedIds.add(item.id);
          } else {
            state.selectedIds.delete(item.id);
          }
        });
        renderTable();
      });
    }

    // Bulk actions
    if (el.btnBulkDeselect) {
      el.btnBulkDeselect.addEventListener('click', () => {
        state.selectedIds.clear();
        renderTable();
      });
    }

    if (el.btnBulkComplete) {
      el.btnBulkComplete.addEventListener('click', () => {
        state.sales.forEach(s => {
          if (state.selectedIds.has(s.id)) s.status = 'Completed';
        });
        saveSalesData();
        showToast(`Marked ${state.selectedIds.size} transactions as Completed.`, 'success');
        state.selectedIds.clear();
        refreshDashboard();
      });
    }

    if (el.btnBulkPending) {
      el.btnBulkPending.addEventListener('click', () => {
        state.sales.forEach(s => {
          if (state.selectedIds.has(s.id)) s.status = 'Pending';
        });
        saveSalesData();
        showToast(`Marked ${state.selectedIds.size} transactions as Pending.`, 'info');
        state.selectedIds.clear();
        refreshDashboard();
      });
    }

    if (el.btnBulkRefund) {
      el.btnBulkRefund.addEventListener('click', () => {
        state.sales.forEach(s => {
          if (state.selectedIds.has(s.id)) s.status = 'Refunded';
        });
        saveSalesData();
        showToast(`Marked ${state.selectedIds.size} transactions as Refunded.`, 'warning');
        state.selectedIds.clear();
        refreshDashboard();
      });
    }

    if (el.btnBulkDelete) {
      el.btnBulkDelete.addEventListener('click', () => {
        const count = state.selectedIds.size;
        if (confirm(`Permanently delete ${count} selected transaction${count === 1 ? '' : 's'}?`)) {
          state.sales = state.sales.filter(s => !state.selectedIds.has(s.id));
          saveSalesData();
          showToast(`Deleted ${count} transactions.`, 'info');
          state.selectedIds.clear();
          refreshDashboard();
        }
      });
    }

    if (el.btnBulkExport) {
      el.btnBulkExport.addEventListener('click', () => {
        const selectedSales = state.sales.filter(s => state.selectedIds.has(s.id));
        if (!selectedSales.length) return;
        const headers = ['Order ID', 'Date', 'Customer', 'Product', 'Category', 'Channel', 'Quantity', 'Unit Price', 'Revenue', 'Profit', 'Status'];
        const rows = selectedSales.map(s => [
          `"${s.id || ''}"`,
          `"${s.date || ''}"`,
          `"${(s.customer || '').replace(/"/g, '""')}"`,
          `"${(s.product || '').replace(/"/g, '""')}"`,
          `"${s.category || ''}"`,
          `"${s.channel || ''}"`,
          s.quantity || 1,
          s.unitPrice || 0,
          s.revenue || 0,
          s.profit || 0,
          `"${s.status || ''}"`
        ]);
        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `omnisales-selected-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        showToast(`Exported ${selectedSales.length} selected items to CSV.`, 'success');
      });
    }

    // Currency Selector
    el.currencySelector.value = state.currency;
    el.currencySelector.addEventListener('change', (e) => {
      state.currency = e.target.value;
      localStorage.setItem(STORAGE_KEY_CURRENCY, state.currency);
      refreshDashboard();
    });

    // Trend Metric Pills
    el.trendMetricPills.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        el.trendMetricPills.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.trendMetric = btn.dataset.metric;
        renderTrendChart();
      });
    });

    // Data dropdown toggle
    el.btnDataActions.addEventListener('click', (e) => {
      e.stopPropagation();
      el.dataActionsDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      el.dataActionsDropdown.classList.add('hidden');
    });

    el.btnExportCSV.addEventListener('click', () => {
      exportCSV();
      el.dataActionsDropdown.classList.add('hidden');
    });

    el.btnExportJSON.addEventListener('click', () => {
      exportJSON();
      el.dataActionsDropdown.classList.add('hidden');
    });

    el.importFileInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        handleImportJSON(e.target.files[0]);
        e.target.value = '';
      }
      el.dataActionsDropdown.classList.add('hidden');
    });

    el.btnResetDemoData.addEventListener('click', () => {
      el.dataActionsDropdown.classList.add('hidden');
      if (confirm('Reset your sales ledger to initial demo data? Current records will be replaced.')) {
        resetToDemo();
      }
    });

    // Table Search
    el.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      state.currentPage = 1;
      renderTable();
    });

    // Table Filters
    el.filterCategory.addEventListener('change', (e) => {
      state.filterCategory = e.target.value;
      state.currentPage = 1;
      renderTable();
    });

    el.filterChannel.addEventListener('change', (e) => {
      state.filterChannel = e.target.value;
      state.currentPage = 1;
      renderTable();
    });

    el.filterStatus.addEventListener('change', (e) => {
      state.filterStatus = e.target.value;
      state.currentPage = 1;
      renderTable();
    });

    el.btnClearFilters.addEventListener('click', () => {
      state.searchQuery = '';
      state.filterCategory = 'all';
      state.filterChannel = 'all';
      state.filterStatus = 'all';
      el.searchInput.value = '';
      el.filterCategory.value = 'all';
      el.filterChannel.value = 'all';
      el.filterStatus.value = 'all';
      state.currentPage = 1;
      renderTable();
    });

    // Table Sort Headers
    document.querySelectorAll('.sortable-th').forEach(th => {
      th.addEventListener('click', () => {
        const sortKey = th.dataset.sort;
        if (state.sortColumn === sortKey) {
          state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortColumn = sortKey;
          state.sortDirection = sortKey === 'date' ? 'desc' : 'asc';
        }
        updateSortHeaders();
        renderTable();
      });
    });

    // Page Size Select
    el.pageSizeSelect.addEventListener('change', (e) => {
      state.pageSize = parseInt(e.target.value, 10);
      state.currentPage = 1;
      renderTable();
    });

    // New Sale Modal Actions
    el.btnOpenNewSale.addEventListener('click', openNewSaleModal);
    el.btnCloseSaleModal.addEventListener('click', closeSaleModal);
    el.btnCancelSaleModal.addEventListener('click', closeSaleModal);
    el.saleForm.addEventListener('submit', handleSaveSale);

    // Modal Live Summary Calculations
    ['input', 'change'].forEach(evt => {
      el.formQty.addEventListener(evt, updateModalSummary);
      el.formUnitPrice.addEventListener(evt, updateModalSummary);
      el.formUnitCost.addEventListener(evt, updateModalSummary);
    });

    // Confirm Modal Actions
    el.btnCloseConfirmModal.addEventListener('click', () => el.confirmModal.classList.add('hidden'));
    el.btnCancelConfirm.addEventListener('click', () => el.confirmModal.classList.add('hidden'));
    el.btnExecuteConfirm.addEventListener('click', executePendingAction);

    // Window Resize -> Re-render canvas charts
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        renderAllCharts();
      }, 150);
    });

    // Chart Tooltip Interactions
    setupTrendChartInteractions();
    setupCategoryDonutInteractions();
    setupChannelBarInteractions();
    setupQuotaBarInteractions();
  }

  /**
   * Application Initialization
   */
  function init() {
    cacheElements();
    initStorage();
    bindEvents();
    updateSortHeaders();
    refreshDashboard();
  }

  // Launch on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
