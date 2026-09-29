function PokemonStatusBW({
  stateText = "",
  bagText = "",
  sync = null,
  initialParty = [],
  seedState = true,
  initialBag = { pokeball: 10, greatball: 3, ultraball: 1, potion: 3, superpotion: 1, revive: 1 },
  initialMoney = 3000,
  grantId = "",
  grantItems = {},
  grantMoney = 0,
  trainerName = "트레이너"
} = {}) {
  const ROOT = "https://play.pokemonshowdown.com/sprites/";
  const ITEM = {
    pokeball: { name: "몬스터볼", group: "볼", note: "야생 포켓몬을 잡는다", price: 200 },
    greatball: { name: "슈퍼볼", group: "볼", note: "포획률 1.5배", price: 600 },
    ultraball: { name: "하이퍼볼", group: "볼", note: "포획률 2배", price: 1200 },
    potion: { name: "상처약", group: "회복", note: "HP를 20 회복", heal: 20, price: 300 },
    superpotion: { name: "좋은상처약", group: "회복", note: "HP를 50 회복", heal: 50, price: 700 },
    revive: { name: "기력의조각", group: "회복", note: "기절한 포켓몬의 HP를 절반 회복", revive: true, price: 1500 },
    maxpotion: { name: "풀회복약", group: "회복", note: "HP를 모두 회복", heal: 9999, price: 2500 },
    fullheal: { name: "만병통치약", group: "회복", note: "상태 이상을 치료", cure: true, price: 600 },
    fullrestore: { name: "회복약", group: "회복", note: "HP와 상태 이상을 모두 회복", heal: 9999, cure: true, price: 3000 },
    firestone: { name: "불꽃의돌", group: "진화", note: "호환 포켓몬을 진화시킨다", evolution: true, price: 2100 },
    waterstone: { name: "물의돌", group: "진화", note: "호환 포켓몬을 진화시킨다", evolution: true, price: 2100 },
    thunderstone: { name: "천둥의돌", group: "진화", note: "호환 포켓몬을 진화시킨다", evolution: true, price: 2100 },
    leafstone: { name: "리프의돌", group: "진화", note: "호환 포켓몬을 진화시킨다", evolution: true, price: 2100 },
    moonstone: { name: "달의돌", group: "진화", note: "호환 포켓몬을 진화시킨다", evolution: true, price: 2100 },
    sunstone: { name: "태양의돌", group: "진화", note: "호환 포켓몬을 진화시킨다", evolution: true, price: 2100 },
    shinystone: { name: "빛의돌", group: "진화", note: "호환 포켓몬을 진화시킨다", evolution: true, price: 2100 },
    duskstone: { name: "어둠의돌", group: "진화", note: "호환 포켓몬을 진화시킨다", evolution: true, price: 2100 },
    dawnstone: { name: "각성의돌", group: "진화", note: "호환 포켓몬을 진화시킨다", evolution: true, price: 2100 },
    icestone: { name: "얼음의돌", group: "진화", note: "호환 포켓몬을 진화시킨다", evolution: true, price: 2100 },
    linkingcord: { name: "연결의 끈", group: "진화", note: "통신 진화 포켓몬에게 사용", evolution: true, price: 2500 },
    evotokenraticatealola: {"name":"알로라 레트라 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    friendshipcharm: {"name":"인연의증표","group":"진화","note":"친밀도 진화를 대신한다","evolution":true,"price":2200},
    galaricacuff: {"name":"가라두구팔찌","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    evotokenmarowakalola: {"name":"알로라 텅구리 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenhitmonlee: {"name":"시라소몬 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenhitmonchan: {"name":"홍수몬 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    ovalstone: {"name":"동글동글돌","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    moveseal: {"name":"기술의증표","group":"진화","note":"특정 기술을 배운 뒤의 진화를 대신한다","evolution":true,"price":2200},
    kingsrock: {"name":"왕의징표석","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    daycharm: {"name":"낮의증표","group":"진화","note":"낮 조건과 친밀도 진화를 대신한다","evolution":true,"price":2200},
    nightcharm: {"name":"밤의증표","group":"진화","note":"밤 조건과 친밀도 진화를 대신한다","evolution":true,"price":2200},
    galaricawreath: {"name":"가라두구화관","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    metalcoat: {"name":"금속코트","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    evotokenmantine: {"name":"만타인 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    dragonscale: {"name":"용의비늘","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    upgrade: {"name":"업그레이드","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    evotokenhitmontop: {"name":"카포에라 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    prismscale: {"name":"고운비늘","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    deepseatooth: {"name":"심해의이빨","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    deepseascale: {"name":"심해의비늘","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    razorclaw: {"name":"예리한손톱","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    protector: {"name":"프로텍터","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    electirizer: {"name":"에레키부스터","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    magmarizer: {"name":"마그마부스터","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    razorfang: {"name":"예리한이빨","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    dubiousdisc: {"name":"괴상한패치","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    evotokenprobopass: {"name":"대코파스 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    reapercloth: {"name":"영계의천","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    evotokenpangoro: {"name":"부란다 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    sachet: {"name":"향기주머니","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    whippeddream: {"name":"휘핑팝","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    evotokenmalamar: {"name":"칼라마네로 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokentyrantrum: {"name":"견고라스 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenaurorus: {"name":"아마루르가 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokensylveon: {"name":"님피아 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokengoodra: {"name":"미끄래곤 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokengoodrahisui: {"name":"히스이 미끄래곤 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokengumshoos: {"name":"형사구스 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenlycanroc: {"name":"루가루암 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenlycanrocmidnight: {"name":"한밤중의 루가루암 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenlycanrocdusk: {"name":"황혼의 루가루암 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenlurantis: {"name":"라란티스 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    tartapple: {"name":"새콤한사과","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    sweetapple: {"name":"달콤한사과","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    crackedpot: {"name":"깨진포트","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    chippedpot: {"name":"이빠진포트","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    evotokenobstagoon: {"name":"가로막구리 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokensir\u0066etchd: {"name":"창파나이트 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenrunerigus: {"name":"데스판 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenalcremie: {"name":"마휘핑 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenurshifu: {"name":"우라오스 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenurshifurapidstrike: {"name":"연격의 우라오스 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenwyrdeer: {"name":"신비록 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenkleavor: {"name":"사마자르 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenursaluna: {"name":"다투곰 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenbasculegion: {"name":"대쓰여너 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenbasculegionf: {"name":"암컷 대쓰여너 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenoverqwil: {"name":"장침바루 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenpawmot: {"name":"빠르모트 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    auspiciousarmor: {"name":"축복받은갑옷","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    maliciousarmor: {"name":"저주받은갑옷","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    evotokenbrambleghast: {"name":"공푸리 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenrabsca: {"name":"베라카스 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenhoundstone: {"name":"묘두기 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenannihilape: {"name":"저승갓숭 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokenkingambit: {"name":"대도각참 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    evotokengholdengo: {"name":"타부자고 진화권","group":"진화","note":"특수 조건을 대신해 진화시킨다","evolution":true,"price":2800},
    syrupyapple: {"name":"꿀맛사과","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    unremarkableteacup: {"name":"평범한찻잔","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    masterpieceteacup: {"name":"걸작찻잔","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    metalalloy: {"name":"복합금속","group":"진화","note":"전용 진화 아이템","evolution":true,"price":2600},
    antidote: {"name":"해독제","group":"회복","note":"해독제 상태를 치료","cureStatus":"psn","price":300},
    paralyzeheal: {"name":"마비치료제","group":"회복","note":"마비치료제 상태를 치료","cureStatus":"par","price":300},
    burnheal: {"name":"화상치료제","group":"회복","note":"화상치료제 상태를 치료","cureStatus":"brn","price":300},
    awakening: {"name":"잠깨는약","group":"회복","note":"잠깨는약 상태를 치료","cureStatus":"slp","price":300},
    iceheal: {"name":"얼음상태치료제","group":"회복","note":"얼음상태치료제 상태를 치료","cureStatus":"frz","price":300},
    keystone: { name: "키스톤", group: "중요", note: "구입 후 가방에 있기만 하면 메가진화 가능 · 소모되지 않음", price: 3000, limit: 1 },
    leftovers: { name: "먹다남은음식", group: "지닌", note: "매 턴 최대 HP의 1/16 회복", price: 4000, held: true },
    oranberry: { name: "오랭열매", group: "지닌", note: "HP가 절반 이하가 되면 10 회복·소모", price: 200, held: true },
    sitrusberry: { name: "자뭉열매", group: "지닌", note: "HP가 절반 이하가 되면 최대 HP의 1/4 회복·소모", price: 600, held: true },
    focussash: { name: "기합의띠", group: "지닌", note: "HP가 가득 찼을 때 일격 기절을 막고 소모", price: 4000, held: true },
    muscleband: { name: "힘의머리띠", group: "지닌", note: "물리 기술 위력 1.1배", price: 3000, held: true },
    wiseglasses: { name: "박식안경", group: "지닌", note: "특수 기술 위력 1.1배", price: 3000, held: true },
    expertbelt: { name: "달인의띠", group: "지닌", note: "효과가 굉장한 기술 위력 1.2배", price: 4000, held: true },
    luckyegg: { name: "행복의알", group: "지닌", note: "배틀 경험치 1.5배", price: 5000, held: true },
    xattack: { name: "플러스파워", group: "전투", note: "배틀 중 공격 2단계 상승", price: 1000 },
    xdefense: { name: "디펜드업", group: "전투", note: "배틀 중 방어 2단계 상승", price: 1000 },
    xspatk: { name: "스페셜업", group: "전투", note: "배틀 중 특수공격 2단계 상승", price: 1000 },
    xspdef: { name: "스페셜가드", group: "전투", note: "배틀 중 특수방어 2단계 상승", price: 1000 },
    xspeed: { name: "스피드업", group: "전투", note: "배틀 중 스피드 2단계 상승", price: 1000 },
    xaccuracy: { name: "명중업", group: "전투", note: "배틀 중 명중률 2단계 상승", price: 1000 },
  };
  POKEMON_STATUS_MEGA_DATA.forEach(([base, stone, form]) => {
    if (!stone || ITEM[stone]) return;
    const baseName = POKEMON_STATUS_DATA.names[POKEMON_STATUS_DATA.index[base] - 1] || base;
    const suffix = /mega([xyz])$/.test(form) ? form.slice(-1).toUpperCase() : "";
    ITEM[stone] = { name: baseName + "나이트" + suffix, group: "메가",
      note: baseName + "의 메가진화용 지닌물건", price: 5000, held: true, megaStone: true };
  });
  const STATS = ["hp", "atk", "def", "spa", "spd", "spe"];
  const statKo = ["HP", "공격", "방어", "특공", "특방", "스피드"];
  const NATURES = {
    Hardy: ["노력"], Lonely: ["외로움", "atk", "def"], Brave: ["용감", "atk", "spe"], Adamant: ["고집", "atk", "spa"], Naughty: ["개구쟁이", "atk", "spd"],
    Bold: ["대담", "def", "atk"], Docile: ["온순"], Relaxed: ["무사태평", "def", "spe"], Impish: ["장난꾸러기", "def", "spa"], Lax: ["촐랑", "def", "spd"],
    Timid: ["겁쟁이", "spe", "atk"], Hasty: ["성급", "spe", "def"], Serious: ["진지"], Jolly: ["명랑", "spe", "spa"], Naive: ["천진난만", "spe", "spd"],
    Modest: ["조심", "spa", "atk"], Mild: ["의젓", "spa", "def"], Quiet: ["냉정", "spa", "spe"], Bashful: ["수줍음"], Rash: ["덜렁", "spa", "spd"],
    Calm: ["차분", "spd", "atk"], Gentle: ["얌전", "spd", "def"], Sassy: ["건방", "spd", "spe"], Careful: ["신중", "spd", "spa"], Quirky: ["변덕"]
  };
  const MOVE_TYPES = ["노말","불꽃","물","전기","풀","얼음","격투","독","땅","비행","에스퍼","벌레","바위","고스트","드래곤","악","강철","페어리"];
  const teachCatalog = React.useMemo(() => {
    const bySpecies = Object.create(null);
    POKEMON_TEACH_DATA.s.forEach((row) => { bySpecies[row[0]] = row[1]; });
    return { moves: POKEMON_TEACH_DATA.m, bySpecies };
  }, []);
  const idOf = (value) => String(value == null ? "" : value).toLowerCase().replace(/[^a-z0-9]/g, "");
  const clamp = (value, low, high) => Math.max(low, Math.min(high, Number.isFinite(Number(value)) ? Math.floor(Number(value)) : low));
  const decode = (value) => {
    if (value && typeof value === "object") return value;
    if (typeof value !== "string" || !value || value.indexOf("{{{") >= 0) return null;
    try { return JSON.parse(value); } catch (ignore) { /* encoded value */ }
    try { return JSON.parse(decodeURIComponent(value)); } catch (ignore) { return null; }
  };
  const unpackSync = (value) => {
    const data = decode(value);
    if (!data) return null;
    const legacy = Array.isArray(data.party) || Array.isArray(data.box);
    const rows = legacy
      ? [...(Array.isArray(data.party) ? data.party : []).map((row) => ({ ...row, inBox: false })),
         ...(Array.isArray(data.box) ? data.box : []).map((row) => ({ ...row, inBox: true }))]
      : data.p;
    if (!Array.isArray(rows) || !rows.length) return null;
    const owned = rows.map((row, index) => {
      if (legacy) {
        if (!row || typeof row !== "object" || !row.species) return null;
        const entries = Array.isArray(row.moves) ? row.moves : [];
        const moves = entries.map((move) => typeof move === "string" ? move : move && move.id).filter(Boolean);
        const moveNames = entries.map((move) => typeof move === "string" ? move : move && (move.name || move.id)).filter(Boolean);
        const pp = entries.map((move) => typeof move === "string" ? null : move && move.pp);
        return { ...row, uid: String(row.uid || "starter-" + index), nickname: row.nickname || row.name,
          moves, moveNames, pp, inBox: !!row.inBox };
      }
      if (!Array.isArray(row) || !row[0]) return null;
      return { species: row[0], level: row[1], uid: row[2] || "starter-" + index,
        ...(row[3] == null ? {} : { hp: row[3] }), ...(row[4] == null ? {} : { exp: row[4] }),
        ...(row[5] ? { nickname: row[5] } : {}), ...(row[6] ? { nature: row[6] } : {}),
        ...(Array.isArray(row[7]) ? { moves: row[7] } : {}), ...(Array.isArray(row[8]) ? { pp: row[8] } : {}),
        ...(Array.isArray(row[9]) ? { ivs: Object.fromEntries(STATS.map((key, i) => [key, row[9][i]])) } : {}),
        ...(Array.isArray(row[10]) ? { evs: Object.fromEntries(STATS.map((key, i) => [key, row[10][i]])) } : {}),
        ...(row[11] == null ? {} : { maxHp: row[11] }),
        ...(Array.isArray(row[12]) ? { moveNames: row[12] } : {}),
        ...(row[13] ? { inBox: true } : {}),
        ...(row[14] ? { gender: row[14] } : {}),
        ...(row[15] ? { status: row[15] } : {}), ...(row[16] ? { heldItem: row[16] } : {}),
        ...(row[17] ? { ability: row[17] } : {}) };
    }).filter(Boolean);
    if (!owned.length) return null;
    const time = Number(legacy ? data.updatedAt : data.t) || 0;
    const rawItems = legacy ? data.bag && (data.bag.items || data.bag) : data.i;
    const hasBag = rawItems && typeof rawItems === "object" || !!(legacy ? data.keyStoneOwned : data.k);
    const items = rawItems && typeof rawItems === "object" ? { ...rawItems } : {};
    if (legacy ? data.keyStoneOwned : data.k) items.keystone = 1;
    return { legacy, state: { version: 1, owned,
      activeUid: (legacy ? data.leadUid : data.a) || (owned.find((pokemon) => !pokemon.inBox) || {}).uid || "",
      expShare: legacy ? data.expShare == null ? undefined : !!data.expShare : data.x == null ? undefined : !!data.x,
      updatedAt: time },
      bag: hasBag ? { version: 1, items,
        money: legacy ? data.money : data.m,
        appliedGrants: Array.isArray(legacy ? data.delivered : data.g) ? (legacy ? data.delivered : data.g) : [],
        updatedAt: time } : null };
  };
  const packSync = (state, bagState) => ({
    p: (state.owned || []).map((pokemon) => [pokemon.species, pokemon.level, pokemon.uid, pokemon.hp, pokemon.exp,
      pokemon.nickname, pokemon.nature, pokemon.moves, pokemon.pp,
      STATS.map((key) => pokemon.ivs && pokemon.ivs[key] != null ? pokemon.ivs[key] : 31),
      STATS.map((key) => pokemon.evs && pokemon.evs[key] || 0), pokemon.maxHp, pokemon.moveNames, pokemon.inBox ? 1 : 0, pokemon.gender || "", pokemon.status || "", pokemon.heldItem || "", pokemon.ability || ""]),
    a: state.activeUid || "", i: Object.fromEntries(Object.entries(bagState.items || {}).filter(([, count]) => Number(count) > 0)), m: bagState.money == null ? 0 : bagState.money,
    g: bagState.appliedGrants || [], k: bagState.items && bagState.items.keystone > 0 ? 1 : 0, x: state.expShare ? 1 : 0,
    t: Math.max(Number(state.updatedAt) || 0, Number(bagState.updatedAt) || 0) || Date.now()
  });
  const newest = (values) => values.filter((value) => value && typeof value === "object")
    .sort((a, b) => (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0))[0] || null;
  const abilityOptions = (pokemon) => {
    const species = idOf(pokemon.species);
    const baseIndex = /^\d+$/.test(species) ? Number(species) - 1 : (POKEMON_STATUS_DATA.index[species] || 0) - 1;
    const packed = POKEMON_STATUS_ABILITY_FORM_ROWS[species] || POKEMON_STATUS_ABILITY_BASE_ROWS[baseIndex] || "";
    const options = packed ? packed.split(".").map((token) => ({
      id: POKEMON_STATUS_ABILITY_POOL[parseInt(token, 36)], hidden: token.endsWith("!")
    })).filter((row) => row.id) : [];
    const special = POKEMON_STATUS_ZA_ABILITIES[species];
    if (special) return [{ id: idOf(special), hidden: false }];
    return options.length ? options : [{ id: idOf(pokemon.ability || POKEMON_STATUS_ABILITY_DEFAULTS[baseIndex] || ""), hidden: false }].filter((row) => row.id);
  };
  const normalizeBag = (source) => {
    const raw = source && typeof source === "object" ? source : initialBag;
    const result = {};
    const names = Object.fromEntries(Object.keys(ITEM).map((id) => [ITEM[id].name.replace(/\s+/g, ""), id]));
    Object.keys(raw).forEach((label) => {
      const roman = idOf(label);
      const id = ITEM[roman] ? roman : names[String(label).replace(/\s+/g, "")] || roman || String(label).trim();
      if (id) result[id] = Math.max(result[id] || 0, clamp(raw[label], 0, 999));
    });
    Object.keys(ITEM).forEach((id) => { if (result[id] == null && ITEM[id].group !== "메가" && ITEM[id].group !== "지닌" && ITEM[id].group !== "중요") result[id] = 0; });
    return result;
  };
  const [owned, setOwned] = React.useState([]);
  const [bag, setBag] = React.useState(null);
  const [money, setMoney] = React.useState(0);
  const [view, setView] = React.useState("home");
  const [selectedUid, setSelectedUid] = React.useState("");
  const [detailFrom, setDetailFrom] = React.useState("party");
  const [selectedItem, setSelectedItem] = React.useState("");
  const [moveQuery, setMoveQuery] = React.useState("");
  const [movePage, setMovePage] = React.useState(0);
  const [teachId, setTeachId] = React.useState("");
  const [bagGroup, setBagGroup] = React.useState("전체");
  const [shopGroup, setShopGroup] = React.useState("볼");
  const [shopQuery, setShopQuery] = React.useState("");
  const [shopKind, setShopKind] = React.useState("전체");
  const [evoEvent, setEvoEvent] = React.useState(null);
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [notice, setNotice] = React.useState("");
  const [snapshot, setSnapshot] = React.useState({ version: 1 });
  const [bagMeta, setBagMeta] = React.useState({ version: 1, appliedGrants: [] });
  const [cart, setCart] = React.useState({});
  const [evDraft, setEvDraft] = React.useState(null);
  const evBusy = React.useRef(false);
  const checkoutBusy = React.useRef(false);
  React.useEffect(() => {
    const direct = unpackSync(sync);
    const templateState = decode("{{{POKEMON_STATE}}}");
    const templateBag = decode("{{{POKEMON_BAG}}}");
    const battleState = typeof PokemonBattle !== "undefined" ? PokemonBattle.runtimeState : null;
    const battleBag = typeof PokemonBattle !== "undefined" ? PokemonBattle.runtimeBag : null;
    const saved = newest([battleState, PokemonStatusBW.runtimeState, templateState, decode(stateText), direct && direct.state]);
    const expShareSource = newest([battleState, PokemonStatusBW.runtimeState, templateState, decode(stateText), direct && direct.state]
      .filter((state) => state && state.expShare != null));
    const savedBag = newest([battleBag, PokemonStatusBW.runtimeBag, templateBag, decode(bagText), direct && direct.bag]);
    const party = saved && Array.isArray(saved.owned) && saved.owned.length ? saved.owned : initialParty;
    const normalizedParty = (Array.isArray(party) ? party : []).map((raw, index) => {
      const species = idOf(raw.species);
      const dexNum = /^\d+$/.test(species) ? Number(species) : POKEMON_STATUS_DATA.index[species] || (POKEMON_STATUS_DATA.baseIds.findIndex((id) => species.startsWith(id)) + 1);
      const speciesNameKo = POKEMON_STATUS_DATA.forms[species] || raw.speciesNameKo || POKEMON_STATUS_DATA.names[dexNum - 1] || raw.species || "포켓몬";
      const nickname = raw.nickname && idOf(raw.nickname) !== species && raw.nickname !== POKEMON_STATUS_DATA.names[dexNum - 1] ? raw.nickname : speciesNameKo;
      const pokemon = { ...raw, uid: String(raw.uid || "starter-" + index), speciesNameKo, nickname, nature: NATURES[raw.nature] ? raw.nature : "Hardy", heldItem: idOf(raw.heldItem || raw.item || ""),
        ability: idOf(raw.ability || POKEMON_STATUS_ZA_ABILITIES[species] || POKEMON_STATUS_ABILITY_DEFAULTS[dexNum - 1] || "") };
      const allowedAbilities = abilityOptions(pokemon);
      if (allowedAbilities.length && !allowedAbilities.some((row) => row.id === pokemon.ability)) pokemon.ability = allowedAbilities[0].id;
      const level = clamp(pokemon.level, 1, 100);
      const ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31, ...pokemon.ivs };
      const evs = Object.fromEntries(STATS.map((key) => [key, clamp(pokemon.evs && pokemon.evs[key] || 0, 0, 252)]));
      const full = pokemon.maxHp == null ? null : clamp(pokemon.maxHp, 1, 999);
      const hp = pokemon.hp == null ? null : clamp(pokemon.hp, 0, full || 999);
      const curve = POKEMON_STATUS_DATA.curves[POKEMON_STATUS_DATA.growth[dexNum - 1] || 2];
      const expFloor = curve[level] || 0;
      const nextExp = level < 100 ? curve[level + 1] : expFloor;
      const exp = pokemon.exp == null ? expFloor : clamp(pokemon.exp, expFloor, Math.max(expFloor, nextExp - 1));
      return { ...pokemon, level, ivs, evs, exp, expFloor, nextExp, ...(full == null ? {} : { maxHp: full }), ...(hp == null ? {} : { hp }) };
    });
    let partySlots = 0;
    let autoStored = false;
    normalizedParty.forEach((pokemon) => {
      if (!pokemon.inBox && ++partySlots > 6) { pokemon.inBox = true; autoStored = true; }
    });
    const nextBag = normalizeBag(savedBag && (savedBag.items || savedBag) || initialBag);
    if ([battleBag, PokemonStatusBW.runtimeBag, templateBag, decode(bagText), direct && direct.bag]
      .some((source) => source && (source.items || source).keystone > 0)) nextBag.keystone = 1;
    let nextMoney = clamp(!savedBag || savedBag.money == null ? initialMoney : savedBag.money, 0, 9999999);
    const grants = savedBag && Array.isArray(savedBag.appliedGrants) ? [...savedBag.appliedGrants] : [];
    let granted = false;
    if (grantId && !grants.includes(grantId)) {
      Object.keys(grantItems || {}).forEach((id) => {
        const count = clamp(grantItems[id], 0, 999);
        if (count > 0) { nextBag[idOf(id)] = clamp((nextBag[idOf(id)] || 0) + count, 0, 999); granted = true; }
      });
      const cash = clamp(grantMoney, 0, 9999999);
      if (cash > 0) { nextMoney = Math.min(9999999, nextMoney + cash); granted = true; }
      if (granted) grants.push(grantId);
    }
    const updatedAt = autoStored ? Date.now() : Number(saved && saved.updatedAt) || Date.now();
    const bagUpdatedAt = granted ? Date.now() : Number(savedBag && savedBag.updatedAt) || updatedAt;
    const nextBagMeta = { ...(savedBag && typeof savedBag === "object" ? savedBag : {}), version: 1, money: nextMoney, updatedAt: bagUpdatedAt, appliedGrants: grants.slice(-100) };
    const activeUid = saved && saved.activeUid && normalizedParty.some((pokemon) => pokemon.uid === saved.activeUid && !pokemon.inBox)
      ? saved.activeUid : (normalizedParty.find((pokemon) => !pokemon.inBox) || {}).uid || "";
    const nextSnapshot = { ...(saved && typeof saved === "object" ? saved : {}), version: 1, owned: normalizedParty,
      activeUid, expShare: !!(saved && saved.expShare != null ? saved.expShare : expShareSource && expShareSource.expShare), updatedAt };
    setOwned(normalizedParty);
    setBag(nextBag);
    setMoney(nextMoney);
    setBagMeta(nextBagMeta);
    setSnapshot(nextSnapshot);
    PokemonStatusBW.runtimeState = nextSnapshot;
    PokemonStatusBW.runtimeBag = { ...nextBagMeta, items: nextBag };
    if (seedState && normalizedParty.length && (!templateState || autoStored || updatedAt > Number(templateState.updatedAt || 0)) && typeof setTemplateValue === "function") {
      try { setTemplateValue("POKEMON_STATE", encodeURIComponent(JSON.stringify(nextSnapshot))); } catch (ignore) { /* stateText can restore it */ }
    }
    if ((!savedBag || savedBag.money == null || granted) && typeof setTemplateValue === "function") {
      try { setTemplateValue("POKEMON_BAG", encodeURIComponent(JSON.stringify({ ...nextBagMeta, items: nextBag }))); } catch (ignore) { /* fallback props */ }
    }
    if ((granted || autoStored) && typeof sendToAI === "function") {
      try { sendToAI("[POKEMON_SYNC]" + JSON.stringify(packSync(nextSnapshot, { ...nextBagMeta, items: nextBag })) + "[/POKEMON_SYNC]", true); }
      catch (ignore) { /* The grant remains visible in the bag. */ }
    }
  }, []);
  const maxHp = (pokemon) => Math.max(1, Number(pokemon.maxHp) || Number(pokemon.hp) || 1);
  const displayName = (pokemon) => String(pokemon.nickname || pokemon.speciesNameKo || pokemon.species || "포켓몬");
  const sprite = (pokemon, size) => {
    const species = String(pokemon.species || "");
    const speciesId = idOf(species);
    const baseIndex = POKEMON_STATUS_DATA.baseIds.reduce((best, id, index) =>
      speciesId.startsWith(id) && (!best || id.length > POKEMON_STATUS_DATA.baseIds[best - 1].length) ? index + 1 : best, 0);
    const dexNum = POKEMON_STATUS_DATA.index[speciesId] ||
      POKEMON_STATUS_DATA.names.indexOf(species) + 1 ||
      POKEMON_STATUS_DATA.names.indexOf(String(pokemon.speciesNameKo || "")) + 1 || baseIndex;
    const rawId = String(pokemon.spriteId || speciesId).toLowerCase().replace(/[^a-z0-9-]/g, "");
    const baseId = dexNum > 0 ? POKEMON_STATUS_DATA.baseIds[dexNum - 1] : "";
    const formSpriteId = baseId && speciesId && speciesId !== baseId && speciesId.startsWith(baseId)
      ? baseId + "-" + speciesId.slice(baseId.length) : baseId || speciesId;
    const exactIds = [...new Set([formSpriteId, rawId, speciesId].filter(Boolean))];
    const pokeRoot = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
    // Z-A pixel fallback: PokéAPI sprites, credited to Kyledove / DoveKyle.
    const zaNumber = POKEMON_STATUS_ZA_SPRITE_IDS[speciesId];
    const urls = [
      formSpriteId === baseId && dexNum > 0 && dexNum <= 649 ? pokeRoot + "versions/generation-v/black-white/" + dexNum + ".png" : "",
      ...exactIds.flatMap((id) => [ROOT + "gen5/" + id + ".png", ROOT + "gen5ani/" + id + ".gif",
        ROOT + "ani/" + id + ".gif", ROOT + "dex/" + id + ".png"]),
      zaNumber && zaNumber !== 10301 ? pokeRoot + zaNumber + ".png" : "",
      zaNumber === 10301 ? pokeRoot + "other/home/10301.png" : "",
      ...(baseId && !exactIds.includes(baseId) ? [ROOT + "gen5/" + baseId + ".png", ROOT + "dex/" + baseId + ".png"] : []),
      dexNum > 0 ? pokeRoot + dexNum + ".png" : ""
    ].filter(Boolean);
    return <span style={{ display: "inline-flex", width: size, height: size, flexShrink: 0,
      alignItems: "center", justifyContent: "center", background: "#19394d",
      border: "1px solid #63a6bc", boxSizing: "border-box" }}>
      {urls.length > 0 ? <img key={formSpriteId + ":" + dexNum} src={urls[0]} alt="" data-step="0"
        onError={(event) => {
          const element = event.currentTarget;
          const next = Number(element.getAttribute("data-step") || 0) + 1;
          element.setAttribute("data-step", String(next));
          if (urls[next]) element.src = urls[next]; else element.style.display = "none";
        }} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: zaNumber === 10301 ? "auto" : "pixelated" }} />
        : <span aria-label="도트 주소 없음" style={{ color: "#a9d9e6", fontSize: 20 }}>?</span>}
    </span>;
  };
  const selected = owned.find((pokemon) => pokemon.uid === selectedUid);
  const save = async (nextOwned, nextBag, message, options = {}) => {
    const updatedAt = Date.now();
    const nextMoney = options.money == null ? money : clamp(options.money, 0, 9999999);
    const nextSnapshot = { ...snapshot, version: 1, owned: nextOwned,
      activeUid: options.activeUid == null ? snapshot.activeUid : options.activeUid,
      expShare: options.expShare == null ? !!snapshot.expShare : !!options.expShare, updatedAt };
    if (bag && bag.keystone > 0) nextBag.keystone = 1;
    const nextBagMeta = { ...bagMeta, version: 1, money: nextMoney, updatedAt, items: nextBag };
    setOwned(nextOwned);
    setBag(nextBag);
    setMoney(nextMoney);
    setBagMeta(nextBagMeta);
    if (!options.bagOnly) {
      setSnapshot(nextSnapshot);
      PokemonStatusBW.runtimeState = nextSnapshot;
      if (typeof PokemonBattle !== "undefined" && typeof PokemonBattle.acceptStatusState === "function") {
        PokemonBattle.acceptStatusState(nextSnapshot);
      }
    }
    PokemonStatusBW.runtimeBag = nextBagMeta;
    if (typeof PokemonBattle !== "undefined" && typeof PokemonBattle.acceptStatusBag === "function") {
      PokemonBattle.acceptStatusBag(nextBagMeta);
    }
    setNotice(message);
    if (typeof setTemplateValue === "function") {
      try {
        if (!options.bagOnly) await setTemplateValue("POKEMON_STATE", encodeURIComponent(JSON.stringify(nextSnapshot)));
        await setTemplateValue("POKEMON_BAG", encodeURIComponent(JSON.stringify(nextBagMeta)));
      } catch (ignore) { setNotice("저장에 실패했습니다. 다음 호출에는 stateText와 bagText를 전달해 주세요."); }
    }
    if (typeof sendToAI === "function") {
      try { sendToAI("[POKEMON_SYNC]" + JSON.stringify(packSync(nextSnapshot, nextBagMeta)) + "[/POKEMON_SYNC]", true); }
      catch (ignore) { /* The saved template and visible screen remain available. */ }
    }
  };
  const evValue = (pokemon, key) => clamp(pokemon && pokemon.evs && pokemon.evs[key] || 0, 0, 252);
  const evTotal = (values) => STATS.reduce((sum, key) => sum + clamp(values && values[key] || 0, 0, 252), 0);
  const evPrice = (pokemon, values) => STATS.reduce((sum, key) => sum + Math.abs(clamp(values && values[key] || 0, 0, 252) - evValue(pokemon, key)), 0) * 10;
  const changeEvDraft = (key, amount) => {
    if (!selected || !evDraft) return;
    const current = clamp(evDraft[key] || 0, 0, 252);
    const next = clamp(current + amount, 0, 252);
    if (next === current || evTotal(evDraft) - current + next > 510) return;
    setEvDraft({ ...evDraft, [key]: next });
  };
  const baseStatRow = (pokemon) => {
    const species = idOf(pokemon.species);
    const form = POKEMON_STATUS_FORM_STATS[species];
    if (form) return form;
    const match = POKEMON_STATUS_DATA.baseIds.reduce((best, id, index) =>
      species.startsWith(id) && (!best || id.length > POKEMON_STATUS_DATA.baseIds[best - 1].length) ? index + 1 : best, 0);
    const dexNum = /^\d+$/.test(species) ? Number(species) : POKEMON_STATUS_DATA.index[species] || match;
    return POKEMON_STATUS_BASE_STATS[dexNum - 1] || null;
  };
  const actualStat = (pokemon, key, evs = pokemon.evs) => {
    const row = baseStatRow(pokemon);
    if (!row) return null;
    const base = row[STATS.indexOf(key)];
    const level = clamp(pokemon.level, 1, 100);
    const iv = pokemon.ivs && pokemon.ivs[key] != null ? clamp(pokemon.ivs[key], 0, 31) : 31;
    const ev = clamp(evs && evs[key] || 0, 0, 252);
    const core = Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100);
    if (key === "hp") return base === 1 ? 1 : core + level + 10;
    const nature = NATURES[pokemon.nature] || NATURES.Hardy;
    const multiplier = nature[1] === key ? 1.1 : nature[2] === key ? .9 : 1;
    return Math.floor((core + 5) * multiplier);
  };
  const hpFromEvs = (pokemon, values) => actualStat(pokemon, "hp", values) || maxHp(pokemon);
  const healParty = async () => {
    const nextOwned = owned.map((pokemon) => {
      if (pokemon.inBox) return pokemon;
      const full = actualStat(pokemon, "hp") || maxHp(pokemon);
      return { ...pokemon, hp: full, maxHp: full, status: "NORMAL", sleepTurns: 0,
        pp: (pokemon.moves || []).map((moveId, index) => {
          const known = teachCatalog.moves.find((row) => row[0] === moveId);
          return known ? Number(known[4]) || Number(pokemon.pp && pokemon.pp[index]) || 1 : Number(pokemon.pp && pokemon.pp[index]) || 1;
        }) };
    });
    await save(nextOwned, bag, "파티 포켓몬의 HP·상태 이상·PP가 모두 회복됐습니다.");
  };
  const changeNature = async (nextNature) => {
    if (!selected || !NATURES[nextNature] || selected.nature === nextNature) return;
    const nextOwned = owned.map((pokemon) => pokemon.uid === selected.uid ? { ...pokemon, nature: nextNature } : pokemon);
    await save(nextOwned, bag, displayName(selected) + "의 성격을 " + NATURES[nextNature][0] + "(으)로 변경했습니다.");
    setView("detail");
  };
  const changeAbility = async (nextAbility) => {
    if (!selected || selected.ability === nextAbility || !abilityOptions(selected).some((row) => row.id === nextAbility)) return;
    const nextOwned = owned.map((pokemon) => pokemon.uid === selected.uid ? { ...pokemon, ability: nextAbility } : pokemon);
    await save(nextOwned, bag, displayName(selected) + "의 특성을 " + (POKEMON_STATUS_ABILITY_KO[nextAbility] || nextAbility) + "(으)로 변경했습니다.");
    setView("detail");
  };
  const buyEvs = async () => {
    if (!selected || !evDraft || evBusy.current) return;
    const values = Object.fromEntries(STATS.map((key) => [key, clamp(evDraft[key], 0, 252)]));
    const price = evPrice(selected, values);
    if (evTotal(values) > 510 || !price || price > money) { setNotice("노력치 한도 또는 소지금을 확인해 주세요."); return; }
    evBusy.current = true;
    try {
      const oldMax = selected.maxHp == null ? hpFromEvs(selected, selected.evs) : maxHp(selected);
      const newMax = hpFromEvs(selected, values);
      const hp = selected.hp == null ? newMax : selected.hp <= 0 ? 0 : Math.max(1, Math.min(newMax, selected.hp + newMax - oldMax));
      const nextOwned = owned.map((pokemon) => pokemon.uid === selected.uid ? { ...pokemon, evs: values, maxHp: newMax, hp } : pokemon);
      await save(nextOwned, bag, displayName(selected) + "의 노력치를 조정했습니다. ₽" + price.toLocaleString() + " 지불", { money: money - price });
      setEvDraft(null);
      setView("detail");
    } finally { evBusy.current = false; }
  };
  const changeHeld = async (uid, nextId) => {
    const target = owned.find((pokemon) => pokemon.uid === uid);
    const current = target && idOf(target.heldItem);
    if (!target || current === nextId || nextId && (!ITEM[nextId] || !ITEM[nextId].held || !(bag[nextId] > 0))) return;
    const nextBag = { ...bag };
    if (current) nextBag[current] = Math.min(999, (nextBag[current] || 0) + 1);
    if (nextId) nextBag[nextId] -= 1;
    const nextOwned = owned.map((pokemon) => pokemon.uid === uid ? { ...pokemon, heldItem: nextId } : pokemon);
    await save(nextOwned, nextBag, displayName(target) + "의 지닌물건을 " +
      (nextId ? ITEM[nextId].name + "(으)로 바꿨습니다." : "가방에 넣었습니다."));
    setSelectedItem("");
    setView("detail");
  };
  const compatibleIds = (pokemon) => {
    if (!pokemon) return [];
    const species = idOf(pokemon.species);
    const number = POKEMON_STATUS_DATA.index[species] ||
      (POKEMON_STATUS_DATA.baseIds.findIndex((id) => species.startsWith(id)) + 1);
    const base = number ? POKEMON_STATUS_DATA.baseIds[number - 1] : "";
    return teachCatalog.bySpecies[species] || teachCatalog.bySpecies[base] || [];
  };
  const learnMove = async (id, forgetIndex = -1) => {
    const pokemon = owned.find((entry) => entry.uid === selectedUid);
    const row = teachCatalog.moves.find((entry) => entry[0] === id);
    if (!pokemon || !row || !compatibleIds(pokemon).some((index) => teachCatalog.moves[index][0] === id)) return;
    const moves = [...(pokemon.moves || [])];
    const pp = [...(pokemon.pp || [])];
    const names = [...(pokemon.moveNames || [])];
    if (moves.includes(id)) { setNotice("이미 배운 기술입니다."); return; }
    if (moves.length >= 4) {
      if (forgetIndex < 0 || forgetIndex >= moves.length) return;
      moves.splice(forgetIndex, 1);
      pp.splice(forgetIndex, 1);
      names.splice(forgetIndex, 1);
    }
    moves.push(id);
    pp.push(row[4]);
    names.push(row[1]);
    const nextOwned = owned.map((entry) => entry.uid === selectedUid ? { ...entry, moves, pp, moveNames: names } : entry);
    await save(nextOwned, bag, displayName(pokemon) + "이(가) " + row[1] + "을(를) 배웠습니다.");
    setTeachId("");
    setView("detail");
  };
  const chooseLead = (roster, preferred) => {
    const party = roster.filter((pokemon) => !pokemon.inBox);
    const current = party.find((pokemon) => pokemon.uid === preferred && pokemon.hp !== 0);
    return (current || party.find((pokemon) => pokemon.hp !== 0) || party[0] || {}).uid || "";
  };
  const deposit = async (uid) => {
    const party = owned.filter((pokemon) => !pokemon.inBox);
    const target = party.find((pokemon) => pokemon.uid === uid);
    if (!target || party.length <= 1) { setNotice("파티에는 최소 한 마리가 남아야 합니다."); return; }
    const nextOwned = owned.map((pokemon) => pokemon.uid === uid ? { ...pokemon, inBox: true } : pokemon);
    await save(nextOwned, bag, displayName(target) + "을(를) PC에 맡겼습니다.",
      { activeUid: chooseLead(nextOwned, snapshot.activeUid) });
    setView("pc"); setPage(0); setQuery("");
  };
  const withdraw = async (uid, swapUid = "") => {
    const target = owned.find((pokemon) => pokemon.uid === uid && pokemon.inBox);
    const party = owned.filter((pokemon) => !pokemon.inBox);
    const swapped = party.find((pokemon) => pokemon.uid === swapUid);
    if (!target || party.length >= 6 && !swapped) { setNotice("파티가 가득 찼습니다. 교체할 포켓몬을 선택하세요."); return; }
    const nextOwned = owned.map((pokemon) => pokemon.uid === uid ? { ...pokemon, inBox: false }
      : pokemon.uid === swapUid ? { ...pokemon, inBox: true } : pokemon);
    await save(nextOwned, bag, displayName(target) + "을(를) 파티로 꺼냈습니다." +
      (swapped ? " " + displayName(swapped) + "은(는) PC에 보관했습니다." : ""),
      { activeUid: chooseLead(nextOwned, snapshot.activeUid === swapUid ? uid : snapshot.activeUid) });
    setView("party"); setPage(0); setQuery("");
  };
  PokemonStatusBW.acceptBattleState = (nextSnapshot, nextBagMeta) => {
    if (nextSnapshot && Array.isArray(nextSnapshot.owned)) {
      setOwned(nextSnapshot.owned);
      setSnapshot(nextSnapshot);
      PokemonStatusBW.runtimeState = nextSnapshot;
    }
    if (nextBagMeta && nextBagMeta.items) {
      const receivedBag = normalizeBag(nextBagMeta.items);
      if (bag && bag.keystone > 0) receivedBag.keystone = 1;
      setBag(receivedBag);
      nextBagMeta = { ...nextBagMeta, items: receivedBag };
      setMoney(clamp(nextBagMeta.money == null ? money : nextBagMeta.money, 0, 9999999));
      setBagMeta(nextBagMeta);
      PokemonStatusBW.runtimeBag = nextBagMeta;
    }
  };
  const cartTotal = Object.keys(cart).reduce((sum, id) => sum + (ITEM[id] ? ITEM[id].price * cart[id] : 0), 0);
  const changeCart = (id, delta) => {
    if (!ITEM[id] || !bag) return;
    const next = clamp((cart[id] || 0) + delta, 0, Math.max(0, (ITEM[id].limit || 999) - (bag[id] || 0)));
    const updated = { ...cart };
    if (next) updated[id] = next; else delete updated[id];
    setCart(updated);
    setNotice("");
  };
  const checkout = async () => {
    if (!bag || !cartTotal || cartTotal > money || checkoutBusy.current) return;
    const nextBag = { ...bag };
    for (const id of Object.keys(cart)) {
      if (!ITEM[id] || !Number.isInteger(cart[id]) || cart[id] < 1 || (nextBag[id] || 0) + cart[id] > (ITEM[id].limit || 999)) {
        setNotice("장바구니 수량을 다시 확인해 주세요."); return;
      }
      nextBag[id] = (nextBag[id] || 0) + cart[id];
    }
    checkoutBusy.current = true;
    try {
      await save(owned, nextBag, "장바구니를 결제했습니다. ₽" + cartTotal.toLocaleString(), { money: money - cartTotal, bagOnly: true });
      setCart({});
    } finally { checkoutBusy.current = false; }
  };
  const evolutionOptions = (pokemon, itemId) => {
    const species = idOf(pokemon.species);
    const gender = String(pokemon.gender || "").toUpperCase();
    return POKEMON_ITEM_EVOS.filter((row) => row[0] === species && row[1] === itemId &&
      (!row[4] || row[4] === gender));
  };
  const evolvedName = (species) => {
    const number = POKEMON_STATUS_DATA.index[species] || POKEMON_STATUS_DATA.baseIds.findIndex((id) => species.startsWith(id)) + 1;
    return POKEMON_STATUS_DATA.forms[species] || POKEMON_STATUS_DATA.names[number - 1] || species;
  };
  const evolveWithItem = async (itemId, uid, option) => {
    const target = owned.find((pokemon) => pokemon.uid === uid);
    if (!target || !bag[itemId] || !evolutionOptions(target, itemId).some((row) => row[2] === option[2])) return;
    const newName = evolvedName(option[2]);
    const oldName = displayName(target);
    const iv = target.ivs && target.ivs.hp != null ? target.ivs.hp : 31;
    const ev = target.evs && target.evs.hp || 0;
    const newMax = Math.floor((2 * option[3] + iv + Math.floor(ev / 4)) * target.level / 100) + target.level + 10;
    const oldMax = target.maxHp == null ? null : maxHp(target);
    const nextHp = target.hp == null ? newMax : target.hp <= 0 ? 0 :
      Math.max(1, Math.min(newMax, target.hp + newMax - (oldMax || newMax)));
    const oldSpeciesName = target.speciesNameKo || evolvedName(idOf(target.species));
    const nextAbility = POKEMON_STATUS_ABILITY_DEFAULTS[POKEMON_STATUS_DATA.index[option[2]] - 1];
    const nextPokemon = { ...target, species: option[2], spriteId: option[2], speciesNameKo: newName,
      nickname: target.nickname === oldSpeciesName || target.nickname === target.species ? newName : target.nickname,
      ability: idOf(nextAbility || target.ability), maxHp: newMax, hp: nextHp };
    await save(owned.map((pokemon) => pokemon.uid === uid ? nextPokemon : pokemon),
      { ...bag, [itemId]: bag[itemId] - 1 }, oldName + "이(가) " + newName + "(으)로 진화했다!");
    setEvoEvent({ from: target, to: nextPokemon, token: Date.now() });
    setSelectedItem("");
    setView("evolution");
  };
  const itemUsable = (item, pokemon, itemId) => {
    if (!item || !pokemon) return false;
    if (item.evolution) return evolutionOptions(pokemon, itemId).length > 0;
    if (pokemon.hp == null || pokemon.maxHp == null) return false;
    if (item.revive) return pokemon.hp === 0;
    return pokemon.hp > 0 && ((item.heal && pokemon.hp < maxHp(pokemon)) ||
      (item.cure && pokemon.status && pokemon.status !== "NORMAL" || item.cureStatus && [item.cureStatus, item.cureStatus === "psn" ? "tox" : ""].includes(String(pokemon.status || "").toLowerCase())));
  };
  const useItem = async (id, uid) => {
    const item = ITEM[id];
    if (!item || !bag[id]) return;
    const target = owned.find((pokemon) => pokemon.uid === uid);
    if (!itemUsable(item, target, id)) { setNotice("이 포켓몬에게는 사용할 수 없습니다."); return; }
    if (item.evolution) {
      const options = evolutionOptions(target, id);
      if (options.length > 1) { setSelectedUid(uid); setView("evochoice"); return; }
      await evolveWithItem(id, uid, options[0]);
      return;
    }
    const full = maxHp(target);
    const hp = clamp(target.hp, 0, full);
    const nextOwned = owned.map((pokemon) => pokemon.uid === uid ? {
      ...pokemon, hp: item.revive ? Math.max(1, Math.floor(full / 2)) : item.heal ? Math.min(full, hp + item.heal) : hp,
      status: item.cure || item.cureStatus ? "NORMAL" : pokemon.status
    } : pokemon);
    const nextBag = { ...bag, [id]: bag[id] - 1 };
    await save(nextOwned, nextBag, displayName(target) + "에게 " + item.name + "을(를) 사용했습니다.");
    setSelectedItem("");
    setView("party");
  };
  const panel = { border: "3px solid #4ce4ed", boxShadow: "inset 0 0 0 2px #d7ffff, 3px 3px 0 #071e29", background: "#0a4565", color: "#f6ffff" };
  const button = (label, click, active, disabled) => <button type="button" onClick={click} disabled={!!disabled} style={{
    ...panel, borderColor: active ? "#ffca57" : "#4ce4ed", width: "100%", padding: "9px 11px", cursor: disabled ? "default" : "pointer",
    textAlign: "left", fontFamily: "inherit", fontSize: 13, fontWeight: 900, opacity: disabled ? .45 : 1 }}>{label}</button>;
  if (!bag) return <div style={{ padding: 12, color: "#fff", background: "#0e2533" }}>상태창 준비 중...</div>;
  const partyMembers = owned.filter((pokemon) => !pokemon.inBox);
  const boxMembers = owned.filter((pokemon) => pokemon.inBox);
  const filtered = (view === "pc" ? boxMembers : partyMembers).filter((pokemon) =>
    (displayName(pokemon) + " " + pokemon.speciesNameKo + " " + pokemon.species).toLowerCase().includes(query.toLowerCase()));
  const shown = filtered.slice(page * 24, page * 24 + 24);
  const groups = ["전체", "볼", "회복", "진화", "전투", "지닌", "메가", "중요", "기타"];
  const itemIds = Object.keys(bag).filter((id) => bag[id] > 0 && (bagGroup === "전체" || (ITEM[id] ? ITEM[id].group : "기타") === bagGroup));
  const itemName = (id) => ITEM[id] ? ITEM[id].name : id;
  const evolutionCount = Object.keys(ITEM).filter((id) => ITEM[id].group === "진화").length;
  const oldStones = ["firestone","waterstone","thunderstone","leafstone","moonstone","sunstone","shinystone","duskstone","dawnstone","icestone"];
  const shopItems = Object.keys(ITEM).filter((id) => {
    if (shopGroup !== "전체" && ITEM[id].group !== shopGroup) return false;
    if (shopGroup === "진화" && shopKind === "진화의 돌" && !oldStones.includes(id)) return false;
    if (shopGroup === "진화" && shopKind === "조건·전용" && (oldStones.includes(id) || id.startsWith("evotoken"))) return false;
    if (shopGroup === "진화" && shopKind === "진화권" && !id.startsWith("evotoken")) return false;
    return (ITEM[id].name + id).toLowerCase().includes(shopQuery.toLowerCase());
  });
  const allMoves = selected ? compatibleIds(selected).map((index) => teachCatalog.moves[index]).filter(Boolean) : [];
  const matchedMoves = allMoves.filter((row) => (row[0] + " " + row[1]).toLowerCase().includes(moveQuery.toLowerCase()))
    .sort((left, right) => left[1].localeCompare(right[1], "ko"));
  const visibleMoves = matchedMoves.slice(movePage * 20, movePage * 20 + 20);
  const chosenMove = teachCatalog.moves.find((row) => row[0] === teachId);
  return <section style={{ width: "100%", maxWidth: 730, margin: "0 auto", boxSizing: "border-box", padding: 11,
    backgroundColor: "#0b1c28", backgroundImage: "linear-gradient(#263b49 1px,transparent 1px),linear-gradient(90deg,#263b49 1px,transparent 1px)",
    backgroundSize: "22px 22px", border: "4px solid #091923", color: "#fff", fontFamily: "monospace" }}>
    <div style={{ ...panel, display: "flex", justifyContent: "space-between", gap: 8, padding: "8px 12px", marginBottom: 10 }}>
      <strong>{view === "home" ? "메뉴" : view === "party" ? "포켓몬" : view === "pc" ? "PC 보관함" : view === "swap" ? "파티 교체" : view === "detail" ? "포켓몬 정보" : view === "ev" ? "노력치 조정" : view === "nature" ? "성격 변경" : view === "ability" ? "특성 변경" : view === "teach" ? "기술 배우기" : view === "forget" ? "기술 교체" : view === "bag" ? "가방" : view === "shop" ? "상점" : view === "evolution" ? "진화" : view === "evochoice" ? "진화 선택" : view === "held" ? "지닌물건" : view === "holdtarget" ? "지닌물건 줄 포켓몬" : "아이템 사용"} <span style={{ color: "#ffe289", fontSize: 10 }}>확장판 09.28</span></strong>
      <span>{trainerName} · 보유 {owned.length}마리 · ₽{money.toLocaleString()}{bag.keystone > 0 ? " · 키스톤 보유" : ""}</span>
    </div>
    {view === "home" && <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10, minHeight: 260, alignContent: "center" }}>
      {button("◉ 포켓몬  " + partyMembers.length, () => { setView("party"); setPage(0); setQuery(""); })}
      {button("▣ 가방  " + Object.values(bag).reduce((a, b) => a + b, 0), () => setView("bag"))}
      {button("▣ PC 보관함  " + boxMembers.length, () => { setView("pc"); setPage(0); setQuery(""); })}
      {button("▤ 상점", () => setView("shop"))}
      <div style={{ gridColumn: "1 / -1" }}>{button("마스터 학습장치 " + (snapshot.expShare ? "ON · 파티 전원 경험치" : "OFF · 참가자만 경험치"),
        () => save(owned, bag, "마스터 학습장치가 " + (snapshot.expShare ? "꺼졌습니다." : "켜졌습니다."), { expShare: !snapshot.expShare }), snapshot.expShare)}</div>
    </div>}
    {(view === "party" || view === "pc") && <>
      {view === "party" && <div style={{ marginBottom: 9 }}>{button("✚ 파티 전체 회복 · HP / 상태 이상 / PP", healParty, false, !partyMembers.length)}</div>}
      <div style={{ display: "flex", gap: 8, marginBottom: 9 }}>
        <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} placeholder="이름 또는 영문 ID 검색" style={{ flex: 1, minWidth: 0, padding: 8, background: "#102e43", border: "2px solid #4ce4ed", color: "#fff", fontFamily: "inherit" }} />
        <span style={{ fontSize: 11, alignSelf: "center" }}>파티 {partyMembers.length}/6 · PC {boxMembers.length}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8, maxHeight: 440, overflowY: "auto" }}>
        {shown.map((pokemon, index) => {
          const full = maxHp(pokemon);
          const hp = pokemon.hp == null ? null : clamp(pokemon.hp, 0, full);
          const ratio = hp == null ? 0 : hp / full;
          return <button key={pokemon.uid || index} type="button" onClick={() => { setSelectedUid(pokemon.uid); setDetailFrom(view); setView("detail"); }} style={{
            ...panel, display: "flex", alignItems: "center", gap: 5, minWidth: 0, padding: 6,
            background: (page * 24 + index) % 2 ? "#06304b" : "#075a81", textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
            {sprite(pokemon, 52)}
            <span style={{ flex: 1, minWidth: 0, color: "#fff" }}>
              <strong style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 14 }}>{displayName(pokemon)}</strong>
              <span style={{ fontSize: 11 }}>Lv.{pokemon.level} · {hp == null ? "HP 계산 전" : hp <= 0 ? "기절" : "HP " + hp + "/" + full}</span>
              <span style={{ display: "block", height: 7, marginTop: 4, border: "2px solid #d6faff", background: "#18313b" }}>
                <span style={{ display: "block", width: ratio * 100 + "%", height: "100%", background: ratio > .5 ? "#5bd46f" : ratio > .2 ? "#e1c15a" : "#e56c6c" }} />
              </span>
            </span>
          </button>;
        })}
        {view === "party" && !query && partyMembers.length < 6 && Array.from({ length: 6 - partyMembers.length }, (_, index) => <div key={"empty-" + index} style={{ ...panel, opacity: .35, height: 64, background: "#39364f" }} />)}
      </div>
      {!filtered.length && <p>{view === "pc" ? "PC에 보관된 포켓몬이 없습니다." : "파티에 포켓몬이 없습니다."}</p>}
      {filtered.length > 24 && <div style={{ display: "flex", gap: 8, marginTop: 9 }}>
        {button("◀ 이전", () => setPage(Math.max(0, page - 1)), false, page === 0)}
        <span style={{ alignSelf: "center", whiteSpace: "nowrap" }}>{page + 1} / {Math.ceil(filtered.length / 24)}</span>
        {button("다음 ▶", () => setPage(Math.min(Math.ceil(filtered.length / 24) - 1, page + 1)), false, page + 1 >= Math.ceil(filtered.length / 24))}
      </div>}
    </>}
    {view === "detail" && selected && <div style={{ ...panel, padding: 12 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>{sprite(selected, 92)}<div><strong style={{ fontSize: 19 }}>{displayName(selected)}</strong><div>Lv.{selected.level} · {selected.speciesNameKo || selected.species}</div><div>HP {selected.hp == null ? "계산 전" : selected.hp + "/" + maxHp(selected)} · {(NATURES[selected.nature] || NATURES.Hardy)[0]}</div><div>특성 {POKEMON_STATUS_ABILITY_KO[selected.ability] || selected.ability || "없음"}</div></div></div>
      {!selected.inBox && <div style={{ marginTop: 10 }}>{button(snapshot.activeUid === selected.uid ? "현재 선두 포켓몬" : "배틀 선두로 지정", () => save(owned, bag, displayName(selected) + "을(를) 선두로 지정했습니다.", { activeUid: selected.uid }), false, snapshot.activeUid === selected.uid || selected.hp === 0)}</div>}
      <div style={{ marginTop: 8 }}>{selected.inBox
        ? button(partyMembers.length >= 6 ? "파티 포켓몬과 교체" : "파티로 꺼내기", () => partyMembers.length >= 6 ? setView("swap") : withdraw(selected.uid))
        : button("PC에 맡기기", () => deposit(selected.uid), false, partyMembers.length <= 1)}</div>
      <div style={{ marginTop: 9 }}>{button("특성 변경 · " + (POKEMON_STATUS_ABILITY_KO[selected.ability] || selected.ability || "없음"), () => { setNotice(""); setView("ability"); })}</div>
      {Number.isFinite(Number(selected.exp)) && Number.isFinite(Number(selected.nextExp)) && <div style={{ marginTop: 10, fontSize: 11 }}>
        <div>경험치 {selected.exp} / {selected.nextExp}{selected.level >= 100 ? " · 최고 레벨" : ""}</div>
        <div style={{ height: 8, border: "2px solid #d6faff", background: "#18313b" }}>
          <div style={{ height: "100%", width: (selected.level >= 100 ? 100 : Math.max(0, Math.min(100, 100 * (selected.exp - (selected.expFloor || 0)) / Math.max(1, selected.nextExp - (selected.expFloor || 0))))) + "%", background: "#5ea7f0" }} />
        </div>
      </div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 6, marginTop: 12, fontSize: 11 }}>
        {STATS.map((key, index) => <div key={key} style={{ background: "#12364f", padding: 5 }}>
          <strong style={{ display: "block", fontSize: 13 }}>{statKo[index]} {actualStat(selected, key) ?? "—"}</strong>
          <span style={{ opacity: .76 }}>종족값 {((baseStatRow(selected) || [])[index]) ?? "—"} · IV {selected.ivs && selected.ivs[key] != null ? selected.ivs[key] : 31} · EV {selected.evs && selected.evs[key] || 0}</span>
        </div>)}
      </div>
      <div style={{ marginTop: 8 }}>{button("성격 변경 · " + (NATURES[selected.nature] || NATURES.Hardy)[0], () => { setNotice(""); setView("nature"); })}</div>
      <div style={{ marginTop: 8 }}>{button("노력치 조정 · 1포인트당 ₽10", () => { setEvDraft(Object.fromEntries(STATS.map((key) => [key, evValue(selected, key)]))); setNotice(""); setView("ev"); })}</div>
      <div style={{ marginTop: 12, fontSize: 12 }}>기술: {(selected.moveNames && selected.moveNames.length ? selected.moveNames : selected.moves || []).join(" / ") || "없음"}</div>
      <div style={{ marginTop: 10, fontSize: 12 }}>지닌물건: {selected.heldItem ? itemName(selected.heldItem) : "없음"}</div>
      <div style={{ display: "flex", gap: 7, marginTop: 7 }}>
        {button("지닌물건 주기·교체", () => setView("held"))}
        {button("지닌물건 빼기", () => changeHeld(selected.uid, ""), false, !selected.heldItem)}
      </div>
      <div style={{ marginTop: 10 }}>{button("기술 배우기", () => { setMoveQuery(""); setMovePage(0); setTeachId(""); setView("teach"); })}</div>
    </div>}
    {view === "ability" && selected && <div style={{ ...panel, padding: 11 }}>
      <strong>{displayName(selected)} · 특성 선택</strong>
      <div style={{ fontSize: 11, margin: "7px 0" }}>이 포켓몬의 종과 현재 모습에서 가질 수 있는 특성입니다. 변경은 무료입니다.</div>
      {abilityOptions(selected).length < 2 && <div style={{ marginBottom: 7, color: "#ffe289", fontSize: 11 }}>현재 모습에서 선택 가능한 특성이 1개입니다.</div>}
      <div style={{ display: "grid", gap: 7 }}>
        {abilityOptions(selected).map((row) => <React.Fragment key={row.id}>{button(<span>{POKEMON_STATUS_ABILITY_KO[row.id] || row.id}{selected.ability === row.id ? " ✓" : ""}
          <small style={{ display: "block", opacity: .75, fontSize: 10 }}>{row.hidden ? "숨겨진 특성" : "일반 특성"} · {row.id}</small>
        </span>, () => changeAbility(row.id), selected.ability === row.id, selected.ability === row.id)}</React.Fragment>)}
      </div>
    </div>}
    {view === "nature" && selected && <div style={{ ...panel, padding: 11 }}>
      <strong>{displayName(selected)} · 성격 선택</strong>
      <div style={{ fontSize: 11, margin: "7px 0" }}>성격에 따라 한 능력치가 10% 올라가고 다른 능력치가 10% 내려갑니다. HP는 변하지 않습니다. 변경은 무료입니다.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 6, maxHeight: 360, overflowY: "auto" }}>
        {Object.entries(NATURES).map(([id, nature]) => <React.Fragment key={id}>{button(<span>{nature[0]}{selected.nature === id ? " ✓" : ""}<small style={{ display: "block", opacity: .75, fontSize: 10 }}>
          {nature[1] ? statKo[STATS.indexOf(nature[1])] + " ↑ · " + statKo[STATS.indexOf(nature[2])] + " ↓" : "능력치 변화 없음"}
        </small></span>, () => changeNature(id), selected.nature === id, selected.nature === id)}</React.Fragment>)}
      </div>
    </div>}
    {view === "ev" && selected && evDraft && <div style={{ ...panel, padding: 11 }}>
      <strong>{displayName(selected)} · 노력치 {evTotal(evDraft)}/510</strong>
      <div style={{ fontSize: 11, margin: "7px 0" }}>한 능력치 최대 252 · 올리거나 내린 1포인트마다 ₽10</div>
      <div style={{ display: "grid", gap: 6, maxHeight: 350, overflowY: "auto" }}>
        {STATS.map((key, index) => <div key={key} style={{ display: "grid", gridTemplateColumns: "52px repeat(2,45px) 1fr repeat(2,45px)", gap: 3, alignItems: "center", background: "#12364f", padding: 4 }}>
          <strong style={{ fontSize: 11 }}>{statKo[index]}</strong>
          {button("−10", () => changeEvDraft(key, -10), false, evDraft[key] <= 0)}
          {button("−1", () => changeEvDraft(key, -1), false, evDraft[key] <= 0)}
          <strong style={{ textAlign: "center" }}>{evDraft[key]}</strong>
          {button("+1", () => changeEvDraft(key, 1), false, evDraft[key] >= 252 || evTotal(evDraft) >= 510)}
          {button("+10", () => changeEvDraft(key, 10), false, evDraft[key] >= 252 || evTotal(evDraft) >= 510)}
        </div>)}
      </div>
      <div style={{ margin: "10px 0", fontSize: 12 }}>변경 비용 ₽{evPrice(selected, evDraft).toLocaleString()} · 소지금 ₽{money.toLocaleString()}</div>
      {button("결제하고 노력치 저장", buyEvs, false, !evPrice(selected, evDraft) || evPrice(selected, evDraft) > money || evTotal(evDraft) > 510)}
    </div>}
    {view === "teach" && selected && <>
      <div style={{ ...panel, padding: 8, marginBottom: 8, fontSize: 11 }}>{displayName(selected)}이(가) 배울 수 있는 기술 {allMoves.length}개 · 원하는 기술을 검색하세요.</div>
      <input value={moveQuery} onChange={(event) => { setMoveQuery(event.target.value); setMovePage(0); }}
        placeholder="한국어 기술명 또는 영문 ID 검색" style={{ width: "100%", boxSizing: "border-box", padding: 8, marginBottom: 8,
          background: "#102e43", border: "2px solid #4ce4ed", color: "#fff", fontFamily: "inherit" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 6, maxHeight: 380, overflowY: "auto" }}>
        {visibleMoves.map((row) => <React.Fragment key={row[0]}>{button(<span>{row[1]}<small style={{ display: "block", opacity: .75, fontSize: 10 }}>
          {MOVE_TYPES[row[2]]} · {row[3] === 2 ? "변화" : row[3] === 0 ? "물리" : "특수"} · PP {row[4]}
          {!(row[3] !== 2 || row[6] || POKEMON_ADVANCED_MOVE_IDS.has(row[0])) ? " · 전투 효과 미지원" : ""}
        </small></span>, () => {
          if ((selected.moves || []).length >= 4) { setTeachId(row[0]); setView("forget"); }
          else learnMove(row[0]);
        }, false, (selected.moves || []).includes(row[0]))}</React.Fragment>)}
      </div>
      {!matchedMoves.length && <div style={{ padding: 10 }}>검색 결과가 없습니다.</div>}
      {matchedMoves.length > 20 && <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {button("◀ 이전", () => setMovePage(Math.max(0, movePage - 1)), false, movePage === 0)}
        <span style={{ alignSelf: "center", whiteSpace: "nowrap" }}>{movePage + 1}/{Math.ceil(matchedMoves.length / 20)}</span>
        {button("다음 ▶", () => setMovePage(Math.min(Math.ceil(matchedMoves.length / 20) - 1, movePage + 1)), false, movePage + 1 >= Math.ceil(matchedMoves.length / 20))}
      </div>}
    </>}
    {view === "forget" && selected && chosenMove && <div style={{ display: "grid", gap: 7 }}>
      <div style={{ ...panel, padding: 9 }}>{displayName(selected)}이(가) {chosenMove[1]}을(를) 배우려 합니다. 잊을 기술을 고르세요.</div>
      {(selected.moves || []).map((id, index) => <React.Fragment key={id + index}>{button(
        ((selected.moveNames || [])[index] || (teachCatalog.moves.find((row) => row[0] === id) || [])[1] || id) + " 잊기",
        () => learnMove(chosenMove[0], index))}</React.Fragment>)}
    </div>}
    {view === "swap" && selected && selected.inBox && <div style={{ display: "grid", gap: 7 }}>
      <div style={{ ...panel, padding: 8 }}>{displayName(selected)}과 교체할 파티 포켓몬을 고르세요.</div>
      {partyMembers.map((pokemon) => <React.Fragment key={pokemon.uid}>{button(
        displayName(pokemon) + " · Lv." + pokemon.level + " · HP " + (pokemon.hp == null ? "계산 전" : pokemon.hp + "/" + maxHp(pokemon)),
        () => withdraw(selected.uid, pokemon.uid))}</React.Fragment>)}
    </div>}
    {view === "held" && selected && <div style={{ display: "grid", gap: 6, maxHeight: 410, overflowY: "auto" }}>
      <div style={{ ...panel, padding: 8 }}>{displayName(selected)}에게 줄 지닌물건을 선택하세요.</div>
      {Object.keys(bag).filter((id) => bag[id] > 0 && ITEM[id] && ITEM[id].held).map((id) =>
        <React.Fragment key={id}>{button(itemName(id) + " ×" + bag[id], () => changeHeld(selected.uid, id))}</React.Fragment>)}
      {!Object.keys(bag).some((id) => bag[id] > 0 && ITEM[id] && ITEM[id].held) && <p>가방에 지닌물건이 없습니다.</p>}
    </div>}
    {view === "holdtarget" && <div style={{ display: "grid", gap: 6, maxHeight: 410, overflowY: "auto" }}>
      {owned.map((pokemon) => <React.Fragment key={pokemon.uid}>
        {button(displayName(pokemon) + " · " + (pokemon.heldItem ? itemName(pokemon.heldItem) : "지닌물건 없음"),
          () => changeHeld(pokemon.uid, selectedItem))}
      </React.Fragment>)}
    </div>}
    {view === "bag" && <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 5, marginBottom: 9 }}>{groups.map((group) => <React.Fragment key={group}>{button(group, () => setBagGroup(group), bagGroup === group)}</React.Fragment>)}</div>
      <div style={{ display: "grid", gap: 7, maxHeight: 410, overflowY: "auto" }}>
        {itemIds.map((id) => <React.Fragment key={id}>{button(<span>{itemName(id)} ×{bag[id]}<small style={{ display: "block", opacity: .7, fontSize: 10 }}>{ITEM[id] ? ITEM[id].note : "보관 중인 아이템"}</small></span>, () => {
          if (ITEM[id] && ITEM[id].held && bag[id] > 0) { setSelectedItem(id); setView("holdtarget"); }
          else if (ITEM[id] && ITEM[id].group !== "볼" && ITEM[id].group !== "전투" && ITEM[id].group !== "중요" && bag[id] > 0) { setSelectedItem(id); setView("target"); }
          else setNotice(ITEM[id] && ITEM[id].group === "볼" ? "볼은 야생 포켓몬과 배틀할 때 사용합니다." :
            ITEM[id] && ITEM[id].group === "전투" ? "전투 도구는 배틀 중 가방에서 사용합니다." :
            id === "keystone" ? "키스톤을 보유하면 메가스톤을 지닌 포켓몬이 배틀 중 메가진화할 수 있습니다." : "이 아이템은 여기에서 사용할 수 없습니다.");
        }, false, bag[id] <= 0)}</React.Fragment>)}
      </div>
      {!itemIds.length && <p>이 주머니는 비어 있습니다.</p>}
    </>}
    {view === "shop" && <div style={{ display: "grid", gap: 8, maxHeight: 440, overflowY: "auto" }}>
      <div style={{ ...panel, padding: 8 }}>소지금 ₽{money.toLocaleString()} · 장바구니 합계 ₽{cartTotal.toLocaleString()}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 5 }}>
        {groups.map((group) => <React.Fragment key={group}>{button(group === "진화" ? "진화 " + evolutionCount + "종" : group, () => { setShopGroup(group); setShopQuery(""); setShopKind(group === "진화" ? "조건·전용" : "전체"); }, shopGroup === group)}</React.Fragment>)}
      </div>
      {shopGroup === "진화" && <>
        <div style={{ ...panel, padding: 7, fontSize: 11 }}>진화 도구 {evolutionCount}종 등록 · 현재 {shopItems.length}종 표시 · 아래 목록을 스크롤해 구매</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 5 }}>
          {["전체","조건·전용","진화권","진화의 돌"].map((kind) => <React.Fragment key={kind}>{button(kind, () => setShopKind(kind), shopKind === kind)}</React.Fragment>)}
        </div>
      </>}
      {<input value={shopQuery} onChange={(event) => setShopQuery(event.target.value)}
        placeholder="아이템 이름 또는 영문 ID 검색" style={{ padding: 8, background: "#102e43",
          border: "2px solid #4ce4ed", color: "#fff" }} />}
      {shopItems.map((id) => <div key={id} style={{ ...panel, display: "flex", alignItems: "center", gap: 8, padding: 7 }}>
        <span style={{ flex: 1, fontSize: 12 }}>{itemName(id)} · ₽{ITEM[id].price.toLocaleString()}<small style={{ display: "block", opacity: .7 }}>보유 {bag[id] || 0}개 · {ITEM[id].note}</small></span>
        <div style={{ width: 40 }}>{button("−", () => changeCart(id, -1), false, !cart[id])}</div>
        <strong style={{ minWidth: 28, textAlign: "center" }}>{cart[id] || 0}</strong>
        <div style={{ width: 40 }}>{button("+", () => changeCart(id, 1), false, (bag[id] || 0) + (cart[id] || 0) >= (ITEM[id].limit || 999))}</div>
      </div>)}
      <div style={{ display: "flex", gap: 8 }}>
        {button("장바구니 비우기", () => { setCart({}); setNotice(""); }, false, !cartTotal)}
        {button("합계 ₽" + cartTotal.toLocaleString() + " 결제", checkout, false, !cartTotal || cartTotal > money)}
      </div>
      {cartTotal > money && <div style={{ color: "#ffcb8b" }}>소지금이 부족합니다.</div>}
    </div>}
    {view === "target" && <div style={{ display: "grid", gap: 7 }}>
      <div style={{ ...panel, padding: 8 }}>{itemName(selectedItem)}을(를) 사용할 포켓몬을 선택하세요.</div>
      {owned.map((pokemon) => <React.Fragment key={pokemon.uid}>{button(displayName(pokemon) + " · HP " + (pokemon.hp == null ? "계산 전" : pokemon.hp + "/" + maxHp(pokemon)),
        () => useItem(selectedItem, pokemon.uid), false,
        !itemUsable(ITEM[selectedItem], pokemon, selectedItem))}</React.Fragment>)}
    </div>}
    {view === "evochoice" && selected && <div style={{ display: "grid", gap: 7 }}>
      <div style={{ ...panel, padding: 8 }}>진화할 모습을 선택하세요. 진화 아이템은 하나만 소비됩니다.</div>
      {evolutionOptions(selected, selectedItem).map((option) => <React.Fragment key={option[2]}>
        {button(evolvedName(option[2]), () => evolveWithItem(selectedItem, selected.uid, option))}
      </React.Fragment>)}
    </div>}
    {view === "evolution" && evoEvent && <div style={{ ...panel, padding: 16, textAlign: "center" }}>
      <style>{`@keyframes pokemon-item-evo-old{0%,15%,35%,55%{opacity:1}25%,45%,65%,100%{opacity:0}}@keyframes pokemon-item-evo-new{0%,15%,35%,55%{opacity:0}25%,45%,65%,100%{opacity:1}}`}</style>
      <div style={{ position: "relative", height: 132, width: 132, margin: "0 auto" }}>
        <div style={{ position: "absolute", inset: 0, animation: "pokemon-item-evo-old 2s steps(1,end) forwards" }}>{sprite(evoEvent.from, 132)}</div>
        <div style={{ position: "absolute", inset: 0, animation: "pokemon-item-evo-new 2s steps(1,end) forwards" }}>{sprite(evoEvent.to, 132)}</div>
      </div>
      <p>{displayName(evoEvent.from)}이(가) {displayName(evoEvent.to)}(으)로 진화했다!</p>
      {button("계속", () => { setEvoEvent(null); setView("party"); })}
    </div>}
    {notice && <div style={{ ...panel, marginTop: 9, padding: 8, fontSize: 11 }}>{notice}</div>}
    {view !== "home" && <div style={{ marginTop: 10 }}>{button("◀ " + (view === "detail" ? detailFrom === "pc" ? "PC 보관함" : "포켓몬" : view === "swap" || view === "teach" || view === "ev" || view === "nature" || view === "ability" ? "포켓몬 정보" : view === "forget" ? "기술 목록" : view === "target" || view === "evochoice" || view === "holdtarget" ? "가방" : view === "held" ? "포켓몬 정보" : "메뉴"), () => { setNotice(""); setView(view === "detail" ? detailFrom : view === "swap" || view === "teach" || view === "ev" || view === "nature" || view === "ability" ? "detail" : view === "forget" ? "teach" : view === "target" || view === "evochoice" || view === "holdtarget" ? "bag" : view === "held" ? "detail" : "home"); })}</div>}
  </section>;
}

const POKEMON_STATUS_MEGA_DATA = [["venusaur","venusaurite","venusaurmega",""],["charizard","charizarditex","charizardmegax",""],["charizard","charizarditey","charizardmegay",""],["blastoise","blastoisinite","blastoisemega",""],["beedrill","beedrillite","beedrillmega",""],["pidgeot","pidgeotite","pidgeotmega",""],["raichu","raichunitex","raichumegax",""],["raichu","raichunitey","raichumegay",""],["clefable","clefablite","clefablemega",""],["alakazam","alakazite","alakazammega",""],["victreebel","victreebelite","victreebelmega",""],["slowbro","slowbronite","slowbromega",""],["gengar","gengarite","gengarmega",""],["kangaskhan","kangaskhanite","kangaskhanmega",""],["starmie","starminite","starmiemega",""],["pinsir","pinsirite","pinsirmega",""],["gyarados","gyaradosite","gyaradosmega",""],["aerodactyl","aerodactylite","aerodactylmega",""],["dragonite","dragoninite","dragonitemega",""],["mewtwo","mewtwonitex","mewtwomegax",""],["mewtwo","mewtwonitey","mewtwomegay",""],["meganium","meganiumite","meganiummega",""],["feraligatr","feraligite","feraligatrmega",""],["ampharos","ampharosite","ampharosmega",""],["steelix","steelixite","steelixmega",""],["scizor","scizorite","scizormega",""],["heracross","heracronite","heracrossmega",""],["skarmory","skarmorite","skarmorymega",""],["houndoom","houndoominite","houndoommega",""],["tyranitar","tyranitarite","tyranitarmega",""],["sceptile","sceptilite","sceptilemega",""],["blaziken","blazikenite","blazikenmega",""],["swampert","swampertite","swampertmega",""],["gardevoir","gardevoirite","gardevoirmega",""],["sableye","sablenite","sableyemega",""],["mawile","mawilite","mawilemega",""],["aggron","aggronite","aggronmega",""],["medicham","medichamite","medichammega",""],["manectric","manectite","manectricmega",""],["sharpedo","sharpedonite","sharpedomega",""],["camerupt","cameruptite","cameruptmega",""],["altaria","altarianite","altariamega",""],["banette","banettite","banettemega",""],["chimecho","chimechite","chimechomega",""],["absol","absolite","absolmega",""],["absol","absolitez","absolmegaz",""],["glalie","glalitite","glaliemega",""],["salamence","salamencite","salamencemega",""],["metagross","metagrossite","metagrossmega",""],["latias","latiasite","latiasmega",""],["latios","latiosite","latiosmega",""],["rayquaza","","rayquazamega","dragonascent"],["staraptor","staraptite","staraptormega",""],["lopunny","lopunnite","lopunnymega",""],["garchomp","garchompite","garchompmega",""],["garchomp","garchompitez","garchompmegaz",""],["lucario","lucarionite","lucariomega",""],["lucario","lucarionitez","lucariomegaz",""],["abomasnow","abomasite","abomasnowmega",""],["gallade","galladite","gallademega",""],["froslass","froslassite","froslassmega",""],["heatran","heatranite","heatranmega",""],["darkrai","darkranite","darkraimega",""],["emboar","emboarite","emboarmega",""],["excadrill","excadrite","excadrillmega",""],["audino","audinite","audinomega",""],["scolipede","scolipite","scolipedemega",""],["scrafty","scraftinite","scraftymega",""],["eelektross","eelektrossite","eelektrossmega",""],["chandelure","chandelurite","chandeluremega",""],["golurk","golurkite","golurkmega",""],["chesnaught","chesnaughtite","chesnaughtmega",""],["delphox","delphoxite","delphoxmega",""],["greninja","greninjite","greninjamega",""],["pyroar","pyroarite","pyroarmega",""],["floette","floettite","floettemega",""],["malamar","malamarite","malamarmega",""],["barbaracle","barbaracite","barbaraclemega",""],["dragalge","dragalgite","dragalgemega",""],["hawlucha","hawluchanite","hawluchamega",""],["zygarde","zygardite","zygardemega",""],["diancie","diancite","dianciemega",""],["crabominable","crabominite","crabominablemega",""],["golisopod","golisopite","golisopodmega",""],["drampa","drampanite","drampamega",""],["magearna","magearnite","magearnamega",""],["zeraora","zeraorite","zeraoramega",""],["falinks","falinksite","falinksmega",""],["scovillain","scovillainite","scovillainmega",""],["glimmora","glimmoranite","glimmoramega",""],["baxcalibur","baxcalibrite","baxcaliburmega",""]];

const POKEMON_ITEM_EVOS = [["pikachu","thunderstone","raichu",60,""],["sandshrewalola","icestone","sandslashalola",75,""],["nidorina","moonstone","nidoqueen",90,""],["nidorino","moonstone","nidoking",81,""],["clefairy","moonstone","clefable",95,""],["vulpix","firestone","ninetales",73,""],["vulpixalola","icestone","ninetalesalola",73,""],["jigglypuff","moonstone","wigglytuff",140,""],["gloom","leafstone","vileplume",75,""],["growlithe","firestone","arcanine",90,""],["growlithehisui","firestone","arcaninehisui",95,""],["poliwhirl","waterstone","poliwrath",90,""],["kadabra","linkingcord","alakazam",55,""],["machoke","linkingcord","machamp",90,""],["weepinbell","leafstone","victreebel",80,""],["graveler","linkingcord","golem",80,""],["graveleralola","linkingcord","golemalola",80,""],["shellder","waterstone","cloyster",50,""],["haunter","linkingcord","gengar",60,""],["voltorbhisui","leafstone","electrodehisui",60,""],["exeggcute","leafstone","exeggutor",95,""],["staryu","waterstone","starmie",60,""],["eevee","waterstone","vaporeon",130,""],["eevee","thunderstone","jolteon",65,""],["eevee","firestone","flareon",65,""],["gloom","sunstone","bellossom",75,""],["poliwhirl","linkingcord","politoed",90,""],["sunkern","sunstone","sunflora",75,""],["slowpoke","linkingcord","slowking",95,""],["onix","linkingcord","steelix",75,""],["scyther","linkingcord","scizor",70,""],["seadra","linkingcord","kingdra",75,""],["porygon","linkingcord","porygon2",85,""],["lombre","waterstone","ludicolo",80,""],["nuzleaf","leafstone","shiftry",90,""],["skitty","moonstone","delcatty",70,""],["feebas","linkingcord","milotic",95,""],["clamperl","linkingcord","huntail",55,""],["clamperl","linkingcord","gorebyss",55,""],["roselia","shinystone","roserade",60,""],["misdreavus","duskstone","mismagius",60,""],["murkrow","duskstone","honchkrow",100,""],["magneton","thunderstone","magnezone",70,""],["rhydon","linkingcord","rhyperior",115,""],["electabuzz","linkingcord","electivire",75,""],["magmar","linkingcord","magmortar",75,""],["togetic","shinystone","togekiss",85,""],["eevee","leafstone","leafeon",65,""],["eevee","icestone","glaceon",65,""],["porygon2","linkingcord","porygonz",85,""],["kirlia","dawnstone","gallade",68,"M"],["dusclops","linkingcord","dusknoir",45,""],["snorunt","dawnstone","froslass",70,"F"],["pansage","leafstone","simisage",75,""],["pansear","firestone","simisear",75,""],["panpour","waterstone","simipour",75,""],["munna","moonstone","musharna",116,""],["boldore","linkingcord","gigalith",85,""],["gurdurr","linkingcord","conkeldurr",105,""],["cottonee","sunstone","whimsicott",60,""],["petilil","sunstone","lilligant",70,""],["darumakagalar","icestone","darmanitangalar",105,""],["minccino","shinystone","cinccino",75,""],["karrablast","linkingcord","escavalier",70,""],["eelektrik","thunderstone","eelektross",85,""],["lampent","duskstone","chandelure",60,""],["shelmet","linkingcord","accelgor",80,""],["floette","shinystone","florges",78,""],["doublade","duskstone","aegislash",60,""],["spritzee","linkingcord","aromatisse",101,""],["swirlix","linkingcord","slurpuff",82,""],["helioptile","sunstone","heliolisk",62,""],["phantump","linkingcord","trevenant",85,""],["pumpkaboo","linkingcord","gourgeist",65,""],["pumpkaboosmall","linkingcord","gourgeistsmall",55,""],["pumpkaboolarge","linkingcord","gourgeistlarge",75,""],["pumpkaboosuper","linkingcord","gourgeistsuper",85,""],["charjabug","thunderstone","vikavolt",77,""],["crabrawler","icestone","crabominable",97,""],["tadbulb","thunderstone","bellibolt",109,""],["capsakid","firestone","scovillain",65,""],["cetoddle","icestone","cetitan",170,""],["rattataalola","evotokenraticatealola","raticatealola",75,""],["pichu","friendshipcharm","pikachu",35,""],["pikachu","thunderstone","raichualola",60,""],["cleffa","friendshipcharm","clefairy",70,""],["igglybuff","friendshipcharm","jigglypuff",115,""],["meowthalola","friendshipcharm","persianalola",65,""],["slowpokegalar","galaricacuff","slowbrogalar",95,""],["exeggcute","leafstone","exeggutoralola",95,""],["cubone","evotokenmarowakalola","marowakalola",60,""],["tyrogue","evotokenhitmonlee","hitmonlee",50,"M"],["tyrogue","evotokenhitmonchan","hitmonchan",50,"M"],["happiny","ovalstone","chansey",250,"F"],["mimejr","moveseal","mrmime",40,""],["munchlax","friendshipcharm","snorlax",160,""],["golbat","friendshipcharm","crobat",85,""],["togepi","friendshipcharm","togetic",55,""],["azurill","friendshipcharm","marill",70,""],["bonsly","moveseal","sudowoodo",70,""],["poliwhirl","kingsrock","politoed",90,""],["eevee","daycharm","espeon",65,""],["eevee","nightcharm","umbreon",95,""],["slowpoke","kingsrock","slowking",95,""],["slowpokegalar","galaricawreath","slowkinggalar",95,""],["onix","metalcoat","steelix",75,""],["scyther","metalcoat","scizor",70,""],["mantyke","evotokenmantine","mantine",85,""],["seadra","dragonscale","kingdra",75,""],["porygon","upgrade","porygon2",85,"N"],["tyrogue","evotokenhitmontop","hitmontop",50,"M"],["chansey","friendshipcharm","blissey",255,"F"],["budew","daycharm","roselia",50,""],["feebas","prismscale","milotic",95,""],["chingling","nightcharm","chimecho",75,""],["clamperl","deepseatooth","huntail",55,""],["clamperl","deepseascale","gorebyss",55,""],["aipom","moveseal","ambipom",75,""],["buneary","friendshipcharm","lopunny",65,""],["riolu","daycharm","lucario",70,""],["sneasel","razorclaw","weavile",70,""],["lickitung","moveseal","lickilicky",110,""],["rhydon","protector","rhyperior",115,""],["tangela","moveseal","tangrowth",100,""],["electabuzz","electirizer","electivire",75,""],["magmar","magmarizer","magmortar",75,""],["gligar","razorfang","gliscor",75,""],["piloswine","moveseal","mamoswine",110,""],["porygon2","dubiousdisc","porygonz",85,"N"],["nosepass","evotokenprobopass","probopass",60,""],["dusclops","reapercloth","dusknoir",45,""],["woobat","friendshipcharm","swoobat",67,""],["swadloon","friendshipcharm","leavanny",75,""],["petilil","sunstone","lilliganthisui",70,"F"],["pancham","evotokenpangoro","pangoro",95,""],["spritzee","sachet","aromatisse",101,""],["swirlix","whippeddream","slurpuff",82,""],["inkay","evotokenmalamar","malamar",86,""],["tyrunt","evotokentyrantrum","tyrantrum",82,""],["amaura","evotokenaurorus","aurorus",123,""],["eevee","evotokensylveon","sylveon",95,""],["sliggoo","evotokengoodra","goodra",90,""],["sliggoohisui","evotokengoodrahisui","goodrahisui",80,""],["yungoos","evotokengumshoos","gumshoos",88,""],["rockruff","evotokenlycanroc","lycanroc",75,""],["rockruff","evotokenlycanrocmidnight","lycanrocmidnight",85,""],["rockruffdusk","evotokenlycanrocdusk","lycanrocdusk",75,""],["fomantis","evotokenlurantis","lurantis",70,""],["steenee","moveseal","tsareena",72,"F"],["typenull","friendshipcharm","silvally",95,"N"],["poipole","moveseal","naganadel",73,"N"],["applin","tartapple","flapple",70,""],["applin","sweetapple","appletun",110,""],["clobbopus","moveseal","grapploct",80,""],["sinistea","crackedpot","polteageist",60,"N"],["sinisteaantique","chippedpot","polteageistantique",60,"N"],["linoonegalar","evotokenobstagoon","obstagoon",93,""],["far\u0066etchdgalar","evotokensir\u0066etchd","sir\u0066etchd",62,""],["yamaskgalar","evotokenrunerigus","runerigus",58,""],["milcery","evotokenalcremie","alcremie",65,"F"],["snom","nightcharm","frosmoth",70,""],["kubfu","evotokenurshifu","urshifu",100,""],["kubfu","evotokenurshifurapidstrike","urshifurapidstrike",100,""],["stantler","evotokenwyrdeer","wyrdeer",103,""],["scyther","evotokenkleavor","kleavor",70,""],["ursaring","evotokenursaluna","ursaluna",130,""],["basculinwhitestriped","evotokenbasculegion","basculegion",120,"M"],["basculinwhitestriped","evotokenbasculegionf","basculegionf",120,"F"],["sneaselhisui","razorclaw","sneasler",80,""],["qwilfishhisui","evotokenoverqwil","overqwil",85,""],["pawmo","evotokenpawmot","pawmot",70,""],["charcadet","auspiciousarmor","armarouge",85,""],["charcadet","maliciousarmor","ceruledge",75,""],["bramblin","evotokenbrambleghast","brambleghast",55,""],["rellor","evotokenrabsca","rabsca",75,""],["greavard","evotokenhoundstone","houndstone",72,""],["primeape","evotokenannihilape","annihilape",110,""],["girafarig","moveseal","farigiraf",120,""],["dunsparce","moveseal","dudunsparce",125,""],["dunsparce","moveseal","dudunsparcethreesegment",125,""],["bisharp","evotokenkingambit","kingambit",100,""],["gimmighoul","evotokengholdengo","gholdengo",87,"N"],["applin","syrupyapple","dipplin",80,""],["poltchageist","unremarkableteacup","sinistcha",71,"N"],["poltchageistartisan","masterpieceteacup","sinistchamasterpiece",71,"N"],["duraludon","metalalloy","archaludon",90,""],["dipplin","moveseal","hydrapple",106,""]];

const POKEMON_STATUS_ABILITY_DEFAULTS = ["Overgrow","Overgrow","Overgrow","Blaze","Blaze","Blaze","Torrent","Torrent","Torrent","Shield Dust","Shed Skin","Compound Eyes","Shield Dust","Shed Skin","Swarm","Keen Eye","Keen Eye","Keen Eye","Run Away","Run Away","Keen Eye","Keen Eye","Intimidate","Intimidate","Static","Static","Sand Veil","Sand Veil","Poison Point","Poison Point","Poison Point","Poison Point","Poison Point","Poison Point","Cute Charm","Cute Charm","Flash Fire","Flash Fire","Cute Charm","Cute Charm","Inner Focus","Inner Focus","Chlorophyll","Chlorophyll","Chlorophyll","Effect Spore","Effect Spore","Compound Eyes","Shield Dust","Sand Veil","Sand Veil","Pickup","Limber","Damp","Damp","Vital Spirit","Vital Spirit","Intimidate","Intimidate","Water Absorb","Water Absorb","Water Absorb","Synchronize","Synchronize","Synchronize","Guts","Guts","Guts","Chlorophyll","Chlorophyll","Chlorophyll","Clear Body","Clear Body","Rock Head","Rock Head","Rock Head","Run Away","Run Away","Oblivious","Oblivious","Magnet Pull","Magnet Pull","Keen Eye","Run Away","Run Away","Thick Fat","Thick Fat","Stench","Stench","Shell Armor","Shell Armor","Levitate","Levitate","Cursed Body","Rock Head","Insomnia","Insomnia","Hyper Cutter","Hyper Cutter","Soundproof","Soundproof","Chlorophyll","Chlorophyll","Rock Head","Rock Head","Limber","Keen Eye","Own Tempo","Levitate","Levitate","Lightning Rod","Lightning Rod","Natural Cure","Chlorophyll","Early Bird","Swift Swim","Poison Point","Swift Swim","Swift Swim","Illuminate","Illuminate","Soundproof","Swarm","Oblivious","Static","Flame Body","Hyper Cutter","Intimidate","Swift Swim","Intimidate","Water Absorb","Limber","Run Away","Water Absorb","Volt Absorb","Flash Fire","Trace","Swift Swim","Swift Swim","Swift Swim","Swift Swim","Rock Head","Immunity","Pressure","Pressure","Pressure","Shed Skin","Shed Skin","Inner Focus","Pressure","Synchronize","Overgrow","Overgrow","Overgrow","Blaze","Blaze","Blaze","Torrent","Torrent","Torrent","Run Away","Run Away","Insomnia","Insomnia","Swarm","Swarm","Swarm","Swarm","Inner Focus","Volt Absorb","Volt Absorb","Static","Cute Charm","Cute Charm","Hustle","Hustle","Synchronize","Synchronize","Static","Static","Static","Chlorophyll","Thick Fat","Thick Fat","Sturdy","Water Absorb","Chlorophyll","Chlorophyll","Chlorophyll","Run Away","Chlorophyll","Chlorophyll","Speed Boost","Damp","Damp","Synchronize","Synchronize","Insomnia","Oblivious","Levitate","Levitate","Shadow Tag","Inner Focus","Sturdy","Sturdy","Serene Grace","Hyper Cutter","Rock Head","Intimidate","Intimidate","Poison Point","Swarm","Sturdy","Swarm","Inner Focus","Pickup","Guts","Magma Armor","Magma Armor","Oblivious","Oblivious","Hustle","Hustle","Suction Cups","Vital Spirit","Swift Swim","Keen Eye","Early Bird","Early Bird","Swift Swim","Pickup","Sturdy","Trace","Intimidate","Own Tempo","Guts","Intimidate","Oblivious","Static","Flame Body","Thick Fat","Natural Cure","Pressure","Pressure","Pressure","Guts","Shed Skin","Sand Stream","Pressure","Pressure","Natural Cure","Overgrow","Overgrow","Overgrow","Blaze","Blaze","Blaze","Torrent","Torrent","Torrent","Run Away","Intimidate","Pickup","Pickup","Shield Dust","Shed Skin","Swarm","Shed Skin","Shield Dust","Swift Swim","Swift Swim","Swift Swim","Chlorophyll","Chlorophyll","Chlorophyll","Guts","Guts","Keen Eye","Keen Eye","Synchronize","Synchronize","Synchronize","Swift Swim","Intimidate","Effect Spore","Effect Spore","Truant","Vital Spirit","Truant","Compound Eyes","Speed Boost","Wonder Guard","Soundproof","Soundproof","Soundproof","Thick Fat","Thick Fat","Thick Fat","Sturdy","Cute Charm","Cute Charm","Keen Eye","Hyper Cutter","Sturdy","Sturdy","Sturdy","Pure Power","Pure Power","Static","Static","Plus","Minus","Illuminate","Oblivious","Natural Cure","Liquid Ooze","Liquid Ooze","Rough Skin","Rough Skin","Water Veil","Water Veil","Oblivious","Magma Armor","White Smoke","Thick Fat","Thick Fat","Own Tempo","Hyper Cutter","Levitate","Levitate","Sand Veil","Sand Veil","Natural Cure","Natural Cure","Immunity","Shed Skin","Levitate","Levitate","Oblivious","Oblivious","Hyper Cutter","Hyper Cutter","Levitate","Levitate","Suction Cups","Suction Cups","Battle Armor","Battle Armor","Swift Swim","Marvel Scale","Forecast","Color Change","Insomnia","Insomnia","Levitate","Pressure","Chlorophyll","Levitate","Pressure","Shadow Tag","Inner Focus","Inner Focus","Thick Fat","Thick Fat","Thick Fat","Shell Armor","Swift Swim","Swift Swim","Swift Swim","Swift Swim","Rock Head","Rock Head","Intimidate","Clear Body","Clear Body","Clear Body","Clear Body","Clear Body","Clear Body","Levitate","Levitate","Drizzle","Drought","Air Lock","Serene Grace","Pressure","Overgrow","Overgrow","Overgrow","Blaze","Blaze","Blaze","Torrent","Torrent","Torrent","Keen Eye","Intimidate","Intimidate","Simple","Simple","Shed Skin","Swarm","Rivalry","Rivalry","Rivalry","Natural Cure","Natural Cure","Mold Breaker","Mold Breaker","Sturdy","Sturdy","Shed Skin","Anticipation","Swarm","Honey Gather","Pressure","Run Away","Swift Swim","Swift Swim","Chlorophyll","Flower Gift","Sticky Hold","Sticky Hold","Technician","Aftermath","Aftermath","Run Away","Cute Charm","Levitate","Insomnia","Limber","Thick Fat","Levitate","Stench","Stench","Levitate","Levitate","Sturdy","Soundproof","Natural Cure","Keen Eye","Pressure","Sand Veil","Sand Veil","Sand Veil","Pickup","Steadfast","Steadfast","Sand Stream","Sand Stream","Battle Armor","Battle Armor","Anticipation","Anticipation","Levitate","Swift Swim","Swift Swim","Swift Swim","Snow Warning","Snow Warning","Pressure","Magnet Pull","Own Tempo","Lightning Rod","Chlorophyll","Motor Drive","Flame Body","Hustle","Speed Boost","Leaf Guard","Snow Cloak","Hyper Cutter","Oblivious","Adaptability","Steadfast","Sturdy","Pressure","Snow Cloak","Levitate","Levitate","Levitate","Levitate","Pressure","Pressure","Flash Fire","Slow Start","Pressure","Levitate","Hydration","Hydration","Bad Dreams","Natural Cure","Multitype","Victory Star","Overgrow","Overgrow","Overgrow","Blaze","Blaze","Blaze","Torrent","Torrent","Torrent","Run Away","Illuminate","Vital Spirit","Intimidate","Intimidate","Limber","Limber","Gluttony","Gluttony","Gluttony","Gluttony","Gluttony","Gluttony","Forewarn","Forewarn","Big Pecks","Big Pecks","Big Pecks","Lightning Rod","Lightning Rod","Sturdy","Sturdy","Sturdy","Unaware","Unaware","Sand Rush","Sand Rush","Healer","Guts","Guts","Guts","Swift Swim","Swift Swim","Swift Swim","Guts","Sturdy","Swarm","Leaf Guard","Swarm","Poison Point","Poison Point","Poison Point","Prankster","Prankster","Chlorophyll","Chlorophyll","Reckless","Intimidate","Intimidate","Intimidate","Hustle","Sheer Force","Water Absorb","Sturdy","Sturdy","Shed Skin","Shed Skin","Wonder Skin","Mummy","Mummy","Solid Rock","Solid Rock","Defeatist","Defeatist","Stench","Stench","Illusion","Illusion","Cute Charm","Cute Charm","Frisk","Frisk","Frisk","Overcoat","Overcoat","Overcoat","Keen Eye","Keen Eye","Ice Body","Ice Body","Ice Body","Chlorophyll","Chlorophyll","Static","Swarm","Swarm","Effect Spore","Effect Spore","Water Absorb","Water Absorb","Healer","Compound Eyes","Compound Eyes","Iron Barbs","Iron Barbs","Plus","Plus","Plus","Levitate","Levitate","Levitate","Telepathy","Telepathy","Flash Fire","Flash Fire","Flash Fire","Rivalry","Rivalry","Rivalry","Snow Cloak","Snow Cloak","Levitate","Hydration","Hydration","Static","Inner Focus","Inner Focus","Rough Skin","Iron Fist","Iron Fist","Defiant","Defiant","Reckless","Keen Eye","Keen Eye","Big Pecks","Big Pecks","Gluttony","Swarm","Hustle","Hustle","Levitate","Flame Body","Flame Body","Justified","Justified","Justified","Prankster","Prankster","Turboblaze","Teravolt","Sand Force","Pressure","Justified","Serene Grace","Download","Overgrow","Overgrow","Overgrow","Blaze","Blaze","Blaze","Torrent","Torrent","Torrent","Pickup","Pickup","Big Pecks","Flame Body","Flame Body","Shield Dust","Shed Skin","Shield Dust","Rivalry","Rivalry","Flower Veil","Flower Veil","Flower Veil","Sap Sipper","Sap Sipper","Iron Fist","Iron Fist","Fur Coat","Keen Eye","Keen Eye","No Guard","No Guard","Stance Change","Healer","Healer","Sweet Veil","Sweet Veil","Contrary","Contrary","Tough Claws","Tough Claws","Poison Point","Poison Point","Mega Launcher","Mega Launcher","Dry Skin","Dry Skin","Strong Jaw","Strong Jaw","Refrigerate","Refrigerate","Cute Charm","Limber","Cheek Pouch","Clear Body","Sap Sipper","Sap Sipper","Sap Sipper","Prankster","Natural Cure","Natural Cure","Pickup","Pickup","Own Tempo","Own Tempo","Frisk","Frisk","Fairy Aura","Dark Aura","Aura Break","Clear Body","Magician","Water Absorb","Overgrow","Overgrow","Overgrow","Blaze","Blaze","Blaze","Torrent","Torrent","Torrent","Keen Eye","Keen Eye","Keen Eye","Stakeout","Stakeout","Swarm","Battery","Levitate","Hyper Cutter","Hyper Cutter","Dancer","Honey Gather","Honey Gather","Keen Eye","Keen Eye","Schooling","Merciless","Merciless","Own Tempo","Own Tempo","Water Bubble","Water Bubble","Leaf Guard","Leaf Guard","Illuminate","Illuminate","Corrosion","Corrosion","Fluffy","Fluffy","Leaf Guard","Leaf Guard","Leaf Guard","Flower Veil","Inner Focus","Receiver","Wimp Out","Emergency Exit","Water Compaction","Water Compaction","Innards Out","Battle Armor","RKS System","Shields Down","Comatose","Shell Armor","Iron Barbs","Disguise","Dazzling","Berserk","Steelworker","Bulletproof","Bulletproof","Bulletproof","Electric Surge","Psychic Surge","Grassy Surge","Misty Surge","Unaware","Sturdy","Full Metal Body","Shadow Shield","Beast Boost","Beast Boost","Beast Boost","Beast Boost","Beast Boost","Beast Boost","Beast Boost","Prism Armor","Soul-Heart","Technician","Beast Boost","Beast Boost","Beast Boost","Beast Boost","Volt Absorb","Magnet Pull","Iron Fist","Overgrow","Overgrow","Overgrow","Blaze","Blaze","Blaze","Torrent","Torrent","Torrent","Cheek Pouch","Cheek Pouch","Keen Eye","Keen Eye","Pressure","Swarm","Swarm","Swarm","Run Away","Run Away","Cotton Down","Cotton Down","Fluffy","Fluffy","Strong Jaw","Strong Jaw",("Ball Fe" + "tch"),"Strong Jaw","Steam Engine","Steam Engine","Steam Engine","Ripen","Ripen","Ripen","Sand Spit","Sand Spit","Gulp Missile","Swift Swim","Swift Swim","Rattled","Punk Rock","Flash Fire","Flash Fire","Limber","Limber","Weak Armor","Weak Armor","Healer","Healer","Healer","Prankster","Prankster","Prankster","Reckless","Battle Armor","Weak Armor","Steadfast","Tangled Feet","Wandering Spirit","Sweet Veil","Sweet Veil","Battle Armor","Lightning Rod","Shield Dust","Shield Dust","Power Spot","Ice Face","Inner Focus","Hunger Switch","Sheer Force","Sheer Force","Volt Absorb","Volt Absorb","Water Absorb","Water Absorb","Light Metal","Clear Body","Clear Body","Clear Body","Intrepid Sword","Dauntless Shield","Pressure","Inner Focus","Unseen Fist","Leaf Guard","Transistor","Dragon's Maw","Chilling Neigh","Grim Neigh","Unnerve","Intimidate","Swarm","Guts","Swift Swim","Pressure","Poison Point","Cute Charm","Overgrow","Overgrow","Overgrow","Blaze","Blaze","Blaze","Torrent","Torrent","Torrent","Aroma Veil","Lingering Aroma","Insomnia","Insomnia","Swarm","Swarm","Static","Volt Absorb","Volt Absorb","Run Away","Friend Guard","Own Tempo","Well-Baked Body","Early Bird","Early Bird","Seed Sower","Intimidate","Purifying Salt","Purifying Salt","Purifying Salt","Flash Fire","Flash Fire","Flash Fire","Own Tempo","Electromorphosis","Wind Power","Wind Power","Intimidate","Intimidate","Unburden","Unburden","Wind Rider","Wind Rider","Mycelium Might","Mycelium Might","Anger Shell","Chlorophyll","Chlorophyll","Compound Eyes","Synchronize","Anticipation","Opportunist","Mold Breaker","Mold Breaker","Mold Breaker","Gooey","Gooey","Big Pecks","Water Veil","Zero to Hero","Overcoat","Overcoat","Shed Skin","Earth Eater","Toxic Debris","Toxic Debris","Pickup","Sand Rush","Scrappy","Thick Fat","Thick Fat","Mold Breaker","Unaware","Commander","Vital Spirit","Poison Point","Cud Chew","Serene Grace","Defiant","Protosynthesis","Protosynthesis","Protosynthesis","Protosynthesis","Protosynthesis","Protosynthesis","Quark Drive","Quark Drive","Quark Drive","Quark Drive","Quark Drive","Quark Drive","Thermal Exchange","Thermal Exchange","Thermal Exchange","Rattled","Good as Gold","Tablets of Ruin","Sword of Ruin","Vessel of Ruin","Beads of Ruin","Protosynthesis","Quark Drive","Orichalcum Pulse","Hadron Engine","Protosynthesis","Quark Drive","Supersweet Syrup","Hospitality","Hospitality","Toxic Chain","Toxic Chain","Toxic Chain","Defiant","Stamina","Supersweet Syrup","Protosynthesis","Protosynthesis","Quark Drive","Quark Drive","Tera Shift","Poison Puppeteer"];
const POKEMON_STATUS_ABILITY_POOL = ["overgrow","chlorophyll","blaze","solarpower","torrent","raindish","shielddust","runaway","shedskin","compoundeyes","tintedlens","swarm","sniper","keeneye","tangledfeet","bigpecks","guts","hustle","intimidate","unnerve","static","lightningrod","sandveil","sandrush","poisonpoint","rivalry","sheerforce","cutecharm","magicguard","friendguard","unaware","flashfire","drought","competitive","frisk","innerfocus","infiltrator","stench","effectspore","dryskin","damp","wonderskin","arenatrap","sandforce","pickup","technician","limber","cloudnine","swiftswim","vitalspirit","angerpoint","defiant","justified","waterabsorb","synchronize","noguard","steadfast","gluttony","clearbody","liquidooze","rockhead","sturdy","flamebody","oblivious","owntempo","regenerator","magnetpull","analytic","earlybird","thickfat","hydration","icebody","stickyhold","poisontouch","shellarmor","skilllink","overcoat","levitate","cursedbody","weakarmor","insomnia","forewarn","hypercutter","soundproof","aftermath","harvest","battlearmor","reckless","unburden","ironfist","neutralizinggas","naturalcure","serenegrace","healer","leafguard","scrappy","waterveil","illuminate","filter","moldbreaker","moxie","rattled","imposter","adaptability","anticipation","voltabsorb","quickfeet","trace","download","pressure","immunity","snowcloak","marvelscale","multiscale","superluck","magicbounce","plus","hugepower","sapsipper","drizzle","speedboost","prankster","shadowtag","telepathy","lightmetal","contrary","pickpocket","honeygather","magmaarmor","moody","suctioncups","sandstream","windrider","poisonheal","truant","wonderguard","normalize","stall","heavymetal","purepower","minus","roughskin","simple","solidrock","whitesmoke","toxicboost","stormdrain","forecast","colorchange","protean","airlock","flowergift","flareboost","klutz","heatproof","snowwarning","motordrive","sharpness","slowstart","baddreams","multitype","victorystar","zenmode","mummy","defeatist","illusion","ironbarbs","slushrush","turboblaze","teravolt","bulletproof","magician","battlebond","cheekpouch","galewings","flowerveil","symbiosis","grasspelt","furcoat","stancechange","aromaveil","sweetveil","toughclaws","megalauncher","strongjaw","refrigerate","pixilate","gooey","fairyaura","darkaura","aurabreak","powerconstruct","longreach","liquidvoice","stakeout","battery","dancer","schooling","merciless","stamina","waterbubble","corrosion","fluffy","queenlymajesty","triage","receiver","wimpout","emergencyexit","watercompaction","innardsout","rkssystem","shieldsdown","comatose","disguise","dazzling","berserk","steelworker","electricsurge","psychicsurge","grassysurge","mistysurge","fullmetalbody","shadowshield","beastboost","prismarmor","soulheart","libero","mirrorarmor","cottondown","ball"+"fe"+"tch","steamengine","ripen","sandspit","gulpmissile","propellertail","punkrock","steelyspirit","perishbody","screencleaner","wanderingspirit","icescales","powerspot","iceface","hungerswitch","stalwart","intrepidsword","dauntlessshield","unseenfist","transistor","dragonsmaw","chillingneigh","grimneigh","lingeringaroma","wellbakedbody","seedsower","purifyingsalt","electromorphosis","windpower","guarddog","myceliummight","angershell","opportunist","rockypayload","zerotohero","eartheater","toxicdebris","costar","commander","cudchew","armortail","supremeoverlord","protosynthesis","quarkdrive","thermalexchange","goodasgold","tabletsofruin","swordofruin","vesselofruin","beadsofruin","orichalcumpulse","hadronengine","supersweetsyrup","hospitality","toxicchain","terashift","poisonpuppeteer","surgesurfer","tanglinghair","galvanize","pastelveil","quickdraw","powerofalchemy","parentalbond","aerilate","megasol","dragonize","curiousmedicine","primordialsea","desolateland","deltastream","auraguard","piercingdrill","gorillatactics","eelevate","mimicry","firemane","neuroforce","asoneglastrier","asonespectrier","mindseye","spicyspray","embodyaspectteal","embodyaspectwellspring","embodyaspecthearthflame","embodyaspectcornerstone","terashell","teraformzero"];
const POKEMON_STATUS_ABILITY_BASE_ROWS = ["0.1!","0.1!","0.1!","2.3!","2.3!","2.3!","4.5!","4.5!","4.5!","6.7!","8","9.a!","6.7!","8","b.c!","d.e.f!","d.e.f!","d.e.f!","7.g.h!","7.g.h!","d.c!","d.c!","i.8.j!","i.8.j!","k.l!","k.l!","m.n!","m.n!","o.p.h!","o.p.h!","o.p.q!","o.p.h!","o.p.h!","o.p.q!","r.s.t!","r.s.u!","v.w!","v.w!","r.x.t!","r.x.y!","z.10!","z.10!","1.7!","1.11!","1.12!","12.13.14!","12.13.14!","9.a.7!","6.a.15!","m.16.17!","m.16.17!","18.19.j!","1a.19.j!","14.1b.1c!","14.1b.1c!","1d.1e.1f!","1d.1e.1f!","i.v.1g!","i.v.1g!","1h.14.1c!","1h.14.1c!","1h.14.1c!","1i.z.s!","1i.z.s!","1i.z.s!","g.1j.1k!","g.1j.1k!","g.1j.1k!","1.1l!","1.1l!","1.1l!","1m.1n.5!","1m.1n.5!","1o.1p.m!","1o.1p.m!","1o.1p.m!","7.v.1q!","7.v.1q!","1r.1s.1t!","1r.1s.1t!","1u.1p.1v!","1u.1p.1v!","d.z.1f!","7.1w.e!","7.1w.e!","1x.1y.1z!","1x.1y.1z!","11.20.21!","11.20.21!","22.23.24!","22.23.24!","25","25","26","1o.1p.27!","28.29.z!","28.29.z!","2a.22.q!","2a.22.q!","2b.k.2c!","2b.k.2c!","1.2d!","1.2d!","1o.l.2e!","1o.l.2e!","1a.2f.2g!","d.2h.z!","1s.1r.1b!","25.2i.11!","25.2i.11!","l.1o.2f!","l.1o.2f!","2j.2k.2l!","1.2m.1t!","1w.2n.z!","1c.c.14!","o.c.14!","1c.2o.l!","1c.2o.l!","2p.2j.1v!","2p.2j.1v!","2b.2q.19!","b.19.1k!","1r.29.13!","k.1d!","1q.1d!","2a.2r.2s!","i.1e.q!","1c.2t!","i.2s!","1h.22.1y!","1a.2u!","7.2v.2w!","1h.1y!","2x.2y!","v.g!","2z.30.1v!","1c.22.27!","1c.22.27!","1c.2e.27!","1c.2e.27!","1o.31.j!","32.1x.1l!","31.33!","31.k!","31.1q!","8.34!","8.34!","z.35!","31.j!","1i","0.2m!","0.2m!","0.2m!","2.v!","2.v!","2.v!","4.q!","4.q!","4.q!","7.d.y!","7.d.y!","28.d.a!","28.d.a!","b.1w.2t!","b.1w.2h!","b.28.c!","b.28.c!","z.10!","2x.2p.1h!","2x.2p.1h!","k.l!","r.s.t!","r.x.t!","h.2k.36!","h.2k.36!","1i.1w.37!","1i.1w.37!","k.38!","k.38!","k.38!","1.2l!","1x.39.3a!","1x.39.3a!","1p.1o.2t!","1h.14.3b!","1.2m.10!","1.2m.10!","1.2m.10!","7.18.23!","1.3.1w!","1.3.1w!","3c.9.y!","14.1h.u!","14.1h.u!","1i.37!","1i.z!","28.36.3d!","1r.1s.1t!","25","25","3e.3f!","z.1w.3a!","1p.24!","1p.24!","2k.7.2t!","2a.m.32!","1o.1p.q!","i.7.2t!","i.2y.2t!","o.1c.i!","b.19.3g!","1p.1l.3h!","b.g.2s!","z.d.3i!","18.2y.3j!","g.2y.j!","3k.1q.27!","3k.1q.27!","1r.33.1x!","1r.33.1x!","h.2j.1t!","h.c.3l!","3m.c.3l!","1d.h.28!","1c.1h.2o!","d.1p.27!","1w.v.j!","1w.v.j!","1c.c.14!","18.m!","1p.m!","2z.30.1v!","i.y.3a!","1s.19.3l!","g.1k.1d!","i.19.1k!","1r.29.1y!","k.1d!","1q.1d!","1x.2n.3a!","2j.2k.2l!","31.z!","31.z!","31.z!","g.m!","8","3n.j!","31.35!","31.1t!","2j","0.2g!","0.2g!","0.2g!","2.3c!","2.3c!","2.3c!","4.14!","4.14!","4.14!","7.2y.2t!","i.2y.2s!","18.1l.2y!","18.1l.2y!","6.7!","8","b.p!","8","6.9!","1c.5.1s!","1c.5.1s!","1c.5.1s!","1.1w.3i!","1.1w.3i!","1.3o.3i!","g.2n!","g.2n!","d.1y.5!","d.3b.5!","1i.2z.3f!","1i.2z.3f!","1i.2z.3f!","1c.5!","i.j!","12.3p.2y!","12.3p.19!","3q","1d","3q","9.7!","3c.10!","3r","2b.2t!","2b.2n!","2b.2n!","1x.g.q!","1x.g.q!","1x.39.3a!","1p.1u.17!","r.3s.15!","r.3s.15!","d.3t.3d!","2a.i.q!","1p.1o.3u!","1p.1o.3u!","1p.1o.3u!","3v.3f!","3v.3f!","k.l.3w!","k.l.3w!","38.l!","3w.2x!","2p.b.3d!","1r.a.3d!","2j.o.2m!","1n.20.1l!","1n.20.1l!","3x.3c!","3x.3c!","2o.1r.31!","2o.1r.31!","1r.3y.1s!","3k.3z.1e!","40.w.22!","1x.1s.1l!","1x.1s.1l!","1s.e.3h!","2a.16.q!","25","25","m.1h!","m.1h!","2j.1b!","2j.1b!","32.41!","8.10!","25","25","1r.2w.1y!","1r.2w.1y!","2a.22.2v!","2a.22.2v!","25","25","3m.42!","3m.42!","2e.1c!","2e.1c!","1c.1r.2v!","34.x.r!","43","44.45!","28.y.26!","28.y.26!","25.y!","31.y!","1.3.2d!","25","31.36.1g!","3e.3f!","z.1z.3l!","z.1z.3l!","1x.1z.1r!","1x.1z.1r!","1x.1z.1r!","22.2t!","1c.2o!","1c.1y!","1c.1o.1p!","1c.1y!","1o.q!","1o.24!","i.2s!","1m.3g!","1m.3g!","1m.3g!","1m.1p!","1m.1z!","1m.3g!","25","25","3b","w","46","2k","31","0.22!","0.22!","0.22!","2.2h!","2.2h!","2.2h!","4.x!","4.x!","4.x!","d.2f!","i.2f!","i.2f!","3y.u.3l!","3y.u.3l!","8.7!","b.19!","p.i.g!","p.i.g!","p.i.g!","2j.o.2m!","2j.o.19!","2r.q!","2r.q!","1p.2b!","1p.2b!","8.24!","2w.24!","b.a!","3j.h!","31.j!","7.18.2x!","1c.2o!","1c.2o!","1","47","20.42.17!","20.42.17!","19.18.23!","2c.2g.48!","2c.2g.48!","7.49.1a!","r.49.1a!","25","28.36.2s!","1a.1s.d!","1x.1s.1f!","25","11.2c.d!","11.2c.d!","25.4a.3u!","25.4a.3u!","1p.1o.2t!","2b.2q.19!","2j.2k.t!","d.e.f!","31.10!","m.3x!","m.3x!","m.3x!","18.1x.1l!","1k.z.3d!","1k.z.1g!","3n.17!","3n.17!","2e.c.d!","2e.c.d!","2w.13.21!","2w.13.21!","25","1c.42.2o!","1c.42.2o!","1c.1h.2o!","4b.2b!","4b.2b!","31.3i!","1u.1p.1v!","1s.1r.1b!","l.3z.2f!","1.2m.1t!","4c.1d!","1q.1d!","h.2k.36!","3c.a.y!","2m.1!","33.1z!","2a.m.3p!","1r.33.1x!","2v.30.1v!","1k.4d.1g!","1p.1u.17!","31.y!","33.26!","25","25","25","25","31.3f!","31.3f!","v.1q!","4e","31.3f!","25","1y","1y","4f","2j","4g","4h","0.3h!","0.3h!","0.3h!","2.1x!","2.1x!","2.2f!","4.22!","4.22!","4.22!","7.d.1v!","2p.d.1v!","1d.18.7!","i.n.2n!","i.n.2n!","1a.2g.3d!","1a.2g.3d!","1l.0!","1l.0!","1l.2!","1l.2!","1l.4!","1l.4!","29.1i.3f!","29.1i.3f!","f.36.p!","f.36.p!","f.36.p!","l.4c.3a!","l.4c.3a!","1p.27.17!","1p.27.17!","1p.3n.17!","u.49.3y!","u.49.3y!","n.17.2r!","n.17.2r!","2l.1t.49!","g.q.2h!","g.q.2h!","g.q.2h!","1c.1y.1h!","1c.1y.1h!","1c.21.1h!","g.z.2r!","1p.z.2r!","b.1.24!","2m.1.24!","b.1.24!","o.b.3c!","o.b.3c!","o.b.3c!","3d.10.1!","3d.10.1!","1.1s.2m!","1.1s.2m!","2f.2v.2r!","i.2s.1e!","i.2s.1e!","i.2s.1e!","h.z!","q.4i!","1h.1.42!","1p.22.27!","1p.22.27!","8.2s.i!","8.2s.i!","15.s.a!","4j","4j","3z.1p.1c!","3z.1p.1c!","4k","4k","11.20.2c!","11.27.2c!","4l","4l","r.19.23!","r.19.23!","y.x.3e!","y.x.3e!","y.x.3e!","24.s.1t!","24.s.1t!","24.s.1t!","d.f.1y!","d.f.1y!","1z.33.27!","1z.33.27!","1z.4b.27!","1.3a.2k!","1.3a.2k!","k.4c!","b.8.1j!","b.22.24!","12.1t!","12.1t!","1h.26.14!","1h.26.14!","2l.1y.1t!","9.j.b!","9.j.b!","4m","4m.2w!","38.3w.1m!","38.3w.1m!","38.3w.1m!","25","25","25","3f.1i.1v!","3f.1i.1v!","v.1q.10!","v.1q.10!","v.1q.10!","p.2r.j!","p.2r.j!","p.2r.j!","33.4n.2t!","33.4n.1c!","25","1y.22.24!","1y.20.2g!","k.1a.m!","z.1t.2f!","z.1t.2f!","3x.q.2r!","2h.49.1j!","2h.49.1j!","1f.z.31!","1f.z.31!","2f.3a.2b!","d.q.h!","d.q.1f!","f.24.27!","f.24.27!","1l.v.40!","b.h.3q!","h","h","25","1q.b!","1q.b!","1g","1g","1g","3d.1f!","3d.1f!","4o","4p","17.q!","31","1g","2k","30","0.4q!","0.4q!","0.4q!","2.4r!","2.4r!","2.4r!","4.45!","4.45!","4.45!.4s","18.4t.39!","18.4t.39!","f.4u!","1q.4u!","1q.4u!","6.9.t!","8.t!","6.9.t!","p.j.2s!","p.j.2s!","4v.4w!","4v.4w!","4v.4w!","3a.4x!","3a.4x!","2h.2r.2n!","2h.2r.2n!","4y","d.10.1s!","d.10.3d!","1j","1j","4z","2l.50!","2l.50!","51.2g!","51.2g!","3h.3m.10!","3h.3m.10!","52.c.3i!","52.c.3i!","o.21.2v!","o.21.2v!","53","53","13.m.3!","13.m.3!","54.1p!","54.1o!","55.4b!","55.4b!","r.56!","1a.2g.2r!","4t.18.38!","1m.1p!","3a.1y.57!","3a.1y.57!","3a.1y.57!","3d.4r!","2j.y.2d!","2j.y.2d!","18.y.28!","18.y.28!","1s.1z.1p!","1s.1z.1p!","y.10.3f!","y.10.3f!","58","59","5a.5b","1m","4r","1h","0.5c!","0.5c!","0.5c!","2.i!","2.i!","2.i!","4.5d!","4.5d!","4.5d!","d.23.18!","d.23.18!","d.23.q!","5e.54.2v!","5e.54.2v!","b","5f","25","2a.2h.1e!","2a.2h.1e!","5g","3j.6.51!","3j.6.51!","d.1d.1k!.1s","d.n.1k!","5h","5i.1a.1t!","5i.1a.1t!","1s.5j.z!","1s.5j.z!","5k.1h!","5k.1h!","2m.3h!","2m.3h!","2p.12.5!","2p.12.5!","5l.1r!","5l.1r!","5m.49.r!","5m.49.j!","2m.1r.51!","2m.1r.51!","2m.5n.51!","4v.5o.2j!","z.3f.4w!","5p.1f!","5q","5r","5s.m!","5s.m!","5t.u!","2e","5u","5v","5w","22","4m.l.1p!","5x","5y.54.15!","5z.3a.1b!","60","4q.2b.24!","4q.2b.24!","4q.2b.24!","61.3f!","62.3f!","63.3f!","64.3f!","u","1p","65","66","67","67","67","67","67","67","67","68","69","19","67","67","67","67","2x","1u","2h","0.63!","0.63!","0.63!","2.6a!","2.6a!","2.6a!","4.c!","4.c!","4.c!","4t.1l!","4t.1l!","d.j.f!","d.j.f!","31.j.6b!","b.9.3f!","b.9.3f!","b.y.3f!","7.2g.5e!","7.2g.5e!","6c.1t.12!","6c.1t.12!","5m.7.4q!","5m.1k.4q!","54.22.1c!","54.22.1c!","6d.2t!","54.x!","6e.4a.v!","6e.1q.v!","6e.1q.v!","6f.1l.4q!","6f.1l.h!","6f.1l.1x!","6g.8.m!","6g.8.m!","6h","1c.6i!","1c.6i!","2t.k.49!","6j.38.19!","v.40.1q!","v.40.1q!","1a.19!","1a.19!","27.26!","27.26!","2l.2w.37!","2l.2w.37!","2l.2w.37!","3d.y.3i!","3d.y.3i!","3d.y.3i!","2f.g.1f!","2e.52.6k!","27.6l!","1k.2n!","e.6m.1z!","6n","51.50!","51.50!","2e.1f!","l.61!","6.6o!","6.6o!","6p","6q","z.1i.62!","6r","q.3u!","q.3u!","2x.h.n!","2x.k.4n!","1h.54.n!","1h.1z.4n!","3g.3u.6s!","1m.10.26!","1m.10.26!","1m.10.26!","6t","6u","31","z","6v","2m","6w","6x","6y","6z","j","i.y.3a!","b.q.4d!","g.4q.j!","1c.2v.2r!","31.2g.21!","o.1c.i!","r.3h!","0.45!","0.45!","0.45!","2.u!","2.u!","2.u!","4.2s!","4.2s!","4.2s!","50.1l.1x!","70.1l.1x!","28.5e!","28.5e!","b.a!","b.a!","k.2j.2h!","2x.2j.2h!","2x.2j.2h!","7.18.1s!","t.4t.19!","1s.49!","71.50!","1w.2d!","1w.2d!","72.2d!","i.h.g!","73.1p.1m!","73.1p.1m!","73.1p.1m!","v.1q!","v.27!","v.27!","1s.k.14!","74.k.14!","75.2x.x!","75.2x.x!","i.7.5e!","i.76.5e!","2g.3i.3d!","2g.21.3d!","3o.10!","3o.10!","77","77","78.22.1t!","1.28.49!","1.28.3l!","9.8!","1i.3f!","2w.y.3c!","79.y.3c!","2r.1s.3i!","2r.1s.3i!","2r.1s.3i!","57.2t.m!","57.2t.m!","f.d.7a!","2o","7b","24.4e!","24.2q!","8.1t!","7c.m!","7d.5l!","7d.5l!","18.5m!","n.5m!","2n.e.7e!","1x.33.q!","1x.4n.q!","2r.4d!","u.1r.2o!","7f.42!","1d.z.1f!","o.1h.u!","7g.7h.3a!","2k.7.2t!","1f.7i.31!","7j","7j","7j","7j","7j","7j","7k","7k","7k","7k","7k","7k","7l.1z!","7l.1z!","7l.1z!","2t","7m","7n","7o","7p","7q","7j","7k","7r","7s","7j","7k","7t.1l.20!","7u.4a!","7u.4a!","7v.76!","7v.y!","7v.19!","1f","5j.1p.6s!","7t.1t.20!","7j","7j","7k","7k","7w","7x"];
const POKEMON_STATUS_ABILITY_FORM_ROWS = {"venusaurmega":"1x","charizardmegax":"52","charizardmegay":"w","blastoisemega":"53","beedrillmega":"2v","pidgeotmega":"1j","rattataalola":"1l.h.1x!","raticatealola":"1l.h.1x!","raticatealolatotem":"1x","pikachucosplay":"l","pikachurockstar":"l","pikachubelle":"l","pikachupopstar":"l","pikachuphd":"l","pikachulibre":"l","raichualola":"7y","raichumegax":"61","raichumegay":"1j","sandshrewalola":"33.4n!","sandslashalola":"33.4n!","clefablemega":"37","vulpixalola":"33.4b!","ninetalesalola":"33.4b!","diglettalola":"m.7z.17!","dugtrioalola":"m.7z.17!","meowthalola":"18.19.2t!","meowthgalar":"18.52.j!","persianalola":"4y.19.2t!","growlithehisui":"i.v.1o!","arcaninehisui":"i.v.1o!","alakazammega":"2z","victreebelmega":"5t","geodudealola":"1u.1p.80!","graveleralola":"1u.1p.80!","golemalola":"1u.1p.80!","ponytagalar":"7.81.2w!","rapidashgalar":"7.81.2w!","slowpokegalar":"1l.1s.1t!","slowbromega":"22","slowbrogalar":"82.1s.1t!",["farf"+"etchdgalar"]:"1k.2n!","grimeralola":"21.1l.83!","mukalola":"21.1l.83!","gengarmega":"3e","exeggutoralola":"y.2d!","marowakalola":"26.l.1o!","marowakalolatotem":"1o","weezinggalar":"25.2i.64!","kangaskhanmega":"84","starmiemega":"39","mrmimegalar":"1d.6m.1z!","pinsirmega":"85","taurospaldeacombat":"i.1e.7g!","taurospaldeablaze":"i.1e.7g!","taurospaldeaaqua":"i.1e.7g!","gyaradosmega":"2r","aerodactylmega":"52","articunogalar":"x","zapdosgalar":"1f","moltresgalar":"5z","dragonitemega":"35","mewtwomegax":"1k","mewtwomegay":"28","meganiummega":"86","typhlosionhisui":"2.y!","feraligatrmega":"87","pichuspikyeared":"k","ampharosmega":"2r","wooperpaldea":"o.1h.u!","slowkinggalar":"88.1s.1t!","steelixmega":"17","scizormega":"19","heracrossmega":"23","corsolagalar":"27.26!","skarmorymega":"6s","houndoommega":"3","tyranitarmega":"3n","sceptilemega":"l","blazikenmega":"3c","swampertmega":"1c","gardevoirmega":"56","sableyemega":"37","mawilemega":"39","aggronmega":"2q","medichammega":"3v","manectricmega":"i","sharpedomega":"54","cameruptmega":"q","altariamega":"56","banettemega":"3d","absolmega":"37","absolmegaz":"4d","glaliemega":"55","salamencemega":"85","metagrossmega":"52","kyogreprimal":"89","groudonprimal":"8a","rayquazamega":"8b","staraptormega":"3h","lopunnymega":"2n","garchompmega":"17","garchompmegaz":"25","lucariomega":"2v","lucariomegaz":"8c","abomasnowmega":"4b","gallademega":"z","froslassmega":"4b","giratinaorigin":"25","shayminsky":"2k","emboarmega":"2r","samurotthisui":"4.4d!","excadrillmega":"8d","audinomega":"2l","scolipedemega":"22","lilliganthisui":"1.h.2m!","basculinbluestriped":"1o.2v.2r!","basculinwhitestriped":"2t.2v.2r!","darmanitanzen":"4i","darmanitangalar":"8e.4i!","darmanitangalarzen":"4i","scraftymega":"i","yamaskgalar":"6n","eelektrossmega":"8f","chandeluremega":"10","stunfiskgalar":"8g","golurkmega":"6v","braviaryhisui":"d.q.a!","tornadustherian":"1t","thundurustherian":"2x","landorustherian":"i","kyuremblack":"4p","kyuremwhite":"4o","chesnaughtmega":"4q","delphoxmega":"25","greninjabond":"4s","greninjaash":"4s","greninjamega":"45","pyroarmega":"8h","floettemega":"58","meowsticf":"d.10.x!","meowsticmmega":"2z","meowsticfmega":"2z","malamarmega":"3h","barbaraclemega":"52","dragalgemega":"1t","hawluchamega":"1j","sliggoohisui":"3a.22.57!","goodrahisui":"3a.22.57!","avalugghisui":"54.1z.1p!","zygardecomplete":"5b","zygardemega":"5a","dianciemega":"37","decidueyehisui":"0.2n!","gumshoostotem":"2v","crabominablemega":"2h","ribombeetotem":"51","rockruffdusk":"1s","lycanrocmidnight":"d.1d.1j!","lycanrocdusk":"52","araquanidtotem":"5k","lurantistotem":"2m","salazzletotem":"5l","golisopodmega":"52","togedemarutotem":"1p","drampamega":"5z","kommoototem":"24","necrozmaultra":"8i","toxtricitylowkey":"6j.3w.19!","toxtricitylowkeygmax":"6j.3w.19!","falinksmega":"1f","indeedeef":"1s.1i.62!","calyrexice":"8j","calyrexshadow":"8k","ursalunabloodmoon":"8l","enamorustherian":"24","oinkolognef":"50.1l.1x!","squawkabillyyellow":"i.h.q!","squawkabillywhite":"i.h.q!","scovillainmega":"8m","glimmoramega":"2v","baxcaliburmega":"7l","gimmighoulroaming":"7","ogerponwellspring":"1h","ogerponhearthflame":"2r","ogerponcornerstone":"1p","ogerpontealtera":"8n","ogerponwellspringtera":"8o","ogerponhearthflametera":"8p","ogerponcornerstonetera":"8q","terapagosterastal":"8r","terapagosstellar":"8s","crucibellemega":"s","venomiconepilogue":"a","ramnarokradiant":"1j","pokestarufo2":"25","pokestarufopropu2":"25"};
const POKEMON_STATUS_BASE_STATS = [[45,49,49,65,65,45],[60,62,63,80,80,60],[80,82,83,100,100,80],[39,52,43,60,50,65],[58,64,58,80,65,80],[78,84,78,109,85,100],[44,48,65,50,64,43],[59,63,80,65,80,58],[79,83,100,85,105,78],[45,30,35,20,20,45],[50,20,55,25,25,30],[60,45,50,90,80,70],[40,35,30,20,20,50],[45,25,50,25,25,35],[65,90,40,45,80,75],[40,45,40,35,35,56],[63,60,55,50,50,71],[83,80,75,70,70,101],[30,56,35,25,35,72],[55,81,60,50,70,97],[40,60,30,31,31,70],[65,90,65,61,61,100],[35,60,44,40,54,55],[60,95,69,65,79,80],[35,55,40,50,50,90],[60,90,55,90,80,110],[50,75,85,20,30,40],[75,100,110,45,55,65],[55,47,52,40,40,41],[70,62,67,55,55,56],[90,92,87,75,85,76],[46,57,40,40,40,50],[61,72,57,55,55,65],[81,102,77,85,75,85],[70,45,48,60,65,35],[95,70,73,95,90,60],[38,41,40,50,65,65],[73,76,75,81,100,100],[115,45,20,45,25,20],[140,70,45,85,50,45],[40,45,35,30,40,55],[75,80,70,65,75,90],[45,50,55,75,65,30],[60,65,70,85,75,40],[75,80,85,110,90,50],[35,70,55,45,55,25],[60,95,80,60,80,30],[60,55,50,40,55,45],[70,65,60,90,75,90],[10,55,25,35,45,95],[35,100,50,50,70,120],[40,45,35,40,40,90],[65,70,60,65,65,115],[50,52,48,65,50,55],[80,82,78,95,80,85],[40,80,35,35,45,70],[65,105,60,60,70,95],[55,70,45,70,50,60],[90,110,80,100,80,95],[40,50,40,40,40,90],[65,65,65,50,50,90],[90,95,95,70,90,70],[25,20,15,105,55,90],[40,35,30,120,70,105],[55,50,45,135,95,120],[70,80,50,35,35,35],[80,100,70,50,60,45],[90,130,80,65,85,55],[50,75,35,70,30,40],[65,90,50,85,45,55],[80,105,65,100,70,70],[40,40,35,50,100,70],[80,70,65,80,120,100],[40,80,100,30,30,20],[55,95,115,45,45,35],[80,120,130,55,65,45],[50,85,55,65,65,90],[65,100,70,80,80,105],[90,65,65,40,40,15],[95,75,110,100,80,30],[25,35,70,95,55,45],[50,60,95,120,70,70],[52,90,55,58,62,60],[35,85,45,35,35,75],[60,110,70,60,60,110],[65,45,55,45,70,45],[90,70,80,70,95,70],[80,80,50,40,50,25],[105,105,75,65,100,50],[30,65,100,45,25,40],[50,95,180,85,45,70],[30,35,30,100,35,80],[45,50,45,115,55,95],[60,65,60,130,75,110],[35,45,160,30,45,70],[60,48,45,43,90,42],[85,73,70,73,115,67],[30,105,90,25,25,50],[55,130,115,50,50,75],[40,30,50,55,55,100],[60,50,70,80,80,150],[60,40,80,60,45,40],[95,95,85,125,75,55],[50,50,95,40,50,35],[60,80,110,50,80,45],[50,120,53,35,110,87],[50,105,79,35,110,76],[90,55,75,60,75,30],[40,65,95,60,45,35],[65,90,120,85,70,60],[80,85,95,30,30,25],[105,130,120,45,45,40],[250,5,5,35,105,50],[65,55,115,100,40,60],[105,95,80,40,80,90],[30,40,70,70,25,60],[55,65,95,95,45,85],[45,67,60,35,50,63],[80,92,65,65,80,68],[30,45,55,70,55,85],[60,75,85,100,85,115],[40,45,65,100,120,90],[70,110,80,55,80,105],[65,50,35,115,95,95],[65,83,57,95,85,105],[65,95,57,100,85,93],[65,125,100,55,70,85],[75,100,95,40,70,110],[20,10,55,15,20,80],[95,125,79,60,100,81],[130,85,80,85,95,60],[48,48,48,48,48,48],[55,55,50,45,65,55],[130,65,60,110,95,65],[65,65,60,110,95,130],[65,130,60,95,110,65],[65,60,70,85,75,40],[35,40,100,90,55,35],[70,60,125,115,70,55],[30,80,90,55,45,55],[60,115,105,65,70,80],[80,105,65,60,75,130],[160,110,65,65,110,30],[90,85,100,95,125,85],[90,90,85,125,90,100],[90,100,90,125,85,90],[41,64,45,50,50,50],[61,84,65,70,70,70],[91,134,95,100,100,80],[106,110,90,154,90,130],[100,100,100,100,100,100],[45,49,65,49,65,45],[60,62,80,63,80,60],[80,82,100,83,100,80],[39,52,43,60,50,65],[58,64,58,80,65,80],[78,84,78,109,85,100],[50,65,64,44,48,43],[65,80,80,59,63,58],[85,105,100,79,83,78],[35,46,34,35,45,20],[85,76,64,45,55,90],[60,30,30,36,56,50],[100,50,50,86,96,70],[40,20,30,40,80,55],[55,35,50,55,110,85],[40,60,40,40,40,30],[70,90,70,60,70,40],[85,90,80,70,80,130],[75,38,38,56,56,67],[125,58,58,76,76,67],[20,40,15,35,35,60],[50,25,28,45,55,15],[90,30,15,40,20,15],[35,20,65,40,65,20],[55,40,85,80,105,40],[40,50,45,70,45,70],[65,75,70,95,70,95],[55,40,40,65,45,35],[70,55,55,80,60,45],[90,75,85,115,90,55],[75,80,95,90,100,50],[70,20,50,20,50,40],[100,50,80,60,80,50],[70,100,115,30,65,30],[90,75,75,90,100,70],[35,35,40,35,55,50],[55,45,50,45,65,80],[75,55,70,55,95,110],[55,70,55,40,55,85],[30,30,30,30,30,30],[75,75,55,105,85,30],[65,65,45,75,45,95],[55,45,45,25,25,15],[95,85,85,65,65,35],[65,65,60,130,95,110],[95,65,110,60,130,65],[60,85,42,85,42,91],[95,75,80,100,110,30],[60,60,60,85,85,85],[48,72,48,72,48,48],[190,33,58,33,58,33],[70,80,65,90,65,85],[50,65,90,35,35,15],[75,90,140,60,60,40],[100,70,70,65,65,45],[65,75,105,35,65,85],[75,85,200,55,65,30],[60,80,50,40,40,30],[90,120,75,60,60,45],[65,95,85,55,55,85],[70,130,100,55,80,65],[20,10,230,10,230,5],[80,125,75,40,95,85],[55,95,55,35,75,115],[60,80,50,50,50,40],[90,130,75,75,75,55],[40,40,40,70,40,20],[60,50,120,90,80,30],[50,50,40,30,30,50],[100,100,80,60,60,50],[65,55,95,65,95,35],[35,65,35,65,35,65],[75,105,75,105,75,45],[45,55,45,65,45,75],[85,40,70,80,140,70],[65,80,140,40,70,70],[45,60,30,80,50,65],[75,90,50,110,80,95],[75,95,95,95,95,85],[90,60,60,40,40,40],[90,120,120,60,60,50],[85,80,90,105,95,60],[73,95,62,85,65,85],[55,20,35,20,45,75],[35,35,35,35,35,35],[50,95,95,35,110,70],[45,30,15,85,65,65],[45,63,37,65,55,95],[45,75,37,70,55,83],[95,80,105,40,70,100],[255,10,10,75,135,55],[90,85,75,115,100,115],[115,115,85,90,75,100],[100,75,115,90,115,85],[50,64,50,45,50,41],[70,84,70,65,70,51],[100,134,110,95,100,61],[106,90,130,90,154,110],[106,130,90,110,154,90],[100,100,100,100,100,100],[40,45,35,65,55,70],[50,65,45,85,65,95],[70,85,65,105,85,120],[45,60,40,70,50,45],[60,85,60,85,60,55],[80,120,70,110,70,80],[50,70,50,50,50,40],[70,85,70,60,70,50],[100,110,90,85,90,60],[35,55,35,30,30,35],[70,90,70,60,60,70],[38,30,41,30,41,60],[78,70,61,50,61,100],[45,45,35,20,30,20],[50,35,55,25,25,15],[60,70,50,100,50,65],[50,35,55,25,25,15],[60,50,70,50,90,65],[40,30,30,40,50,30],[60,50,50,60,70,50],[80,70,70,90,100,70],[40,40,50,30,30,30],[70,70,40,60,40,60],[90,100,60,90,60,80],[40,55,30,30,30,85],[60,85,60,75,50,125],[40,30,30,55,30,85],[60,50,100,95,70,65],[28,25,25,45,35,40],[38,35,35,65,55,50],[68,65,65,125,115,80],[40,30,32,50,52,65],[70,60,62,100,82,80],[60,40,60,40,60,35],[60,130,80,60,60,70],[60,60,60,35,35,30],[80,80,80,55,55,90],[150,160,100,95,65,100],[31,45,90,30,30,40],[61,90,45,50,50,160],[1,90,45,30,30,40],[64,51,23,51,23,28],[84,71,43,71,43,48],[104,91,63,91,73,68],[72,60,30,20,30,25],[144,120,60,40,60,50],[50,20,40,20,40,20],[30,45,135,45,90,30],[50,45,45,35,35,50],[70,65,65,55,55,90],[50,75,75,65,65,50],[50,85,85,55,55,50],[50,70,100,40,40,30],[60,90,140,50,50,40],[70,110,180,60,60,50],[30,40,55,40,55,60],[60,60,75,60,75,80],[40,45,40,65,40,65],[70,75,60,105,60,105],[60,50,40,85,75,95],[60,40,50,75,85,95],[65,73,75,47,85,85],[65,47,75,73,85,85],[50,60,45,100,80,65],[70,43,53,43,53,40],[100,73,83,73,83,55],[45,90,20,65,20,65],[70,120,40,95,40,95],[130,70,35,70,35,60],[170,90,45,90,45,60],[60,60,40,65,45,35],[70,100,70,105,75,40],[70,85,140,85,70,20],[60,25,35,70,80,60],[80,45,65,90,110,80],[60,60,60,60,60,60],[45,100,45,45,45,10],[50,70,50,50,50,70],[80,100,80,80,80,100],[50,85,40,85,40,35],[70,115,60,115,60,55],[45,40,60,40,75,50],[75,70,90,70,105,80],[73,115,60,60,60,90],[73,100,60,100,60,65],[90,55,65,95,85,70],[90,95,85,55,65,70],[50,48,43,46,41,60],[110,78,73,76,71,60],[43,80,65,50,35,35],[63,120,85,90,55,55],[40,40,55,40,70,55],[60,70,105,70,120,75],[66,41,77,61,87,23],[86,81,97,81,107,43],[45,95,50,40,50,75],[75,125,100,70,80,45],[20,15,20,10,55,80],[95,60,79,100,125,81],[70,70,70,70,70,70],[60,90,70,60,120,40],[44,75,35,63,33,45],[64,115,65,83,63,65],[20,40,90,30,90,25],[40,70,130,60,130,25],[99,68,83,72,87,51],[75,50,80,95,90,65],[65,130,60,75,60,75],[95,23,48,23,48,23],[50,50,50,50,50,50],[80,80,80,80,80,80],[70,40,50,55,50,25],[90,60,70,75,70,45],[110,80,90,95,90,65],[35,64,85,74,55,32],[55,104,105,94,75,52],[55,84,105,114,75,52],[100,90,130,45,65,55],[43,30,55,40,65,97],[45,75,60,40,30,50],[65,95,100,60,50,50],[95,135,80,110,80,100],[40,55,80,35,60,30],[60,75,100,55,80,50],[80,135,130,95,90,70],[80,100,200,50,100,50],[80,50,100,100,200,50],[80,75,150,75,150,50],[80,80,90,110,130,110],[80,90,80,130,110,110],[100,100,90,150,140,90],[100,150,140,100,90,90],[105,150,90,150,90,95],[100,100,100,100,100,100],[50,150,50,150,50,150],[55,68,64,45,55,31],[75,89,85,55,65,36],[95,109,105,75,85,56],[44,58,44,58,44,61],[64,78,52,78,52,81],[76,104,71,104,71,108],[53,51,53,61,56,40],[64,66,68,81,76,50],[84,86,88,111,101,60],[40,55,30,30,30,60],[55,75,50,40,40,80],[85,120,70,50,60,100],[59,45,40,35,40,31],[79,85,60,55,60,71],[37,25,41,25,41,25],[77,85,51,55,51,65],[45,65,34,40,34,45],[60,85,49,60,49,60],[80,120,79,95,79,70],[40,30,35,50,70,55],[60,70,65,125,105,90],[67,125,40,30,30,58],[97,165,60,65,50,58],[30,42,118,42,88,30],[60,52,168,47,138,30],[40,29,45,29,45,36],[60,59,85,79,105,36],[70,94,50,94,50,66],[30,30,42,30,42,70],[70,80,102,80,102,40],[60,45,70,45,90,95],[55,65,35,60,30,85],[85,105,55,85,50,115],[45,35,45,62,53,35],[70,60,70,87,78,85],[76,48,48,57,62,34],[111,83,68,92,82,39],[75,100,66,60,66,115],[90,50,34,60,44,70],[150,80,44,90,54,80],[55,66,44,44,56,85],[65,76,84,54,96,105],[60,60,60,105,105,105],[100,125,52,105,52,71],[49,55,42,42,37,85],[71,82,64,64,59,112],[45,30,50,65,50,45],[63,63,47,41,41,74],[103,93,67,71,61,84],[57,24,86,24,86,23],[67,89,116,79,116,33],[50,80,95,10,45,10],[20,25,45,70,90,60],[100,5,5,15,65,30],[76,65,45,92,42,91],[50,92,108,92,108,35],[58,70,45,40,45,42],[68,90,65,50,55,82],[108,130,95,80,85,102],[135,85,40,40,85,5],[40,70,40,35,40,60],[70,110,70,115,70,90],[68,72,78,38,42,32],[108,112,118,68,72,47],[40,50,90,30,55,65],[70,90,110,60,75,95],[48,61,40,61,40,50],[83,106,65,86,65,85],[74,100,72,90,72,46],[49,49,56,49,61,66],[69,69,76,69,86,91],[45,20,50,60,120,50],[60,62,50,62,60,40],[90,92,75,92,85,60],[70,120,65,45,85,125],[70,70,115,130,90,60],[110,85,95,80,95,50],[115,140,130,55,55,40],[100,100,125,110,50,50],[75,123,67,95,85,95],[75,95,67,125,95,83],[85,50,95,120,115,80],[86,76,86,116,56,95],[65,110,130,60,65,95],[65,60,110,130,95,65],[75,95,125,45,75,95],[110,130,80,70,60,80],[85,80,70,135,75,90],[68,125,65,65,115,80],[60,55,145,75,150,40],[45,100,135,65,135,45],[70,80,70,80,70,110],[50,50,77,95,77,91],[75,75,130,75,130,95],[80,105,105,105,105,80],[75,125,70,125,70,115],[100,120,120,150,100,90],[90,120,100,150,120,100],[91,90,106,130,106,77],[110,160,110,80,110,100],[150,100,120,100,120,90],[120,70,110,75,120,85],[80,80,80,80,80,80],[100,100,100,100,100,100],[70,90,90,135,90,125],[100,100,100,100,100,100],[120,120,120,120,120,120],[100,100,100,100,100,100],[45,45,55,45,55,63],[60,60,75,60,75,83],[75,75,95,75,95,113],[65,63,45,45,45,45],[90,93,55,70,55,55],[110,123,65,100,65,65],[55,55,45,63,45,45],[75,75,60,83,60,60],[95,100,85,108,70,70],[45,55,39,35,39,42],[60,85,69,60,69,77],[45,60,45,25,45,55],[65,80,65,35,65,60],[85,110,90,45,90,80],[41,50,37,50,37,66],[64,88,50,88,50,106],[50,53,48,53,48,64],[75,98,63,98,63,101],[50,53,48,53,48,64],[75,98,63,98,63,101],[50,53,48,53,48,64],[75,98,63,98,63,101],[76,25,45,67,55,24],[116,55,85,107,95,29],[50,55,50,36,30,43],[62,77,62,50,42,65],[80,115,80,65,55,93],[45,60,32,50,32,76],[75,100,63,80,63,116],[55,75,85,25,25,15],[70,105,105,50,40,20],[85,135,130,60,80,25],[65,45,43,55,43,72],[67,57,55,77,55,114],[60,85,40,30,45,68],[110,135,60,50,65,88],[103,60,86,60,86,50],[75,80,55,25,35,35],[85,105,85,40,50,40],[105,140,95,55,65,45],[50,50,40,50,40,64],[75,65,55,65,55,69],[105,95,75,85,75,74],[120,100,85,30,85,45],[75,125,75,30,75,85],[45,53,70,40,60,42],[55,63,90,50,80,42],[75,103,80,70,80,92],[30,45,59,30,39,57],[40,55,99,40,79,47],[60,100,89,55,69,112],[40,27,60,37,50,66],[60,67,85,77,75,116],[45,35,50,70,50,30],[70,60,75,110,75,90],[70,92,65,80,55,98],[50,72,35,35,35,65],[60,82,45,45,45,74],[95,117,80,65,70,92],[70,90,45,15,45,50],[105,140,55,30,55,95],[75,86,67,106,67,60],[50,65,85,35,35,55],[70,105,125,65,75,45],[50,75,70,35,70,48],[65,90,115,45,115,58],[72,58,80,103,80,97],[38,30,85,55,65,30],[58,50,145,95,105,30],[54,78,103,53,45,22],[74,108,133,83,65,32],[55,112,45,74,45,70],[75,140,65,112,65,110],[50,50,62,40,62,65],[80,95,82,60,82,75],[40,65,40,80,40,65],[60,105,60,120,60,105],[55,50,40,40,40,75],[75,95,60,65,60,115],[45,30,50,55,65,45],[60,45,70,75,85,55],[70,55,95,95,110,65],[45,30,40,105,50,20],[65,40,50,125,60,30],[110,65,75,125,85,30],[62,44,50,44,50,55],[75,87,63,87,63,98],[36,50,50,65,60,44],[51,65,65,80,75,59],[71,95,85,110,95,79],[60,60,50,40,50,75],[80,100,70,60,70,95],[55,75,60,75,60,103],[50,75,45,40,45,60],[70,135,105,60,105,20],[69,55,45,55,55,15],[114,85,70,85,80,30],[55,40,50,65,85,40],[100,60,70,85,105,60],[165,75,80,40,45,65],[50,47,50,57,50,65],[70,77,60,97,60,108],[44,50,91,24,86,10],[74,94,131,54,116,20],[40,55,70,45,60,30],[60,80,95,70,85,50],[60,100,115,70,85,90],[35,55,40,45,40,60],[65,85,70,75,70,40],[85,115,80,105,80,50],[55,55,55,85,55,30],[75,75,75,125,95,40],[50,30,55,65,55,20],[60,40,60,95,60,55],[60,55,90,145,90,80],[46,87,60,30,40,57],[66,117,70,40,50,67],[76,147,90,60,70,97],[55,70,40,60,40,40],[95,130,80,70,80,50],[80,50,50,95,135,105],[50,40,85,40,65,25],[80,70,40,100,60,145],[109,66,84,81,99,32],[45,85,50,55,50,65],[65,125,60,95,60,105],[77,120,90,60,90,48],[59,74,50,35,50,35],[89,124,80,55,80,55],[45,85,70,40,40,60],[65,125,100,60,70,70],[95,110,95,40,95,55],[70,83,50,37,50,60],[100,123,75,57,75,80],[70,55,75,45,65,60],[110,65,105,55,95,80],[85,97,66,105,66,65],[58,109,112,48,48,109],[52,65,50,45,50,38],[72,85,70,65,70,58],[92,105,90,125,90,98],[55,85,55,50,55,60],[85,60,65,135,105,100],[91,90,129,90,72,108],[91,129,90,72,90,108],[91,90,72,90,129,108],[79,115,70,125,80,111],[79,115,70,125,80,111],[100,120,100,150,120,90],[100,150,120,120,100,90],[89,125,90,115,80,101],[125,130,90,130,90,95],[91,72,90,129,90,108],[100,77,77,128,128,90],[71,120,95,120,95,99],[56,61,65,48,45,38],[61,78,95,56,58,57],[88,107,122,74,75,64],[40,45,40,62,60,60],[59,59,58,90,70,73],[75,69,72,114,100,104],[41,56,40,62,44,71],[54,63,52,83,56,97],[72,95,67,103,71,122],[38,36,38,32,36,57],[85,56,77,50,77,78],[45,50,43,40,38,62],[62,73,55,56,52,84],[78,81,71,74,69,126],[38,35,40,27,25,35],[45,22,60,27,30,29],[80,52,50,90,50,89],[62,50,58,73,54,72],[86,68,72,109,66,106],[44,38,39,61,79,42],[54,45,47,75,98,52],[78,65,68,112,154,75],[66,65,48,62,57,52],[123,100,62,97,81,68],[67,82,62,46,48,43],[95,124,78,69,71,58],[75,80,60,65,90,102],[62,48,54,63,60,68],[74,48,76,83,81,104],[45,80,100,35,37,28],[59,110,150,45,49,35],[60,50,140,50,140,60],[78,52,60,63,65,23],[101,72,72,99,89,29],[62,48,66,59,57,49],[82,80,86,85,75,72],[53,54,53,37,46,45],[86,92,88,68,75,73],[42,52,67,39,56,50],[72,105,115,54,86,68],[50,60,60,60,60,30],[65,75,90,97,123,44],[50,53,62,58,63,44],[71,73,88,120,89,59],[44,38,33,61,43,70],[62,55,52,109,94,109],[58,89,77,45,45,48],[82,121,119,69,59,71],[77,59,50,67,63,46],[123,77,72,99,92,58],[95,65,65,110,130,60],[78,92,75,74,63,118],[67,58,57,81,67,101],[50,50,150,50,150,50],[45,50,35,55,75,40],[68,75,53,83,113,60],[90,100,70,110,150,80],[57,80,91,80,87,75],[43,70,48,50,60,38],[85,110,76,65,82,56],[49,66,70,44,55,51],[65,90,122,58,75,84],[55,69,85,32,35,28],[95,117,184,44,46,28],[40,30,35,45,40,55],[85,70,80,97,80,123],[126,131,95,131,98,99],[126,131,95,131,98,99],[108,100,121,81,95,95],[50,100,150,100,150,50],[80,110,60,150,130,70],[80,110,120,130,90,70],[68,55,55,50,50,42],[78,75,75,70,70,52],[78,107,75,100,100,70],[45,65,40,60,40,70],[65,85,50,80,50,90],[95,115,90,80,90,60],[50,54,54,66,56,40],[60,69,69,91,81,50],[80,74,74,126,116,60],[35,75,30,30,30,65],[55,85,50,40,50,75],[80,120,75,75,75,60],[48,70,30,30,30,45],[88,110,60,55,60,45],[47,62,45,55,45,46],[57,82,95,55,75,36],[77,70,90,145,75,43],[47,82,57,42,47,63],[97,132,77,62,67,43],[75,70,70,98,70,93],[40,45,40,55,40,84],[60,55,60,95,70,124],[45,65,40,30,40,60],[75,115,65,55,65,112],[45,20,20,25,25,40],[50,53,62,43,52,45],[50,63,152,53,142,35],[70,100,70,45,55,45],[100,125,100,55,85,35],[38,40,52,40,72,27],[68,70,92,50,132,42],[40,55,35,50,35,35],[70,105,90,80,90,45],[40,35,55,65,75,15],[60,45,80,90,100,30],[48,44,40,71,40,77],[68,64,60,111,60,117],[70,75,50,45,50,50],[120,125,80,55,60,60],[42,30,38,30,38,32],[52,40,48,40,48,62],[72,120,98,50,98,72],[51,52,90,82,110,100],[90,60,80,90,110,60],[100,120,90,40,60,80],[25,35,40,20,30,80],[75,125,140,60,90,40],[55,55,80,70,45,15],[85,75,110,100,75,35],[55,60,130,30,130,5],[95,95,95,95,95,59],[95,95,95,95,95,95],[60,100,60,100,60,120],[65,115,65,75,95,65],[60,78,135,91,85,36],[65,98,63,40,73,96],[55,90,80,50,105,96],[68,105,70,70,70,92],[78,60,85,135,91,36],[70,131,100,86,90,40],[45,55,65,45,45,45],[55,75,90,65,70,65],[75,110,125,100,105,85],[70,115,85,95,75,130],[70,85,75,130,115,95],[70,130,115,85,95,75],[70,75,115,95,130,85],[43,29,31,29,31,37],[43,29,131,29,131,37],[137,137,107,113,89,97],[137,113,89,137,107,97],[109,53,47,127,131,103],[107,139,139,53,53,79],[71,137,37,137,37,151],[83,89,71,173,71,83],[97,101,103,107,101,61],[59,181,131,59,31,109],[223,101,53,97,53,43],[97,107,101,127,89,79],[80,95,115,130,115,65],[90,125,80,90,90,125],[67,73,67,73,67,73],[73,73,73,127,73,121],[61,131,211,53,101,13],[53,127,53,151,79,107],[88,112,75,102,80,143],[46,65,65,55,35,34],[135,143,143,80,65,34],[50,65,50,40,40,65],[70,85,70,55,60,80],[100,125,90,60,70,85],[50,71,40,40,40,69],[65,86,60,55,60,94],[80,116,75,65,75,119],[50,40,40,70,40,70],[65,60,55,95,55,90],[70,85,65,125,65,120],[70,55,55,35,35,25],[120,95,95,55,75,20],[38,47,35,33,35,57],[68,67,55,43,55,77],[98,87,105,53,85,67],[25,20,20,25,45,45],[50,35,80,50,90,30],[60,45,110,80,120,90],[40,28,28,47,52,50],[70,58,58,87,92,90],[40,40,60,40,60,10],[60,50,90,80,120,60],[42,40,55,40,45,48],[72,80,100,60,90,88],[50,64,50,38,38,44],[90,115,90,48,68,74],[59,45,50,40,50,26],[69,90,60,90,60,121],[30,40,50,40,50,30],[80,60,90,60,70,50],[110,80,120,80,90,30],[40,40,80,40,40,20],[70,110,80,95,60,70],[110,85,80,100,80,30],[52,57,75,35,50,46],[72,107,125,65,70,71],[70,85,55,85,95,85],[41,63,40,40,30,66],[61,123,60,60,50,136],[40,38,35,54,35,40],[75,98,70,114,70,75],[50,65,45,50,50,45],[100,115,65,90,90,65],[50,68,60,50,50,32],[80,118,90,70,80,42],[40,45,45,74,54,50],[60,65,65,134,114,70],[42,30,45,56,53,39],[57,40,65,86,73,49],[57,90,95,136,103,29],[45,45,30,55,40,50],[65,60,45,75,55,70],[95,120,65,95,75,60],[93,90,101,60,81,95],[70,110,100,50,60,50],[60,95,50,145,130,30],[62,135,95,68,82,65],[80,85,75,110,100,70],[58,95,145,50,105,30],[45,40,40,50,61,34],[65,60,75,110,121,64],[65,100,100,70,60,75],[48,101,95,91,85,15],[30,25,35,45,30,20],[70,65,60,125,90,65],[100,125,135,20,20,70],[75,80,110,65,90,50],[60,65,55,105,95,95],[58,95,58,70,58,97],[72,80,49,40,49,40],[122,130,69,80,69,30],[90,100,90,80,70,75],[90,100,90,90,80,55],[90,90,100,70,80,75],[90,90,100,80,90,55],[70,95,115,120,50,85],[28,60,30,40,30,82],[68,80,50,60,50,102],[88,120,75,100,75,142],[92,120,115,80,115,138],[92,120,115,80,115,138],[140,85,95,145,95,130],[60,90,60,53,50,72],[100,130,100,63,60,97],[105,120,105,70,95,105],[80,100,50,100,50,200],[200,100,50,100,50,80],[100,145,130,65,110,30],[100,65,60,145,80,130],[100,80,80,80,80,80],[103,105,72,105,75,65],[70,135,95,45,70,85],[130,140,105,45,80,50],[120,112,65,80,75,78],[80,130,60,40,80,120],[85,115,95,65,65,85],[74,115,70,135,80,106],[40,61,54,45,45,65],[61,80,63,60,63,83],[76,110,70,81,70,123],[67,45,59,63,40,36],[81,55,78,90,58,49],[104,75,100,110,75,66],[55,65,45,50,45,50],[70,85,65,65,60,65],[85,120,80,85,75,85],[54,45,40,35,45,35],[110,100,75,59,80,65],[35,41,45,29,40,20],[60,79,92,52,86,35],[33,46,40,21,25,45],[71,102,78,52,55,92],[45,50,20,40,25,60],[60,75,40,50,40,85],[70,115,70,70,60,105],[50,50,45,40,45,75],[74,75,70,65,75,111],[37,55,70,30,55,65],[57,80,115,50,80,95],[41,35,45,58,51,30],[52,53,60,78,78,33],[78,69,90,125,109,39],[82,96,51,45,51,92],[55,55,75,35,35,25],[60,60,100,35,65,35],[100,100,130,45,90,35],[40,50,40,50,40,35],[85,60,100,125,80,75],[75,125,80,60,100,85],[61,31,41,59,35,45],[109,64,91,103,83,45],[40,40,35,55,40,70],[70,70,60,105,60,125],[60,78,60,40,51,51],[80,120,90,60,70,85],[40,65,35,40,35,75],[63,95,65,80,72,110],[40,65,30,45,35,60],[55,115,70,80,70,90],[40,40,35,50,100,70],[80,70,65,80,120,100],[70,100,115,35,55,75],[50,62,40,62,40,50],[65,108,65,108,65,75],[41,50,60,31,58,30],[75,50,85,115,100,45],[30,35,30,55,30,75],[95,60,60,101,60,105],[50,45,45,35,64,58],[65,55,55,45,82,78],[85,75,77,70,105,94],[10,55,25,35,25,95],[35,100,50,50,70,120],[70,103,85,60,85,82],[70,45,40,45,40,75],[100,70,72,53,62,100],[45,70,63,30,45,47],[80,119,90,54,67,90],[70,95,65,85,65,121],[70,85,145,60,55,65],[48,35,42,105,60,60],[83,55,90,130,81,86],[50,61,60,30,55,34],[72,101,100,50,97,68],[82,115,74,75,64,90],[108,68,45,30,40,43],[170,113,65,45,55,73],[90,102,73,78,65,70],[150,100,115,65,65,35],[68,50,60,120,95,82],[110,115,80,50,90,90],[130,75,60,45,100,20],[120,90,70,110,70,60],[125,100,80,85,75,55],[100,135,120,60,85,50],[115,131,131,53,53,87],[115,65,99,65,115,111],[111,127,99,79,99,55],[55,55,55,135,135,135],[85,135,79,85,105,81],[85,81,97,121,85,101],[90,112,120,72,70,106],[56,80,114,124,60,136],[154,140,108,50,68,50],[94,80,86,122,80,108],[80,70,60,140,110,110],[100,134,110,70,84,72],[65,75,45,35,45,55],[90,95,66,45,65,62],[115,145,92,75,86,87],[45,30,70,75,70,10],[87,60,95,133,91,84],[85,85,100,95,135,70],[80,120,80,90,65,135],[155,110,125,55,80,45],[55,80,80,135,120,100],[105,139,71,55,101,119],[74,130,90,120,60,116],[100,135,115,85,100,135],[100,85,100,135,115,135],[99,83,91,125,83,109],[90,130,88,70,108,104],[80,80,110,95,80,40],[40,45,45,74,54,50],[71,60,106,121,80,70],[88,128,115,58,86,80],[88,75,66,130,90,106],[88,91,82,70,125,99],[80,120,84,60,96,110],[90,105,130,125,65,85],[106,80,110,120,80,44],[105,115,121,65,93,91],[125,73,91,137,89,75],[90,120,80,68,108,124],[90,72,100,122,108,98],[90,65,85,65,85,60],[88,88,160,88,88,88]];
const POKEMON_STATUS_FORM_STATS = {"venusaurmega":[80,100,123,122,120,80],"venusaurgmax":[80,82,83,100,100,80],"charizardmegax":[78,130,111,130,85,100],"charizardmegay":[78,104,78,159,115,100],"charizardgmax":[78,84,78,109,85,100],"blastoisemega":[79,103,120,135,115,78],"blastoisegmax":[79,83,100,85,105,78],"butterfreegmax":[60,45,50,90,80,70],"beedrillmega":[65,150,40,15,80,145],"pidgeotmega":[83,80,80,135,80,121],"rattataalola":[30,56,35,25,35,72],"raticatealola":[75,71,70,40,80,77],"raticatealolatotem":[75,71,70,40,80,77],"pikachucosplay":[35,55,40,50,50,90],"pikachurockstar":[35,55,40,50,50,90],"pikachubelle":[35,55,40,50,50,90],"pikachupopstar":[35,55,40,50,50,90],"pikachuphd":[35,55,40,50,50,90],"pikachulibre":[35,55,40,50,50,90],"pikachuoriginal":[35,55,40,50,50,90],"pikachuhoenn":[35,55,40,50,50,90],"pikachusinnoh":[35,55,40,50,50,90],"pikachuunova":[35,55,40,50,50,90],"pikachukalos":[35,55,40,50,50,90],"pikachualola":[35,55,40,50,50,90],"pikachupartner":[35,55,40,50,50,90],"pikachustarter":[45,80,50,75,60,120],"pikachugmax":[35,55,40,50,50,90],"pikachuworld":[35,55,40,50,50,90],"raichualola":[60,85,50,95,85,110],"raichumegax":[60,135,95,90,95,110],"raichumegay":[60,100,55,160,80,130],"sandshrewalola":[50,75,90,10,35,40],"sandslashalola":[75,100,120,25,65,65],"clefablemega":[95,80,93,135,110,70],"vulpixalola":[38,41,40,50,65,65],"ninetalesalola":[73,67,75,81,100,109],"diglettalola":[10,55,30,35,45,90],"dugtrioalola":[35,100,60,50,70,110],"meowthalola":[40,35,35,50,40,90],"meowthgalar":[50,65,55,40,40,40],"meowthgmax":[40,45,35,40,40,90],"persianalola":[65,60,60,75,65,115],"growlithehisui":[60,75,45,65,50,55],"arcaninehisui":[95,115,80,95,80,90],"alakazammega":[55,50,65,175,105,150],"machampgmax":[90,130,80,65,85,55],"victreebelmega":[80,125,85,135,95,70],"geodudealola":[40,80,100,30,30,20],"graveleralola":[55,95,115,45,45,35],"golemalola":[80,120,130,55,65,45],"ponytagalar":[50,85,55,65,65,90],"rapidashgalar":[65,100,70,80,80,105],"slowpokegalar":[90,65,65,40,40,15],"slowbromega":[95,75,180,130,80,30],"slowbrogalar":[95,100,95,100,70,30],["farf"+"etchdgalar"]:[52,95,55,58,62,55],"grimeralola":[80,80,50,40,50,25],"mukalola":[105,105,75,65,100,50],"gengarmega":[60,65,80,170,95,130],"gengargmax":[60,65,60,130,75,110],"kinglergmax":[55,130,115,50,50,75],"voltorbhisui":[40,30,50,55,55,100],"electrodehisui":[60,50,70,80,80,150],"exeggutoralola":[95,105,85,125,75,45],"marowakalola":[60,80,110,50,80,45],"marowakalolatotem":[60,80,110,50,80,45],"weezinggalar":[65,90,120,85,70,60],"kangaskhanmega":[105,125,100,60,100,100],"starmiemega":[60,100,105,130,105,120],"mrmimegalar":[50,65,65,90,90,100],"pinsirmega":[65,155,120,65,90,105],"taurospaldeacombat":[75,110,105,30,70,100],"taurospaldeablaze":[75,110,105,30,70,100],"taurospaldeaaqua":[75,110,105,30,70,100],"gyaradosmega":[95,155,109,70,130,81],"laprasgmax":[130,85,80,85,95,60],"eeveestarter":[65,75,70,65,85,75],"eeveegmax":[55,55,50,45,65,55],"aerodactylmega":[80,135,85,70,95,150],"snorlaxgmax":[160,110,65,65,110,30],"articunogalar":[90,85,85,125,100,95],"zapdosgalar":[90,125,90,85,90,100],"moltresgalar":[90,85,90,100,125,90],"dragonitemega":[91,124,115,145,125,100],"mewtwomegax":[106,190,100,154,100,130],"mewtwomegay":[106,150,70,194,120,140],"meganiummega":[80,92,115,143,115,80],"typhlosionhisui":[73,84,78,119,85,95],"feraligatrmega":[85,160,125,89,93,78],"pichuspikyeared":[20,40,15,35,35,60],"ampharosmega":[90,95,105,165,110,45],"wooperpaldea":[55,45,45,25,25,15],"slowkinggalar":[95,65,80,110,110,30],"steelixmega":[75,125,230,55,95,30],"qwilfishhisui":[65,95,85,55,55,85],"scizormega":[70,150,140,65,100,75],"heracrossmega":[80,185,115,40,105,75],"sneaselhisui":[55,95,55,35,75,115],"corsolagalar":[60,55,100,65,100,30],"skarmorymega":[65,140,110,40,100,110],"houndoommega":[75,90,90,140,90,115],"tyranitarmega":[100,164,150,95,120,71],"sceptilemega":[70,110,75,145,85,145],"blazikenmega":[80,160,80,130,80,100],"swampertmega":[100,150,110,95,110,70],"zigzagoongalar":[38,30,41,30,41,60],"linoonegalar":[78,70,61,50,61,100],"gardevoirmega":[68,85,65,165,135,100],"sableyemega":[50,85,125,85,115,20],"mawilemega":[50,105,125,55,95,50],"aggronmega":[70,140,230,60,80,50],"medichammega":[60,100,85,80,85,100],"manectricmega":[70,75,80,135,80,135],"sharpedomega":[70,140,70,110,65,105],"cameruptmega":[70,120,100,145,105,20],"altariamega":[75,110,110,110,105,80],"castformsunny":[70,70,70,70,70,70],"castformrainy":[70,70,70,70,70,70],"castformsnowy":[70,70,70,70,70,70],"banettemega":[64,165,75,93,83,75],"chimechomega":[75,50,110,135,120,65],"absolmega":[65,150,60,115,60,115],"absolmegaz":[65,154,60,75,60,151],"glaliemega":[80,120,80,120,80,100],"salamencemega":[95,145,130,120,90,120],"metagrossmega":[80,145,150,105,110,110],"latiasmega":[80,100,120,140,150,110],"latiosmega":[80,130,100,160,120,110],"kyogreprimal":[100,150,90,180,160,90],"groudonprimal":[100,180,160,150,90,90],"rayquazamega":[105,180,100,180,100,115],"deoxysattack":[50,180,20,180,20,150],"deoxysdefense":[50,70,160,70,160,90],"deoxysspeed":[50,95,90,95,90,180],"staraptormega":[85,140,100,60,90,110],"wormadamsandy":[60,79,105,59,85,36],"wormadamtrash":[60,69,95,69,95,36],"cherrimsunshine":[70,60,70,87,78,85],"lopunnymega":[65,136,94,54,96,135],"garchompmega":[108,170,115,120,95,92],"garchompmegaz":[108,130,85,141,85,151],"lucariomega":[70,145,88,140,70,112],"lucariomegaz":[70,100,70,164,70,151],"abomasnowmega":[90,132,105,132,105,30],"gallademega":[68,165,95,65,115,110],"froslassmega":[70,80,70,140,100,120],"rotomheat":[50,65,107,105,107,86],"rotomwash":[50,65,107,105,107,86],"rotomfrost":[50,65,107,105,107,86],"rotomfan":[50,65,107,105,107,86],"rotommow":[50,65,107,105,107,86],"dialgaorigin":[100,100,120,150,120,90],"palkiaorigin":[90,100,100,150,120,120],"heatranmega":[91,120,106,175,141,67],"giratinaorigin":[150,120,100,120,100,90],"darkraimega":[70,120,130,165,130,85],"shayminsky":[100,103,75,120,75,127],"arceusbug":[120,120,120,120,120,120],"arceusdark":[120,120,120,120,120,120],"arceusdragon":[120,120,120,120,120,120],"arceuselectric":[120,120,120,120,120,120],"arceusfairy":[120,120,120,120,120,120],"arceusfighting":[120,120,120,120,120,120],"arceusfire":[120,120,120,120,120,120],"arceusflying":[120,120,120,120,120,120],"arceusghost":[120,120,120,120,120,120],"arceusgrass":[120,120,120,120,120,120],"arceusground":[120,120,120,120,120,120],"arceusice":[120,120,120,120,120,120],"arceuspoison":[120,120,120,120,120,120],"arceuspsychic":[120,120,120,120,120,120],"arceusrock":[120,120,120,120,120,120],"arceussteel":[120,120,120,120,120,120],"arceuswater":[120,120,120,120,120,120],"emboarmega":[110,148,75,110,110,75],"samurotthisui":[90,108,80,100,65,85],"excadrillmega":[110,165,100,65,65,103],"audinomega":[103,60,126,80,126,50],"scolipedemega":[60,140,149,75,99,62],"lilliganthisui":[70,105,75,50,75,105],"basculinbluestriped":[70,92,65,80,55,98],"basculinwhitestriped":[70,92,65,80,55,98],"darumakagalar":[70,90,45,15,45,50],"darmanitanzen":[105,30,105,140,105,55],"darmanitangalar":[105,140,55,30,55,95],"darmanitangalarzen":[105,160,55,30,55,135],"scraftymega":[65,130,135,55,135,68],"yamaskgalar":[38,55,85,30,65,30],"garbodorgmax":[80,95,82,60,82,75],"zoruahisui":[35,60,40,85,40,70],"zoroarkhisui":[55,100,60,125,60,110],"eelektrossmega":[85,145,80,135,90,80],"chandeluremega":[60,75,110,175,110,90],"stunfiskgalar":[109,81,99,66,84,32],"golurkmega":[89,159,105,70,105,55],"braviaryhisui":[110,83,70,112,70,65],"tornadustherian":[79,100,80,110,90,121],"thundurustherian":[79,105,70,145,80,101],"landorustherian":[89,145,90,105,80,91],"kyuremblack":[125,170,100,120,90,95],"kyuremwhite":[125,120,90,170,100,95],"keldeoresolute":[91,72,90,129,90,108],"meloettapirouette":[100,128,90,77,77,128],"genesectdouse":[71,120,95,120,95,99],"genesectshock":[71,120,95,120,95,99],"genesectburn":[71,120,95,120,95,99],"genesectchill":[71,120,95,120,95,99],"chesnaughtmega":[88,137,172,74,115,44],"delphoxmega":[75,69,72,159,125,134],"greninjabond":[72,95,67,103,71,122],"greninjaash":[72,145,67,153,71,132],"greninjamega":[72,125,77,133,81,142],"vivillonfancy":[80,52,50,90,50,89],"vivillonpokeball":[80,52,50,90,50,89],"pyroarmega":[86,88,92,129,86,126],"floetteeternal":[74,65,67,125,128,92],"floettemega":[74,85,87,155,148,102],"meowsticf":[74,48,76,83,81,104],"meowsticmmega":[74,48,76,143,101,124],"meowsticfmega":[74,48,76,143,101,124],"aegislashblade":[60,140,50,140,50,60],"malamarmega":[86,102,88,98,120,88],"barbaraclemega":[72,140,130,64,106,88],"dragalgemega":[65,85,105,132,163,44],"hawluchamega":[78,137,100,74,93,118],"sliggoohisui":[58,75,83,83,113,40],"goodrahisui":[80,100,100,110,150,60],"pumpkaboosmall":[44,66,70,44,55,56],"pumpkaboolarge":[54,66,70,44,55,46],"pumpkaboosuper":[59,66,70,44,55,41],"gourgeistsmall":[55,85,122,58,75,99],"gourgeistlarge":[75,95,122,58,75,69],"gourgeistsuper":[85,100,122,58,75,54],"avalugghisui":[95,127,184,34,36,38],"xerneasneutral":[126,131,95,131,98,99],"zygarde10":[54,100,71,61,85,115],"zygardecomplete":[216,100,121,91,95,85],"zygardemega":[216,70,91,216,85,100],"dianciemega":[50,160,110,160,110,110],"hoopaunbound":[80,160,60,170,130,80],"decidueyehisui":[88,112,80,95,95,60],"gumshoostotem":[88,110,60,55,60,45],"vikavolttotem":[77,70,90,145,75,43],"crabominablemega":[97,157,122,62,107,33],"oricoriopompom":[75,70,70,98,70,93],"oricoriopau":[75,70,70,98,70,93],"oricoriosensu":[75,70,70,98,70,93],"ribombeetotem":[60,55,60,95,70,124],"rockruffdusk":[45,65,40,30,40,60],"lycanrocmidnight":[85,115,75,55,75,82],"lycanrocdusk":[75,117,65,55,65,110],"wishiwashischool":[45,140,130,140,135,30],"araquanidtotem":[68,70,92,50,132,42],"lurantistotem":[70,105,90,80,90,45],"salazzletotem":[68,64,60,111,60,117],"golisopodmega":[75,150,175,70,120,40],"silvallybug":[95,95,95,95,95,95],"silvallydark":[95,95,95,95,95,95],"silvallydragon":[95,95,95,95,95,95],"silvallyelectric":[95,95,95,95,95,95],"silvallyfairy":[95,95,95,95,95,95],"silvallyfighting":[95,95,95,95,95,95],"silvallyfire":[95,95,95,95,95,95],"silvallyflying":[95,95,95,95,95,95],"silvallyghost":[95,95,95,95,95,95],"silvallygrass":[95,95,95,95,95,95],"silvallyground":[95,95,95,95,95,95],"silvallyice":[95,95,95,95,95,95],"silvallypoison":[95,95,95,95,95,95],"silvallypsychic":[95,95,95,95,95,95],"silvallyrock":[95,95,95,95,95,95],"silvallysteel":[95,95,95,95,95,95],"silvallywater":[95,95,95,95,95,95],"miniormeteor":[60,60,100,60,100,60],"togedemarutotem":[65,98,63,40,73,96],"mimikyubusted":[55,90,80,50,105,96],"mimikyutotem":[55,90,80,50,105,96],"mimikyubustedtotem":[55,90,80,50,105,96],"drampamega":[78,85,110,160,116,36],"kommoototem":[75,110,125,100,105,85],"necrozmaduskmane":[97,157,127,113,109,77],"necrozmadawnwings":[97,113,109,157,127,77],"necrozmaultra":[97,167,97,167,97,129],"magearnaoriginal":[80,95,115,130,115,65],"magearnamega":[80,125,115,170,115,95],"magearnaoriginalmega":[80,125,115,170,115,95],"zeraoramega":[88,157,75,147,80,153],"melmetalgmax":[135,143,143,80,65,34],"rillaboomgmax":[100,125,90,60,70,85],"cinderacegmax":[80,116,75,65,75,119],"inteleongmax":[70,85,65,125,65,120],"corviknightgmax":[98,87,105,53,85,67],"orbeetlegmax":[60,45,110,80,120,90],"drednawgmax":[90,115,90,48,68,74],"coalossalgmax":[110,80,120,80,90,30],"flapplegmax":[70,110,80,95,60,70],"appletungmax":[110,85,80,100,80,30],"sandacondagmax":[72,107,125,65,70,71],"cramorantgulping":[70,85,55,85,95,85],"cramorantgorging":[70,85,55,85,95,85],"toxtricitylowkey":[75,98,70,114,70,75],"toxtricitygmax":[75,98,70,114,70,75],"toxtricitylowkeygmax":[75,98,70,114,70,75],"centiskorchgmax":[100,115,65,90,90,65],"sinisteaantique":[40,45,45,74,54,50],"polteageistantique":[60,65,65,134,114,70],"hatterenegmax":[57,90,95,136,103,29],"grimmsnarlgmax":[95,120,65,95,75,60],"alcremiegmax":[65,60,75,110,121,64],"falinksmega":[65,135,135,70,65,100],"eiscuenoice":[75,80,70,65,50,130],"indeedeef":[70,55,65,95,105,85],"morpekohangry":[58,95,58,70,58,97],"copperajahgmax":[122,130,69,80,69,30],"duraludongmax":[70,95,115,120,50,85],"zaciancrowned":[92,150,115,80,115,148],"zamazentacrowned":[92,120,140,80,140,128],"eternatuseternamax":[255,115,250,125,250,130],"urshifurapidstrike":[100,130,100,63,60,97],"urshifugmax":[100,130,100,63,60,97],"urshifurapidstrikegmax":[100,130,100,63,60,97],"zarudedada":[105,120,105,70,95,105],"calyrexice":[100,165,150,85,130,50],"calyrexshadow":[100,85,80,165,100,150],"ursalunabloodmoon":[113,70,120,135,65,52],"basculegionf":[120,92,65,100,75,78],"enamorustherian":[74,115,110,135,100,46],"oinkolognef":[115,90,70,59,90,65],"mausholdfour":[74,75,70,65,75,111],"squawkabillyblue":[82,96,51,45,51,92],"squawkabillyyellow":[82,96,51,45,51,92],"squawkabillywhite":[82,96,51,45,51,92],"scovillainmega":[65,138,85,138,85,75],"palafinhero":[100,160,97,106,87,100],"glimmoramega":[83,90,105,150,96,101],"tatsugiridroopy":[68,50,60,120,95,82],"tatsugiristretchy":[68,50,60,120,95,82],"tatsugiricurlymega":[68,65,90,135,125,92],"tatsugiridroopymega":[68,65,90,135,125,92],"tatsugiristretchymega":[68,65,90,135,125,92],"dudunsparcethreesegment":[125,100,80,85,75,55],"baxcaliburmega":[115,175,117,105,101,87],"gimmighoulroaming":[45,30,25,75,45,80],"poltchageistartisan":[40,45,45,74,54,50],"sinistchamasterpiece":[71,60,106,121,80,70],"ogerponwellspring":[80,120,84,60,96,110],"ogerponhearthflame":[80,120,84,60,96,110],"ogerponcornerstone":[80,120,84,60,96,110],"ogerpontealtera":[80,120,84,60,96,110],"ogerponwellspringtera":[80,120,84,60,96,110],"ogerponhearthflametera":[80,120,84,60,96,110],"ogerponcornerstonetera":[80,120,84,60,96,110],"terapagosterastal":[95,95,110,105,110,85],"terapagosstellar":[160,105,110,130,110,85],"crucibellemega":[106,135,75,91,125,108],"venomiconepilogue":[85,102,85,62,85,101],"ramnarokradiant":[110,56,85,141,54,154],"pokestarufo2":[100,100,100,100,100,100],"pokestarufopropu2":[100,100,100,100,100,100]};
const POKEMON_STATUS_ZA_ABILITIES = {"raichumegax":"electricsurge","raichumegay":"noguard","clefablemega":"magicbounce","victreebelmega":"innardsout","starmiemega":"hugepower","dragonitemega":"multiscale","meganiummega":"megasol","feraligatrmega":"dragonize","skarmorymega":"stalwart","chimechomega":"levitate","absolmegaz":"sharpness","staraptormega":"contrary","garchompmegaz":"levitate","lucariomegaz":"auraguard","froslassmega":"snowwarning","heatranmega":"flashfire","darkraimega":"baddreams","emboarmega":"moldbreaker","excadrillmega":"piercingdrill","scolipedemega":"shellarmor","scraftymega":"intimidate","eelektrossmega":"eelevate","chandeluremega":"infiltrator","golurkmega":"unseenfist","chesnaughtmega":"bulletproof","delphoxmega":"levitate","greninjamega":"protean","pyroarmega":"firemane","floettemega":"fairyaura","malamarmega":"contrary","barbaraclemega":"toughclaws","dragalgemega":"regenerator","hawluchamega":"noguard","zygardemega":"aurabreak","crabominablemega":"ironfist","golisopodmega":"toughclaws","drampamega":"berserk","magearnamega":"soulheart","zeraoramega":"voltabsorb","falinksmega":"defiant","scovillainmega":"spicyspray","glimmoramega":"adaptability","baxcaliburmega":"thermalexchange"};
const POKEMON_STATUS_ZA_SPRITE_IDS = {"raichumegax":10304,"raichumegay":10305,"clefablemega":10278,"victreebelmega":10279,"starmiemega":10280,"dragonitemega":10281,"meganiummega":10282,"feraligatrmega":10283,"skarmorymega":10284,"chimechomega":10306,"absolmegaz":10307,"staraptormega":10308,"garchompmegaz":10309,"lucariomegaz":10310,"froslassmega":10285,"heatranmega":10311,"darkraimega":10312,"emboarmega":10286,"excadrillmega":10287,"scolipedemega":10288,"scraftymega":10289,"eelektrossmega":10290,"chandeluremega":10291,"golurkmega":10313,"chesnaughtmega":10292,"delphoxmega":10293,"greninjamega":10294,"pyroarmega":10295,"floettemega":10296,"malamarmega":10297,"barbaraclemega":10298,"dragalgemega":10299,"hawluchamega":10300,"zygardemega":10301,"crabominablemega":10315,"golisopodmega":10316,"drampamega":10302,"magearnamega":10317,"zeraoramega":10319,"falinksmega":10303,"scovillainmega":10320,"glimmoramega":10321,"baxcaliburmega":10325};
const POKEMON_STATUS_DATA = {"ids":"bulbasaur|ivysaur|venusaur|charmander|charmeleon|charizard|squirtle|wartortle|blastoise|caterpie|metapod|butterfree|weedle|kakuna|beedrill|pidgey|pidgeotto|pidgeot|rattata|raticate|spearow|fearow|ekans|arbok|pikachu|raichu|sandshrew|sandslash|nidoranf|nidorina|nidoqueen|nidoranm|nidorino|nidoking|clefairy|clefable|vulpix|ninetales|jigglypuff|wigglytuff|zubat|golbat|oddish|gloom|vileplume|paras|parasect|venonat|venomoth|diglett|dugtrio|meowth|persian|psyduck|golduck|mankey|primeape|growlithe|arcanine|poliwag|poliwhirl|poliwrath|abra|kadabra|alakazam|machop|machoke|machamp|bellsprout|weepinbell|victreebel|tentacool|tentacruel|geodude|graveler|golem|ponyta|rapidash|slowpoke|slowbro|magnemite|magneton|far\u0066etchd|doduo|dodrio|seel|dewgong|grimer|muk|shellder|cloyster|gastly|haunter|gengar|onix|drowzee|hypno|krabby|kingler|voltorb|electrode|exeggcute|exeggutor|cubone|marowak|hitmonlee|hitmonchan|lickitung|koffing|weezing|rhyhorn|rhydon|chansey|tangela|kangaskhan|horsea|seadra|goldeen|seaking|staryu|starmie|mrmime|scyther|jynx|electabuzz|magmar|pinsir|tauros|magikarp|gyarados|lapras|ditto|eevee|vaporeon|jolteon|flareon|porygon|omanyte|omastar|kabuto|kabutops|aerodactyl|snorlax|articuno|zapdos|moltres|dratini|dragonair|dragonite|mewtwo|mew|chikorita|bayleef|meganium|cyndaquil|quilava|typhlosion|totodile|croconaw|feraligatr|sentret|furret|hoothoot|noctowl|ledyba|ledian|spinarak|ariados|crobat|chinchou|lanturn|pichu|cleffa|igglybuff|togepi|togetic|natu|xatu|mareep|flaaffy|ampharos|bellossom|marill|azumarill|sudowoodo|politoed|hoppip|skiploom|jumpluff|aipom|sunkern|sunflora|yanma|wooper|quagsire|espeon|umbreon|murkrow|slowking|misdreavus|unown|wobbuffet|girafarig|pineco|forretress|dunsparce|gligar|steelix|snubbull|granbull|qwilfish|scizor|shuckle|heracross|sneasel|teddiursa|ursaring|slugma|magcargo|swinub|piloswine|corsola|remoraid|octillery|delibird|mantine|skarmory|houndour|houndoom|kingdra|phanpy|donphan|porygon2|stantler|smeargle|tyrogue|hitmontop|smoochum|elekid|magby|miltank|blissey|raikou|entei|suicune|larvitar|pupitar|tyranitar|lugia|hooh|celebi|treecko|grovyle|sceptile|torchic|combusken|blaziken|mudkip|marshtomp|swampert|poochyena|mightyena|zigzagoon|linoone|wurmple|silcoon|beautifly|cascoon|dustox|lotad|lombre|ludicolo|seedot|nuzleaf|shiftry|taillow|swellow|wingull|pelipper|ralts|kirlia|gardevoir|surskit|masquerain|shroomish|breloom|slakoth|vigoroth|slaking|nincada|ninjask|shedinja|whismur|loudred|exploud|makuhita|hariyama|azurill|nosepass|skitty|delcatty|sableye|mawile|aron|lairon|aggron|meditite|medicham|electrike|manectric|plusle|minun|volbeat|illumise|roselia|gulpin|swalot|carvanha|sharpedo|wailmer|wailord|numel|camerupt|torkoal|spoink|grumpig|spinda|trapinch|vibrava|flygon|cacnea|cacturne|swablu|altaria|zangoose|seviper|lunatone|solrock|barboach|whiscash|corphish|crawdaunt|baltoy|claydol|lileep|cradily|anorith|armaldo|feebas|milotic|castform|kecleon|shuppet|banette|duskull|dusclops|tropius|chimecho|absol|wynaut|snorunt|glalie|spheal|sealeo|walrein|clamperl|huntail|gorebyss|relicanth|luvdisc|bagon|shelgon|salamence|beldum|metang|metagross|regirock|regice|registeel|latias|latios|kyogre|groudon|rayquaza|jirachi|deoxys|turtwig|grotle|torterra|chimchar|monferno|infernape|piplup|prinplup|empoleon|starly|staravia|staraptor|bidoof|bibarel|kricketot|kricketune|shinx|luxio|luxray|budew|roserade|cranidos|rampardos|shieldon|bastiodon|burmy|wormadam|mothim|combee|vespiquen|pachirisu|buizel|floatzel|cherubi|cherrim|shellos|gastrodon|ambipom|drifloon|drifblim|buneary|lopunny|mismagius|honchkrow|glameow|purugly|chingling|stunky|skuntank|bronzor|bronzong|bonsly|mimejr|happiny|chatot|spiritomb|gible|gabite|garchomp|munchlax|riolu|lucario|hippopotas|hippowdon|skorupi|drapion|croagunk|toxicroak|carnivine|finneon|lumineon|mantyke|snover|abomasnow|weavile|magnezone|lickilicky|rhyperior|tangrowth|electivire|magmortar|togekiss|yanmega|leafeon|glaceon|gliscor|mamoswine|porygonz|gallade|probopass|dusknoir|froslass|rotom|uxie|mesprit|azelf|dialga|palkia|heatran|regigigas|giratina|cresselia|phione|manaphy|darkrai|shaymin|arceus|victini|snivy|servine|serperior|tepig|pignite|emboar|oshawott|dewott|samurott|patrat|watchog|lillipup|herdier|stoutland|purrloin|liepard|pansage|simisage|pansear|simisear|panpour|simipour|munna|musharna|pidove|tranquill|unfezant|blitzle|zebstrika|roggenrola|boldore|gigalith|woobat|swoobat|drilbur|excadrill|audino|timburr|gurdurr|conkeldurr|tympole|palpitoad|seismitoad|throh|sawk|sewaddle|swadloon|leavanny|venipede|whirlipede|scolipede|cottonee|whimsicott|petilil|lilligant|basculin|sandile|krokorok|krookodile|darumaka|darmanitan|maractus|dwebble|crustle|scraggy|scrafty|sigilyph|yamask|cofagrigus|tirtouga|carracosta|archen|archeops|trubbish|garbodor|zorua|zoroark|minccino|cinccino|gothita|gothorita|gothitelle|solosis|duosion|reuniclus|ducklett|swanna|vanillite|vanillish|vanilluxe|deerling|sawsbuck|emolga|karrablast|escavalier|foongus|amoonguss|frillish|jellicent|alomomola|joltik|galvantula|ferroseed|ferrothorn|klink|klang|klinklang|tynamo|eelektrik|eelektross|elgyem|beheeyem|litwick|lampent|chandelure|axew|fraxure|haxorus|cubchoo|beartic|cryogonal|shelmet|accelgor|stunfisk|mienfoo|mienshao|druddigon|golett|golurk|pawniard|bisharp|bouffalant|rufflet|braviary|vullaby|mandibuzz|heatmor|durant|deino|zweilous|hydreigon|larvesta|volcarona|cobalion|terrakion|virizion|tornadus|thundurus|reshiram|zekrom|landorus|kyurem|keldeo|meloetta|genesect|chespin|quilladin|chesnaught|fennekin|braixen|delphox|froakie|frogadier|greninja|bunnelby|diggersby|fletchling|fletchinder|talonflame|scatterbug|spewpa|vivillon|litleo|pyroar|flabebe|floette|florges|skiddo|gogoat|pancham|pangoro|furfrou|espurr|meowstic|honedge|doublade|aegislash|spritzee|aromatisse|swirlix|slurpuff|inkay|malamar|binacle|barbaracle|skrelp|dragalge|clauncher|clawitzer|helioptile|heliolisk|tyrunt|tyrantrum|amaura|aurorus|sylveon|hawlucha|dedenne|carbink|goomy|sliggoo|goodra|klefki|phantump|trevenant|pumpkaboo|gourgeist|bergmite|avalugg|noibat|noivern|xerneas|yveltal|zygarde|diancie|hoopa|volcanion|rowlet|dartrix|decidueye|litten|torracat|incineroar|popplio|brionne|primarina|pikipek|trumbeak|toucannon|yungoos|gumshoos|grubbin|charjabug|vikavolt|crabrawler|crabominable|oricorio|cutiefly|ribombee|rockruff|lycanroc|wishiwashi|mareanie|toxapex|mudbray|mudsdale|dewpider|araquanid|fomantis|lurantis|morelull|shiinotic|salandit|salazzle|stufful|bewear|bounsweet|steenee|tsareena|comfey|oranguru|passimian|wimpod|golisopod|sandygast|palossand|pyukumuku|typenull|silvally|minior|komala|turtonator|togedemaru|mimikyu|bruxish|drampa|dhelmise|jangmoo|hakamoo|kommoo|tapukoko|tapulele|tapubulu|tapufini|cosmog|cosmoem|solgaleo|lunala|nihilego|buzzwole|pheromosa|xurkitree|celesteela|kartana|guzzlord|necrozma|magearna|marshadow|poipole|naganadel|stakataka|blacephalon|zeraora|meltan|melmetal|grookey|thwackey|rillaboom|scorbunny|raboot|cinderace|sobble|drizzile|inteleon|skwovet|greedent|rookidee|corvisquire|corviknight|blipbug|dottler|orbeetle|nickit|thievul|gossifleur|eldegoss|wooloo|dubwool|chewtle|drednaw|yamper|boltund|rolycoly|carkol|coalossal|applin|flapple|appletun|silicobra|sandaconda|cramorant|arrokuda|barraskewda|toxel|toxtricity|sizzlipede|centiskorch|clobbopus|grapploct|sinistea|polteageist|hatenna|hattrem|hatterene|impidimp|morgrem|grimmsnarl|obstagoon|perrserker|cursola|sir\u0066etchd|mrrime|runerigus|milcery|alcremie|falinks|pincurchin|snom|frosmoth|stonjourner|eiscue|indeedee|morpeko|cufant|copperajah|dracozolt|arctozolt|dracovish|arctovish|duraludon|dreepy|drakloak|dragapult|zacian|zamazenta|eternatus|kubfu|urshifu|zarude|regieleki|regidrago|glastrier|spectrier|calyrex|wyrdeer|kleavor|ursaluna|basculegion|sneasler|overqwil|enamorus|sprigatito|floragato|meowscarada|fuecoco|crocalor|skeledirge|quaxly|quaxwell|quaquaval|lechonk|oinkologne|tarountula|spidops|nymble|lokix|pawmi|pawmo|pawmot|tandemaus|maushold|fidough|dachsbun|smoliv|dolliv|arboliva|squawkabilly|nacli|naclstack|garganacl|charcadet|armarouge|ceruledge|tadbulb|bellibolt|wattrel|kilowattrel|maschiff|mabosstiff|shroodle|grafaiai|bramblin|brambleghast|toedscool|toedscruel|klawf|capsakid|scovillain|rellor|rabsca|flittle|espathra|tinkatink|tinkatuff|tinkaton|wiglett|wugtrio|bombirdier|finizen|palafin|varoom|revavroom|cyclizar|orthworm|glimmet|glimmora|greavard|houndstone|flamigo|cetoddle|cetitan|veluza|dondozo|tatsugiri|annihilape|clodsire|farigiraf|dudunsparce|kingambit|greattusk|screamtail|brutebonnet|fluttermane|slitherwing|sandyshocks|irontreads|ironbundle|ironhands|ironjugulis|ironmoth|ironthorns|frigibax|arctibax|baxcalibur|gimmighoul|gholdengo|wochien|chienpao|tinglu|chiyu|roaringmoon|ironvaliant|koraidon|miraidon|walkingwake|ironleaves|dipplin|poltchageist|sinistcha|okidogi|munkidori|fezandipiti|ogerpon|archaludon|hydrapple|gougingfire|ragingbolt|ironboulder|ironcrown|terapagos|pecharunt","namesText":"이상해씨|이상해풀|이상해꽃|파이리|리자드|리자몽|꼬부기|어니부기|거북왕|캐터피|단데기|버터플|뿔충이|딱충이|독침붕|구구|피죤|피죤투|꼬렛|레트라|깨비참|깨비드릴조|아보|아보크|피카츄|라이츄|모래두지|고지|니드런♀|니드리나|니드퀸|니드런♂|니드리노|니드킹|삐삐|픽시|식스테일|나인테일|푸린|푸크린|주뱃|골뱃|뚜벅쵸|냄새꼬|라플레시아|파라스|파라섹트|콘팡|도나리|디그다|닥트리오|나옹|페르시온|고라파덕|골덕|망키|성원숭|가디|윈디|발챙이|슈륙챙이|강챙이|캐이시|윤겔라|후딘|알통몬|근육몬|괴력몬|모다피|우츠동|우츠보트|왕눈해|독파리|꼬마돌|데구리|딱구리|포니타|날쌩마|야돈|야도란|코일|레어코일|파오리|두두|두트리오|쥬쥬|쥬레곤|질퍽이|질뻐기|셀러|파르셀|고오스|고우스트|팬텀|롱스톤|슬리프|슬리퍼|크랩|킹크랩|찌리리공|붐볼|아라리|나시|탕구리|텅구리|시라소몬|홍수몬|내루미|또가스|또도가스|뿔카노|코뿌리|럭키|덩쿠리|캥카|쏘드라|시드라|콘치|왕콘치|별가사리|아쿠스타|마임맨|스라크|루주라|에레브|마그마|쁘사이저|켄타로스|잉어킹|갸라도스|라프라스|메타몽|이브이|샤미드|쥬피썬더|부스터|폴리곤|암나이트|암스타|투구|투구푸스|프테라|잠만보|프리져|썬더|파이어|미뇽|신뇽|망나뇽|뮤츠|뮤|치코리타|베이리프|메가니움|브케인|마그케인|블레이범|리아코|엘리게이|장크로다일|꼬리선|다꼬리|부우부|야부엉|레디바|레디안|페이검|아리아도스|크로뱃|초라기|랜턴|피츄|삐|푸푸린|토게피|토게틱|네이티|네이티오|메리프|보송송|전룡|아르코|마릴|마릴리|꼬지모|왕구리|통통코|두코|솜솜코|에이팜|해너츠|해루미|왕자리|우파|누오|에브이|블래키|니로우|야도킹|무우마|안농|마자용|키링키|피콘|쏘콘|노고치|글라이거|강철톤|블루|그랑블루|침바루|핫삼|단단지|헤라크로스|포푸니|깜지곰|링곰|마그마그|마그카르고|꾸꾸리|메꾸리|코산호|총어|대포무노|딜리버드|만타인|무장조|델빌|헬가|킹드라|코코리|코리갑|폴리곤2|노라키|루브도|배루키|카포에라|뽀뽀라|에레키드|마그비|밀탱크|해피너스|라이코|앤테이|스이쿤|애버라스|데기라스|마기라스|루기아|칠색조|세레비|나무지기|나무돌이|나무킹|아차모|영치코|번치코|물짱이|늪짱이|대짱이|포챠나|그라에나|지그제구리|직구리|개무소|실쿤|뷰티플라이|카스쿤|독케일|연꽃몬|로토스|로파파|도토링|잎새코|다탱구|테일로|스왈로|갈모매|패리퍼|랄토스|킬리아|가디안|비구술|비나방|버섯꼬|버섯모|게을로|발바로|게을킹|토중몬|아이스크|껍질몬|소곤룡|노공룡|폭음룡|마크탕|하리뭉|루리리|코코파스|에나비|델케티|깜까미|입치트|가보리|갱도라|보스로라|요가랑|요가램|썬더라이|썬더볼트|플러시|마이농|볼비트|네오비트|로젤리아|꼴깍몬|꿀꺽몬|샤프니아|샤크니아|고래왕자|고래왕|둔타|폭타|코터스|피그점프|피그킹|얼루기|톱치|비브라바|플라이곤|선인왕|밤선인|파비코|파비코리|쟝고|세비퍼|루나톤|솔록|미꾸리|메깅|가재군|가재장군|오뚝군|점토도리|릴링|릴리요|아노딥스|아말도|빈티나|밀로틱|캐스퐁|켈리몬|어둠대신|다크펫|해골몽|미라몽|트로피우스|치렁|앱솔|마자|눈꼬마|얼음귀신|대굴레오|씨레오|씨카이저|진주몽|헌테일|분홍장이|시라칸|사랑동이|아공이|쉘곤|보만다|메탕|메탕구|메타그로스|레지락|레지아이스|레지스틸|라티아스|라티오스|가이오가|그란돈|레쿠쟈|지라치|테오키스|모부기|수풀부기|토대부기|불꽃숭이|파이숭이|초염몽|팽도리|팽태자|엠페르트|찌르꼬|찌르버드|찌르호크|비버니|비버통|귀뚤뚜기|귀뚤톡크|꼬링크|럭시오|렌트라|꼬몽울|로즈레이드|두개도스|램펄드|방패톱스|바리톱스|도롱충이|도롱마담|나메일|세꿀버리|비퀸|파치리스|브이젤|플로젤|체리버|체리꼬|깝질무|트리토돈|겟핸보숭|흔들풍손|둥실라이드|이어롤|이어롭|무우마직|돈크로우|나옹마|몬냥이|랑딸랑|스컹뿡|스컹탱크|동미러|동탁군|꼬지지|흉내내|핑복|페라페|화강돌|딥상어동|한바이트|한카리아스|먹고자|리오르|루카리오|히포포타스|하마돈|스콜피|드래피온|삐딱구리|독개굴|무스틈니|형광어|네오라이트|타만타|눈쓰개|눈설왕|포푸니라|자포코일|내룸벨트|거대코뿌리|덩쿠림보|에레키블|마그마번|토게키스|메가자리|리피아|글레이시아|글라이온|맘모꾸리|폴리곤Z|엘레이드|대코파스|야느와르몽|눈여아|로토무|유크시|엠라이트|아그놈|디아루가|펄기아|히드런|레지기가스|기라티나|크레세리아|피오네|마나피|다크라이|쉐이미|아르세우스|비크티니|주리비얀|샤비|샤로다|뚜꾸리|차오꿀|염무왕|수댕이|쌍검자비|대검귀|보르쥐|보르그|요테리|하데리어|바랜드|쌔비냥|레파르다스|야나프|야나키|바오프|바오키|앗차프|앗차키|몽나|몽얌나|콩둘기|유토브|켄호로우|줄뮤마|제브라이카|단굴|암트르|기가이어스|또르박쥐|맘박쥐|두더류|몰드류|다부니|으랏차|토쇠골|노보청|동챙이|두까비|두빅굴|던지미|타격귀|두르보|두르쿤|모아머|마디네|휠구|펜드라|소미안|엘풍|치릴리|드레디어|배쓰나이|깜눈크|악비르|악비아르|달막화|불비달마|마라카치|돌살이|암팰리스|곤율랭|곤율거니|심보러|데스마스|데스니칸|프로토가|늑골라|아켄|아케오스|깨봉이|더스트나|조로아|조로아크|치라미|치라치노|고디탱|고디보미|고디모아젤|유니란|듀란|란쿨루스|꼬지보리|스완나|바닐프티|바닐리치|배바닐라|사철록|바라철록|에몽가|딱정곤|슈바르고|깜놀버슬|뽀록나|탱그릴|탱탱겔|맘복치|파쪼옥|전툴라|철시드|너트령|기어르|기기어르|기기기어르|저리어|저리릴|저리더프|리그레|벰크|불켜미|램프라|샹델라|터검니|액슨도|액스라이즈|코고미|툰베어|프리지오|쪼마리|어지리더|메더|비조푸|비조도|크리만|골비람|골루그|자망칼|절각참|버프론|수리둥보|워글|벌차이|버랜지나|앤티골|아이앤트|모노두|디헤드|삼삼드래|활화르바|불카모스|코바르온|테라키온|비리디온|토네로스|볼트로스|레시라무|제크로무|랜드로스|큐레무|케르디오|메로엣타|게노세크트|도치마론|도치보구|브리가론|푸호꼬|테르나|마폭시|개구마르|개굴반장|개굴닌자|파르빗|파르토|화살꼬빈|불화살빈|파이어로|분이벌레|분떠도리|비비용|레오꼬|화염레오|플라베베|플라엣테|플라제스|메이클|고고트|판짱|부란다|트리미앙|냐스퍼|냐오닉스|단칼빙|쌍검킬|킬가르도|슈쁘|프레프티르|나룸퍼프|나루림|오케이징|칼라마네로|거북손손|거북손데스|수레기|드래캄|완철포|블로스터|목도리키텔|일레도리자드|티고라스|견고라스|아마루스|아마루르가|님피아|루차불|데덴네|멜리시|미끄메라|미끄네일|미끄래곤|클레피|나목령|대로트|호바귀|펌킨인|꽁어름|크레베이스|음뱃|음번|제르네아스|이벨타르|지가르데|디안시|후파|볼케니온|나몰빼미|빼미스로우|모크나이퍼|냐오불|냐오히트|어흥염|누리공|키요공|누리레느|콕코구리|크라파|왕큰부리|영구스|형사구스|턱지충이|전지충이|투구뿌논|오기지게|모단단게|춤추새|에블리|에리본|암멍이|루가루암|약어리|시마사리|더시마사리|머드나기|만마드|물거미|깨비물거미|짜랑랑|라란티스|자마슈|마셰이드|야도뇽|염뉴트|포곰곰|이븐곰|달콤아|달무리나|달코퀸|큐아링|하랑우탄|내던숭이|꼬시레|갑주무사|모래꿍|모래성이당|해무기|타입:널|실버디|메테노|자말라|폭거북스|토게데마루|따라큐|치갈기|할비롱|타타륜|짜랑꼬|짜랑고우|짜랑고우거|카푸꼬꼬꼭|카푸나비나|카푸브루루|카푸느지느|코스모그|코스모움|솔가레오|루나아라|텅비드|매시붕|페로코체|전수목|철화구야|종이신도|악식킹|네크로즈마|마기아나|마샤도|베베놈|아고용|차곡차곡|두파팡|제라오라|멜탄|멜메탈|흥나숭|채키몽|고릴타|염버니|래비풋|에이스번|울머기|누겔레온|인텔리레온|탐리스|요씽리스|파라꼬|파크로우|아머까오|두루지벌레|레돔벌레|이올브|훔처우|폭슬라이|꼬모카|백솜모카|우르|배우르|깨물부기|갈가부기|멍파치|펄스멍|탄동|탄차곤|석탄산|과사삭벌레|애프룡|단지래플|모래뱀|사다이사|윽우지|찌로꼬치|꼬치조|일레즌|스트린더|태우지네|다태우지네|때때무노|케오퍼스|데인차|포트데스|몸지브림|손지브림|브리무음|메롱꿍|쏘겨모|오롱털|가로막구리|나이킹|산호르곤|창파나이트|마임꽁꽁|데스판|마빌크|마휘핑|대여르|찌르성게|누니머기|모스노우|돌헨진|빙큐보|에써르|모르페코|끼리동|대왕끼리동|파치래곤|파치르돈|어래곤|어치르돈|두랄루돈|드라꼰|드래런치|드래펄트|자시안|자마젠타|무한다이노|치고마|우라오스|자루도|레지에레키|레지드래고|블리자포스|레이스포스|버드렉스|신비록|사마자르|다투곰|대쓰여너|포푸니크|장침바루|러브로스|나오하|나로테|마스카나|뜨아거|악뜨거|라우드본|꾸왁스|아꾸왁|웨이니발|맛보돈|퍼퓨돈|타랜툴라|트래피더|콩알뚜기|엑스레그|빠모|빠모트|빠르모트|두리쥐|파밀리쥐|쫀도기|바우첼|미니브|올리뇨|올리르바|시비꼬|베베솔트|스태솔트|콜로솔트|카르본|카디나르마|파라블레이즈|빈나두|찌리배리|찌리비|찌리비크|오라티프|마피티프|땃쭈르|태깅구르|그푸리|공푸리|들눈해|육파리|절벼게|캡싸이|스코빌런|구르데|베라카스|하느라기|클레스퍼트라|어리짱|벼리짱|두드리짱|바다그다|바닥트리오|떨구새|맨돌핀|돌핀맨|부르롱|부르르룸|모토마|꿈트렁|초롱순|킬라플로르|망망이|묘두기|꼬이밍고|터벅고래|우락고래|가비루사|어써러셔|싸리용|저승갓숭|토오|키키링|노고고치|대도각참|위대한엄니|우렁찬꼬리|사나운버섯|날개치는머리|땅을기는날개|모래털가죽|무쇠바퀴|무쇠보따리|무쇠손|무쇠머리|무쇠독나방|무쇠가시|드니차|드니꽁|드닐레이브|모으령|타부자고|총지엔|파오젠|딩루|위유이|고동치는달|무쇠무인|코라이돈|미라이돈|굽이치는물결|무쇠잎새|과미르|차데스|그우린차|조타구|이야후|기로치|오거폰|브리두라스|과미드라|꿰뚫는화염|날뛰는우레|무쇠암석|무쇠감투|테라파고스|복숭악동","forms":{"venusaurmega":"메가이상해꽃","charizardmegax":"메가리자몽X","charizardmegay":"메가리자몽Y","blastoisemega":"메가거북왕","beedrillmega":"메가독침붕","pidgeotmega":"메가피죤투","alakazammega":"메가후딘","slowbromega":"메가야도란","gengarmega":"메가팬텀","kangaskhanmega":"메가캥카","pinsirmega":"메가쁘사이저","gyaradosmega":"메가갸라도스","aerodactylmega":"메가프테라","mewtwomegax":"메가뮤츠X","mewtwomegay":"메가뮤츠Y","ampharosmega":"메가전룡","steelixmega":"메가강철톤","scizormega":"메가핫삼","heracrossmega":"메가헤라크로스","houndoommega":"메가헬가","tyranitarmega":"메가마기라스","sceptilemega":"메가나무킹","blazikenmega":"메가번치코","swampertmega":"메가대짱이","gardevoirmega":"메가가디안","sableyemega":"메가깜까미","mawilemega":"메가입치트","aggronmega":"메가보스로라","medichammega":"메가요가램","manectricmega":"메가썬더볼트","sharpedomega":"메가샤크니아","cameruptmega":"메가폭타","altariamega":"메가파비코리","banettemega":"메가다크펫","absolmega":"메가앱솔","glaliemega":"메가얼음귀신","salamencemega":"메가보만다","metagrossmega":"메가메타그로스","latiasmega":"메가라티아스","latiosmega":"메가라티오스","rayquazamega":"메가레쿠쟈","lopunnymega":"메가이어롭","garchompmega":"메가한카리아스","lucariomega":"메가루카리오","abomasnowmega":"메가눈설왕","gallademega":"메가엘레이드","rotomheat":"히트로토무","rotomwash":"워시로토무","rotomfrost":"프로스트로토무","rotomfan":"스핀로토무","rotommow":"커트로토무","audinomega":"메가다부니","kyuremblack":"블랙큐레무","kyuremwhite":"화이트큐레무","greninjaash":"지우개굴닌자","dianciemega":"메가디안시","hoopaunbound":"굴레를 벗어난 후파","necrozmaultra":"울트라네크로즈마"},"growthText":"44444444422222244422222222224444443322332244422222222222211444444444444114442222222222222114442222222112222222113222222112222211111222222222211111111144444444442222333321123333224444332444434422222423222222423322414222211322311112222132222213111111114444444444222222222444444442211122661115554446632334311122112256466116622233344444555633226622555555243333134222444555131111111111111111444444444444224444444555522244222222236622343332222223421111441111221551114221222322241212322111111111111411444444444224442222222233444224442222344444422444444222224444422222222222222443344444422111222222222322224441112244411122222244222222111122111111111111111114444444442244422244222222222222222222222221122222222211113222222221111114444444442222222222222223222222222222224443112222311412222221111111111111111111111111111444444444224442223322222233444555222114422442211122222322222222211322211112111111111111111222421444444444225522222334444454441112244444422442223344444221112241444444431422222111111111111111111111111111111111125111111","curves":{"1":[null,0,10,33,80,156,270,428,640,911,1250,1663,2160,2746,3430,4218,5120,6141,7290,8573,10000,11576,13310,15208,17280,19531,21970,24603,27440,30486,33750,37238,40960,44921,49130,53593,58320,63316,68590,74148,80000,86151,92610,99383,106480,113906,121670,129778,138240,147061,156250,165813,175760,186096,196830,207968,219520,231491,243890,256723,270000,283726,297910,312558,327680,343281,359370,375953,393040,410636,428750,447388,466560,486271,506530,527343,548720,570666,593190,616298,640000,664301,689210,714733,740880,767656,795070,823128,851840,881211,911250,941963,973360,1005446,1038230,1071718,1105920,1140841,1176490,1212873,1250000],"2":[null,0,8,27,64,125,216,343,512,729,1000,1331,1728,2197,2744,3375,4096,4913,5832,6859,8000,9261,10648,12167,13824,15625,17576,19683,21952,24389,27000,29791,32768,35937,39304,42875,46656,50653,54872,59319,64000,68921,74088,79507,85184,91125,97336,103823,110592,117649,125000,132651,140608,148877,157464,166375,175616,185193,195112,205379,216000,226981,238328,250047,262144,274625,287496,300763,314432,328509,343000,357911,373248,389017,405224,421875,438976,456533,474552,493039,512000,531441,551368,571787,592704,614125,636056,658503,681472,704969,729000,753571,778688,804357,830584,857375,884736,912673,941192,970299,1000000],"3":[null,0,6,21,51,100,172,274,409,583,800,1064,1382,1757,2195,2700,3276,3930,4665,5487,6400,7408,8518,9733,11059,12500,14060,15746,17561,19511,21600,23832,26214,28749,31443,34300,37324,40522,43897,47455,51200,55136,59270,63605,68147,72900,77868,83058,88473,94119,100000,106120,112486,119101,125971,133100,140492,148154,156089,164303,172800,181584,190662,200037,209715,219700,229996,240610,251545,262807,274400,286328,298598,311213,324179,337500,351180,365226,379641,394431,409600,425152,441094,457429,474163,491300,508844,526802,545177,563975,583200,602856,622950,643485,664467,685900,707788,730138,752953,776239,800000],"4":[null,0,9,57,96,135,179,236,314,419,560,742,973,1261,1612,2035,2535,3120,3798,4575,5460,6458,7577,8825,10208,11735,13411,15244,17242,19411,21760,24294,27021,29949,33084,36435,40007,43808,47846,52127,56660,61450,66505,71833,77440,83335,89523,96012,102810,109923,117360,125126,133229,141677,150476,159635,169159,179056,189334,199999,211060,222522,234393,246681,259392,272535,286115,300140,314618,329555,344960,360838,377197,394045,411388,429235,447591,466464,485862,505791,526260,547274,568841,590969,613664,636935,660787,685228,710266,735907,762160,789030,816525,844653,873420,902835,932903,963632,995030,1027103,1059860],"5":[null,0,15,52,122,237,406,637,942,1326,1800,2369,3041,3822,4719,5737,6881,8155,9564,11111,12800,14632,16610,18737,21012,23437,26012,28737,31610,34632,37800,41111,44564,48155,51881,55737,59719,63822,68041,72369,76800,81326,85942,90637,95406,100237,105122,110052,115015,120001,125000,131324,137795,144410,151165,158056,165079,172229,179503,186894,194400,202013,209728,217540,225443,233431,241496,249633,257834,267406,276458,286328,296358,305767,316074,326531,336255,346965,357812,367807,378880,390077,400293,411686,423190,433572,445239,457001,467489,479378,491346,501878,513934,526049,536557,548720,560922,571333,583539,591882,600000],"6":[null,0,4,13,32,65,112,178,276,393,540,745,967,1230,1591,1957,2457,3046,3732,4526,5440,6482,7666,9003,10506,12187,14060,16140,18439,20974,23760,26811,30146,33780,37731,42017,46656,50653,55969,60505,66560,71677,78533,84277,91998,98415,107069,114205,123863,131766,142500,151222,163105,172697,185807,196322,210739,222231,238036,250562,267840,281456,300293,315059,335544,351520,373744,390991,415050,433631,459620,479600,507617,529063,559209,582187,614566,639146,673863,700115,737280,765275,804997,834809,877201,908905,954084,987754,1035837,1071552,1122660,1160499,1214753,1254796,1312322,1354652,1415577,1460276,1524731,1571884,1640000]}};
const POKEMON_STATUS_ABILITY_KO = {"noability":"특성 없음","adaptability":"적응력","aerilate":"스카이스킨","aftermath":"유폭","airlock":"에어록","analytic":"애널라이즈","angerpoint":"분노의경혈","angershell":"분노의껍질","anticipation":"위험예지","arenatrap":"개미지옥","armortail":"테일아머","aromaveil":"아로마베일","asone":"혼연일체","asoneglastrier":"혼연일체 (블리자포스)","asonespectrier":"혼연일체 (레이스포스)","aurabreak":"오라브레이크","auraguard":"파동의방호","baddreams":"나이트메어",["ball"+"fe"+"tch"]:"볼줍기","battery":"배터리","battlearmor":"전투무장","battlebond":"유대변화","beadsofruin":"재앙의구슬","beastboost":"비스트부스트","berserk":"발끈","bigpecks":"부풀린가슴","blaze":"맹화","bulletproof":"방탄","cheekpouch":"볼주머니","chillingneigh":"백의울음","chlorophyll":"엽록소","clearbody":"클리어바디","cloudnine":"날씨부정","colorchange":"변색","comatose":"절대안깸","commander":"사령탑","competitive":"승기","compoundeyes":"복안","contrary":"심술꾸러기","corrosion":"부식","costar":"협연","cottondown":"솜털","cudchew":"되새김질","curiousmedicine":"기묘한약","cursedbody":"저주받은바디","cutecharm":"헤롱헤롱바디","damp":"습기","dancer":"무희","darkaura":"다크오라","dauntlessshield":"불굴의방패","dazzling":"비비드바디","defeatist":"무기력","defiant":"오기","deltastream":"델타스트림","desolateland":"끝의대지","disguise":"탈","download":"다운로드","dragonize":"드래곤스킨","dragonsmaw":"용의턱","drizzle":"잔비","drought":"가뭄","dryskin":"건조피부","earlybird":"일찍기상","eartheater":"흙먹기","eelevate":"천정부지","effectspore":"포자","electricsurge":"일렉트릭메이커","electromorphosis":"전기로바꾸기","embodyaspectcornerstone":"초상투영 (주춧돌)","embodyaspecthearthflame":"초상투영 (화덕)","embodyaspectteal":"초상투영 (벽록)","embodyaspectwellspring":"초상투영 (우물)","emergencyexit":"위기회피","fairyaura":"페어리오라","filter":"필터","firemane":"불꽃의갈기","flamebody":"불꽃몸","flareboost":"열폭주","flashfire":"타오르는불꽃","flowergift":"플라워기프트","flowerveil":"플라워베일","fluffy":"복슬복슬","forecast":"기분파","forewarn":"예지몽","friendguard":"프렌드가드","frisk":"통찰","fullmetalbody":"메탈프로텍트","furcoat":"퍼코트","galewings":"질풍날개","galvanize":"일렉트릭스킨","gluttony":"먹보","goodasgold":"황금몸","gooey":"미끈미끈","gorillatactics":"무아지경","grasspelt":"풀모피","grassysurge":"그래스메이커","grimneigh":"흑의울음","guarddog":"파수견","gulpmissile":"그대로꿀꺽미사일","guts":"근성","hadronengine":"하드론엔진","harvest":"수확","healer":"치유의마음","heatproof":"내열","heavymetal":"헤비메탈","honeygather":"꿀모으기","hospitality":"대접","hugepower":"천하장사","hungerswitch":"꼬르륵스위치","hustle":"의욕","hydration":"촉촉바디","hypercutter":"괴력집게","icebody":"아이스바디","iceface":"아이스페이스","icescales":"얼음인분","illuminate":"발광","illusion":"일루전","immunity":"면역","imposter":"괴짜","infiltrator":"틈새포착","innardsout":"내용물분출","innerfocus":"정신력","insomnia":"불면","intimidate":"위협","intrepidsword":"불요의검","ironbarbs":"철가시","ironfist":"철주먹","justified":"정의의마음","keeneye":"날카로운눈","klutz":"서투름","leafguard":"리프가드","levitate":"부유","libero":"리베로","lightmetal":"라이트메탈","lightningrod":"피뢰침","limber":"유연","lingeringaroma":"가시지않는향기","liquidooze":"해감액","liquidvoice":"촉촉보이스","longreach":"원격","magicbounce":"매직미러","magicguard":"매직가드","magician":"매지션","magmaarmor":"마그마의무장","magnetpull":"자력","marvelscale":"이상한비늘","megalauncher":"메가런처","megasol":"메가솔라","merciless":"무도한행동","mimicry":"의태","mindseye":"심안","minus":"마이너스","mirrorarmor":"미러아머","mistysurge":"미스트메이커","moldbreaker":"틀깨기","moody":"변덕쟁이","motordrive":"전기엔진","moxie":"자기과신","multiscale":"멀티스케일","multitype":"멀티타입","mummy":"미라","myceliummight":"균사의힘","naturalcure":"자연회복","neuroforce":"브레인포스","neutralizinggas":"화학변화가스","noguard":"노가드","normalize":"노말스킨","oblivious":"둔감","opportunist":"편승","orichalcumpulse":"진홍빛고동","overcoat":"방진","overgrow":"심록","owntempo":"마이페이스","parentalbond":"부자유친","pastelveil":"파스텔베일","perishbody":"멸망의바디","pickpocket":"나쁜손버릇","pickup":"픽업","piercingdrill":"관통드릴","pixilate":"페어리스킨","plus":"플러스","poisonheal":"포이즌힐","poisonpoint":"독가시","poisonpuppeteer":"독조종","poisontouch":"독수","powerconstruct":"스웜체인지","powerofalchemy":"과학의힘","powerspot":"파워스폿","prankster":"짓궂은마음","pressure":"프레셔","primordialsea":"시작의바다","prismarmor":"프리즘아머","propellertail":"스크루지느러미","protean":"변환자재","protosynthesis":"고대활성","psychicsurge":"사이코메이커","punkrock":"펑크록","purepower":"순수한힘","purifyingsalt":"정화의소금","quarkdrive":"쿼크차지","queenlymajesty":"여왕의위엄","quickdraw":"퀵드로","quickfeet":"속보","raindish":"젖은접시","rattled":"주눅","receiver":"리시버","reckless":"이판사판","refrigerate":"프리즈스킨","regenerator":"재생력","ripen":"숙성","rivalry":"투쟁심","rkssystem":"AR시스템","rockhead":"돌머리","rockypayload":"바위나르기","roughskin":"까칠한피부","runaway":"도주","sandforce":"모래의힘","sandrush":"모래헤치기","sandspit":"모래뿜기","sandstream":"모래날림","sandveil":"모래숨기","sapsipper":"초식","schooling":"어군","scrappy":"배짱","screencleaner":"배리어프리","seedsower":"넘치는씨","serenegrace":"하늘의은총","shadowshield":"스펙터가드","shadowtag":"그림자밟기","sharpness":"예리함","shedskin":"탈피","sheerforce":"우격다짐","shellarmor":"조가비갑옷","shielddust":"인분","shieldsdown":"리밋실드","simple":"단순","skilllink":"스킬링크","slowstart":"슬로스타트","slushrush":"눈치우기","sniper":"스나이퍼","snowcloak":"눈숨기","snowwarning":"눈퍼뜨리기","solarpower":"선파워","solidrock":"하드록","soulheart":"소울하트","soundproof":"방음","speedboost":"가속","spicyspray":"하바네로분출","stakeout":"잠복","stall":"시간벌기","stalwart":"굳건한신념","stamina":"지구력","stancechange":"배틀스위치","static":"정전기","steadfast":"불굴의마음","steamengine":"증기기관","steelworker":"강철술사","steelyspirit":"강철정신","stench":"악취","stickyhold":"점착","stormdrain":"마중물","strongjaw":"옹골찬턱","sturdy":"옹골참","suctioncups":"흡반","superluck":"대운","supersweetsyrup":"감미로운꿀","supremeoverlord":"총대장","surgesurfer":"서핑테일","swarm":"벌레의알림","sweetveil":"스위트베일","swiftswim":"쓱쓱","swordofruin":"재앙의검","symbiosis":"공생","synchronize":"싱크로","tabletsofruin":"재앙의목간","tangledfeet":"갈지자걸음","tanglinghair":"컬리헤어","technician":"테크니션","telepathy":"텔레파시","teraformzero":"제로포밍","terashell":"테라셸","terashift":"테라체인지","teravolt":"테라볼티지","thermalexchange":"열교환","thickfat":"두꺼운지방","tintedlens":"색안경","torrent":"급류","toughclaws":"단단한발톱","toxicboost":"독폭주","toxicchain":"독사슬","toxicdebris":"독치장","trace":"트레이스","transistor":"트랜지스터","triage":"힐링시프트","truant":"게으름","turboblaze":"터보블레이즈","unaware":"천진","unburden":"곡예","unnerve":"긴장감","unseenfist":"보이지않는주먹","vesselofruin":"재앙의그릇","victorystar":"승리의별","vitalspirit":"의기양양","voltabsorb":"축전","wanderingspirit":"떠도는영혼","waterabsorb":"저수","waterbubble":"수포","watercompaction":"꾸덕꾸덕굳기","waterveil":"수의베일","weakarmor":"깨어진갑옷","wellbakedbody":"노릇노릇바디","whitesmoke":"하얀연기","wimpout":"도망태세","windpower":"풍력발전","windrider":"바람타기","wonderguard":"불가사의부적","wonderskin":"미라클스킨","zenmode":"달마모드","zerotohero":"마이티체인지","mountaineer":"Mountaineer","rebound":"Rebound","persistent":"Persistent"};
POKEMON_STATUS_DATA.baseIds = POKEMON_STATUS_DATA.ids.split('|');
POKEMON_STATUS_DATA.index = Object.fromEntries(POKEMON_STATUS_DATA.baseIds.map((id, index) => [id, index + 1]));
POKEMON_STATUS_DATA.names = POKEMON_STATUS_DATA.namesText.split('|');
POKEMON_STATUS_DATA.growth = Array.from(POKEMON_STATUS_DATA.growthText, Number);

function decodePokemonData(encoded) {
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const bytes = [];
  let bits = 0, value = 0;
  for (const char of encoded) {
    if (char === "=") break;
    const digit = abc.indexOf(char);
    if (digit < 0) continue;
    value = (value << 6) | digit;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >>> bits) & 255);
      value &= (1 << bits) - 1;
    }
  }
  if (bytes.length % 2) throw new Error("포켓몬 데이터 손상");
  const dict = Array.from({ length: 256 }, (_, index) => String.fromCharCode(index));
  let next = 256;
  const first = bytes[0] | (bytes[1] << 8);
  let previous = dict[first];
  if (previous == null) throw new Error("포켓몬 데이터 시작값 오류");
  const parts = [previous];
  for (let i = 2; i < bytes.length; i += 2) {
    const code = bytes[i] | (bytes[i + 1] << 8);
    const entry = dict[code] == null ? (code === next ? previous + previous[0] : null) : dict[code];
    if (entry == null) throw new Error("포켓몬 데이터 해제 오류");
    parts.push(entry);
    if (next < 65535) dict[next++] = previous + entry[0];
    previous = entry;
  }
  const binary = parts.join("");
  const chars = [];
  for (let i = 0; i < binary.length;) {
    const first = binary.charCodeAt(i++);
    if (first < 128) chars.push(String.fromCharCode(first));
    else if (first < 224) {
      const code = ((first & 31) << 6) | (binary.charCodeAt(i++) & 63);
      chars.push(String.fromCharCode(code));
    } else if (first < 240) {
      const code = ((first & 15) << 12) | ((binary.charCodeAt(i++) & 63) << 6) | (binary.charCodeAt(i++) & 63);
      chars.push(String.fromCharCode(code));
    } else {
      const point = ((first & 7) << 18) | ((binary.charCodeAt(i++) & 63) << 12) |
        ((binary.charCodeAt(i++) & 63) << 6) | (binary.charCodeAt(i++) & 63);
      const code = point - 65536;
      chars.push(String.fromCharCode(55296 + (code >>> 10), 56320 + (code & 1023)));
    }
  }
  return JSON.parse(chars.join(""));
}
const POKEMON_TEACH_DATA = decodePokemonData(
  "ewAiAG0AIgA6AFsAWwAiAGEAYgBzAG8AcgBiACIALAAiAO0AnQChAOwAiACYAA4BNAAsADEALAAyADUAGwEwABkBXQAsAAYBYQBjAGMAZQBsAGUAcgBvAGMAawAOASIA7ACVABMBhQCAAOsAoQCdAA4BMQAyACwA" +
  "HwEyAB8BNAAfATEAIQEjAWMAaQBkAC4B7ACaAKkA7QCVALQAMAGhAA4BNwAZASwAMwA+AUABQgEHAUQBZABhAHIAbQALAS4B6wCFALkA6gC4ALAAUAEbAR4BOwEgASIBWAFFAXMAcAByAGEAeQBHAZUAoADsAIsA" +
  "nADrAJMAeAG0AIQAZgEaAT0BLAA/AWoBQwEqAWIAYQB0AGkAYwBzAHMBoADtAIEArADrAJ8AkAGxAIMADgE5AGkBMQAdATUAHQFBAWsBJAF1AG8BZQBzAHMAdQByAGUALgHqALIAvQDtAJgAiADsALAAjADrAKUA" +
  "tABjAWUBaQE6AVQBaQEwAFcBYQApAWkAYQBsACQBpwEPAewAoAB4AbkAhADrALAAmADtAJkAFgEsAJcBPAEfATYAVgGeASkBbwBiAMEBcwB0AEcBlwCQAOwAlgC0ADUBeAG4AJQA6wCdALwA7ACKAKQA7QCKALgA" +
  "lgFSAZwBMADVASMBZgB0ACkBeQBvAHUAXwGLALkAdgGgAOsAqADpAaAAgAAOATwBGQEdAR8BuwGeAWcAaQBsAGkAdAByAQ8B6gCzAHUBhgCNAOwAnQDiAY8AmQA4AQcCuQH0AQcBaQByAGMAdQB0APcBcgDdAd8B" +
  "4QHsALsA7AGEALYBlwF/AR0B1AGDASICcgBzANoBaAAqAuABTQGKAJABngCYAHYBnADwARoBmQEsADcAnAG8AWwAbAClAWkAbgBnAHYAbwCJAcMBIgDrAKcA7AGYAP4BnQCYAOsAswBNARoC6gGkADgBUQFGAh8B" +
  "OAAhAsABbAB5AHMAdwAQAmMAOwLEAYIArAAZAuIBegHsALIAYAK4AOwApwAFAhkBBwJHAgoCvAFtAG4AogG/AV8BpwCdAOoAsACBABQBoAAeAmcBgAFpAm4AcAILAXMAaABvANwBxAGVALUALQKkAOwAgwC3ADgB" +
  "NgC3AWcCkwJEAWUAbgB0AHAAbwB3ACkBRwGbAN8BdwEZAswBQQI4AToBGgE0AmkCcABwACgBJAFFAUcBcwIUAukBggC2ARgBZgIsAGgCNgJhAHEAdQCfAScCrwKbAoQA7AC/AHUBlQDTAi4C7QAwAg4BOgHSAUgC" +
  "aQLNAmEAagBlAJoCLwHXAtQC1gLTAsYB7QHvAWcB3gKCAZ0BIwHhAnIATwJnAHMB0wLVAjAByQGnAIEA3AKRAgoCOwG8AeEC2wFlAHAA9wLoAvoCYgLtAIUANwHuAn8CyQLgAs4CdABhAA4CBwP5AtcCCwOMABkC" +
  "vAD+AkABHwE5AGkCXAELAWMAYQBuAG4AbwBuAPcCAQJ7AroAkABgARwDUgG5AhkBgAHxAgcBXAF0AGgAcgB1ANsBRwGGAC4DsADmAYsApQDsALkAmAC1AQ4BpALeAkcCNQNbAW8AbQCHAWgAKQFhAHAAEgLmAskB" +
  "oQB4AacAiAAZA+cBvADtAJQAMAMYAToBCQIBA54BKgFPA4gBYwBtAGkAPAPSAuMBVwKIAOsArwB7AusB7AJkAv8CmAG8AaMBbAPlAuwAoQCwABQBzwEHApICZQMjAaMBpQElAyYBRwGKALkA6wC2AIAA6gC1ALMA" +
  "7QCeAIgARwMIApgB0wFpAtsBKANsA3ECVgKGADQBQQLtAIIApACXAzEAMwCYAR0BuQFMA9sBcAFsAIYBcgBwAWcAVQIJA3UD7gHrAJ4AyQHIAXYDGQGpAzIDOQFpAicCJAFrAAsBZADRAiIAFAK1AKkBqQB8AjQB" +
  "oAC5ADgBGgFAAR0BIAPLAicCcAFjAOUC7QCXAKQANQGxANwD3gOhALEABgJnAYEChQMHAYgDbgFRA6YBLgHtAIwAsQEcAu0AgwB9ASwApAJ/AaYCywKIA3cAUQMnAUcBmADeA+gB7QCcAI8CUwGZAxkBMQBpAqUB" +
  "CwEIAWUAYQACAcQBAARvA+gB6wC5AJQADgGcAWgBNgBKAp4BCwRwAXYAZQAVAxEE4gN4ARQEsgB1AegBGAR4A4ICHQR0AJkCTgNpAHoAVQLKAeYBlACUAO0AjQDpAX0CowLmA2QDTAN2AMABiQNRA18BiACuAXMC" +
  "8wNEAiwAPgSaA8sCeABlAGsAiQEtAQ8BygGcAOoAvwCuAUUDrwGNAJcDSQMPA8EDNgKGAWIAeQBkAG8ATAJlAHkAogFHAbQAcQPjA+wAawTfA+sARQTrABwC7ACeAJAAdwO4AQADNQOGAWQAZAB5AHwE9wLqALcA" +
  "ewLXAoIEewKhALQAOAEZBEcCygJ7BCUDZQBmAHUAsAN1AG4AawDIA+0AhgB1AVkEuQCJBEgC5gMAAwsCBgGxA2IAsQOzAzMEjwCFAEQDqAB4AngBsABJBFEBHgP2AyECpQRhALQDqAG1AHQCPwLrAI0AQgJ9ApcD" +
  "AAM0AxwEogRbAfQCyAPKAbAA6wCmAHQC4QGQAjoBhAOOBC4EbgBwAGEAowFfAbAAsADaArQA2gKAA0UD5QM6AYIBLASiBA4EawDZAdQE5QKOAzQBygTsAC0DLwPwAdQDfwKzBA4EdACgAUcBpwCRAOsAiwCoAJED" +
  "rADzA34C5wMJBLoBVwFiAGUAUQNdATgDhgGXAqgBsQCAAxUB8wP1AzEAXQTyAfEEBQWZAmgA5QTHAwoFDAVCArAA7QIQBWkBEgVgBCcBcALuA7gDpgAwA2UCXgQ0AwIFJwFrAmQAOgMQBFYC1wSOA/0CtwEPA+EE" +
  "IgADBZwDdwCoAWQBXwOEAOwC7wOrBOsB3gSYAzcFYgBFAbUDHAW/BAcERgVPAkYBxAF/A3UCSwVKA8IEOAUQAjMErAC8AKcDZAMcAbIEYAQQAigCFwW1A7ECYAHfAVwCRAMwA9MDDwPWA3sEYAUpAU8DDwKKA8QB" +
  "sgCcAOwAtgCUAM4DSwFJBKgDMQMfAUkCYATaAXQAYgClASkDUwTlAV0DCgO4A7IAiAA4AfEBCAKzBMEBMgRQBCwBXwGHBaAArgFhAqYAWwOCAKUAjQWxBDgAVQXZAeMEbgJuAGQAnANcAUcBsACQAUADuQOMAO0A" +
  "jwCtAO0AkgCNAEUCXgTzAYAFMQR6AFsBTwVWAnIEXwJdAyoEwAMABXsEbAArAVIEVgKHBTYBRAVkA6EEOAXFBW8AZABdASgDlQXmAZIBeQF4AawA7QJAAUoEGQHwAgIFTQKQBMEB7QMPAe0AkQC4ALIB5wW2AJYD" +
  "vQCVATED3AWoA7ME0AV5AKEB1QRTBKwFNgQ+BesAlwViAkgDBwSNBAIF8gU5Ag8ERATJAbMBUwWYA6AFYARlBIIF4wRHAaAAhADMA+gEyQSsAA4BqQOfBaEFCwauA2kAlgRfAYcAjADMAxUGHwW+A/EFhQJjAE0C" +
  "DQFTBLwAcQOLAKYDtwCAAEQDRgNkAQ4BOAClAvYDGAaFAm0AUgNQAl8BKgb4BC0GNAGPA+sAqQDmAZ4AkQAzBgcENQAkBikBOwOfA14C5wWSAUMCRwaxBF0FewRvAE4DgwU4AtsDsAUZAq4F8APlA8gCMQDeBWsB" +
  "YgD6AZQCMwSbAIADLAISBAYGMgbQASIGCQZVBpQEYwB/BHUApAQoAUcBgwCdAKACnQDrALIAyQHlAf4C+ANeBXsEcAGUAmgArAIcBhMCsAAvBn0CrwGxAWwGxgJpAYIBYgaiBB8EZQBHBXIAvAXrALgAsQH7BRoC" +
  "mwaxAX4G1wXuBJgDXwSEBuME9QJtAmkAcAC1A5kALwafBnoBoAb6BZgFTQEuAjgBGAHvBDUChAZRBGIApgFhAMcF6gC5AKgA6wCcAMMGygQ+Bv0F7wR/BbsGhQI9Ax8GuABxA1kFgQYPAxsEYAQ6AxMDbACqBjsG" +
  "xAGEAHsCsAD6BLIArgWcAF0CkQAuA5AGigQ1BroGAgV1BqIFGQWyBYwF5gNTAVUBYATsBigBAwUDBhMCCwXvBuoAtACRAOwAhAAFBLgCGgShBXUAZwBHBfcBXwHhBrMGAQJiAW0GMQBqBYAB6gZjBgUHgwV6AHoA" +
  "CQedBpgFQgKVALwA+ATDBrIAlQD/Bg0DDwd9BdABswSSBGsA9ARTBOEGjgF0ApcAhQD9Bc4EegTrBkwCZAQyBF8BlQCFABQCAALnBskC6QYnB2YEqwJyBk0G6gXJBL8A7QCOAC8G3QQZAV0EuQGUBjgFkgQoAXQA" +
  "cwBlAGUAvAXsAJQA+gRkAfwGLwa0AA0DuAbyBhsBBAdyAG4A9QKDBWwAdwBbAccFzQF4BZcA6QFnBQ0FmAAdBZ8EAQUTB2QH9QLjAsAB+gFzAFUDfAJbA4gAdAJcAo4D6wXtBUYC3AU3ACcHZAcqB1YC6gXsAHMC" +
  "sgG0AQ4HjgXwBfQGFgd0BhYHqQWxAaYAvwCOBkYHGwP6BYkAIQaCBhIHBgEkA2wAbQBrA6UFXwGqAKkEgwA0BQAFMgd5A2sBJANdAXUAZgDBAbYEUwRfAqwBewKDAKEHNQWEA80FJANwAIgBQAQIB8QBBASsAdED" +
  "wAczB7MHDgRUBygBowFWB7kHVgLIAakBLwZ0BewApACRAO8DjADoBrkGVQUmAfYGcAHHBy8BtgCVAEsBggNnAeAE6ANwAlsB1Ad2Bc0DDwYhBrEHIQLuB3IAtAP3BjAFrwGrBH0CFQQXBAYEyAJJBjYC9wf7B3QB" +
  "kQMuA0EGygSnA1EB9QcECGgAhwEoAkcBFQHIBm4GowfhB2gADgIPAlACaQcSCMQBqgXrAFkF6wCBAOkBlgANB7YBAgeAAQMINQNwAhoIeQCmASYBxAdpANMFxAGNAMgEoACBAIsCVQSDBCoEuAKgBFcBLQjTBGkH" +
  "fQccB2MBrgFFCNAG5QPeAogHDwjFBYUBgQXuA4EA4gFYA28DhwXoAYkF7QLHAu8FKwhACCMCJgbkAjkDrQLWBMgEjAA0AZIAnwJFA1wEBwSkByIAJgYPBAYDEwK7ABgCWgMjCOkBmgCwAJcD3QKYAzMA4QfBAVAC" +
  "qQamB2kExAHrAewAvACvBh0HhQB7ApkF8AZhBpMHwwVACH4IZwALAXsHCgGSBM4GSAHnBbwD7gG3BmcBPgSQCA4EOAJdAfYC5AVSCBMGPQJiAusAqgD6BDwIngRGApoB9gfFBVQHYwBXBocBRwGdALgA3Qd1Ar0D" +
  "EQUzA/YHbwAkARkI2wYvAb0AeAW5AK0AMQc2BQQIUwJsAF8BmACQAcoE7QCLAJADbQYNCGgBvghMAmwDMwiUAvoBOAK1A5cA/gYzAbIGngbaBI8ByQbvBbcFLAhOA+QCcABDB90BgAMXAkgHSgfqB+8EMQA0BukI" +
  "OQagAdMEZgZzAZkAiwKaAFwG3wfJCMIHKANmAEgFXwHIAcoBrwZNAUgItgGDA80HpQcECTsDUgN9B2ECrgd6BRUEmwA4AakDPgh1BxAJbgCRBHMA2gjdAR0HHAL6BZ0FXgRiB0oEvghuABoG2gPuA+MGiwKQAAcG" +
  "fAheBEAIKAMgBDgCIgnkBYUAGAKECLIA6gd5BB0JbQg3CSkBIQkoAzIA7gM8CWICeAKYAEgJNQUgAu0HbwBUAyQD2wOdAIkA6wCCAE0BnwCNAhoCRAXBBzYJpgGpAmYAIwPIA+wAxAg9AjgEHQeLAK4BhQAACI0I" +
  "YAboCGAJKgEhCSAEZwDUBF8BjwN2AYoCiwb8BZ4E3wQ/CLMHbwBzAGsDYwCsAq4CKQLEAWcJ6wFyA7kAuQibAN4HDwMOCOkIJwIoA2cAzgKZBkcBxAjtAVoFiwajBoEBdAe+CJQJLAmsAuMFVgKqAEoBmQA3BI8A" +
  "dAJ2BBcB6wcPCUMJlAQeCC8BnARIAdoE2wL2AzUGNwWzCKUBdADuB1ACtQOaCe4BeAJ6As4DRAUABbsJbwAgBNsDgwAuA1kJFQjABLoCBAhwAWIAEAioB2UJ9gSpAa4FTAErAx0DtgX2B3AB9gFsAhkIJwG8BewC" +
  "yQStAIsCNAF6AXgEAglACHMJcwCVAnAIEAGPAeMBSwm0AB0CuQkfASAFLAjwCawCbAM0CPQJkAFYAwoDqwl1AuwApgCQCbAEaAFMCP0J7QgTAsIGIQglCOIBeQkVAVsFqgMQA9MJTAZuCDsFhgUZB7oIjwGOAVMI" +
  "SQR6BH4F4Qc6A5cCZwD0AvMJIQidAo8HrgRKCNwFuwmlAVQHDgYvBqMAaQUbCe4JswcmAu4DkgA0AScEMwn7CSECWgFyAJYE2wHiBb8B5QJEAEQAuQNdAuoE4QG9A/8EZwJVBUUKawDsCNkGtQM5B7QC3QdzBPkJ" +
  "SwMIBkQKagdSAsACUwQsBi0HzQH+BB0BHAliChYHGwhnAGcAvgIwBVcCnwKNBrsAdAKDAJ8Ctwh3A8gC/wVrAccDswjkBzMENghmCeYB4wjsAIUAzwExANUI/wRXAccDZgCpAmQEmQbGBLAAzQMsAv4H0APSA6AJ" +
  "NgKPCqkCsgilAcwIxAGbAIUALQcTBksFfwmyBwYBjwpvAKMI5gKWA64ExQFVBAsF8AG4AswFjgqiAYgBbgB/BCgDvAVjAecFJQmsAJ0EfAVjA0IJxwP3AS4J5AWMAC4DswD1A6QCxAo3BWQAvwFdAaUFpwVzCiwG" +
  "BwrnAnUDhgC2ATkBIgYJBEQKaQCtCvsEQgaNAN0HlwM0Bp8F4AowCMEBHQoQAY4AQgIaAvMDWwOlCFgDZgHvBH4KqgpsAwgBdwZyArkEkAGsALYApwrWCOgD0QpzAFsBqQdRAlMCcgUvAd8GygGNAF4CYAI+AmMC" +
  "GQEoBUcCTwcFC/cH1AfKAfIH9QO/A2EKnAppACAE/AF6CuIBuQD5CXoIAAX4CiIA0QqWB+wIhgZHAZ4A6QExC/EIMAYxCgAFDQqOClYGZAD8CjEFeAi7ALQBgwSmCm0GgAKACaoKVgZtAMcDIQmlCV0KqQCKCEIC" +
  "hgAaA7ECPATAAxcL+gGiBdMHtQPxCsoKjgf8BMoKSAQiCjYLnAEqBX8KVgsoARkI5wSNAOYB5QFoCXkGNgsfATQJNQNkBHUGKAEjAigDCAVNBmkLmwY3BEkHTAk8BPsJgwY5C3MLTwRRBF8B5QZ9Bq4B3wZqCG8L" +
  "iwucCmULogGYApQFxAEPBvwG/gaMAFsEsgCpACEGfwumBoELogUCBvMJ7ACXAO8IDwu6AKsEaQhDCwcESwOdC1IHDgQwBYYEyQQyCwkI0wKLAAUEgAKeCH8K2QPqCPcBXgHEAUkB/waxAJED3ApaCJwBrAOOCrMD" +
  "KAPUBCYBqgLuA6kJ6wCjABMBoADfAaAAlQCkBmILRArHC24AvQbyBJ8DSAHNA3AH4AbCC1IBEQfXC7UEKANwAlUHiAlWArEGQQIUAp8CmAB3BN0FPQTFCtgLHApfAesLRgOzAOwB9Ap7BWAHjATkC5IIpQWJA7UD" +
  "vgtnBbYAEwuNCJIJxgvlCwEMcgBTB/YLeAHsC/kLMAEAAvUK8QuxBFwIuAsLDKkCKQFnAFUD1wVOCu0LoQsuA4QArgE7BPELwAMYDKoK2AvWCTkG6QsfDBEM7AHcCagAHQX9C9UD/wsoA1gKNQq9C94LzAHwA14K" +
  "nAh9ClUK2AumBEcBBAxdArYAyQGJCEAMOwoqDAsMKApNBvcL7Qs+BnUCoAacCLEE3wqcCtgLEwMiBOoLEAz4C+wBhQAaAykEFgzUBuQLTwL1AlAE9QVdDLMGGQK4CKUDfQmLCiUHKQwrC3ABTwIuCyMFUwSxBp4G" +
  "uAh8C0sHXQQ3C0IMrQvyBMgDVgRxA6gAJwiQAq4I8ARZDBoIrAaRCxABmgAaAw8GEgbKBKQGgAEqCy4FGgg6A4UFawymAOIBVwifBiQMUgYPA5gMLwX3BrkKrQofDJ8AEwrzA18H/gVECs4CbADyCV8BeQtrC/gJ" +
  "VgyYAxcLsQykBQYH8gS0DGoLeAWcAPkJ0QEPAxcLeQBuAA8EYQB4ACQDJgMBClMMnwanAEMDdQOrCUsM/AmOCscMDwSJAXcMnwOvBa0AVAQ0C34M3gpxCWsBoAg4A4YJxgRlCM4DXAq2Aj4HyAJsBVcB5QxoAOEC" +
  "iQYvAY0GpwD1A+gK3wk2AmUAlQJWB2QKCwsiDIUKEAsHCkMFmAG5DCEC6AtpACEEbQA5DFUC/AZNAQ8G3Qf0B0UF+wy+AaIBrAZMAkcBhACQAZwASgGVAHUFOAohCB0F2wUdASoLZQBwCmQGbQAoBuYCrgWwBQ4F" +
  "bguLDDUDJwH8DHQA9ALaAykBdQycDJ8HoACJAOcJpgCxBdcCngk6CsgJ6AMzDdoD9AJmAH0HhgDQCx0LKwRFDSgBRw3YAWoCtggdBzwNPg3eDLMAMAMeC0QNzQVGDTUN0AVIDecEoAzaBLgDiwB8BrEGYw1VDAEI" +
  "5wgIDVANXw2XApkCVA2gB+cJVAgWBKIHXgTFC+QMbg0qAa4CKw07DT0NJQXeDIQA7AGbCGsNRwKbAfsMKg3vB28APAWuAcYB6Aa1CkIJZQAqDcYE6gXqAOwF/wbnBaEA/gTiCx0BTwepAoEKWgqZAAINswHLBZIN" +
  "pQUOBFIC6QvsAKMAvQC1AY4HkQcNCSIGNwWRCqUBMwR+BtEIeAioC2wKRQ2FAvgHfwRTDcQB3gHrACQMzgNeAmEDJQfvDOQMqgI5DTkGywtTBCUJowCxAacAsQGTAKYDuw0UDV0NOgMyCM4MSAxsB40FKAwIDW4B" +
  "KQG8DP8DAQTpAcIMiQykDAgNKALIDPoHXwHBChcJ1wqfBnYNJwzvBWwIZQB4APoI0QpQAmMJJAKtBgoJ1wWvBbkEBwzbBSkLCA36DbEIOglWAmUI3QxUBDEKawpzDPkNNQ3UBJ4KCwF9B7QLmAS1ACYJ6g2XDAgO" +
  "NQ2TDRcNVQdXB7QL7AAXAhAOGQo1A2YAJAFhABgFigaKAqgLSwghAisOIwJ5AMUFjwxIB0IC4QETBjUBIweMCkULIgA0DnIAeQCkBVcHmgB4BdMLtAI0BK0FfAphB08HKw6WBPoBfQMXAlIFMQ7FDDMOvwbkAqAI" +
  "iwH5BoADpwCTAJgIAAmYAwkMawErDlkKpAGyA5EKZQlzAqwN0wJnBbABkAcXCukKNgJmDlQHqgasBkcBuQAdB5MAsQAwBgcGkwYzDtsLKQFaAfsIEAqDANoC5wWMANMCBQ2XAZENgQ5PAtsD7wptDL0DJQphByoO" +
  "IQSqAhEIxAM9AxgClwCQAZUAmgesAHIOGgSBDkwC2wH1AsYEWgPGDacAiQAbA6oEmgo8Aa8IdA5RBPYGrQtfAbMANAGNAJUAbAxhAgQC1QwpDlcBBQn4AYQOCwuDB5cNgwB2BQcMJQcqC8IOQw53AOQH3AyDAC8G" +
  "awbiAYoA5gFIDGABHQWLBB8DMw4aCOQCYQBDCA4GdQVZCcEGjgACC0QNKg5PAsABdgkqDRACqwfNA4gA+gSxALgAaggyAzcFBQmmAeUEbQOMB3EDZQgiDXUE8AuGB5wBjwhlDiMCkAQlA6kMlg2YDZcAyQFrCZ4F" +
  "mAPVBukOpgE6AngJhAfsALEA0wKwALQFUgH3Ct0OpgG9AlgLFQ/HDkoOpwD+Ad0G4A3rDbMOHw8PCvwOxw7gDIoKGArLBsEOBg9uAU8C7gORDOwAEgTHBgoPhQcxA6sDVQX4DqcODA2mAXsDzgzUDVgJQgJ2BHAD" +
  "AA+wDmsF3Q6XAjMIOwOmAaoH0gLqCXID5wVZBXkI/gVAD2wDaA4zBDkHVg89B/kMtgplDsEBXAxLDpEApQBoDycJegRkDwYBtwcPBJcGNArnBDwP7QHTCLoN3Ao+D98CdA7BATkGGQszBGsJdA11Bd8GxgkcD2gB" +
  "cwxwDzkGOAN8DZcEqQmhCx0HlQpcCygPRwLKDW8PfQ9lAPwDVQehChABjg9uBzQE7QCAAMIKtwHSCSoO4gWXBg8CdAAXB+QFlAAfCjsOaA1vB+IBnAYPD0sDYwuWD9QE3AysD04KUQbMB6kKQQ46AswMJwOcDJEB" +
  "BA7bBOsELgOFAGkF9wMpD6UPEQiVDS8GdwW1ARcKjg58D2UApQHADwEKXwOxAaIAyASzAcYP7QQUC5MHeQ2WD/UCXwHPCbwEzgOjDlwNwQ4PAsQHhAXuA4AAtQDZBN4J4wt8D78IEQJmDpsP6wBpD3YB3gP7D2cK" +
  "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" +
  "Uy/nMm4pcynrMnUp7TKCEvEy8zK3BYcp9jIlK5oyGTFDMGAy+C+5AvMyGiqfMgwXSzO3Ma0wajKjMmAxETPbLBQz6zBSMxgzVTNMK2QxsirKKr4p/il8MiopIDPGKSQzYTOvMgAUmAKpAoUFWwCyMtIpgzMxDboy" +
  "2SmHM3owpSmZAYsz9QiNM/8ojzPOMh4BQTJ+MJUz1TIALJgzRjLaMpUsnDM6M9orkzKhM4YupDMgLe4yfinfBKkz9TILKvcyrjP1L7AzpjGuL7Qzmym2M0ozaDKfKjgu1iy8M20vDzAdMsAzpjIWM3QyVDMmKWQw" +
  "xjNiKioqHDPKMx4zKQtpMAkrdjMqFycDcQLWM0ABcyzZM8MV2zO8MoYvfTHEMuEzhjF1Kxgp5TMeATQzUTBzLuozjizsMwAsmTPvMxMsXSnfMvMzoDPuMaIz/ymBAewysCz6MzMsgCr9M4cp/zPPMJsy4i7UMLMz" +
  "/zIGNEkzGwS4MxIyujMMNA4zvTMPNL8t6jASNGIwFDSTKRY0xTMaMxo0yTNfLX0ytip/MnYzlATKCXAwJTSBM50pXy3aM4YzvTDeMy403DEwND0yMzQ/Mucz0DLpMyww6zOXMzs07jN8LfAzkDJANB4sQjRyKoUu" +
  "ozN1KUc0VDKoM0s0CyqsM1wyTzREM1E0/TItK1Q0ZjIsLgg0CDN8KQs0DTPEK6QyXjS/M2A0IikTNMordTLEMyYpGDQbM2k0VzPMM2w0ITN2M9IVsQiAM3wFgjN1NCk0dzTQKogzCAJ6NG8tfDSOM/8o5jOSMzY0" +
  "QzIDMdYyhjT1Kpoz3DLxM4s0nzNNMkM09jORNKUzSDSUNCoJTDRbMvgy6y1QNCQusjP+MpQwBzRXNAk0TTMZMmsyJCmnNFswySsVM2I0rTQVNHcysTRoNPgutDQfM7Y0zjN2M28wuzQnNL40uTLANNkveTSKM3s0" +
  "4zMyNMg0NDSANJMzgjREMoQ08yxQKTw0iDQ+NIQwOzP0M9c0kDRGNNo0kzT7M5U0qzP+M60zmTT2L+M0LCsENJ40+ChWNO0rojRaNKU0LCruNG8yYSxeMGEwuCzzNGQ09TRnNMgz+DTLM/o0xiltNNAzJjMEG9cU" +
  "IgHXM700KQ4CNX8CKzTCNJkBxDTIMlkq5DMKNX80yjSUM4M0OTSFNBI1hzSPMhU1nTMYLDwz9TMaNZYy+DOnMx413TSWNCE1mDTyL+I0sTMmNVM05jQqNVg0JCqkNBop7DQkKw407zRELTM1wjOuNGU0sDQ5NScp" +
  "szQ8NR40PzVpM9Ez9BAuJdECcjTZM0UZKjTeMzsyxzL1LVA1zTILNQ01VTURNTYzkyw/NJ4zTDJOMnwqZDX0MioJ/DGXNEMzJDWxM3osZTLoNOoupylYKus0bDJdNHc1MjXxNDU1UzM3NVYzGTT5NGkw/Ch2M7Yk" +
  "6x3bLYMtdDRHNS0zuzIFNeAzBzWRNZAzNTRCMs00OjRYNdA07zPyM4w0lDJPMqYzng3cNJ81IDVNNCI1aTWaNOM0JzWUMCs1IjGjNAwzczWtNXY1MTUeMmE0sjXDM3w1JSobM2o0tTQ+Nbc09R2JAQAU/zQ3MbUy" +
  "tipWF0UvvzRJNYQvZCs1MoUswTLDNcUyfzGMMwctTzUJNZI1UjVyLss00jJCMc40zDU3M/8qfy2cM2UqXDVJMdA1hjCZK4406DI/Mxw1+TM8MEk08jIfNa4l3zThNEIwXzIDNG01ry8BMykuzSyfNKAyOi1wNQo0" +
  "1SkqKgszrDVcNOU1EDSqNDQ1FzN7NXcywCk6NR0zWDO4Ks8zvB4UAyky/jRENSY08QtGNcwq/AmMNd0z3S/ENcU0CDXMMsc1DDUMNt8xawroKQ82lzUSNtI0hTHOBBU2zzWFMJMyJSxfNUU0dil9KUIpYTVTMvkz" +
  "1TWqMyQ29zKMKecdRSn8KjQpwyqQMKkvuQIlNawrKjaTKp0ptSvnNC8u3zVMM+E1OSk1NqIy4zU4Nj0u5jWsKSEp5zWrNPI0szUZM7Au9zRCNmw00iuRH4wmMzG8LjMp3St1NOMr2Cn3AyMw/jW+AwgvJzDAMpkB" +
  "wjI8MeUq/yhXKnQtDTY1M3ktWTWbM5UvAyuOK4MtMzBZLZUroTNeKT8BfSn1Kp0rVy8fKfYx8jJaMvsxPzAQKowq1DCmLccsfirxKZgpYi8oLp0pfTDUASEqji+eKUgsZDJLLLcrNgY9K7srti3TAT4xFDK5Kdkp" +
  "FzKIBxkpNjY5LuUwDjRIK6k0MzXGM2owySk3AJo20R+XAqYBgyT5GwIvYw5YLfEx3Su/NXks9gjoKnYwpjaoA6g23ymLL/Qt/yixNjg0kSwcATMCtjZ/Bbc2FSyaLPcpES2HLSAsDivtKzcwji0nLG8LpyxnMycs" +
  "ZSmdLx0tzDAbNnApfSlRMAIpcymzLIYnCCn5L4cNyy8fL7gsRTAwLcgsqi1aMS02OCndNt826TR8Kbkx5ja7Kec27DYmMVkw8DauLrE0gDI+KvU2gx/3NjUaNDFGKqA24SvWMf8sBDUHN78ybS4JN6w2BDb1CEAx" +
  "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"
);



const POKEMON_ADVANCED_MOVE_IDS = new Set(["acupressure","afteryou","agility","allyswitch","amnesia","aquaring","aromatherapy","assist","attract","auroraveil","banefulbunker","batonpass","bellydrum","bestow","block","bulkup","burningbulwark","calmmind","camouflage","celebrate","charm","chillyreception","coil","confuseray","conversion","conversion2","copycat","corrosivegas","cosmicpower","cottonguard","cottonspore","courtchange","craftyshield","curse","defog","destinybond","detect","disable","doodle","dragoncheer","dragondance","eerieimpulse","electricterrain","electrify","embargo","encore","endure","entrainment","fairylock","flatter","floralhealing","flowershield","focusenergy","followme","foresight","forestscurse","gastroacid","gearup","grassyterrain","gravity","growth","grudge","guardsplit","guardswap","hail","happyhour","haze","healbell","healblock","healingwish","healorder","healpulse","heartswap","helpinghand","holdhands","imprison","ingrain","instruct","iondeluge","irondefense","junglehealing","kingsshield","laserfocus","leechseed","lightscreen","lockon","luckychant","lunarblessing","lunardance","magiccoat","magicpowder","magicroom","magneticflux","magnetrise","matblock","meanlook","mefirst","metronome","milkdrink","mimic","mindreader","miracleeye","mirrormove","mist","mistyterrain","moonlight","morningsun","mudsport","nastyplot","naturepower","nightmare","obstruct","octolock","odorsleuth","painsplit","partingshot","perishsong","powder","powersplit","powerswap","powertrick","protect","psychicterrain","psychoshift","psychup","purify","quash","quickguard","quiverdance","ragepowder","raindance","recover","recycle","reflect","reflecttype","refresh","rest","revivalblessing","roar","roleplay","roost","rototiller","safeguard","sandstorm","scaryface","screech","shedtail","shellsmash","shoreup","silktrap","simplebeam","sketch","skillswap","slackoff","sleeptalk","snatch","snowscape","soak","softboiled","speedswap","spiderweb","spikes","spikyshield","spite","splash","spotlight","stealthrock","stickyweb","stockpile","strengthsap","stringshot","stuffcheeks","substitute","sunnyday","supersonic","swagger","swallow","sweetkiss","switcheroo","swordsdance","synthesis","tailglow","tailwind","takeheart","taunt","teatime","teeterdance","telekinesis","teleport","tickle","tidyup","topsyturvy","torment","toxicspikes","transform","trick","trickortreat","trickroom","venomdrench","watersport","whirlwind","wideguard","wish","wonderroom","workup","worryseed","yawn"]);
