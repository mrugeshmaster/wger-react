import { Card, CardContent, Skeleton, Stack, Typography } from "@mui/material";
import { useWeightSummaryQuery } from "@/components/Weight/queries";
import React from "react";
import { useTranslation } from "react-i18next";

/*
 * Aggregate weight statistics, shown above the chart.
 *
 * With a userId this reads a member's summary for the trainer view; without one
 * it reads the logged in user's own.
 */
export const WeightSummary = (props: { userId?: number }) => {
    const [t] = useTranslation();
    const summaryQuery = useWeightSummaryQuery(props.userId);

    if (summaryQuery.isLoading) {
        return <Skeleton variant="rectangular" height={90} />;
    }

    const s = summaryQuery.data!;

    return <Card variant="outlined">
        <CardContent>
            <Stack direction="row" spacing={4} sx={{ justifyContent: "space-around", flexWrap: "wrap" }}>
                <SummaryValue label={t("entries")} value={s.count} />
                <SummaryValue label={t("average")} value={s.avg_weight} />
                <SummaryValue label={t("minimum")} value={s.min_weight} />
                <SummaryValue label={t("maximum")} value={s.max_weight} />
            </Stack>
        </CardContent>
    </Card>;
};

const SummaryValue = (props: { label: string, value: number | null }) =>
    <Stack sx={{ alignItems: "center" }}>
        <Typography variant="h6">{props.value === null ? "—" : props.value}</Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>{props.label}</Typography>
    </Stack>;
