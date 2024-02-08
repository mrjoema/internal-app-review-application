/**
 * The serializer file handles the data serializion / de-serializion
 */

import { AppMetadata, RawDataset } from "../types";

/**
 * The function that loads the raw dataset.
 * @param raw_data_set 
 * @returns Map<string, AppMetadata[]>
 */
export const load_raw_dataset = (raw_data_set: RawDataset): Map<string, AppMetadata[]> => {
    let apps_map = new Map<string, AppMetadata[]>();
    Object.keys(raw_data_set).forEach(category => {
        const app_list = raw_data_set[category];
        apps_map.set(category, app_list.map((value) => {
            return {
                name: value[0],
                url: value[1],
                category: category,
                uuid: value[2],
            }
        }));
    });

    return apps_map;
}

export const shuffle_dataset = (original: Map<string, AppMetadata[]>): Map<string, AppMetadata[]> => {
    const res = new Map<string, AppMetadata[]>(original);
    for (const key of res.keys()) {
        const list = res.get(key);
        const shuffled_list = shuffle(list);
        res.set(key, shuffled_list);
    }
    return res;
}

const shuffle = (array: AppMetadata[]): AppMetadata[] => {
    const outcome = [...array];
    for (let i = outcome.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [outcome[i], outcome[j]] = [outcome[j], outcome[i]]; 
    } 
    return outcome; 
}; 
    

export const serialize_map_into_records = (map: Map<string, AppMetadata[]>): Record<string, AppMetadata[]> => {
    let serialized_res = {}
    for (const [key, items] of map.entries()) {
        serialized_res[key] = items;
    } 
    return serialized_res;
}

export const serialize_map_into_json_str = (map: Map<string, AppMetadata[]>): string => {
    return JSON.stringify(serialize_map_into_records(map), null, 4);
}
