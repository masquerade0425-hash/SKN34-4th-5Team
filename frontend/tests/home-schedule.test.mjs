import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../components/game-schedule.tsx', import.meta.url), 'utf8');
const ast = ts.createSourceFile('game-schedule.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const body = ast.statements.filter(node => !ts.isImportDeclaration(node) && node.name?.text !== 'useKboSnapshot').map(node => node.getText(ast)).join('\n');
function render(data, error = null) {
  const module = { exports: {} };
  const noop = () => null;
  const deps = {
    useKboSnapshot: () => ({ data, error, checking: false, retry: noop }),
    koreaToday: () => '2026-10-13', nextCalendarDate: () => '2026-10-14', supportedScheduleDate: () => true,
    Link: 'a', Icon: noop, KboHighlightSection: noop, KboStandingsNote: noop, HomeTeamBoards: noop,
  };
  new Function('require', 'module', 'exports', ...Object.keys(deps), ts.transpileModule(body, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText)(require, module, module.exports, ...Object.values(deps));
  return module.exports.GameSchedule();
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...[tree.props?.children].flat(Infinity).flatMap(nodes)];
}
const snapshot = (scheduleStatus, games = []) => ({ date: '2026-10-13', scheduleStatus, games, standings: [], source: {} });
const carousel = tree => nodes(tree).find(node => node.type?.name === 'GameCarousel');

test('home renders next games with their actual date even when requested day is empty or pending', () => {
  for (const status of ['empty', 'pending', 'ready']) {
    const games = [{ id: 'next', date: '2026-10-15' }];
    const tree = render(snapshot(status, games));
    assert.deepEqual(carousel(tree).props.games, games);
    assert.match(JSON.stringify(tree), /10월 15일/);
    assert.doesNotMatch(JSON.stringify(tree), /아직 업데이트되지/);
  }
});

test('home preserves today games, pending guidance, empty state, and request errors', () => {
  assert.ok(carousel(render(snapshot('ready', [{ id: 'today', date: '2026-10-13' }]))));
  const pending = render(snapshot('pending'));
  assert.match(JSON.stringify(pending), /아직 업데이트되지/);
  assert.ok(nodes(pending).some(node => node.props?.href === '/schedule?date=2026-10-14'));
  assert.match(JSON.stringify(render(snapshot('empty'))), /아직 등록된 다음 경기가 없어요/);
  for (const tree of [render(snapshot('error')), render(null, 'network')]) {
    assert.match(JSON.stringify(tree), /경기 정보를 불러오지 못했어요/);
    assert.equal(carousel(tree), undefined);
  }
});
