import { AppMetadata, AssignRule } from "../types";
import { print_map, print_map_with_object_values } from "../dev_utils";

/**
 * The main function to do app review assignment to all reviewers
 * @param reviewers the list of available reviewers 
 * @param assign_rule the rule defined how many apps each reviewer needs to review in each category
 * @param apps_map the data structure represent the app data by category (the output of the raw dataset loading job)
 * @returns Map<string, AppMetadata[]> represents what apps each reviewer needs to review
 */
export const assign_apps = (reviewers: string[], assign_rule: AssignRule, apps_map: Map<string, AppMetadata[]>): Map<string, AppMetadata[]> => {
    let result = new Map<string, AppMetadata[]>();
    let reviewer_index_for_extra_review = 0;
    // Assign apps in each category
    for (let entry of apps_map.entries()) {
        const outcome = assign_per_category(entry[0], entry[1], assign_rule, reviewers, reviewer_index_for_extra_review);
        result = merge_results(result, outcome.update);
        reviewer_index_for_extra_review = outcome.reviewer_index_for_extra_apps;
    }
    print_map_with_object_values(result, "Final result");
    return result;
}

/**
 * The helper function that handles the app assignment per each category
 * @param category target category that it's planned to assign
 * @param apps all apps under the category
 * @param assign_rule the rule defined how many apps each reviewer needs to review in each category
 * @param reviewers the list of available reviewers 
 * @param start_index_for_remaining some of the apps have remaining count (amount of apps % reviewers). This is the index to represent
 *                                  which reviewer index should start the round robin 
 * @returns (update: Map<string, AppMetadata[]>) represents what apps under the same category that reviewers should review
 *          (reviewer_index_for_extra_apps: number) represents the current index used for remaining count assignment. This will be reused as 
 *          `start_index_for_remaining` for the next category iteration
 */
const assign_per_category = (category: string, apps: AppMetadata[], assign_rule: AssignRule, reviewers: string[], 
                            start_index_for_remaining: number): { update: Map<string, AppMetadata[]>, reviewer_index_for_extra_apps: number } => {
    // Step 1: Finalize how many apps each reviewer needs to review by round robin the remaining count 
    const min_count = assign_rule.reviewer_min_review.get(category);
    let extra_count = assign_rule.reviewer_extra_review.get(category);
    const remaining_count_map = new Map(reviewers.map(reviewer => [reviewer, min_count]));
    // if there are extra apps required to review (X apps % Y reviewer), doing the round robin to increment count of each reviewer
    // `reviewer_index_for_extra_apps` will be cached and passed it into this function again for better load balancing 
    while (extra_count > 0) {
        let selected_reviewer = reviewers[start_index_for_remaining % reviewers.length];
        remaining_count_map.set(selected_reviewer, remaining_count_map.get(selected_reviewer) + 1);
        extra_count--;
        start_index_for_remaining++;
    }

    print_map(remaining_count_map, `The amount of apps in ${category} that each reviwer needs to review`);

    // Step 2: Round robin assign the app into each reviewer
    const reviewer_apps_assigned = new Map<string, AppMetadata[]>();
    let review_index = 0;
    apps.forEach((app) => {
        let selected_reviewer = reviewers[review_index];
        remaining_count_map.set(selected_reviewer, remaining_count_map.get(selected_reviewer) - 1);
        if (!reviewer_apps_assigned.has(selected_reviewer)) {
            reviewer_apps_assigned.set(selected_reviewer, []);
        }
        reviewer_apps_assigned.get(selected_reviewer).push(app);
        if (remaining_count_map.get(selected_reviewer) === 0) {
            review_index++;
        }
    });
    return { update: reviewer_apps_assigned, reviewer_index_for_extra_apps: start_index_for_remaining } ;
}

const merge_results = (original: Map<string, AppMetadata[]>, update: Map<string, AppMetadata[]>): Map<string, AppMetadata[]> => {
    for (let entry of update.entries()) {
        if (!original.has(entry[0])) {
            original.set(entry[0], []);
        }
        original.get(entry[0]).push(...update.get(entry[0]))
    }
    return original
}

/**
 * (Bounds point) The function that reconciles the result according to the submission of which apps were asked to decline
 * @param original the result before the adjustment. If there're no ask to decline the review, this function will be no-ops and the outcome
 *                 should be identical to the original input
 * @param decline_records The records that the reviewer requested to decline review. (key: reviewer id, values: the list of app uuid)
 * @param reviewers the list of available reviewers 
 * @returns Map<string, AppMetadata[]> The adjusted result about what apps each reviewer needs to review
 */
export const reconcile_assignments = (original: Map<string, AppMetadata[]>, decline_records: Record<string, string[]>, 
                                        reviewers: string[]): Map<string, AppMetadata[]> => {
    const adj_result = new Map<string, AppMetadata[]>(original);
    reviewers.forEach((reviewer, index) => {
        if (!decline_records[reviewer]) {
            return;
        }
        const declined_app_ids = decline_records[reviewer];
        const assigned_apps = adj_result.get(reviewer);
        const declined_apps = [];
        const undeclined_apps = [];
        assigned_apps.forEach(app => {
            if (declined_app_ids.includes(app.uuid)) {
                declined_apps.push(app);
            } else {
                undeclined_apps.push(app);
            }
        });

        // update the entry with the undeclined_app
        adj_result.set(reviewer, undeclined_apps);

        // let the next reviewer review the declined app by the prev reviewer
        adj_result.get(reviewers[(index + 1) % reviewers.length]).push(...declined_apps)
    })
    print_map_with_object_values(adj_result, "Reconciled result");
    return adj_result;
}