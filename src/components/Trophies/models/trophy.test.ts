import { TROPHY_TYPE_LABEL, Trophy, trophyType } from "@/components/Trophies/models/trophy";


describe('Test the trophy model', () => {

    test('correctly creates an object from the API response', () => {
        // Arrange
        const apiResponse = {
            id: 1,
            uuid: "5362e55b-eaf1-4e34-9ef8-661538a3bdd9",
            name: "Beginner",
            description: "Complete your first workout",
            image: "http://localhost:8000/static/trophies/count/5362e55b-eaf1-4e34-9ef8-661538a3bdd9.png",
            "trophy_type": "count",
            "is_hidden": false,
            "is_progressive": false,
            order: 1
        } as const;

        // Act
        const trophy = Trophy.fromJson(apiResponse);

        // Assert
        expect(trophy.id).toBe(1);
        expect(trophy.uuid).toBe("5362e55b-eaf1-4e34-9ef8-661538a3bdd9");
        expect(trophy.name).toBe("Beginner");
        expect(trophy.description).toBe("Complete your first workout");
        expect(trophy.image).toBe("http://localhost:8000/static/trophies/count/5362e55b-eaf1-4e34-9ef8-661538a3bdd9.png");
        expect(trophy.type).toBe("count");
        expect(trophy.isHidden).toBe(false);
        expect(trophy.isProgressive).toBe(false);
    });

    test('maps the streak trophy type from the API response', () => {
        // Arrange
        // The backend moved the Unstoppable trophy onto its own type, so the API
        // now sends this value where it used to send "sequence".
        const apiResponse = {
            id: 8,
            uuid: "b605b6a1-953d-41fb-87c9-a2f88b5f5907",
            name: "Unstoppable",
            description: "Maintain a 30-day workout streak",
            image: "http://localhost:8000/static/trophies/streak/b605b6a1-953d-41fb-87c9-a2f88b5f5907.png",
            "trophy_type": "streak",
            "is_hidden": false,
            "is_progressive": true,
            order: 8
        } as const;

        // Act
        const trophy = Trophy.fromJson(apiResponse);

        // Assert
        expect(trophy.type).toBe("streak");
        expect(trophy.name).toBe("Unstoppable");
        expect(trophy.isProgressive).toBe(true);
    });

    test('has a translation key for every trophy type', () => {
        // Arrange
        const allTypes: trophyType[] = [
            'time', 'volume', 'count', 'sequence', 'streak', 'date', 'pr', 'other'
        ];

        // Assert
        expect(TROPHY_TYPE_LABEL.streak).toBe('trophies.typeStreak');

        // A type with no entry makes the card show an empty category chip. The
        // Record type does not catch it, because Trophy.type is a plain string.
        for (const type of allTypes) {
            expect(TROPHY_TYPE_LABEL[type]).toBeTruthy();
        }
    });
});
