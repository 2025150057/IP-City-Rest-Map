import dotenv from "dotenv";
import {
    getLocDataFromKakao,
    calculateDistance,
    findClosestLocation,
    searchNearbyRestAreas
} from "./src/map.js";

dotenv.config();

// API testing
async function testGetLocData() {
    console.log("\n=== Testing getLocDataFromKakao ===");
    try {
        const loc1 = await getLocDataFromKakao("덕수궁길");
        console.log("덕수궁길:", loc1);

        const loc2 = await getLocDataFromKakao("서울시청");
        console.log("서울시청:", loc2);
    } catch (err) {
        console.error("Error:", err.message);
    }
}

// Calculation testing
function testCalculateDistance() {
    console.log("\n=== Testing calculateDistance ===");
    const lat1 = 37.5665, lon1 = 126.9780;
    const lat2 = 37.5500, lon2 = 127.0000;
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    console.log(`Distance between two points: ${distance.toFixed(2)} km`);
}


// Closest location testing
async function testFindClosestLocation() {
    console.log("\n=== Testing findClosestLocation ===");
    const locations = [
        { name: "덕수궁", LATITUDE: 37.5652, LONGITUDE: 126.9614 },
        { name: "경복궁", LATITUDE: 37.5796, LONGITUDE: 126.9770 },
        { name: "창덕궁", LATITUDE: 37.5810, LONGITUDE: 126.9915 }
    ];
    const userLat = 37.5800; const userLon = 126.9700;
    const closest = findClosestLocation(userLat, userLon, locations);
    console.log(`User location: (${userLat}, ${userLon})`);
    console.log(`Closest location:`, closest);
}


// Rest area search testing
async function testSearchNearbyRestAreas() {
    console.log("\n=== Testing searchNearbyRestAreas ===");
    try {
        const results = await searchNearbyRestAreas(126.9780, 37.5665, 1200, 5);
        console.log("Nearby 쉼터 results:", results.map(place => ({ name: place.place_name, address: place.address_name, longitude: place.x, latitude: place.y })));
    } catch (err) {
        console.error("searchNearbyRestAreas failed:", err.message);
    }
}


async function runAllTests() {
    await testGetLocData();
    testCalculateDistance();
    await testFindClosestLocation();
    await testSearchNearbyRestAreas();
}

runAllTests();
