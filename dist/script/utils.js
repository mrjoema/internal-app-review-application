"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assign_apps = void 0;
const dev_utils_1 = require("./dev_utils");
const assign_apps = (reviewers, assign_rule, raw_data_set) => {
    const apps_map = preprocess_data(raw_data_set);
    (0, dev_utils_1.print_map)(assign_rule.reviewer_min_review, "Display min number each reviewer needs to review");
    assign_per_category("Travel", apps_map.get("Travel"), assign_rule, reviewers);
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
    const remaining_count_map = new Map(reviewers.map(obj => [obj, min_count]));
    (0, dev_utils_1.print_map)(remaining_count_map, `Display the remaining value that reviwer needs to review for the apps in ${category}`);
};
//# sourceMappingURL=utils.js.map