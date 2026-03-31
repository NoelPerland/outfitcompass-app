import type { SavedOutfit } from "../lib/types";

type SavedOutfitsPanelProps = {
  savedOutfits: SavedOutfit[];
  onDelete: (id: string) => void;
};

export function SavedOutfitsPanel({ savedOutfits, onDelete }: SavedOutfitsPanelProps) {
  return (
    <section className="panel section-panel">
      <div className="section-heading section-heading-inline">
        <div>
          <h2>Saved outfits.</h2>
        </div>
        <div className="summary-chip">
          <strong>{savedOutfits.length}</strong>
        </div>
      </div>

      {savedOutfits.length === 0 ? (
        <div className="empty-state premium-empty">
          <p className="empty-kicker">Nothing saved yet</p>
          <h3>Save a look to keep it here.</h3>
          <p>Quick access to your favorites.</p>
        </div>
      ) : (
        <div className="saved-list">
          {savedOutfits.map((saved) => (
            <article className="saved-card premium-saved-card" key={saved.id}>
              <div className="saved-head">
                <div>
                  <p className="card-kicker">♡ Saved outfit</p>
                  <h3>{saved.title}</h3>
                  <p>{saved.practicalNote}</p>
                </div>
                <button
                  type="button"
                  className="ghost-button compact-action"
                  onClick={() => onDelete(saved.id)}
                >
                  Remove
                </button>
              </div>

              <div className="saved-meta">
                <span>☁ {saved.weatherSummary}</span>
                <span>⌁ {new Date(saved.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="saved-subsection">
                <span className="suggestion-label">🎨 Palette</span>
                <div className="palette-row">
                {saved.paletteSnapshot.map((color) => (
                  <span className="color-chip" key={`${saved.id}-${color}`}>
                    <span className="color-dot" aria-hidden="true" />
                    {color}
                  </span>
                ))}
                </div>
              </div>

              <div className="saved-subsection">
                <span className="suggestion-label">👕 Pieces</span>
                <ul className="item-list compact premium-items">
                  {saved.itemsSnapshot.map((item) => (
                    <li key={`${saved.id}-${item.category}-${item.name}`}>
                      <div className="item-row">
                        <span className="item-icon" aria-hidden="true">
                          ◌
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
          ))}
        </div>
      )}
    </section>
  );
}
