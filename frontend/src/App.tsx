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
  const [weatherMode, setWeatherMode] = useState<WeatherMode>(() => readLocalStorage("weatherMode", "geo"));
  const [manualTemperature, setManualTemperature] = useState(() => readLocalStorage("temperature", 16));
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
  const [locationMessage, setLocationMessage] = useState(
    "We’ll use your current location when you want the quickest route."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [saveBusy, setSaveBusy] = useState<Record<string, boolean>>({});

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
              setLocationMessage("Checking your local weather now...");
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
      setFeedback("Here are a few outfit ideas that should work nicely today.");
      if (weatherMode === "geo") {
        setLocationMessage("Local weather found. You can still switch to manual entry anytime.");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "We could not fetch outfit suggestions right now.";
      setFeedback(message);
      if (weatherMode === "geo") {
        setLocationMessage("Location did not work smoothly this time. Manual weather entry is ready below.");
      }
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
      setAuthMessage(
        authMode === "login"
          ? "You’re logged in and ready to save outfits."
          : "Your account is ready. Save any look you like."
      );
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
    setAuthMessage("You’ve been logged out.");
  }

  async function handleSaveSuggestion(suggestion: Suggestion) {
    setSaveBusy((current) => ({ ...current, [suggestion.id]: true }));
    setFeedback("");

    try {
      await saveOutfit(suggestion.savePayload);
      await refreshSavedOutfits();
      setFeedback("Saved. That outfit will be waiting for you later.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "We could not save that outfit right now.");
    } finally {
      setSaveBusy((current) => ({ ...current, [suggestion.id]: false }));
    }
  }

  async function handleDeleteSavedOutfit(id: string) {
    try {
      await deleteSavedOutfit(id);
      await refreshSavedOutfits();
      setFeedback("Removed. Your saved list is up to date.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "We could not remove that saved outfit.");
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Outfit Compass</p>
          <h1>Find an outfit that suits your mood and the weather in one calm step.</h1>
          <p>
            Warm, practical suggestions for right now, whether you’re dressing for drizzle, sun,
            or a chilly commute.
          </p>
        </div>
        <div className="hero-card">
          <p className="hero-kicker">Today’s flow</p>
          <ol>
            <li>Pick your mood.</li>
            <li>Add the weather or use your location.</li>
            <li>Save the looks that feel worth repeating.</li>
          </ol>
        </div>
      </section>

      {feedback ? (
        <div className="banner" role="status" aria-live="polite">
          {feedback}
        </div>
      ) : null}

      <MoodPicker selectedMood={selectedMood} onSelect={(mood) => setSelectedMood(mood)} />

      <WeatherSection
        weatherMode={weatherMode}
        manualTemperature={manualTemperature}
        manualCondition={manualCondition}
        isLoading={isLoading}
        locationMessage={locationMessage}
        onModeChange={setWeatherMode}
        onTemperatureChange={setManualTemperature}
        onConditionChange={setManualCondition}
        onSubmit={() => void handleFetchOutfits()}
      />

      <SuggestionResults
        suggestions={suggestions}
        weatherSummary={weatherSummary}
        onSave={(suggestion) => void handleSaveSuggestion(suggestion)}
        saveBusy={saveBusy}
        canSave={Boolean(user)}
      />

      <div className="split-layout">
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

        <SavedOutfitsPanel
          savedOutfits={savedOutfits}
          onDelete={(id) => void handleDeleteSavedOutfit(id)}
        />
      </div>
    </main>
  );
}
