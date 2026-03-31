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

type PreviewLayer = {
  slot: "outerwear" | "top" | "bottom" | "shoes";
  label: string;
  color: string;
  icon: string;
};

const loadingCards = [1, 2, 3];
const previewOrder: PreviewLayer["slot"][] = ["outerwear", "top", "bottom", "shoes"];

function getItemSlot(item: RecommendationItem): PreviewLayer["slot"] {
  const key = `${item.category} ${item.name}`.toLowerCase();

  if (
    key.includes("coat") ||
    key.includes("jacket") ||
    key.includes("blazer") ||
    key.includes("trench") ||
    key.includes("parka")
  ) {
    return "outerwear";
  }

  if (
    key.includes("shoe") ||
    key.includes("boot") ||
    key.includes("loafer") ||
    key.includes("sneaker") ||
    key.includes("heel")
  ) {
    return "shoes";
  }

  if (
    key.includes("pant") ||
    key.includes("trouser") ||
    key.includes("skirt") ||
    key.includes("short") ||
    key.includes("denim") ||
    key.includes("jean")
  ) {
    return "bottom";
  }

  return "top";
}

function getSlotIcon(slot: PreviewLayer["slot"]) {
  switch (slot) {
    case "outerwear":
      return "◫";
    case "top":
      return "◌";
    case "bottom":
      return "▮";
    case "shoes":
      return "⌁";
  }
}

function createPreviewLayers(items: RecommendationItem[], paletteColors: string[]) {
  const selected = new Map<PreviewLayer["slot"], RecommendationItem>();

  for (const item of items) {
    const slot = getItemSlot(item);
    if (!selected.has(slot)) {
      selected.set(slot, item);
    }
  }

  return previewOrder.map((slot, index) => {
    const matched = selected.get(slot);
    return {
      slot,
      label: matched?.name ?? slot.charAt(0).toUpperCase() + slot.slice(1),
      color: matched?.color ?? paletteColors[index] ?? paletteColors[0] ?? "Tone",
      icon: getSlotIcon(slot)
    };
  });
}

function getItemIcon(item: RecommendationItem) {
  const slot = getItemSlot(item);
  switch (slot) {
    case "outerwear":
      return "◫";
    case "top":
      return "◌";
    case "bottom":
      return "▮";
    case "shoes":
      return "⌁";
  }
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
    <section className="panel section-panel">
      <div className="section-heading section-heading-inline">
        <div>
          <h2>Your outfit ideas.</h2>
          {weatherSummary ? <p>{`${weatherSummary.summary} • ${weatherSummary.tempBand}`}</p> : null}
        </div>

        {weatherSummary ? (
          <div className="summary-chip">
            <span>☁ {weatherSummary.condition}</span>
            <strong>
              {Math.round(weatherSummary.temperatureC)}
              {"\u00B0C"}
            </strong>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <div className="suggestions-grid" aria-live="polite" role="status">
          {loadingCards.map((card) => (
            <article className="suggestion-card suggestion-card-loading" key={card}>
              <div className="outfit-preview preview-loading">
                <span className="preview-stage" />
                <span className="preview-layer preview-layer-a" />
                <span className="preview-layer preview-layer-b" />
                <span className="preview-layer preview-layer-c" />
              </div>
              <span className="skeleton-line wide" />
              <span className="skeleton-line medium" />
              <span className="skeleton-line short" />
              <div className="skeleton-palette">
                <span />
                <span />
                <span />
              </div>
            </article>
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <div className="empty-state premium-empty empty-editorial" role="status" aria-live="polite">
          <div className="empty-illustration" aria-hidden="true">
            <span className="empty-illustration-orb orb-one" />
            <span className="empty-illustration-orb orb-two" />
            <span className="empty-illustration-line" />
          </div>
          <p className="empty-kicker">No looks yet</p>
          <h3>Pick a mood and add weather.</h3>
        </div>
      ) : (
        <div className="suggestions-grid" role="status" aria-live="polite">
          {suggestions.map((suggestion) => {
            const isSaved = savedTemplateIds.has(suggestion.templateId);
            const previewLayers = createPreviewLayers(suggestion.items, suggestion.paletteColors);

            return (
              <article className="suggestion-card" key={suggestion.id}>
                <div className="suggestion-card-top">
                  <div className="suggestion-head">
                  <div>
                    <p className="card-kicker">👗 Outfit</p>
                    <h3>{suggestion.title}</h3>
                  </div>
                    <button
                      type="button"
                      className={`save-button ${isSaved ? "is-saved" : ""}`}
                      disabled={!canSave || isSaved || saveBusy[suggestion.id]}
                      onClick={() => onSave(suggestion)}
                    >
                      {canSave
                        ? isSaved
                          ? "♥ Saved"
                          : saveBusy[suggestion.id]
                            ? "Saving..."
                            : "♡ Save"
                        : "🔒 Save"}
                    </button>
                  </div>

                  <div className="suggestion-top-grid">
                    <div className="outfit-preview" aria-label="Abstract outfit preview">
                      <div className="preview-header">
                        <span>Preview</span>
                        <span>Styled</span>
                      </div>
                      <div className="preview-stage">
                        <span className="preview-halo" />
                        <span className="preview-head" />
                        <div className="preview-body">
                          {previewLayers.map((layer, index) => (
                            <div
                              className={`preview-layer preview-slot-${layer.slot} preview-color-${index + 1}`}
                              key={`${suggestion.id}-${layer.slot}`}
                            >
                              <span className="preview-layer-icon" aria-hidden="true">
                                {layer.icon}
                              </span>
                              <span className="preview-layer-copy">
                                <strong>{layer.label}</strong>
                                <span>{layer.color}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="suggestion-note-cluster">
                      <div className="reasoning-chip">
                        <span className="reasoning-icon" aria-hidden="true">
                          💡
                        </span>
                        <p className="suggestion-reasoning">{suggestion.practicalNote}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="suggestion-section">
                  <span className="suggestion-label">🎨 Palette</span>
                  <div className="palette-row" aria-label="Recommended color palette">
                    {suggestion.paletteColors.map((color, index) => (
                      <span className={`color-chip color-chip-${index + 1}`} key={`${suggestion.id}-${color}`}>
                        <span className="color-dot" aria-hidden="true" />
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="suggestion-section">
                  <span className="suggestion-label">👕 Pieces</span>
                  <ul className="item-list premium-items">
                    {suggestion.items.map((item) => (
                      <li key={`${suggestion.id}-${item.category}-${item.name}`}>
                        <div className="item-row">
                          <span className="item-icon" aria-hidden="true">
                            {getItemIcon(item)}
                          </span>
                          <span className="item-name">{item.name}</span>
                        </div>
                        <span className="item-meta">
                          {item.category} - {item.color}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
