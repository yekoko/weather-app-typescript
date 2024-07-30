import axios from "axios";

export interface locationInfo {
  lat: string;
  lon: string;
  display_name: string;
}

export async function fetchLocationData(
  apiUrl: string,
  locationName: string,
  apiKey: string
): Promise<locationInfo> {
  // const GEOCODE_API_URL = "https://geocode.maps.co/search";
  const options = {
    method: "GET",
    url: apiUrl,
    params: {
      q: locationName,
      api_key: apiKey
    },
  };

  const response = await axios.request<locationInfo[]>(options);

  if (response.status === 200) {
    if (response.data.length > 0) {
      return response.data[0];
    } else {
      throw new Error(
        `Unable to find locataion information for ${locationName}`
      );
    }
  } else {
    throw new Error("Failed to fetch location data");
  }
}
