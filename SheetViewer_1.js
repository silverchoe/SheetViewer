const fs = require('fs');
const csv = require('csv-parse');

// 커맨드 라인 인수 확인
if (process.argv.length < 3) {
    console.error('사용법: node SheetViewer.js <CSV 파일명>');
    process.exit(1);
}

const filename = process.argv[2];

// 한글 텍스트 길이 계산 함수
function getKoreanTextLength(text) {
    let length = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        if (char === ' ') {
            length += 1;
        } else if (/[\u3131-\u314E\u314F-\u3163\uAC00-\uD7A3]/.test(char)) {
            length += 2;
        } else {
            length += 1;
        }
    }
    return length;
}

// 데이터를 저장할 배열
const rows = [];

// CSV 파일 읽기 및 처리
fs.createReadStream(filename)
    .pipe(csv.parse({ delimiter: ',', from_line: 2 }))
    .on('data', (row) => {
        if (row[1]) {
            const rowNumber = row[0];
            const koreanText = row[1];
            const textLength = getKoreanTextLength(koreanText);
            rows.push({ rowNumber, text: koreanText, length: textLength });
        }
    })
    .on('error', (error) => {
        console.error('에러 발생:', error.message);
    })
    .on('end', () => {
        // 글자 수 기준으로 내림차순 정렬
        rows.sort((a, b) => b.length - a.length);
        
        // 정렬된 결과 출력
        console.log('\n=== 글자 수 기준 정렬 결과 ===');
        rows.forEach((row, index) => {
            console.log(`${index + 1}위: 행${row.rowNumber} (${row.length}자)`);
        });
        
        console.log('\nCSV 파일 처리 완료');
    });