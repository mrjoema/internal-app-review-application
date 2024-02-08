"use strict";
/**
 * Self built dev utils mainly for testing and debugging
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.print_map_with_object_values = exports.print_map = void 0;
function print_map(map, purpose) {
    if (purpose) {
        console.log(purpose);
    }
    for (const [key, items] of map.entries()) {
        console.log(`${key}: ${items}`);
    }
    console.log("");
}
exports.print_map = print_map;
function print_map_with_object_values(map, purpose) {
    if (purpose) {
        console.log(purpose);
    }
    for (const [key, items] of map.entries()) {
        console.log(key + ":");
        items.forEach(item => console.log(`  ${JSON.stringify(item)}`));
    }
    console.log("");
}
exports.print_map_with_object_values = print_map_with_object_values;
//# sourceMappingURL=dev_utils.js.map