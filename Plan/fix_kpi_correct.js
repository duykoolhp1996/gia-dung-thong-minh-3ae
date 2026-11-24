const fs = require('fs');
const path = require('path');

const requests = [
    {
        updateCells: {
            range: { sheetId: 0, startRowIndex: 5, endRowIndex: 8, startColumnIndex: 0, endColumnIndex: 4 },
            rows: [
                {
                    values: [
                        { userEnteredValue: { stringValue: "Chỉ tiêu mục tiêu" } },
                        { userEnteredValue: { stringValue: "Mục tiêu cụ thể" } },
                        { userEnteredValue: { stringValue: "Đơn vị đo lường" } },
                        { userEnteredValue: { stringValue: "Ghi chú trọng tâm" } }
                    ]
                },
                {
                    values: [
                        { userEnteredValue: { stringValue: "Tổng lượt xem đa kênh (Views)" } },
                        { userEnteredValue: { stringValue: "350.000 – 500.000" } },
                        { userEnteredValue: { stringValue: "Lượt xem" } },
                        { userEnteredValue: { stringValue: "Kênh mới in-house (100k-150k) + KOC đối tác (250k-350k)" } }
                    ]
                },
                {
                    values: [
                        { userEnteredValue: { stringValue: "Người theo dõi mới (Followers)" } },
                        { userEnteredValue: { stringValue: "2.500 – 4.000" } },
                        { userEnteredValue: { stringValue: "Followers" } },
                        { userEnteredValue: { stringValue: "Kênh Brand đạt mốc 1.000 - 1.500 + 4 kênh vệ tinh & Zalo" } }
                    ]
                }
            ],
            fields: "userEnteredValue"
        }
    }
];

const outPath = path.join(__dirname, 'fix_kpi_correct.json');
fs.writeFileSync(outPath, JSON.stringify({ requests: requests }, null, 2), 'utf-8');
