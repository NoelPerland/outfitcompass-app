import { useEffect, useState } from "react";
import { AuthPanel } from "./components/AuthPanel";
import { MoodPicker } from "./components/MoodPicker";
import { SavedOutfitsPanel } from "./components/SavedOutfitsPanel";
import { SuggestionResults } from "./components/SuggestionResults";
import { WeatherSection } from "./components/WeatherSection";
import { conditions } from "./lib/constants";
import {
  deleteSavedOutfit,
  getRecommendations,
  getSavedOutfits,
  getSession,
  login,
  logout,
  register,
  saveOutfit
} from "./lib/api";
import type {
  AuthUser,
  Condition,
  Mood,
  SavedOutfit,
  Suggestion,
  WeatherMode
} from "./lib/types";

function readLocalStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function getCurrentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported on this device."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000
    });
  });
}

export default function App() {
  const [selectedMood, setSelectedMood] = useState<Mood>(() => readLocalStorage("mood", "happy"));
  const [weatherMode, setWeatherMode] = useState<WeatherMode>(() =>
    readLocalStorage("weatherMode", "geo")
  );
  const [manualTemperature, setManualTemperature] = useState(() =>
    readLocalStorage("temperature", 16)
  );
  const [manualCondition, setManualCondition] = useState<Condition>(() =>
    readLocalStorage("condition", conditions[0].value)
  );
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [weatherSummary, setWeatherSummary] = useState<{
    source: WeatherMode;
    temperatureC: number;
    condition: Condition;
    tempBand: string;
    summary: string;
  } | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authMessage, setAuthMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [saveBusy, setSaveBusy] = useState<Record<string, boolean>>({});
  const savedTemplateIds = new Set(
    savedOutfits
      .map((saved) => saved.outfitTemplateId)
      .filter((value): value is string => Boolean(value))
  );

  useEffect(() => {
    window.localStorage.setItem("mood", JSON.stringify(selectedMood));
  }, [selectedMood]);

  useEffect(() => {
    window.localStorage.setItem("weatherMode", JSON.stringify(weatherMode));
  }, [weatherMode]);

  useEffect(() => {
    window.localStorage.setItem("temperature", JSON.stringify(manualTemperature));
  }, [manualTemperature]);

  useEffect(() => {
    window.localStorage.setItem("condition", JSON.stringify(manualCondition));
  }, [manualCondition]);

  useEffect(() => {
    void (async () => {
      try {
        const session = await getSession();
        setUser(session.user);
        const saved = await getSavedOutfits();
        setSavedOutfits(saved.savedOutfits);
      } catch {
        setUser(null);
      }
    })();
  }, []);

  async function refreshSavedOutfits() {
    if (!user) {
      return;
    }

    const saved = await getSavedOutfits();
    setSavedOutfits(saved.savedOutfits);
  }

  async function handleFetchOutfits() {
    setIsLoading(true);
    setFeedback("");

    try {
      const response =
        weatherMode === "manual"
          ? await getRecommendations({
              mood: selectedMood,
              weather: {
                source: "manual",
                temperatureC: manualTemperature,
                condition: manualCondition
              }
            })
          : await (async () => {
              const position = await getCurrentPosition();
              return getRecommendations({
                mood: selectedMood,
                weather: {
                  source: "geo",
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                }
              });
            })();

      setSuggestions(response.suggestions);
      setWeatherSummary(response.weatherSummary);
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "We could not fetch outfit suggestions right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAuthSubmit() {
    setIsAuthSubmitting(true);
    setAuthMessage("");

    try {
      const response =
        authMode === "login" ? await login(email, password) : await register(email, password);
      setUser(response.user);
      setEmail("");
      setPassword("");
      setAuthMessage(authMode === "login" ? "Logged in." : "Account created.");
      const saved = await getSavedOutfits();
      setSavedOutfits(saved.savedOutfits);
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "We could not finish that step.");
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function handleLogout() {
    await logout();
    setUser(null);
    setSavedOutfits([]);
    setAuthMessage("");
  }

  async function handleSaveSuggestion(suggestion: Suggestion) {
    setSaveBusy((current) => ({ ...current, [suggestion.id]: true }));
    setFeedback("");

    try {
      await saveOutfit(suggestion.savePayload);
      await refreshSavedOutfits();
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "We could not save that outfit right now."
      );
    } finally {
      setSaveBusy((current) => ({ ...current, [suggestion.id]: false }));
    }
  }

  async function handleDeleteSavedOutfit(id: string) {
    try {
      await deleteSavedOutfit(id);
      await refreshSavedOutfits();
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "We could not remove that saved outfit."
      );
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Outfit Compass</span>
          <h1>Pick a mood. Get an outfit.</h1>
          <p>Simple outfit ideas based on mood and weather.</p>
          <button type="button" className="primary-button hero-button" onClick={() => void handleFetchOutfits()}>
            Get outfit
          </button>
        </div>
        <AuthPanel
          user={user}
          email={email}
          password={password}
          mode={authMode}
          authMessage={authMessage}
          isSubmitting={isAuthSubmitting}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onModeChange={setAuthMode}
          onSubmit={() => void handleAuthSubmit()}
          onLogout={() => void handleLogout()}
        />
      </header>

      {feedback ? (
        <div className="feedback" role="status" aria-live="polite">
          {feedback}
        </div>
      ) : null}

      <MoodPicker selectedMood={selectedMood} onSelect={setSelectedMood} />

      <WeatherSection
        mode={weatherMode}
        manualTemperature={manualTemperature}
        manualCondition={manualCondition}
        isLoading={isLoading}
        onModeChange={setWeatherMode}
        onTemperatureChange={setManualTemperature}
        onConditionChange={setManualCondition}
        onSubmit={() => void handleFetchOutfits()}
      />

      <SuggestionResults
        suggestions={suggestions}
        weatherSummary={weatherSummary}
        isLoading={isLoading}
        onSave={(suggestion) => void handleSaveSuggestion(suggestion)}
        saveBusy={saveBusy}
        savedTemplateIds={savedTemplateIds}
        canSave={Boolean(user)}
      />

      <SavedOutfitsPanel
        savedOutfits={savedOutfits}
        onDelete={(id) => void handleDeleteSavedOutfit(id)}
      />
    </main>
  );
}
