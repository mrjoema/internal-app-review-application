"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assign_apps = void 0;
const dev_utils_1 = require("./script/dev_utils");
const assign_apps = (reviewers, assign_rule, raw_data_set) => {
    const apps_map = preprocess_data(raw_data_set);
    (0, dev_utils_1.print_map)(assign_rule.reviewer_min_review, "Display min number each reviewer needs to review");
    for (let entry of apps_map.entries()) {
        assign_per_category(entry[0], entry[1], assign_rule, reviewers);
    }
};
exports.assign_apps = assign_apps;
const preprocess_data = (raw_data_set) => {
    const apps_map = new Map();
    Object.keys(raw_data_set).forEach(category => {
        const app_list = raw_data_set[category];
        apps_map.set(category, []);
        app_list.forEach((value) => {
            apps_map.get(category).push({
                name: value[0],
                url: value[1],
                category: category
            });
        });
    });
    return apps_map;
};
const assign_per_category = (category, apps, assign_rule, reviewers) => {
    const min_count = assign_rule.reviewer_min_review.get(category);
    let extra_count = assign_rule.reviewer_extra_review.get(category);
    const remaining_count_map = new Map(reviewers.map(reviewer => [reviewer, min_count]));
    let review_index = 0;
    while (extra_count > 0) {
        let selected_reviewer = reviewers[review_index];
        remaining_count_map.set(selected_reviewer, remaining_count_map.get(selected_reviewer) + 1);
        extra_count--;
        review_index++;
        if (review_index === reviewers.length) {
            review_index = 0;
        }
    }
    const reviewer_apps_assigned = new Map();
    (0, dev_utils_1.print_map)(remaining_count_map, `Display the remaining value that reviwer needs to review for the apps in ${category}`);
    review_index = 0;
    let remaining_app_index = 0;
    apps.forEach((app, app_index) => {
        // break the current loop if all reviewers have been assigned to review min amount of apps
        if (review_index === reviewers.length) {
            remaining_app_index = app_index;
            return;
        }
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
    (0, dev_utils_1.print_map_with_object_values)(reviewer_apps_assigned, `Display the apps that reviwers need to review`);
};
//# sourceMappingURL=utils.js.map