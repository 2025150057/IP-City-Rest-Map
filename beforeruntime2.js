import XLSX from "xlsx";
import fs from "fs";



async function run() {
    const xlsxfile = XLSX.readFile("datas/output.xlsx");
    const firstSheetName = xlsxfile.SheetNames[0];
    const firstSheet = xlsxfile.Sheets[firstSheetName];
    const JSONdata = XLSX.utils.sheet_to_json(firstSheet);
    fs.writeFileSync("datas/output.json", JSON.stringify(JSONdata));
}

run();