/**
 * Self built dev utils mainly for testing and debugging 
 */

export function print_map(map, purpose?: string) {
    if (purpose) {
        console.log(purpose);
    }
    
    for (const [key, items] of map.entries()) {
        console.log(`${key}: ${items}`);
    }

    console.log("");
}

export function print_map_with_object_values(map, purpose?: string) {
    if (purpose) {
        console.log(purpose);
    }
    
    for (const [key, items] of map.entries()) {
        console.log(key + ":");
        items.forEach(item => console.log(`  ${JSON.stringify(item)}`));
    }

    console.log("");
}