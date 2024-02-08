"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse_map_into_json = exports.preprocess_data = void 0;
const preprocess_data = (raw_data_set) => {
    const apps_map = new Map();
    Object.keys(raw_data_set).forEach(category => {
        const app_list = raw_data_set[category];
        apps_map.set(category, app_list.map((value) => {
            return {
                name: value[0],
                url: value[1],
                category: category
            };
        }));
    });
    return apps_map;
};
exports.preprocess_data = preprocess_data;
const parse_map_into_json = (map) => {
    let serialized_res = {};
    for (const [key, items] of map.entries()) {
        serialized_res[key] = items;
    }
    return serialized_res;
};
exports.parse_map_into_json = parse_map_into_json;
//# sourceMappingURL=data_utils.js.map