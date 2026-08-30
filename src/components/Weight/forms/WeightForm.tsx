import { Button, Stack, TextField } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { WeightEntry } from "@/components/Weight/models/WeightEntry";
import { useAddWeightEntryQuery, useBodyWeightQuery, useEditWeightEntryQuery } from "@/components/Weight/queries";
import { LoadingPlaceholder } from "@/core/ui/LoadingWidget/LoadingWidget";
import { Form, Formik } from "formik";
import { DateTime } from "luxon";
import { useState } from 'react';
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

interface WeightFormProps {
    weightEntry?: WeightEntry,
    closeFn?: () => void,
}

export const WeightForm = ({ weightEntry, closeFn }: WeightFormProps) => {

    const weightEntriesQuery = useBodyWeightQuery();
    const addWeightQuery = useAddWeightEntryQuery();
    const editWeightQuery = useEditWeightEntryQuery();

    const [dateValue, setDateValue] = useState<DateTime | null>(weightEntry ? DateTime.fromJSDate(weightEntry.date) : DateTime.now);
    const [t, i18n] = useTranslation();

    const validationSchema = yup.object({
        weight: yup
            .number()
            .min(30, 'Min weight is 30 kg')
            .max(300, 'Max weight is 300 kg')
            .required('Weight field is required'),
        notes: yup
            .string()
            .max(100, t('forms.maxLength', { chars: '100' })),
    });

    if (weightEntriesQuery.isLoading) {
        return <LoadingPlaceholder />;
    }

    return (
        (<Formik
            initialValues={{
                weight: weightEntry ? weightEntry.weight : 0,
                date: weightEntry ? weightEntry.date : new Date(),
                notes: weightEntry ? weightEntry.notes : '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (values) => {

                // Edit existing weight entry
                if (weightEntry) {
                    editWeightQuery.mutate(WeightEntry.clone(
                        weightEntry,
                        { weight: values.weight, date: values.date, notes: values.notes }
                    ));

                    // Create a new weight entry
                } else {
                    addWeightQuery.mutate(
                        new WeightEntry(values.date, values.weight, undefined, values.notes)
                    );
                }

                if (closeFn) {
                    closeFn();
                }
            }}
        >
            {formik => (
                <Form>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            id="weight"
                            label={t('weight')}
                            error={formik.touched.weight && Boolean(formik.errors.weight)}
                            helperText={formik.touched.weight && formik.errors.weight}
                            slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                            {...formik.getFieldProps('weight')}
                        />

                        <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale={i18n.language}>
                            <DateTimePicker
                                label={t('date')}
                                value={dateValue}
                                slotProps={{ textField: { variant: 'outlined' } }}
                                disableFuture={true}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        formik.setFieldValue('date', newValue.toJSDate());
                                    }
                                    setDateValue(newValue);
                                }}
                            />
                        </LocalizationProvider>

                        <TextField
                            fullWidth
                            id="notes"
                            label={t('notes')}
                            error={formik.touched.notes && Boolean(formik.errors.notes)}
                            helperText={formik.touched.notes && formik.errors.notes}
                            {...formik.getFieldProps('notes')}
                        />

                        <Stack direction="row" sx={{ justifyContent: "end", mt: 2 }}>
                            <Button color="primary" variant="contained" type="submit" sx={{ mt: 2 }}>
                                {t('submit')}
                            </Button>
                        </Stack>
                    </Stack>
                </Form>
            )}
        </Formik>)
    );
};
