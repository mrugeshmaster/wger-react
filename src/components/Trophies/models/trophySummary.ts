/*
 * How many trophies the user has earned, out of the ones they can see
 *
 * Both numbers are per user: a hidden trophy the user has not earned is in
 * neither, so the total is not the size of the whole catalogue.
 */
export class TrophySummary {
    constructor(
        public earned: number,
        public total: number,
    ) {
    }
}
