import { fetchLocationData } from "./location";
import type { locationInfo } from "./location";
import { fetchWeatherData } from "./weatherapi";

const GEOCODE_API_URL = "https://geocode.maps.co/search";
const API_KEY = "66a7734be4bf4700839372tqv2f45c5";
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

async function main(): Promise<number> {
  // pnpm run weather Location
  if (process.argv.length !== 3) {
    console.error("usage: weather LOCATION");
    return 1;
  }
  // get location
  const location = process.argv[2];
  // convert location to lat/lon
  let locataionInfo: locationInfo;
  try {
    locataionInfo = await fetchLocationData(GEOCODE_API_URL, location, API_KEY);
  } catch (err) {
    console.log(err);
    return 1;
  }

  console.log(`Fetching weather data for ${locataionInfo.display_name}... \n`);

  // fetch weather data
  // display weather data
  try {
    const weather = await fetchWeatherData(
      WEATHER_API_URL,
      locataionInfo.lat,
      locataionInfo.lon
    );
    console.log(weather.format());
  } catch (err) {
    console.log(err);
    return 1;
  }
  

  return await Promise.resolve(0);
}

main().catch((error) => console.error(error));
