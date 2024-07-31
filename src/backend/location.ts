import { z } from "zod";
import type { AxiosStatic } from "axios";

// export interface locationInfo {
//   lat: string;
//   lon: string;
//   display_name: string;
// }

const locationInfoSchema = z.object({
  lat: z.string(),
  lon: z.string(),
  display_name: z.string(),
});

export type locationInfo = z.infer<typeof locationInfoSchema>;

export async function fetchLocationData(
  axios: AxiosStatic,
  apiUrl: string,
  locationName: string,
  apiKey: string
): Promise<locationInfo> {
  const options = {
    method: "GET",
    url: apiUrl,
    params: {
      q: locationName,
      api_key: apiKey,
    },
  };

  // const response = await axios.request<locationInfo[]>(options);
  const response = await axios.request(options);

  if (response.status === 200) {
    // if (response.data.length > 0) {
    //   return response.data[0];
    // } else {
    //   throw new Error(
    //     `Unable to find locataion information for ${locationName}`
    //   );
    // }

    try {
      return locationInfoSchema.parse(response.data[0]);
    } catch (err) {
      console.log(err);
      throw new Error(
        `Unable to find locataion information for ${locationName}`
      );
    }
  } else {
    throw new Error("Failed to fetch location data");
  }
}
