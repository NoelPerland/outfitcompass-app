import type { SavedOutfit } from "../lib/types";

type SavedOutfitsPanelProps = {
  savedOutfits: SavedOutfit[];
  onDelete: (id: string) => void;
};

export function SavedOutfitsPanel({ savedOutfits, onDelete }: SavedOutfitsPanelProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Saved</p>
        <h2>Your saved outfits</h2>
        <p>Keep the looks that feel useful, practical, or just right for later.</p>
      </div>

      {savedOutfits.length === 0 ? (
        <div className="empty-state">You have not saved an outfit yet, but the next good one is one tap away.</div>
      ) : (
        <div className="saved-list">
          {savedOutfits.map((saved) => (
            <article className="saved-card" key={saved.id}>
              <div>
                <h3>{saved.title}</h3>
                <p>{saved.practicalNote}</p>
                <small>
                  {saved.weatherSummary} • {new Date(saved.createdAt).toLocaleDateString()}
                </small>
              </div>
              <div className="palette-row">
                {saved.paletteSnapshot.map((color) => (
                  <span className="color-chip" key={`${saved.id}-${color}`}>
                    {color}
                  </span>
                ))}
              </div>
              <ul className="item-list compact">
                {saved.itemsSnapshot.map((item) => (
                  <li key={`${saved.id}-${item.category}-${item.name}`}>
                    <span className="item-name">{item.name}</span>
                    <span className="item-meta">{item.color}</span>
                  </li>
                ))}
              </ul>
              <button type="button" className="ghost-button" onClick={() => onDelete(saved.id)}>
                Remove
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
