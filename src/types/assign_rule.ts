export interface AssignRule {
    // key: category, value: min counts each reviewer has to review
    reviewer_min_review: Map<string, number>;
    // key: category, value: extra counts that some reviewers have to review
    reviewer_extra_review: Map<string, number>;
}