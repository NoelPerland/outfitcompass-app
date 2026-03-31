import { moods } from "../lib/constants";
import type { Mood } from "../lib/types";

type MoodPickerProps = {
  selectedMood: Mood;
  onSelect: (mood: Mood) => void;
};

export function MoodPicker({ selectedMood, onSelect }: MoodPickerProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">Mood</p>
        <h2>How do you want to feel today?</h2>
        <p>Pick the vibe that feels right, and we’ll shape the outfit around it.</p>
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
            <span>{mood.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
