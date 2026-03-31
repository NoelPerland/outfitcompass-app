import { conditions } from "../lib/constants";
import type { Condition, WeatherMode } from "../lib/types";

type WeatherSectionProps = {
  mode: WeatherMode;
  manualTemperature: number;
  manualCondition: Condition;
  isLoading: boolean;
  onModeChange: (mode: WeatherMode) => void;
  onTemperatureChange: (value: number) => void;
  onConditionChange: (condition: Condition) => void;
  onSubmit: () => void;
};

export function WeatherSection({
  mode,
  manualTemperature,
  manualCondition,
  isLoading,
  onModeChange,
  onTemperatureChange,
  onConditionChange,
  onSubmit
}: WeatherSectionProps) {
  return (
    <section className="section">
      <div className="section-heading">
        <span className="eyebrow">Weather</span>
        <h2>Weather</h2>
      </div>

      <div className="weather-toggle" role="tablist" aria-label="Weather mode">
        <button
          type="button"
          className={`toggle-chip ${mode === "geo" ? "is-active" : ""}`}
          onClick={() => onModeChange("geo")}
        >
          <span aria-hidden="true">📍</span>
          <span>Use my location</span>
        </button>
        <button
          type="button"
          className={`toggle-chip ${mode === "manual" ? "is-active" : ""}`}
          onClick={() => onModeChange("manual")}
        >
          <span aria-hidden="true">☁️</span>
          <span>Manual</span>
        </button>
      </div>

      {mode === "manual" ? (
        <div className="manual-grid">
          <label className="field">
            <span>Temperature</span>
            <input
              type="number"
              value={manualTemperature}
              onChange={(event) => onTemperatureChange(Number(event.target.value))}
            />
          </label>

          <label className="field">
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
      ) : null}

      <button type="button" className="primary-button" disabled={isLoading} onClick={onSubmit}>
        {isLoading ? "Loading..." : "Show outfits"}
      </button>
    </section>
  );
}
