import { conditions, weatherModes } from "../lib/constants";
import type { Condition, WeatherMode } from "../lib/types";

type WeatherSectionProps = {
  weatherMode: WeatherMode;
  manualTemperature: number;
  manualCondition: Condition;
  isLoading: boolean;
  locationMessage: string;
  onModeChange: (mode: WeatherMode) => void;
  onTemperatureChange: (value: number) => void;
  onConditionChange: (condition: Condition) => void;
  onSubmit: () => void;
};

export function WeatherSection({
  weatherMode,
  manualTemperature,
  manualCondition,
  isLoading,
  locationMessage,
  onModeChange,
  onTemperatureChange,
  onConditionChange,
  onSubmit
}: WeatherSectionProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Weather</p>
        <h2>Let’s pair that mood with the weather.</h2>
        <p>Use your location for a quick read, or enter the weather manually.</p>
      </div>

      <div className="mode-toggle" role="radiogroup" aria-label="Weather input mode">
        {weatherModes.map((mode) => (
          <button
            key={mode.value}
            type="button"
            role="radio"
            aria-checked={weatherMode === mode.value}
            className={`mode-pill ${weatherMode === mode.value ? "is-active" : ""}`}
            onClick={() => onModeChange(mode.value)}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="weather-layout">
        <div className={`weather-card ${weatherMode === "geo" ? "is-active" : ""}`}>
          <h3>Use my location</h3>
          <p>{locationMessage}</p>
          <button
            type="button"
            className="primary-button"
            disabled={isLoading || weatherMode !== "geo"}
            onClick={onSubmit}
          >
            {isLoading && weatherMode === "geo" ? "Checking local weather..." : "Use local weather"}
          </button>
        </div>

        <div className={`weather-card ${weatherMode === "manual" ? "is-active" : ""}`}>
          <h3>Enter it manually</h3>
          <div className="manual-grid">
            <label>
              <span>Temperature (°C)</span>
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
            disabled={isLoading || weatherMode !== "manual"}
            onClick={onSubmit}
          >
            {isLoading && weatherMode === "manual" ? "Finding looks..." : "Show outfit ideas"}
          </button>
        </div>
      </div>
    </section>
  );
}
