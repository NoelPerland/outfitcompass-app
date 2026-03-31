import type { SavedOutfit } from "../lib/types";

type SavedOutfitsPanelProps = {
  savedOutfits: SavedOutfit[];
  onDelete: (id: string) => void;
};

export function SavedOutfitsPanel({ savedOutfits, onDelete }: SavedOutfitsPanelProps) {
  return (
    <section className="section">
      <div className="section-heading">
        <h2>Saved</h2>
      </div>

      {savedOutfits.length === 0 ? (
        <div className="empty-state">No saved outfits.</div>
      ) : (
        <div className="results-list">
          {savedOutfits.map((saved) => (
            <article className="result-card" key={saved.id}>
              <div className="result-top">
                <h3>{saved.title}</h3>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onDelete(saved.id)}
                  aria-label="Remove saved outfit"
                >
                  ✕
                </button>
              </div>

              <ul className="item-list simple-list">
                {saved.itemsSnapshot.slice(0, 5).map((item) => (
                  <li key={`${saved.id}-${item.category}-${item.name}`}>
                    <span>•</span>
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
