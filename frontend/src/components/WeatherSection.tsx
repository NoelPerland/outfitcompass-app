import { conditions } from "../lib/constants";
import type { Condition } from "../lib/types";

type WeatherSectionProps = {
  manualTemperature: number;
  manualCondition: Condition;
  isLoading: boolean;
  locationMessage: string;
  onTemperatureChange: (value: number) => void;
  onConditionChange: (condition: Condition) => void;
  onUseLocation: () => void;
  onSubmitManual: () => void;
};

export function WeatherSection({
  manualTemperature,
  manualCondition,
  isLoading,
  locationMessage,
  onTemperatureChange,
  onConditionChange,
  onUseLocation,
  onSubmitManual
}: WeatherSectionProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Weather</p>
        <h2>Let&apos;s pair that mood with the weather.</h2>
        <p>Use your location for a quick read, or enter the weather manually.</p>
      </div>

      <div className="weather-layout">
        <div className="weather-card">
          <h3>Use my location</h3>
          <p>{locationMessage}</p>
          <button type="button" className="primary-button" disabled={isLoading} onClick={onUseLocation}>
            {isLoading ? "Checking local weather..." : "Use local weather"}
          </button>
        </div>

        <div className="weather-card">
          <h3>Enter it manually</h3>
          <div className="manual-grid">
            <label>
              <span>Temperature (&deg;C)</span>
              <input
                type="number"
                value={manualTemperature}
                onChange={(event) => onTemperatureChange(Number(event.target.value))}
              />
            </label>
            <label>
              <span>Condition</span>
              <select
                value={manualCondition}
                onChange={(event) => onConditionChange(event.target.value as Condition)}
              >
                {conditions.map((condition) => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="button"
            className="primary-button secondary"
            disabled={isLoading}
            onClick={onSubmitManual}
          >
            {isLoading ? "Finding looks..." : "Show outfit ideas"}
          </button>
        </div>
      </div>
    </section>
  );
}
