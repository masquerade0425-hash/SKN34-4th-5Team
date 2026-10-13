# frontend_details 경기 일정 충돌 회귀 검증

- `game-schedule.tsx`의 충돌 2곳을 정리했다. 다음 경기일 대체 조회와 실제 경기 날짜 표시를 유지하고, 경기가 없으면 pending/error/empty 안내 및 내일 조회·날짜 선택·재시도를 유지한다.
- `home-schedule.test.mjs`는 오늘 경기, 다음 경기, 미수집, 오류, 빈 일정을 검증한다.
- 일정 백엔드 테스트 준비 코드가 기존 팀의 PK를 덮어써 중복 오류를 내던 부분은 기존 팀 재사용으로 수정했다. 제품 데이터 처리 코드는 변경하지 않았다.
- 인증 프록시 테스트는 현재 Nginx의 `$upstream` 설정이 `backend:8000`으로 연결되는지 검증하도록 갱신했다. Nginx 설정은 변경하지 않았다.

검증:

- `npx tsc --noEmit --incremental false`: 통과.
- `npm test`: 전체 747개 중 745개 통과, 2개 기존 skip, 실패 0. 처음에는 frontend 전용 컨테이너에서 상위 폴더 참조가 실패했다. 최종 실행은 backend/data/nginx를 읽기 전용으로 연결한 일회용 컨테이너에서 수행했다.
- `python manage.py test accounts.test.test_member_level accounts.test.test_point_service accounts.test.test_point_integration fantasy tving.tests.test_home_schedule tving.tests.test_fallback --noinput`: 격리 테스트 DB에서 74개 통과.
- `git diff --check`: 통과.

프론트 skip 항목은 기존 `feedback never submits or mutates an enclosing course form, and works standalone` 및 `contract check rejects the current unresolved schema`다. 이 작업에서 통과로 집계하지 않았다.

CI: `.github/workflows/member-level.yml`의 `member-level` job에서 동일 백엔드 대상과 `npm test`를 실행한다. GitHub 원격 CI 자체는 아직 실행하지 않았다.
