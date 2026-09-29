# 네코챗 포켓몬 모험 JSX (베타)

네코챗에서 포켓몬을 키우며 서사를 진행하기 위한 1:1 배틀·상태창 JSX입니다. 화면은 5세대풍 픽셀 디자인이며 원작 게임이나 Pokémon Showdown의 완전한 전투 엔진은 아닙니다.

## 설치

1. `PokemonBattle.jsx`를 네코챗의 별도 JSX에 붙여넣고 `PokemonBattle`로 등록합니다.
2. `PokemonStatusBW.jsx`를 다른 JSX에 붙여넣고 `PokemonStatusBW`로 등록합니다.
3. `PokemonAdventure.prompt.txt`를 모험용 프롬프트에 추가합니다. 이전에 같은 역할의 운영 규칙이 있다면 교체합니다.
4. 첫 포켓몬은 실제로 받은 장면에서 설정합니다. 예: `<PokemonStatusBW sync={{p:[["charmander",5,"starter-0"]],a:"starter-0"}} />`

일상에는 상태창만, 야생·트레이너 조우에는 배틀과 상태창을 각각 출력합니다. 두 JSX에는 동일한 최신 `sync`를 전달합니다. 버튼 조작 뒤 생성된 `[POKEMON_SYNC]` 전체를 다음 응답에 계승해야 포켓몬·가방·돈·마스터 학습장치 설정이 유지됩니다.

## 기능과 한계

- 포획, 경험치·레벨업, 기술 습득·교체, 진화, 메가진화, 특성·성격·노력치, PC, 가방·상점 등을 지원합니다.
- 기술과 배틀 규칙은 스토리용 1:1 배틀에 맞춰져 있습니다. Z기술과 다이맥스·거다이맥스 기술은 포함되지 않으며 일부 원작 예외 규칙은 단순화되었습니다. `MOVE_SUPPORT.md`를 참고하세요.
- 도트·트레이너·배경·효과 이미지는 Pokémon Showdown과 일부 PokéAPI URL에서 불러옵니다. 이미지 파일은 이 저장소에 포함하지 않습니다. 외부 주소가 바뀌면 표시되지 않을 수 있습니다.
- 네코챗 환경용 JSX이므로 일반 React 프로젝트에 바로 설치하는 형태는 아닙니다.

## 업데이트와 저장 데이터

새 버전 적용 전 현재 대화의 최신 `[POKEMON_SYNC]` JSON을 따로 보관하세요. 업데이트 내역에 저장 형식 변경이 있다면 기존 기록과의 호환 여부를 확인하세요.

## 출처

Pokémon Showdown의 공개 도감·기술 데이터를 참고하고 일부 데이터를 변환해 포함했습니다. 외부 자료의 출처와 별도 권리는 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)에 정리했습니다. 이 프로젝트는 Nintendo, Game Freak, The Pokémon Company, Smogon 또는 PokéAPI의 공식 프로젝트가 아닙니다.
