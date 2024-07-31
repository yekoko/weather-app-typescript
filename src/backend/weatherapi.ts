import { z } from "zod";
import { AxiosStatic } from "axios";

const weatherCodes: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Moderate thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

// interface currentWeatherApiResponse {
//   temperature: string;
//   windspeed: number;
//   winddirection: number;
//   weathercode: number;
//   is_day: number;
//   time: string;
// }

export const currentWeatherApiResponseSchema = z.object({
  current_weather: z.object({
    temperature: z.number(),
    windspeed: z.number(),
    winddirection: z.number(),
    weathercode: z.number(),
    is_day: z.number(),
    time: z.string(),
  }),
  hourly_units: z.object({
    temperature_2m: z.string(),
  }),
  hourly: z.object({
    temperature_2m: z.array(z.number()),
  }),
});

export type currentWeatherApiResponse = z.infer<
  typeof currentWeatherApiResponseSchema
>;

export interface Temperature {
  value: number;
  unit: string;
}

// const formatTemperature = (temp: Temperature): string =>
//   `${temp.value}${temp.unit}`;

// export interface Wind {
//   speed: number;
//   direction: number;
//   unit: string;
// }

// const formatWind = (wind: Wind): string => `${wind.speed}${wind.unit}`;

// export class CurrentWeather {
//   temperature: Temperature;
//   wind: Wind;
//   weathercode: number;
//   daytime: boolean;
//   time: string;

//   constructor(apiResponse: currentWeatherApiResponse) {
//     this.temperature = {
//       value: parseInt(apiResponse.temperature),
//       unit: "C",
//     };
//     this.wind = {
//       speed: apiResponse.windspeed,
//       direction: apiResponse.winddirection,
//       unit: "kmh",
//     };
//     this.weathercode = apiResponse.weathercode;
//     this.daytime = apiResponse.is_day === 1;
//     this.time = apiResponse.time;
//   }

//   condition(): string {
//     return weatherCodes[this.weathercode];
//   }

//   format(): string {
//     const descriptionLen = 16;

//     const temp = "Temperature".padStart(descriptionLen, " ");
//     const windSpeed = "Wind Speed".padStart(descriptionLen, " ");
//     const condition = "Condition".padStart(descriptionLen, " ");

//     const formatted: string[] = [];
//     formatted.push(`${temp}: ${formatTemperature(this.temperature)}`);
//     formatted.push(`${windSpeed}: ${formatWind(this.wind)}`);
//     formatted.push(`${condition}: ${this.condition()}`);

//     return formatted.join("\n");
//   }
// }

export class CurrentWeather {
  temperature: Temperature;
  weathercode: number;
  is_day: boolean;
  time: string;
  hourlyTemp: number[];

  constructor(apiResponse: currentWeatherApiResponse) {
    this.temperature = {
      value: apiResponse.current_weather.temperature,
      unit: apiResponse.hourly_units.temperature_2m,
    };
    this.weathercode = apiResponse.current_weather.weathercode;
    this.is_day = apiResponse.current_weather.is_day === 1;
    this.time = apiResponse.current_weather.time;
    this.hourlyTemp = apiResponse.hourly.temperature_2m;
  }

  condition(): string {
    return weatherCodes[this.weathercode];
  }

  lowTemp(): number {
    return this.hourlyTemp.reduce((a, b) => Math.min(a, b));
  }

  highTemp(): number {
    return this.hourlyTemp.reduce((a, b) => Math.max(a, b));
  }
}

export async function fetchWeatherData(
  axios: AxiosStatic,
  apiUrl: string,
  lat: string,
  lon: string
): Promise<CurrentWeather> {
  const options = {
    method: "GET",
    url: apiUrl,
    params: {
      latitude: lat,
      longitude: lon,
      hourly: "temperature_2m",
      temperature_unit: "celsius",
      windspeed_unit: "kmh",
      current_weather: true,
      forecast_days: 1,
    },
  };

  const response = await axios.request(options);

  if (response.status === 200) {
    // if (response.data?.current_weather !== undefined) {
    //   const resp = response.data.current_weather as currentWeatherApiResponse;
    //   return new CurrentWeather(resp);
    // } else {
    //   throw new Error("Received invalid api response");
    // }
    try {
      const resp = currentWeatherApiResponseSchema.parse(response.data);
      return new CurrentWeather(resp); 
    } catch (error) {
      console.log(error);
      throw new Error("Received invalid api response");
    }
  } else {
    throw new Error("Failed to fetch weather data");
  }
}
