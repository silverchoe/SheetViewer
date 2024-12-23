const fs = require('fs');
const csv = require('csv-parse');

// 커맨드 라인 인수 확인
if (process.argv.length < 3) {
    console.error('사용법: node SheetViewer.js <CSV 파일명>');
    process.exit(1);
}

const filename = process.argv[2];

// 데이터를 저장할 배열
const rows = [];

// CSV 파일 읽기 및 처리
fs.createReadStream(filename)
    .pipe(csv.parse({ delimiter: ',', from_line: 2 }))
    .on('data', (row) => {
        if (row[1]) {
            const rowNumber = row[0];
            const text = row[1].trim(); // 앞뒤 공백 제거
            const textLength = text.length; // 모든 문자를 1자로 계산
            rows.push({ 
                rowNumber, 
                text, 
                length: textLength
            });
        }
    })
    .on('error', (error) => {
        console.error('에러 발생:', error.message);
    })
    .on('end', () => {
        // 글자 수 기준으로 내림차순 정렬
        rows.sort((a, b) => b.length - a.length);
        
        // 같은 글자 수를 가진 행들을 그룹화
        let currentRank = 1;
        let currentLength = -1;
        let sameRankRows = [];
        
        console.log('\n=== 글자 수 기준 정렬 결과 ===');
        
        rows.forEach((row, index) => {
            if (row.length !== currentLength) {
                // 이전 그룹 출력
                if (sameRankRows.length > 0) {
                    const rowNumbers = sameRankRows.map(r => `행${r.rowNumber}`).join(', ');
                    console.log(`${currentRank}위: ${rowNumbers} (${currentLength}자)`);
                }
                
                // 새 그룹 시작
                currentLength = row.length;
                sameRankRows = [row];
                currentRank = index + 1;
            } else {
                // 같은 글자 수는 같은 그룹에 추가
                sameRankRows.push(row);
            }
        });
        
        // 마지막 그룹 출력
        if (sameRankRows.length > 0) {
            const rowNumbers = sameRankRows.map(r => `행${r.rowNumber}`).join(', ');
            console.log(`${currentRank}위: ${rowNumbers} (${currentLength}자)`);
        }
        
        console.log('\nCSV 파일 처리 완료');
    });