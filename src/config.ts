import 'dotenv/config';

export interface AppConfig {
  openvoltApiKey: string;
  openvoltApiHost: string;
  carbonIntensityApiHost: string;
  meterId: string;
  reportFrom: string;
  reportTo: string;
  mockMode: boolean;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

export function loadConfig(): AppConfig {
  const mockMode = process.env.MOCK_MODE === 'true' || process.argv.includes('--mock');

  return {
    openvoltApiKey: optionalEnv('OPENVOLT_API_KEY', ''),
    openvoltApiHost: optionalEnv('OPENVOLT_API_HOST', 'https://api.openvolt.com'),
    carbonIntensityApiHost: optionalEnv('CARBON_INTENSITY_API_HOST', 'https://api.carbonintensity.org.uk'),
    meterId: optionalEnv('METER_ID', '6514167223e3d1424bf82742'),
    reportFrom: optionalEnv('REPORT_FROM', '2023-01-01T00:00:00.000Z'),
    reportTo: optionalEnv('REPORT_TO', '2023-02-01T00:00:00.000Z'),
    mockMode,
  };
}

export function assertCanCallOpenvolt(config: AppConfig): void {
  if (config.mockMode) return;
  if (!config.openvoltApiKey) {
    throw new Error('Missing OPENVOLT_API_KEY. Copy .env.example to .env and paste the challenge x-api-key.');
  }
}
