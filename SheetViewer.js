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
            // 스페이스바는 1로 계산
            length += 1;
        } else if (/[\u3131-\u314E\u314F-\u3163\uAC00-\uD7A3]/.test(char)) {
            // 한글 문자는 2로 계산 (초성, 중성, 종성, 완성형 한글 포함)
            length += 2;
        } else {
            // 그 외 문자는 1로 계산
            length += 1;
        }
    }
    return length;
}

// CSV 파일 읽기 및 처리
fs.createReadStream(filename)
    .pipe(csv.parse({ delimiter: ',', from_line: 2 })) // 두 번째 행부터 읽기
    .on('data', (row) => {
        if (row[1]) { // 두 번째 열 처리
            const koreanText = row[1];
            const textLength = getKoreanTextLength(koreanText);
            console.log(`행${row[0]} : ${textLength} 자`);
        }
    })
    .on('error', (error) => {
        console.error('에러 발생:', error.message);
    })
    .on('end', () => {
        console.log('CSV 파일 처리 완료');
    });