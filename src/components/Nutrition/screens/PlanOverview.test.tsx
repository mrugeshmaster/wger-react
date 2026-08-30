import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlansOverview } from "@/components/Nutrition/screens/PlansOverview";
import { useFetchNutritionalPlansQuery } from "@/components/Nutrition/queries";
import { TEST_NUTRITIONAL_PLAN_1, TEST_NUTRITIONAL_PLAN_2 } from "@/tests/nutritionTestdata";
import type { Mock } from 'vitest';

vi.mock("@/components/Nutrition/queries");

const queryClient = new QueryClient();

describe("Test the PlansOverview component", () => {

    beforeEach(() => {
        (useFetchNutritionalPlansQuery as Mock).mockImplementation(() => ({
            isSuccess: true,
            isLoading: false,
            data: [TEST_NUTRITIONAL_PLAN_1, TEST_NUTRITIONAL_PLAN_2]
        }));

    });

    test('renders all plans correctly', async () => {

        // Act
        render(
            <QueryClientProvider client={queryClient}>
                <PlansOverview />
            </QueryClientProvider>
        );

        // Assert
        // The switch starts off, so the list is fetched without a filter
        expect(useFetchNutritionalPlansQuery).toHaveBeenCalledWith(undefined);
        expect(screen.getByText('nutrition.plans')).toBeInTheDocument();
        expect(screen.getByText('Summer body!!!')).toBeInTheDocument();
        expect(screen.getByText('Bulking till we puke')).toBeInTheDocument();
    });

    test('toggling the only-logging switch refetches with the filter', async () => {

        (useFetchNutritionalPlansQuery as Mock).mockClear();

        render(
            <QueryClientProvider client={queryClient}>
                <PlansOverview />
            </QueryClientProvider>
        );

        // i18n resources are empty in tests, so the label renders as the raw key
        const toggle = screen.getByRole('switch', { name: 'nutrition.onlyLoggingFilter' });
        expect(toggle).not.toBeChecked();
        expect(useFetchNutritionalPlansQuery).toHaveBeenCalledWith(undefined);

        await userEvent.click(toggle);

        expect(toggle).toBeChecked();
        expect(useFetchNutritionalPlansQuery).toHaveBeenCalledWith({ onlyLogging: true });
    });
});
