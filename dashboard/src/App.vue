<script setup lang="ts">
import { computed, ref } from 'vue';
import reportData from '../../output/stark-january-2023-report.json';

// Reactive state for the report data
const report = ref(reportData);

// Format numbers nicely
const formatNumber = (num: number, decimals: number = 0) => {
  return new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

// Calculate absolute kWh for each fuel type
const fuelDetails = computed(() => {
  const totalKwh = report.value.totals.energyKwh;
  return Object.entries(report.value.fuelMixPercent).map(([fuel, percent]) => {
    const kwh = totalKwh * (percent / 100);
    return {
      name: fuel,
      percent,
      kwh,
    };
  });
});

// Format dates for display
const formatDate = (isoString: string) => {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }) + ' UTC';
};

// Data Quality Warnings check
const hasWarnings = computed(() => {
  const dq = report.value.dataQuality;
  return (
    dq.missingMeterIntervalStarts.length > 0 ||
    dq.duplicateMeterIntervalStarts.length > 0 ||
    dq.missingCarbonIntensityStarts.length > 0 ||
    dq.missingGenerationMixStarts.length > 0 ||
    dq.alignedIntervals !== dq.expectedHalfHourlyIntervals
  );
});

// Get color variables dynamically based on fuel names
const getFuelColor = (fuel: string) => {
  switch (fuel.toLowerCase()) {
    case 'gas': return 'var(--color-gas)';
    case 'coal': return 'var(--color-coal)';
    case 'nuclear': return 'var(--color-nuclear)';
    case 'wind': return 'var(--color-wind)';
    case 'solar': return 'var(--color-solar)';
    case 'hydro': return 'var(--color-hydro)';
    case 'biomass': return 'var(--color-biomass)';
    case 'imports': return 'var(--color-imports)';
    default: return 'var(--color-other)';
  }
};
</script>

