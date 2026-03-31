import { moods } from "../lib/constants";
import type { Mood } from "../lib/types";

type MoodPickerProps = {
  selectedMood: Mood;
  onSelect: (mood: Mood) => void;
};

export function MoodPicker({ selectedMood, onSelect }: MoodPickerProps) {
  return (
    <section className="section">
      <div className="section-heading">
        <h2>Choose your mood</h2>
      </div>

      <div className="mood-grid" role="radiogroup" aria-label="Mood selection">
        {moods.map((mood) => (
          <button
            key={mood.value}
            type="button"
            role="radio"
            aria-checked={selectedMood === mood.value}
            className={`mood-chip ${selectedMood === mood.value ? "is-active" : ""}`}
            onClick={() => onSelect(mood.value)}
          >
            <span className="mood-emoji" aria-hidden="true">
              {mood.emoji}
            </span>
            <span className="mood-label">{mood.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
