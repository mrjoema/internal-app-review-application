/**
 * distribuitor.ts is a cron job that runs daily to decide the apps allocation to the corresponding reviewer
 * The app dataset data is stored as json in src/data/dataset.json.
 * The reviewer data is stored as json in src/data/reviewers.json
 * The allocation result should be consistent unless numbers of reviewers / apps change
 * (Bonus points) If reviewers decline to review the app, the reconcilation logic in this script adjusts the result so 
 * other reviewers can coverage it
 */

import dataset from '../data/dataset.json'; 
import reviewers from '../data/reviewers.json'
import { AppMetadata } from '../types';
import { assign_apps, reconcile_assignments } from './distribuitor_utils';
import { serialize_map_into_json_str, load_raw_dataset, shuffle_dataset } from '../data';
var fs = require('fs');

// Step 1: Calculte how many apps each reviewer is responsible to review
// Calculate the min threshold of the apps that each reviewer needs to review and the remaining count by mod
const reviewer_min_review = new Map<string, number>();
const reviewer_extra_review = new Map<string, number>();
const review_counts = reviewers.length;
Object.keys(dataset).forEach(key => {
    reviewer_min_review.set(key, Math.floor(dataset[key].length / review_counts));
    reviewer_extra_review.set(key, dataset[key].length % review_counts);
});

/**
 * Step 2: Data processing, key: category, values: list of apps
 * Dev Notes: In real world scenario and for scaling perspective, the raw dataset can be stored as 
 * parquet format and the raw dataset loading can be built as an independent job chained by Airflow
 */
let apps_map: Map<string, AppMetadata[]> = load_raw_dataset(dataset);

// Step 3: rotate the array if it's Sunday
// Dev Notes: The date can be passed as the job parameter
const today = new Date().getDay();
if (today === 0) {
    console.log("Shuffle the dataset for rotation");
    apps_map = shuffle_dataset(apps_map);
}

/**
 * Step 4: consistent apps allocation to reviewers in each category
 * Dev Notes: In real world scenario and for scaling perspective, this can be an independent job responsible for
 * job assignments. When there're any update with the algorithm, the single job can be easily replaced without affecting
 * upstream (load raw dataset) and downstream dependency (Reconciliation)  
 */
let result: Map<string, AppMetadata[]> = assign_apps(reviewers, {
    reviewer_min_review: reviewer_min_review,
    reviewer_extra_review: reviewer_extra_review
}, apps_map);

/**
 * Step 5: (Bonus points) Reconcile the data from decline_review
 * Dev Notes: In real world scenario and for scaling perspective, this can be an independent job responsible for
 * reconcilation logic. By decoupling the logic between apps assignment and reconcilation, it makes the data pipeline 
 * maintainable without much concerns about regression due to strong coupling
 */
if (fs.existsSync("decline_review.json")) {
    console.log("decline_review.json found ! Start reconciling!")
    const decline_records = JSON.parse(fs.readFileSync("decline_review.json", "utf8"));
    result = reconcile_assignments(result, decline_records, reviewers);
}   

/**
 * Step 6: Persist it into DB / cache
 * Dev Notes: In real world scenario and for scaling perspective, the result should be cached in more mature persistent storage
 * like Redis and DynamoDB such NoSQL database
 */
const json_str = serialize_map_into_json_str(result);
fs.writeFileSync("outcome.json", json_str);
