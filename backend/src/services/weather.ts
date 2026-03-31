import { conditions, type Condition, type TemperatureBand } from "../config/constants.js";
import { AppError } from "../utils/errors.js";

export type ResolvedWeather = {
  source: "manual" | "geo";
  temperatureC: number;
  condition: Condition;
  tempBand: TemperatureBand;
  summary: string;
};

export function getTemperatureBand(temperatureC: number): TemperatureBand {
  if (temperatureC <= 0) {
    return "freezing";
  }
  if (temperatureC <= 10) {
    return "cold";
  }
  if (temperatureC <= 17) {
    return "mild";
  }
  if (temperatureC <= 24) {
    return "warm";
  }
  return "hot";
}

export function normalizeWeatherCode(weatherCode: number, windSpeed = 0): Condition {
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return "snow";
  }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weatherCode)) {
    return "rain";
  }
  if (windSpeed >= 12) {
    return "wind";
  }
  if ([1, 2, 3, 45, 48].includes(weatherCode)) {
    return "cloudy";
  }
  return "sunny";
}

export function resolveManualWeather(temperatureC: number, conditionInput: string): ResolvedWeather {
  if (!conditions.includes(conditionInput as Condition)) {
    throw new AppError(400, "INVALID_INPUT", "Please choose a supported weather condition.", {
      condition: "Unsupported condition."
    });
  }

  const condition = conditionInput as Condition;
  const tempBand = getTemperatureBand(temperatureC);

  return {
    source: "manual",
    temperatureC,
    condition,
    tempBand,
    summary: `${Math.round(temperatureC)}°C and ${condition}`
  };
}

export async function resolveGeoWeather(latitude: number, longitude: number): Promise<ResolvedWeather> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url);
  if (!response.ok) {
    throw new AppError(502, "WEATHER_UNAVAILABLE", "We could not fetch local weather right now.");
  }

  const payload = (await response.json()) as {
    current?: {
      temperature_2m?: number;
      weather_code?: number;
      wind_speed_10m?: number;
    };
  };

  if (payload.current?.temperature_2m === undefined || payload.current.weather_code === undefined) {
    throw new AppError(502, "WEATHER_UNAVAILABLE", "Weather data was incomplete.");
  }

  const condition = normalizeWeatherCode(
    payload.current.weather_code,
    payload.current.wind_speed_10m ?? 0
  );
  const temperatureC = payload.current.temperature_2m;
  const tempBand = getTemperatureBand(temperatureC);

  return {
    source: "geo",
    temperatureC,
    condition,
    tempBand,
    summary: `${Math.round(temperatureC)}°C and ${condition}`
  };
}
