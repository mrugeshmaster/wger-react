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
        // The filter switch starts off, so no filter is passed at all
        expect(useFetchNutritionalPlansQuery).toHaveBeenCalledWith(undefined);
        expect(screen.getByText('nutrition.plans')).toBeInTheDocument();
        expect(screen.getByText('Summer body!!!')).toBeInTheDocument();
        expect(screen.getByText('Bulking till we puke')).toBeInTheDocument();
    });

    test('turning the switch on asks for only the logging plans', async () => {

        // Arrange
        // i18n is not initialised here, so the label renders as the raw key
        render(
            <QueryClientProvider client={queryClient}>
                <PlansOverview />
            </QueryClientProvider>
        );

        // Act
        await userEvent.click(
            screen.getByRole('switch', { name: 'nutrition.onlyLoggingFilter' })
        );

        // Assert
        expect(useFetchNutritionalPlansQuery).toHaveBeenCalledWith({ onlyLogging: true });
        expect(screen.getByRole('switch', { name: 'nutrition.onlyLoggingFilter' })).toBeChecked();
    });
});