<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header>
      <div class="brand-section">
        <h1>
          <span>⚡</span> Stark Energy Telemetry
        </h1>
        <p>Stark Industries UK HQ — January 2023 Performance</p>
      </div>
      <div class="telemetry-status">
        <div class="status-badge">
          <span class="status-indicator"></span>
          Telemetry Connected
        </div>
      </div>
    </header>

    <!-- KPI Grid -->
    <section class="kpi-grid">
      <!-- Energy Card -->
      <div class="glass-card kpi-card energy">
        <div class="kpi-label">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          Total Consumption
        </div>
        <div>
          <div class="kpi-value">{{ formatNumber(report.totals.energyKwh) }} <span style="font-size: 1.5rem; font-weight: 500; color: var(--text-secondary)">kWh</span></div>
          <div class="kpi-subtext">Consumed across January 2023</div>
        </div>
      </div>

      <!-- Carbon Emitted Card -->
      <div class="glass-card kpi-card carbon">
        <div class="kpi-label">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
          </svg>
          Carbon Footprint
        </div>
        <div>
          <div class="kpi-value">{{ formatNumber(report.totals.co2Kg, 1) }} <span style="font-size: 1.5rem; font-weight: 500; color: var(--text-secondary)">kg CO₂</span></div>
          <div class="kpi-subtext">Equivalent to <strong>{{ formatNumber(report.totals.co2Kg / 1000, 2) }}</strong> tonnes of CO₂</div>
        </div>
      </div>

      <!-- Carbon Intensity Card -->
      <div class="glass-card kpi-card intensity">
        <div class="kpi-label">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
            <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
          </svg>
          Average Intensity
        </div>
        <div>
          <div class="kpi-value">{{ formatNumber(report.totals.averageCarbonIntensityGco2PerKwh, 2) }} <span style="font-size: 1.25rem; font-weight: 500; color: var(--text-secondary)">gCO₂/kWh</span></div>
          <div class="kpi-subtext">Weighted by interval consumption</div>
        </div>
      </div>
    </section>

    <!-- Main Grid -->
    <div class="dashboard-grid">
      <!-- Fuel Mix Panel -->
      <section class="glass-card fuel-mix-panel">
        <h2>Weighted Fuel Mix Analysis</h2>
        <div class="fuel-mix-list">
          <div v-for="fuel in fuelDetails" :key="fuel.name" class="fuel-row">
            <div class="fuel-header">
              <span class="fuel-name">
                <span class="fuel-color-indicator" :style="{ backgroundColor: getFuelColor(fuel.name) }"></span>
                {{ fuel.name }}
              </span>
              <span class="fuel-percentage">
                {{ formatNumber(fuel.percent, 2) }}% 
                <span style="font-size: 0.8rem; font-weight: 400; color: var(--text-muted); margin-left: 0.25rem;">
                  ({{ formatNumber(fuel.kwh) }} kWh)
                </span>
              </span>
            </div>
            <div class="fuel-track">
              <div 
                class="fuel-bar" 
                :style="{ 
                  width: fuel.percent + '%', 
                  backgroundColor: getFuelColor(fuel.name),
                  boxShadow: '0 0 8px ' + getFuelColor(fuel.name) + '40'
                }"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Data Quality & Quality Audit -->
      <section class="glass-card data-quality-panel">
        <h2>Data Quality Telemetry</h2>
        
        <div class="quality-stat-grid">
          <div class="quality-stat-box">
            <div class="quality-stat-label">Expected Intervals</div>
            <div class="quality-stat-val">{{ report.dataQuality.expectedHalfHourlyIntervals }}</div>
          </div>
          <div class="quality-stat-box">
            <div class="quality-stat-label">Aligned Intervals</div>
            <div class="quality-stat-val" :style="{ color: report.dataQuality.alignedIntervals === report.dataQuality.expectedHalfHourlyIntervals ? '#10b981' : '#f59e0b' }">
              {{ report.dataQuality.alignedIntervals }}
            </div>
          </div>
        </div>

        <!-- Alert Banner -->
        <div :class="['warnings-section', { 'success': !hasWarnings }]">
          <div v-if="hasWarnings">
            <div class="warnings-header amber">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Quality Warnings Detected
            </div>
            <ul>
              <li v-if="report.dataQuality.missingMeterIntervalStarts.length > 0" class="warning-item">
                Missing <strong>{{ report.dataQuality.missingMeterIntervalStarts.length }}</strong> meter intervals.
              </li>
              <li v-if="report.dataQuality.duplicateMeterIntervalStarts.length > 0" class="warning-item">
                Duplicate <strong>{{ report.dataQuality.duplicateMeterIntervalStarts.length }}</strong> meter timestamps detected.
              </li>
              <li v-if="report.dataQuality.missingCarbonIntensityStarts.length > 0" class="warning-item">
                Missing <strong>{{ report.dataQuality.missingCarbonIntensityStarts.length }}</strong> carbon intensity datapoints.
              </li>
              <li v-if="report.dataQuality.missingGenerationMixStarts.length > 0" class="warning-item">
                Missing <strong>{{ report.dataQuality.missingGenerationMixStarts.length }}</strong> generation mix datapoints.
              </li>
            </ul>
          </div>
          <div v-else>
            <div class="warnings-header green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              All Quality Checks Passed
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-left: 1.5rem;">
              Full alignment achieved (100% data integrity). No missing or duplicate intervals found.
            </p>
          </div>
        </div>

        <!-- Notes -->
        <div class="quality-notes">
          <p v-for="(note, index) in report.dataQuality.notes" :key="index">
            &bull; {{ note }}
          </p>
          <p style="margin-top: 0.5rem; font-size: 0.8rem;">
            * Calculations operate strictly on the aligned subset of intervals to guarantee accuracy.
          </p>
        </div>
      </section>
    </div>

    <!-- Assumptions Accordion -->
    <section class="glass-card assumptions-panel">
      <h2>Methodology & Assumptions</h2>
      <div class="assumptions-list">
        <div v-for="(assumption, idx) in report.assumptions" :key="idx" class="assumption-item">
          <span>[0{{ idx + 1 }}]</span>
          <div>{{ assumption }}</div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer>
      <p>Stark Energy Telemetry System | Telemetry Captured: {{ formatDate(report.generatedAt) }}</p>
      <p style="margin-top: 0.5rem; font-size: 0.75rem;">
        Powered by <a href="https://openvolt.com" target="_blank">Openvolt</a> &amp; National Grid ESO Carbon Intensity API.
      </p>
    </footer>
  </div>
</template>
