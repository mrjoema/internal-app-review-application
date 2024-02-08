"use strict";
/**
 * app.ts is the API implementation for reviewers to fetch what the assigned apps for review.
 * (Bonus points) It also offers an API that allows reviewer to decline the review to some specific apps and the result will be updated
 * through the cron job (distribuitor.ts) running daily
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
var fs = require('fs');
// Loading the data from the file system into app memory, to simulate DB / cache connection
const outcome = fs.readFileSync("outcome.json", "utf8");
const parsed_json = JSON.parse(outcome);
const app = (0, express_1.default)();
const port = 3000;
/**
 * (Bonus point)
 * POST endpoint allows reviewer to decline the review of a target app
 * @param reviewer_id, app_uuid
 * @returns json string of what apps with the corresponding reviewer are set as declined
 */
app.post('/decline/:reviewer_id/:app_uuid', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let res_str = "";
    if (!fs.existsSync("decline_review.json")) {
        res_str = update_decline_review(req.params['reviewer_id'], req.params['app_uuid']);
    }
    else {
        const cache = JSON.parse(fs.readFileSync("decline_review.json", "utf8"));
        res_str = update_decline_review(req.params['reviewer_id'], req.params['app_uuid'], cache);
    }
    res.send(res_str);
});
const update_decline_review = (reviewer_id, app_uuid, original_cache) => {
    const outcome = Object.assign({}, original_cache);
    if (!(reviewer_id in outcome)) {
        outcome[reviewer_id] = [];
    }
    outcome[reviewer_id].push(app_uuid);
    const json_str = JSON.stringify(outcome);
    fs.writeFileSync("decline_review.json", json_str);
    return json_str;
};
/**
 * GET endpoint to reterive the assigned apps for review
 * @param reviewer_id
 * @returns json string of what apps the reviewer is assigned to review
 */
app.get('/review_apps/:reviewer_id', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let outcome = parsed_json[req.params['reviewer_id']] ? parsed_json[req.params['reviewer_id']] : [];
    res.send(JSON.stringify(outcome));
});
/**
 * GET endpoint to report the apps allocation to all reviewers per category (It's majorly for debugging / testing purposes)
 * @returns json string of overall volume of apps in each category that each review needs to review
 */
app.get('/reporting/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const review_outcome = {};
    const category_outcome = {};
    Object.keys(parsed_json).forEach(reviewer => {
        const category_count_per_reviewer = {};
        parsed_json[reviewer].forEach((app) => {
            if (!(app['category'] in category_count_per_reviewer)) {
                category_count_per_reviewer[app['category']] = 0;
            }
            category_count_per_reviewer[app['category']] += 1;
            if (!(app['category'] in category_outcome)) {
                category_outcome[app['category']] = 0;
            }
            category_outcome[app['category']] += 1;
        });
        review_outcome[reviewer] = category_count_per_reviewer;
    });
    res.send(JSON.stringify({
        reviewer: review_outcome,
        category: category_outcome,
    }));
});
app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
//# sourceMappingURL=app.js.map