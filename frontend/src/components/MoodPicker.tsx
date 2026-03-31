import { moodCopy, moods } from "../lib/constants";
import type { Mood } from "../lib/types";

type MoodPickerProps = {
  selectedMood: Mood;
  onSelect: (mood: Mood) => void;
};

export function MoodPicker({ selectedMood, onSelect }: MoodPickerProps) {
  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <h2>Choose your mood.</h2>
        <p>Tap one to shape the outfit style.</p>
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
            <div className="mood-chip-top">
              <div className="mood-chip-emblem">
                <span className="mood-emoji" aria-hidden="true">
                  {mood.emoji}
                </span>
                <span className="mood-presence" aria-hidden="true">
                  ✦
                </span>
              </div>
              <span className="mood-accent">{mood.accent}</span>
            </div>
            <div className="mood-copy-stack">
              <span className="mood-label">{mood.label}</span>
              {selectedMood === mood.value ? (
                <span className="mood-selected-tag">Selected</span>
              ) : null}
            </div>
            <span className="mood-tagline">{mood.tagline}</span>
            <span className="mood-description">{moodCopy[mood.value]}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
