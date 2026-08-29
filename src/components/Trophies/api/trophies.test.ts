import axios from "axios";
import { Trophy } from "@/components/Trophies/models/trophy";
import { getTrophies, getTrophySummary } from "@/components/Trophies/api/trophies";
import { TrophySummary } from "@/components/Trophies/models/trophySummary";
import { responseTrophiesPage1, responseTrophiesPage2 } from "@/tests/trophies/trophiesTestData";
import type { Mock } from "vitest";

vi.mock("axios");

describe("Trophies service tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("getTrophies hits /trophy/ with the max page size and parses paginated results", async () => {
        (axios.get as Mock)
            .mockResolvedValueOnce({ data: responseTrophiesPage1 })
            .mockResolvedValueOnce({ data: responseTrophiesPage2 });

        const result = await getTrophies();

        // The first call uses the constructed URL with limit
        const firstUrl = (axios.get as Mock).mock.calls[0][0] as string;
        expect(firstUrl).toMatch(/\/api\/v2\/trophy\//);
        expect(firstUrl).toContain("limit=");
        // The second call follows the `next` cursor
        expect((axios.get as Mock).mock.calls[1][0]).toBe("https://example.com/page2");

        expect(result).toHaveLength(3);
        expect(result.every(t => t instanceof Trophy)).toBe(true);
        expect(result.map(t => t.id)).toEqual([123, 456, 789]);
        expect(result[2].isHidden).toBe(true);
    });

    test("returns an empty list when no trophies exist", async () => {
        (axios.get as Mock).mockResolvedValue({
            data: { count: 0, next: null, previous: null, results: [] },
        });

        const result = await getTrophies();

        expect(result).toEqual([]);
    });

    test("getTrophySummary hits /trophy/summary/ and maps the earned and total counts", async () => {
        (axios.get as Mock).mockResolvedValue({ data: { earned: 3, total: 12 } });

        const result = await getTrophySummary();

        // The summary action sits under the resource, not at the list route and
        // not at a detail route — makeUrl appends objectMethod after the path
        const url = (axios.get as Mock).mock.calls[0][0] as string;
        expect(url).toMatch(/\/api\/v2\/trophy\/summary\/$/);

        // The response is mapped onto the model, not returned raw
        expect(result).toBeInstanceOf(TrophySummary);

        // The constructor is TrophySummary(earned, total) — swapping them is the
        // obvious regression, so pin each count to its own field
        expect(result.earned).toBe(3);
        expect(result.total).toBe(12);
    });
});
