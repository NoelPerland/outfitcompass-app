import type { Suggestion, WeatherSummary } from "../lib/types";

type SuggestionResultsProps = {
  suggestions: Suggestion[];
  weatherSummary: WeatherSummary | null;
  onSave: (suggestion: Suggestion) => void;
  saveBusy: Record<string, boolean>;
  canSave: boolean;
};

export function SuggestionResults({
  suggestions,
  weatherSummary,
  onSave,
  saveBusy,
  canSave
}: SuggestionResultsProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Results</p>
        <h2>Here are a few looks that should feel right today.</h2>
        <p>
          {weatherSummary
            ? `Built around ${weatherSummary.summary}.`
            : "Run a weather check to see 3 to 5 practical outfit ideas."}
        </p>
      </div>

      {suggestions.length === 0 ? (
        <div className="empty-state" role="status" aria-live="polite">
          Pick your mood, add the weather, and we’ll pull together a few easy options.
        </div>
      ) : (
        <div className="suggestions-grid" role="status" aria-live="polite">
          {suggestions.map((suggestion) => (
            <article className="suggestion-card" key={suggestion.id}>
              <div className="suggestion-top">
                <div>
                  <h3>{suggestion.title}</h3>
                  <p>{suggestion.practicalNote}</p>
                </div>
                <div className="palette-row" aria-label="Recommended color palette">
                  {suggestion.paletteColors.map((color) => (
                    <span className="color-chip" key={`${suggestion.id}-${color}`}>
                      {color}
                    </span>
                  ))}
                </div>
              </div>
              <ul className="item-list">
                {suggestion.items.map((item) => (
                  <li key={`${suggestion.id}-${item.category}-${item.name}`}>
                    <span className="item-name">{item.name}</span>
                    <span className="item-meta">
                      {item.category} in {item.color}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="ghost-button"
                disabled={!canSave || saveBusy[suggestion.id]}
                onClick={() => onSave(suggestion)}
              >
                {canSave
                  ? saveBusy[suggestion.id]
                    ? "Saving..."
                    : "Save this outfit"
                  : "Log in to save this outfit"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
