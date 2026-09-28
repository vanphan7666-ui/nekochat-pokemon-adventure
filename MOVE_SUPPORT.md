# 포켓몬 배틀 기술 구현 현황 (2026-09-28)

대상: `PokemonBattle.ko-bag.jsx`. Showdown 공개 기술 정의 `data/moves.ts`와 대조했다. JSX는 네코챗의 1:1 스토리 배틀용이며, 원작의 세대별 전투 엔진 전체를 복제한 것은 아니다.

## 점검 결과

- 일반 기술 866개가 압축 데이터에 있고, `Power Shift` 1개는 런타임 정의로 추가했다. 따라서 867개 기술을 인식한다.
- 변화기 268개의 직접 처리 경로를 호출했다. 미지원 문구로 빠지는 8개(`mirrormove`, `copycat`, `metronome`, `mefirst`, `sleeptalk`, `naturepower`, `assist`, `instruct`)는 전투 행동 함수에서 다른 기술을 호출하는 방식으로 처리한다.
- 공격기 598개의 피해 계산 경로를 각각 호출했다. 실행 오류와 비정상 수치가 0건이었다. 개별 기술의 모든 상황을 검증한 것은 아니다.
- 위력 0으로 기록된 공격기 42개는 모두 전용 피해 계산 분기가 있다. 이 숫자는 **효과 전체가 원작과 동일하다는 뜻이 아니다.**
- 스모곤 Showdown의 954개 정의와 비교하여, 현재 전투에 등록되지 않은 기술은 87개다. 전부 Z기술 또는 다이맥스/거다이맥스 기술이다.

## 이번 보강

- 조건부 위력: 어래곤의 `Fishious Rend`, 파치래곤의 `Bolt Beak`, `Collision Course`, `Electro Drift`, `Grav Apple`, `Psyblade`, `Fickle Beam`, `Temper Flare`, `Retaliate`, `Smelling Salts`, `Wake-Up Slap`, `Last Respects`, `Expanding Force`, `Echoed Voice`, `Fusion Bolt/Flare`, `Lash Out`.
- 타입과 능력치: `Freeze-Dry`의 물 타입 역상성, `Flying Press`의 복합 상성, `Thousand Arrows`의 비행/부유 대상 처리, `Body Press`의 방어 사용, `Foul Play`의 상대 공격 사용, `Psyshock/Psystrike/Secret Sword`의 물리 방어 사용, 일부 방어 랭크 무시 및 확정 급소.
- 공격 뒤 효과: `Brick Break/Psychic Fangs/Raging Bull`의 벽 제거, `Stone Axe/Ceaseless Edge`의 설치기, `Ice Spinner/Steel Roller`의 지형 제거, `Fell Stinger`의 처치 보상, `Bug Bite/Pluck/Incinerate`의 열매 처리, `Burn Up/Double Shock`의 타입 소모, `Thousand Waves` 등의 교체 봉쇄, `Core Enforcer`의 특성 봉인, `Freezy Frost/Sappy Seed`.
- 조건 및 턴: `Snore`, `Dream Eater`, `Belch`, `Last Resort`, `Dark Void`, `Captivate`, `Focus Punch`, `Thunderclap`, `Upper Hand`, `Grassy Glide`, `Future Sight/Doom Desire`의 지연 공격, `Shed Tail`, `Autotomize`, `Beak Blast`, `Shell Trap`, `Pursuit`, `Sky Drop`, 열매 사용 기록과 `Rage Fist` 피격 횟수.
- 다단 공격 `Population Bomb`, `Triple Axel`, `Triple Kick`의 후속 타격 명중과 타격별 위력, `Hidden Power`의 IV 타입, 친밀도가 제공될 때 `Return/Frustration`의 위력을 계산한다.

## 현재 구조에서 제외된 87개 기술

이름을 단독으로 등록하는 것은 가능하지만, 실제 발동에는 Z크리스탈/다이맥스 발동, 일반 기술에서 특수 기술로의 변환, 변신 턴 제한, 거다이맥스 상태와 전용 부가효과가 필요하다. 현재 JSX에는 그 선행 시스템이 없어 일반 기술인 것처럼 처리하지 않았다.

### Z기술 35개

