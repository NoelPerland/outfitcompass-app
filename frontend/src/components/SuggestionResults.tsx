import type { RecommendationItem, Suggestion, WeatherSummary } from "../lib/types";

type SuggestionResultsProps = {
  suggestions: Suggestion[];
  weatherSummary: WeatherSummary | null;
  isLoading: boolean;
  onSave: (suggestion: Suggestion) => void;
  onRefresh: (suggestionId: string) => void;
  saveBusy: Record<string, boolean>;
  refreshBusy: Record<string, boolean>;
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
  onRefresh,
  saveBusy,
  refreshBusy,
  savedTemplateIds,
  canSave
}: SuggestionResultsProps) {
  return (
    <section className="section section-animated">
      <div className="section-heading">
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
                  <span className="preview-badge">✨ Curated look</span>
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
                  <div className="result-actions">
                    <button
                      type="button"
                      className="icon-button"
                      disabled={refreshBusy[suggestion.id]}
                      onClick={() => onRefresh(suggestion.id)}
                      aria-label="Refresh outfit"
                    >
                      {refreshBusy[suggestion.id] ? "…" : "🔄"}
                    </button>
                    <button
                      type="button"
                      className={`icon-button ${isSaved ? "is-saved" : ""}`}
                      disabled={!canSave || isSaved || saveBusy[suggestion.id]}
                      onClick={() => onSave(suggestion)}
                      aria-label={isSaved ? "Saved" : canSave ? "Save outfit" : "Login to save"}
                    >
                      {isSaved ? "💖" : "🤍"}
                    </button>
                  </div>
                </div>

                <ul className="item-list simple-list">
                  {suggestion.items.slice(0, 5).map((item) => (
                    <li key={`${suggestion.id}-${item.category}-${item.name}`}>
                      <span>{getItemIcon(item)}</span>
                      <span>{item.name}</span>
                    </li>
                  ))}
                </ul>

                <p className="result-note">💡 {suggestion.practicalNote}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
