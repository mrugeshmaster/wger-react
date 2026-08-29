import axios from "axios";
import { WeightEntry } from "@/components/Weight/models/WeightEntry";
import { createWeight, deleteWeight, getWeights, getWeightSummary, updateWeight } from "./weight";
import type { Mock } from 'vitest';

vi.mock("axios");

describe("weight service tests", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('GET weight entries', async () => {

        const weightResponse = {
            count: 2,
            next: null,
            previous: null,
            results: [
                { id: 1, weight: 80, date: '2021-12-10' },
                { id: 2, weight: 90, date: '2021-12-20' },
            ]
        };

        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: weightResponse }));

        const result = await getWeights();
        expect(axios.get).toHaveBeenCalledTimes(1);

        expect(result).toStrictEqual([
            new WeightEntry(new Date('2021-12-10'), 80, 1),
            new WeightEntry(new Date('2021-12-20'), 90, 2),
        ]);
    });

    test('DELETE weight entry', async () => {

        // Arrange
        (axios.delete as Mock).mockImplementation(() => Promise.resolve({ status: 204 }));

        // Act
        const result = await deleteWeight(1);

        // Assert
        expect(axios.delete).toHaveBeenCalledTimes(1);
        expect(result).toEqual(204);
    });

    test('PATCH weight entry', async () => {

        // Arrange
        const weightEntry = new WeightEntry(new Date('2021-12-10'), 80, 1);
        const weightResponse = { data: { id: 1, weight: 80, date: '2021-12-10' } };

        // Act
        (axios.patch as Mock).mockImplementation(() => Promise.resolve(weightResponse));
        const result = await updateWeight(weightEntry);

        // Assert
        expect(axios.patch).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.patch as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/weightentry\/1\/$/);
        expect(body).toEqual({ date: new Date('2021-12-10').toISOString(), weight: 80 });
        expect(result).toStrictEqual(new WeightEntry(new Date('2021-12-10'), 80, 1));
    });

    test('POST a new weight entry', async () => {

        // Arrange
        const weightEntry = new WeightEntry(new Date('2021-12-10'), 80, 1);
        const weightResponse = { data: { id: 1, weight: 80, date: '2021-12-10' } };

        // Act
        (axios.post as Mock).mockImplementation(() => Promise.resolve(weightResponse));
        const result = await createWeight(weightEntry);

        // Assert
        expect(axios.post).toHaveBeenCalledTimes(1);
        const [url, body] = (axios.post as Mock).mock.calls[0];
        expect(url).toMatch(/\/api\/v2\/weightentry\/$/);
        expect(body).toEqual({ date: new Date('2021-12-10').toISOString(), weight: 80 });
        expect(result).toStrictEqual(new WeightEntry(new Date('2021-12-10'), 80, 1));
    });

    test('GET the weight entries with a date filter', async () => {

        // Arrange
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: { results: [] } }));

        // Act
        await getWeights('lastMonth');

        // Assert
        const [url] = (axios.get as Mock).mock.calls[0];
        expect(url).toContain('date__gte=');
        expect(url).toContain('ordering=-date');
        expect(url).toContain('limit=900');
    });

    test('GET the weight entries without a filter sends no date', async () => {

        // Arrange
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: { results: [] } }));

        // Act
        await getWeights();

        // Assert
        const [url] = (axios.get as Mock).mock.calls[0];
        expect(url).not.toContain('date__gte');
    });

    test('GET the weight summary without a userId sends no user param', async () => {

        // Arrange
        const summaryResponse = { count: 3, min_weight: 80.5, max_weight: 81.9, avg_weight: 81.2 };
        (axios.get as Mock).mockImplementation(() => Promise.resolve({ data: summaryResponse }));

        // Act
        const result = await getWeightSummary();

        // Assert
        expect(axios.get).toHaveBeenCalledTimes(1);
        const [url] = (axios.get as Mock).mock.calls[0];
        expect(url).toContain('/api/v2/weightentry/summary/');
        expect(url).not.toContain('user=');

        // The summary is returned verbatim, it is not mapped through a model class
        expect(result).toEqual(summaryResponse);
    });

    test('GET the weight summary with a userId sends the user param', async () => {

        // Arrange
        (axios.get as Mock).mockImplementation(() => Promise.resolve({
            data: { count: 3, min_weight: 70.0, max_weight: 71.1, avg_weight: 70.6 }
        }));

        // Act
        await getWeightSummary(2);

        // Assert
        const [url] = (axios.get as Mock).mock.calls[0];
        expect(url).toContain('/api/v2/weightentry/summary/');
        expect(url).toContain('user=2');
    });

});