`10000000voltthunderbolt`, `aciddownpour`, `alloutpummeling`, `blackholeeclipse`, `bloomdoom`, `breakneckblitz`, `catastropika`, `clangoroussoulblaze`, `continentalcrush`, `corkscrewcrash`, `devastatingdrake`, `extremeevoboost`, `genesissupernova`, `gigavolthavoc`, `guardianofalola`, `hydrovortex`, `infernooverdrive`, `letssnuggleforever`, `lightthatburnsthesky`, `maliciousmoonsault`, `menacingmoonrazemaelstrom`, `neverendingnightmare`, `oceanicoperetta`, `pulverizingpancake`, `savagespinout`, `searingsunrazesmash`, `shatteredpsyche`, `sinisterarrowraid`, `soulstealing7starstrike`, `splinteredstormshards`, `stokedsparksurfer`, `subzeroslammer`, `supersonicskystrike`, `tectonicrage`, `twinkletackle`.

### 다이맥스 기술 19개

`maxairstream`, `maxdarkness`, `maxflare`, `maxflutterby`, `maxgeyser`, `maxguard`, `maxhailstorm`, `maxknuckle`, `maxlightning`, `maxmindstorm`, `maxooze`, `maxovergrowth`, `maxphantasm`, `maxquake`, `maxrockfall`, `maxstarfall`, `maxsteelspike`, `maxstrike`, `maxwyrmwind`.

### 거다이맥스 기술 33개

`gmaxbefuddle`, `gmaxcannonade`, `gmaxcentiferno`, `gmaxchistrike`, `gmaxcuddle`, `gmaxdepletion`, `gmaxdrumsolo`, `gmaxfinale`, `gmaxfireball`, `gmaxfoamburst`, `gmaxgoldrush`, `gmaxgravitas`, `gmaxhydrosnipe`, `gmaxmalodor`, `gmaxmeltdown`, `gmaxoneblow`, `gmaxrapidflow`, `gmaxreplenish`, `gmaxresonance`, `gmaxsandblast`, `gmaxsmite`, `gmaxsnooze`, `gmaxsteelsurge`, `gmaxstonesurge`, `gmaxstunshock`, `gmaxsweetness`, `gmaxtartness`, `gmaxterror`, `gmaxvinelash`, `gmaxvolcalith`, `gmaxvoltcrash`, `gmaxwildfire`, `gmaxwindrage`.

## 등록된 기술 중 원작 세부 규칙이 아직 단순화된 사례

- `Population Bomb`, `Triple Axel`, `Triple Kick`: 후속 명중과 피해는 계산하지만 타격마다 발동하는 모든 부가효과·도구 상호작용은 단순화했다.
- `Return`, `Frustration`: 서사 데이터에 친밀도 값이 없으면 기존 기본 위력을 사용한다. 동기화 포맷은 친밀도를 영속 저장하지 않는다.
- `Beak Blast`, `Pursuit`, `Shell Trap`, `Sky Drop`: 기본 발동과 핵심 상호작용은 처리하지만, 원작의 모든 교체·보호·특성 예외는 재현하지 않는다.
- `Fire Pledge`, `Water Pledge`, `Grass Pledge`, `Round`, `Order Up`: 두 포켓몬의 연계 행동을 요구하므로 1:1 배틀에서 기본 공격만 처리한다.
- `Future Sight`, `Doom Desire`: 지연 피해는 구현했으나 원작의 모든 교체·특성·방어 상호작용을 재현하지 않는다.
- `Follow Me`, `Rage Powder`, `Spotlight`, `After You`, `Quash`, `Helping Hand`, `Ally Switch`, `Hold Hands`: 현재 1:1 배틀에서는 효과 없음으로 처리한다.

위 마지막 절은 확인된 차이의 목록이며, 모든 세대·특성·도구 조합에 대한 원작 일치 보증은 아니다. 추가 구현은 현재 게임의 스토리 진행에 실제로 필요한 기술부터 검증하는 편이 안전하다.

## 검증

`node output/PokemonBattle.story.smoke.cjs`: 문법, 포획, 턴 규칙, 프리즈드라이, 스톤액스, 깨트리기, 미래예지, 꼬리자르기 포함 통과.

`node output/PokemonMoveSupport.audit.cjs`: 변화기 268개·공격기 598개 호출 오류 0건, 비정상 피해 수치 0건, 누락 기술 분류 확인.

기준 소스: https://github.com/smogon/pokemon-showdown/blob/master/data/moves.ts
