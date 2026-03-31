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
    <section className="panel section-panel">
      <div className="section-heading">
        <h2>Add the weather.</h2>
        <p>Use your location or enter it yourself.</p>
      </div>

      <div className="weather-layout">
        <article className="weather-card weather-card-geo">
          <div className="weather-card-head">
            <span className="panel-pill">⌖ Live weather</span>
            <h3>My location</h3>
          </div>
          <div className="weather-hero-mark" aria-hidden="true">
            <span className="weather-hero-icon">📍</span>
          </div>
          <p>{locationMessage}</p>
          <div className="weather-card-footer">
            <button
              type="button"
              className="primary-button"
              disabled={isLoading}
              onClick={onUseLocation}
            >
              {isLoading ? "Checking local weather..." : "Get local weather"}
            </button>
          </div>
        </article>

        <article className="weather-card weather-card-manual">
          <div className="weather-card-head">
            <span className="panel-pill">✦ Manual control</span>
            <h3>Manual</h3>
          </div>
          <div className="weather-hero-mark" aria-hidden="true">
            <span className="weather-hero-icon">📝</span>
          </div>

          <div className="manual-grid">
            <label className="input-field">
              <span>🌡 Temperature</span>
              <input
                type="number"
                value={manualTemperature}
                onChange={(event) => onTemperatureChange(Number(event.target.value))}
              />
            </label>

            <label className="input-field">
              <span>☁ Condition</span>
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
          <div className="weather-card-footer">
            <button
              type="button"
              className="primary-button secondary"
              disabled={isLoading}
              onClick={onSubmitManual}
            >
              {isLoading ? "Finding curated looks..." : "Show outfit ideas"}
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
