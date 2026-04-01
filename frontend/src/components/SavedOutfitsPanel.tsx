import { useState } from "react";
import type { SavedOutfit } from "../lib/types";

type SavedOutfitsPanelProps = {
  savedOutfits: SavedOutfit[];
  onDelete: (id: string) => void;
};

export function SavedOutfitsPanel({ savedOutfits, onDelete }: SavedOutfitsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="section section-animated">
      <button
        type="button"
        className="section-dropdown"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls="saved-outfits-panel"
      >
        <span>
          💾 Saved outfits
          <small>{savedOutfits.length}</small>
        </span>
        <span className={`dropdown-arrow ${isOpen ? "is-open" : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>

      <div className={`dropdown-panel ${isOpen ? "is-open" : ""}`} id="saved-outfits-panel">
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
                      <span>👗</span>
                      <span>{item.name}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
