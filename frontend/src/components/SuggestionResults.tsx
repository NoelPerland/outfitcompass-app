import type { RecommendationItem, Suggestion, WeatherSummary } from "../lib/types";

type SuggestionResultsProps = {
  suggestions: Suggestion[];
  weatherSummary: WeatherSummary | null;
  isLoading: boolean;
  onSave: (suggestion: Suggestion) => void;
  saveBusy: Record<string, boolean>;
  savedTemplateIds: Set<string>;
  canSave: boolean;
};

function getItemIcon(item: RecommendationItem) {
  const key = `${item.category} ${item.name}`.toLowerCase();

  if (
    key.includes("shoe") ||
    key.includes("boot") ||
    key.includes("loafer") ||
    key.includes("sneaker")
  ) {
    return "👟";
  }

  if (
    key.includes("coat") ||
    key.includes("jacket") ||
    key.includes("blazer") ||
    key.includes("trench")
  ) {
    return "🧥";
  }

  if (
    key.includes("pant") ||
    key.includes("trouser") ||
    key.includes("skirt") ||
    key.includes("short") ||
    key.includes("jean")
  ) {
    return "👖";
  }

  return "👕";
}

export function SuggestionResults({
  suggestions,
  weatherSummary,
  isLoading,
  onSave,
  saveBusy,
  savedTemplateIds,
  canSave
}: SuggestionResultsProps) {
  return (
    <section className="section">
      <div className="section-heading">
        <span className="eyebrow">Looks</span>
        <h2>Outfits</h2>
        {weatherSummary ? <p>{weatherSummary.summary}</p> : null}
      </div>

      {isLoading ? (
        <div className="results-list" aria-live="polite" role="status">
          {[1, 2, 3].map((card) => (
            <article className="result-card result-card-loading" key={card}>
              <span className="skeleton-line short" />
              <span className="skeleton-line wide" />
              <span className="skeleton-line medium" />
            </article>
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="empty-state" role="status" aria-live="polite">
          Pick a mood and show outfits.
        </div>
      ) : (
        <div className="results-list" role="status" aria-live="polite">
          {suggestions.map((suggestion) => {
            const isSaved = savedTemplateIds.has(suggestion.templateId);

            return (
              <article className="result-card" key={suggestion.id}>
                <div className="result-preview" aria-hidden="true">
                  <div className="palette-dots" aria-label="Outfit colors">
                    {suggestion.paletteColors.slice(0, 4).map((color, index) => (
                      <span
                        className={`palette-dot palette-dot-${(index % 4) + 1}`}
                        key={`${suggestion.id}-${color}`}
                      />
                    ))}
                  </div>
                  <div className="preview-icons">
                    {suggestion.items.slice(0, 3).map((item) => (
                      <span className="preview-icon" key={`${suggestion.id}-${item.name}`}>
                        {getItemIcon(item)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="result-top">
                  <h3>{suggestion.title}</h3>
                  <button
                    type="button"
                    className={`icon-button ${isSaved ? "is-saved" : ""}`}
                    disabled={!canSave || isSaved || saveBusy[suggestion.id]}
                    onClick={() => onSave(suggestion)}
                    aria-label={isSaved ? "Saved" : canSave ? "Save outfit" : "Login to save"}
                  >
                    {isSaved ? "♥" : "♡"}
                  </button>
                </div>

                <ul className="item-list simple-list">
                  {suggestion.items.slice(0, 5).map((item) => (
                    <li key={`${suggestion.id}-${item.category}-${item.name}`}>
                      <span>{getItemIcon(item)}</span>
                      <span>{item.name}</span>
                    </li>
                  ))}
                </ul>

                <p className="result-note">{suggestion.practicalNote}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
