import XLSX from "xlsx";
import { enrichLocationsWithCoordinates } from "./src/map.js"; // moved map functions to separate file


async function run() {
    const cityLoc = XLSX.readFile("datas/서울시 주요 121장소 목록.xlsx");

    const firstSheetName = cityLoc.SheetNames[0];
    const firstSheet = cityLoc.Sheets[firstSheetName];
    const JSONdata = XLSX.utils.sheet_to_json(firstSheet);

    // Enrich location data with coordinates from Kakao API
    await enrichLocationsWithCoordinates(JSONdata);

    // Write enriched data to output.xlsx
    const newWorkSheet = XLSX.utils.json_to_sheet(JSONdata);
    const newWorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkBook, newWorkSheet, "Sheet1");
    XLSX.writeFile(newWorkBook, "datas/output.xlsx");
}


run();