import axios from "axios";
import { Trophy } from "@/components/Trophies/models/trophy";
import { TrophySummary } from "@/components/Trophies/models/trophySummary";
import { API_MAX_PAGE_SIZE, ApiPath } from "@/core/lib/consts";
import { fetchPaginated } from "@/core/lib/requests";
import { makeHeader, makeUrl } from "@/core/lib/url";


export const getTrophies = async (): Promise<Trophy[]> => {

    const url = makeUrl(
        ApiPath.API_TROPHIES_PATH,
        { query: { limit: API_MAX_PAGE_SIZE } }
    );
    const out: Trophy[] = [];

    for await (const page of fetchPaginated(url, makeHeader())) {
        for (const logData of page) {
            out.push(Trophy.fromJson(logData));
        }
    }
    return out;
};


export const API_TROPHY_SUMMARY_PATH = 'summary';

/*
 * Loads how many trophies the user has earned, out of the ones they can see
 */
export const getTrophySummary = async (): Promise<TrophySummary> => {
    const url = makeUrl(ApiPath.API_TROPHIES_PATH, { objectMethod: API_TROPHY_SUMMARY_PATH });

    const response = await axios.get<{ earned: number, total: number }>(
        url,
        { headers: makeHeader() }
    );

    return new TrophySummary(response.data.earned, response.data.total);
};
