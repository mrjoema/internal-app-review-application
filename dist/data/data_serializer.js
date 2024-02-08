"use strict";
/**
 * The serializer file handles the data serializion / de-serializion
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serialize_map_into_json_str = exports.serialize_map_into_records = exports.shuffle_dataset = exports.load_raw_dataset = void 0;
/**
 * The function that loads the raw dataset.
 * @param raw_data_set
 * @returns Map<string, AppMetadata[]>
 */
const load_raw_dataset = (raw_data_set) => {
    let apps_map = new Map();
    Object.keys(raw_data_set).forEach(category => {
        const app_list = raw_data_set[category];
        apps_map.set(category, app_list.map((value) => {
            return {
                name: value[0],
                url: value[1],
                category: category,
                uuid: value[2],
            };
        }));
    });
    return apps_map;
};
exports.load_raw_dataset = load_raw_dataset;
const shuffle_dataset = (original) => {
    const res = new Map(original);
    for (const key of res.keys()) {
        const list = res.get(key);
        const shuffled_list = shuffle(list);
        res.set(key, shuffled_list);
    }
    return res;
};
exports.shuffle_dataset = shuffle_dataset;
const shuffle = (array) => {
    const outcome = [...array];
    for (let i = outcome.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [outcome[i], outcome[j]] = [outcome[j], outcome[i]];
    }
    return outcome;
};
const serialize_map_into_records = (map) => {
    let serialized_res = {};
    for (const [key, items] of map.entries()) {
        serialized_res[key] = items;
    }
    return serialized_res;
};
exports.serialize_map_into_records = serialize_map_into_records;
const serialize_map_into_json_str = (map) => {
    return JSON.stringify((0, exports.serialize_map_into_records)(map), null, 4);
};
exports.serialize_map_into_json_str = serialize_map_into_json_str;
//# sourceMappingURL=data_serializer.js.map