import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { AuthPanel } from "./components/AuthPanel";
import { MoodPicker } from "./components/MoodPicker";
import { SavedOutfitsPanel } from "./components/SavedOutfitsPanel";
import { SuggestionResults } from "./components/SuggestionResults";
import { WeatherSection } from "./components/WeatherSection";
import { conditions } from "./lib/constants";
import { deleteSavedOutfit, getRecommendations, getSavedOutfits, getSession, login, logout, register, saveOutfit } from "./lib/api";
function readLocalStorage(key, fallback) {
    try {
        const value = window.localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    }
    catch {
        return fallback;
    }
}
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
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
    const [selectedMood, setSelectedMood] = useState(() => readLocalStorage("mood", "happy"));
    const [weatherMode, setWeatherMode] = useState(() => readLocalStorage("weatherMode", "geo"));
    const [manualTemperature, setManualTemperature] = useState(() => readLocalStorage("temperature", 16));
    const [manualCondition, setManualCondition] = useState(() => readLocalStorage("condition", conditions[0].value));
    const [suggestions, setSuggestions] = useState([]);
    const [weatherSummary, setWeatherSummary] = useState(null);
    const [user, setUser] = useState(null);
    const [savedOutfits, setSavedOutfits] = useState([]);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authMode, setAuthMode] = useState("login");
    const [authMessage, setAuthMessage] = useState("");
    const [feedback, setFeedback] = useState("");
    const [locationMessage, setLocationMessage] = useState("We’ll use your current location when you want the quickest route.");
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
    const [saveBusy, setSaveBusy] = useState({});
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
            }
            catch {
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
            const response = weatherMode === "manual"
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "We could not fetch outfit suggestions right now.";
            setFeedback(message);
            if (weatherMode === "geo") {
                setLocationMessage("Location did not work smoothly this time. Manual weather entry is ready below.");
            }
        }
        finally {
            setIsLoading(false);
        }
    }
    async function handleAuthSubmit() {
        setIsAuthSubmitting(true);
        setAuthMessage("");
        try {
            const response = authMode === "login" ? await login(email, password) : await register(email, password);
            setUser(response.user);
            setEmail("");
            setPassword("");
            setAuthMessage(authMode === "login"
                ? "You’re logged in and ready to save outfits."
                : "Your account is ready. Save any look you like.");
            const saved = await getSavedOutfits();
            setSavedOutfits(saved.savedOutfits);
        }
        catch (error) {
            setAuthMessage(error instanceof Error ? error.message : "We could not finish that step.");
        }
        finally {
            setIsAuthSubmitting(false);
        }
    }
    async function handleLogout() {
        await logout();
        setUser(null);
        setSavedOutfits([]);
        setAuthMessage("You’ve been logged out.");
    }
    async function handleSaveSuggestion(suggestion) {
        setSaveBusy((current) => ({ ...current, [suggestion.id]: true }));
        setFeedback("");
        try {
            await saveOutfit(suggestion.savePayload);
            await refreshSavedOutfits();
            setFeedback("Saved. That outfit will be waiting for you later.");
        }
        catch (error) {
            setFeedback(error instanceof Error ? error.message : "We could not save that outfit right now.");
        }
        finally {
            setSaveBusy((current) => ({ ...current, [suggestion.id]: false }));
        }
    }
    async function handleDeleteSavedOutfit(id) {
        try {
            await deleteSavedOutfit(id);
            await refreshSavedOutfits();
            setFeedback("Removed. Your saved list is up to date.");
        }
        catch (error) {
            setFeedback(error instanceof Error ? error.message : "We could not remove that saved outfit.");
        }
    }
    return (_jsxs("main", { className: "app-shell", children: [_jsxs("section", { className: "hero", children: [_jsxs("div", { className: "hero-copy", children: [_jsx("p", { className: "eyebrow", children: "Outfit Compass" }), _jsx("h1", { children: "Find an outfit that suits your mood and the weather in one calm step." }), _jsx("p", { children: "Warm, practical suggestions for right now, whether you\u2019re dressing for drizzle, sun, or a chilly commute." })] }), _jsxs("div", { className: "hero-card", children: [_jsx("p", { className: "hero-kicker", children: "Today\u2019s flow" }), _jsxs("ol", { children: [_jsx("li", { children: "Pick your mood." }), _jsx("li", { children: "Add the weather or use your location." }), _jsx("li", { children: "Save the looks that feel worth repeating." })] })] })] }), feedback ? (_jsx("div", { className: "banner", role: "status", "aria-live": "polite", children: feedback })) : null, _jsx(MoodPicker, { selectedMood: selectedMood, onSelect: (mood) => setSelectedMood(mood) }), _jsx(WeatherSection, { weatherMode: weatherMode, manualTemperature: manualTemperature, manualCondition: manualCondition, isLoading: isLoading, locationMessage: locationMessage, onModeChange: setWeatherMode, onTemperatureChange: setManualTemperature, onConditionChange: setManualCondition, onSubmit: () => void handleFetchOutfits() }), _jsx(SuggestionResults, { suggestions: suggestions, weatherSummary: weatherSummary, onSave: (suggestion) => void handleSaveSuggestion(suggestion), saveBusy: saveBusy, canSave: Boolean(user) }), _jsxs("div", { className: "split-layout", children: [_jsx(AuthPanel, { user: user, email: email, password: password, mode: authMode, authMessage: authMessage, isSubmitting: isAuthSubmitting, onEmailChange: setEmail, onPasswordChange: setPassword, onModeChange: setAuthMode, onSubmit: () => void handleAuthSubmit(), onLogout: () => void handleLogout() }), _jsx(SavedOutfitsPanel, { savedOutfits: savedOutfits, onDelete: (id) => void handleDeleteSavedOutfit(id) })] })] }));
}
