# 회원 등급 표시

`GET /api/v1/fantasy/points/`는 기존 `balance`, `transactions`와 함께 정수 `level`을 반환한다.
서버의 `accounts/member_level.py`가 현재 보유 포인트로 계산하며 DB에 등급을 중복 저장하지 않는다.

| 보유 포인트 | level | 배지 |
| --- | --- | --- |
| 500 이하 | 1 | 브론즈 |
| 501~1000 | 2 | 실버 |
| 1001 이상 | 3 | 골드 |

포인트 지갑이 없으면 0P·1단계를 반환하고 조회 중 지갑을 생성하지 않는다. 포인트가 감소하면 현재 잔액에 맞춰 등급도 내려간다. 일반 회원·운영 관리자·마스터 관리자는 동일 기준이다. 등급별 권한·혜택 및 적립 정책 변경은 없다.

마이페이지 프로필은 서버의 level을 사용한다. 조회 중·실패·잘못된 응답에서는 배지를 임의로 표시하지 않고 상태와 재시도 버튼을 제공한다. 권한 문구는 등급과 별도로 유지한다.

배지는 사용자 제공 참고 이미지의 방패·날개·중앙 별 형태와 브론즈·실버·골드 색상을 참고해 작성한 SVG다. 원본 PNG를 편집하거나 복제한 파일은 아니다. 기존 3단계 기준을 유지하므로 참고 이미지의 4·5번째 색상은 사용하지 않는다. 이전 PNG는 보존한다.

개발용 `member-preview.ts`의 로컬 등급 계산은 실제 회원 API와 별개다. 이전 `MEMBER_MYPAGE_HANDOFF.md`의 미리보기/적립 미구현 설명은 과거 기록이다.

## 회귀 검증

`.github/workflows/member-level.yml`의 `member-level` job에서 아래 명령을 실행한다.

```sh
python backend/manage.py test accounts.test.test_member_level accounts.test.test_point_service accounts.test.test_point_integration fantasy --noinput
cd frontend
node --test tests/mypage-feedback.test.mjs tests/fantasy-state.test.mjs
```

서버 경계값·계정 역할·잔액 감소·지갑 미생성·비로그인 접근 및 프론트 서버 등급 사용·로딩/실패·관리자 표시를 검사한다.
