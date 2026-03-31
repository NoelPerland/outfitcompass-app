import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { moods } from "../lib/constants";
export function MoodPicker({ selectedMood, onSelect }) {
    return (_jsxs("section", { className: "panel", children: [_jsxs("div", { className: "section-heading", children: [_jsx("p", { className: "eyebrow", children: "Mood" }), _jsx("h2", { children: "How do you want to feel today?" }), _jsx("p", { children: "Pick the vibe that feels right, and we\u2019ll shape the outfit around it." })] }), _jsx("div", { className: "mood-grid", role: "radiogroup", "aria-label": "Mood selection", children: moods.map((mood) => (_jsxs("button", { type: "button", role: "radio", "aria-checked": selectedMood === mood.value, className: `mood-chip ${selectedMood === mood.value ? "is-active" : ""}`, onClick: () => onSelect(mood.value), children: [_jsx("span", { className: "mood-emoji", "aria-hidden": "true", children: mood.emoji }), _jsx("span", { children: mood.label })] }, mood.value))) })] }));
}
