import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { testUserProgressionTrophies } from "@/tests/trophies/trophiesTestData";
import { useTrophySummaryQuery, useUserTrophyProgressionQuery } from "@/components/Trophies/queries/trophies";
import { TrophySummary } from "@/components/Trophies/models/trophySummary";
import { TrophiesDetail } from './TrophiesDetail';
import type { Mock } from 'vitest';

vi.mock('@/components/Trophies/queries/trophies');

describe('TrophiesDetail', () => {

    beforeEach(() => {
        (useUserTrophyProgressionQuery as Mock).mockReturnValue({
            isLoading: false,
            isSuccess: true,
            data: testUserProgressionTrophies(),
        });

        // The whole queries module is mocked, so every hook the screen calls
        // needs a return value or it reads .data off undefined.
        (useTrophySummaryQuery as Mock).mockReturnValue({
            isLoading: false,
            isSuccess: true,
            data: new TrophySummary(2, 21),
        });
    });

    test('renders trophy names and progression values', () => {

        // Act
        render(<TrophiesDetail />);

        // Assert
        expect(screen.getByText('Beginner')).toBeInTheDocument();
        expect(screen.getByText('Unstoppable')).toBeInTheDocument();
        expect(screen.getByText('Complete your first workout')).toBeInTheDocument();
        expect(screen.getByText('Maintain a 30-day workout streak')).toBeInTheDocument();

        // Progression value for the progressive trophy should be shown
        expect(screen.getByText('4/30')).toBeInTheDocument();

        // There should be at least one progressbar in the document
        expect(screen.getAllByRole('progressbar').length).toBeGreaterThanOrEqual(1);

        // The earned count is shown above the grid
        expect(screen.getByText('trophies.earnedOfTotal')).toBeInTheDocument();
    });

    test('does not render the earned count when the summary query has no data', () => {

        // Arrange
        (useTrophySummaryQuery as Mock).mockReturnValue({
            isLoading: false,
            isSuccess: false,
            data: undefined,
        });

        // Act
        render(<TrophiesDetail />);

        // Assert: the grid survives a summary request that returned nothing
        expect(screen.queryByText('trophies.earnedOfTotal')).not.toBeInTheDocument();
        expect(screen.getByText('Beginner')).toBeInTheDocument();
    });

    test('renders an empty overview instead of crashing when the query failed', () => {

        // Arrange
        (useUserTrophyProgressionQuery as Mock).mockReturnValue({
            isLoading: false,
            isSuccess: false,
            isError: true,
            data: undefined,
        });

        // Act
        render(<TrophiesDetail />);

        // Assert
        expect(screen.getByText('trophies.trophies')).toBeInTheDocument();
        expect(screen.queryByText('Beginner')).not.toBeInTheDocument();
    });

    test('shows the loading placeholder while the query runs', () => {

        // Arrange
        (useUserTrophyProgressionQuery as Mock).mockReturnValue({
            isLoading: true,
            isSuccess: false,
            data: undefined,
        });

        // Act
        render(<TrophiesDetail />);

        // Assert
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByText('trophies.trophies')).not.toBeInTheDocument();
    });
});
