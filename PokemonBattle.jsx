function PokemonBattle({
  encounter = null,
  initialParty = [],
  stateText = "",
  bagText = "",
  sync = null,
  initialBag = { pokeball: 10, greatball: 3, ultraball: 1, potion: 3, superpotion: 1, revive: 1 },
  healBefore = false,
  playerTrainer = "hilbert",
  opponentTrainer = "",
  initialMoney = 3000,
  background = "bg-forest.png"
} = {}) {
  if (typeof encounter === "string" && /^[\s]*[\[{]/.test(encounter)) {
    try { encounter = JSON.parse(encounter); } catch (ignore) { /* Plain species names still work. */ }
  }
  const nestedEncounter = encounter && typeof encounter === "object" && encounter.pokemon &&
    typeof encounter.pokemon === "object" ? encounter.pokemon : {};
  encounter = Array.isArray(encounter)
    ? { species: encounter[0], level: encounter[1] }
    : typeof encounter === "string" || typeof encounter === "number"
    ? { species: encounter }
    : encounter && typeof encounter === "object" ? { ...nestedEncounter, ...encounter } : {};
  const trainerParty = Array.isArray(encounter.party) ? encounter.party : null;
  const firstOpponent = trainerParty && trainerParty[0];
  const requestedSpecies = firstOpponent
    ? (typeof firstOpponent === "object" ? firstOpponent.species || firstOpponent.id || firstOpponent.dexNo || firstOpponent.name : firstOpponent)
    : encounter.species || encounter.id || encounter.dexNo ||
      (typeof encounter.pokemon === "string" ? encounter.pokemon : "") || encounter.name || "";
  const packedEncounter = String(requestedSpecies).trim().match(/^(.+?)\s*[,，]\s*(?:[Ll][Vv]\.?\s*)?(\d{1,3})\s*$/);
  encounter.species = packedEncounter ? packedEncounter[1].trim() : String(requestedSpecies).trim();
  if (packedEncounter && encounter.level == null) encounter.level = Number(packedEncounter[2]);
  const ROOT = "https://play.pokemonshowdown.com/";
  const wildEncounter = trainerParty ? false : encounter.wild == null ? encounter.trainer !== true : encounter.wild !== false;
  const trainerName = !wildEncounter ? String(encounter.trainerName || (trainerParty && encounter.name) || "트레이너") : "";
  const trainerRole = trainerName + " " + String(encounter.trainerClass || encounter.role || "");
  const notableTrainer = /챔피언|사천왕|관장|라이벌|주인공|엘리트\s*트레이너|에이스\s*트레이너|보스|간부/.test(trainerRole);
  const knownTrainer = /^(?:레드|그린|블루|심향|금선|휘웅|봄이|민진|빛나|투희|공명|명희|세레나|칼름|미월|영태|우리|승재|보민|푸름|난천|목호|성호|윤진|아이리스|카르네|단델|네모|페퍼|모란|비주기|게치스|플라드리|구즈마|로즈|올림|투로|N)$/.test(trainerName.trim());
  const namedTrainer = !wildEncounter && (encounter.named === true || encounter.boss === true || notableTrainer || knownTrainer);
  const trainerSprite = (() => {
    const explicit = String(encounter.trainerSprite || encounter.opponentTrainer || opponentTrainer || "").toLowerCase();
    if (/^[a-z0-9-]+$/.test(explicit)) return explicit;
    const name = trainerName.toLowerCase();
    const classes = [
      [/반바지|꼬마|youngster/, "youngster"], [/짧은 치마|소녀|lass/, "lass"],
      [/등산|hiker/, "hiker"], [/낚시|fisher/, "fisherman"],
      [/플라스마|plasma/, "plasmagrunt-gen5bw"], [/백팩|backpacker/, "backpacker"],
      [/간호|nurse/, "nurse"], [/경찰|police/, "policeman"],
      [/엘리트|ace trainer|에이스/, "acetrainer"], [/연구원|scientist/, "scientist"],
      [/라이벌|rival/, "hugh"], [/체육관|gym leader/, "cheren"],
      [/치마|girl/, "lass"]
    ];
    const match = classes.find(([pattern]) => pattern.test(name));
    return match ? match[1] : "acetrainer";
  })();
  const encounterKey = JSON.stringify(encounter);
  const STATS = ["hp", "atk", "def", "spa", "spd", "spe"];
  const NEUTRAL_IVS = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
  const NATURES = {
    Lonely: ["atk", "def"], Brave: ["atk", "spe"], Adamant: ["atk", "spa"], Naughty: ["atk", "spd"],
    Bold: ["def", "atk"], Relaxed: ["def", "spe"], Impish: ["def", "spa"], Lax: ["def", "spd"],
    Timid: ["spe", "atk"], Hasty: ["spe", "def"], Jolly: ["spe", "spa"], Naive: ["spe", "spd"],
    Modest: ["spa", "atk"], Mild: ["spa", "def"], Quiet: ["spa", "spe"], Rash: ["spa", "spd"],
    Calm: ["spd", "atk"], Gentle: ["spd", "def"], Sassy: ["spd", "spe"], Careful: ["spd", "spa"]
  };
  const NATURE_LIST = ["Hardy", "Lonely", "Brave", "Adamant", "Naughty", "Bold", "Docile", "Relaxed", "Impish", "Lax", "Timid", "Hasty", "Serious", "Jolly", "Naive", "Modest", "Mild", "Quiet", "Bashful", "Rash", "Calm", "Gentle", "Sassy", "Careful", "Quirky"];
  // Attacking type -> defending type -> multiplier. Unlisted matchups are 1x.
  const TYPE = {
    normal: { rock: .5, ghost: 0, steel: .5 },
    fire: { fire: .5, water: .5, grass: 2, ice: 2, bug: 2, rock: .5, dragon: .5, steel: 2 },
    water: { fire: 2, water: .5, grass: .5, ground: 2, rock: 2, dragon: .5 },
    electric: { water: 2, electric: .5, grass: .5, ground: 0, flying: 2, dragon: .5 },
    grass: { fire: .5, water: 2, grass: .5, poison: .5, ground: 2, flying: .5, bug: .5, rock: 2, dragon: .5, steel: .5 },
    ice: { fire: .5, water: .5, grass: 2, ice: .5, ground: 2, flying: 2, dragon: 2, steel: .5 },
    fighting: { normal: 2, ice: 2, poison: .5, flying: .5, psychic: .5, bug: .5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: .5 },
    poison: { grass: 2, poison: .5, ground: .5, rock: .5, ghost: .5, steel: 0, fairy: 2 },
    ground: { fire: 2, electric: 2, grass: .5, poison: 2, flying: 0, bug: .5, rock: 2, steel: 2 },
    flying: { electric: .5, grass: 2, fighting: 2, bug: 2, rock: .5, steel: .5 },
    psychic: { fighting: 2, poison: 2, psychic: .5, dark: 0, steel: .5 },
    bug: { fire: .5, grass: 2, fighting: .5, poison: .5, flying: .5, psychic: 2, ghost: .5, dark: 2, steel: .5, fairy: .5 },
    rock: { fire: 2, ice: 2, fighting: .5, ground: .5, flying: 2, bug: 2, steel: .5 },
    ghost: { normal: 0, psychic: 2, ghost: 2, dark: .5 },
    dragon: { dragon: 2, steel: .5, fairy: 0 },
    dark: { fighting: .5, psychic: 2, ghost: 2, dark: .5, fairy: .5 },
    steel: { fire: .5, water: .5, electric: .5, ice: 2, rock: 2, steel: .5, fairy: 2 },
    fairy: { fire: .5, fighting: 2, poison: .5, dragon: 2, dark: 2, steel: .5 }
  };
  const COLORS = { normal: "#98958a", fire: "#e47755", water: "#5797d0", electric: "#d7b847", grass: "#6aac66", ice: "#78bfc4", fighting: "#b96f55", poison: "#a478bb", ground: "#b99461", flying: "#879dd3", psychic: "#d978a0", bug: "#8eae58", rock: "#a69272", ghost: "#7e73a4", dragon: "#727ac8", dark: "#696477", steel: "#879aaa",
   fairy: "#d68fbc" };
  const STRUGGLE = { id: "struggle", name: "발버둥", type: "Normal", category: "Physical", basePower: 50, accuracy: true, priority: 0, pp: 1 };
  const CHARGE_MOVES = new Set("solarbeam solarblade fly dig dive bounce phantomforce shadowforce geomancy skullbash skyattack skydrop meteorbeam electroshot razorwind freezeshock iceburn".split(" "));
  const RECHARGE_MOVES = new Set("hyperbeam gigaimpact blastburn frenzyplant hydrocannon roaroftime rockwrecker prismaticlaser eternabeam meteorassault".split(" "));
  const SELF_KO_MOVES = new Set("explosion selfdestruct mistyexplosion".split(" "));
  const PROTECT_MOVES = new Set("protect detect spikyshield banefulbunker kingsshield obstruct silktrap burningbulwark".split(" "));
  const idOf = (value) => String(value == null ? "" : value).toLowerCase().replace(/[^a-z0-9]/g, "");
  const clamp = (value, low, high) => Math.max(low, Math.min(high, Number.isFinite(Number(value)) ? Math.floor(Number(value)) : low));
  const readState = (value) => {
    if (value && typeof value === "object") return value;
    if (typeof value !== "string" || !value || value.indexOf("{{{") >= 0) return null;
    try { return JSON.parse(value); } catch (error) { /* encoded snapshot */ }
    try { return JSON.parse(decodeURIComponent(value)); } catch (error) { return null; }
  };

  const newest = (values) => values.filter((value) => value && typeof value === "object")
    .sort((a, b) => (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0))[0] || null;
  const unpackSync = (value) => {
    const data = readState(value);
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
        ...(row[17] ? { ability: row[17] } : {}), ...(row[18] ? { shiny: true } : {}) };
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
      STATS.map((key) => pokemon.evs && pokemon.evs[key] || 0), pokemon.maxHp, pokemon.moveNames, pokemon.inBox ? 1 : 0, pokemon.gender || "", pokemon.status || "", pokemon.heldItem || "", pokemon.ability || "",
      ...(pokemon.shiny ? [1] : [])]),
    a: state.activeUid || "", i: Object.fromEntries(Object.entries(bagState.items || {}).filter(([, count]) => Number(count) > 0)), m: bagState.money == null ? 0 : bagState.money,
    g: bagState.appliedGrants || [], k: bagState.items && bagState.items.keystone > 0 ? 1 : 0, x: state.expShare ? 1 : 0,
    t: Math.max(Number(state.updatedAt) || 0, Number(bagState.updatedAt) || 0) || Date.now()
  });
  const catalog = React.useMemo(() => {
    const packed = POKEMON_BATTLE_DATA;
    const typeNames = ["Normal","Fire","Water","Electric","Grass","Ice","Fighting","Poison","Ground","Flying","Psychic","Bug","Rock","Ghost","Dragon","Dark","Steel","Fairy"];
    const dex = {}, moves = {}, learnsets = {};
    packed.p.forEach((row, dexIndex) => {
      const stats = {};
      const yieldData = {};
      STATS.forEach((key, index) => { stats[key] = row[4][index]; yieldData[key] = row[8][index] || 0; });
      dex[row[0]] = { num: row[1], name: row[2], weightkg: POKEMON_WEIGHT_KG[row[1] - 1] || 50, types: row[3].map((index) => typeNames[index]),
        baseStats: stats, baseSpecies: row[5], spriteid: row[6], captureRate: row[7], evYield: yieldData,
        abilities: (POKEMON_ABILITY_ROWS[dexIndex] || []).map((index) => POKEMON_ABILITY_POOL[index - 1]) };
    });
    packed.m.forEach((row) => {
      moves[row[0]] = { id: row[0], name: row[1], type: typeNames[row[2]], category: row[3] === 0 ? "Physical" : row[3] === 1 ? "Special" : "Status",
        basePower: row[4], accuracy: row[5] === 101 ? true : row[5], pp: row[6], priority: row[7], effect: row[8] || null };
    });
    moves.powershift = { id: "powershift", name: "파워시프트", type: "Normal", category: "Status", basePower: 0, accuracy: true, pp: 10, priority: 0, effect: { target: "self" } };
    packed.l.forEach((row) => {
      const learned = {};
      row[1].forEach((entry) => { learned[packed.m[entry[0]][0]] = ["9L" + entry[1]]; });
      learnsets[packed.p[row[0]][0]] = { learnset: learned };
    });
    return { dex, moves, learnsets };
  }, []);
  const formKeyOf = (value) => String(value || "").normalize("NFKC").toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
  const speciesAliases = React.useMemo(() => {
    const aliases = {};
    const add = (label, id) => { const key = formKeyOf(label); if (key && !aliases[key]) aliases[key] = id; };
    Object.keys(catalog.dex).forEach((id) => {
      const entry = catalog.dex[id];
      if (!entry.baseSpecies || entry.num <= 0) return;
      const baseKo = POKEMON_PROGRESS_DATA.species[entry.num - 1] && POKEMON_PROGRESS_DATA.species[entry.num - 1][0];
      if (!baseKo) return;
      const suffix = entry.name.includes("-") ? entry.name.slice(entry.name.indexOf("-") + 1) : "";
      if (suffix) add(baseKo + suffix, id);
      const region = entry.name.match(/-(Alola|Galar|Hisui|Paldea)$/i);
      if (!region) return;
      const regionKo = { alola: "알로라", galar: "가라르", hisui: "히스이", paldea: "팔데아" }[region[1].toLowerCase()];
      add(regionKo + baseKo, id);
      add(regionKo + baseKo + "폼", id);
      add(baseKo + regionKo, id);
      add(baseKo + regionKo + "폼", id);
    });
    Object.entries(POKEMON_FORM_KO).forEach(([id, name]) => { if (catalog.dex[id]) add(name, id); });
    add("자시안 검왕", "zaciancrowned");
    add("검왕 자시안", "zaciancrowned");
    add("자시안 검왕폼", "zaciancrowned");
    add("자마젠타 방패왕", "zamazentacrowned");
    add("방패왕 자마젠타", "zamazentacrowned");
    add("자마젠타 방패왕폼", "zamazentacrowned");
    [["컴뱃종", "taurospaldeacombat"], ["블레이즈종", "taurospaldeablaze"], ["워터종", "taurospaldeaaqua"]]
      .forEach(([breed, id]) => {
        add("팔데아 켄타로스 " + breed, id);
        add("켄타로스 팔데아의 모습 " + breed, id);
      });
    add("가라르 불비달마 달마모드", "darmanitangalarzen");
    add("알로라 레트라 주인", "raticatealolatotem");
    add("알로라 텅구리 주인", "marowakalolatotem");
    return aliases;
  }, [catalog]);
  const resolveSpeciesId = (value) => {
    const raw = String(value == null ? "" : value).trim();
    const id = idOf(raw);
    if (catalog.dex[id]) return id;
    if (speciesAliases[formKeyOf(raw)]) return speciesAliases[formKeyOf(raw)];
    const number = /^\d+$/.test(id) ? Number(id) : POKEMON_PROGRESS_DATA.species.findIndex((row) => row[0] === raw) + 1;
    return number > 0 ? Object.keys(catalog.dex).find((key) => catalog.dex[key].num === number && !catalog.dex[key].baseSpecies) || id : id;
  };
  const [game, setGame] = React.useState(null);
  const currentOpponent = trainerParty && game ? trainerParty[game.foeIndex] || {} : encounter;
  const meta = game && catalog.dex[game.foe.species]
    ? { catchRate: currentOpponent.catchRate == null ? catalog.dex[game.foe.species].captureRate : clamp(currentOpponent.catchRate, 1, 255),
        evYield: currentOpponent.evYield || catalog.dex[game.foe.species].evYield, source: "static" }
    : null;
  const [menu, setMenu] = React.useState("main");
  const [showBattleLog, setShowBattleLog] = React.useState(false);
  const [megaReady, setMegaReady] = React.useState(false);
  const [megaAnim, setMegaAnim] = React.useState(null);
  const [bag, setBag] = React.useState(null);
  const [bagMeta, setBagMeta] = React.useState({ version: 1 });
  const [anim, setAnim] = React.useState(null);
  const [sendOut, setSendOut] = React.useState("");
  const [evoReady, setEvoReady] = React.useState(false);
  const evolutionEvent = game && (game.pendingEvolutions || [])[0];
  React.useEffect(() => {
    if (!game || wildEncounter || game.outcome) { setSendOut(""); return; }
    setSendOut("trainer");
    const throwTimer = setTimeout(() => setSendOut("throw"), 650);
    const revealTimer = setTimeout(() => setSendOut("reveal"), 1200);
    const doneTimer = setTimeout(() => setSendOut(""), 1650);
    return () => { clearTimeout(throwTimer); clearTimeout(revealTimer); clearTimeout(doneTimer); };
  }, [encounterKey, game && game.foeIndex]);
  React.useEffect(() => {
    setEvoReady(false);
    if (!evolutionEvent) return;
    const timer = setTimeout(() => setEvoReady(true), 2200);
    return () => clearTimeout(timer);
  }, [evolutionEvent && evolutionEvent.token]);
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const ITEM = {
    pokeball: { name: "몬스터볼", group: "ball", rate: 1 },
    greatball: { name: "슈퍼볼", group: "ball", rate: 1.5 },
    ultraball: { name: "하이퍼볼", group: "ball", rate: 2 },
    potion: { name: "상처약", group: "heal", amount: 20 },
    superpotion: { name: "좋은상처약", group: "heal", amount: 50 },
    revive: { name: "기력의조각", group: "revive" },
    maxpotion: { name: "풀회복약", group: "heal", amount: 9999 },
    fullheal: { name: "만병통치약", group: "cure" },
    antidote: { name: "해독제", group: "cure", status: "psn" },
    paralyzeheal: { name: "마비치료제", group: "cure", status: "par" },
    burnheal: { name: "화상치료제", group: "cure", status: "brn" },
    awakening: { name: "잠깨는약", group: "cure", status: "slp" },
    iceheal: { name: "얼음상태치료제", group: "cure", status: "frz" },
    fullrestore: { name: "회복약", group: "restore" },
    xattack: { name: "플러스파워", group: "boost", stat: "atk" },
    xdefense: { name: "디펜드업", group: "boost", stat: "def" },
    xspatk: { name: "스페셜업", group: "boost", stat: "spa" },
    xspdef: { name: "스페셜가드", group: "boost", stat: "spd" },
    xspeed: { name: "스피드업", group: "boost", stat: "spe" },
    xaccuracy: { name: "명중업", group: "boost", stat: "accuracy" },
  };
  const canUseBattleItem = (item, pokemon, next) => {
    if (!item || !pokemon) return false;
    if (pokemon.embargoUntil >= next.turn) return false;
    if (item.group === "boost") return pokemon.uid === next.activeUid && pokemon.hp > 0 &&
      ((pokemon.stages && pokemon.stages[item.stat]) || 0) < 6;
    if (item.group === "revive") return pokemon.hp === 0;
    if (pokemon.hp <= 0) return false;
    const injured = pokemon.hp < statOf(pokemon, "hp");
    const abnormal = !!pokemon.status && pokemon.status !== "NORMAL";
    return item.group === "heal" ? injured : item.group === "cure" ? abnormal && (!item.status || item.status === idOf(pokemon.status) || item.status === "psn" && idOf(pokemon.status) === "tox") :
      item.group === "restore" ? injured || abnormal : false;
  };
  const TYPE_FX = {"normal":"impact","fire":"fireball","water":"waterwisp","electric":"electroball","grass":"leaf1","ice":"iceball","fighting":"fist","poison":"purplewisp","ground":"mudwisp","flying":"feather","psychic":"mistball","bug":"web","rock":"rock3","ghost":"shadowball","dragon":"flareball","dark":"blackwisp","steel":"greenmetal1",
  "fairy":"rainbow"};
  const effectFor = (current) => POKEMON_MOVE_FX[current.moveId] || TYPE_FX[current.type] || "impact";
  const FX_SCENES = {
    tackle: ["hitmark", "impact"], scratch: ["leftslash", "rightslash"], slash: ["leftslash", "rightslash"],
    quickattack: ["wisp", "hitmark"], ember: ["fireball", "fireball", "shine"],
    flamethrower: ["fireball", "fireball", "shine"], watergun: ["waterwisp", "waterwisp", "impact"],
    thundershock: ["electroball", "electroball", "shine"], razorleaf: ["leaf1", "leaf2", "impact"],
    shadowball: ["shadowball", "shadowball", "impact"]
  };
  const effectLayers = (current) => FX_SCENES[current.moveId] ||
    (current.category === "Physical" ? [effectFor(current), "hitmark"] : [effectFor(current), effectFor(current), "impact"]);
  const normalBag = (source) => {
    const result = {};
    const names = Object.fromEntries(Object.keys(ITEM).map((id) => [ITEM[id].name.replace(/\s+/g, ""), id]));
    Object.keys(source || {}).forEach((label) => {
      const roman = idOf(label);
      const id = ITEM[roman] ? roman : names[String(label).replace(/\s+/g, "")] || roman || String(label).trim();
      if (id) result[id] = Math.max(result[id] || 0, clamp(source[label], 0, 999));
    });
    Object.keys(ITEM).forEach((id) => { if (result[id] == null) result[id] = 0; });
    return result;
  };
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const busy = React.useRef(false);
  const booted = React.useRef(false);

  const normalizedEvs = (source) => {
    const evs = {};
    let remaining = 510;
    STATS.forEach((key) => {
      evs[key] = Math.min(remaining, clamp(source && source[key], 0, 252));
      remaining -= evs[key];
    });
    return evs;
  };
  const statOf = (pokemon, key) => {
    const base = catalog.dex[pokemon.species].baseStats[key];
    const iv = pokemon.ivs[key];
    const ev = pokemon.evs[key];
    const core = Math.floor((2 * base + iv + Math.floor(ev / 4)) * pokemon.level / 100);
    if (key === "hp") return base === 1 ? 1 : core + pokemon.level + 10;
    const nature = NATURES[pokemon.nature];
    const multiplier = nature && nature[0] === key ? 1.1 : nature && nature[1] === key ? .9 : 1;
    return Math.floor((core + 5) * multiplier);
  };
  const autoMoves = (species, level) => {
    const dexEntry = catalog.dex[species];
    const fallbackId = idOf(dexEntry && dexEntry.baseSpecies);
    const learn = (catalog.learnsets[species] || catalog.learnsets[fallbackId] || {}).learnset || {};
    const learned = Object.keys(learn).map((moveId) => {
      const levels = (learn[moveId] || []).map((source) => {
        const match = String(source).match(/^(\d+)L(\d+)$/);
        return match ? { generation: Number(match[1]), level: Number(match[2]) } : null;
      }).filter(Boolean);
      if (!catalog.moves[moveId] || !levels.length) return null;
      const latest = Math.max(...levels.map((row) => row.generation));
      const eligible = levels.filter((row) => row.generation === latest && row.level <= level);
      if (!eligible.length) return null;
      return { id: moveId, level: Math.max(...eligible.map((row) => row.level)) };
    }).filter(Boolean).sort((a, b) => a.level - b.level || a.id.localeCompare(b.id));
    const selected = learned.slice(-4).map((row) => row.id);
    return selected.length ? selected : ["struggle"];
  };
  const progressOf = (pokemon) => POKEMON_PROGRESS_DATA.species[catalog.dex[pokemon.species].num - 1];
  const expAt = (pokemon, level) => POKEMON_PROGRESS_DATA.curves[progressOf(pokemon)[1]][Math.min(100, Math.max(1, level))] || 0;
  const localizedName = (pokemon) => {
    if (pokemon.species === "zaciancrowned") return "자시안(검왕)";
    if (pokemon.species === "zamazentacrowned") return "자마젠타(방패왕)";
    if (POKEMON_FORM_KO[pokemon.species]) return POKEMON_FORM_KO[pokemon.species];
    const entry = catalog.dex[pokemon.species];
    const baseName = progressOf(pokemon)[0];
    if (!entry || !entry.baseSpecies) return baseName;
    const suffix = entry.name.includes("-") ? entry.name.slice(entry.name.indexOf("-") + 1) : entry.name;
    return baseName + " (" + suffix + ")";
  };
  const syncMoveNames = (pokemon) => { pokemon.moveNames = pokemon.moves.map((id) => POKEMON_MOVE_KO[id] || POKEMON_STATUS_MOVE_KO[id] || POKEMON_EXTRA_MOVE_KO[id] || (catalog.moves[id] && catalog.moves[id].name) || id); };
  const makePokemon = (raw, uid, wild = false) => {
    const input = typeof raw === "string" ? { species: raw } : raw || {};
    const rawSpecies = String(input.species || input.id || input.dexNo || input.name || "").trim();
    const shinyPrefix = rawSpecies.match(/^(?:이로치|색이\s*다른|shiny)\s+(.+)$/i);
    const shinySuffix = rawSpecies.match(/^(.+?)\s*[\[(](?:이로치|shiny)[\])]$/i);
    const species = resolveSpeciesId(shinyPrefix ? shinyPrefix[1] : shinySuffix ? shinySuffix[1] : rawSpecies);
    const dexEntry = catalog.dex[species];
    if (!dexEntry || !dexEntry.baseStats || dexEntry.num <= 0) return null;
    const level = clamp(input.level == null ? 5 : input.level, 1, 100);
    const ivs = {};
    STATS.forEach((key) => {
      ivs[key] = input.ivs && input.ivs[key] != null
        ? clamp(input.ivs[key], 0, 31)
        : wild ? Math.floor(Math.random() * 32) : NEUTRAL_IVS[key];
    });
    const evs = normalizedEvs(input.evs);
    const nature = NATURE_LIST.includes(input.nature) ? input.nature
      : wild ? NATURE_LIST[Math.floor(Math.random() * NATURE_LIST.length)] : "Hardy";
    const requested = Array.isArray(input.moves) ? input.moves.map(idOf).filter((moveId) => catalog.moves[moveId]) : [];
    const moves = [...new Set(requested)].slice(0, 4);
    autoMoves(species, level).forEach((id) => { if (moves.length < 4 && !moves.includes(id)) moves.push(id); });
    const pokemon = {
      uid: String(input.uid || uid), species, level,
      nickname: input.nickname && input.nickname !== dexEntry.name && input.nickname !== POKEMON_PROGRESS_DATA.species[dexEntry.num - 1][0] ? String(input.nickname) : localizedName({ species }),
      speciesNameKo: localizedName({ species }), nature, ivs, evs, moves, inBox: !!input.inBox, gender: input.gender || "", status: input.status || "NORMAL", heldItem: idOf(input.heldItem || input.item || ""),
      ability: dexEntry.abilities.includes(idOf(input.ability)) ? idOf(input.ability) : dexEntry.abilities[0] || "",
      shiny: input.shiny == null
        ? !!(shinyPrefix || shinySuffix) || wild && wildEncounter && Math.random() < 1 / 4096
        : input.shiny === true || input.shiny === 1 || input.shiny === "true",
      formAtTurn: input.formAtTurn && typeof input.formAtTurn === "object" ? input.formAtTurn : null
    };
    const floorExp = expAt(pokemon, level);
    const ceilingExp = level < 100 ? expAt(pokemon, level + 1) - 1 : floorExp;
    pokemon.exp = input.exp == null ? floorExp : clamp(input.exp, floorExp, Math.max(floorExp, ceilingExp));
    pokemon.expFloor = floorExp;
    pokemon.nextExp = level < 100 ? expAt(pokemon, level + 1) : floorExp;
    pokemon.pp = moves.map((moveId, index) => {
      const max = catalog.moves[moveId] ? catalog.moves[moveId].pp : 1;
      return Array.isArray(input.pp) && input.pp[index] != null ? clamp(input.pp[index], 0, max) : max;
    });
    const maxHp = statOf(pokemon, "hp");
    pokemon.hp = input.hp == null ? maxHp : clamp(input.hp, 0, maxHp);
    pokemon.maxHp = maxHp;
    pokemon.spriteId = String(dexEntry.spriteid || dexEntry.name || species).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9-]/g, "");
    syncMoveNames(pokemon);
    return pokemon;
  };
  const crownOpponent = (pokemon, target) => {
    const oldName = pokemon.speciesNameKo;
    const oldMax = pokemon.maxHp;
    pokemon.species = target;
    pokemon.speciesNameKo = localizedName(pokemon);
    if (pokemon.nickname === oldName) pokemon.nickname = pokemon.speciesNameKo;
    pokemon.maxHp = statOf(pokemon, "hp");
    pokemon.hp = Math.min(pokemon.maxHp, Math.max(0, pokemon.hp + pokemon.maxHp - oldMax));
    const entry = catalog.dex[target];
    pokemon.spriteId = String(entry.spriteid || entry.name || target).toLowerCase().replace(/[^a-z0-9-]/g, "");
    pokemon.ability = entry.abilities[0] || pokemon.ability;
    const oldMove = pokemon.moves.indexOf("ironhead");
    const newMove = target === "zaciancrowned" ? "behemothblade" : "behemothbash";
    if (oldMove >= 0 && catalog.moves[newMove]) {
      pokemon.moves[oldMove] = newMove;
      pokemon.pp[oldMove] = catalog.moves[newMove].pp;
      syncMoveNames(pokemon);
    }
  };

  React.useEffect(() => {
    if (!catalog || !encounter.species) return;
    if (booted.current === encounterKey) return;
    booted.current = encounterKey;
    setError("");
    const direct = unpackSync(sync);
    const templateState = readState("{{{POKEMON_STATE}}}");
    const templateBag = readState("{{{POKEMON_BAG}}}");
    const statusState = typeof PokemonStatusBW !== "undefined" ? PokemonStatusBW.runtimeState : null;
    const statusBag = typeof PokemonStatusBW !== "undefined" ? PokemonStatusBW.runtimeBag : null;
    const saved = newest([statusState, PokemonBattle.runtimeState, templateState, readState(stateText), direct && direct.state]);
    const expShareSource = newest([statusState, PokemonBattle.runtimeState, templateState, readState(stateText), direct && direct.state]
      .filter((state) => state && state.expShare != null));
    const savedBag = newest([statusBag, PokemonBattle.runtimeBag, templateBag, readState(bagText), direct && direct.bag]);
    const startingBag = normalBag(savedBag && (savedBag.items || savedBag) || initialBag);
    if ([statusBag, PokemonBattle.runtimeBag, templateBag, readState(bagText), direct && direct.bag]
      .some((source) => source && (source.items || source).keystone > 0)) startingBag.keystone = 1;
    setBag(startingBag);
    setBagMeta(savedBag && typeof savedBag === "object" ? savedBag : { version: 1 });
    if (!savedBag && typeof setTemplateValue === "function") {
      try { setTemplateValue("POKEMON_BAG", encodeURIComponent(JSON.stringify({ version: 1, items: startingBag }))); } catch (ignore) { /* bagText can restore it */ }
    }
    const source = saved && Array.isArray(saved.owned) && saved.owned.length ? saved.owned : initialParty;
    const owned = (Array.isArray(source) ? source : []).map((raw, index) => makePokemon(raw, "starter-" + index)).filter(Boolean);
    if (healBefore) owned.forEach((pokemon) => {
      pokemon.hp = statOf(pokemon, "hp");
      pokemon.pp = pokemon.moves.map((moveId) => catalog.moves[moveId] ? catalog.moves[moveId].pp : 1);
    });
    const opponents = trainerParty || [encounter];
    const foes = opponents.map((raw, index) => makePokemon(raw, "opponent-" + index, true));
    const invalidIndex = foes.findIndex((foe) => !foe);
    if (!foes.length || invalidIndex >= 0) {
      const raw = opponents[invalidIndex < 0 ? 0 : invalidIndex];
      const species = raw && typeof raw === "object" ? raw.species || raw.id || raw.name : raw;
      setError(!foes.length ? "트레이너 파티에 포켓몬이 없습니다." :
        (trainerParty ? "상대 파티 " + (invalidIndex + 1) + "번째 포켓몬" : "조우한 포켓몬") +
        "의 Showdown 도감 ID를 확인해 주세요: " + String(species || ""));
      return;
    }
    if (!wildEncounter) {
      foes.forEach((pokemon, index) => {
        const raw = opponents[index] && typeof opponents[index] === "object" ? opponents[index] : {};
        const crown = pokemon.species === "zacian" || pokemon.species === "zaciancrowned"
          ? ["rustedsword", "zaciancrowned"] : pokemon.species === "zamazenta" || pokemon.species === "zamazentacrowned"
          ? ["rustedshield", "zamazentacrowned"] : null;
        if (!crown) return;
        if (!pokemon.heldItem && raw.crowned !== false) pokemon.heldItem = crown[0];
        if (pokemon.heldItem === crown[0]) crownOpponent(pokemon, crown[1]);
      });
      const highLevel = foes.some((pokemon) => pokemon.level >= 50);
      const explicitMega = opponents.findIndex((raw) => raw && typeof raw === "object" && raw.mega === true);
      const allowMega = encounter.mega !== false &&
        (explicitMega >= 0 || encounter.mega === true || namedTrainer || highLevel);
      const megaFor = (index) => {
        const pokemon = foes[index];
        const raw = opponents[index] && typeof opponents[index] === "object" ? opponents[index] : {};
        if (!pokemon || raw.mega === false) return null;
        const wanted = resolveSpeciesId(raw.megaForm || encounter.megaForm || "");
        return POKEMON_BATTLE_MEGA_DATA.find(([base, stone, form, move]) => base === pokemon.species &&
          catalog.dex[form] && (!wanted || wanted === form) &&
          (stone ? !pokemon.heldItem || pokemon.heldItem === stone : pokemon.moves.includes(move)));
      };
      if (allowMega) {
        const chosen = Number.isInteger(Number(encounter.megaIndex)) && encounter.megaIndex !== "" ? Number(encounter.megaIndex) : explicitMega;
        let megaIndex = chosen >= 0 && chosen < foes.length && megaFor(chosen) ? chosen : -1;
        if (megaIndex < 0 && chosen < 0) for (let index = foes.length - 1; index >= 0; index--) {
          if (megaFor(index)) { megaIndex = index; break; }
        }
        if (megaIndex >= 0) {
          const pokemon = foes[megaIndex];
          const raw = opponents[megaIndex] && typeof opponents[megaIndex] === "object" ? opponents[megaIndex] : {};
          const option = megaFor(megaIndex);
          if (option[1]) pokemon.heldItem = option[1];
          pokemon.npcMega = true;
          pokemon.megaAtTurn = clamp(raw.megaAtTurn == null ? encounter.megaAtTurn == null ? 1 : encounter.megaAtTurn : raw.megaAtTurn, 1, 100);
        }
      }
    }
    const foe = foes[0];
    const active = owned.find((pokemon) => pokemon.uid === (saved && saved.activeUid) && !pokemon.inBox && pokemon.hp > 0) || owned.find((pokemon) => !pokemon.inBox && pokemon.hp > 0);
    const foeLabel = foe.shiny ? "색이 다른 " + foe.nickname : foe.nickname;
    const opening = trainerName ? trainerName + "가 " + foeLabel + "을(를) 내보냈다!" : foeLabel + "이(가) 나타났다!";
    foe.enteredTurn = 1;
    if (active) active.enteredTurn = 1;
    const openingGame = { owned, foe, foes, foeIndex: 0, activeUid: active ? active.uid : "", expShare: !!(saved && saved.expShare != null ? saved.expShare : expShareSource && expShareSource.expShare), pendingSwitch: false, participants: active ? [active.uid] : [], expGains: [], pendingLearn: [], pendingEvolutions: [], resultSent: false, rewardApplied: false, rewardMoney: 0, payDayMoney: 0, payDayApplied: false, megaUsed: false, foeMegaUsed: false, turn: 1, outcome: "", log: [opening], battleLog: [{ turn: 1, text: opening }], field: { own: {}, foe: {}, weather: "", weatherUntil: 0, trickRoomUntil: 0 } };
    enterAbility(openingGame, foe, "foe");
    if (active) enterAbility(openingGame, active, "own");
    setGame(openingGame);
    PokemonBattle.runtimeState = { version: 1, owned, activeUid: active ? active.uid : "", expShare: openingGame.expShare, updatedAt: Number(saved && saved.updatedAt) || Date.now() };
    PokemonBattle.runtimeBag = { ...(savedBag || { version: 1 }), items: startingBag, updatedAt: Number(savedBag && savedBag.updatedAt) || Date.now() };
    if (owned.length && (!templateState || direct || Number(PokemonBattle.runtimeState.updatedAt) > Number(templateState.updatedAt || 0)) && typeof setTemplateValue === "function") {
      try { setTemplateValue("POKEMON_STATE", encodeURIComponent(JSON.stringify(PokemonBattle.runtimeState))); } catch (ignore) { /* stateText remains available */ }
    }
  }, [catalog, encounterKey]);

  const info = (pokemon) => catalog.dex[pokemon.species];
  const moveInfo = (id) => catalog.moves[id] || STRUGGLE;
  const moveName = (id) => POKEMON_MOVE_KO[id] || POKEMON_STATUS_MOVE_KO[id] || POKEMON_EXTRA_MOVE_KO[id] || moveInfo(id).name;
  const activeOf = (next) => next.owned.find((pokemon) => pokemon.uid === next.activeUid);
  const addLog = (next, message) => {
    next.log = [...next.log.slice(-6), message];
    next.battleLog = [...(next.battleLog || []).slice(-149), { turn: next.turn, text: message }];
  };
  const abilityName = (pokemon) => POKEMON_ABILITY_KO[pokemon.ability] || pokemon.ability || "특성 없음";
  const enterAbility = (next, pokemon, side) => {
    if (!pokemon || pokemon.hp <= 0) return;
    const other = side === "own" ? next.foe : next.owned.find((row) => row.uid === next.activeUid);
    const ability = pokemon.ability;
    const weather = { drizzle: "raindance", drought: "sunnyday", sandstream: "sandstorm", snowwarning: "hail", orichalcumpulse: "sunnyday" }[ability];
    if (weather) {
      next.field.weather = weather;
      next.field.weatherUntil = next.turn + 4;
      addLog(next, pokemon.nickname + "의 " + abilityName(pokemon) + "! 날씨가 바뀌었다!");
    }
    const terrain = { electricsurge: "electricterrain", grassysurge: "grassyterrain", mistysurge: "mistyterrain", psychicsurge: "psychicterrain", hadronengine: "electricterrain" }[ability];
    if (terrain) {
      next.field.terrain = terrain;
      next.field.terrainUntil = next.turn + 4;
      addLog(next, pokemon.nickname + "의 " + abilityName(pokemon) + "! 필드가 바뀌었다!");
    }
    if (ability === "intimidate" && other && other.hp > 0) {
      addLog(next, pokemon.nickname + "의 위협!");
      boostStages(next, other, { atk: -1 });
    }
    if (ability === "download" && other && other.hp > 0) {
      const key = statOf(other, "def") <= statOf(other, "spd") ? "atk" : "spa";
      boostStages(next, pokemon, { [key]: 1 }, false);
    }
    if (ability === "intrepidsword" && !pokemon.swordBoostUsed) {
      pokemon.swordBoostUsed = true;
      addLog(next, pokemon.nickname + "의 " + abilityName(pokemon) + "!");
      boostStages(next, pokemon, { atk: 1 }, false);
    }
    if (ability === "dauntlessshield" && !pokemon.shieldBoostUsed) {
      pokemon.shieldBoostUsed = true;
      addLog(next, pokemon.nickname + "의 " + abilityName(pokemon) + "!");
      boostStages(next, pokemon, { def: 1 }, false);
    }
    if (ability === "supersweetsyrup" && !pokemon.syrupTriggered && other && other.hp > 0) {
      pokemon.syrupTriggered = true;
      addLog(next, pokemon.nickname + "의 " + abilityName(pokemon) + "!");
      if (!other.substituteHp) boostStages(next, other, { evasion: -1 });
    }
  };
  const cloneGame = () => ({
    ...game,
    owned: game.owned.map((pokemon) => ({ ...pokemon, moves: [...pokemon.moves], pp: [...pokemon.pp], evs: { ...pokemon.evs }, stages: { ...pokemon.stages } })),
    foe: { ...game.foe, pp: [...game.foe.pp], stages: { ...game.foe.stages } },
    foes: game.foes.map((pokemon) => ({ ...pokemon, pp: [...pokemon.pp] })),
    log: [...game.log], battleLog: [...(game.battleLog || [])],
    field: { ...game.field, own: { ...(game.field && game.field.own) }, foe: { ...(game.field && game.field.foe) } },
    participants: [...(game.participants || [])], expGains: [...(game.expGains || [])],
    pendingLearn: [...(game.pendingLearn || [])], pendingEvolutions: [...(game.pendingEvolutions || [])]
  });
  const showBattleFrame = (next) => setGame({ ...next,
    owned: next.owned.map((pokemon) => ({ ...pokemon })), foe: { ...next.foe },
    log: [...next.log], battleLog: [...next.battleLog] });
  const FORM_BASES = "aegislash arceus calyrex castform cherrim cramorant darmanitan deoxys dialga eiscue genesect giratina hoopa keldeo kyurem meloetta minior morpeko necrozma ogerpon palafin palkia rotom shaymin silvally terapagos urshifu wishiwashi zacian zamazenta zygarde".split(" ");
  const formBase = (pokemon) => {
    const entry = catalog.dex[pokemon.species];
    return entry && entry.baseSpecies ? idOf(entry.baseSpecies) : pokemon.species;
  };
  const formOptions = (pokemon) => {
    if (!pokemon || pokemon.megaBase) return [];
    const base = formBase(pokemon);
    if (!FORM_BASES.includes(base)) return [];
    return Object.keys(catalog.dex).filter((id) => {
      const entry = catalog.dex[id];
      return (id === base || idOf(entry.baseSpecies) === base) &&
        (id !== "zaciancrowned" || pokemon.heldItem === "rustedsword") &&
        (id !== "zamazentacrowned" || pokemon.heldItem === "rustedshield") &&
        !/(mega|gmax|totem|alola|galar|hisui|paldea|primal|eternamax)/.test(id);
    });
  };
  const showForm = (next) => setGame({ ...next,
    owned: next.owned.map((pokemon) => ({ ...pokemon })), foe: { ...next.foe } });
  const changeForm = async (next, pokemon, targetId, side, mega = false) => {
    if (!catalog.dex[targetId] || pokemon.species === targetId) return false;
    if (!mega && !formOptions(pokemon).includes(targetId)) return false;
    const fromSpecies = pokemon.species;
    const fromName = pokemon.nickname;
    const oldSpeciesName = pokemon.speciesNameKo;
    const oldMax = statOf(pokemon, "hp");
    pokemon.species = targetId;
    pokemon.speciesNameKo = localizedName(pokemon);
    if (pokemon.nickname === oldSpeciesName) pokemon.nickname = pokemon.speciesNameKo;
    pokemon.maxHp = statOf(pokemon, "hp");
    pokemon.hp = Math.min(pokemon.maxHp, Math.max(0, pokemon.hp + pokemon.maxHp - oldMax));
    const entry = catalog.dex[targetId];
    pokemon.spriteId = String(entry.spriteid || entry.name || targetId).toLowerCase().replace(/[^a-z0-9-]/g, "");
    pokemon.ability = entry.abilities[0] || pokemon.ability;
    addLog(next, fromName + "이(가) " + pokemon.speciesNameKo + "(으)로 " + (mega ? "메가진화했다!" : "폼체인지했다!"));
    showForm(next);
    setMegaAnim({ kind: mega ? "mega" : "form", side, fromSpecies, toSpecies: targetId, shiny: !!pokemon.shiny,
      fromName, toName: pokemon.nickname, token: Date.now() + Math.random() });
    await delay(mega ? 1600 : 1200);
    setMegaAnim(null);
    return true;
  };
  const scheduledFoeForm = async (next) => {
    const schedule = next.foe && next.foe.formAtTurn;
    const target = schedule && resolveSpeciesId(schedule[next.turn]);
    if (target && target !== next.foe.species) await changeForm(next, next.foe, target, "foe");
  };
  const moveForm = async (next, pokemon, side, moveId) => {
    const base = formBase(pokemon);
    const target = base === "aegislash" ? moveId === "kingsshield" ? "aegislash" : moveInfo(moveId).category === "Status" ? "" : "aegislashblade"
      : base === "meloetta" && moveId === "relicsong" ? pokemon.species === "meloettapirouette" ? "meloetta" : "meloettapirouette" : "";
    if (target && pokemon.species !== target) await changeForm(next, pokemon, target, side);
  };
  const megaAvailability = (pokemon, next) => {
    if (!pokemon || pokemon.hp <= 0) return { option: null, reason: "출전 가능한 포켓몬 없음" };
    if (pokemon.megaBase || next.megaUsed) return { option: null, reason: "이번 배틀에서 이미 사용함" };
    const options = POKEMON_BATTLE_MEGA_DATA.filter(([base, , form]) =>
      base === pokemon.species && catalog.dex[form]);
    if (!options.length) return { option: null, reason: "이 포켓몬의 메가진화 형태 없음" };
    const statusBag = typeof PokemonStatusBW !== "undefined" ? PokemonStatusBW.runtimeBag : null;
    const latestBag = newest([statusBag, bagMeta]);
    const availableBag = latestBag && latestBag.items ? latestBag.items : bag;
    if (!(availableBag && availableBag.keystone > 0 || bag && bag.keystone > 0)) return { option: null, reason: "키스톤 필요" };
    const option = options.find(([, stone, , move]) =>
      stone ? pokemon.heldItem === stone : move && pokemon.moves.includes(move));
    return option ? { option, reason: "" } :
      { option: null, reason: options.some(([, stone]) => !!stone) ? "맞는 메가스톤을 지니게 하세요" : "필요한 기술을 배우게 하세요" };
  };
  const megaOption = (pokemon, next) => megaAvailability(pokemon, next).option;
  const baseForm = (pokemon) => {
    if (!pokemon.megaBase) return pokemon;
    const { megaBase, megaBeforeName, megaBeforeNickname, megaBeforeSpriteId, megaBeforeAbility, ...rest } = pokemon;
    const reverted = { ...rest, species: megaBase, speciesNameKo: megaBeforeName,
      nickname: megaBeforeNickname, spriteId: megaBeforeSpriteId, ability: megaBeforeAbility || (catalog.dex[megaBase].abilities || [])[0] || "" };
    const priorMax = Number(pokemon.maxHp) || statOf(pokemon, "hp");
    reverted.maxHp = statOf(reverted, "hp");
    reverted.hp = pokemon.hp <= 0 ? 0 : Math.max(1, Math.min(reverted.maxHp,
      pokemon.hp + reverted.maxHp - priorMax));
    return reverted;
  };
  const megaEvolve = async (next, pokemon, option, side = "own") => {
    pokemon.megaBase = pokemon.species;
    pokemon.megaBeforeName = pokemon.speciesNameKo;
    pokemon.megaBeforeNickname = pokemon.nickname;
    pokemon.megaBeforeSpriteId = pokemon.spriteId;
    pokemon.megaBeforeAbility = pokemon.ability;
    if (side === "foe") next.foeMegaUsed = true; else next.megaUsed = true;
    await changeForm(next, pokemon, option[2], side, true);
    enterAbility(next, pokemon, side);
  };
  const maybeFoeMega = async (next) => {
    const pokemon = next.foe;
    if (wildEncounter || !pokemon || !pokemon.npcMega || next.foeMegaUsed || pokemon.hp <= 0 ||
      next.turn < pokemon.megaAtTurn) return;
    const option = POKEMON_BATTLE_MEGA_DATA.find(([base, stone, form, move]) =>
      base === pokemon.species && catalog.dex[form] &&
      (stone ? pokemon.heldItem === stone : pokemon.moves.includes(move)));
    if (option) await megaEvolve(next, pokemon, option, "foe");
  };
  const effectiveness = (moveType, target) => {
    const row = TYPE[idOf(moveType)] || {};
    const value = (target.battleTypes || info(target).types).reduce((value, type) => value * (row[idOf(type)] == null ? 1 : row[idOf(type)]), 1);
    return target.identified && value === 0 && ["normal", "fighting", "psychic"].includes(idOf(moveType)) ? 1 : value;
  };
  const stageFactor = (stage, accuracy = false) => {
    const base = accuracy ? 3 : 2;
    return stage >= 0 ? (base + stage) / base : base / (base - stage);
  };
  const combatStat = (pokemon, key, weather = "", ignoreStages = false) => {
    const stage = ignoreStages ? 0 : (pokemon.stages && pokemon.stages[key]) || 0;
    const status = String(pokemon.status || "").toLowerCase();
    const ability = pokemon.ability;
    const penalty = key === "spe" && status === "par" ? .5 : key === "atk" && status === "brn" && ability !== "guts" ? .5 : 1;
    let multiplier = 1;
    if (key === "atk" && (ability === "hugepower" || ability === "purepower")) multiplier *= 2;
    if (key === "atk" && status !== "normal" && ability === "guts") multiplier *= 1.5;
    if (key === "atk" && ability === "hustle") multiplier *= 1.5;
    if (key === "spa" && ability === "solarpower" && weather === "sunnyday") multiplier *= 1.5;
    if (key === "def" && status !== "normal" && ability === "marvelscale") multiplier *= 1.5;
    if (key === "spe" && (ability === "swiftswim" && weather === "raindance" || ability === "chlorophyll" && weather === "sunnyday" || ability === "sandrush" && weather === "sandstorm" || ability === "slushrush" && weather === "hail")) multiplier *= 2;
    const raw = (pokemon.splitStats && pokemon.splitStats[key]) || (key === "spe" && pokemon.speedSwap) || (pokemon.powerTrick && key === "atk" ? statOf(pokemon, "def") : pokemon.powerTrick && key === "def" ? statOf(pokemon, "atk") : statOf(pokemon, key));
    return Math.max(1, Math.floor(raw * stageFactor(stage) * penalty * multiplier));
  };
  const damageOf = (next, attacker, defender, move) => {
    const physical = move.category === "Physical";
    const weather = idOf(next.field.weather);
    const defenseAbility = ["moldbreaker", "teravolt", "turboblaze"].includes(attacker.ability) ? "" : defender.ability;
    const moveId = idOf(move.id || move.name);
    const attackSource = moveId === "foulplay" ? defender : attacker;
    const attackKey = moveId === "bodypress" ? "def" : physical ? "atk" : "spa";
    const attack = combatStat(attackSource, attackKey, weather, defenseAbility === "unaware");
    const sandSpd = !physical && weather === "sandstorm" && info(defender).types.some((type) => idOf(type) === "rock") ? 1.5 : 1;
    const defenseBoost = physical && defenseAbility === "furcoat" || !physical && defenseAbility === "icescales" ? 2 : 1;
    const defenseKey = physical || ["psyshock", "psystrike", "secretsword", "shellsidearm"].includes(moveId) ? "def" : "spd";
    const ignoreDefenderStages = attacker.ability === "unaware" || ["sacredsword", "darkestlariat", "chipaway"].includes(moveId);
    const defense = Math.max(1, Math.floor(combatStat(defender, defenseKey, weather, ignoreDefenderStages) * sandSpd * defenseBoost));
    const base = Math.floor(Math.floor((Math.floor(2 * attacker.level / 5) + 2) * move.basePower * attack / defense) / 50) + 2;
    const type = idOf(move.type);
    const stab = move.name === "발버둥" ? 1 : (attacker.battleTypes || info(attacker).types).some((item) => idOf(item) === type) ? attacker.ability === "adaptability" ? 2 : 1.5 : 1;
    let effect = effectiveness(type, defender);
    if (moveId === "freezedry" && info(defender).types.some((item) => idOf(item) === "water")) effect *= 4;
    if (moveId === "flyingpress") effect *= effectiveness("flying", defender);
    if (moveId === "thousandarrows" && effect === 0 && info(defender).types.some((item) => idOf(item) === "flying")) {
      const grounded = { ...defender, battleTypes: (defender.battleTypes || info(defender).types).filter((item) => idOf(item) !== "flying") };
      effect = effectiveness("ground", grounded);
    }
    if (attacker.ability === "scrappy" && (type === "normal" || type === "fighting") && info(defender).types.some((item) => idOf(item) === "ghost")) effect = Math.max(1, effect);
    if (defenseAbility === "wonderguard" && effect <= 1) effect = 0;
    const weatherPower = weather === "raindance" ? type === "water" ? 1.5 : type === "fire" ? .5 : 1
      : weather === "sunnyday" ? type === "fire" ? 1.5 : type === "water" ? .5 : 1 : 1;
    const random = (85 + Math.floor(Math.random() * 16)) / 100;
    const critical = ["stormthrow", "frostbreath", "flowertrick", "wickedblow", "surgingstrikes"].includes(moveId) || attacker.focusedUntil >= next.turn || Math.random() < 1 / 24 ? 1.5 : 1;
    const held = attacker.embargoUntil >= next.turn ? "" : attacker.heldItem;
    const itemPower = held === "muscleband" && physical || held === "wiseglasses" && !physical ? 1.1
      : held === "expertbelt" && effect > 1 ? 1.2 : 1;
    let abilityPower = 1;
    if (["overgrow", "blaze", "torrent", "swarm"].some((id, index) => attacker.ability === id && type === ["grass", "fire", "water", "bug"][index]) && attacker.hp * 3 <= statOf(attacker, "hp")) abilityPower *= 1.5;
    if (attacker.ability === "technician" && move.basePower <= 60) abilityPower *= 1.5;
    if (attacker.ability === "tintedlens" && effect > 0 && effect < 1) abilityPower *= 2;
    if (attacker.ability === "sheerforce" && POKEMON_DAMAGE_EFFECTS[moveId]?.x?.length) abilityPower *= 1.3;
    if (attacker.ability === "ironfist" && moveId.includes("punch")) abilityPower *= 1.2;
    if (attacker.ability === "strongjaw" && /(bite|fang|crunch|jaw)/.test(moveId)) abilityPower *= 1.5;
    if (attacker.ability === "sharpness" && /(slash|cut|blade|scythe|sacredsword)/.test(moveId)) abilityPower *= 1.5;
    if (attacker.ability === "waterbubble" && type === "water") abilityPower *= 2;
    if (attacker.ability === "orichalcumpulse" && physical && weather === "sunnyday") abilityPower *= 4 / 3;
    if (attacker.ability === "hadronengine" && !physical && next.field.terrain === "electricterrain") abilityPower *= 4 / 3;
    if (attacker.ability === "flashfire" && attacker.flashFire && type === "fire") abilityPower *= 1.5;
    if (defenseAbility === "thickfat" && (type === "fire" || type === "ice") || defenseAbility === "waterbubble" && type === "fire") abilityPower *= .5;
    if (defenseAbility === "multiscale" && defender.hp >= statOf(defender, "hp")) abilityPower *= .5;
    if (defender.tarShot && type === "fire") abilityPower *= 2;
    if (attacker.chargeUntil >= next.turn && type === "electric") abilityPower *= 2;
    if (["filter", "solidrock", "prismarmor"].includes(defenseAbility) && effect > 1) abilityPower *= .75;
    const sport = next.field.watersportUntil >= next.turn && type === "fire" || next.field.mudsportUntil >= next.turn && type === "electric" ? 1 / 3 : 1;
    const solarPenalty = ["solarbeam", "solarblade"].includes(moveId) && weather && weather !== "sunnyday" ? .5 : 1;
    return { damage: effect === 0 ? 0 : Math.max(1, Math.floor(base * stab * effect * random * critical * itemPower * weatherPower * abilityPower * sport * solarPenalty)), effect };
  };
  const enemySlot = (next) => {
    if (next.foe.chargingMove) return next.foe.chargingSlot;
    if (next.foe.rechargeUntil >= next.turn) return next.foe.pp.findIndex((pp) => pp > 0);
    const slots = next.foe.pp.map((pp, index) => pp > 0 ? index : -1).filter((index) => index >= 0);
    if (!slots.length) return -1;
    const target = activeOf(next);
    if (!target || wildEncounter && Math.random() < .5) return slots[Math.floor(Math.random() * slots.length)];
    const foe = next.foe;
    const foeFull = statOf(foe, "hp");
    const targetStatus = idOf(target.status || "normal");
    const scored = slots.map((index) => {
      const move = moveInfo(foe.moves[index]);
      const effect = move.effect || {};
      let score = 0;
      if (move.category !== "Status") {
        const matchup = effectiveness(move.type, target);
        score = matchup ? Math.max(1, Number(move.basePower) || 35) * matchup * (Number(move.accuracy) || 100) / 100 : -80;
        if ((foe.battleTypes || info(foe).types).some((type) => idOf(type) === idOf(move.type))) score *= 1.3;
      } else if (effect.heal || ["recover", "roost", "synthesis", "moonlight", "morningsun", "rest", "slackoff"].includes(move.id)) {
        score = foe.hp < foeFull / 3 ? 100 : foe.hp < foeFull * .7 ? 55 : -60;
      } else if (effect.status) score = targetStatus === "normal" ? 60 : -60;
      else if (effect.boosts || effect.selfBoosts) {
        const self = ["self", "allies", "allySide"].includes(effect.target);
        const stages = self ? foe.stages || {} : target.stages || {};
        const boosts = effect.selfBoosts || effect.boosts || {};
        const useful = Object.entries(boosts).some(([key, amount]) => amount > 0 ? (stages[key] || 0) < 6 : (stages[key] || 0) > -6);
        score = useful ? next.turn <= 3 ? 55 : 30 : -60;
      } else if (effect.weather || effect.sideCondition || effect.volatileStatus) score = 22;
      if (move.category === "Status" && foe.lastMove === move.id) score -= 40;
      if (["fakeout", "firstimpression"].includes(move.id) && foe.enteredTurn !== next.turn) score -= 150;
      if (move.id === "poltergeist" && !target.heldItem) score -= 150;
      if (move.id === "noretreat" && foe.noRetreat) score -= 150;
      return { index, score: score + Math.random() * (namedTrainer ? 12 : 40) };
    });
    scored.sort((left, right) => right.score - left.score);
    return scored[0].index;
  };
  const awardEvs = (pokemon) => {
    const yieldData = meta && meta.evYield || {};
    let remaining = 510 - STATS.reduce((sum, key) => sum + pokemon.evs[key], 0);
    STATS.forEach((key) => {
      const gain = Math.min(remaining, 252 - pokemon.evs[key], clamp(yieldData[key], 0, 3));
      pokemon.evs[key] += gain;
      remaining -= gain;
    });
    pokemon.maxHp = statOf(pokemon, "hp");
    pokemon.hp = Math.min(pokemon.hp, pokemon.maxHp);
  };
  const evolveAtLevel = (next, pokemon) => {
    const candidates = progressOf(pokemon)[3] || [];
    const choice = candidates.find(([num, required]) => pokemon.level >= required &&
      Object.values(catalog.dex).some((entry) => entry.num === num && !entry.baseSpecies));
    if (!choice) return;
    const oldName = pokemon.speciesNameKo;
    const fromSpecies = pokemon.species;
    const entry = Object.entries(catalog.dex).find(([, value]) => value.num === choice[0] && !value.baseSpecies);
    if (!entry) return;
    const oldMax = statOf(pokemon, "hp");
    pokemon.species = entry[0];
    pokemon.ability = (entry[1].abilities || [])[0] || pokemon.ability;
    pokemon.speciesNameKo = localizedName(pokemon);
    if (pokemon.nickname === oldName) pokemon.nickname = pokemon.speciesNameKo;
    pokemon.maxHp = statOf(pokemon, "hp");
    pokemon.hp = Math.min(pokemon.maxHp, pokemon.hp + pokemon.maxHp - oldMax);
    pokemon.spriteId = String(entry[1].spriteid || entry[1].name || entry[0]).toLowerCase().replace(/[^a-z0-9-]/g, "");
    addLog(next, oldName + "이(가) " + pokemon.speciesNameKo + "(으)로 진화했다!");
    next.pendingEvolutions.push({ uid: pokemon.uid, fromSpecies, toSpecies: pokemon.species, shiny: !!pokemon.shiny,
      fromName: oldName, toName: pokemon.speciesNameKo, token: pokemon.uid + "-" + pokemon.level + "-" + pokemon.species });
  };
  const awardExperience = (next) => {
    const participants = next.owned.filter((pokemon) => pokemon.hp > 0 && (next.participants || []).includes(pokemon.uid));
    if (!participants.length) return;
    const recipients = next.expShare ? next.owned.filter((pokemon) => !pokemon.inBox && pokemon.hp > 0) : participants;
    const baseExp = progressOf(next.foe)[2];
    recipients.forEach((pokemon) => {
      if (pokemon.level >= 100) return;
      const scale = Math.pow((2 * next.foe.level + 10) / (next.foe.level + pokemon.level + 10), 2.5);
      const trainer = !wildEncounter ? 1.5 : 1;
      const shared = next.expShare && !participants.some((row) => row.uid === pokemon.uid) ? .5 : 1;
      const gain = Math.max(1, Math.floor((baseExp * next.foe.level / 5 * scale + 1) * trainer / participants.length * shared * (pokemon.heldItem === "luckyegg" ? 1.5 : 1)));
      pokemon.exp = Math.min(expAt(pokemon, 100), pokemon.exp + gain);
      next.expGains.push({ uid: pokemon.uid, name: pokemon.nickname, gain, level: pokemon.level });
      addLog(next, pokemon.nickname + "이(가) 경험치 " + gain + "을 얻었다!");
      while (pokemon.level < 100 && pokemon.exp >= expAt(pokemon, pokemon.level + 1)) {
        const oldMax = statOf(pokemon, "hp");
        pokemon.level += 1;
        const newMax = statOf(pokemon, "hp");
        pokemon.maxHp = newMax;
        pokemon.hp = Math.min(newMax, pokemon.hp + newMax - oldMax);
        addLog(next, pokemon.nickname + "의 레벨이 " + pokemon.level + "이 되었다!");
        const baseId = idOf(catalog.dex[pokemon.species] && catalog.dex[pokemon.species].baseSpecies);
        const learn = (catalog.learnsets[pokemon.species] || catalog.learnsets[baseId] || {}).learnset || {};
        Object.keys(learn).filter((id) => catalog.moves[id] && (learn[id] || []).some((row) =>
          /L(\d+)$/.test(row) && Number(row.split("L")[1]) === pokemon.level)).forEach((id) => {
          if (pokemon.moves.includes(id) || next.pendingLearn.some((pending) => pending.uid === pokemon.uid && pending.moveId === id)) return;
          if (pokemon.moves.length >= 4 || next.pendingLearn.some((pending) => pending.uid === pokemon.uid)) {
            next.pendingLearn.push({ uid: pokemon.uid, moveId: id });
            addLog(next, pokemon.nickname + "이(가) " + moveName(id) + "을(를) 배우려 한다!");
          } else {
            pokemon.moves.push(id);
            pokemon.pp.push(catalog.moves[id].pp);
            addLog(next, pokemon.nickname + "이(가) " + moveName(id) + "을 배웠다!");
          }
        });
        evolveAtLevel(next, pokemon);
      }
      pokemon.expFloor = expAt(pokemon, pokemon.level);
      pokemon.nextExp = pokemon.level < 100 ? expAt(pokemon, pokemon.level + 1) : pokemon.exp;
      next.expGains[next.expGains.length - 1].level = pokemon.level;
      syncMoveNames(pokemon);
    });
  };
  const STAGE_KO = { atk: "공격", def: "방어", spa: "특수공격", spd: "특수방어", spe: "스피드", accuracy: "명중률", evasion: "회피율" };
  const boostStages = (next, pokemon, changes, external = true) => {
    let changed = false;
    if (!changes) return changed;
    pokemon.stages = { ...pokemon.stages };
    Object.keys(changes).forEach((key) => {
      if (!STAGE_KO[key]) return;
      let delta = Number(changes[key]) || 0;
      if (pokemon.ability === "contrary") delta *= -1;
      if (pokemon.ability === "simple") delta *= 2;
      if (delta < 0 && external && (["clearbody", "whitesmoke", "fullmetalbody"].includes(pokemon.ability) || pokemon.ability === "keeneye" && key === "accuracy")) {
        addLog(next, pokemon.nickname + "의 " + abilityName(pokemon) + "이(가) 능력 하락을 막았다!");
        return;
      }
      const old = pokemon.stages[key] || 0;
      const value = Math.max(-6, Math.min(6, old + delta));
      if (value === old) return;
      pokemon.stages[key] = value;
      if (value < old) pokemon.lastStatDropTurn = next.turn;
      addLog(next, pokemon.nickname + "의 " + STAGE_KO[key] + " " + (value > old ? "상승" : "하락") + "! (" + (value > 0 ? "+" : "") + value + "랭크)");
      changed = true;
      if (value < old && external && (pokemon.ability === "defiant" || pokemon.ability === "competitive"))
        boostStages(next, pokemon, { [pokemon.ability === "defiant" ? "atk" : "spa"]: 2 }, false);
    });
    return changed;
  };
  const setMajorStatus = (next, pokemon, status) => {
    if (String(pokemon.status || "NORMAL").toLowerCase() !== "normal" || pokemon.hp <= 0) return false;
    const types = (pokemon.battleTypes || info(pokemon).types).map(idOf);
    const ability = pokemon.ability;
    if (status === "brn" && (ability === "waterveil" || ability === "waterbubble") ||
      (status === "psn" || status === "tox") && ability === "immunity" ||
      status === "par" && ability === "limber" || status === "slp" && ["insomnia", "vitalspirit", "sweetveil"].includes(ability) ||
      status === "frz" && ability === "magmaarmor") {
      addLog(next, pokemon.nickname + "의 " + abilityName(pokemon) + "이(가) 상태 이상을 막았다!");
      return false;
    }
    const blockedSide = next.owned.includes(pokemon) ? next.field.own : next.field.foe;
    if (blockedSide && blockedSide.safeguard >= next.turn) return false;
    if (status === "brn" && types.includes("fire") ||
      (status === "psn" || status === "tox") && (types.includes("poison") || types.includes("steel")) ||
      status === "par" && types.includes("electric") || status === "frz" && types.includes("ice")) return false;
    pokemon.status = status;
    if (status === "slp") pokemon.sleepTurns = 2 + Math.floor(Math.random() * 2);
    if (status === "tox") pokemon.toxicTurns = 0;
    addLog(next, pokemon.nickname + "이(가) " + ({ brn: "화상", par: "마비", psn: "독", tox: "맹독", slp: "잠듦", frz: "얼음" }[status] || status) + " 상태가 됐다!");
    return true;
  };
  const healFraction = (next, pokemon, numerator, denominator) => {
    if (pokemon.healBlockUntil >= next.turn) { addLog(next, pokemon.nickname + "은(는) 회복할 수 없다!"); return; }
    const before = pokemon.hp;
    pokemon.hp = Math.min(statOf(pokemon, "hp"), before + Math.max(1, Math.floor(statOf(pokemon, "hp") * numerator / denominator)));
    addLog(next, pokemon.hp > before ? pokemon.nickname + "의 HP가 회복됐다!" : "효과가 없었다.");
  };
  const specialStatusMove = (next, attacker, defender, id, side) => {
    const ownSide = side === "own" ? "own" : "foe";
    const foeSide = side === "own" ? "foe" : "own";
    const field = next.field;
    if (["synthesis", "moonlight", "morningsun", "shoreup", "milkdrink", "softboiled", "slackoff", "recover", "roost", "healorder"].includes(id)) {
      const weather = idOf(field.weather);
      const fraction = ["synthesis", "moonlight", "morningsun"].includes(id) ? weather === "sunnyday" ? [2, 3] : weather && weather !== "snowscape" ? [1, 4] : [1, 2] : id === "shoreup" && weather === "sandstorm" ? [2, 3] : [1, 2];
      healFraction(next, attacker, fraction[0], fraction[1]); return true;
    }
    if (["agility", "amnesia", "nastyplot", "swordsdance", "irondefense", "calmmind", "bulkup", "growth", "workup", "coil", "quiverdance", "dragondance", "shellsmash", "cosmicpower", "cottonspore", "stringshot", "charm", "screech", "fakeTears", "eerieimpulse", "scaryface", "tickle"].includes(id)) return false;
    if (id === "acupressure") { const keys = ["atk", "def", "spa", "spd", "spe", "accuracy", "evasion"].filter(key => ((attacker.stages || {})[key] || 0) < 6); if (keys.length) boostStages(next, attacker, { [keys[Math.floor(Math.random() * keys.length)]]: 2 }); else addLog(next, "효과가 없었다."); return true; }
    if (id === "bellydrum") { const cost = Math.floor(statOf(attacker, "hp") / 2); if (attacker.hp > cost && ((attacker.stages || {}).atk || 0) < 6) { attacker.hp -= cost; boostStages(next, attacker, { atk: 12 }); } else addLog(next, "효과가 없었다."); return true; }
    if (id === "strengthsap") { const gained = Math.max(1, combatStat(defender, "atk", idOf(field.weather))); attacker.hp = Math.min(statOf(attacker, "hp"), attacker.hp + gained); boostStages(next, defender, { atk: -1 }, true); addLog(next, attacker.nickname + "이(가) 힘을 흡수했다!"); return true; }
    if (id === "wish") { field[ownSide].wishTurn = next.turn + 1; field[ownSide].wishHp = Math.floor(statOf(attacker, "hp") / 2); addLog(next, attacker.nickname + "의 소원이 빌어졌다!"); return true; }
    if (id === "memento") { boostStages(next, defender, { atk: -2, spa: -2 }, true); attacker.hp = 0; addLog(next, attacker.nickname + "이(가) 추억의선물로 쓰러졌다!"); return true; }
    if (id === "filletaway") { const cost = Math.floor(statOf(attacker, "hp") / 2); if (attacker.hp > cost && ["atk", "spa", "spe"].some(key => ((attacker.stages || {})[key] || 0) < 6)) { attacker.hp -= cost; boostStages(next, attacker, { atk: 2, spa: 2, spe: 2 }); } else addLog(next, "HP가 부족하거나 능력을 더 올릴 수 없다."); return true; }
    if (id === "autotomize") { boostStages(next, attacker, { spe: 2 }); attacker.weightHalves = Math.min(3, (attacker.weightHalves || 0) + 1); addLog(next, attacker.nickname + "의 몸이 가벼워졌다!"); return true; }
    if (id === "shedtail") { const cost = Math.ceil(statOf(attacker, "hp") / 2); if (attacker.hp <= cost || attacker.substituteHp) addLog(next, "꼬리자르기에 필요한 HP가 부족하다."); else { attacker.hp -= cost; attacker.passBoosts = { stages: {}, substituteHp: Math.max(1, Math.floor(statOf(attacker, "hp") / 4)) }; attacker.forceSwitch = true; addLog(next, attacker.nickname + "이(가) 대타를 남기고 교체한다!"); } return true; }
    if (id === "noretreat") { if (attacker.noRetreat) addLog(next, "이미 배수의진을 사용했다."); else { boostStages(next, attacker, { atk: 1, def: 1, spa: 1, spd: 1, spe: 1 }); attacker.noRetreat = true; attacker.trappedUntil = next.turn + 999; } return true; }
    if (id === "tarshot") { boostStages(next, defender, { spe: -1 }, true); defender.tarShot = true; addLog(next, defender.nickname + "이(가) 불꽃 기술에 약해졌다!"); return true; }
    if (id === "charge") { boostStages(next, attacker, { spd: 1 }, false); attacker.chargeUntil = next.turn + 1; addLog(next, "다음 전기 기술의 위력이 강해진다!"); return true; }
    if (id === "chillyreception") { field.weather = "snowscape"; field.weatherUntil = next.turn + 4; attacker.forceSwitch = true; addLog(next, "눈이 내리기 시작했다! " + attacker.nickname + "이(가) 교체한다!"); return true; }
    if (id === "stockpile") { attacker.stockpile = Math.min(3, (attacker.stockpile || 0) + 1); boostStages(next, attacker, { def: 1, spd: 1 }); return true; }
    if (id === "swallow") { const n = attacker.stockpile || 0; if (n) { healFraction(next, attacker, n === 1 ? 1 : 1, n === 1 ? 4 : n === 2 ? 2 : 1); attacker.stockpile = 0; } else addLog(next, "비축한 힘이 없다."); return true; }
    if (id === "focusenergy" || id === "laserfocus") { attacker.focusedUntil = next.turn + (id === "focusenergy" ? 99 : 1); addLog(next, attacker.nickname + "이(가) 급소를 노리고 있다!"); return true; }
    if (id === "safeguard" || id === "mist" || id === "luckychant") { field[ownSide][id] = next.turn + 4; addLog(next, moveName(id) + " 효과가 펼쳐졌다!"); return true; }
    if (id === "toxicspikes") { field[foeSide].toxicspikes = Math.min(2, (field[foeSide].toxicspikes || 0) + 1); addLog(next, "독압정이 깔렸다!"); return true; }
    if (id === "stickyweb") { field[foeSide].stickyweb = 1; addLog(next, "끈적끈적네트가 깔렸다!"); return true; }
    if (id === "defog") { ["own", "foe"].forEach(key => ["spikes", "stealthrock", "toxicspikes", "stickyweb", "reflect", "lightscreen", "auroraveil"].forEach(effect => { field[key][effect] = 0; })); boostStages(next, defender, { evasion: -1 }, true); addLog(next, "장판과 벽이 사라졌다!"); return true; }
    if (["grassyterrain", "electricterrain", "mistyterrain", "psychicterrain"].includes(id)) { field.terrain = id; field.terrainUntil = next.turn + 4; addLog(next, moveName(id) + "이(가) 펼쳐졌다!"); return true; }
    if (id === "gravity") { field.gravityUntil = next.turn + 4; addLog(next, "중력이 강해졌다!"); return true; }
    if (id === "wonderroom" || id === "magicroom") { field[id + "Until"] = next.turn + 4; addLog(next, moveName(id) + "이(가) 펼쳐졌다!"); return true; }
    if (id === "tailglow") { boostStages(next, attacker, { spa: 3 }); return true; }
    if (id === "cottonGuard" || id === "cottonguard") { boostStages(next, attacker, { def: 3 }); return true; }
    if (id === "topsyturvy") { defender.stages = Object.fromEntries(Object.entries(defender.stages || {}).map(([key, value]) => [key, -value])); addLog(next, defender.nickname + "의 능력 변화가 뒤집혔다!"); return true; }
    if (id === "psychup") { attacker.stages = { ...(defender.stages || {}) }; addLog(next, attacker.nickname + "이(가) 능력 변화를 따라 했다!"); return true; }
    if (id === "powerswap" || id === "guardswap" || id === "heartswap") { const keys = id === "powerswap" ? ["atk", "spa"] : id === "guardswap" ? ["def", "spd"] : ["atk", "def", "spa", "spd", "spe", "accuracy", "evasion"]; keys.forEach(key => { const value = (attacker.stages || {})[key] || 0; attacker.stages ||= {}; defender.stages ||= {}; attacker.stages[key] = defender.stages[key] || 0; defender.stages[key] = value; }); addLog(next, "능력 변화가 교환됐다!"); return true; }
    if (id === "perishsong") { [attacker, defender].forEach(pokemon => { pokemon.perishTurns = 3; }); addLog(next, "멸망의노래가 울려 퍼졌다!"); return true; }
    if (id === "destinybond") { attacker.destinyBondTurn = next.turn + 1; addLog(next, attacker.nickname + "이(가) 길동무를 노린다!"); return true; }
    if (id === "meanlook" || id === "spiderweb" || id === "block") { defender.trappedUntil = next.turn + 99; addLog(next, defender.nickname + "은(는) 도망칠 수 없다!"); return true; }
    if (id === "encore") { defender.encoreMove = defender.lastMove || ""; defender.encoreUntil = next.turn + 3; addLog(next, defender.encoreMove ? defender.nickname + "이(가) 앙코르에 걸렸다!" : "효과가 없었다."); return true; }
    if (id === "disable") { defender.disabledMove = defender.lastMove || ""; defender.disableUntil = next.turn + 4; addLog(next, defender.disabledMove ? defender.nickname + "의 기술이 봉인됐다!" : "효과가 없었다."); return true; }
    if (id === "healblock") { defender.healBlockUntil = next.turn + 4; addLog(next, defender.nickname + "은(는) 회복할 수 없다!"); return true; }
    if (id === "torment") { defender.tormentUntil = next.turn + 99; addLog(next, defender.nickname + "은(는) 연속으로 같은 기술을 쓸 수 없다!"); return true; }
    if (id === "spite" || id === "eerieSpell" || id === "eeriespell") { const slot = defender.moves.indexOf(defender.lastMove); if (slot >= 0) { defender.pp[slot] = Math.max(0, defender.pp[slot] - 4); addLog(next, defender.nickname + "의 PP가 줄었다!"); } else addLog(next, "효과가 없었다."); return true; }
    if (id === "trick" || id === "switcheroo") { const held = attacker.heldItem; attacker.heldItem = defender.heldItem || ""; defender.heldItem = held || ""; addLog(next, "서로의 지닌물건이 바뀌었다!"); return true; }
    if (id === "bestow") { if (!defender.heldItem && attacker.heldItem) { defender.heldItem = attacker.heldItem; attacker.heldItem = ""; addLog(next, "지닌물건을 건넸다!"); } else addLog(next, "효과가 없었다."); return true; }
    if (id === "recycle") { if (attacker.usedItem) { attacker.heldItem = attacker.usedItem; attacker.usedItem = ""; addLog(next, "지닌물건을 되찾았다!"); } else addLog(next, "효과가 없었다."); return true; }
    if (id === "worryseed" || id === "simplebeam" || id === "entrainment" || id === "skillswap" || id === "roleplay" || id === "gastroacid") { if (id === "skillswap") { const value = attacker.ability; attacker.ability = defender.ability; defender.ability = value; } else if (id === "roleplay") attacker.ability = defender.ability; else if (id === "entrainment") defender.ability = attacker.ability; else defender.ability = { worryseed: "insomnia", simplebeam: "simple", gastroacid: "" }[id]; addLog(next, "특성이 바뀌었다!"); return true; }
    if (id === "soak" || id === "magicpowder" || id === "trickortreat" || id === "forestscurse") { defender.battleTypes = id === "soak" ? ["Water"] : id === "magicpowder" ? ["Psychic"] : [...new Set([...info(defender).types, id === "trickortreat" ? "Ghost" : "Grass"])]; addLog(next, defender.nickname + "의 타입이 바뀌었다!"); return true; }
    if (id === "conversion" || id === "camouflage") { attacker.battleTypes = [id === "conversion" ? (moveInfo(attacker.moves[0]) || {}).type || "Normal" : "Normal"]; addLog(next, attacker.nickname + "의 타입이 바뀌었다!"); return true; }
    if (id === "transform") { attacker.transformed = { species: attacker.species, moves: attacker.moves, pp: attacker.pp, ability: attacker.ability, battleTypes: attacker.battleTypes }; attacker.species = defender.species; attacker.moves = [...defender.moves]; attacker.pp = defender.moves.map(() => 5); attacker.ability = defender.ability; attacker.battleTypes = [...info(defender).types]; attacker.stages = { ...(defender.stages || {}) }; addLog(next, attacker.nickname + "이(가) 변신했다!"); return true; }
    if (id === "teleport" || id === "batonpass" || id === "partingshot") { if (id === "partingshot") boostStages(next, defender, { atk: -1, spa: -1 }, true); if (id === "batonpass") attacker.passBoosts = { stages: { ...(attacker.stages || {}) }, substituteHp: attacker.substituteHp || 0 }; attacker.forceSwitch = true; addLog(next, attacker.nickname + "이(가) 교체를 준비한다!"); return true; }
    if (id === "roar" || id === "whirlwind" || id === "dragontail" || id === "circlethrow") { defender.forceSwitch = true; addLog(next, defender.nickname + "이(가) 밀려났다!"); return true; }
    if (id === "endure") { attacker.endureTurn = next.turn; addLog(next, attacker.nickname + "이(가) 공격을 버티려 한다!"); return true; }
    if (["spikyshield", "banefulbunker", "kingsshield", "obstruct", "silktrap", "burningbulwark", "wideguard", "quickguard", "craftyshield", "matblock"].includes(id)) { attacker.protectTurn = next.turn; attacker.protectKind = id; addLog(next, attacker.nickname + "은(는) 몸을 지키고 있다!"); return true; }
    if (id === "aquaring" || id === "ingrain") { attacker[id] = true; if (id === "ingrain") attacker.trappedUntil = next.turn + 99; addLog(next, attacker.nickname + "에게 회복 효과가 생겼다!"); return true; }
    if (id === "nightmare") { if (defender.status === "slp") { defender.nightmare = true; addLog(next, defender.nickname + "은(는) 악몽을 꾸고 있다!"); } else addLog(next, "효과가 없었다."); return true; }
    if (id === "attract") { if (attacker.gender && defender.gender && attacker.gender !== defender.gender) { defender.attractedTo = attacker.uid; addLog(next, defender.nickname + "은(는) 헤롱헤롱해졌다!"); } else addLog(next, "효과가 없었다."); return true; }
    if (id === "lockon" || id === "mindreader") { attacker.lockOnUid = defender.uid; attacker.lockOnUntil = next.turn + 1; addLog(next, "다음 공격은 명중한다!"); return true; }
    if (id === "magnetrise" || id === "telekinesis") { (id === "magnetrise" ? attacker : defender).airborneUntil = next.turn + 4; addLog(next, "공중에 떠올랐다!"); return true; }
    if (id === "healpulse" || id === "floralhealing") { healFraction(next, defender, id === "floralhealing" && field.terrain === "grassyterrain" ? 2 : 1, 2); return true; }
    if (id === "junglehealing" || id === "lunarblessing") { const party = side === "own" ? next.owned.filter(p => !p.inBox) : [attacker]; party.forEach(p => { if (p.hp > 0) { p.status = "NORMAL"; p.sleepTurns = 0; p.hp = Math.min(statOf(p, "hp"), p.hp + Math.max(1, Math.floor(statOf(p, "hp") / 4))); } }); addLog(next, "동료들의 HP와 상태 이상이 회복됐다!"); return true; }
    if (id === "purify") { if (defender.status !== "NORMAL") { defender.status = "NORMAL"; healFraction(next, attacker, 1, 2); } else addLog(next, "효과가 없었다."); return true; }
    if (id === "revivalblessing") { const target = side === "own" ? next.owned.find(p => p.hp <= 0 && !p.inBox) : next.foes.find(p => p.hp <= 0); if (target) { target.hp = Math.max(1, Math.floor(statOf(target, "hp") / 2)); target.status = "NORMAL"; addLog(next, target.nickname + "이(가) 되살아났다!"); } else addLog(next, "되살릴 포켓몬이 없다."); return true; }
    if (id === "healingwish" || id === "lunardance") { const target = side === "own" ? next.owned.find(p => p.uid !== attacker.uid && p.hp > 0 && !p.inBox) : next.foes.find(p => p.uid !== attacker.uid && p.hp > 0); if (target) { target.hp = statOf(target, "hp"); target.status = "NORMAL"; if (id === "lunardance") target.pp = target.moves.map(moveId => moveInfo(moveId).pp); attacker.hp = 0; addLog(next, target.nickname + "이(가) 회복됐다!"); } else addLog(next, "효과가 없었다."); return true; }
    if (id === "painsplit") { const value = Math.floor((attacker.hp + defender.hp) / 2); attacker.hp = Math.min(statOf(attacker, "hp"), value); defender.hp = Math.min(statOf(defender, "hp"), value); addLog(next, "서로의 HP를 나누었다!"); return true; }
    if (id === "curse") { if ((attacker.battleTypes || info(attacker).types).some(type => idOf(type) === "ghost")) { const cost = Math.floor(statOf(attacker, "hp") / 2); if (attacker.hp > cost) { attacker.hp -= cost; defender.cursed = true; addLog(next, defender.nickname + "에게 저주가 걸렸다!"); } else addLog(next, "효과가 없었다."); } else boostStages(next, attacker, { atk: 1, def: 1, spe: -1 }); return true; }
    if (id === "powertrick" || id === "powershift") { attacker.powerTrick = !attacker.powerTrick; addLog(next, "공격과 방어가 바뀌었다!"); return true; }
    if (id === "speedswap") { const value = attacker.speedSwap; attacker.speedSwap = defender.speedSwap || statOf(defender, "spe"); defender.speedSwap = value || statOf(attacker, "spe"); addLog(next, "서로의 스피드가 바뀌었다!"); return true; }
    if (id === "powersplit" || id === "guardsplit") { const keys = id === "powersplit" ? ["atk", "spa"] : ["def", "spd"]; keys.forEach(key => { const mean = Math.floor((statOf(attacker, key) + statOf(defender, key)) / 2); attacker.splitStats ||= {}; defender.splitStats ||= {}; attacker.splitStats[key] = mean; defender.splitStats[key] = mean; }); addLog(next, "서로의 능력치를 나누었다!"); return true; }
    if (id === "courtchange") { const value = field.own; field.own = field.foe; field.foe = value; addLog(next, "양쪽 필드 효과가 바뀌었다!"); return true; }
    if (id === "tidyup") { ["own", "foe"].forEach(key => ["spikes", "stealthrock", "toxicspikes", "stickyweb"].forEach(effect => { field[key][effect] = 0; })); attacker.substituteHp = 0; defender.substituteHp = 0; boostStages(next, attacker, { atk: 1, spe: 1 }); return true; }
    if (id === "psychoshift") { if (attacker.status !== "NORMAL" && setMajorStatus(next, defender, attacker.status)) { attacker.status = "NORMAL"; addLog(next, "상태 이상을 옮겼다!"); } else addLog(next, "효과가 없었다."); return true; }
    if (id === "reflecttype" || id === "conversion2") { attacker.battleTypes = id === "reflecttype" ? [...(defender.battleTypes || info(defender).types)] : ["Normal"]; addLog(next, attacker.nickname + "의 타입이 바뀌었다!"); return true; }
    if (id === "imprison") { attacker.imprisonedMoves = [...attacker.moves]; addLog(next, "상대의 같은 기술을 봉인했다!"); return true; }
    if (id === "teatime") { [attacker, defender].forEach(p => { if (["oranberry", "sitrusberry"].includes(p.heldItem)) { healFraction(next, p, p.heldItem === "oranberry" ? 1 : 1, p.heldItem === "oranberry" ? 10 : 4); p.usedItem = p.heldItem; p.heldItem = ""; } }); addLog(next, "다과회가 열렸다!"); return true; }
    if (id === "happyhour") { next.happyHour = true; addLog(next, "배틀 상금이 두 배가 된다!"); return true; }
    if (id === "rototiller") { [attacker, defender].filter(pokemon => (pokemon.battleTypes || info(pokemon).types).some(type => idOf(type) === "grass")).forEach(pokemon => boostStages(next, pokemon, { atk: 1, spa: 1 })); return true; }
    if (id === "gearup" || id === "magneticflux") { if (["plus", "minus"].includes(attacker.ability)) boostStages(next, attacker, id === "gearup" ? { atk: 1, spa: 1 } : { def: 1, spd: 1 }); else addLog(next, "해당 특성의 포켓몬이 없다."); return true; }
    if (["splash", "celebrate", "holdhands", "followme", "ragepowder", "spotlight", "afteryou", "quash", "helpinghand", "allyswitch"].includes(id)) { addLog(next, "이 싱글 배틀에서는 효과가 없었다."); return true; }
    if (id === "embargo") { defender.embargoUntil = next.turn + 4; addLog(next, defender.nickname + "은(는) 도구를 사용할 수 없다!"); return true; }
    if (["foresight", "odorsleuth", "miracleeye"].includes(id)) { defender.identified = true; addLog(next, defender.nickname + "의 타입 내성이 간파됐다!"); return true; }
    if (id === "dragoncheer") { attacker.focusedUntil = next.turn + 4; addLog(next, attacker.nickname + "의 급소율이 올랐다!"); return true; }
    if (id === "magiccoat") { attacker.magicCoatTurn = next.turn; addLog(next, attacker.nickname + "의 매직코트!"); return true; }
    if (id === "octolock") { defender.trappedUntil = next.turn + 99; defender.octolock = true; addLog(next, defender.nickname + "이(가) 문어굳히기에 걸렸다!"); return true; }
    if (id === "watersport" || id === "mudsport") { field[id + "Until"] = next.turn + 4; addLog(next, moveName(id) + "의 효과가 퍼졌다!"); return true; }
    if (id === "venomdrench") { if (["psn", "tox"].includes(idOf(defender.status))) boostStages(next, defender, { atk: -1, spa: -1, spe: -1 }, true); else addLog(next, "효과가 없었다."); return true; }
    if (id === "stuffcheeks") { if (attacker.heldItem && attacker.heldItem.endsWith("berry")) { attacker.usedItem = attacker.heldItem; attacker.heldItem = ""; boostStages(next, attacker, { def: 2 }); healFraction(next, attacker, 1, 4); } else addLog(next, "먹을 열매가 없다."); return true; }
    if (id === "corrosivegas") { if (defender.heldItem) { defender.heldItem = ""; addLog(next, defender.nickname + "의 지닌물건이 녹았다!"); } else addLog(next, "효과가 없었다."); return true; }
    if (id === "powder") { defender.powderTurn = next.turn; addLog(next, defender.nickname + "에게 분진이 붙었다!"); return true; }
    if (id === "takeheart") { attacker.status = "NORMAL"; boostStages(next, attacker, { spa: 1, spd: 1 }); return true; }
    if (id === "electrify") { defender.electrifiedTurn = next.turn; addLog(next, defender.nickname + "의 다음 기술이 전기 타입이 된다!"); return true; }
    if (id === "grudge") { attacker.grudgeTurn = next.turn; addLog(next, attacker.nickname + "의 원념이 깃들었다!"); return true; }
    if (id === "fairylock") { attacker.trappedUntil = next.turn + 1; defender.trappedUntil = next.turn + 1; addLog(next, "다음 턴까지 교체할 수 없다!"); return true; }
    if (id === "iondeluge") { field.ionDelugeTurn = next.turn; addLog(next, "노말 기술이 전기 타입으로 바뀐다!"); return true; }
    if (id === "flowershield") { [attacker, defender].filter(p => info(p).types.some(type => idOf(type) === "grass")).forEach(p => boostStages(next, p, { def: 1 })); return true; }
    if (id === "mimic" || id === "sketch") { if (defender.lastMove && catalog.moves[defender.lastMove]) { const index = attacker.moves.indexOf(id); if (index >= 0) { attacker.moves[index] = defender.lastMove; attacker.pp[index] = id === "sketch" ? moveInfo(defender.lastMove).pp : 5; syncMoveNames(attacker); addLog(next, moveName(defender.lastMove) + "을(를) 배웠다!"); } } else addLog(next, "따라 할 기술이 없다."); return true; }
    if (id === "doodle") { const party = side === "own" ? next.owned.filter(p => !p.inBox) : [attacker]; party.forEach(p => { p.ability = defender.ability; }); addLog(next, "동료의 특성이 바뀌었다!"); return true; }
    if (id === "snatch") { attacker.snatchTurn = next.turn; addLog(next, attacker.nickname + "이(가) 상대의 보조 기술을 가로채려 한다!"); return true; }
    return false;
  };
  const specialDamage = (next, attacker, defender, move, id) => {
    const types = info(defender).types;
    const effect = effectiveness(move.type, defender);
    const immune = effect === 0;
    const full = statOf(defender, "hp");
    const ownFull = statOf(attacker, "hp");
    const level = attacker.level;
    let fixed = null;
    let power = move.basePower;
    if (["nightshade", "seismictoss"].includes(id)) fixed = level;
    else if (id === "sonicboom") fixed = 20;
    else if (id === "dragonrage") fixed = 40;
    else if (id === "psywave") fixed = Math.max(1, Math.floor(level * (0.5 + Math.random())));
    else if (["superfang", "naturesmadness", "ruination"].includes(id)) fixed = Math.max(1, Math.floor(defender.hp / 2));
    else if (id === "endeavor") fixed = Math.max(0, defender.hp - attacker.hp);
    else if (id === "finalgambit") fixed = attacker.hp;
    else if (["counter", "mirrorcoat", "metalburst", "comeuppance", "bide"].includes(id)) {
      const correctCategory = id !== "counter" && id !== "mirrorcoat" || attacker.lastDamageCategory === (id === "counter" ? "Physical" : "Special");
      fixed = attacker.lastDamageTurn === next.turn && correctCategory ? Math.floor((attacker.lastDamageTaken || 0) * (["counter", "mirrorcoat", "bide"].includes(id) ? 2 : 1.5)) : 0;
    }
    else if (["guillotine", "fissure", "horndrill", "sheercold"].includes(id)) fixed = level >= defender.level ? defender.hp : 0;
    else if (id === "reversal" || id === "flail") { const ratio = attacker.hp / ownFull; power = ratio < .042 ? 200 : ratio < .104 ? 150 : ratio < .208 ? 100 : ratio < .354 ? 80 : ratio < .688 ? 40 : 20; }
    else if (id === "lowkick" || id === "grassknot") { const kg = ((catalog.dex[defender.species] || {}).weightkg || 50) / Math.pow(2, defender.weightHalves || 0); power = kg >= 200 ? 120 : kg >= 100 ? 100 : kg >= 50 ? 80 : kg >= 25 ? 60 : kg >= 10 ? 40 : 20; }
    else if (id === "electroball") { const ratio = combatStat(attacker, "spe") / Math.max(1, combatStat(defender, "spe")); power = ratio >= 4 ? 150 : ratio >= 3 ? 120 : ratio >= 2 ? 80 : ratio >= 1 ? 60 : 40; }
    else if (id === "gyroball") power = Math.min(150, Math.max(1, Math.floor(25 * combatStat(defender, "spe") / Math.max(1, combatStat(attacker, "spe")))));
    else if (["heavyslam", "heatcrash"].includes(id)) { const a = ((catalog.dex[attacker.species] || {}).weightkg || 50) / Math.pow(2, attacker.weightHalves || 0); const b = ((catalog.dex[defender.species] || {}).weightkg || 50) / Math.pow(2, defender.weightHalves || 0); const ratio = a / b; power = ratio >= 5 ? 120 : ratio >= 4 ? 100 : ratio >= 3 ? 80 : ratio >= 2 ? 60 : 40; }
    else if (id === "return" || id === "frustration" || id === "veeveevolley" || id === "pikapapow") {
      const friendship = Number.isFinite(Number(attacker.friendship)) ? clamp(attacker.friendship, 0, 255) : null;
      power = friendship == null ? id === "frustration" ? 60 : 102 :
        Math.max(1, Math.floor((id === "frustration" ? 255 - friendship : friendship) * 2 / 5));
    }
    else if (id === "magnitude") power = [10, 30, 50, 70, 90, 110, 150][Math.floor(Math.random() * 7)];
    else if (id === "present") { const roll = Math.random(); if (roll < .2) { healFraction(next, defender, 1, 4); return { damage: 0, effect: 1 }; } power = roll < .6 ? 40 : roll < .9 ? 80 : 120; }
    else if (id === "crushgrip" || id === "wringout") power = Math.max(1, Math.floor(120 * defender.hp / full));
    else if (id === "hardpress") power = Math.max(1, Math.floor(100 * defender.hp / full));
    else if (id === "trumpcard") power = [200, 80, 60, 50, 40][Math.min(4, attacker.pp[attacker.moves.indexOf(id)] || 0)];
    else if (id === "punishment") power = Math.min(200, 60 + Object.values(defender.stages || {}).reduce((n, value) => n + Math.max(0, value), 0) * 20);
    else if (id === "naturalgift") power = attacker.heldItem && attacker.heldItem.endsWith("berry") ? 80 : 0;
    else if (id === "fling") power = attacker.heldItem ? 30 : 0;
    else if (id === "beatup") power = Math.max(1, (side => side === "own" ? next.owned.filter(p => !p.inBox && p.hp > 0).length : next.foes.filter(p => p.hp > 0).length)(next.owned.includes(attacker) ? "own" : "foe") * 15);
    else if (id === "spitup") power = (attacker.stockpile || 0) * 100;
    else if (id === "echoedvoice") { attacker.echoedVoiceStreak = attacker.previousMove === id ? Math.min(5, (attacker.echoedVoiceStreak || 1) + 1) : 1; power *= attacker.echoedVoiceStreak; }
    else if (id === "fusionbolt" && next.previousActionMove === "fusionflare" || id === "fusionflare" && next.previousActionMove === "fusionbolt") power *= 2;
    else if (id === "lashout" && attacker.lastStatDropTurn === next.turn) power *= 2;
    else if (id === "pursuit" && next.pursuitSwitching) power *= 2;
    else if (["boltbeak", "fishiousrend"].includes(id) && defender.actedTurn !== next.turn) power *= 2;
    else if (id === "expandingforce" && next.field.terrain === "psychicterrain") power = Math.floor(power * 1.5);
    else if (["collisioncourse", "electrodrift"].includes(id) && effect > 1) power = Math.floor(power * 4 / 3);
    else if (id === "gravapple" && next.field.gravityUntil >= next.turn) power = Math.floor(power * 1.5);
    else if (id === "psyblade" && next.field.terrain === "electricterrain") power = Math.floor(power * 1.5);
    else if (id === "ficklebeam" && Math.random() < .3) { power *= 2; addLog(next, "강력한 빛이 뿜어져 나왔다!"); }
    else if (id === "temperflare" && attacker.lastMoveFailed) power *= 2;
    else if (id === "retaliate" && next[attacker === next.foe ? "foeFaintedTurn" : "ownFaintedTurn"] === next.turn - 1) power *= 2;
    else if (id === "smellingsalts" && idOf(defender.status) === "par") power *= 2;
    else if (id === "wakeupslap" && idOf(defender.status) === "slp") power *= 2;
    else if (["brine", "hex", "venoshock", "facade", "acrobatics", "avalanche", "revenge", "payback", "assurance", "barbbarrage", "infernalparade", "risingvoltage", "stompingtantrum", "lastrespects", "ragefist", "storedpower", "powertrip", "eruption", "waterspout", "dragonenergy", "rollout", "iceball", "furycutter"].includes(id)) {
      const abnormal = String(defender.status || "NORMAL").toLowerCase() !== "normal";
      if (id === "brine" && defender.hp * 2 <= full || id === "hex" && abnormal || id === "venoshock" && ["psn", "tox"].includes(idOf(defender.status)) || id === "facade" && String(attacker.status).toLowerCase() !== "normal" || id === "acrobatics" && !attacker.heldItem || ["avalanche", "revenge"].includes(id) && attacker.lastDamageTurn === next.turn || id === "payback" && combatStat(attacker, "spe") < combatStat(defender, "spe") || id === "assurance" && defender.lastDamageTurn === next.turn || ["barbbarrage", "infernalparade"].includes(id) && abnormal || id === "risingvoltage" && next.field.terrain === "electricterrain" || id === "stompingtantrum" && attacker.lastMoveFailed) power *= 2;
      if (id === "lastrespects") power = Math.min(300, 50 + (next.owned.includes(attacker) ? next.owned : next.foes).filter(p => p.hp <= 0).length * 50);
      if (id === "ragefist") power = Math.min(350, 50 + (attacker.timesHit || 0) * 50);
      if (id === "storedpower" || id === "powertrip") power = 20 + Object.values(attacker.stages || {}).reduce((sum, stage) => sum + Math.max(0, stage), 0) * 20;
      if (["eruption", "waterspout", "dragonenergy"].includes(id)) power = Math.max(1, Math.floor(150 * attacker.hp / ownFull));
      if (["rollout", "iceball", "furycutter"].includes(id)) { attacker.repeatMove = attacker.previousMove === id ? Math.min(5, (attacker.repeatMove || 0) + 1) : 1; power *= Math.pow(2, attacker.repeatMove - 1); }
    }
    if (fixed != null) return { damage: immune ? 0 : Math.max(0, Math.min(defender.hp, fixed)), effect };
    if (!(power > 0)) return { damage: 0, effect, failed: true };
    const calculated = damageOf(next, attacker, defender, { ...move, basePower: power });
    if (id === "fling" || id === "naturalgift") { attacker.usedItem = attacker.heldItem; attacker.heldItem = ""; }
    if (id === "spitup") attacker.stockpile = 0;
    if (id === "finalgambit") attacker.hp = 0;
    return calculated;
  };

  const applyStatusMove = (next, attacker, defender, moveId, move, side) => {
    const effect = move.effect || {};
    const self = effect.target === "self" || effect.target === "allies" || effect.target === "allySide";
    const target = self ? attacker : defender;
    const ownSide = side === "own" ? "own" : "foe";
    const foeSide = side === "own" ? "foe" : "own";
    let applied = false;
    if (specialStatusMove(next, attacker, defender, moveId, side)) return;
    if (moveId === "haze") {
      attacker.stages = {}; defender.stages = {};
      addLog(next, "모든 능력 변화가 사라졌다!");
      return;
    }
    if (moveId === "rest") {
      if (attacker.hp < statOf(attacker, "hp") || String(attacker.status).toLowerCase() !== "normal") {
        attacker.hp = statOf(attacker, "hp"); attacker.status = "slp"; attacker.sleepTurns = 2;
        addLog(next, attacker.nickname + "이(가) 잠들고 HP를 모두 회복했다!");
      } else addLog(next, "효과가 없었다.");
      return;
    }
    if (moveId === "refresh" || moveId === "healbell" || moveId === "aromatherapy") {
      const party = moveId === "refresh" ? [attacker] : side === "own" ? next.owned : [attacker];
      party.forEach((pokemon) => { if (String(pokemon.status).toLowerCase() !== "normal") { pokemon.status = "NORMAL"; pokemon.sleepTurns = 0; applied = true; } });
      addLog(next, applied ? "상태 이상이 회복됐다!" : "효과가 없었다.");
      return;
    }
    applied = boostStages(next, target, effect.boosts, target !== attacker) || applied;
    applied = boostStages(next, attacker, effect.selfBoosts, false) || applied;
    if (effect.status) applied = setMajorStatus(next, target, effect.status) || applied;
    if (effect.heal && target.hp < statOf(target, "hp")) {
      const amount = Math.max(1, Math.floor(statOf(target, "hp") * effect.heal[0] / effect.heal[1]));
      target.hp = Math.min(statOf(target, "hp"), target.hp + amount);
      addLog(next, target.nickname + "의 HP가 회복됐다!"); applied = true;
    }
    const volatile = effect.volatileStatus || "";
    if (volatile === "protect" || moveId === "detect") {
      attacker.protectTurn = next.turn;
      attacker.protectKind = moveId;
      addLog(next, attacker.nickname + "은(는) 몸을 지키고 있다!"); applied = true;
    } else if (volatile === "substitute" && !attacker.substituteHp) {
      const cost = Math.max(1, Math.floor(statOf(attacker, "hp") / 4));
      if (attacker.hp > cost) {
        attacker.hp -= cost; attacker.substituteHp = cost;
        addLog(next, attacker.nickname + "의 대타가 나타났다!"); applied = true;
      }
    } else if (volatile === "taunt") {
      target.tauntUntil = next.turn + 2;
      addLog(next, target.nickname + "은(는) 도발당했다!"); applied = true;
    } else if (volatile === "leechseed" && !target.seededBy && !info(target).types.some((type) => idOf(type) === "grass")) {
      target.seededBy = side;
      addLog(next, target.nickname + "에게 씨뿌리기가 통했다!"); applied = true;
    } else if (volatile === "confusion") {
      target.confusionTurns = 2 + Math.floor(Math.random() * 3);
      addLog(next, target.nickname + "은(는) 혼란에 빠졌다!"); applied = true;
    } else if (volatile === "yawn") {
      target.yawnUntil = next.turn + 1;
      addLog(next, target.nickname + "이(가) 졸기 시작했다!"); applied = true;
    }
    if (effect.sideCondition && ["reflect", "lightscreen", "auroraveil", "tailwind", "stealthrock", "spikes"].includes(effect.sideCondition)) {
      const condition = effect.sideCondition;
      const targetSide = ["reflect", "lightscreen", "auroraveil", "tailwind"].includes(condition) ? ownSide : foeSide;
      const duration = condition === "tailwind" ? 4 : 5;
      if (condition === "spikes" ? (next.field[targetSide].spikes || 0) < 3 : !next.field[targetSide][condition] || next.field[targetSide][condition] < next.turn) {
        next.field[targetSide][condition] = condition === "spikes" ? (next.field[targetSide].spikes || 0) + 1
          : ["stealthrock"].includes(condition) ? 99 : next.turn + duration - 1;
        addLog(next, (targetSide === "own" ? "우리 편" : "상대편") + "에 " + moveName(moveId) + " 효과가 생겼다!"); applied = true;
      }
    }
    if (effect.weather) {
      next.field.weather = effect.weather; next.field.weatherUntil = next.turn + 4;
      addLog(next, "날씨가 " + moveName(moveId) + " 효과로 바뀌었다!"); applied = true;
    }
    if (moveId === "trickroom") {
      next.field.trickRoomUntil = next.field.trickRoomUntil >= next.turn ? 0 : next.turn + 4;
      addLog(next, "트릭룸이 " + (next.field.trickRoomUntil ? "펼쳐졌다!" : "사라졌다!")); applied = true;
    }
    if (moveId === "clearsmog") { defender.stages = {}; addLog(next, defender.nickname + "의 능력 변화가 사라졌다!"); applied = true; }
    if (!applied) addLog(next, effect.boosts || effect.selfBoosts || effect.status || effect.heal || volatile || effect.sideCondition
      ? "효과가 없었다." : "이 기술의 특수 효과는 아직 지원되지 않는다.");
  };
  const handleFaint = (next, side, defeated) => {
    addLog(next, defeated.nickname + "이(가) 쓰러졌다!");
    next[side === "own" ? "foeFaintedTurn" : "ownFaintedTurn"] = next.turn;
    if (side === "own") {
      const victor = activeOf(next);
      if (victor && victor.hp > 0 && victor.ability === "moxie") boostStages(next, victor, { atk: 1 }, false);
      next.owned.filter((pokemon) => pokemon.hp > 0 && next.participants.includes(pokemon.uid)).forEach(awardEvs);
      awardExperience(next);
      if (next.foeIndex + 1 < next.foes.length) {
        next.foeIndex += 1;
        next.foe = { ...next.foes[next.foeIndex], pp: [...next.foes[next.foeIndex].pp], stages: {}, enteredTurn: next.turn };
        applyEntryHazards(next, next.foe, "foe");
        enterAbility(next, next.foe, "foe");
        const active = activeOf(next);
        next.participants = active && active.hp > 0 ? [active.uid] : [];
        addLog(next, trainerName + "가 " + next.foe.nickname + "을(를) 내보냈다!");
      } else next.outcome = "victory";
    } else {
      next.pendingSwitch = next.owned.some((pokemon) => !pokemon.inBox && pokemon.hp > 0);
      if (next.pendingSwitch) addLog(next, "다음 포켓몬을 선택해 주세요.");
      else next.outcome = "defeat";
    }
  };
  const applyEntryHazards = (next, pokemon, side) => {
    const hazards = next.field[side];
    if (pokemon.ability === "magicguard") return;
    let damage = 0;
    if (hazards.stealthrock) damage += Math.max(1, Math.floor(statOf(pokemon, "hp") * effectiveness("rock", pokemon) / 8));
    if (hazards.toxicspikes && pokemon.hp > 0 && !info(pokemon).types.some(type => idOf(type) === "flying") && pokemon.ability !== "levitate") { if (info(pokemon).types.some(type => idOf(type) === "poison")) hazards.toxicspikes = 0; else setMajorStatus(next, pokemon, hazards.toxicspikes > 1 ? "tox" : "psn"); }
    if (hazards.stickyweb && pokemon.ability !== "levitate" && !info(pokemon).types.some(type => idOf(type) === "flying")) boostStages(next, pokemon, { spe: -1 }, true);
    if (hazards.spikes && pokemon.ability !== "levitate" && !info(pokemon).types.some((type) => idOf(type) === "flying")) {
      damage += Math.max(1, Math.floor(statOf(pokemon, "hp") * [0, 1 / 8, 1 / 6, 1 / 4][hazards.spikes]));
    }
    if (damage) { pokemon.hp = Math.max(0, pokemon.hp - damage); addLog(next, pokemon.nickname + "이(가) 설치된 기술로 " + damage + " 피해를 받았다!"); }
  };
  const resolveForcedSwitch = (next) => {
    if (next.outcome) return;
    if (next.foe && next.foe.forceSwitch) {
      const old = next.foe;
      old.forceSwitch = false;
      const nextIndex = next.foes.findIndex((pokemon, index) => index !== next.foeIndex && pokemon.hp > 0);
      if (nextIndex >= 0) {
        next.foes[next.foeIndex] = { ...old, stages: {}, substituteHp: 0 };
        next.foeIndex = nextIndex;
        next.foe = { ...next.foes[nextIndex], pp: [...next.foes[nextIndex].pp], stages: {}, enteredTurn: next.turn };
        addLog(next, next.foe.nickname + "이(가) 나왔다!");
        applyEntryHazards(next, next.foe, "foe");
        if (next.foe.hp > 0) enterAbility(next, next.foe, "foe");
      } else if (wildEncounter) { next.outcome = "escaped"; addLog(next, "야생 포켓몬이 달아났다!"); }
    }
    const old = activeOf(next);
    if (old && old.forceSwitch && !next.outcome) {
      old.forceSwitch = false;
      const replacement = next.owned.find((pokemon) => !pokemon.inBox && pokemon.hp > 0 && pokemon.uid !== old.uid);
      if (!replacement) return;
      const passed = old.passBoosts;
      old.passBoosts = null;
      old.stages = {}; old.substituteHp = 0; old.seededBy = ""; old.tarShot = false; old.chargeUntil = 0; old.chargingMove = ""; old.rechargeUntil = 0;
      next.activeUid = replacement.uid;
      replacement.stages = passed ? passed.stages : {};
      replacement.substituteHp = passed ? passed.substituteHp : 0;
      replacement.enteredTurn = next.turn;
      addLog(next, "가라, " + replacement.nickname + "!");
      applyEntryHazards(next, replacement, "own");
      if (replacement.hp > 0) enterAbility(next, replacement, "own");
      if (!next.participants.includes(replacement.uid)) next.participants.push(replacement.uid);
    }
  };
  const endTurn = (next) => {
    ["own", "foe"].forEach((targetSide) => {
      const pending = next.field[targetSide].delayedAttack;
      if (!pending || pending.turn > next.turn || next.outcome) return;
      next.field[targetSide].delayedAttack = null;
      const target = targetSide === "own" ? activeOf(next) : next.foe;
      if (!target || target.hp <= 0) return;
      const result = damageOf(next, pending.user, target, moveInfo(pending.moveId));
      const damage = Math.min(target.hp, result.damage);
      target.hp -= damage;
      addLog(next, moveName(pending.moveId) + "이(가) 뒤늦게 적중했다! " + damage + " 피해!");
      if (target.hp <= 0) handleFaint(next, targetSide === "foe" ? "own" : "foe", target);
    });
    [[activeOf(next), "own"], [next.foe, "foe"]].forEach(([pokemon, side]) => {
      if (!pokemon || pokemon.hp <= 0 || next.outcome) return;
      const maxHp = statOf(pokemon, "hp");
      const status = String(pokemon.status || "NORMAL").toLowerCase();
      const ownField = next.field[side];
      if (ownField.wishTurn === next.turn) { healFraction(next, pokemon, ownField.wishHp || 0, maxHp); ownField.wishTurn = 0; ownField.wishHp = 0; }
      if (pokemon.perishTurns > 0) { pokemon.perishTurns -= 1; addLog(next, pokemon.nickname + "의 멸망의노래 카운트: " + pokemon.perishTurns); if (!pokemon.perishTurns) pokemon.hp = 0; }
      if (pokemon.octolock) boostStages(next, pokemon, { def: -1, spd: -1 }, true);
      if (pokemon.syrupTurns > 0) { pokemon.syrupTurns -= 1; boostStages(next, pokemon, { spe: -1 }, true); }
      if (pokemon.yawnUntil === next.turn) { pokemon.yawnUntil = 0; setMajorStatus(next, pokemon, "slp"); }
      let damage = 0;
      if (status === "brn" || status === "psn") damage += Math.max(1, Math.floor(maxHp / 8));
      if (pokemon.saltCure) damage += Math.max(1, Math.floor(maxHp * (info(pokemon).types.some(type => ["Water", "Steel"].includes(type)) ? 1 / 4 : 1 / 8)));
      if (pokemon.cursed) damage += Math.max(1, Math.floor(maxHp / 4));
      if (pokemon.nightmare && status === "slp") damage += Math.max(1, Math.floor(maxHp / 4));
      if (status === "tox") { pokemon.toxicTurns = Math.min(15, (pokemon.toxicTurns || 0) + 1); damage += Math.max(1, Math.floor(maxHp * pokemon.toxicTurns / 16)); }
      const weather = idOf(next.field.weather);
      const types = (pokemon.battleTypes || info(pokemon).types).map(idOf);
      if ((weather === "sandstorm" && !["rock", "ground", "steel"].some((type) => types.includes(type)) ||
        weather === "hail" && !types.includes("ice")) && !["overcoat", "sandrush", "sandveil", "snowcloak", "icebody"].includes(pokemon.ability))
        damage += Math.max(1, Math.floor(maxHp / 16));
      if (pokemon.seededBy && pokemon.ability !== "magicguard") {
        const seed = Math.max(1, Math.floor(maxHp / 8)); damage += seed;
        const source = pokemon.seededBy === "own" ? activeOf(next) : next.foe;
        if (source && source.hp > 0 && source !== pokemon) source.hp = Math.min(statOf(source, "hp"), source.hp + seed);
      }
      if (pokemon.ability === "poisonheal" && (status === "psn" || status === "tox")) {
        damage = Math.max(0, damage - Math.max(1, Math.floor(maxHp * (status === "tox" ? pokemon.toxicTurns / 16 : 1 / 8))));
        const healed = Math.min(maxHp - pokemon.hp, Math.max(1, Math.floor(maxHp / 8)));
        if (healed > 0) { pokemon.hp += healed; addLog(next, pokemon.nickname + "은(는) 포이즌힐로 " + healed + " HP를 회복했다!"); }
      }
      if (pokemon.ability === "magicguard") damage = 0;
      if (damage) { pokemon.hp = Math.max(0, pokemon.hp - damage); addLog(next, pokemon.nickname + "이(가) 상태 효과로 " + damage + " 피해를 받았다!"); }
      if (pokemon.hp > 0 && (pokemon.ability === "raindish" && weather === "raindance" || pokemon.ability === "icebody" && weather === "hail" || pokemon.ability === "dryskin" && weather === "raindance")) {
        const healed = Math.min(maxHp - pokemon.hp, Math.max(1, Math.floor(maxHp / 16)));
        if (healed > 0) { pokemon.hp += healed; addLog(next, pokemon.nickname + "의 " + abilityName(pokemon) + "! HP " + healed + " 회복!"); }
      }
      if (pokemon.hp > 0 && pokemon.ability === "speedboost") boostStages(next, pokemon, { spe: 1 }, false);
      if (pokemon.hp > 0 && pokemon.ability === "shedskin" && status !== "normal" && Math.random() < 1 / 3) {
        pokemon.status = "NORMAL"; pokemon.sleepTurns = 0;
        addLog(next, pokemon.nickname + "의 탈피! 상태 이상이 회복됐다!");
      }
      if (pokemon.hp > 0 && (pokemon.aquaring || pokemon.ingrain)) healFraction(next, pokemon, 1, 16);
      if (pokemon.hp > 0 && next.field.terrain === "grassyterrain") healFraction(next, pokemon, 1, 16);
      if (pokemon.hp > 0 && pokemon.heldItem === "leftovers") {
        const before = pokemon.hp;
        pokemon.hp = Math.min(maxHp, pokemon.hp + Math.max(1, Math.floor(maxHp / 16)));
        if (pokemon.hp > before) addLog(next, pokemon.nickname + "은(는) 먹다남은음식으로 회복했다!");
      }
      if (pokemon.hp <= 0) handleFaint(next, side === "own" ? "foe" : "own", pokemon);
    });
    if (next.field.weather && next.field.weatherUntil <= next.turn) { next.field.weather = ""; addLog(next, "날씨가 원래대로 돌아왔다."); }
    if (next.field.trickRoomUntil === next.turn) addLog(next, "트릭룸이 사라졌다.");
  };
  const absorbByAbility = (next, attacker, defender, move) => {
    if (["moldbreaker", "teravolt", "turboblaze"].includes(attacker.ability)) return false;
    const type = idOf(move.type);
    const ability = defender.ability;
    const immunity = ability === "levitate" && type === "ground" ||
      ["waterabsorb", "dryskin", "stormdrain"].includes(ability) && type === "water" ||
      ["voltabsorb", "lightningrod", "motordrive"].includes(ability) && type === "electric" ||
      ability === "flashfire" && type === "fire" || ability === "sapsipper" && type === "grass" ||
      ability === "eartheater" && type === "ground" || ability === "wellbakedbody" && type === "fire";
    if (!immunity) return false;
    addLog(next, defender.nickname + "의 " + abilityName(defender) + "! " + moveName(move.id) + "을(를) 막았다!");
    if (["waterabsorb", "dryskin", "voltabsorb", "eartheater"].includes(ability))
      defender.hp = Math.min(statOf(defender, "hp"), defender.hp + Math.max(1, Math.floor(statOf(defender, "hp") / 4)));
    if (ability === "stormdrain" || ability === "lightningrod") boostStages(next, defender, { spa: 1 }, false);
    if (ability === "motordrive") boostStages(next, defender, { spe: 1 }, false);
    if (ability === "sapsipper") boostStages(next, defender, { atk: 1 }, false);
    if (ability === "wellbakedbody") boostStages(next, defender, { def: 2 }, false);
    if (ability === "flashfire") defender.flashFire = true;
    return true;
  };
  const attackWith = async (next, side, slot, plannedMoveId = "") => {
    const attacker = side === "own" ? activeOf(next) : next.foe;
    const defender = side === "own" ? next.foe : activeOf(next);
    if (!attacker || !defender || attacker.hp <= 0 || defender.hp <= 0) return;
    if (attacker.skyDropHeldBy && attacker.skyDropUntilTurn >= next.turn && defender.chargingMove === "skydrop") {
      addLog(next, attacker.nickname + "은(는) 프리폴에 붙잡혀 움직일 수 없다!"); return;
    }
    if (attacker.rechargeUntil >= next.turn) {
      attacker.rechargeUntil = 0;
      addLog(next, attacker.nickname + "은(는) 반동으로 움직일 수 없다!");
      return;
    }
    const continuingCharge = !!attacker.chargingMove;
    if (continuingCharge) {
      slot = attacker.chargingSlot;
    }
    let moveId = slot < 0 ? "struggle" : attacker.moves[slot];
    let move = moveInfo(moveId);
    if (continuingCharge) {
      attacker.chargingMove = "";
      if (moveId === "skydrop") { defender.skyDropHeldBy = ""; defender.skyDropUntilTurn = 0; }
    }
    const faintSelfDestruct = () => {
      if (!SELF_KO_MOVES.has(moveId) || attacker.hp <= 0) return;
      attacker.hp = 0;
      addLog(next, attacker.nickname + "이(가) 온 힘을 다해 쓰러졌다!");
    };

    if (attacker.disableUntil >= next.turn && attacker.disabledMove === moveId || attacker.encoreUntil >= next.turn && attacker.encoreMove && attacker.encoreMove !== moveId || attacker.tormentUntil >= next.turn && attacker.lastMove === moveId || defender.imprisonedMoves && defender.imprisonedMoves.includes(moveId)) { addLog(next, attacker.nickname + "은(는) 그 기술을 사용할 수 없다!"); return; }
    if (String(attacker.status).toLowerCase() === "slp" && !["sleeptalk", "snore"].includes(moveId)) {
      attacker.sleepTurns = Math.max(0, (attacker.sleepTurns || 2) - 1);
      if (attacker.sleepTurns) { addLog(next, attacker.nickname + "은(는) 잠들어 있다!"); return; }
      attacker.status = "NORMAL"; addLog(next, attacker.nickname + "이(가) 깨어났다!");
    }
    if (String(attacker.status).toLowerCase() === "frz") {
      if (Math.random() >= .2) { addLog(next, attacker.nickname + "은(는) 얼어붙어 움직일 수 없다!"); return; }
      attacker.status = "NORMAL"; addLog(next, attacker.nickname + "의 얼음이 녹았다!");
    }
    if (String(attacker.status).toLowerCase() === "par" && Math.random() < .25) {
      addLog(next, attacker.nickname + "은(는) 몸이 저려 움직일 수 없다!"); return;
    }
    if (attacker.attractedTo === defender.uid && Math.random() < .5) { addLog(next, attacker.nickname + "은(는) 헤롱헤롱해 움직일 수 없다!"); return; }
    if (attacker.flinchTurn === next.turn) { addLog(next, attacker.nickname + "은(는) 풀죽어서 움직일 수 없다!"); return; }
    if (attacker.tauntUntil >= next.turn && move.category === "Status" && moveId !== "struggle") {
      addLog(next, attacker.nickname + "은(는) 도발 때문에 변화기를 쓸 수 없다!"); return;
    }
    if (attacker.confusionTurns > 0) {
      attacker.confusionTurns -= 1;
      if (Math.random() < 1 / 3) {
        const selfHit = Math.max(1, Math.floor(statOf(attacker, "hp") / 8));
        attacker.hp = Math.max(0, attacker.hp - selfHit);
        addLog(next, attacker.nickname + "은(는) 혼란으로 자신을 공격했다! " + selfHit + " 피해!"); return;
      }
      if (!attacker.confusionTurns) addLog(next, attacker.nickname + "의 혼란이 풀렸다!");
    }
    if (slot >= 0 && !continuingCharge) attacker.pp[slot] = Math.max(0, attacker.pp[slot] - (defender.ability === "pressure" ? 2 : 1));
    attacker.actedTurn = next.turn;
    if (moveId !== "destinybond") attacker.destinyBondTurn = 0;
    if (["suckerpunch", "thunderclap"].includes(moveId) && (!plannedMoveId || moveInfo(plannedMoveId).category === "Status" || defender.actedTurn === next.turn) ||
      moveId === "upperhand" && (!plannedMoveId || (moveInfo(plannedMoveId).priority || 0) <= 0 || defender.actedTurn === next.turn) ||
      moveId === "focuspunch" && attacker.lastDamageTurn === next.turn) {
      attacker.lastMove = moveId;
      attacker.lastMoveFailed = true;
      addLog(next, attacker.nickname + "의 " + moveName(moveId) + "은(는) 실패했다!");
      return;
    }
    if (PROTECT_MOVES.has(moveId)) {
      const chance = Math.pow(1 / 3, attacker.protectStreak || 0);
      if (Math.random() >= chance) { attacker.protectStreak = 0; attacker.lastMoveFailed = true; addLog(next, attacker.nickname + "의 방어가 실패했다!"); return; }
      attacker.protectStreak = Math.min(6, (attacker.protectStreak || 0) + 1);
    } else attacker.protectStreak = 0;
    if (!continuingCharge && moveId === "skydrop" &&
      ((defender.battleTypes || info(defender).types).some(type => idOf(type) === "flying") ||
        (catalog.dex[defender.species]?.weightkg || 50) >= 200)) {
      attacker.lastMoveFailed = true; addLog(next, "상대를 들어 올릴 수 없다!"); return;
    }
    if (!continuingCharge && CHARGE_MOVES.has(moveId)) {
      const weather = idOf(next.field.weather);
      const instant = (["solarbeam", "solarblade"].includes(moveId) && weather === "sunnyday") ||
        (moveId === "electroshot" && weather === "raindance") || attacker.heldItem === "powerherb";
      if (["meteorbeam", "electroshot"].includes(moveId)) boostStages(next, attacker, { spa: 1 }, false);
      if (moveId === "skullbash") boostStages(next, attacker, { def: 1 }, false);
      if (attacker.heldItem === "powerherb") { attacker.usedItem = attacker.heldItem; attacker.heldItem = ""; }
      if (!instant) {
        attacker.chargingMove = moveId;
        attacker.chargingSlot = slot;
        if (moveId === "skydrop") { defender.skyDropHeldBy = attacker.uid; defender.skyDropUntilTurn = next.turn + 1; }
        addLog(next, attacker.nickname + "이(가) " + moveName(moveId) + "을(를) 준비한다!");
        return;
      }
    }
    if (["fakeout", "firstimpression"].includes(moveId) && attacker.enteredTurn !== next.turn) {
      attacker.lastMove = moveId;
      addLog(next, attacker.nickname + "의 " + moveName(moveId) + "은(는) 등장한 첫 턴에만 통한다!");
      return;
    }
    if (moveId === "poltergeist" && !defender.heldItem) {
      attacker.lastMove = moveId;
      attacker.lastMoveFailed = true;
      addLog(next, "상대에게 지닌물건이 없어 " + moveName(moveId) + "이(가) 실패했다!");
      return;
    }
    if (moveId === "snore" && idOf(attacker.status) !== "slp" || moveId === "dreameater" && idOf(defender.status) !== "slp" ||
      moveId === "steelroller" && !next.field.terrain || moveId === "belch" && !attacker.usedBerry ||
      moveId === "burnup" && !(attacker.battleTypes || info(attacker).types).some(type => idOf(type) === "fire") ||
      moveId === "doubleshock" && !(attacker.battleTypes || info(attacker).types).some(type => idOf(type) === "electric") ||
      moveId === "darkvoid" && attacker.species !== "darkrai" ||
      moveId === "captivate" && (!attacker.gender || !defender.gender || attacker.gender === defender.gender) ||
      moveId === "shelltrap" && (attacker.lastDamageTurn !== next.turn || attacker.lastDamageCategory !== "Physical") ||
      moveId === "lastresort" && attacker.moves.some(id => id !== "lastresort" && !(attacker.usedMoves || []).includes(id))) {
      attacker.lastMove = moveId; attacker.lastMoveFailed = true;
      addLog(next, moveName(moveId) + "의 사용 조건을 만족하지 못했다!"); return;
    }
    if (moveId === "instruct") {
      const replaySlot = defender.moves.indexOf(defender.lastMove);
      addLog(next, attacker.nickname + "의 지휘!");
      if (replaySlot >= 0 && defender.lastMove !== "instruct" && defender.pp[replaySlot] > 0) await attackWith(next, side === "own" ? "foe" : "own", replaySlot);
      else addLog(next, "되풀이할 기술이 없다.");
      return;
    }
    if (["mirrormove", "copycat", "mefirst", "metronome", "naturepower", "sleeptalk", "assist"].includes(moveId)) {
      const callId = moveId;
      let choices = [];
      if (callId === "mirrormove" || callId === "copycat") choices = [defender.lastMove];
      if (callId === "mefirst") choices = defender.moves.filter(id => moveInfo(id).category !== "Status");
      if (callId === "sleeptalk") choices = attacker.moves.filter(id => id !== callId && id !== "sleeptalk");
      if (callId === "assist") choices = (side === "own" ? next.owned.filter(p => !p.inBox && p.hp > 0) : next.foes.filter(p => p.hp > 0)).flatMap(p => p.moves).filter(id => id !== callId && id !== "assist");
      if (callId === "metronome") choices = Object.keys(catalog.moves).filter(id => catalog.moves[id].basePower > 0 && catalog.moves[id].category !== "Status");
      if (callId === "naturepower") choices = [({ electricterrain: "thunderbolt", grassyterrain: "energyball", psychicterrain: "psychic", mistyterrain: "moonblast" }[next.field.terrain] || "triattack")];
      choices = choices.filter(id => id && id !== callId && catalog.moves[id]);
      if (!choices.length) { addLog(next, moveName(callId) + "은(는) 효과가 없었다."); return; }
      moveId = choices[Math.floor(Math.random() * choices.length)]; move = moveInfo(moveId);
      addLog(next, moveName(callId) + "이(가) " + moveName(moveId) + "을(를) 불러냈다!");
    }
    if (attacker.powderTurn === next.turn && idOf(move.type) === "fire") { attacker.hp = Math.max(0, attacker.hp - Math.max(1, Math.floor(statOf(attacker, "hp") / 4))); addLog(next, attacker.nickname + "에게 분진이 폭발했다!"); if (attacker.hp <= 0) handleFaint(next, side === "own" ? "foe" : "own", attacker); return; }
    const weatherTypes = { sunnyday: "Fire", raindance: "Water", sandstorm: "Rock", hail: "Ice", snowscape: "Ice" };
    const terrainTypes = { electricterrain: "Electric", grassyterrain: "Grass", mistyterrain: "Fairy", psychicterrain: "Psychic" };
    if (moveId === "weatherball" && weatherTypes[idOf(next.field.weather)]) move = { ...move, type: weatherTypes[idOf(next.field.weather)], basePower: 100 };
    if (moveId === "terrainpulse" && terrainTypes[idOf(next.field.terrain)]) move = { ...move, type: terrainTypes[idOf(next.field.terrain)], basePower: 100 };
    if (moveId === "revelationdance" && (attacker.battleTypes || info(attacker).types).length) move = { ...move, type: (attacker.battleTypes || info(attacker).types)[0] };
    if (moveId === "hiddenpower") {
      const ivs = attacker.ivs || {};
      const bits = ["hp", "atk", "def", "spe", "spa", "spd"].reduce((sum, key, index) => sum + ((Number(ivs[key]) || 0) & 1) * Math.pow(2, index), 0);
      const types = ["Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost", "Steel", "Fire", "Water", "Grass", "Electric", "Psychic", "Ice", "Dragon", "Dark"];
      move = { ...move, type: types[Math.floor(bits * 15 / 63)] };
    }
    if (moveId === "aurawheel" && attacker.species === "morpekohangry") move = { ...move, type: "Dark" };
    if (moveId === "judgment" || moveId === "multiattack" || moveId === "technoblast") {
      const suffix = moveId === "judgment" ? "plate" : moveId === "multiattack" ? "memory" : "drive";
      const item = idOf(attacker.heldItem || "");
      const itemTypes = { flame: "fire", splash: "water", zap: "electric", meadow: "grass", icicle: "ice", fist: "fighting", toxic: "poison", earth: "ground", sky: "flying", mind: "psychic", insect: "bug", stone: "rock", spooky: "ghost", draco: "dragon", dread: "dark", iron: "steel", pixie: "fairy", douse: "water", shock: "electric", burn: "fire", chill: "ice" };
      const stem = item.endsWith(suffix) ? item.slice(0, -suffix.length) : "";
      const type = itemTypes[stem] || stem;
      const typeName = Object.keys(TYPE).find(key => key === type);
      if (typeName) move = { ...move, type: typeName };
    }
    if (attacker.electrifiedTurn === next.turn || idOf(move.type) === "normal" && next.field.ionDelugeTurn === next.turn) move = { ...move, type: "Electric" };
    await moveForm(next, attacker, side, moveId);
    attacker.previousMove = attacker.lastMove || ""; attacker.lastMove = moveId;
    next.previousActionMove = next.lastActionTurn === next.turn ? next.lastActionMove || "" : "";
    next.lastActionMove = moveId; next.lastActionTurn = next.turn;
    attacker.usedMoves = [...new Set([...(attacker.usedMoves || []), moveId])];
    const stamp = Date.now() + Math.random();
    const weather = idOf(next.field.weather);
    const weatherPerfect = weather === "raindance" && ["thunder", "hurricane"].includes(moveId) ||
      ["hail", "snowscape"].includes(weather) && moveId === "blizzard" ||
      moveId === "toxic" && (attacker.battleTypes || info(attacker).types).some((type) => idOf(type) === "poison");
    const baseAccuracy = weather === "sunnyday" && ["thunder", "hurricane"].includes(moveId) ? 50 : move.accuracy;
    const hitRate = typeof baseAccuracy === "number" ? baseAccuracy *
      stageFactor(attacker.stages && attacker.stages.accuracy || 0, true) /
      stageFactor(defender.stages && defender.stages.evasion || 0, true) *
      (attacker.ability === "hustle" && move.category === "Physical" ? .8 : 1) *
      (attacker.ability === "compoundeyes" ? 1.3 : 1) : 100;
    const invulnerable = ["fly", "bounce", "dig", "dive", "phantomforce", "shadowforce"].includes(defender.chargingMove) &&
      !(["fly", "bounce"].includes(defender.chargingMove) && ["thunder", "hurricane", "gust", "twister"].includes(moveId)) &&
      !(defender.chargingMove === "dig" && ["earthquake", "magnitude"].includes(moveId));
    const missed = invulnerable || !weatherPerfect && attacker.lockOnUid !== defender.uid && attacker.ability !== "noguard" && defender.ability !== "noguard" && Math.random() * 100 >= hitRate;
    setAnim({ kind: "attack", side, stage: move.category === "Status" ? "status" : "lunge", type: idOf(move.type), category: move.category, moveId, stamp });
    await delay(move.category === "Status" ? 450 : 360);
    if (!missed && move.category !== "Status") setAnim({ kind: "attack", side, stage: "impact", type: idOf(move.type), category: move.category, moveId, stamp });
    await delay(missed ? 180 : move.category === "Status" ? 130 : 360);
    addLog(next, attacker.nickname + "의 " + moveName(moveId) + "!");
    if (["futuresight", "doomdesire"].includes(moveId)) {
      const targetSide = side === "own" ? "foe" : "own";
      const alreadyQueued = !!next.field[targetSide].delayedAttack;
      if (alreadyQueued) addLog(next, "이미 미래의 공격이 기다리고 있다.");
      else {
        next.field[targetSide].delayedAttack = { turn: next.turn + 2, moveId, user: { ...attacker, stages: { ...(attacker.stages || {}) } } };
        addLog(next, "미래의 공격을 준비했다!");
      }
      attacker.lastMoveFailed = alreadyQueued;
      setAnim(null); return;
    }
    const targetSelf = move.effect && ["self", "allies", "allySide"].includes(move.effect.target);
    if (!targetSelf && defender.protectTurn === next.turn) {
      if (POKEMON_CONTACT_MOVES.has(moveId)) {
        if (defender.protectKind === "spikyshield") attacker.hp = Math.max(0, attacker.hp - Math.max(1, Math.floor(statOf(attacker, "hp") / 8)));
        if (defender.protectKind === "banefulbunker") setMajorStatus(next, attacker, "psn");
        if (defender.protectKind === "kingsshield") boostStages(next, attacker, { atk: -1 }, true);
        if (defender.protectKind === "obstruct") boostStages(next, attacker, { def: -2 }, true);
        if (defender.protectKind === "silktrap") boostStages(next, attacker, { spe: -1 }, true);
        if (defender.protectKind === "burningbulwark") setMajorStatus(next, attacker, "brn");
      }
      addLog(next, defender.nickname + "은(는) 공격을 막았다!"); setAnim(null);
      faintSelfDestruct();
      if (attacker.hp <= 0 && !next.outcome) handleFaint(next, side === "own" ? "foe" : "own", attacker);
      return;
    }
    if (!targetSelf && move.category === "Status" && defender.substituteHp > 0) {
      addLog(next, defender.nickname + "의 대타가 변화기를 막았다!"); setAnim(null); return;
    }
    if (missed) {
      attacker.lastMoveFailed = true;
      addLog(next, "공격이 빗나갔다!");
      if (["highjumpkick", "jumpkick", "axekick", "supercellslam"].includes(moveId)) {
        const crash = Math.max(1, Math.floor(statOf(attacker, "hp") / 2));
        attacker.hp = Math.max(0, attacker.hp - crash);
        addLog(next, attacker.nickname + "이(가) 착지에 실패해 " + crash + " 피해를 받았다!");
      }
      faintSelfDestruct();
      if (attacker.hp <= 0 && !next.outcome) handleFaint(next, side === "own" ? "foe" : "own", attacker);
      setAnim(null);
      return;
    }
    if (!targetSelf && (moveId === "thunderwave" && effectiveness("electric", defender) === 0 ||
      ["spore", "sleeppowder", "poisonpowder", "stunspore", "cottonspore", "powder"].includes(moveId) &&
      ((defender.battleTypes || info(defender).types).some((type) => idOf(type) === "grass") ||
        defender.ability === "overcoat" || defender.heldItem === "safetygoggles"))) {
      addLog(next, defender.nickname + "에게는 효과가 없었다!"); setAnim(null); return;
    }
    if (!targetSelf && !(moveId === "thousandarrows" && defender.ability === "levitate") && absorbByAbility(next, attacker, defender, move)) { faintSelfDestruct(); if (attacker.hp <= 0 && !next.outcome) handleFaint(next, side === "own" ? "foe" : "own", attacker); setAnim(null); return; }
    if (!targetSelf && defender.beakBlastTurn === next.turn && POKEMON_CONTACT_MOVES.has(moveId)) setMajorStatus(next, attacker, "brn");
    if (move.category === "Status") {
      if (targetSelf && defender.snatchTurn === next.turn) { defender.snatchTurn = 0; addLog(next, defender.nickname + "이(가) 기술을 가로챘다!"); applyStatusMove(next, defender, attacker, moveId, move, side === "own" ? "foe" : "own"); }
      else applyStatusMove(next, attacker, defender, moveId, move, side);
      attacker.lastMoveFailed = false;
      showBattleFrame(next);
      await delay(220);
      setAnim(null);
      if (attacker.hp <= 0) handleFaint(next, side === "own" ? "foe" : "own", attacker);
      return;
    }
    const hit = specialDamage(next, attacker, defender, move, moveId);
    if (hit && hit.failed || !hit && !(Number(move.basePower) > 0)) {
      attacker.lastMoveFailed = true;
      addLog(next, "효과가 없었다."); faintSelfDestruct(); if (attacker.hp <= 0 && !next.outcome) handleFaint(next, side === "own" ? "foe" : "own", attacker); setAnim(null); return;
    }
    const result = hit || damageOf(next, attacker, defender, move);
    attacker.lastMoveFailed = result.effect === 0;
    const multi = POKEMON_MULTI_HITS[moveId];
    const hitCount = !multi ? 1 : typeof multi === "number" ? multi : multi[0] === multi[1] ? multi[0] : [2, 2, 3, 3, 4, 5][Math.floor(Math.random() * 6)];
    const defendingSide = side === "own" ? "foe" : "own";
    const barriers = next.field[defendingSide];
    if (attacker.ability !== "infiltrator" && barriers && (barriers.auroraveil >= next.turn || barriers[move.category === "Physical" ? "reflect" : "lightscreen"] >= next.turn)) {
      result.damage = Math.max(1, Math.floor(result.damage / 2));
    }
    if (attacker.ability !== "infiltrator" && defender.substituteHp > 0 && result.effect !== 0) {
      defender.substituteHp = Math.max(0, defender.substituteHp - result.damage);
      addLog(next, defender.nickname + "의 대타가 " + result.damage + " 피해를 받았다!" + (defender.substituteHp ? "" : " 대타가 사라졌다!"));
      faintSelfDestruct(); if (attacker.hp <= 0 && !next.outcome) handleFaint(next, side === "own" ? "foe" : "own", attacker);
      setAnim(null); return;
    }
    const oldHp = defender.hp;
    let actualHits = 0;
    for (let n = 0; n < hitCount && defender.hp > 0 && result.effect !== 0; n++) {
      if (n > 0 && ["populationbomb", "tripleaxel", "triplekick"].includes(moveId) &&
        Math.random() * 100 >= (typeof move.accuracy === "number" ? move.accuracy : 100)) break;
      actualHits += 1;
      const beforeHit = defender.hp;
      let hitDamage = result.damage;
      if (n > 0) {
        const nextPower = ["tripleaxel", "triplekick"].includes(moveId) ? move.basePower * (n + 1) : move.basePower;
        hitDamage = damageOf(next, attacker, defender, { ...move, basePower: nextPower }).damage;
        if (attacker.ability !== "infiltrator" && barriers &&
          (barriers.auroraveil >= next.turn || barriers[move.category === "Physical" ? "reflect" : "lightscreen"] >= next.turn))
          hitDamage = Math.max(1, Math.floor(hitDamage / 2));
      }
      if (moveId !== "falseswipe" && defender.heldItem === "focussash" && beforeHit === statOf(defender, "hp") && hitDamage >= beforeHit) {
        defender.hp = 1; defender.heldItem = ""; addLog(next, defender.nickname + "은(는) 기합의띠로 버텼다!");
      } else if (moveId !== "falseswipe" && defender.ability === "sturdy" && beforeHit === statOf(defender, "hp") && hitDamage >= beforeHit) {
        defender.hp = 1; addLog(next, defender.nickname + "의 옹골참이 공격을 버텼다!");
      } else defender.hp = Math.max(moveId === "falseswipe" || defender.endureTurn === next.turn ? 1 : 0, defender.hp - hitDamage);
    }
    if (hitCount > 1) addLog(next, actualHits + "회 명중했다!");
    const damageDealt = Math.max(0, oldHp - defender.hp);
    if (damageDealt) { defender.lastDamageTaken = damageDealt; defender.lastDamageTurn = next.turn; defender.lastDamageCategory = move.category; defender.timesHit = (defender.timesHit || 0) + actualHits; }
    if (damageDealt && moveId === "payday" && side === "own") {
      next.payDayMoney = (next.payDayMoney || 0) + attacker.level * 5;
      addLog(next, "바닥에 동전이 흩어졌다!");
    }
    if (damageDealt && moveId === "thief" && !attacker.heldItem && defender.heldItem) {
      attacker.heldItem = defender.heldItem; defender.heldItem = "";
      addLog(next, attacker.nickname + "이(가) 상대의 지닌물건을 훔쳤다!");
    }
    if (damageDealt && moveId === "covet" && !attacker.heldItem && defender.heldItem) {
      attacker.heldItem = defender.heldItem; defender.heldItem = "";
      addLog(next, attacker.nickname + "이(가) 상대의 지닌물건을 가져왔다!");
    }
    if (damageDealt && moveId === "knockoff" && defender.heldItem) {
      defender.usedItem = defender.heldItem; defender.heldItem = "";
      addLog(next, defender.nickname + "의 지닌물건이 떨어졌다!");
    }
    if (damageDealt && ["bugbite", "pluck"].includes(moveId) && defender.heldItem?.endsWith("berry")) {
      const berry = defender.heldItem; defender.heldItem = ""; defender.usedItem = berry;
      if (berry === "oranberry" || berry === "sitrusberry") {
        const amount = berry === "oranberry" ? 10 : Math.max(1, Math.floor(statOf(attacker, "hp") / 4));
        attacker.hp = Math.min(statOf(attacker, "hp"), attacker.hp + amount);
      }
      addLog(next, attacker.nickname + "이(가) 상대의 열매를 먹었다!");
    }
    if (damageDealt && moveId === "incinerate" && /berry$/.test(defender.heldItem || "")) {
      defender.usedItem = defender.heldItem; defender.heldItem = "";
      addLog(next, defender.nickname + "의 열매가 타 버렸다!");
    }
    if (moveId === "finalgambit" && damageDealt) attacker.hp = 0;
    if (moveId === "skydrop") { defender.skyDropHeldBy = ""; defender.skyDropUntilTurn = 0; }
    if (defender.hp > 0 && defender.hp <= statOf(defender, "hp") / 2 &&
      (defender.heldItem === "oranberry" || defender.heldItem === "sitrusberry")) {
      const berry = defender.heldItem;
      defender.hp = Math.min(statOf(defender, "hp"), defender.hp +
        (berry === "oranberry" ? 10 : Math.max(1, Math.floor(statOf(defender, "hp") / 4))));
      defender.heldItem = "";
      defender.usedBerry = true;
      addLog(next, defender.nickname + "이(가) 열매를 먹고 HP를 회복했다!");
    }
    addLog(next, result.effect === 0 ? "효과가 없다!" : defender.nickname + "에게 " + damageDealt + " 피해!" + (result.effect > 1 ? " 효과가 굉장하다!" : result.effect < 1 ? " 효과가 별로다." : ""));
    const extra = POKEMON_DAMAGE_EFFECTS[moveId];
    if (extra && result.effect !== 0) {
      if (extra.o) boostStages(next, attacker, extra.o, false);
      if (defender.hp > 0) (extra.x || []).forEach((effect) => {
        if (attacker.ability === "sheerforce" && extra.x.length) return;
        if (Math.random() * 100 >= (effect.c == null ? 100 : effect.c)) return;
        if (effect.b) boostStages(next, defender, effect.b);
        if (effect.o) boostStages(next, attacker, effect.o, false);
        if (effect.s) setMajorStatus(next, defender, effect.s);
        if (effect.v === "flinch") defender.flinchTurn = next.turn;
        if (effect.v === "confusion") { defender.confusionTurns = 2 + Math.floor(Math.random() * 3); addLog(next, defender.nickname + "은(는) 혼란에 빠졌다!"); }
      });
      if (extra.d && damageDealt) {
        const amount = Math.max(1, Math.floor(damageDealt * extra.d[0] / extra.d[1]));
        attacker.hp = Math.min(statOf(attacker, "hp"), attacker.hp + amount);
        addLog(next, attacker.nickname + "이(가) " + amount + " HP를 흡수했다!");
      }
      if (extra.r && damageDealt && attacker.ability !== "rockhead" && attacker.ability !== "magicguard") {
        const amount = Math.max(1, Math.floor(damageDealt * extra.r[0] / extra.r[1]));
        attacker.hp = Math.max(0, attacker.hp - amount);
        addLog(next, attacker.nickname + "이(가) 반동으로 " + amount + " 피해를 받았다!");
      }
    }
    if (damageDealt && POKEMON_CONTACT_MOVES.has(moveId) && attacker.hp > 0 && defender.hp > 0 && !["moldbreaker", "teravolt", "turboblaze"].includes(attacker.ability)) {
      if (["roughskin", "ironbarbs"].includes(defender.ability) && attacker.ability !== "magicguard") {
        const amount = Math.max(1, Math.floor(statOf(attacker, "hp") / 8));
        attacker.hp = Math.max(0, attacker.hp - amount);
        addLog(next, defender.nickname + "의 " + abilityName(defender) + "! " + amount + " 반동 피해!");
      }
      if (defender.ability === "static" && Math.random() < .3) setMajorStatus(next, attacker, "par");
      if (defender.ability === "flamebody" && Math.random() < .3) setMajorStatus(next, attacker, "brn");
      if (defender.ability === "poisonpoint" && Math.random() < .3) setMajorStatus(next, attacker, "psn");
    }
    if (moveId === "clearsmog" && damageDealt) { defender.stages = {}; addLog(next, defender.nickname + "의 능력 변화가 사라졌다!"); }
    if (moveId === "freezyfrost" && damageDealt) { attacker.stages = {}; defender.stages = {}; addLog(next, "모든 능력 변화가 사라졌다!"); }
    if (moveId === "sappyseed" && damageDealt && !(defender.battleTypes || info(defender).types).some(type => idOf(type) === "grass")) { defender.seededBy = side; addLog(next, defender.nickname + "에게 씨뿌리기가 통했다!"); }
    if (damageDealt && moveId === "smellingsalts" && defender.status === "par" || damageDealt && moveId === "wakeupslap" && defender.status === "slp") {
      defender.status = "NORMAL"; defender.sleepTurns = 0; addLog(next, defender.nickname + "의 상태 이상이 나았다!");
    }
    if (damageDealt && ["brickbreak", "psychicfangs", "ragingbull"].includes(moveId)) {
      ["reflect", "lightscreen", "auroraveil"].forEach(key => { next.field[side === "own" ? "foe" : "own"][key] = 0; });
      addLog(next, "상대의 벽이 깨졌다!");
    }
    if (damageDealt && ["stoneaxe", "ceaselessedge"].includes(moveId)) {
      const fieldSide = next.field[side === "own" ? "foe" : "own"];
      if (moveId === "stoneaxe") fieldSide.stealthrock = 99;
      else fieldSide.spikes = Math.min(3, (fieldSide.spikes || 0) + 1);
      addLog(next, "상대 필드에 설치 기술이 깔렸다!");
    }
    if (damageDealt && moveId === "icespinner") { next.field.terrain = ""; next.field.terrainUntil = 0; addLog(next, "필드의 지형이 사라졌다!"); }
    if (damageDealt && moveId === "burnup" || damageDealt && moveId === "doubleshock") {
      const removedType = moveId === "burnup" ? "fire" : "electric";
      attacker.battleTypes = (attacker.battleTypes || info(attacker).types).filter(type => idOf(type) !== removedType);
      addLog(next, attacker.nickname + "의 " + (removedType === "fire" ? "불꽃" : "전기") + " 타입이 사라졌다!");
    }
    if (damageDealt && ["thousandwaves", "spiritshackle", "anchorshot", "jawlock"].includes(moveId)) {
      defender.trappedUntil = next.turn + 99;
      if (moveId === "jawlock") attacker.trappedUntil = next.turn + 99;
      addLog(next, defender.nickname + "은(는) 교체할 수 없다!");
    }
    if (damageDealt && moveId === "coreenforcer" && defender.actedTurn === next.turn) {
      defender.ability = ""; addLog(next, defender.nickname + "의 특성이 봉인됐다!");
    }
    if (damageDealt && moveId === "steelroller") { next.field.terrain = ""; next.field.terrainUntil = 0; addLog(next, "필드의 지형이 사라졌다!"); }
    if (damageDealt && moveId === "fellstinger" && defender.hp <= 0) boostStages(next, attacker, { atk: 3 }, false);
    if (["rapidspin", "mortalspin"].includes(moveId) && damageDealt) { const ownField = next.field[side === "own" ? "own" : "foe"]; ["spikes", "stealthrock", "toxicspikes", "stickyweb"].forEach(key => { ownField[key] = 0; }); attacker.seededBy = ""; addLog(next, "설치된 기술이 제거됐다!"); }
    if (moveId === "sparklingaria" && damageDealt && defender.status === "brn") { defender.status = "NORMAL"; addLog(next, defender.nickname + "의 화상이 나았다!"); }
    if (moveId === "saltcure" && damageDealt) defender.saltCure = true;
    if (moveId === "syrupbomb" && damageDealt) defender.syrupTurns = 3;
    if (moveId === "psychicnoise" && damageDealt) defender.healBlockUntil = next.turn + 2;
    if (["uturn", "voltswitch", "flipturn"].includes(moveId) && damageDealt &&
      (side === "own" ? next.owned.some(pokemon => !pokemon.inBox && pokemon.hp > 0 && pokemon.uid !== attacker.uid)
        : next.foes.some((pokemon, index) => index !== next.foeIndex && pokemon.hp > 0))) attacker.forceSwitch = true;
    if (["dragontail", "circlethrow"].includes(moveId) && damageDealt) defender.forceSwitch = true;
    if (RECHARGE_MOVES.has(moveId) && damageDealt) attacker.rechargeUntil = next.turn + 1;
    if (idOf(move.type) === "fire" && defender.status === "frz" && damageDealt) { defender.status = "NORMAL"; addLog(next, defender.nickname + "의 얼음이 녹았다!"); }
    showBattleFrame(next);
    await delay(430);
    setAnim(null);
    if (defender.hp <= 0 && defender.grudgeTurn === next.turn) { const index = attacker.moves.indexOf(moveId); if (index >= 0) attacker.pp[index] = 0; addLog(next, "원념으로 " + moveName(moveId) + "의 PP가 0이 됐다!"); }
    const bonded = defender.hp <= 0 && defender.destinyBondTurn >= next.turn && attacker.hp > 0;
    if (bonded) { attacker.hp = 0; addLog(next, defender.nickname + "의 길동무로 " + attacker.nickname + "도 쓰러졌다!"); }
    if (defender.hp <= 0) handleFaint(next, side, defender);
    faintSelfDestruct();
    if (attacker.hp <= 0 && (!next.outcome || bonded)) handleFaint(next, side === "own" ? "foe" : "own", attacker);
  };
  const catchChance = (foe, ballId) => {
    const maxHp = statOf(foe, "hp");
    const rate = meta ? meta.catchRate : 45;
    const condition = idOf(foe.status || "normal");
    const statusBonus = ["slp", "frz"].includes(condition) ? 2.5 : ["par", "brn", "psn", "tox"].includes(condition) ? 1.5 : 1;
    return Math.max(.001, Math.min(.95, ((3 * maxHp - 2 * foe.hp) * rate * (ITEM[ballId] ? ITEM[ballId].rate : 1) * statusBonus) / (3 * maxHp * 255)));
  };
  const saveGame = async (next, nextBag) => {
    const updatedAt = Date.now();
    const persistedOwned = next.owned.map(baseForm);
    if (next.outcome) next.owned = persistedOwned;
    const nextSnapshot = { version: 1, owned: persistedOwned, activeUid: next.activeUid, expShare: !!next.expShare, updatedAt };
    const statusBag = typeof PokemonStatusBW !== "undefined" ? PokemonStatusBW.runtimeBag : null;
    if ([bag, statusBag && statusBag.items, bagMeta && bagMeta.items]
      .some((items) => items && items.keystone > 0)) nextBag.keystone = 1;
    const nextBagMeta = { ...(newest([statusBag, bagMeta]) || bagMeta), version: 1, items: nextBag, updatedAt };
    if (next.outcome === "victory" && !wildEncounter && !next.rewardApplied) {
      const highestLevel = Math.max(1, ...next.foes.map((foe) => Number(foe.level) || 1));
      const prize = clamp((encounter.prizeMoney == null ? highestLevel * 40 : encounter.prizeMoney) * (next.happyHour ? 2 : 1), 0, 9999999);
      next.rewardMoney = prize;
      next.rewardApplied = true;
      nextBagMeta.money = Math.min(9999999, clamp(nextBagMeta.money == null ? initialMoney : nextBagMeta.money, 0, 9999999) + prize);
      addLog(next, trainerName + "에게 승리해 ₽" + prize.toLocaleString() + "을(를) 받았다!");
    }
    if (["victory", "caught"].includes(next.outcome) && !next.payDayApplied && next.payDayMoney > 0) {
      const found = clamp(next.payDayMoney, 0, 9999999);
      nextBagMeta.money = Math.min(9999999, clamp(nextBagMeta.money == null ? initialMoney : nextBagMeta.money, 0, 9999999) + found);
      next.payDayApplied = true;
      addLog(next, "고양이돈받기로 ₽" + found.toLocaleString() + "을(를) 주웠다!");
    }
    PokemonBattle.runtimeState = nextSnapshot;
    PokemonBattle.runtimeBag = nextBagMeta;
    setBagMeta(nextBagMeta);
    setGame(next);
    setBag(nextBag);
    if (typeof PokemonStatusBW !== "undefined" && typeof PokemonStatusBW.acceptBattleState === "function") {
      PokemonStatusBW.acceptBattleState(nextSnapshot, nextBagMeta);
    }
    setMenu(next.pendingSwitch ? "party" : "main");
    setMegaReady(false);
    setNotice("");
    try {
      if (typeof setTemplateValue === "function") {
        await setTemplateValue("POKEMON_STATE", encodeURIComponent(JSON.stringify(nextSnapshot)));
        await setTemplateValue("POKEMON_BAG", encodeURIComponent(JSON.stringify(nextBagMeta)));
      }
    } catch (failure) {
      setNotice("저장 실패: 다음 호출에는 stateText로 보유 목록을 전달해 주세요.");
    }
    if (next.outcome && !next.pendingLearn.length && !next.pendingEvolutions.length && !next.resultSent && typeof sendToAI === "function") {
      next.resultSent = true;
      const message = "{{hidden:POKEMON_RESULT|outcome=" + next.outcome +
        "|species=" + next.foe.species +
        (trainerName ? "|trainer=" + encodeURIComponent(trainerName) + "|partySize=" + next.foes.length + "|prizeMoney=" + (next.rewardMoney || 0) : "") +
        "|nickname=" + encodeURIComponent(next.foe.nickname) +
        (next.foe.shiny ? "|shiny=1" : "") +
        "|ownedCount=" + next.owned.length +
        "|turn=" + next.turn + "}}";
      try { sendToAI(message + "\n[POKEMON_SYNC]" + JSON.stringify(packSync(nextSnapshot, nextBagMeta)) + "[/POKEMON_SYNC]", true); }
      catch (ignore) { /* UI result remains visible */ }
    }
  };
  const chooseLearn = async (forgetIndex) => {
    if (!game || !(game.pendingLearn || []).length || (game.pendingEvolutions || []).length || busy.current) return;
    busy.current = true;
    try {
      const next = cloneGame();
      const request = next.pendingLearn.shift();
      const learner = next.owned.find((pokemon) => pokemon.uid === request.uid);
      if (learner && catalog.moves[request.moveId]) {
        const learnedName = moveName(request.moveId);
        if (forgetIndex >= 0 && forgetIndex < learner.moves.length) {
          const forgottenName = moveName(learner.moves[forgetIndex]);
          learner.moves.splice(forgetIndex, 1);
          learner.pp.splice(forgetIndex, 1);
          learner.moves.push(request.moveId);
          learner.pp.push(catalog.moves[request.moveId].pp);
          syncMoveNames(learner);
          addLog(next, learner.nickname + "이(가) " + forgottenName + "을(를) 잊고 " + learnedName + "을(를) 배웠다!");
        } else if (forgetIndex === -1) {
          addLog(next, learner.nickname + "은(는) " + learnedName + "을(를) 배우지 않았다.");
        }
      }
      const statusBag = typeof PokemonStatusBW !== "undefined" ? PokemonStatusBW.runtimeBag : null;
      const latestBag = newest([statusBag, bagMeta]);
      await saveGame(next, latestBag && latestBag.items ? normalBag(latestBag.items) : bag);
    } finally {
      busy.current = false;
    }
  };
  const finishEvolution = async () => {
    if (!game || !(game.pendingEvolutions || []).length || !evoReady || busy.current) return;
    busy.current = true;
    try {
      const next = cloneGame();
      next.pendingEvolutions.shift();
      const statusBag = typeof PokemonStatusBW !== "undefined" ? PokemonStatusBW.runtimeBag : null;
      const latestBag = newest([statusBag, bagMeta]);
      await saveGame(next, latestBag && latestBag.items ? normalBag(latestBag.items) : bag);
    } finally {
      busy.current = false;
    }
  };
  const takeAction = async (kind, argument) => {
    if (sendOut) return;
    if (!catalog || !game || !meta || !bag || game.outcome || (game.pendingLearn || []).length || (game.pendingEvolutions || []).length || busy.current) return;
    if (game.pendingSwitch && kind !== "switch") return;
    busy.current = true;
    try {
      const next = cloneGame();
      const statusBag = typeof PokemonStatusBW !== "undefined" ? PokemonStatusBW.runtimeBag : null;
      const latestBag = newest([statusBag, bagMeta]);
      const nextBag = { ...(latestBag && latestBag.items ? normalBag(latestBag.items) : bag) };
      const current = activeOf(next);
      if (!current && kind !== "run") return;
      if (kind === "move") {
        await scheduledFoeForm(next);
        await maybeFoeMega(next);
        if (megaReady) { const option = megaOption(current, next); if (option) await megaEvolve(next, current, option); }
        if (argument >= 0 && current.pp[argument] <= 0 && !current.chargingMove && !(current.rechargeUntil >= next.turn)) return;
        const playerMove = moveInfo(current.chargingMove || (argument < 0 ? "struggle" : current.moves[argument]));
        const enemyMoveSlot = enemySlot(next);
        const enemyMove = moveInfo(enemyMoveSlot < 0 ? "struggle" : next.foe.moves[enemyMoveSlot]);
        if (playerMove.id === "beakblast") current.beakBlastTurn = next.turn;
        if (enemyMove.id === "beakblast") next.foe.beakBlastTurn = next.turn;
        const ownPriority = (playerMove.priority || 0) + (playerMove.id === "grassyglide" && next.field.terrain === "grassyterrain" ? 1 : 0) + (current.ability === "prankster" && playerMove.category === "Status" ? 1 : 0) + (current.ability === "galewings" && idOf(playerMove.type) === "flying" && current.hp === statOf(current, "hp") ? 1 : 0);
        const foePriority = (enemyMove.priority || 0) + (enemyMove.id === "grassyglide" && next.field.terrain === "grassyterrain" ? 1 : 0) + (next.foe.ability === "prankster" && enemyMove.category === "Status" ? 1 : 0) + (next.foe.ability === "galewings" && idOf(enemyMove.type) === "flying" && next.foe.hp === statOf(next.foe, "hp") ? 1 : 0);
        const ownSpeed = combatStat(current, "spe", idOf(next.field.weather)) * (next.field.own.tailwind >= next.turn ? 2 : 1);
        const foeSpeed = combatStat(next.foe, "spe", idOf(next.field.weather)) * (next.field.foe.tailwind >= next.turn ? 2 : 1);
        const reversed = next.field.trickRoomUntil >= next.turn;
        const ownFirst = ownPriority !== foePriority ? ownPriority > foePriority
          : ownSpeed !== foeSpeed ? (reversed ? ownSpeed < foeSpeed : ownSpeed > foeSpeed)
          : Math.random() < .5;
        const originalUid = current.uid;
        const originalFoeIndex = next.foeIndex;
        if (ownFirst) {
          await attackWith(next, "own", argument, enemyMove.id);
          resolveForcedSwitch(next);
          if (!next.outcome && next.foeIndex === originalFoeIndex) {
            await attackWith(next, "foe", enemyMoveSlot, playerMove.id);
            resolveForcedSwitch(next);
          }
        } else {
          await attackWith(next, "foe", enemyMoveSlot, playerMove.id);
          resolveForcedSwitch(next);
          if (!next.outcome && next.activeUid === originalUid) {
            await attackWith(next, "own", argument, enemyMove.id);
            resolveForcedSwitch(next);
          }
        }
      } else if (kind === "form") {
        if (next.formChangedTurn === next.turn || !formOptions(current).includes(argument) || current.species === argument) return;
        if (!(await changeForm(next, current, argument, "own"))) return;
        next.formChangedTurn = next.turn;
        await saveGame(next, nextBag);
        return;
      } else if (kind === "switch") {
        const replacement = next.owned.find((pokemon) => pokemon.uid === argument && !pokemon.inBox && pokemon.hp > 0);
        if (next.pendingSwitch) {
          if (!replacement) return;
          next.pendingSwitch = false;
          next.activeUid = replacement.uid;
          replacement.stages = {};
          replacement.enteredTurn = next.turn;
          addLog(next, "가라, " + replacement.nickname + "!");
          applyEntryHazards(next, replacement, "own");
          if (replacement.hp > 0) {
            enterAbility(next, replacement, "own");
            if (!next.participants.includes(replacement.uid)) next.participants.push(replacement.uid);
          } else handleFaint(next, "foe", replacement);
          await saveGame(next, nextBag);
          return;
        }
        if (!replacement || replacement.uid === next.activeUid || current.trappedUntil >= next.turn) return;
        const enemyMoveSlot = enemySlot(next);
        const pursuit = moveInfo(enemyMoveSlot < 0 ? "struggle" : next.foe.moves[enemyMoveSlot]).id === "pursuit";
        if (pursuit) {
          next.pursuitSwitching = true;
          await attackWith(next, "foe", enemyMoveSlot);
          next.pursuitSwitching = false;
          if (current.hp <= 0 || next.outcome) { await saveGame(next, nextBag); return; }
        }
        if (current.ability === "regenerator") current.hp = Math.min(statOf(current, "hp"), current.hp + Math.max(1, Math.floor(statOf(current, "hp") / 3)));
        if (current.ability === "naturalcure") current.status = "NORMAL";
        current.stages = {}; current.substituteHp = 0; current.seededBy = ""; current.tauntUntil = 0; current.confusionTurns = 0; current.saltCure = false; current.tarShot = false; current.chargeUntil = 0; current.chargingMove = ""; current.rechargeUntil = 0; current.noRetreat = false; current.perishTurns = 0; current.trappedUntil = 0;
        next.activeUid = replacement.uid;
        replacement.stages = {};
        replacement.enteredTurn = next.turn;
        applyEntryHazards(next, replacement, "own");
        enterAbility(next, replacement, "own");
        if (replacement.hp <= 0) { handleFaint(next, "foe", replacement); await saveGame(next, nextBag); return; }
        if (!next.participants.includes(replacement.uid)) next.participants.push(replacement.uid);
        addLog(next, "가라, " + replacement.nickname + "!");
        if (!pursuit) await attackWith(next, "foe", enemyMoveSlot);
      } else if (kind === "item") {
        const id = argument && argument.id;
        const target = next.owned.find((pokemon) => pokemon.uid === (argument && argument.uid));
        const item = ITEM[id];
        if (!item || nextBag[id] <= 0 || !canUseBattleItem(item, target, next)) return;
        const maxHp = statOf(target, "hp");
        nextBag[id] -= 1;
        if (item.group === "boost") target.stages = { ...target.stages,
          [item.stat]: Math.min(6, ((target.stages && target.stages[item.stat]) || 0) + 2) };
        if (item.group === "revive") target.hp = Math.max(1, Math.floor(maxHp / 2));
        if (item.group === "heal") target.hp = Math.min(maxHp, target.hp + item.amount);
        if (item.group === "restore") target.hp = maxHp;
        if (item.group === "cure" || item.group === "restore") target.status = "NORMAL";
        addLog(next, target.nickname + "에게 " + item.name + "을(를) 썼다!");
        await attackWith(next, "foe", enemySlot(next));
      } else if (kind === "capture") {
        if (!wildEncounter) return;
        const ballId = argument || "pokeball";
        if (!ITEM[ballId] || ITEM[ballId].group !== "ball" || nextBag[ballId] <= 0) return;
        nextBag[ballId] -= 1;
        addLog(next, ITEM[ballId].name + "을(를) 던졌다!");
        const stamp = Date.now() + Math.random();
        setAnim({ kind: "capture", stage: "throw", stamp });
        await delay(650);
        const caughtNow = Math.random() < catchChance(next.foe, ballId);
        const shakeCount = caughtNow ? 3 : 1 + Math.floor(Math.random() * 3);
        for (let shake = 1; shake <= shakeCount; shake++) {
          setAnim({ kind: "capture", stage: "shake", shake, stamp: stamp + shake });
          await delay(500);
        }
        setAnim({ kind: "capture", stage: caughtNow ? "success" : "breakout", stamp });
        await delay(420);
        setAnim(null);
        if (caughtNow) {
          const caught = { ...next.foe, uid: "caught-" + Date.now() + "-" + Math.floor(Math.random() * 1000000), pp: [...next.foe.pp], inBox: next.owned.filter((pokemon) => !pokemon.inBox).length >= 6 };
          next.owned.push(caught);
          next.owned.filter((pokemon) => pokemon.hp > 0 && next.participants.includes(pokemon.uid)).forEach(awardEvs);
          awardExperience(next);
          next.outcome = "caught";
          addLog(next, (caught.shiny ? "색이 다른 " : "") + caught.nickname + " 포획 성공! 보유 목록에 추가됐다.");
        } else {
          addLog(next, "포켓몬이 볼에서 빠져나왔다!");
          await attackWith(next, "foe", enemySlot(next));
        }
      } else if (kind === "run") {
        if (!wildEncounter) return;
        next.outcome = "escaped";
        addLog(next, "무사히 도망쳤다.");
      }
      if (!next.outcome) {
        if (next.field.terrainUntil === next.turn) { next.field.terrain = ""; addLog(next, "필드 효과가 사라졌다."); }
        endTurn(next);
        next.turn += 1;
      }
      await saveGame(next, nextBag);
    } finally {
      busy.current = false;
    }
  };

  PokemonBattle.acceptStatusBag = (incoming) => {
    if (!incoming || !incoming.items) return;
    const received = normalBag(incoming.items);
    if (bag && bag.keystone > 0) received.keystone = 1;
    const kept = { ...incoming, items: received };
    setBag(received);
    setBagMeta(kept);
    PokemonBattle.runtimeBag = kept;
  };
  PokemonBattle.acceptStatusState = (incoming) => {
    if (!incoming || !Array.isArray(incoming.owned)) return;
    PokemonBattle.runtimeState = incoming;
    setGame((current) => {
      if (!current) return current;
      const previous = Object.fromEntries(current.owned.map((pokemon) => [pokemon.uid, pokemon]));
      const updated = incoming.owned.map((raw, index) => {
        const pokemon = makePokemon(raw, "starter-" + index);
        return pokemon ? { ...pokemon, stages: previous[pokemon.uid] && previous[pokemon.uid].stages || {},
          swordBoostUsed: !!(previous[pokemon.uid] && previous[pokemon.uid].swordBoostUsed),
          shieldBoostUsed: !!(previous[pokemon.uid] && previous[pokemon.uid].shieldBoostUsed),
          syrupTriggered: !!(previous[pokemon.uid] && previous[pokemon.uid].syrupTriggered) } : null;
      }).filter(Boolean);
      return { ...current, owned: updated, activeUid: incoming.activeUid || current.activeUid, expShare: !!incoming.expShare };
    });
  };
  const sprite = (pokemon, back, style) => {
    const entry = info(pokemon);
    const spriteId = String(entry.spriteid || entry.name || pokemon.species)
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-mega-([xyz])$/, "-mega$1");
    const zaNumber = POKEMON_ZA_SPRITE_IDS[pokemon.species];
    // Z-A pixel fallback: PokéAPI sprites, credited to Kyledove / DoveKyle.
    const pokeRoot = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
    const spriteRoot = ROOT + "sprites/";
    const urls = [
      ...(pokemon.shiny ? [
        spriteRoot + "gen5ani" + (back ? "-back" : "") + "-shiny/" + spriteId + ".gif",
        spriteRoot + "ani" + (back ? "-back" : "") + "-shiny/" + spriteId + ".gif",
        spriteRoot + "gen5" + (back ? "-back" : "") + "-shiny/" + spriteId + ".png",
        ...(back ? [] : [spriteRoot + "dex-shiny/" + spriteId + ".png"])
      ] : []),
      spriteRoot + "gen5ani" + (back ? "-back" : "") + "/" + spriteId + ".gif",
      spriteRoot + "ani" + (back ? "-back" : "") + "/" + spriteId + ".gif",
      spriteRoot + "gen5" + (back ? "-back" : "") + "/" + spriteId + ".png",
      ...(zaNumber && zaNumber !== 10301 ? [pokeRoot + (back ? "back/" : "") + zaNumber + ".png"] : []),
      ...(zaNumber === 10301 ? [pokeRoot + "other/home/10301.png"] : []),
      spriteRoot + "dex/" + spriteId + ".png"
    ];
    return <img key={pokemon.uid + ":" + pokemon.species + (back ? ":back" : ":front") + (pokemon.shiny ? ":shiny" : "")} src={urls[0]} alt={pokemon.nickname}
      onError={(event) => {
        const element = event.currentTarget;
        const next = Number(element.dataset.fallback || 0) + 1;
        element.dataset.fallback = String(next);
        if (urls[next]) element.src = urls[next];
        else element.style.visibility = "hidden";
      }} style={{ objectFit: "contain", imageRendering: zaNumber === 10301 ? "auto" : "pixelated", ...style }} />;
  };
  const hpPanel = (pokemon, style, showExp = false) => {
    const maxHp = statOf(pokemon, "hp");
    const ratio = maxHp ? pokemon.hp / maxHp : 0;
    const color = ratio > .5 ? "#54b45f" : ratio > .2 ? "#ddbd47" : "#d76359";
    const expFloor = Number(pokemon.expFloor) || 0;
    const nextExp = Number(pokemon.nextExp) || expFloor;
    const expRatio = pokemon.level >= 100 ? 1 : Math.max(0, Math.min(1, ((Number(pokemon.exp) || 0) - expFloor) / Math.max(1, nextExp - expFloor)));
    return <div key={pokemon.uid} style={{ position: "absolute", zIndex: 3, width: "min(42%,220px)", padding: 8,
      border: "3px solid #334254", background: "#f7f3e6", boxShadow: "3px 3px 0 #1c2a38", color: "#24313e", fontSize: 11, fontWeight: 900, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}><span>{pokemon.shiny ? "✦ " : ""}{pokemon.nickname}</span><span>Lv.{pokemon.level}</span></div>
      <div style={{ marginTop: 6, border: "2px solid #344354", background: "#aeb6ae", height: 8 }}>
        <div style={{ width: (ratio * 100) + "%", height: "100%", background: color, transition: "width .42s steps(12,end), background .2s" }} />
      </div>
      <div style={{ marginTop: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{({ par: "마비", slp: "잠듦", brn: "화상", psn: "독", tox: "맹독", frz: "얼음" })[idOf(pokemon.status)] &&
          <span style={{ display: "inline-block", padding: "1px 4px", color: "#fff", background: ({ par: "#b58a2b", slp: "#72819b", brn: "#bd663e", psn: "#9261a4", tox: "#78518e", frz: "#5792ae" })[idOf(pokemon.status)] }}>
            {({ par: "마비", slp: "잠듦", brn: "화상", psn: "독", tox: "맹독", frz: "얼음" })[idOf(pokemon.status)]}</span>}</span>
        <span>HP {pokemon.hp}/{maxHp}</span>
      </div>
      {showExp && <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5, fontSize: 8 }}>
        <span>EXP</span>
        <div style={{ flex: 1, height: 5, border: "1px solid #344354", background: "#b8c2c5" }}>
          <div style={{ width: (expRatio * 100) + "%", height: "100%", background: "#4c9de9" }} />
        </div>
        <span>{pokemon.level >= 100 ? "MAX" : Math.max(0, nextExp - (Number(pokemon.exp) || 0))}</span>
      </div>}
    </div>;
  };
  const button = (label, click, color, disabled) => <button type="button" onClick={click} disabled={!!disabled || !!anim || !!sendOut}
    style={{ minHeight: 48, padding: "7px 9px", border: "3px solid " + (disabled ? "#888" : color || "#68869b"),
      background: disabled ? "#adb2ad" : "#f7f4e8", color: disabled ? "#666" : "#22303c",
      textAlign: "left", fontFamily: "inherit", fontSize: 11, fontWeight: 900,
      boxShadow: "3px 3px 0 #243341", cursor: disabled ? "default" : "pointer" }}>{label}</button>;

  if (!encounter.species) return null;
  if (error) return <div style={{ padding: 14, color: "#f7d4d4", background: "#3b1d25" }}>{error}</div>;
  if (!catalog || !game || !meta || !bag) return <div style={{ padding: 18, background: "#253745", color: "#fff", fontFamily: "monospace" }}>포켓몬 배틀을 준비하는 중...</div>;
  const own = activeOf(game);
  const foe = game.foe;
  const learnRequest = (game.pendingLearn || [])[0];
  const learner = learnRequest && game.owned.find((pokemon) => pokemon.uid === learnRequest.uid);
  const itemCount = Object.keys(bag).reduce((sum, id) => sum + (bag[id] || 0), 0);
  const outcomeText = { victory: "승리!", defeat: "패배...", escaped: "도주 성공", caught: "포획 성공!" };
  return <section style={{ width: "100%", maxWidth: 700, margin: "0 auto", position: "relative", boxSizing: "border-box", border: "5px solid #283a4d",
    background: "#cfdbd4", color: "#23313d", fontFamily: "monospace", boxShadow: "5px 5px 0 #172631" }}>
    <style>{`@keyframes pbTrainerEnter{0%{opacity:0;transform:translateX(70px)}100%{opacity:1;transform:translateX(0)}}
@keyframes pbTrainerLeave{0%{opacity:1;transform:translateX(0)}100%{opacity:0;transform:translateX(50px)}}
@keyframes pbNpcThrow{0%{left:70%;top:39%;transform:scale(.6) rotate(0)}65%{left:72%;top:20%;transform:scale(.9) rotate(180deg)}100%{left:68%;top:36%;transform:scale(1) rotate(360deg)}}
@keyframes pbFoeAppear{0%{opacity:0;transform:scale(.25);filter:brightness(4)}100%{opacity:1;transform:scale(1);filter:brightness(1)}}
@keyframes pbLungeOwn{0%{transform:translate(0,0)}55%{transform:translate(44px,-24px)}100%{transform:translate(0,0)}}
@keyframes pbLungeFoe{0%{transform:translate(0,0)}55%{transform:translate(-42px,24px)}100%{transform:translate(0,0)}}
@keyframes pbImpact{0%{opacity:0;transform:scale(.2) rotate(0deg)}40%{opacity:.85;transform:scale(1.4) rotate(60deg)}100%{opacity:0;transform:scale(2.2) rotate(120deg)}}
@keyframes pbSlash{0%{opacity:0;transform:translate(-24px,-24px) rotate(-45deg) scale(.3)}45%{opacity:1;transform:translate(0,0) rotate(-45deg) scale(1.2)}100%{opacity:0;transform:translate(18px,18px) rotate(-45deg) scale(1.6)}}
@keyframes pbFxTravelOwn{0%{left:22%;top:72%;opacity:0;transform:scale(.45)}25%{opacity:1}100%{left:68%;top:34%;opacity:1;transform:scale(1)}}
@keyframes pbFxTravelFoe{0%{left:68%;top:34%;opacity:0;transform:scale(.45)}25%{opacity:1}100%{left:22%;top:72%;opacity:1;transform:scale(1)}}
@keyframes pbStatusAura{0%{opacity:0;transform:translate(-50%,-50%) scale(.45)}35%{opacity:.9;transform:translate(-50%,-50%) scale(1.15)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.6)}}
@keyframes pbShake{0%,100%{transform:translateX(0) rotate(0)}25%{transform:translateX(-10px) rotate(-17deg)}75%{transform:translateX(10px) rotate(17deg)}}
@keyframes pbThrow{0%{left:16%;top:73%;transform:scale(.6) rotate(-90deg)}48%{left:43%;top:18%;transform:scale(.9) rotate(100deg)}100%{left:68%;top:40%;transform:scale(1) rotate(360deg)}}
@keyframes pbCapturePulse{0%{opacity:0;transform:scale(.25)}45%{opacity:.85;transform:scale(1)}100%{opacity:0;transform:scale(1.5)}}
@keyframes pbFlash{0%,100%{filter:none}50%{filter:brightness(3)}}
@keyframes pbEvoOld{0%,15%,35%,55%{opacity:1;filter:brightness(1)}25%,45%,65%,100%{opacity:0;filter:brightness(4)}}
@keyframes pbEvoNew{0%,15%,35%,55%{opacity:0;filter:brightness(4)}25%,45%,65%,100%{opacity:1;filter:brightness(1)}}
@keyframes pbEvoGlow{0%,100%{opacity:.1;transform:scale(.8)}45%{opacity:.9;transform:scale(1.5)}}
@keyframes pbMegaEmblem{0%{opacity:0;transform:scale(.3) rotate(-35deg)}20%{opacity:1;transform:scale(1.16) rotate(0)}55%{opacity:1;transform:scale(1)}80%,100%{opacity:0;transform:scale(1.4)}}`}</style>
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
      padding: "5px 9px", background: "#283a4d", color: "#fff", fontSize: 11, fontWeight: 900 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <img src={ROOT + "sprites/trainers/" + idOf(playerTrainer) + ".png"} alt="플레이어" style={{ width: 28, height: 28, imageRendering: "pixelated" }} />
        UNOVA · BATTLE
        <img src={ROOT + "sprites/trainers/" + trainerSprite + ".png"} alt="상대"
          onError={(event) => { if (!event.currentTarget.src.endsWith("/acetrainer.png")) event.currentTarget.src = ROOT + "sprites/trainers/acetrainer.png"; }}
          style={{ width: 28, height: 28, imageRendering: "pixelated" }} />
        {trainerName && <span>{trainerName} · {game.foeIndex + 1}/{game.foes.length}</span>}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
        {bag.keystone > 0 ? "키스톤 ✓ · " : ""}TURN {game.turn}
        <button type="button" aria-expanded={showBattleLog} onClick={() => setShowBattleLog(!showBattleLog)}
          style={{ padding: "4px 7px", border: "2px solid #b2d7e9", background: showBattleLog ? "#f6d97a" : "#e8f4ed", color: "#203343", fontFamily: "inherit", fontSize: 11, fontWeight: 900, cursor: "pointer" }}>
          {showBattleLog ? "로그 닫기" : "전투 로그"}
        </button>
      </span>
    </header>
    {showBattleLog && <div role="dialog" aria-label="전투 로그" style={{ position: "absolute", top: 38, right: 5, zIndex: 20, width: "min(94%, 380px)", maxHeight: 400,
      boxSizing: "border-box", overflowY: "auto", border: "4px solid #263b50", background: "#f8f4e8", boxShadow: "4px 4px 0 #142433", padding: 9, fontSize: 11, lineHeight: 1.6 }}>
      <strong style={{ display: "block", marginBottom: 5, fontSize: 13 }}>현재 능력 랭크</strong>
      {[[own, "내 포켓몬", "own"], [foe, "상대 포켓몬", "foe"]].map(([pokemon, label, side]) => pokemon && <div key={side} style={{ borderTop: "2px solid #9db4b2", padding: "5px 0" }}>
        <strong>{label} · {pokemon.nickname}</strong> <span>{({ NORMAL: "정상", brn: "화상", par: "마비", psn: "독", tox: "맹독", slp: "잠듦", frz: "얼음" }[pokemon.status] || pokemon.status || "정상")} · 특성 {abilityName(pokemon)}</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 3, marginTop: 3 }}>
          {Object.keys(STAGE_KO).map((key) => { const value = pokemon.stages && pokemon.stages[key] || 0; return <span key={key}
            style={{ padding: "2px 3px", background: value > 0 ? "#cae9d2" : value < 0 ? "#f4d3cd" : "#e7e7dc" }}>
            {STAGE_KO[key]} {value > 0 ? "+" : ""}{value}
          </span>; })}
        </div>
        {Object.entries(game.field[side] || {}).filter(([key, value]) => value && (key === "spikes" || value >= game.turn)).map(([key, value]) =>
          <span key={key} style={{ marginRight: 6, color: "#3a647d" }}>{({ reflect: "리플렉터", lightscreen: "빛의장막", auroraveil: "오로라베일", tailwind: "순풍", stealthrock: "스텔스록", spikes: "압정" }[key] || key)}{key === "spikes" ? " ×" + value : ""}</span>)}
      </div>)}
      {game.field.weather && <div>날씨: {game.field.weather}</div>}
      {game.field.trickRoomUntil >= game.turn && <div>트릭룸 진행 중</div>}
      <strong style={{ display: "block", marginTop: 8, borderTop: "2px solid #9db4b2", paddingTop: 5 }}>턴별 기록</strong>
      {(game.battleLog || []).map((entry, index) => <div key={index} style={{ padding: "3px 0", borderBottom: "1px solid #d7d9ce" }}>
        <span style={{ color: "#547382", marginRight: 5 }}>T{entry.turn}</span>{entry.text}
      </div>)}
    </div>}
    <div style={{ height: 350, position: "relative", overflow: "hidden", imageRendering: "pixelated",
      backgroundColor: "#86b49b", backgroundImage: "url(" + ROOT + "fx/" + background + ")", backgroundSize: "cover", backgroundPosition: "center" }}>
      {hpPanel(foe, { top: 14, left: 12 })}
      {!wildEncounter && sendOut && sendOut !== "reveal" && <img
        src={ROOT + "sprites/trainers/" + trainerSprite + ".png"} alt={trainerName}
        onError={(event) => { if (!event.currentTarget.src.endsWith("/acetrainer.png")) event.currentTarget.src = ROOT + "sprites/trainers/acetrainer.png"; }}
        style={{ position: "absolute", right: "12%", top: 60, width: 140, height: 150,
          objectFit: "contain", imageRendering: "pixelated", zIndex: 3,
          animation: sendOut === "trainer" ? "pbTrainerEnter .5s steps(4) both" : "pbTrainerLeave .55s steps(4) both" }} />}
      {!wildEncounter && sendOut === "throw" && <span aria-label="상대 몬스터볼"
        style={{ position: "absolute", left: "68%", top: "36%", width: 24, height: 24,
          border: "2px solid #26313e", borderRadius: "50%", zIndex: 4,
          background: "linear-gradient(#d94e48 0 46%,#26313e 46% 54%,#f5f0e5 54% 100%)",
          boxShadow: "0 0 0 2px #fff8", animation: "pbNpcThrow .55s ease-out both" }} />}
      <div style={{ position: "absolute", top: 190, right: "6%", width: "35%", height: 20, borderRadius: "50%", background: "#678c62" }} />
      {sprite(foe, false, { position: "absolute", top: 64, right: "9%", width: "35%", height: 150,
        opacity: sendOut === "trainer" || sendOut === "throw" || anim && anim.kind === "capture" && anim.stage !== "throw" && anim.stage !== "breakout" ? 0 : 1,
        animation: sendOut === "reveal" ? "pbFoeAppear .45s steps(4) both" : anim && anim.kind === "attack" && anim.side === "foe" && anim.stage === "lunge" ? "pbLungeFoe .36s ease-in-out" : anim && anim.kind === "attack" && anim.side === "own" && anim.stage === "impact" ? "pbFlash .42s steps(2)" : "none" })}
      {own && <>
        <div style={{ position: "absolute", bottom: 44, left: "3%", width: "45%", height: 28, borderRadius: "50%", background: "#63885e" }} />
        {sprite(own, true, { position: "absolute", bottom: 52, left: "4%", width: "43%", height: 180,
          animation: anim && anim.kind === "attack" && anim.side === "own" && anim.stage === "lunge" ? "pbLungeOwn .36s ease-in-out" : anim && anim.kind === "attack" && anim.side === "foe" && anim.stage === "impact" ? "pbFlash .42s steps(2)" : "none" })}
        {hpPanel(own, { bottom: 12, right: 12 }, true)}
      </>}
      {anim && anim.kind === "attack" && <div style={{ position: "absolute", zIndex: 6, top: 8, left: "50%", transform: "translateX(-50%)",
        padding: "5px 10px", border: "2px solid #31445a", background: anim.category === "Status" ? "#e8e0fa" : "#fff5d6",
        color: "#24313e", fontSize: 11, fontWeight: 900, whiteSpace: "nowrap", boxShadow: "2px 2px 0 #233" }}>
        {anim.side === "own" ? "우리 편" : "상대"} · {moveName(anim.moveId)} {anim.category === "Status" ? "◇ 변화" : "⚔ 공격"}
      </div>}
      {anim && anim.kind === "attack" && anim.stage === "status" && <div key={anim.stamp} style={{
        position: "absolute", zIndex: 5, left: anim.side === "own" ? "24%" : "75%", top: anim.side === "own" ? "68%" : "35%",
        width: 100, height: 100, borderRadius: "50%", border: "5px solid #c8a9ef", background: "radial-gradient(circle,#e7d7ff99,#9b69d333 50%,transparent 70%)",
        boxShadow: "0 0 22px #cba8fc", pointerEvents: "none", animation: "pbStatusAura .58s ease-out both" }} />}
      {anim && anim.kind === "attack" && anim.stage === "lunge" && anim.category === "Special" &&
        effectLayers(anim).slice(0, 2).map((fx, index) => <img
          key={anim.stamp + "travel" + index} src={ROOT + "fx/" + fx + ".png"} alt=""
          onError={(event) => { if (!event.currentTarget.src.endsWith("/fx/impact.png")) event.currentTarget.src = ROOT + "fx/impact.png"; }}
          style={{ position: "absolute", zIndex: 4, left: anim.side === "own" ? "68%" : "22%", top: anim.side === "own" ? "34%" : "72%",
            width: 52 + index * 14, height: 52 + index * 14, objectFit: "contain", imageRendering: "pixelated", pointerEvents: "none",
            animation: (anim.side === "own" ? "pbFxTravelOwn" : "pbFxTravelFoe") + " .36s ease-out both",
            animationDelay: index * 65 + "ms" }} />)}
      {anim && anim.kind === "attack" && anim.stage === "impact" &&
        effectLayers(anim).map((fx, index) => <img
          key={anim.stamp + "hit" + index} src={ROOT + "fx/" + fx + ".png"} alt=""
          onError={(event) => { if (!event.currentTarget.src.endsWith("/fx/impact.png")) event.currentTarget.src = ROOT + "fx/impact.png"; }}
          style={{ position: "absolute", zIndex: 4, left: "calc(" + (anim.side === "own" ? "68%" : "22%") + " + " + ((index % 2 ? 1 : -1) * index * 12) + "px)",
            top: "calc(" + (anim.side === "own" ? "34%" : "72%") + " + " + (index * 9) + "px)",
            width: 82 + index * 12, height: 82 + index * 12, objectFit: "contain", imageRendering: "pixelated", pointerEvents: "none",
            animation: (anim.category === "Physical" ? "pbSlash" : "pbImpact") + " .36s ease-out both",
            animationDelay: index * 65 + "ms" }} />)}
      {anim && anim.kind === "capture" && anim.stage !== "breakout" && <img key={anim.stamp}
        src={ROOT + "fx/pokeball.png"} alt="몬스터볼" style={{
          position: "absolute", zIndex: 5, left: "68%", top: "40%", width: 42, height: 42,
          objectFit: "contain", imageRendering: "pixelated", pointerEvents: "none",
          filter: anim.stage === "success" ? "drop-shadow(0 0 12px #fff1a0)" : "none",
          animation: anim.stage === "throw" ? "pbThrow .65s ease-out forwards" : anim.stage === "shake" ? "pbShake .5s ease-in-out" : "none" }} />}
      {anim && anim.kind === "capture" && (anim.stage === "throw" || anim.stage === "shake") &&
        <img key={anim.stamp + "capture-glow"} src={ROOT + "fx/shine.png"} alt="" style={{
          position: "absolute", zIndex: 4, left: "62%", top: "30%", width: 90, height: 90,
          imageRendering: "pixelated", pointerEvents: "none", animation: "pbCapturePulse .55s ease-out both" }} />}
      {anim && anim.kind === "capture" && anim.stage === "success" && <img src={ROOT + "fx/shine.png"} alt="" style={{
        position: "absolute", zIndex: 5, left: "65%", top: "36%", width: 90, height: 90, objectFit: "contain",
        imageRendering: "pixelated", animation: "pbImpact .42s ease-out forwards", pointerEvents: "none" }} />}
      {megaAnim && <div style={{ position: "absolute", inset: 0, zIndex: 7, display: "flex",
        alignItems: "center", justifyContent: "center", background: "rgba(28,23,54,.84)" }}>
        <img src={ROOT + "fx/shine.png"} alt="" style={{ position: "absolute", width: 230, height: 230,
          imageRendering: "pixelated", animation: "pbEvoGlow 1.6s ease-in-out forwards" }} />
        {sprite({ uid: "form-old-" + megaAnim.token, species: megaAnim.fromSpecies, nickname: megaAnim.fromName, shiny: megaAnim.shiny }, megaAnim.side === "own",
          { position: "absolute", width: 170, height: 170, animation: "pbEvoOld 1.6s steps(1) forwards" })}
        {sprite({ uid: "form-new-" + megaAnim.token, species: megaAnim.toSpecies, nickname: megaAnim.toName, shiny: megaAnim.shiny }, megaAnim.side === "own",
          { position: "absolute", width: 170, height: 170, animation: "pbEvoNew 1.6s steps(1) forwards" })}
        {megaAnim.kind === "mega" && <svg viewBox="0 0 370 450" role="img" aria-label="메가진화 마크"
          style={{ position: "absolute", top: 0, width: 125, height: 150, zIndex: 8,
            filter: "drop-shadow(0 0 9px #fff8) drop-shadow(0 0 17px #73d9ff)",
            animation: "pbMegaEmblem 1.6s ease-out both", pointerEvents: "none" }}>
          <defs>
            <linearGradient id="pbMegaColor" x1="0" y1="80" x2="370" y2="370" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ff9000" /><stop offset="28%" stopColor="#d4c839" />
              <stop offset="45%" stopColor="#8bd176" /><stop offset="60%" stopColor="#04c7e2" />
              <stop offset="80%" stopColor="#8c6fb7" /><stop offset="100%" stopColor="#ee387a" />
            </linearGradient>
            <radialGradient id="pbMegaBlue" cx="160" cy="420" r="210" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#04aee2" stopOpacity=".9" />
              <stop offset="100%" stopColor="#04aee2" stopOpacity="0" />
            </radialGradient>
            <clipPath id="pbMegaShape"><path clipRule="evenodd" d="M0 179 L2 139 L4 139 L14 110 L38 78 L60 59 L78 46 L86 43 L87 40 L149 13 L196 2 L227 0 L232 3 L232 14 L219 38 L214 61 L216 87 L220 99 L230 116 L248 136 L317 187 L350 225 L362 249 L370 284 L370 306 L362 338 L354 354 L339 374 L314 397 L290 413 L256 430 L210 447 L198 450 L181 449 L176 444 L173 436 L169 408 L162 384 L147 354 L123 328 L88 300 L73 291 L72 288 L58 280 L30 253 L17 234 L8 215 Z M56 198 L60 208 L69 221 L72 222 L72 225 L96 248 L127 269 L159 286 L232 314 L305 334 L309 334 L317 319 L320 309 L320 292 L318 291 L251 277 L182 255 L111 226 Z M54 143 L54 147 L80 162 L172 205 L240 229 L302 245 L296 236 L280 221 L224 181 L157 159 L93 131 L72 119 L67 122 Z M198 347 L206 371 L210 397 L238 389 L272 370 Z M107 88 L120 96 L176 119 L166 94 L162 64 L128 75 Z" /></clipPath>
          </defs>
          <g clipPath="url(#pbMegaShape)">
            <rect width="370" height="450" fill="url(#pbMegaColor)" />
            <rect width="370" height="450" fill="url(#pbMegaBlue)" />
          </g>
        </svg>}
      </div>}
      {evolutionEvent && <div style={{ position: "absolute", inset: 0, zIndex: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(19,31,52,.88)" }}>
        <img src={ROOT + "fx/shine.png"} alt="" style={{ position: "absolute", width: 220, height: 220,
          imageRendering: "pixelated", animation: "pbEvoGlow 2.2s ease-in-out forwards" }} />
        {sprite({ uid: "evo-old-" + evolutionEvent.token, species: evolutionEvent.fromSpecies, nickname: evolutionEvent.fromName, shiny: evolutionEvent.shiny }, false,
          { position: "absolute", width: 170, height: 170, objectFit: "contain", animation: "pbEvoOld 2.2s steps(1) forwards" })}
        {sprite({ uid: "evo-new-" + evolutionEvent.token, species: evolutionEvent.toSpecies, nickname: evolutionEvent.toName, shiny: evolutionEvent.shiny }, false,
          { position: "absolute", width: 170, height: 170, objectFit: "contain", animation: "pbEvoNew 2.2s steps(1) forwards" })}
      </div>}
      {game.outcome && !learnRequest && !evolutionEvent && <div style={{ position: "absolute", inset: 0, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(17,28,38,.55)" }}>
        <strong style={{ padding: "12px 18px", border: "4px solid #283a4d", background: "#f8f2de", boxShadow: "4px 4px 0 #172631", fontSize: 20 }}>{outcomeText[game.outcome]}</strong>
      </div>}
    </div>
    <div style={{ minHeight: 67, boxSizing: "border-box", padding: "8px 12px", borderTop: "5px solid #283a4d", borderBottom: "5px solid #283a4d",
      background: "#f7f4e8", fontSize: 11, lineHeight: 1.5 }}>
      {game.log.slice(-2).map((line, index) => <div key={game.turn + "-" + index + "-" + line}>▶ {line}</div>)}
    </div>
    <div style={{ padding: 10 }}>
      {evolutionEvent && <div style={{ border: "3px solid #506d92", padding: 10, background: "#f7f4e8", textAlign: "center", fontSize: 12 }}>
        <strong>{evolutionEvent.fromName}이(가) {evolutionEvent.toName}(으)로 진화했다!</strong>
        <div style={{ marginTop: 8 }}>{button(evoReady ? "진화 계속 ▶" : "진화 중...", finishEvolution, "#e2ba58", !evoReady)}</div>
      </div>}
      {!evolutionEvent && learnRequest && learner && <div style={{ border: "3px solid #506d92", padding: 9, background: "#f7f4e8", fontSize: 11 }}>
        <strong>{learner.nickname}이(가) {moveName(learnRequest.moveId)}을(를) 배우려 합니다.</strong>
        <div style={{ margin: "6px 0" }}>잊을 기술을 고르거나 새 기술을 배우지 않을 수 있습니다. 남은 선택 {(game.pendingLearn || []).length}개</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 7 }}>
          {learner.moves.map((id, index) => <React.Fragment key={id + index}>{button(
            moveName(id) + " 잊기 · PP " + learner.pp[index] + "/" + moveInfo(id).pp,
            () => chooseLearn(index), "#d87662")}</React.Fragment>)}
          {button("새 기술을 배우지 않는다", () => chooseLearn(-1), "#6a9bbb")}
        </div>
      </div>}
      {!own && !game.outcome && <div style={{ marginBottom: 8, fontSize: 11 }}>출전할 수 있는 보유 포켓몬이 없습니다. 첫 조우에는 initialParty로 스타팅 포켓몬을 전달해 주세요.</div>}
      {!game.outcome && !learnRequest && !evolutionEvent && !game.pendingSwitch && menu === "main" && <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
        {button("⚔ 싸운다", () => setMenu("moves"), "#d87662", !own)}
        {button("◉ 보유 포켓몬 " + game.owned.length, () => setMenu("party"), "#75a77b", !game.owned.length)}
        {button("▣ 가방 " + itemCount, () => setMenu("bag"), "#dcad62", !own)}
        {button("↗ 도망간다", () => takeAction("run"), "#6a9bbb", !wildEncounter)}
        {own && formOptions(own).length > 1 && <div style={{ gridColumn: "1 / -1" }}>{button(
          "◇ 폼체인지 · " + own.speciesNameKo, () => setMenu("forms"), "#6a9bbb",
          game.formChangedTurn === game.turn || !!own.megaBase)}</div>}
        <div style={{ gridColumn: "1 / -1" }}>{button(
          megaAvailability(own, game).option ? "✦ 메가진화 · 기술 선택" : "✦ 메가진화 · " + megaAvailability(own, game).reason,
          () => { setMegaReady(true); setMenu("moves"); }, "#ad76c5", !megaAvailability(own, game).option)}</div>
      </div>}
      {!game.outcome && !learnRequest && !evolutionEvent && !game.pendingSwitch && menu === "moves" && own && <>
        {button(megaAvailability(own, game).option
          ? megaReady ? "✓ 메가진화 준비됨 · 아래 기술을 선택" : "✦ 메가진화"
          : "✦ 메가진화 · " + megaAvailability(own, game).reason,
          () => setMegaReady(!megaReady), "#ad76c5", !megaAvailability(own, game).option)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
          {own.moves.map((moveId, index) => {
            const move = moveInfo(moveId);
            return <React.Fragment key={moveId + index}>{button(<span>{moveName(moveId)}<br /><small>{move.type} · PP {own.pp[index]}/{move.pp || 1}</small></span>,
              () => takeAction("move", index), COLORS[idOf(move.type)], own.pp[index] <= 0)}</React.Fragment>;
          })}
          {own.pp.every((pp) => pp <= 0) && button("발버둥", () => takeAction("move", -1), "#98958a")}
        </div>
        <div style={{ marginTop: 8 }}>{button("← 돌아가기", () => { setMegaReady(false); setMenu("main"); })}</div>
      </>}
      {!game.outcome && !learnRequest && !evolutionEvent && !game.pendingSwitch && menu === "forms" && own && <>
        <div style={{ fontSize: 11, marginBottom: 7 }}>폼을 고르세요. 변경은 이 턴에 한 번만 가능합니다.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 7, maxHeight: 220, overflowY: "auto" }}>
          {formOptions(own).map((id) => button(localizedName({ species: id }), () => takeAction("form", id), "#6a9bbb", id === own.species))}
        </div>
        <div style={{ marginTop: 8 }}>{button("← 돌아가기", () => setMenu("main"))}</div>
      </>}
      {!game.outcome && !learnRequest && !evolutionEvent && !game.pendingSwitch && menu === "bag" && <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
          {Object.keys(ITEM).map((id) => button(ITEM[id].name + " ×" + bag[id],
            () => ITEM[id].group === "ball" ? takeAction("capture", id) : setMenu("target:" + id),
            ITEM[id].group === "ball" ? "#d58970" : "#73a8a0",
            bag[id] <= 0 || ITEM[id].group === "ball" && !wildEncounter))}
        </div>
        <div style={{ marginTop: 8 }}>{button("← 돌아가기", () => setMenu("main"))}</div>
      </>}
      {!game.outcome && !learnRequest && !evolutionEvent && !game.pendingSwitch && menu.startsWith("target:") && <>
        <div style={{ fontSize: 11, marginBottom: 7 }}>{ITEM[menu.slice(7)].name}을(를) 사용할 포켓몬</div>
        <div style={{ display: "grid", gap: 6 }}>
          {game.owned.map((pokemon) => button(pokemon.nickname + " · HP " + pokemon.hp + "/" + statOf(pokemon, "hp"),
            () => takeAction("item", { id: menu.slice(7), uid: pokemon.uid }), "#73a8a0",
            !canUseBattleItem(ITEM[menu.slice(7)], pokemon, game)))}
        </div>
        <div style={{ marginTop: 8 }}>{button("← 가방", () => setMenu("bag"))}</div>
      </>}
      {!game.outcome && !learnRequest && !evolutionEvent && (menu === "party" || game.pendingSwitch) && <>
        {game.pendingSwitch && <div style={{ marginBottom: 8, padding: 7, border: "2px solid #d87662", background: "#fff5d6", fontWeight: 900 }}>출전할 포켓몬을 선택하세요.</div>}
        <div style={{ maxHeight: 200, overflowY: "auto", display: "grid", gap: 7 }}>
          {game.owned.filter((pokemon) => !pokemon.inBox).map((pokemon) => <React.Fragment key={pokemon.uid}>{button(
            <span>{pokemon.nickname} · Lv.{pokemon.level} · HP {pokemon.hp}/{statOf(pokemon, "hp")}
              <small style={{ display: "block", marginTop: 3 }}>IV {STATS.map((key) => pokemon.ivs[key]).join("/")} · EV {STATS.map((key) => pokemon.evs[key]).join("/")} · {pokemon.nature}</small>
            </span>, () => takeAction("switch", pokemon.uid), COLORS[idOf(info(pokemon).types[0])], pokemon.hp <= 0 || !game.pendingSwitch && pokemon.uid === game.activeUid
          )}</React.Fragment>)}
        </div>
        {!game.pendingSwitch && <div style={{ marginTop: 8 }}>{button("← 돌아가기", () => setMenu("main"))}</div>}
      </>}
      {game.outcome && !learnRequest && !evolutionEvent && <div style={{ fontSize: 11, lineHeight: 1.6 }}>
        배틀 종료 · 보유 {game.owned.length}마리 · 기록된 HP/PP/IV/EV는 다음 조우에 이어집니다.
        {(game.expGains || []).map((row, index) => <div key={row.uid + "-" + index}>{row.name} · 경험치 +{row.gain} · Lv.{row.level}</div>)}
      </div>}
      {notice && <div style={{ marginTop: 8, color: "#9b3e35", fontSize: 10 }}>{notice}</div>}
    </div>
    <footer style={{ padding: "5px 9px", background: "#283a4d", color: "#c7d4d4", textAlign: "right", fontSize: 9 }}>
      Sprites &amp; FX: Pokémon Showdown · FX artwork: CC0 (listed exceptions unused) · capture/EV data: PokéAPI static snapshot
    </footer>
  </section>;
}


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

const POKEMON_MOVE_KO = {"absorb":"흡수","accelerock":"액셀록","acid":"용해액","acidspray":"애시드봄","acrobatics":"애크러뱃","aerialace":"제비반환","aeroblast":"에어로블라스트","aircutter":"에어커터","airslash":"에어슬래시","alluringvoice":"매혹의보이스","anchorshot":"앵커샷","ancientpower":"원시의힘","appleacid":"사과산","aquacutter":"아쿠아커터","aquajet":"아쿠아제트","aquastep":"아쿠아스텝",
  "aquatail":"아쿠아테일","armorcannon":"아머캐논","armthrust":"손바닥치기","assurance":"승부굳히기","astonish":"놀래키기","astralbarrage":"아스트랄비트","attackorder":"공격지령","aurasphere":"파동탄","aurawheel":"오라휠","aurorabeam":"오로라빔","avalanche":"눈사태","axekick":"발꿈치찍기","baddybad":"아그아그존","barbbarrage":"독침천발","barrage":"구슬던지기","beakblast":"부리캐논","behemothbash":"거수탄",
  "behemothblade":"거수참","belch":"트림","bind":"조이기","bite":"물기","bitterblade":"원념의칼","bittermalice":"천추지한","blastburn":"블라스트번","blazekick":"블레이즈킥","blazingtorque":"번액셀","bleakwindstorm":"찬바람폭풍","blizzard":"눈보라","bloodmoon":"블러드문","blueflare":"푸른불꽃","bodypress":"바디프레스","bodyslam":"누르기","boltbeak":"전격부리","boltstrike":"뇌격","boneclub":"뼈다귀치기",
  "bonemerang":"뼈다귀부메랑","bonerush":"본러시","boomburst":"폭음파","bounce":"뛰어오르기","bouncybubble":"생생버블","branchpoke":"가지찌르기","bravebird":"브레이브버드","breakingswipe":"와이드브레이커","brickbreak":"깨뜨리다","brine":"소금물","brutalswing":"세차게휘두르기","bubble":"거품","bubblebeam":"거품광선","bugbite":"벌레먹기","bugbuzz":"벌레의야단법석","bulldoze":"땅고르기","bulletpunch":"불릿펀치",
  "bulletseed":"씨기관총","burningjealousy":"질투의불꽃","burnup":"불사르기","buzzybuzz":"찌릿찌릿일렉","ceaselessedge":"비검천중파","chargebeam":"차지빔","chatter":"수다","chillingwater":"찬물끼얹기","chipaway":"야금야금","chloroblast":"클로로블라스트","circlethrow":"배대뒤치기","clamp":"껍질끼우기","clangingscales":"스케일노이즈","clearsmog":"클리어스모그","closecombat":"인파이트","collisioncourse":"엑셀브레이크",
  "combattorque":"파이트액셀","cometpunch":"연속펀치","confusion":"염동력","constrict":"휘감기","coreenforcer":"코어퍼니셔","covet":"탐내다","crabhammer":"집게해머","crosschop":"크로스촙","crosspoison":"크로스포이즌","crunch":"깨물어부수기","crushclaw":"브레이크클로","cut":"풀베기","darkestlariat":"DD래리어트","darkpulse":"악의파동","dazzlinggleam":"매지컬샤인","diamondstorm":"다이아스톰","dig":"구멍파기",
  "direclaw":"페이탈클로","disarmingvoice":"차밍보이스","discharge":"방전","dive":"다이빙","dizzypunch":"잼잼펀치","doomdesire":"파멸의소원","doubleedge":"이판사판태클","doublehit":"더블어택","doubleironbash":"더블펀처","doublekick":"두번차기","doubleshock":"전광쌍격","doubleslap":"연속뺨치기","dracometeor":"용성군","dragonascent":"화룡점정","dragonbreath":"용의숨결","dragonclaw":"드래곤클로",
  "dragondarts":"드래곤애로","dragonenergy":"드래곤에너지","dragonhammer":"드래곤해머","dragonpulse":"용의파동","dragonrush":"드래곤다이브","dragontail":"드래곤테일","drainingkiss":"드레인키스","drainpunch":"드레인펀치","dreameater":"꿈먹기","drillpeck":"회전부리","drillrun":"드릴라이너","drumbeating":"드럼어택","dualchop":"더블촙","dualwingbeat":"더블윙","dynamaxcannon":"다이맥스포","dynamicpunch":"폭발펀치",
  "earthpower":"대지의힘","earthquake":"지진","echoedvoice":"에코보이스","eeriespell":"섬뜩한주문","eggbomb":"알폭탄","electrodrift":"라이트닝드라이브","electroshot":"일렉트로빔","electroweb":"일렉트릭네트","ember":"불꽃세례","energyball":"에너지볼","eruption":"분화","esperwing":"오라윙","eternabeam":"무한다이빔","expandingforce":"와이드포스","explosion":"대폭발","extrasensory":"신통력",
  "extremespeed":"신속","facade":"객기","fairywind":"요정의바람","fakeout":"속이기","falsesurrender":"사죄의찌르기","falseswipe":"칼등치기","feint":"페인트","feintattack":"속여때리기","fellstinger":"마지막일침","ficklebeam":"변덕레이저","fierydance":"불꽃춤","fierywrath":"타오르는분노","fireblast":"불대문자","firefang":"불꽃엄니","firelash":"불꽃채찍","firepledge":"불꽃의맹세","firepunch":"불꽃펀치",
  "firespin":"회오리불꽃","firstimpression":"만나자마자","fishiousrend":"아가미물기","flameburst":"불꽃튀기기","flamecharge":"니트로차지","flamethrower":"화염방사","flamewheel":"화염바퀴","flareblitz":"플레어드라이브","flashcannon":"러스터캐논","fleurcannon":"플뢰르캐논","flipturn":"퀵턴","floatyfall":"둥실둥실폴","flowertrick":"트릭플라워","fly":"공중날기","flyingpress":"플라잉프레스","focusblast":"기합구슬",
  "focuspunch":"힘껏펀치","forcepalm":"발경","foulplay":"속임수","freezedry":"프리즈드라이","freezeshock":"프리즈볼트","freezingglare":"얼어붙는시선","freezyfrost":"꽁꽁프로스트","frenzyplant":"하드플랜트","frostbreath":"얼음숨결","furyattack":"마구찌르기","furycutter":"연속자르기","furyswipes":"마구할퀴기","fusionbolt":"크로스썬더","fusionflare":"크로스플레임","futuresight":"미래예지","geargrind":"기어소서",
  "gigadrain":"기가드레인","gigaimpact":"기가임팩트","gigatonhammer":"거대해머","glaciallance":"블리자드랜스","glaciate":"얼어붙은세계","glaiverush":"대검돌격","glitzyglow":"콸콸오라","grasspledge":"풀의맹세","grassyglide":"그래스슬라이더","gravapple":"G의힘","gunkshot":"더스트슈트","gust":"바람일으키기","hammerarm":"암해머","headbutt":"박치기","headcharge":"아프로브레이크","headlongrush":"들이받기",
  "headsmash":"양날박치기","heartstamp":"하트스탬프","heatwave":"열풍","hex":"병상첨병","hiddenpower":"잠재파워","hiddenpowerbug":"잠재파워(벌레)","hiddenpowerdark":"잠재파워(악)","hiddenpowerdragon":"잠재파워(드래곤)","hiddenpowerelectric":"잠재파워(전기)","hiddenpowerfighting":"잠재파워(격투)","hiddenpowerfire":"잠재파워(불꽃)","hiddenpowerflying":"잠재파워(비행)","hiddenpowerghost":"잠재파워(고스트)",
  "hiddenpowergrass":"잠재파워(풀)","hiddenpowerground":"잠재파워(땅)","hiddenpowerice":"잠재파워(얼음)","hiddenpowerpoison":"잠재파워(독)","hiddenpowerpsychic":"잠재파워(에스퍼)","hiddenpowerrock":"잠재파워(바위)","hiddenpowersteel":"잠재파워(강철)","hiddenpowerwater":"잠재파워(물)","highhorsepower":"10만마력","highjumpkick":"무릎차기","holdback":"적당히손봐주기","hornattack":"뿔찌르기",
  "hornleech":"우드혼","hurricane":"폭풍","hydrocannon":"하이드로캐논","hydropump":"하이드로펌프","hydrosteam":"하이드로스팀","hyperbeam":"파괴광선","hyperdrill":"하이퍼드릴","hyperfang":"필살앞니","hyperspacefury":"이차원러시","hyperspacehole":"이차원홀","hypervoice":"하이퍼보이스","iceball":"아이스볼","icebeam":"냉동빔","iceburn":"콜드플레어","icefang":"얼음엄니","icehammer":"아이스해머","icepunch":"냉동펀치",
  "iceshard":"얼음뭉치","icespinner":"아이스스피너","iciclecrash":"고드름떨구기","iciclespear":"고드름침","icywind":"얼어붙은바람","incinerate":"불태우기","infernalparade":"백귀야행","inferno":"연옥","infestation":"엉겨붙기","ironhead":"아이언헤드","irontail":"아이언테일","ivycudgel":"덩굴방망이","jawlock":"물고버티기","jetpunch":"제트펀치","judgment":"심판의뭉치","jumpkick":"점프킥","karatechop":"태권당수",
  "knockoff":"탁쳐서떨구기","kowtowcleave":"도각참","landswrath":"그라운드포스","lashout":"분풀이","lastresort":"비장의무기","lastrespects":"성묘","lavaplume":"분연","leafage":"나뭇잎","leafblade":"리프블레이드","leafstorm":"리프스톰","leaftornado":"그래스믹서","leechlife":"흡혈","lick":"핥기","lightofruin":"파멸의빛","liquidation":"아쿠아브레이크","lowsweep":"로킥","luminacrash":"루미나콜리전",
  "lunge":"덤벼들기","lusterpurge":"러스터퍼지","machpunch":"마하펀치","magicalleaf":"매지컬리프","magicaltorque":"매지컬액셀","magmastorm":"마그마스톰","magnetbomb":"마그넷봄","makeitrain":"골드러시","malignantchain":"악독사슬","matchagotcha":"휘적휘적포","megadrain":"메가드레인","megahorn":"메가혼","megakick":"메가톤킥","megapunch":"메가톤펀치","metalclaw":"메탈클로","meteorassault":"스타어설트",
  "meteorbeam":"메테오빔","meteormash":"코멧펀치","mightycleave":"파워풀에지","mindblown":"깜짝헤드","mirrorshot":"미러샷","mistball":"미스트볼","mistyexplosion":"미스트버스트","moonblast":"문포스","moongeistbeam":"섀도레이","mortalspin":"킬러스핀","mountaingale":"빙산바람","mudbomb":"진흙폭탄","muddywater":"탁류","mudshot":"머드샷","mudslap":"진흙뿌리기","multiattack":"멀티어택","mysticalfire":"매지컬플레임",
  "mysticalpower":"신비의힘","needlearm":"바늘팔","nightdaze":"나이트버스트","nightslash":"깜짝베기","noxioustorque":"포이즌액셀","nuzzle":"볼부비부비","oblivionwing":"데스윙","octazooka":"대포무노포","ominouswind":"괴상한바람","orderup":"한판내기","originpulse":"근원의파동","outrage":"역린","overdrive":"오버드라이브","overheat":"오버히트","paraboliccharge":"파라볼라차지","payback":"보복",
  "payday":"고양이돈받기","peck":"쪼기","petalblizzard":"꽃보라","petaldance":"꽃잎댄스","phantomforce":"고스트다이브","photongeyser":"포톤가이저","pinmissile":"바늘미사일","plasmafists":"플라스마피스트","playrough":"치근거리기","pluck":"쪼아대기","poisonfang":"맹독엄니","poisonjab":"독찌르기","poisonsting":"독침","poisontail":"포이즌테일","pollenpuff":"꽃가루경단","poltergeist":"폴터가이스트",
  "populationbomb":"찍찍베기","pounce":"달려들기","pound":"막치기","powdersnow":"눈싸라기","powergem":"파워젬","powertrip":"기어오르기","poweruppunch":"그로우펀치","powerwhip":"파워휩","precipiceblades":"단애의칼","prismaticlaser":"프리즘레이저","psybeam":"환상빔","psyblade":"사이코블레이드","psychic":"사이코키네시스","psychicfangs":"사이코팽","psychicnoise":"사이코노이즈","psychoboost":"사이코부스트",
  "psychocut":"사이코커터","psyshieldbash":"배리어러시","psyshock":"사이코쇼크","psystrike":"사이코브레이크","pursuit":"따라가때리기","pyroball":"화염볼","quickattack":"전광석화","rage":"분노","ragefist":"분노의주먹","ragingbull":"레이징불","ragingfury":"대격분","rapidspin":"고속스핀","razorleaf":"잎날가르기","razorshell":"셸블레이드","razorwind":"칼바람","relicsong":"옛노래","retaliate":"원수갚기",
  "revelationdance":"잠재댄스","revenge":"리벤지","risingvoltage":"라이징볼트","roaroftime":"시간의포효","rockblast":"록블라스트","rockclimb":"록클라임","rockslide":"스톤샤워","rocksmash":"바위깨기","rockthrow":"돌떨구기","rocktomb":"암석봉인","rockwrecker":"암석포","rollingkick":"돌려차기","rollout":"구르기","round":"돌림노래","sacredfire":"성스러운불꽃","sacredsword":"성스러운칼","saltcure":"소금절이",
  "sandsearstorm":"열사의폭풍","sandtomb":"모래지옥","sappyseed":"쑥쑥봄버","scald":"열탕","scaleshot":"스케일샷","scorchingsands":"열사의대지","scratch":"할퀴기","searingshot":"화염탄","secretpower":"비밀의힘","secretsword":"신비의칼","seedbomb":"씨폭탄","seedflare":"시드플레어","selfdestruct":"자폭","shadowball":"섀도볼","shadowbone":"섀도본","shadowclaw":"섀도클로","shadowforce":"섀도다이브",
  "shadowpunch":"섀도펀치","shadowsneak":"야습","shellsidearm":"셸암즈","shelltrap":"트랩셸","shockwave":"전격파","signalbeam":"시그널빔","silverwind":"은빛바람","sizzlyslide":"이글이글번","skittersmack":"엄습하는일격","skullbash":"로켓박치기","skyattack":"불새","skydrop":"프리폴","skyuppercut":"스카이어퍼","slam":"힘껏치기","slash":"베어가르기","sludge":"오물공격","sludgebomb":"오물폭탄",
  "sludgewave":"오물웨이브","smackdown":"떨어뜨리기","smartstrike":"스마트혼","smellingsalts":"정신차리기","smog":"스모그","snaptrap":"집게덫","snarl":"바크아웃","snipeshot":"노려맞히기","snore":"코골기","solarbeam":"솔라빔","solarblade":"솔라블레이드","spacialrend":"공간절단","spark":"스파크","sparklingaria":"물거품아리아","sparklyswirl":"반짝반짝스톰","spectralthief":"섀도스틸","spikecannon":"가시대포",
  "spinout":"휠스핀","spiritbreak":"소울크래시","spiritshackle":"그림자꿰매기","splishysplash":"참방참방서핑","springtidestorm":"봄의폭풍","steameruption":"스팀버스트","steamroller":"하드롤러","steelbeam":"철제광선","steelroller":"아이언롤러","steelwing":"강철날개","stomp":"짓밟기","stompingtantrum":"분함의발구르기","stoneaxe":"암석액스","stoneedge":"스톤에지","storedpower":"어시스트파워","stormthrow":"업어후리기",
  "strangesteam":"원더스팀","strength":"괴력","struggle":"발버둥","strugglebug":"벌레의저항","submission":"지옥의바퀴","suckerpunch":"기습","sunsteelstrike":"메테오드라이브","supercellslam":"썬더다이브","superpower":"엄청난힘","surf":"파도타기","surgingstrikes":"수류연타","swift":"스피드스타","synchronoise":"싱크로노이즈","syrupbomb":"시럽봄","tachyoncutter":"타키온커터","tackle":"몸통박치기",
  "tailslap":"스위프뺨치기","takedown":"돌진","technoblast":"테크노버스터","temperflare":"열불내기","terablast":"테라버스트","terastarstorm":"테라클러스터","terrainpulse":"대지의파동","thief":"도둑질","thousandarrows":"사우전드애로","thousandwaves":"사우전드웨이브","thrash":"난동부리기","throatchop":"지옥찌르기","thunder":"번개","thunderbolt":"10만볼트","thundercage":"썬더프리즌","thunderclap":"질풍신뢰",
  "thunderfang":"번개엄니","thunderouskick":"천둥차기","thunderpunch":"번개펀치","thundershock":"전기쇼크","torchsong":"플레어송","trailblaze":"개척하기","triattack":"트라이어택","triplearrows":"3연화살","tripleaxel":"트리플악셀","tripledive":"트리플다이브","triplekick":"트리플킥","tropkick":"트로피컬킥","twinbeam":"트윈빔","twineedle":"더블니들","twister":"회오리","upperhand":"기선제압",
  "uproar":"소란피기","uturn":"유턴","vacuumwave":"진공파","vcreate":"V제너레이트","venoshock":"베놈쇼크","vinewhip":"덩굴채찍","visegrip":"찝기","vitalthrow":"받아던지기","voltswitch":"볼트체인지","volttackle":"볼트태클","wakeupslap":"잠깨움뺨치기","waterfall":"폭포오르기","watergun":"물대포","waterpledge":"물의맹세","waterpulse":"물의파동","watershuriken":"물수리검","waterspout":"해수스파우팅",
  "wavecrash":"웨이브태클","weatherball":"웨더볼","whirlpool":"바다회오리","wickedblow":"암흑강타","wickedtorque":"다크액셀","wildboltstorm":"번개폭풍","wildcharge":"와일드볼트","wingattack":"날개치기","woodhammer":"우드해머","wrap":"김밥말이","xscissor":"시저크로스","zapcannon":"전자포","zenheadbutt":"사념의박치기","zingzap":"찌리리따끔따끔","zippyzap":"파찌파찌액셀"};
const POKEMON_MOVE_FX = {"aerialace":"leftslash","dragonbreath":"purplewisp","dragonpulse":"shadowball","focusblast":"electroball","aurasphere":"iceball","technoblast":"iceball","flipturn":"waterwisp","mortalspin":"purplewisp","icespinner":"iceball","voltswitch":"electroball","shockwave":"electroball","discharge":"electroball",
  "bugbuzz":"energyball","explosion":"fireball","populationbomb":"rightslash","shadowforce":"shadowball","bounce":"wisp","dig":"wisp","dive":"waterwisp","hiddenpower":"electroball","storedpower":"purplewisp","seedflare":"energyball","powerwhip":"leaf1","woodhammer":"leaf1","ivycudgel":"leaf1","nightslash":"rightslash","multiattack":"rightslash",
  "crunch":"bottombite","pursuit":"shadowball","blazekick":"fireball","stomp":"foot","thunderouskick":"electroball","tropkick":"petal","highjumpkick":"shadowball","ironhead":"shadowball","heartstamp":"heart","forcepalm":"rightchop","circlethrow":"rightchop","bodyslam":"wisp","bloodmoon":"moon","gigatonhammer":"shadowball",
  "wakeupslap":"leftchop","smellingsalts":"rightchop","karatechop":"rightchop","crosschop":"rightchop","xscissor":"leftslash","crosspoison":"purplewisp","leafblade":"leaf1","thrash":"fist","bind":"iceball","closecombat":"fist","doublekick":"foot","playrough":"mistball","hammerarm":"shadowball","icehammer":"iceball","skyuppercut":"fist1",
  "meteormash":"shadowball","shadowpunch":"fist","ragefist":"shadowball","focuspunch":"fist","drainpunch":"electroball","dynamicpunch":"fireball","hornleech":"energyball","bitterblade":"bluefireball","leechlife":"electroball","extremespeed":"impact","suckerpunch":"impact","accelerock":"rock3","bulletpunch":"fist","machpunch":"fist",
  "wickedblow":"fist","vacuumwave":"fist","jetpunch":"waterwisp","megahorn":"wisp","firepunch":"fireball","icepunch":"fist","thunderpunch":"electroball","poisonfang":"purplewisp","firefang":"fireball","thunderfang":"electroball","wildcharge":"electroball","spark":"electroball","zapcannon":"electroball","armorcannon":"electroball",
  "torchsong":"flareball","chloroblast":"energyball","hyperbeam":"shadowball","gigaimpact":"impact","shelltrap":"fireball","spinout":"iceball","matchagotcha":"energyball","flamecharge":"fireball","flareblitz":"fireball","burnup":"fireball","beakblast":"flareball","vcreate":"fireball","outrage":"flareball","ragingfury":"flareball",
  "boltstrike":"iceball","fusionflare":"flareball","fusionbolt":"waterwisp","zenheadbutt":"mistball","fakeout":"leftchop","covet":"heart","earthquake":"rock3","earthpower":"rock3","drillrun":"flareball","smog":"purplewisp","clearsmog":"wisp","boneclub":"wisp","shadowbone":"shadowball","hurricane":"wisp","sandsearstorm":"mudwisp",
  "ominouswind":"purplewisp","magmastorm":"fireball","firespin":"fireball","leaftornado":"leaf1","hypervoice":"iceball","boomburst":"iceball","heatwave":"flareball","snarl":"shadowball","thunder":"electroball","rockblast":"rock3","geargrind":"gear","furyswipes":"rightslash","bulletseed":"energyball","spikecannon":"electroball",
  "twineedle":"energyball","razorshell":"shell","aquastep":"waterwisp","aquacutter":"waterwisp","wavecrash":"waterwisp","crabhammer":"waterwisp","aquajet":"waterwisp","watershuriken":"waterwisp","icebeam":"iceball","freezingglare":"mistball","freezedry":"wisp","icywind":"wisp","ancientpower":"rock3","powergem":"shine","chargebeam":"electroball",
  "psybeam":"mistball","twinbeam":"mistball","flamethrower":"fireball","sludge":"purplewisp","sludgewave":"purplewisp","sludgebomb":"purplewisp","syrupbomb":"flareball","mudbomb":"mudwisp","magnetbomb":"iceball","seedbomb":"energyball","rockwrecker":"rock3","stoneedge":"rock3","rockslide":"mudwisp","avalanche":"wisp","triplearrows":"flareball",
  "thousandarrows":"energyball","thousandwaves":"energyball","fireblast":"fireball","judgment":"wisp","psystrike":"purplewisp","shadowball":"shadowball","hex":"bluefireball","infernalparade":"shadowball","darkpulse":"shadowball","fierywrath":"flareball","terrainpulse":"iceball","energyball":"energyball","moonblast":"moon",
  "mistball":"iceball","iceball":"iceball","weatherball":"iceball","flowertrick":"energyball","mysticalpower":"mistball","psyshock":"waterwisp","barbbarrage":"purplewisp","esperwing":"feather","sandtomb":"mudwisp","saltcure":"wisp","flashcannon":"waterwisp","lusterpurge":"impact","aeroblast":"iceball","airslash":"wisp","aircutter":"wisp",
  "dracometeor":"flareball","makeitrain":"shine","octazooka":"blackwisp","scald":"wisp","steameruption":"wisp","waterpulse":"waterwisp","bubblebeam":"iceball","surf":"waterwisp","muddywater":"mudwisp","mudshot":"mudwisp","lavaplume":"fireball","dragonenergy":"shadowball","eruption":"fireball","waterspout":"waterwisp","solarbeam":"flareball",
  "electroshot":"electroball","solarblade":"leftslash","lightofruin":"rainbow","meteorbeam":"flareball","glaciallance":"iceball","freezeshock":"iceball","iceburn":"iceball","overheat":"fireball","blastburn":"fireball","sacredfire":"iceball","blueflare":"bluefireball","electroweb":"web","paraboliccharge":"electroball","drainingkiss":"mistball",
  "oblivionwing":"blackwisp","signalbeam":"electroball","triattack":"fireball","tripleaxel":"foot","roaroftime":"waterwisp","spacialrend":"leftslash","sacredsword":"sword","secretsword":"sword","psychocut":"wisp","precipiceblades":"fireball","originpulse":"waterwisp","dragonascent":"electroball","diamondstorm":"mistball",
  "dazzlinggleam":"wisp","mistyexplosion":"fireball","payday":"electroball","swift":"wisp","leafstorm":"leaf1","petaldance":"petal","petalblizzard":"petal","magicalleaf":"leaf1","leafage":"feather","gunkshot":"purplewisp","hyperspacehole":"mistball","hyperspacefury":"fist","poisonjab":"purplewisp","psychoboost":"mistball",
  "spiritshackle":"shadowball","brutalswing":"shadowball","revelationdance":"electroball","prismaticlaser":"mistball","firstimpression":"electroball","firelash":"fireball","powertrip":"wisp","smartstrike":"iceball","anchorshot":"energyball","clangingscales":"shadowball","spectralthief":"shadowball","plasmafists":"electroball",
  "collisioncourse":"flareball","electrodrift":"waterwisp","sunsteelstrike":"fireball","moongeistbeam":"bluefireball","astralbarrage":"bluefireball","photongeyser":"energyball","coreenforcer":"flareball","supercellslam":"electroball","psychicnoise":"mistball","fishiousrend":"waterwisp","stompingtantrum":"rock3","temperflare":"fireball",
  "terastarstorm":"electroball","thunderclap":"electroball","mightycleave":"rightslash","spiritbreak":"shine","stoneaxe":"rock3","malignantchain":"purplewisp","tachyoncutter":"rightslash","ficklebeam":"flareball"};
const POKEMON_STATUS_MOVE_KO = {"growl":"울음소리","growth":"성장","leechseed":"씨뿌리기","poisonpowder":"독가루","sleeppowder":"수면가루","sweetscent":"달콤한향기","synthesis":"광합성","worryseed":"고민씨","scaryface":"겁나는얼굴","smokescreen":"연막","irondefense":"철벽","protect":"방어","raindance":"비바라기","shellsmash":"껍질깨기","tailwhip":"꼬리흔들기","withdraw":"껍질에숨기","stringshot":"실뿜기","harden":"단단해지기","captivate":"유혹","quiverdance":"나비춤","ragepowder":"분노가루","safeguard":"신비의부적","stunspore":"저리가루","supersonic":"초음파","tailwind":"순풍","whirlwind":"날려버리기","agility":"고속이동","focusenergy":"기충전","toxicspikes":"독압정","featherdance":"깃털댄스","mirrormove":"따라하기","roost":"날개쉬기","sandattack":"모래뿌리기","swordsdance":"칼춤","leer":"째려보기","coil":"똬리틀기","gastroacid":"위액","glare":"뱀눈초리","haze":"흑안개","screech":"싫은소리","stockpile":"비축하기","swallow":"꿀꺽","charm":"애교부리기","nastyplot":"나쁜음모","playnice":"친해지기","sweetkiss":"천사의키스","thunderwave":"전기자석파","doubleteam":"그림자분신","lightscreen":"빛의장막","speedswap":"스피드스왑","defensecurl":"웅크리기","sandstorm":"모래바람","hail":"싸라기눈","mist":"흰안개","snowscape":"설경","flatter":"부추기기","helpinghand":"도우미","toxic":"맹독","copycat":"흉내쟁이","encore":"앙코르","sing":"노래하기","splash":"튀어오르기","afteryou":"당신먼저","bestow":"기프트패스","cosmicpower":"코스믹파워","followme":"날따름","gravity":"중력","healingwish":"치유소원","lifedew":"생명의물방울","luckychant":"주술","metronome":"손가락흔들기","minimize":"작아지기","moonlight":"달빛","spotlight":"스포트라이트","babydolleyes":"초롱초롱눈동자","confuseray":"이상한빛","disable":"사슬묶기","grudge":"원념","imprison":"봉인","roar":"울부짖기","spite":"원한","willowisp":"도깨비불","auroraveil":"오로라베일","mimic":"흉내내기","rest":"잠자기","meanlook":"검은눈빛","quickguard":"패스트가드","grassyterrain":"그래스필드","aromatherapy":"아로마테라피","sunnyday":"쾌청","spore":"버섯포자","foresight":"꿰뚫어보기","rototiller":"일구기","swagger":"뽐내기","taunt":"도발","honeclaws":"손톱갈기","metalsound":"금속음","switcheroo":"바꿔치기","quash":"순서미루기","amnesia":"망각술","psychup":"자기암시","soak":"물붓기","watersport":"물놀이","wonderroom":"원더룸","mefirst":"선취","howl":"멀리짖기","odorsleuth":"냄새구별","bellydrum":"배북","hypnosis":"최면술","mindreader":"마음의눈","perishsong":"멸망의노래","teleport":"순간이동","allyswitch":"사이드체인지","calmmind":"명상","kinesis":"숟가락휘기","miracleeye":"미라클아이","recover":"HP회복","reflect":"리플렉터","roleplay":"역할","telekinesis":"텔레키네시스","trick":"트릭","bulkup":"벌크업","wideguard":"와이드가드","acidarmor":"녹기","barrier":"배리어","reflecttype":"미러타입","mudsport":"흙놀이","rockpolish":"록커트","stealthrock":"스텔스록","charge":"충전","healpulse":"치유파동","curse":"저주","slackoff":"게으름피우기","yawn":"하품","chillyreception":"썰렁개그","lockon":"록온","magnetrise":"전자부유","electricterrain":"일렉트릭필드","magneticflux":"자기장조작","defog":"안개제거","detect":"판별","acupressure":"경혈찌르기","aquaring":"아쿠아링","memento":"추억의선물","poisongas":"독가스","venomdrench":"베놈트랩","spikes":"압정뿌리기","destinybond":"길동무","nightmare":"악몽","autotomize":"바디퍼지","meditate":"요가포즈","eerieimpulse":"괴전파","endure":"버티기","refresh":"리프레시","aromaticmist":"아로마미스트","mistyterrain":"미스트필드","softboiled":"알낳기","ingrain":"뿌리박기","tickle":"간지르기","block":"블록","dragondance":"용의춤","laserfocus":"예민해지기","camouflage":"보호색","batonpass":"배턴터치","recycle":"리사이클","substitute":"대타출동","teeterdance":"흔들흔들댄스","guardswap":"가드스왑","powerswap":"파워스왑","faketears":"거짓울음","lovelykiss":"악마의키스","iondeluge":"플라스마샤워","workup":"분발","transform":"변신","morningsun":"아침햇살","grasswhistle":"풀피리","conversion":"텍스처","conversion2":"텍스처2","magiccoat":"매직코트","sharpen":"각지기","embargo":"금제","trickroom":"트릭룸","snatch":"가로채기","sleeptalk":"잠꼬대","psychoshift":"사이코시프트","spiderweb":"거미집","stickyweb":"끈적끈적네트","toxicthread":"독실","wish":"희망사항","cottonguard":"코튼가드","cottonspore":"목화포자","tearfullook":"눈물그렁그렁","flowershield":"플라워가드","torment":"트집","painsplit":"아픔나누기","guardsplit":"가드셰어","powersplit":"파워셰어","powertrick":"파워트릭","strengthsap":"힘흡수","sketch":"스케치","healbell":"치료방울","milkdrink":"우유마시기","healblock":"회복봉인","shedtail":"꼬리자르기","obstruct":"블로킹","attract":"헤롱헤롱","naturepower":"자연의힘","assist":"조수","entrainment":"동료만들기","flash":"플래시","tailglow":"반딧불","nobleroar":"부르짖기","spikyshield":"니들가드","magicroom":"매직룸","simplebeam":"심플빔","skillswap":"스킬스왑","defendorder":"방어지령","healorder":"회복지령","confide":"비밀이야기","lunarblessing":"초승달의기도","lunardance":"초승달춤","takeheart":"브레이브차지","heartswap":"하트스왑","darkvoid":"다크홀","psychicterrain":"사이코필드","matblock":"마룻바닥세워막기","victorydance":"승리의춤","craftyshield":"트릭가드","shiftgear":"기어체인지","gearup":"어시스트기어","powder":"분진","partingshot":"막말내뱉기","kingsshield":"킹실드","topsyturvy":"뒤집어엎기","electrify":"송전","shelter":"농성","fairylock":"페어리록","forestscurse":"숲의저주","trickortreat":"핼러윈","geomancy":"지오컨트롤","banefulbunker":"토치카","floralhealing":"플라워힐","instruct":"지휘","shoreup":"모래모으기","purify":"정화","clangoroussoul":"소울비트","courtchange":"코트체인지","stuffcheeks":"볼가득넣기","tarshot":"타르샷","octolock":"문어굳히기","teatime":"다과회","magicpowder":"마법가루","decorate":"데코레이션","noretreat":"배수의진","junglehealing":"정글힐","silktrap":"스레드트랩","revivalblessing":"회생의기도","filletaway":"제살깎기","spicyextract":"하바네로엑기스","tidyup":"정리정돈","doodle":"배껴그리기","burningbulwark":"화염의수호"};
const POKEMON_EXTRA_MOVE_KO = {"beatup":"집단구타","bide":"참기","celebrate":"축하","coaching":"코칭","comeuppance":"앙갚음","corrosivegas":"부식가스","counter":"카운터","crushgrip":"묵사발","dragoncheer":"드래곤옐","dragonrage":"용의분노","electroball":"일렉트릭볼","endeavor":"죽기살기","finalgambit":"목숨걸기","fissure":"땅가르기","flail":"바둥바둥","fling":"내던지기","frustration":"화풀이","grassknot":"풀묶기","guillotine":"가위자르기","gyroball":"자이로볼","happyhour":"해피타임","hardpress":"하드프레스","heatcrash":"히트스탬프","heavyslam":"헤비봄버","holdhands":"손에손잡기","horndrill":"뿔드릴","lowkick":"안다리걸기","magnitude":"매그니튜드","metalburst":"메탈버스트","mirrorcoat":"미러코트","naturalgift":"자연의은혜","naturesmadness":"자연의분노","nightshade":"나이트헤드","pikapapow":"피카피카썬더","present":"프레젠트","psywave":"사이코웨이브","punishment":"혼내기","return":"은혜갚기","reversal":"기사회생","ruination":"카타스트로피","seismictoss":"지구던지기","sheercold":"절대영도","sonicboom":"소닉붐","spitup":"토해내기","superfang":"분노의앞니","trumpcard":"마지막수단","veeveevolley":"브이브이브레이크","wringout":"쥐어짜기"};
const POKEMON_BATTLE_MEGA_DATA = [["venusaur","venusaurite","venusaurmega",""],["charizard","charizarditex","charizardmegax",""],["charizard","charizarditey","charizardmegay",""],["blastoise","blastoisinite","blastoisemega",""],["beedrill","beedrillite","beedrillmega",""],["pidgeot","pidgeotite","pidgeotmega",""],["raichu","raichunitex","raichumegax",""],["raichu","raichunitey","raichumegay",""],["clefable","clefablite","clefablemega",""],["alakazam","alakazite","alakazammega",""],["victreebel","victreebelite","victreebelmega",""],["slowbro","slowbronite","slowbromega",""],["gengar","gengarite","gengarmega",""],["kangaskhan","kangaskhanite","kangaskhanmega",""],["starmie","starminite","starmiemega",""],["pinsir","pinsirite","pinsirmega",""],["gyarados","gyaradosite","gyaradosmega",""],["aerodactyl","aerodactylite","aerodactylmega",""],["dragonite","dragoninite","dragonitemega",""],["mewtwo","mewtwonitex","mewtwomegax",""],["mewtwo","mewtwonitey","mewtwomegay",""],["meganium","meganiumite","meganiummega",""],["feraligatr","feraligite","feraligatrmega",""],["ampharos","ampharosite","ampharosmega",""],["steelix","steelixite","steelixmega",""],["scizor","scizorite","scizormega",""],["heracross","heracronite","heracrossmega",""],["skarmory","skarmorite","skarmorymega",""],["houndoom","houndoominite","houndoommega",""],["tyranitar","tyranitarite","tyranitarmega",""],["sceptile","sceptilite","sceptilemega",""],["blaziken","blazikenite","blazikenmega",""],["swampert","swampertite","swampertmega",""],["gardevoir","gardevoirite","gardevoirmega",""],["sableye","sablenite","sableyemega",""],["mawile","mawilite","mawilemega",""],["aggron","aggronite","aggronmega",""],["medicham","medichamite","medichammega",""],["manectric","manectite","manectricmega",""],["sharpedo","sharpedonite","sharpedomega",""],["camerupt","cameruptite","cameruptmega",""],["altaria","altarianite","altariamega",""],["banette","banettite","banettemega",""],["chimecho","chimechite","chimechomega",""],["absol","absolite","absolmega",""],["absol","absolitez","absolmegaz",""],["glalie","glalitite","glaliemega",""],["salamence","salamencite","salamencemega",""],["metagross","metagrossite","metagrossmega",""],["latias","latiasite","latiasmega",""],["latios","latiosite","latiosmega",""],["rayquaza","","rayquazamega","dragonascent"],["staraptor","staraptite","staraptormega",""],["lopunny","lopunnite","lopunnymega",""],["garchomp","garchompite","garchompmega",""],["garchomp","garchompitez","garchompmegaz",""],["lucario","lucarionite","lucariomega",""],["lucario","lucarionitez","lucariomegaz",""],["abomasnow","abomasite","abomasnowmega",""],["gallade","galladite","gallademega",""],["froslass","froslassite","froslassmega",""],["heatran","heatranite","heatranmega",""],["darkrai","darkranite","darkraimega",""],["emboar","emboarite","emboarmega",""],["excadrill","excadrite","excadrillmega",""],["audino","audinite","audinomega",""],["scolipede","scolipite","scolipedemega",""],["scrafty","scraftinite","scraftymega",""],["eelektross","eelektrossite","eelektrossmega",""],["chandelure","chandelurite","chandeluremega",""],["golurk","golurkite","golurkmega",""],["chesnaught","chesnaughtite","chesnaughtmega",""],["delphox","delphoxite","delphoxmega",""],["greninja","greninjite","greninjamega",""],["pyroar","pyroarite","pyroarmega",""],["floette","floettite","floettemega",""],["malamar","malamarite","malamarmega",""],["barbaracle","barbaracite","barbaraclemega",""],["dragalge","dragalgite","dragalgemega",""],["hawlucha","hawluchanite","hawluchamega",""],["zygarde","zygardite","zygardemega",""],["diancie","diancite","dianciemega",""],["crabominable","crabominite","crabominablemega",""],["golisopod","golisopite","golisopodmega",""],["drampa","drampanite","drampamega",""],["magearna","magearnite","magearnamega",""],["zeraora","zeraorite","zeraoramega",""],["falinks","falinksite","falinksmega",""],["scovillain","scovillainite","scovillainmega",""],["glimmora","glimmoranite","glimmoramega",""],["baxcalibur","baxcalibrite","baxcaliburmega",""]];

const POKEMON_DAMAGE_EFFECTS = {"absorb":{"d":[1,2]},"acid":{"x":[{"c":10,"b":{"spd":-1}}]},"acidspray":{"x":[{"c":100,"b":{"spd":-2}}]},"airslash":{"x":[{"c":30,"v":"flinch"}]},"ancientpower":{"x":[{"c":10,"o":{"atk":1,"def":1,"spa":1,"spd":1,"spe":1}}]},"appleacid":{"x":[{"c":100,"b":{"spd":-1}}]},"aquastep":{"x":[{"c":100,"o":{"spe":1}}]},"armorcannon":{"o":{"def":-1,"spd":-1}},"astonish":{"x":[{"c":30,"v":"flinch"}]},"aurawheel":{"x":[{"c":100,"o":{"spe":1}}]},"aurorabeam":{"x":[{"c":10,"b":{"atk":-1}}]},"axekick":{"x":[{"c":30,"v":"confusion"}]},"barbbarrage":{"x":[{"c":50,"s":"psn"}]},"bite":{"x":[{"c":30,"v":"flinch"}]},"bitterblade":{"d":[1,2]},"bittermalice":{"x":[{"c":100,"b":{"atk":-1}}]},"blazekick":{"x":[{"c":10,"s":"brn"}]},"blazingtorque":{"x":[{"c":30,"s":"brn"}]},"bleakwindstorm":{"x":[{"c":30,"b":{"spe":-1}}]},"blizzard":{"x":[{"c":10,"s":"frz"}]},"blueflare":{"x":[{"c":20,"s":"brn"}]},"bodyslam":{"x":[{"c":30,"s":"par"}]},"boltstrike":{"x":[{"c":20,"s":"par"}]},"boneclub":{"x":[{"c":10,"v":"flinch"}]},"bounce":{"x":[{"c":30,"s":"par"}]},"bouncybubble":{"d":[1,2]},"bravebird":{"r":[33,100]},"breakingswipe":{"x":[{"c":100,"b":{"atk":-1}}]},"bubble":{"x":[{"c":10,"b":{"spe":-1}}]},"bubblebeam":{"x":[{"c":10,"b":{"spe":-1}}]},"bugbuzz":{"x":[{"c":10,"b":{"spd":-1}}]},"bulldoze":{"x":[{"c":100,"b":{"spe":-1}}]},"buzzybuzz":{"x":[{"c":100,"s":"par"}]},"chargebeam":{"x":[{"c":70,"o":{"spa":1}}]},"chatter":{"x":[{"c":100,"v":"confusion"}]},"chillingwater":{"x":[{"c":100,"b":{"atk":-1}}]},"closecombat":{"o":{"def":-1,"spd":-1}},"combattorque":{"x":[{"c":30,"s":"par"}]},"confusion":{"x":[{"c":10,"v":"confusion"}]},"constrict":{"x":[{"c":10,"b":{"spe":-1}}]},"crosspoison":{"x":[{"c":10,"s":"psn"}]},"crunch":{"x":[{"c":20,"b":{"def":-1}}]},"crushclaw":{"x":[{"c":50,"b":{"def":-1}}]},"darkpulse":{"x":[{"c":20,"v":"flinch"}]},"diamondstorm":{"o":{"def":2}},"discharge":{"x":[{"c":30,"s":"par"}]},"dizzypunch":{"x":[{"c":20,"v":"confusion"}]},"doubleedge":{"r":[33,100]},"doubleironbash":{"x":[{"c":30,"v":"flinch"}]},"dracometeor":{"o":{"spa":-2}},"dragonascent":{"o":{"def":-1,"spd":-1}},"dragonbreath":{"x":[{"c":30,"s":"par"}]},"dragonrush":{"x":[{"c":20,"v":"flinch"}]},"drainingkiss":{"d":[3,4]},"drainpunch":{"d":[1,2]},"dreameater":{"d":[1,2]},"drumbeating":{"x":[{"c":100,"b":{"spe":-1}}]},"dynamicpunch":{"x":[{"c":100,"v":"confusion"}]},"earthpower":{"x":[{"c":10,"b":{"spd":-1}}]},"electroweb":{"x":[{"c":100,"b":{"spe":-1}}]},"ember":{"x":[{"c":10,"s":"brn"}]},"energyball":{"x":[{"c":10,"b":{"spd":-1}}]},"esperwing":{"x":[{"c":100,"o":{"spe":1}}]},"extrasensory":{"x":[{"c":10,"v":"flinch"}]},"fakeout":{"x":[{"c":100,"v":"flinch"}]},"fierydance":{"x":[{"c":50,"o":{"spa":1}}]},"fierywrath":{"x":[{"c":20,"v":"flinch"}]},"fireblast":{"x":[{"c":10,"s":"brn"}]},"firefang":{"x":[{"c":10,"s":"brn"},{"c":10,"v":"flinch"}]},"firelash":{"x":[{"c":100,"b":{"def":-1}}]},"firepunch":{"x":[{"c":10,"s":"brn"}]},"flamecharge":{"x":[{"c":100,"o":{"spe":1}}]},"flamethrower":{"x":[{"c":10,"s":"brn"}]},"flamewheel":{"x":[{"c":10,"s":"brn"}]},"flareblitz":{"x":[{"c":10,"s":"brn"}],"r":[33,100]},"flashcannon":{"x":[{"c":10,"b":{"spd":-1}}]},"fleurcannon":{"o":{"spa":-2}},"floatyfall":{"x":[{"c":30,"v":"flinch"}]},"focusblast":{"x":[{"c":10,"b":{"spd":-1}}]},"forcepalm":{"x":[{"c":30,"s":"par"}]},"freezedry":{"x":[{"c":10,"s":"frz"}]},"freezeshock":{"x":[{"c":30,"s":"par"}]},"freezingglare":{"x":[{"c":10,"s":"frz"}]},"gigadrain":{"d":[1,2]},"glaciate":{"x":[{"c":100,"b":{"spe":-1}}]},"gravapple":{"x":[{"c":100,"b":{"def":-1}}]},"gunkshot":{"x":[{"c":30,"s":"psn"}]},"hammerarm":{"o":{"spe":-1}},"headbutt":{"x":[{"c":30,"v":"flinch"}]},"headcharge":{"r":[1,4]},"headlongrush":{"o":{"def":-1,"spd":-1}},"headsmash":{"r":[1,2]},"heartstamp":{"x":[{"c":30,"v":"flinch"}]},"heatwave":{"x":[{"c":10,"s":"brn"}]},"hornleech":{"d":[1,2]},"hurricane":{"x":[{"c":30,"v":"confusion"}]},"hyperfang":{"x":[{"c":10,"v":"flinch"}]},"hyperspacefury":{"o":{"def":-1}},"icebeam":{"x":[{"c":10,"s":"frz"}]},"iceburn":{"x":[{"c":30,"s":"brn"}]},"icefang":{"x":[{"c":10,"s":"frz"},{"c":10,"v":"flinch"}]},"icehammer":{"o":{"spe":-1}},"icepunch":{"x":[{"c":10,"s":"frz"}]},"iciclecrash":{"x":[{"c":30,"v":"flinch"}]},"icywind":{"x":[{"c":100,"b":{"spe":-1}}]},"infernalparade":{"x":[{"c":30,"s":"brn"}]},"inferno":{"x":[{"c":100,"s":"brn"}]},"ironhead":{"x":[{"c":30,"v":"flinch"}]},"irontail":{"x":[{"c":30,"b":{"def":-1}}]},"lavaplume":{"x":[{"c":30,"s":"brn"}]},"leafstorm":{"o":{"spa":-2}},"leaftornado":{"x":[{"c":50,"b":{"accuracy":-1}}]},"leechlife":{"d":[1,2]},"lick":{"x":[{"c":30,"s":"par"}]},"lightofruin":{"r":[1,2]},"liquidation":{"x":[{"c":20,"b":{"def":-1}}]},"lowsweep":{"x":[{"c":100,"b":{"spe":-1}}]},"luminacrash":{"x":[{"c":100,"b":{"spd":-2}}]},"lunge":{"x":[{"c":100,"b":{"atk":-1}}]},"lusterpurge":{"x":[{"c":50,"b":{"spd":-1}}]},"magicaltorque":{"x":[{"c":30,"v":"confusion"}]},"makeitrain":{"o":{"spa":-1}},"malignantchain":{"x":[{"c":50,"s":"tox"}]},"matchagotcha":{"x":[{"c":20,"s":"brn"}],"d":[1,2]},"megadrain":{"d":[1,2]},"metalclaw":{"x":[{"c":10,"o":{"atk":1}}]},"meteormash":{"x":[{"c":20,"o":{"atk":1}}]},"mirrorshot":{"x":[{"c":30,"b":{"accuracy":-1}}]},"mistball":{"x":[{"c":50,"b":{"spa":-1}}]},"moonblast":{"x":[{"c":30,"b":{"spa":-1}}]},"mortalspin":{"x":[{"c":100,"s":"psn"}]},"mountaingale":{"x":[{"c":30,"v":"flinch"}]},"mudbomb":{"x":[{"c":30,"b":{"accuracy":-1}}]},"muddywater":{"x":[{"c":30,"b":{"accuracy":-1}}]},"mudshot":{"x":[{"c":100,"b":{"spe":-1}}]},"mudslap":{"x":[{"c":100,"b":{"accuracy":-1}}]},"mysticalfire":{"x":[{"c":100,"b":{"spa":-1}}]},"mysticalpower":{"x":[{"c":100,"o":{"spa":1}}]},"needlearm":{"x":[{"c":30,"v":"flinch"}]},"nightdaze":{"x":[{"c":40,"b":{"accuracy":-1}}]},"noxioustorque":{"x":[{"c":30,"s":"psn"}]},"nuzzle":{"x":[{"c":100,"s":"par"}]},"oblivionwing":{"d":[3,4]},"octazooka":{"x":[{"c":50,"b":{"accuracy":-1}}]},"ominouswind":{"x":[{"c":10,"o":{"atk":1,"def":1,"spa":1,"spd":1,"spe":1}}]},"overheat":{"o":{"spa":-2}},"paraboliccharge":{"d":[1,2]},"playrough":{"x":[{"c":10,"b":{"atk":-1}}]},"poisonfang":{"x":[{"c":50,"s":"tox"}]},"poisonjab":{"x":[{"c":30,"s":"psn"}]},"poisonsting":{"x":[{"c":30,"s":"psn"}]},"poisontail":{"x":[{"c":10,"s":"psn"}]},"pounce":{"x":[{"c":100,"b":{"spe":-1}}]},"powdersnow":{"x":[{"c":10,"s":"frz"}]},"poweruppunch":{"x":[{"c":100,"o":{"atk":1}}]},"psybeam":{"x":[{"c":10,"v":"confusion"}]},"psychic":{"x":[{"c":10,"b":{"spd":-1}}]},"psychicnoise":{"x":[{"c":100,"v":"healblock"}]},"psychoboost":{"o":{"spa":-2}},"psyshieldbash":{"x":[{"c":100,"o":{"def":1}}]},"pyroball":{"x":[{"c":10,"s":"brn"}]},"rapidspin":{"x":[{"c":100,"o":{"spe":1}}]},"razorshell":{"x":[{"c":50,"b":{"def":-1}}]},"relicsong":{"x":[{"c":10,"s":"slp"}]},"rockclimb":{"x":[{"c":20,"v":"confusion"}]},"rockslide":{"x":[{"c":30,"v":"flinch"}]},"rocksmash":{"x":[{"c":50,"b":{"def":-1}}]},"rocktomb":{"x":[{"c":100,"b":{"spe":-1}}]},"rollingkick":{"x":[{"c":30,"v":"flinch"}]},"sacredfire":{"x":[{"c":50,"s":"brn"}]},"saltcure":{"x":[{"c":100,"v":"saltcure"}]},"sandsearstorm":{"x":[{"c":20,"s":"brn"}]},"scald":{"x":[{"c":30,"s":"brn"}]},"scorchingsands":{"x":[{"c":30,"s":"brn"}]},"searingshot":{"x":[{"c":30,"s":"brn"}]},"secretpower":{"x":[{"c":30,"s":"par"}]},"seedflare":{"x":[{"c":40,"b":{"spd":-2}}]},"shadowball":{"x":[{"c":20,"b":{"spd":-1}}]},"shadowbone":{"x":[{"c":20,"b":{"def":-1}}]},"shellsidearm":{"x":[{"c":20,"s":"psn"}]},"signalbeam":{"x":[{"c":10,"v":"confusion"}]},"silverwind":{"x":[{"c":10,"o":{"atk":1,"def":1,"spa":1,"spd":1,"spe":1}}]},"sizzlyslide":{"x":[{"c":100,"s":"brn"}]},"skittersmack":{"x":[{"c":100,"b":{"spa":-1}}]},"skyattack":{"x":[{"c":30,"v":"flinch"}]},"sludge":{"x":[{"c":30,"s":"psn"}]},"sludgebomb":{"x":[{"c":30,"s":"psn"}]},"sludgewave":{"x":[{"c":10,"s":"psn"}]},"smog":{"x":[{"c":40,"s":"psn"}]},"snarl":{"x":[{"c":100,"b":{"spa":-1}}]},"snore":{"x":[{"c":30,"v":"flinch"}]},"spark":{"x":[{"c":30,"s":"par"}]},"sparklingaria":{"x":[{"c":100,"v":"sparklingaria"}]},"spinout":{"o":{"spe":-2}},"spiritbreak":{"x":[{"c":100,"b":{"spa":-1}}]},"splishysplash":{"x":[{"c":30,"s":"par"}]},"springtidestorm":{"x":[{"c":30,"b":{"atk":-1}}]},"steameruption":{"x":[{"c":30,"s":"brn"}]},"steamroller":{"x":[{"c":30,"v":"flinch"}]},"steelwing":{"x":[{"c":10,"o":{"def":1}}]},"stomp":{"x":[{"c":30,"v":"flinch"}]},"strangesteam":{"x":[{"c":20,"v":"confusion"}]},"strugglebug":{"x":[{"c":100,"b":{"spa":-1}}]},"submission":{"r":[1,4]},"superpower":{"o":{"atk":-1,"def":-1}},"syrupbomb":{"x":[{"c":100,"v":"syrupbomb"}]},"takedown":{"r":[1,4]},"thunder":{"x":[{"c":30,"s":"par"}]},"thunderbolt":{"x":[{"c":10,"s":"par"}]},"thunderfang":{"x":[{"c":10,"s":"par"},{"c":10,"v":"flinch"}]},"thunderouskick":{"x":[{"c":100,"b":{"def":-1}}]},"thunderpunch":{"x":[{"c":10,"s":"par"}]},"thundershock":{"x":[{"c":10,"s":"par"}]},"torchsong":{"x":[{"c":100,"o":{"spa":1}}]},"trailblaze":{"x":[{"c":100,"o":{"spe":1}}]},"triplearrows":{"x":[{"c":50,"b":{"def":-1}},{"c":30,"v":"flinch"}]},"tropkick":{"x":[{"c":100,"b":{"atk":-1}}]},"twineedle":{"x":[{"c":20,"s":"psn"}]},"twister":{"x":[{"c":20,"v":"flinch"}]},"upperhand":{"x":[{"c":100,"v":"flinch"}]},"vcreate":{"o":{"spe":-1,"def":-1,"spd":-1}},"volttackle":{"x":[{"c":10,"s":"par"}],"r":[33,100]},"waterfall":{"x":[{"c":20,"v":"flinch"}]},"waterpulse":{"x":[{"c":20,"v":"confusion"}]},"wavecrash":{"r":[33,100]},"wickedtorque":{"x":[{"c":10,"s":"slp"}]},"wildboltstorm":{"x":[{"c":20,"s":"par"}]},"wildcharge":{"r":[1,4]},"woodhammer":{"r":[33,100]},"zapcannon":{"x":[{"c":100,"s":"par"}]},"zenheadbutt":{"x":[{"c":20,"v":"flinch"}]},"zingzap":{"x":[{"c":30,"v":"flinch"}]},"zippyzap":{"x":[{"c":100,"o":{"evasion":1}}]},"paleowave":{"x":[{"c":20,"b":{"atk":-1}}]},"shadowstrike":{"x":[{"c":50,"b":{"def":-1}}]},"polarflare":{"x":[{"c":10,"s":"frz"}]}};
const POKEMON_CONTACT_MOVES = new Set("accelerock acrobatics aerialace anchorshot aquajet aquastep aquatail armthrust assurance astonish avalanche axekick behemothbash behemothblade bide bind bite bitterblade blazekick bodypress bodyslam boltbeak boltstrike bounce branchpoke bravebird breakingswipe brickbreak brutalswing bugbite bulletpunch catastropika ceaselessedge chipaway circlethrow clamp closecombat collisioncourse cometpunch comeuppance constrict counter covet crabhammer crosschop crosspoison crunch crushclaw crushgrip cut darkestlariat dig direclaw dive dizzypunch doubleedge doublehit doubleironbash doublekick doubleshock doubleslap dragonascent dragonclaw dragonhammer dragonrush dragontail drainingkiss drainpunch drillpeck drillrun dualchop dualwingbeat dynamicpunch electrodrift endeavor extremespeed facade fakeout falsesurrender falseswipe feintattack fellstinger firefang firelash firepunch firstimpression fishiousrend flail flamecharge flamewheel flareblitz flipturn floatyfall fly flyingpress focuspunch forcepalm foulplay frustration furyattack furycutter furyswipes geargrind gigaimpact glaiverush grassknot grassyglide guillotine gyroball hammerarm hardpress headbutt headcharge headlongrush headsmash heartstamp heatcrash heavyslam highhorsepower highjumpkick holdback hornattack horndrill hornleech hyperdrill hyperfang iceball icefang icehammer icepunch icespinner infestation ironhead irontail jawlock jetpunch jumpkick karatechop knockoff kowtowcleave lashout lastresort leafblade leechlife letssnuggleforever lick liquidation lowkick lowsweep lunge machpunch maliciousmoonsault megahorn megakick megapunch metalclaw meteormash mightycleave mortalspin multiattack needlearm nightslash nuzzle outrage payback peck petaldance phantomforce plasmafists playrough pluck poisonfang poisonjab poisontail populationbomb pounce pound powertrip poweruppunch powerwhip psyblade psychicfangs psyshieldbash pulverizingpancake punishment pursuit quickattack rage ragefist ragingbull rapidspin razorshell retaliate return revenge reversal rockclimb rocksmash rollingkick rollout sacredsword scratch searingsunrazesmash seismictoss shadowclaw shadowforce shadowpunch shadowsneak sizzlyslide skittersmack skullbash skydrop skyuppercut slam slash smartstrike smellingsalts snaptrap solarblade soulstealing7starstrike spark spectralthief spinout spiritbreak steamroller steelroller steelwing stomp stompingtantrum stoneaxe stormthrow strength struggle submission suckerpunch sunsteelstrike supercellslam superfang superpower surgingstrikes tackle tailslap takedown temperflare thief thrash throatchop thunderfang thunderouskick thunderpunch trailblaze tripleaxel tripledive triplekick tropkick trumpcard upperhand uturn vcreate veeveevolley vinewhip visegrip vitalthrow volttackle wakeupslap waterfall wavecrash wickedblow wildcharge wingattack woodhammer wrap wringout xscissor zenheadbutt zingzap zippyzap shadowstrike".split(" "));
const POKEMON_ABILITY_POOL = ["adaptability","aerilate","aftermath","airlock","analytic","angerpoint","angershell","anticipation","arenatrap","armortail","aromaveil","asoneglastrier","asonespectrier","aurabreak","auraguard","baddreams",("ballfe" + "tch"),"battery","battlearmor","battlebond","beadsofruin","beastboost","berserk","bigpecks","blaze","bulletproof","cheekpouch","chillingneigh","chlorophyll","clearbody","cloudnine","colorchange","comatose","commander","competitive","compoundeyes","contrary","corrosion","costar","cottondown","cudchew","curiousmedicine","cursedbody","cutecharm","damp","dancer","darkaura","dauntlessshield","dazzling","defeatist","defiant","deltastream","desolateland","disguise","download","dragonize","dragonsmaw","drizzle","drought","dryskin","earlybird","eartheater","eelevate","effectspore","electricsurge","electromorphosis","embodyaspectcornerstone","embodyaspecthearthflame","embodyaspectteal","embodyaspectwellspring","emergencyexit","fairyaura","filter","firemane","flamebody","flareboost","flashfire","flowergift","flowerveil","fluffy","forecast","forewarn","friendguard","frisk","fullmetalbody","furcoat","galewings","galvanize","gluttony","goodasgold","gooey","gorillatactics","grasspelt","grassysurge","grimneigh","guarddog","gulpmissile","guts","hadronengine","harvest","healer","heatproof","heavymetal","honeygather","hospitality","hugepower","hungerswitch","hustle","hydration","hypercutter","icebody","iceface","icescales","illuminate","illusion","immunity","imposter","infiltrator","innardsout","innerfocus","insomnia","intimidate","intrepidsword","ironbarbs","ironfist","justified","keeneye","klutz","leafguard","levitate","libero","lightmetal","lightningrod","limber","lingeringaroma","liquidooze","liquidvoice","longreach","magicbounce","magicguard","magician","magmaarmor","magnetpull","marvelscale","megalauncher","megasol","merciless","mimicry","mindseye","minus","mirrorarmor","mistysurge","moldbreaker","moody","motordrive","moxie","multiscale","multitype","mummy","myceliummight","naturalcure","neuroforce","neutralizinggas","noguard","normalize","oblivious","opportunist","orichalcumpulse","overcoat","overgrow","owntempo","parentalbond","pastelveil","perishbody","pickpocket","pickup","piercingdrill","pixilate","plus","poisonheal","poisonpoint","poisonpuppeteer","poisontouch","powerconstruct","powerofalchemy","powerspot","prankster","pressure","primordialsea","prismarmor","propellertail","protean","protosynthesis","psychicsurge","punkrock","purepower","purifyingsalt","quarkdrive","queenlymajesty","quickdraw","quickfeet","raindish","rattled","receiver","reckless","refrigerate","regenerator","ripen","rivalry","rkssystem","rockhead","rockypayload","roughskin","runaway","sandforce","sandrush","sandspit","sandstream","sandveil","sapsipper","schooling","scrappy","screencleaner","seedsower","serenegrace","shadowshield","shadowtag","sharpness","shedskin","sheerforce","shellarmor","shielddust","shieldsdown","simple","skilllink","slowstart","slushrush","sniper","snowcloak","snowwarning","solarpower","solidrock","soulheart","soundproof","speedboost","spicyspray","stakeout","stall","stalwart","stamina","stancechange","static","steadfast","steamengine","steelworker","steelyspirit","stench","stickyhold","stormdrain","strongjaw","sturdy","suctioncups","superluck","supersweetsyrup","supremeoverlord","surgesurfer","swarm","sweetveil","swiftswim","swordofruin","symbiosis","synchronize","tabletsofruin","tangledfeet","tanglinghair","technician","telepathy","teraformzero","terashell","terashift","teravolt","thermalexchange","thickfat","tintedlens","torrent","toughclaws","toxicboost","toxicchain","toxicdebris","trace","transistor","triage","truant","turboblaze","unaware","unburden","unnerve","unseenfist","vesselofruin","victorystar","vitalspirit","voltabsorb","wanderingspirit","waterabsorb","waterbubble","watercompaction","waterveil","weakarmor","wellbakedbody","whitesmoke","wimpout","windpower","windrider","wonderguard","wonderskin","zenmode","zerotohero"];
const POKEMON_ABILITY_ROWS = [[170,29],[170,29],[170,29],[283],[170,29],[25,241],[25,241],[25,241],[286],[59],[25,241],[285,202],[285,202],[285,202],[145],[285,202],[232,214],[229],[36,284],[36,284],[232,214],[229],[267,238],[1],[127,274,24],[127,274,24],[127,274,24],[164],[214,98,108],[89,108,283],[214,98,108],[89,108,283],[283],[127,238],[127,238],[122,229,297],[122,229,297],[252,133],[133],[133],[133],[133],[133],[133],[252,133],[252,133],[252,133],[252,133],[252,133],[252,133],[252,133],[252,133],[252,133],[252,133],[252,133],[266],[65],[164],[219,216],[239,237],[219,216],[239,237],[181,209,108],[181,209,108],[181,209,230],[181,209,108],[181,209,108],[181,209,230],[44,140,83],[44,140,295],[139],[77,59],[239,240],[77,59],[239,240],[44,35,83],[44,35,84],[120,118],[120,118],[29,214],[29,257],[29,64],[64,60,45],[64,60,45],[36,284,214],[232,284,315],[219,9,215],[219,275,215],[219,9,215],[219,275,215],[176,276,297],[176,276,203],[176,286,297],[176,276,297],[134,276,297],[86,276,203],[45,31,269],[45,31,269],[301,6,51],[301,6,51],[122,77,126],[122,77,211],[122,77,126],[122,77,211],[304,45,269],[304,45,269],[304,45,269],[272,120,140],[272,120,140],[272,120,140],[290],[98,164,253],[98,164,253],[98,164,253],[98,164,253],[29,89],[29,89],[29,89],[119],[30,136,202],[30,136,202],[211,261,219],[143,261,88],[211,261,219],[143,261,88],[211,261,219],[143,261,88],[214,77,75],[214,173,8],[214,77,75],[214,173,8],[166,171,207],[89,171,207],[166,171,207],[231],[200,171,207],[143,261,5],[143,261,5],[127,120,51],[253,222],[214,61,274],[214,61,274],[283,109,111],[283,109,111],[257,258,183],[183,89,185],[257,258,183],[183,89,185],[231,235,169],[231,235,169],[130],[130],[43],[227],[43],[211,261,308],[121,82,120],[121,82,120],[110,231,230],[110,231,230],[110,231,230],[244,252,3],[244,252,3],[244,252,3],[244,252,3],[29,100],[29,100],[84,100],[211,133,19],[211,133,19],[43,133,211],[211],[134,205,296],[127,125,120],[171,166,31],[130,163,257],[130,163,257],[130,163,152],[133,211,205],[133,211,205],[161,225,101],[29,129,207],[61,222,120],[172],[269,238,45],[181,238,45],[269,307,133],[269,307,133],[114,161,5],[114,161,5],[106],[244,73,276],[301,223,111],[267,276,253],[166,82,60],[252,301],[75,301],[110,153,156],[2],[122,6,230],[122,6,41],[122,6,41],[122,6,41],[269,203],[122,156],[153],[304,231,109],[304,231,109],[134,117],[214,1,8],[214,1,8],[214,1,8],[304,109],[302,201],[77,98],[290,55,5],[269,231,308],[269,231,308],[269,19,308],[269,19,308],[211,188,297],[286],[116,283,89],[116,283,89],[188,239],[35],[188,252],[51],[188,75],[23],[229,144],[229,144],[120,157],[157],[188,297],[253],[121],[272],[170,129],[170,129],[170,129],[146],[25,77],[25,77],[25,77],[25,84],[285,230],[285,230],[285,230],[56],[214,127,84],[214,127,84],[121,127,284],[121,127,284],[267,61,203],[267,61,125],[267,121,238],[267,121,238],[120,118],[302,114,304],[302,114,304],[252,133],[252],[44,140,83],[44,35,83],[108,225,263],[108,225,263],[272,61,139],[272,61,139],[252,179],[252,179],[252,179],[153],[29,101],[283,106,220],[283,106,220],[261,211,203],[304,45,58],[29,129,118],[29,129,118],[29,129,118],[214,176,235],[29,241,61],[29,241,61],[245,36,84],[45,304,295],[181,304,295],[45,304,295],[272,139],[272,120],[121,263,187],[166,171,207],[42,171,207],[130],[130],[227,277],[120,61,220],[261,169],[261,169],[225,214,203],[110,219,116],[211,261,230],[215],[122,214,203],[122,201,203],[181,269,122],[181,269,122],[267,276,132],[276],[261,89,37],[267,98,156],[235],[120,127,175],[120,127,175],[176,201,104],[98,201,297],[142,75,308],[142,75,308],[166,239,283],[166,239,283],[108,161,207],[308,43],[108,238,154],[262,238,154],[301,108,121],[269,304,307],[127,261,308],[249],[61,77,297],[61,77,297],[241],[269,238,45],[176,219],[261,219],[290,55,5],[122,84,220],[171,276,154],[98,253,301],[122,276,253],[166,82,109],[252,301],[75,301],[283,222,220],[161,225,101],[188,120],[188,120],[188,120],[98,219],[229],[218,297],[218],[188,157],[188,207],[161],[170,296],[170,296],[170,296],[133],[25,245],[25,245],[25,245],[245],[285,45],[285,45],[285,45],[269],[214,201,203],[122,201,156],[176,89,201],[176,89,201],[176,89,201],[176,89,201],[232,214],[229],[267,209],[229],[232,36],[269,202,171],[269,202,171],[269,202,171],[29,61,175],[29,61,175],[29,313,175],[98,222],[98,222],[127,109,202],[127,58,202],[272,290,277],[272,290,277],[272,290,277],[178],[269,202],[122,297],[64,180,201],[64,180,276],[293],[301],[293],[36,214],[245,118],[314],[244,203],[244,222],[244,222],[283,98,230],[283,98,230],[283,106,220],[261,143,215],[44,165,315],[44,165,315],[127,248,187],[139],[110,122,230],[106],[261,211,103],[261,211,103],[261,211,103],[73],[196,277],[196,277],[196],[252,133,150],[252,133,150],[122],[179,133],[150,302],[114,267,187],[166,284,187],[161,181,129],[136,258,89],[136,258,89],[213,245],[213,245],[260],[307,166,188],[307,166,188],[166,234,171],[142,242,6],[230],[310,59,231],[283,171,89],[283,171,89],[171,274,37],[110,9,230],[130],[130],[219,304],[219,304],[161,31],[161,31],[178],[116,287],[229,118],[130],[130],[166,8,109],[166,8,109],[110,231,1],[110,231,1],[130],[130],[262,259],[262,259],[19,269],[19,269],[269,166,1],[144,35,44],[81],[81],[81],[81],[32,192],[121,84,43],[121,84,43],[187],[130,84],[188,84],[29,241,100],[130],[130],[188,263,126],[139],[228],[227,277],[120,111,154],[120,111,154],[206],[283,111,166],[283,111,166],[283,111,166],[231,203],[269,307],[269,109],[269,211,261],[269,109],[211,230],[211,169],[122,156],[2],[30,132],[30,132],[30,132],[286],[30,261],[30,111],[30,132],[130],[130],[130],[130],[58],[189],[59],[53],[4],[52],[225],[188],[188],[188],[188],[170,231],[170,231],[170,231],[25,125],[25,125],[25,125],[285,35],[285,35],[285,35],[127,205],[122,205],[122,205],[37],[234,295,154],[234,295,154],[229,214],[267,276],[209,122,98],[209,122,98],[209,122,98],[161,181,129],[161,181,276],[153,230],[153,230],[261,244],[261,244],[229,169],[8,169],[8,169],[8,169],[267,284],[104,108],[188,297],[214,176,302],[269,307],[269,307],[29],[78],[78],[258,259,215],[258,259,215],[276,176,235],[3,296,76],[3,296,76],[214,128,134],[44,128,134],[222],[130],[121,263,156],[134,171,127],[283,171,51],[130],[257,3,127],[257,3,127],[130,102,103],[130,102,103],[261,211,203],[244,73,276],[161,225,83],[127,274,24],[188,118],[219,213],[219,213],[219,213],[215],[130],[176,283,89],[253,120,187],[253,120,126],[1],[15],[218,215],[218,215],[19,238,127],[19,238,127],[8,60,183],[8,60,183],[130],[269,259,307],[269,259,307],[269,304,307],[240,244],[240,244],[240],[188,175],[143,261,5],[171,166,31],[133,242,205],[29,129,207],[155,301],[75,301],[108,225,263],[245,284,84],[129,29],[239,111],[110,219,180],[166,239,283],[1,55,5],[253,228,126],[120],[261,143,215],[188,84],[239,43],[240],[130],[130],[130],[130],[130],[130],[130],[130],[130],[188,277],[188,277],[188,277],[188,277],[77,75],[77,75],[236],[188,277],[130],[130],[109],[109],[16],[16],[161],[225],[158],[158],[158],[158],[158],[158],[158],[158],[158],[158],[158],[158],[158],[158],[158],[158],[158],[158],[300],[170,37],[170,37],[170,37],[25,283],[25,283],[25,205],[153],[285,231],[285,231],[285,231],[285,228],[214,127,5],[114,127,5],[301,176,214],[122,216,222],[122,216,222],[134,296,187],[134,296,187],[89,170],[89,170],[89,25],[89,25],[89,285],[89,285],[82,272,277],[82,272,277],[24,263,209],[24,263,209],[24,263,209],[133,155,220],[133,155,220],[261,308,215],[261,308,215],[261,218,215],[295,128,234],[295,128,234],[216,215,153],[216,215,153],[177],[101,207,128],[101],[98,230,125],[98,230,125],[98,230,125],[269,109,304],[269,109,304],[269,183,304],[98,120,153],[261,120,153],[267,29,169],[129,29,169],[267,29,169],[181,267,245],[181,267,245],[181,267,245],[231],[187,118,29],[187,118,29],[29,171,129],[29,171,129],[29,108,129],[205,1,153],[211,1,153],[203,1,153],[122,156,6],[122,156,6],[122,156,6],[108,120],[108,120],[230,316],[316],[92,316],[316],[304,29,259],[261,231,308],[261,231,308],[229,156,122],[229,156,122],[122],[315,140,284],[159],[303],[159],[242,261,269],[242,261,269],[50],[50],[257,258,3],[257,308,3],[257,308,3],[115],[115],[115],[115],[44,276,235],[44,276,235],[84,35,227],[84,35,227],[84,35,227],[169,140,207],[169,140,207],[169,140,207],[127,24,109],[127,24,109],[111,239,308],[111,239,308],[111,240,308],[29,220,225],[29,220,225],[252,155],[267,229,164],[267,231,169],[64,207],[64,207],[304,43,45],[304,43,45],[101,109,207],[36,297,267],[36,297,267],[124],[124,8],[179,150,30],[179,150,30],[179,150,30],[130],[130],[130],[63],[277,272,5],[277,272,5],[77,75,118],[77,75,118],[77,75,118],[118],[209,153,297],[209,153,297],[209,153,297],[239,237,203],[239,237,269],[130],[109,231,169],[109,258,296],[252,134,219],[148],[120,207,205],[120,207,205],[213,230,153],[125,128,164],[125,128,164],[298],[51,120,188],[51,120,188],[205,220,244],[127,230,108],[127,230,51],[127,230,284],[24,169,308],[24,169,308],[89,77,310],[267,108,293],[108],[108],[130],[75,267],[75,267],[126],[126],[126],[187,51],[207],[187,51],[302],[294],[281],[215,230],[122],[188],[281],[294],[126],[126],[225],[225],[55],[55],[55],[55],[55],[170,26],[170,26],[170,26],[26],[25,141],[25,141],[25,141],[130],[285,192],[285,192],[285,192,20],[20],[20],[192],[176,27,106],[176,27,106],[24,87],[75,87],[75,87],[232,36,83],[229,83],[232,36,83],[232,36,83],[232,36,83],[209,297,156],[209,297,156],[74],[79,271],[79,271],[79,271],[72],[79,271],[220,93],[220,93],[125,153,222],[125,153,222],[86],[127,118,171],[127,118,187],[127,118,35],[290],[290],[164],[164],[251],[251],[101,11],[101,11],[268,296],[268,296],[37,262,118],[37,262,118],[37],[286,238,175],[286,238,175],[286],[181,183,1],[181,183,1],[207],[145],[145],[60,219,241],[60,219,241],[260,261],[260,211],[206,240],[206,240],[44,178],[134,296,153],[164],[27,176,179],[30,261],[220,109,91],[220,109,91],[220,231,91],[220,109,91],[220,231,91],[187,141],[161,84,100],[161,84,100],[176,84,121],[176,84,121],[176,84,121],[176,84,121],[176,84,121],[176,84,121],[176,84,121],[176,84,121],[171,111,261],[171,111,261],[260,111,261],[84,118,277],[84,118,277],[72],[72],[47],[14,184],[14,184],[184],[14],[30],[139],[141],[141],[304],[170,138],[170,138],[170,138],[170,222],[25,122],[25,122],[25,122],[285,137],[285,137],[285,137],[127,235,176],[127,235,176],[127,235,230],[247,260,1],[247,260,1],[1],[267],[18],[130],[130],[110,125,6],[110,125,6],[125],[46],[46],[46],[46],[104,232,268],[104,232,268],[268],[127,301,253,171],[171],[127,216,253],[127,301,164],[286],[221],[221],[147,134,207],[147,134,207],[171,250,120],[171,250,120],[305,304],[305,304],[305],[129,37],[129,37],[129],[114,64,202],[114,64,202],[38,166],[38,166],[38],[80,128,44],[80,128,297],[129,166,268],[129,166,268],[129,199,268],[79,292,161],[120,277,271],[204,51],[311],[71],[286],[306,219],[306,219],[119,295],[19],[210],[210],[210],[210],[210],[210],[210],[210],[210],[210],[210],[210],[210],[210],[210],[210],[210],[210],[233],[233],[33],[231],[124,133,261],[261],[54],[54],[54],[54],[49,260,315],[23,220,31],[23],[255],[26,244,169],[26,244,169],[26,244,169],[169],[65,277],[194,277],[94,277],[152,277],[295],[261],[85],[226],[22],[22],[22],[22],[22],[22],[22],[190],[190],[190],[162],[243],[243],[243],[243],[276],[22],[22],[22],[22],[302],[302],[143],[125],[125],[170,94],[170,94],[170,94],[170,94],[25,131],[25,131],[25,131],[25,131],[285,238],[285,238],[285,238],[285,238],[27,89],[27,89],[127,297,24],[127,297,24],[188,297,151],[188,297,151],[267,36,277],[267,36,277],[267,84,277],[267,84,277],[214,296,247],[214,296,247],[40,207,64],[40,207,64],[80,214,26],[80,253,26],[260,231,269],[260,231,269],[260,231,269],[17,203],[260,35],[254,102,77],[254,75,77],[254,75,77],[254,75,77],[208,89,26],[208,89,108],[208,89,108],[208,89,283],[208,89,283],[217,229,219],[217,229,219],[217,229,219],[97],[97],[97],[269,191],[269,191],[203,252,128],[195,179,276],[195,150,276],[195,179,276],[195,150,276],[77,310,75],[77,310,75],[77,310,75],[134,276],[134,276],[308,43],[308,43],[308,43],[308,43],[101,8,139],[101,8,139],[101,8,139],[101,8,139],[187,84,175],[187,84,175],[187,84,175],[187,84,175],[205,98,51],[19,286,256],[308,174],[253,222],[274,223,111],[303],[268,11],[268,11],[268,11],[19,51],[51],[133,65],[232,113],[232,113],[186],[112],[112],[120,272,194],[171,272,194],[107],[107],[230,103],[230,103],[230,103],[302,108,216],[302,252,237],[304,260,216],[304,111,237],[132,103,249],[132,103,249],[30,118,43],[30,118,43],[30,118,43],[123],[123],[48],[48],[188],[188],[120],[298],[298],[298],[298],[129],[129],[291],[57],[28],[95],[297],[12],[13],[122,84,220],[267,230,228],[98,26,297],[149],[269,1,153],[269,1,153],[188,296,183],[181,269,122],[44,37],[169],[170,192],[170,192],[170,192],[25,295],[25,295],[25,295],[285,156],[285,156],[285,156],[11,89,283],[135,89,283],[11,89,283],[121,247],[121,247],[267,284],[267,284],[252,161,125],[302,161,125],[302,161,125],[214,176,171],[83,27,276],[83,27,276],[171,128],[309,11],[61,100],[61,100],[224,100],[122,108,98],[122,108,98],[122,108,230],[122,108,230],[197,261,30],[197,261,30],[197,261,30],[77,75],[77,308],[77,308],[171,252,45],[66,252,45],[312,302,35],[312,302,35],[122,214,247],[122,96,247],[296,175,187],[296,183,187],[313,118],[313,118],[160],[160],[7,231,207],[29,121,128],[29,121,154],[246],[36,229],[272,277],[8,84,245],[167,84,245],[153,171,175],[153,171,175],[153,171,175],[91,203,219],[91,203,219],[24,127,212],[307],[317],[317],[169,236],[169,73],[229,207],[62,219],[289,38],[289,38],[1],[176,80],[216,80],[222,274,39],[283,239,230],[283,237,230],[153,228],[295,166,307],[34,259],[34,259],[34,259],[34,259],[34,259],[34,259],[301,120,51],[181,304,295],[41,10,220],[225,214,203],[225,214,203],[51,265,188],[193],[193],[193],[193],[193],[193],[198],[198],[198],[198],[198],[198],[282,111],[282,111],[282,111],[282],[203],[214],[90],[273],[270],[299],[21],[193],[198],[168],[99],[193],[198],[264,89,258],[105,102],[105,102],[105,102],[105,102],[288,96],[288,84],[288,276],[51],[304],[153],[261],[69],[70],[68],[67],[250,261,249],[264,207,258],[193],[193],[198],[198],[280],[279],[278],[182]];
const POKEMON_ZA_SPRITE_IDS = {"raichumegax":10304,"raichumegay":10305,"clefablemega":10278,"victreebelmega":10279,"starmiemega":10280,"dragonitemega":10281,"meganiummega":10282,"feraligatrmega":10283,"skarmorymega":10284,"chimechomega":10306,"absolmegaz":10307,"staraptormega":10308,"garchompmegaz":10309,"lucariomegaz":10310,"froslassmega":10285,"heatranmega":10311,"darkraimega":10312,"emboarmega":10286,"excadrillmega":10287,"scolipedemega":10288,"scraftymega":10289,"eelektrossmega":10290,"chandeluremega":10291,"golurkmega":10313,"chesnaughtmega":10292,"delphoxmega":10293,"greninjamega":10294,"pyroarmega":10295,"floettemega":10296,"malamarmega":10297,"barbaraclemega":10298,"dragalgemega":10299,"hawluchamega":10300,"zygardemega":10301,"crabominablemega":10315,"golisopodmega":10316,"drampamega":10302,"magearnamega":10317,"zeraoramega":10319,"falinksmega":10303,"scovillainmega":10320,"glimmoramega":10321,"baxcaliburmega":10325};
const POKEMON_ABILITY_KO = {"noability":"특성 없음","adaptability":"적응력","aerilate":"스카이스킨","aftermath":"유폭","airlock":"에어록","analytic":"애널라이즈","angerpoint":"분노의경혈","angershell":"분노의껍질","anticipation":"위험예지","arenatrap":"개미지옥","armortail":"테일아머","aromaveil":"아로마베일","asone":"혼연일체","asoneglastrier":"혼연일체 (블리자포스)","asonespectrier":"혼연일체 (레이스포스)","aurabreak":"오라브레이크","auraguard":"파동의방호","baddreams":"나이트메어",["ball"+"fe"+"tch"]:"볼줍기","battery":"배터리","battlearmor":"전투무장","battlebond":"유대변화","beadsofruin":"재앙의구슬","beastboost":"비스트부스트","berserk":"발끈","bigpecks":"부풀린가슴","blaze":"맹화","bulletproof":"방탄","cheekpouch":"볼주머니","chillingneigh":"백의울음","chlorophyll":"엽록소","clearbody":"클리어바디","cloudnine":"날씨부정","colorchange":"변색","comatose":"절대안깸","commander":"사령탑","competitive":"승기","compoundeyes":"복안","contrary":"심술꾸러기","corrosion":"부식","costar":"협연","cottondown":"솜털","cudchew":"되새김질","curiousmedicine":"기묘한약","cursedbody":"저주받은바디","cutecharm":"헤롱헤롱바디","damp":"습기","dancer":"무희","darkaura":"다크오라","dauntlessshield":"불굴의방패","dazzling":"비비드바디","defeatist":"무기력","defiant":"오기","deltastream":"델타스트림","desolateland":"끝의대지","disguise":"탈","download":"다운로드","dragonize":"드래곤스킨","dragonsmaw":"용의턱","drizzle":"잔비","drought":"가뭄","dryskin":"건조피부","earlybird":"일찍기상","eartheater":"흙먹기","eelevate":"천정부지","effectspore":"포자","electricsurge":"일렉트릭메이커","electromorphosis":"전기로바꾸기","embodyaspectcornerstone":"초상투영 (주춧돌)","embodyaspecthearthflame":"초상투영 (화덕)","embodyaspectteal":"초상투영 (벽록)","embodyaspectwellspring":"초상투영 (우물)","emergencyexit":"위기회피","fairyaura":"페어리오라","filter":"필터","firemane":"불꽃의갈기","flamebody":"불꽃몸","flareboost":"열폭주","flashfire":"타오르는불꽃","flowergift":"플라워기프트","flowerveil":"플라워베일","fluffy":"복슬복슬","forecast":"기분파","forewarn":"예지몽","friendguard":"프렌드가드","frisk":"통찰","fullmetalbody":"메탈프로텍트","furcoat":"퍼코트","galewings":"질풍날개","galvanize":"일렉트릭스킨","gluttony":"먹보","goodasgold":"황금몸","gooey":"미끈미끈","gorillatactics":"무아지경","grasspelt":"풀모피","grassysurge":"그래스메이커","grimneigh":"흑의울음","guarddog":"파수견","gulpmissile":"그대로꿀꺽미사일","guts":"근성","hadronengine":"하드론엔진","harvest":"수확","healer":"치유의마음","heatproof":"내열","heavymetal":"헤비메탈","honeygather":"꿀모으기","hospitality":"대접","hugepower":"천하장사","hungerswitch":"꼬르륵스위치","hustle":"의욕","hydration":"촉촉바디","hypercutter":"괴력집게","icebody":"아이스바디","iceface":"아이스페이스","icescales":"얼음인분","illuminate":"발광","illusion":"일루전","immunity":"면역","imposter":"괴짜","infiltrator":"틈새포착","innardsout":"내용물분출","innerfocus":"정신력","insomnia":"불면","intimidate":"위협","intrepidsword":"불요의검","ironbarbs":"철가시","ironfist":"철주먹","justified":"정의의마음","keeneye":"날카로운눈","klutz":"서투름","leafguard":"리프가드","levitate":"부유","libero":"리베로","lightmetal":"라이트메탈","lightningrod":"피뢰침","limber":"유연","lingeringaroma":"가시지않는향기","liquidooze":"해감액","liquidvoice":"촉촉보이스","longreach":"원격","magicbounce":"매직미러","magicguard":"매직가드","magician":"매지션","magmaarmor":"마그마의무장","magnetpull":"자력","marvelscale":"이상한비늘","megalauncher":"메가런처","megasol":"메가솔라","merciless":"무도한행동","mimicry":"의태","mindseye":"심안","minus":"마이너스","mirrorarmor":"미러아머","mistysurge":"미스트메이커","moldbreaker":"틀깨기","moody":"변덕쟁이","motordrive":"전기엔진","moxie":"자기과신","multiscale":"멀티스케일","multitype":"멀티타입","mummy":"미라","myceliummight":"균사의힘","naturalcure":"자연회복","neuroforce":"브레인포스","neutralizinggas":"화학변화가스","noguard":"노가드","normalize":"노말스킨","oblivious":"둔감","opportunist":"편승","orichalcumpulse":"진홍빛고동","overcoat":"방진","overgrow":"심록","owntempo":"마이페이스","parentalbond":"부자유친","pastelveil":"파스텔베일","perishbody":"멸망의바디","pickpocket":"나쁜손버릇","pickup":"픽업","piercingdrill":"관통드릴","pixilate":"페어리스킨","plus":"플러스","poisonheal":"포이즌힐","poisonpoint":"독가시","poisonpuppeteer":"독조종","poisontouch":"독수","powerconstruct":"스웜체인지","powerofalchemy":"과학의힘","powerspot":"파워스폿","prankster":"짓궂은마음","pressure":"프레셔","primordialsea":"시작의바다","prismarmor":"프리즘아머","propellertail":"스크루지느러미","protean":"변환자재","protosynthesis":"고대활성","psychicsurge":"사이코메이커","punkrock":"펑크록","purepower":"순수한힘","purifyingsalt":"정화의소금","quarkdrive":"쿼크차지","queenlymajesty":"여왕의위엄","quickdraw":"퀵드로","quickfeet":"속보","raindish":"젖은접시","rattled":"주눅","receiver":"리시버","reckless":"이판사판","refrigerate":"프리즈스킨","regenerator":"재생력","ripen":"숙성","rivalry":"투쟁심","rkssystem":"AR시스템","rockhead":"돌머리","rockypayload":"바위나르기","roughskin":"까칠한피부","runaway":"도주","sandforce":"모래의힘","sandrush":"모래헤치기","sandspit":"모래뿜기","sandstream":"모래날림","sandveil":"모래숨기","sapsipper":"초식","schooling":"어군","scrappy":"배짱","screencleaner":"배리어프리","seedsower":"넘치는씨","serenegrace":"하늘의은총","shadowshield":"스펙터가드","shadowtag":"그림자밟기","sharpness":"예리함","shedskin":"탈피","sheerforce":"우격다짐","shellarmor":"조가비갑옷","shielddust":"인분","shieldsdown":"리밋실드","simple":"단순","skilllink":"스킬링크","slowstart":"슬로스타트","slushrush":"눈치우기","sniper":"스나이퍼","snowcloak":"눈숨기","snowwarning":"눈퍼뜨리기","solarpower":"선파워","solidrock":"하드록","soulheart":"소울하트","soundproof":"방음","speedboost":"가속","spicyspray":"하바네로분출","stakeout":"잠복","stall":"시간벌기","stalwart":"굳건한신념","stamina":"지구력","stancechange":"배틀스위치","static":"정전기","steadfast":"불굴의마음","steamengine":"증기기관","steelworker":"강철술사","steelyspirit":"강철정신","stench":"악취","stickyhold":"점착","stormdrain":"마중물","strongjaw":"옹골찬턱","sturdy":"옹골참","suctioncups":"흡반","superluck":"대운","supersweetsyrup":"감미로운꿀","supremeoverlord":"총대장","surgesurfer":"서핑테일","swarm":"벌레의알림","sweetveil":"스위트베일","swiftswim":"쓱쓱","swordofruin":"재앙의검","symbiosis":"공생","synchronize":"싱크로","tabletsofruin":"재앙의목간","tangledfeet":"갈지자걸음","tanglinghair":"컬리헤어","technician":"테크니션","telepathy":"텔레파시","teraformzero":"제로포밍","terashell":"테라셸","terashift":"테라체인지","teravolt":"테라볼티지","thermalexchange":"열교환","thickfat":"두꺼운지방","tintedlens":"색안경","torrent":"급류","toughclaws":"단단한발톱","toxicboost":"독폭주","toxicchain":"독사슬","toxicdebris":"독치장","trace":"트레이스","transistor":"트랜지스터","triage":"힐링시프트","truant":"게으름","turboblaze":"터보블레이즈","unaware":"천진","unburden":"곡예","unnerve":"긴장감","unseenfist":"보이지않는주먹","vesselofruin":"재앙의그릇","victorystar":"승리의별","vitalspirit":"의기양양","voltabsorb":"축전","wanderingspirit":"떠도는영혼","waterabsorb":"저수","waterbubble":"수포","watercompaction":"꾸덕꾸덕굳기","waterveil":"수의베일","weakarmor":"깨어진갑옷","wellbakedbody":"노릇노릇바디","whitesmoke":"하얀연기","wimpout":"도망태세","windpower":"풍력발전","windrider":"바람타기","wonderguard":"불가사의부적","wonderskin":"미라클스킨","zenmode":"달마모드","zerotohero":"마이티체인지","mountaineer":"Mountaineer","rebound":"Rebound","persistent":"Persistent"};
const POKEMON_BATTLE_DATA = decodePokemonData(
  "ewAiAHAAIgA6AFsAWwAiAGIAdQBsAGIAYQBzAGEAdQByACIALAAxACwAIgBCAAkBCwENAQ8BEQFbADQALAA3AF0ALAAcATUALAA0ADkAJAEmATYAIwEpASQBNQAgASIAEQEvASwBIQEwACwANAE0ARMBNgFdACAB" +
  "BgFpAHYAeQAZARABLAAyABQBSQA+AUABGwEdAR8BIQE2ADQBNgBDATYAMwAsADgANAFTASwATAEuATABEQE0ACMBWwA2ATUBEgFgATAAOgEhASIAdgBlAG4AdQBHASwAUQEiAFYAZwFpAQ4BQQEcAR4BOwFVATgA" +
  "QwE4AFEBMQAwADcBfAFSAWIBFAFZATIBXQFfATQBQwE4AWMBBgFmAWgBQAFtAGUAZwBhABEBbAFuAYwBcQEtAE0AjwGRASEBSQF1AX0BNwEyAHoBMgCHATIAVAGAAW0BbwFqATEBWwEzAYUBQgFhAYkBZQGoAXEB" +
  "ZwBtAGEAeACSARQBlAFwAQ8BLQBHALUBtwGbAXQBIQF2AXgBegF+AXsBpQEuAboBqQFaAVwBXgGGAa8BOwEiAGMAaABhAHIAtQFuAGQAZQBBAR0BIgBDANUB1wFhANkB2wEbATEAOwEzACYBNQBDATQAUQFMASwA" +
  "NQBNAS0BgQHzAasBhAHPAV8B5gHSAdQB1gGOAWwAZQBvAG4AEQEjAd4B4AH9Af8BAQIhAeYBIQE1ADgAVgEdAQwCfwFWASMBUwFYAfQBzgGtATgBEgGwAfsBcgBpAHoA1gFkABEBNgAUAd8B1gEeAiAC5QEsADkA" +
  "OwE3AA0COABJAQ0CewEmATgAIwHIARUCqgEXAl4BUQE5AfoB4AEnAnIAZACOAZABwAEjAgQCJgIfAkAClwGZAS0AWAApAjEANAAsAjECMwA3ATEAEwExAFMCUgE1AnwBLgElAh0CSAIhAhYCrAE6AoUBGwI+Al8C" +
  "QgJhAHkAIgIkAmYCIAJKApABLQBZACkCKwIhAS0CEgEwADACEgE1ACYBVQJaAqYBXQI/AmACOAJiAl8BOwI1AWUCRwIgArQBtgFrAkYCXgJuAr4BjAIJAioCUQJSAXkCMgJZAncCfwJtAkACggH1AfcBhgJiAdIB" +
  "cwBxAHUAaQByAHQA/gERATcAFAFTAKUCpwKpAmUAGwEyADsBNAAdATQADQIrAfABDgIkATMANwLNAYQCGQI8AmQBdwDWAXQAbwCoAqoCUgEUAVcAxgLIArECswI7AXsCVgFRAVUBKwFVAQwCvwKDAV4BGQKIAdIB" +
  "YgBsAAwBxwJpAHMAsgIqAhQBQgDhAnMA4wLlAtECdQIzAsYBVAFaAiMBLQLaAp8CrQE0ATsCsAHgAuICbwDkAmUAaAIRASYBFQHqAuwCZQBvApoBWwC0Au8CdwKhATcBMwA1AjEA9AI4AC4B6QL9Av8CngI5Aq0B" +
  "+gLfAgUD/gLlAosCwAEDAxYD6wIfAwcDkQLAAQoDLALwApoCmQJ7ARMDFQMeAxgDYQL2ARsDhwL6AWEAdADbAXAAaQDmAnsBJAI5AzsDPQPlAQoCIgFrAfkCIwGkAUIBNAFbAdoCMgA1AFwBwgL4ArABjgF0AGEA" +
  "cABvAGACVQIUAZgBVgNYA2ACWwBVAtIChgE0AVADQgFJAyMBUwLaAjEASgM1A0MBzwH7AnUAdAA6A3IAZgByAGUAPgNDARUBcgN0A3YDeANEA5QCSwFMAyMBuwI5AKUBHgGmARkDhALQAd4CZAEIAXMD2wF+A48B" +
  "vwERAWwD6AJ8A5EDdwMnA5QDCQITAXQCWwDuAasBhQOHAzcApgEWAZADdQOaA4oDNQOMAzcDxAJ4A2QAygJXAswCsAPKAmEDEwFKARwBSANHA0sDvQPwAU4DZgOsAxgCsAFrAGEAawB1AG4AmgFPAhQBSwDGA8gD" +
  "CQNbA7kDqwFPA+8BhgFoA2sB8gExATEBbAM0AW4DUwPfArADHQJsAGwAlQMDAkIA4QNpAOMDgAO5AysBhgMkAYMDEQI3ANkDqwPQAdwCrgMGAWIA6APjAwEDegLoAvoDbAAIA+sDOwErARIDTAM3ARMCNwFNA/4D" +
  "ZQBkAOID5AM0A/UD+AH3AwEBaQBkAGcAZQBqAhIBRQJQABUEFwQZBIQBnwM0APADIgTYAyUENQA2AMADGgP3AfkBZAE8AxYE/wFzA28AlQOsAiIAHAQvBG8AMQQbATQBnwNQAVYBZQOEA2UDNAE3AAoC2gOVA20D" +
  "9wFeAbQC0gEuBBcEOASVAw0CNQQdBDAEOgSBA1sAeQHxA/QCQgR9AUQE9AP4AoUCsAFMBDAE/AMxAFAENgRNBHQAAQSsAZ8DVwR2AQ8DCAQSATIARARmBFMEEAReBPkCsAFyADkDVgNWA5UDAwNSAHoEOQMJA4AB" +
  "WwBYAicEJQTUAxADHgELA0UEZwMqBMMD0gF5BHMDgQRhAGwAbwDhAn0EFAF/BJIEVgMtAEEAlQSXBAkCIwGDBIUEIwKJBIgE9AKLBJoEewSaATEBTwOOBNwCeAQ5A2kAYwBBAxEBSgMiAJoEswS1BDMB0gITAhMB" +
  "7gG7AqUDKgJKAYwEbAOsAsIDSQSxBHQAugQ6A5QElgSaAbcEuQS0BDoDnQSfBNADogQsAvQCuAMGBPEDxATSBLsE2wMyAMcESARfAUoEZAGRBMwEZQDOBOECxwI6A20AtgQ0AbgEsgTTBAcDngTPBC0AVAA4BAAD" +
  "5QHYBHUC2gSIA+8D3QQuAd8EOgOCAcYEiwOtAeYEBgFzAHAA6gRyAG8AdwC2BBMBIgBTAA0F1gEQBVQEIQRNAfkC+QITATMA2wQpBAgFsATSAWYADgUYBUIBegNGACYFEQVqBAMEIwHuAysBNgC/BFYCWwLzATEB" +
  "7gPIBOUEsAFlAMUDbgBzALYEbAFFAD0FPwV1AucBKgFMA7cCZQMPAvMD8wGuBKwBUgPDAgYB1gFiAG8AawC2BN0BQQByAFQFVgVFBYIDKgIqASgB9AIzAokD8wE4BREEcANLBGkAxQPUAXUAtgQDAhwEawVoAG0F" +
  "IQG+AnQFhAMjASQEuwKjA2sDZgV2BEIBYARqBWEAbAVjAG8ADAXhAhkE1ANRBHEFdQAtAEMAhQVwAIcFGwF1BYQEdwUBBXoFOwSmAXAFggVyBQYFfQXkBAoFFASLBQ8FYwBrAOsC1gFuBRQBmgVsBS0AUgBvAKQF" +
  "LQBTAFYDcgGTBYkEZgN5BUEEKgKZBYEFbAWdBd0D5ASGAYAFiwX5A+MD5gKJBaoFcgUtAOcDxAWSBUYF7wF4BbgFewWpBbsFnAXzATEAngVeBKAFPAOLBVgDcACmBUEBxgXTBYwFUABvAHAAsAWyBcwFdgXOBZYF" +
  "uAWGAy4BxwVzBdsD1wX3AdkF4QVwAGgAYALgBYsFLQBQAGgARADoBZQF6gW3BdUDuQXuBeEFvQUiBToFaQWLBWwAaQBiAHcDqAWKBZsFjAVMAA0GDwZ0Bc0FtgXQBZgFBQaLBQcGOQXABQoGEgbIAmkAZwBpAMkD" +
  "DwT5BRIGLQBPAB0CJQYnBv8FtQXPBQMG0QURBrwF1QXyBQkFwQUSBmgAbwBnAQgCKQarBUgAPQZuAAgChAQYBjIGlwUEBtIFHQY3Br4FfgX0BYsFcwAmBm4AbwBoABAG7wWwBVMGVQYwBpUFAgY0Bu8FHga/BX8F" +
  "IQZsBcgDbwB2ANAEbwXhBS0AVQBUBmgGXAYBBhoGSgY1BtQF8QVOBp8FOgZsBcUDlQREBUAGyAXNA3wGcAYZBjMGGwZLBhIGYQZPBnkGcgXrBGkGhgarBfYEoARGBukFgwZJBu0FjgZ1Bn0EdwbYBYoGdQBwAMYC" +
  "bgDkAWcDlwbiBZ8GoQaSBgAGlAbsBboFTAZ2BggGIAYtBOEF3gV0A1cGawaxBcYCpgaTBasB2AJCBEcFcASrBocGTQauBmMGsAaLBSEDtAb6BSgDggZIBqoGHAbABq0GHwbDBgYB2gUSBncAyAJsAPgFagb6BVcA" +
  "1gZgA7QFXQZyBpYGdAbwBZkGwgagBXkEswTUBTIARQJ/BOgGcwWnBu4B7gNmA+4DVQFVAmQFMQHyA8IGvgKQBGEA7QaMBrYE6wb8Bo8G1gSSBXcCAwTyAgMGOQATAhEDpgHsBjYG9wavBF8E+wbtBmgCwAHqBpkE" +
  "AQfIBZgBcAJNAhcGXgVXAi8FLwU7BAsHAwUYB+MGHgEQB3cEEgdsBWgCiAUAB+0GCANxAv8F7gHIAeoFMQDuAfQGagMXB+0GggH4BtAG+gZkAQ0B2QFzAGgAdwMsBeIErQLiAWQAQwdFBxsBFAMLArwGmQJKA1gC" +
  "IgQhBTUDUAWwAUEHSgdEB2UAxQIDB0IBNARTAEkHSwdcB9UEzwQbATUCKARPBycHuQV3AiUEVAdIB0IHWwcsBa0EwQP2A2gFQAdiB+oCVgZCAVAEYQdCB3oHTQfZBC0D9QYyAWYDKQHaAtcFbwNkAqMCeQcMAdUB" +
  "XgcyAH0HjQdDB2UHkQZoB4IHNAfcA6IGMQXZA34HSgeAB2UFmgaKB1EFIgBuABUEyALiAWYAtgQDA04Apwd5BG4ALQBGABsBuQO2BawC6gEBBSQENABcBE0FiQRhA34FogJkAaYHZAAjBskDkgHxBK0HwwcdAsUH" +
  "XQVbAMIETgFWAbYHlQUnBGsDbQOjB98DwQenB6UCeAMIAh8FFAHIB28A2gdnAbMHUgE7Ae4DOQB4AawC+AY0Ah4BaQeMBPUBoQLXBwYBwgeoB24A7wRrAXoD3wevB5cBswe1AiMCNQCsArkH3AS/AzYFQAUXAlAF" +
  "EwTzB8oHMgRrAWwB+QcmBgsIzQcDBLgDQwH/B+oFhgdMBeEETgbWB6QH8wdrACYGZwCSAd0B3wceCG4AIAh1AuQHwwE0BUMBNwCsAusH6gcYCMAChAHwB6QHYwD+AWYA/AZyABkEiQTeATYIOAgfBDEAuQPCBKsB" +
  "uAI+BBIC2ANrA7sCCgO/BxsCPQjgAuYCMwBFAkMATQi2A0AI5QdZBB4BUQEJB2wHVwEECKIGhARLCPoBUwgAA5kBkgFRCGIIaQRhA6wCnwNaCFUBOQB6AYkEhAelA1wCYgiCAdQDXwi/BbABdgAJATwDwAEzADQE" +
  "VgB7CGkAKQNFAzMADQK6B+sFRgiHB10I1gWaBisEeQiBCHgA/gZrAX8IkAiVBwkD8gGEBIYIEwECBpwHygGQCIgG5AQsBPIHJgZlAFYD/gFEBYUI3gekCKYIZQBEBWEDLAJRATcAIwLqBzQFngHaAj0HoQgaAtIB" +
  "pgegBqwIDQFeB6kIIgCtB70IlAStCJYIZwcSAUEI7QHpB74EgwcwAHQCwgirCMUIRAUPBwgGVgKwAWoAJAZnAGwAeQBwAHUAZgCqB2sBAwNKANoI3AjeCOAIVARVCJ0DeAVJA/AD1AOkAWsDwgRKCHgI0gF3AOUI" +
  "eQB0AN8I4QgkBCIAVwD3CPkI6AhPBbkDTwJaBDIB6we7AgoEjARJCDMIiwdkAXoAdQALAXQAWgETBVoAEAk5A+MHGgUyAYkEUwc/BFUHYgaiCCIAZwCWBBEJWgF6A0cAIwkXCScInwPqBwUJKwH4BuEGggE4BskE" +
  "0gFZA2QA5AJ7B+wBFAFPAGQANglDB0gBwgFGA3oF9AIqAWkD9gZuBY4EwgKwAdsIbwBvAPYHtgIUAUcAlQRNCT8J7APxAQAFLgjPBdQHjQiuAaQHdgDpA2UAkAV1AI4BwAJtAV8JYQljCcEBQQhvBOsHhAfxBkYJ" +
  "2wI2A6QHngZ5BEQFNAAbBNYBDAGAA1AC6QXCBLYFlQVPA3wFTgYHCMAH0gZ4CeUCYwASCSQBNARQAIYJZQCICXoJBgdfBRECNwccBbcIFwKHAfEHsQFUBskDiQlECKcBmwkpCbcDQAnABEAElgXsCIEJ1ggTBIsB" +
  "TQk4BDgJAwOUAawJdAB7B6IJQQhWCfAGUAcwCfMBuAgYAvgBsAE2CdsIpQiJCbsCIgBEACQG/gFzA4EHCQI/BKIGiQSrAQkHHgl+BSAJvwnHCaYIZgcDBsQJxgnBCccIwwEaBDsBPwNmA1gCzQkhBy4BxQnACcgJ" +
  "TQV1B9EJvgl1AGcAdAAdAgsINQATBUQA7AnuCWkAEAhOBwAGNAdJBsIE3APaAkkIYgagBWQA9AnvCZII8QkUAfMJ7QnvCdsJVgTdCekFNAfABAUJ9QbkCQMK9gmCAf8JiQbSAY4BEAWyCQICegOYARsKswmDBLkH" +
  "aQMyBiQEuQl0BygHughkARoKdwCyCQUKHgr/AS0KaAALChIDtQK7A7UF3AThBh8KMgp1COkJoQhUAzEKsgmQAeECQQG3ByIAOwqyCb0BlASnBQkCaQdbALsCugIlCgYELgFICnsHKArCBiAJLApCCpwDRgpVCr0B" +
  "nANdATYKGglSCnMGVQo9CikKIAkNBXIAUgbiAQICbAFQANsBbApFBoMELgkbBYkIEQMwCGwH0AbZBXEKaQDiAQUKbwp9CuIBNAqYCDEFdgr4BgQENQqpBYIKCAI3BVsJMwktBHMAeQACCqQFAgLdAVAAkgqUClwF" +
  "KgNqB7cHRAi6Ah0Jiwg4BkkJ0gEiCdcGdQCVCuoFIgAnCacKqQqcClYEVAErCA0CbAjyApYJCAWjB1QD4gFrABgEAgJFAk0Augq8CksBYgpVARsJ7AiIA6gJhAGDCWAEHQKOAVcD5gIVCDUEzArqBA0FGwFOCgQE" +
  "MAC9Bu4BwgTPCV0IuwkbCBMEZwAPBXcADAayCc8KUARHAOIK5ApoAOYCrwgLAlcIqwF9CRsFyAo3AXYESgnpCmkA5QpoAOQCpgICAucK9wrlCi0ASAD7CmkATgILA6ADUAerAaAKzgUuAegKEAXqCuYCzwb0CkgE" +
  "sAHWAbQEvAjPCgMDWQUWC6QI5QHlB1QChwM0B20IeQreCvUK0gEVC+IBpAj6CnMA/ArvARkLcgAbC6AGAQsDCwULVggSARIDEQK0CnMGGgsoC6AGPAeXCSULLQSWBGkAxQImCO4BNQRCC0QL7gK6AwMGAQgBBScK" +
  "RwlYCmAESAv6CnIADwQyBakFUwunAg8ErwqcB0YIlQZvCZoHewpSCwwGdwCRBHsHzwdHC2QLZguzAlYBHguSCVoI2wpaBPYCGgMzCBQLDgaaAT0EIgBBAHcL5QGDBO8IBwR3ApUFTwtLA1sJpApkAcUDZABhAHwL" +
  "vAIiAM0DiQuLC2EDIgo3Cp8BEQrYCmsDfgHCA7gKJgvhAsUDHwL2BysBegucC2EAngt9C70ETAs1AokEWgj9CV0IFwpjAqQHSwqdC2EAbQD8A6ALngTGA6MLsgtoCHsBpgtQCjUC+AYvA3oCpgG2C7EL9gcxAa0L" +
  "hQINCQYBtQHUAeQFIgK+CpsFzQvCCnUChwO7AsUKRwiLCFUByQpAC8oL0Au7CiICNAS/CswL3gvSC7AKLQPxCkUICQkxCRoI2wsiAMsL1QFtAAIBVgFQBOEL7wvxC6ADbgtXAocD1wJ3BXMLrAEMCYQJ7QubBbIL" +
  "cADGBvILXAMCDPALXwqSAvcLIQHuA/kLkwkKBwsLBwz7AfALXQT/C/sCZQDjAwwFDwVyAyICIwMZDGwAGwxvAB0MaQljA2sHiQTCBBwJ0AnKCvUIeAM8A24AwwUPBMIE/QguDCYGMQxUCS4FbAe7AusHogN5CmEL" +
  "ZwXJC2UBswTuCXgDwwWrAhMFVgBDDJoDRgwlDMMBfQFECeYLcgtdCPcCFwzSAV4JiAlLDBkM/ANDBLkBSgxFDBkMaAicAU4McAQRDB8HkglyCF0MWAxfDA8EgwIyCOwLOgNuAFYDhAWWBKsCegNUAGcBcgxMCVsL" +
  "KwhiCiQEOApRDPMKXgSNAwYBcAxyDHIAdQAZDKsCbAF3DHEMggWHDIkMIQF8DGMMzgdvBJoHNgJdCO4BOQVvA0oJ/wECCtoBqwLdAUcAnQx1AJ8MCQJ4AcMKngG8A1gC8AhdCE4FVgeZCU0EngzqBF4HNwChDKMM" +
  "2gE0CkMBuQYgC34B4QlkAwwLtwwQC1ALrwx3BwYB4QphAGYB/gFBAfgGqwp5BMkMpgaWA/gJ8gZ4CjIBqwEQA1oJhAIbCPYKyAwZDNsBkgjMDOgK3AzKDLkMawGmC6oLNwtDCCQKDAvODN0MQQEZCNkMsAyWBPsE" +
  "7AdQCfIM9gdhA6cMYwyWDIUEUAzpC3UE+QLxDP4BtQG0DEUCrAoAA+QMkwX0BkoDDwwXCCwBDAv2DF0EAA3FDAEBAAL4CJoBLAhYC24AFg0dC2oHBwlQDO0DYAsyCb0JSwQVDVYDQwpMChgNRwsaDZwERwBLCnIB" +
  "uwsdDZUFXQvhBuMFKw2sBOQG0AYgCXkELgSOB6sCUAR/BDwNPgkJAjkMNAfCBG0EgQvaApkMAAqxBEENaAAnDcsMPw1XAxUEjgdKCkQKfQvJCEQNfgFGDbwM2QNADVMNQg0xAUoNGApAB5UEdwBYA+MLNwADA1MA" +
  "ZQ1nDewKhwGDBDAF/QzcBIoKxQQ4BYMJEwRzAGwNVQWZAVYNHgFqDXoNuwpVDUwKkQtuC10LTQt0DWsNEAVtDR4Gdw0ADHkNEAUOBgsIVQEUBWUNkQ1sCzANWwBwCwsHLQPECm8JuwlADI4NlQ0PBfwDkw2JDXcA" +
  "kQ1oCG8NNQu/CzgHhwM5B5QNkA0PBT4L8AwTDY8Npw0PBU8NEQGlDaINbwCCDXIBrAKYDaoLfgHCDQUJrw2mDZYNugkaA9oMGQphAGcAoAZtAPgK5gI4ABMFvwrODQAD0Q0EBzYHOwGnBAAFWgh+CYEMdgcTBLUB" +
  "1g3HAggCdwEHDOQNAALZDU4KUAoiB74GAAVoDIwEYg1JBEEMNwh1A6UI1AFgAlcEIgBGANYBJQV0ANQB4gCAAJkAYAM7BNICQwHxBoQDuQJPAW8J9wIsDGQB9g3/DfkNuQ1SAWwB/Q33DQAOaAACDgQOvg3VCgcO" +
  "kglmAxACzwdQAy4BFw4SDhoOAw6CAjEIEguZCcMHAgqSDd0BRABZA3UAEAgGDukFPAwkCiUE8gOBDA8OBgEuDu8Jug0DAjIODQQVCi0FHgc/A84HdgoSClMMPwsTC6MCeAMPBDgARQJTAFAOSgsrAT0MMgFCCD4M" +
  "Ig2DDCIA2gF3ACIJJQi6DTQERABcB2EOJghKCJgI7gNbDd0NWQS2CpoM4ArSCkEBOAD+CmkAjgG/DZ0BEQIICbgFgAmiCt0DjQ32CnYO3gxeB3QOUAlyDgsKwA2YCEcNew4DBn0OzQyCDu4MOA2ADhkKdQBcBTgA" +
  "AwNNAJUO/AfKCfMCawfXCkEEbw5WAuwLbQCVDpIIlw5cA5UOiA56At4J2AqBC54OfgLVA1QKmg7JDZMCPQ4iAEMHIAzaAUEB7gMUBesK4wO6DkoLWAKfDjIB1ANvB3UNmgZXB2EIbwA/AbMGKgITBVIIyw7rAqYG" +
  "FAgmDKoLdgHGCvENggHzDVwJQQyQAesC3AgCAyYJ4gLgDgkCsQjnAZMLLQOJBBQCfg4IBYYLBgHVAcgDzQ5uCBQBSAAOAXEM0AzmDpsBpQmrAX0C6gXcCowEOAaaC2QBFwQlCEwKOQC2DAUPLw35DgcLiQgPA1AH" +
  "Sw7uB44EoQKcDAkP/AMHD1AJZwGQAXIAugsLD+4B1wI3AdsKqAumAaIMCQ8RDcgLpAcEDxoPBQwXD6sKGQ/WAQoMgwgdD7YJDg9rBxAPJA8aDyYPEg0TBAACgggCAwMCTwCmB4MI+QwABvwO7gFTB24OTA7BAi0O" +
  "4gp6AH8DKgJFAkQATA9OD4QNXgVECEMIWQhMA4sEoAi8CQAMaADdCFQGAgM0BEgAXw8QCJgNLgixCEIEegE3CzYAxASzDXAOAAxrAHkEYgBiABkEOQBQBEsAcg90D8EOTwxsB+8IQAROA3YILA4TDSQIwAm7DgMD" +
  "SwAfCMoMSgtmAw8M/Q77CXkKYg3fCnAPiQ/bASsPhw+UDxsPyQaRDKYLjQ83C48PLgGIDyUIig/zAZEP7At2AJYExwJaBZUDfgFtAagPyAJiAP8FfgzQBZUFlwzHDlELVgyuD1oFKgssCzQHrQ9sAKkPYgAyCysL" +
  "BAt0BSQBYgqFBMsJjA81Bb4PwA9bD44I0gHdDFgMWQM+AzAAEwVFAP4B0g+lDO8GuAVsDvQGAwjyDY8KCQZkAdEP7gnTD7sPxA97AdYP2A/lD7gMAgvDDwQHewkMD8EEhwPeD6YB1w+OCewPwgxFCGIL0A94AI8B" +
  "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" +
  "inaIdgx23XYHd412FXfVcmEySHYLd3J2vXaYdr92mnWbdut2Enc1GsV25S3iJBBvB2/iJBVvXmYbd+VhHnewdbF2P3azduF2Q3bfdpB2BXe4dpN25HZZdUp17AZuAGwwW23ndpl2L3fBdjF3jEDqAyh2ZXBHK2AN" +
  "dHA3av5w23CEdt9MPXf7djd1/XZZF652fHWcFGd3FAE6df92P3XfPjoAegOtdnB3sHbadkF33HZHd952uHVGd0N3b3ZJd7p2S3eXdsZ16HZTd+p2ZHUyd6oH/XVzWxV0yxLpA4VmC26odh5r+naHdtJ2/nbXdnR3" +
  "And2dwR3fHckd3h3KXfvdQx3S3aCd1J3InYwd4Z3VndsAFN2Vi5xDFZ2NHeOQfcFKSSydLIJjBFGB2B30EeSdw52ZXeqBzoA2HaBdZh3Z3Z3d5t3RXcId451Cnefdyt3P3UOd3Z2I0tVd591KHb1CTVM9G/Pd+Vv" +
  "bmxbAwBgMga3dz92rHbUCjx1AHe9d+F1H3cjd8J33Xaed5J15Xahd/V1hHfLd6Z3ZnVodap3dACsd/114AFtaBVoxB/Zbht3XF+Gdrh3Xg5md7t3l3ffd0J3jXUGd+J3nXfFd+V3gHcsd6J3Lnekd1R3pnfNdzgD" +
  "oEFoBqY/6h4QeLsEkHfQdmN3q3a3Dm93r3YBd/93wHcBeER3enfDd+J2C3YGeMN1gXfodwt4hXeddad3qXdqdT0GV3aWPaYCrkM3d6puM3iNaNg/Fmu1d4Ff+XfZdxp4kQG7d253IQJBeBp4sgL9dx14A3cid3h3" +
  "nHd8d+R38HXmdyh4g3cqeOp3LHgOeMpuKWm9Zbtuxl9CYEYp2mZsa0MBPndldkB3v3eadyB4eXePdsN3nWDSdT1gTnigd1F4o3cQd8J2VngLBcwXjwH7GJ1vYQclBRQQxTKQd0YpYneTdx93Y3iLdkp4wXcieON3" +
  "BXhPeAd4yHctdw93nnV1eHt4nW8Rd6d3eQCuNp8MzncqWztxvxHIA2RfO3FgdqM0CHaAeD93dXdkeIR45XU/HUx4ZnhteMd3lnWMeMp3knjtdjR3WkNDG5VOg3KdaTwPvx0RBGYD4V89eKR4SHiZd6V4QnZneLZ2" +
  "tHZRNH8WLWx9d+N2f3cneAh4KXhxeFV3sHiJd2kf9Gx1ZB9qwEBeeOFlYXiJdoJ4IXcQdoV4aHiHeH53KndQeMx4UnhadYp3knCSeOZIlXiyAv11mTVVC/RsnXRsAB9qfXi9A6RivHiDeL54vXhBdm52qHjBeKp4" +
  "43iLeAl4jXildyx40HiMIdYtECF6CyUG5AorEfR4+Hced9p3RnjddyB3JXj7eGp2A3hNeIh4bnjkeHB4I3YNeBN3JAXiZklkeDamZeJmEWNOZDB213gPeRh4FXkUeeB3S3gYeY11uRnsZiN5Qyv/eIp4rHgCea54" +
  "cnggeVZQNC1AF45yvBLEbORkSBdBedd1YXa7eNl4DHbbeC154XeGeAR44XjGdwB5OXnNeEp1Li1jAEB5smKSeLkZbHbvZ/11JQW7djV4kz+TdTp35wIxdth4LHl4dWx33Hf+d0l43XhmeP14bnY3ect4AXlVeQR5" +
  "JXaedv110A0VbI4QUWj2ERVs91y3Y9Z4SHleAUp5+Xj4eBZ5tXYWdlB5yXjieDh5UXcKeM54pncGeUFvbW6WKZZ5g3lCQH94bnned5x5RmpweTF5/njtdeccLgEbeXV55XgeeVV4PXl0eMJPR2m9b9B0lg5gd0Vg" +
  "93gZeIIF1HYCP5Z3h3nceIl5AnhPeRl5UXkmeB12b3iReal5eHnEdih28ylKB2J5FAXJeThjT3endjt4SXlpeTl1enX/dm15v3hvecF4cXkJd8B5iXh0eVR5qHl3eXl2M3f9dZAQ7gxVaUEBFni8A9h3/Hb7d7p3" +
  "PXW6eU15MHm+eal4GnmreJB5A3kMeCx47HdUdqt3MHg0d4QFcmSOBcRt0XmFedN5eXV7dRQBlXcTBbZ5gju4ebx3LnkAeNp5oXlyefZ5U3n4eTt5zHereSEJzlT2I3dH0yrlD9FfkRxHeZhgtHkteUx5L3neeMN4" +
  "tnXPKh0t0l/IeBV5pnngeR154nmddsd5aisccBJaHHDqeSt5oXhieKN4iHmfeYh1cwm9ed94jHkxevd5yXfpdlR4xnnOdVYreC/0d8MSSQMqeQZ6PnraeEB6u3lCevx4FHrceY15UnmPeUp66XfpeFd3BjV1Hexv" +
  "yXbBY7hj13cmenh1lXcceJ152Hm8eSF4Rnq/eV56wXm8dqd5NHr6eU16J3YfcqQFPAOSTpNSf3qzHfR40nlWekt5WHryeSp6i3m2dSUDg3qSTnN5wnkcecR5NXq9d7F4XQeqdMx5ni4nBfR4rHVpeaJ4vndBek55" +
  "dHr1ed15MnoYekt6knhzeNMBBQKoYq16e2NneYZ6+ndreW96EXofeBN69HmieaZ6SXqteKl6wnaUefIH4gI3Z7NfohcpbANnNx/4Etd4sno+eH11c3fxeSl6oHm5ehV6u3oXemF6U3iqeht6hG0tErRSNQSHBc5I" +
  "tFKFelV6s3rVebl5cHr6eFp6F3nSel16SHrVer16Ynq/enl5owItdn5kvG8tdn5ghGQkeo4SoHieeSh6Enpbeup6GjX7YvlikXp4ejN6lHp7eux28Xopc0Vz+HO7HXNzsVupapcgmG3Leud6/Xq3elp1RHpzeit6" +
  "pXp2et55knp5egd7K3h8eu522mMAZC5y9WOeYj1e+HI7eNxgEHk1ZWgGJ2xHeOZ6onrzeaR6unode6d61nqSeap55HmMHjpOzXbKdiRrEB7BW8l2/WL3d+J6cXq2emV4uHo2e9N6OHu8ejp5mna7bKUfRXsIe0p1" +
  "6nheeaMCOShKB8UCc3Bbez1rVXM/Axt3nnqHes96/nrpek1763qUdlB7dnlWe8N2TnoCKCUojgnDWo1jWRfydltncHH0eLFhbHq5d35113nneqN6G3uIdfF2LxG8WiR4a3vtelF773oaej17eAdCB7x0cAccYQJu" +
  "LHtIexV7iXrQekx7gntOe+x6gHfmb5B7Bnv5eSJ7UXYke1NRcmT1DkI1U3phdmR7/HqXe2d7inngdhx7nHsneNUBcmSoeot763dkehMiQEMebDJnR3v7ekl7FntLe/96aXvEd9R6YHrueqR3T3JhMmN63AjreLF4" +
  "cRnrVcFh2iUxQLQEwWGpewRMlXtBesF7wHjDe5p7antKdyd4qS3RexALtnvXesJ2OENfeewE2V/QF5VfyXqbZHx7P3h+e2Z7F3toe957AXvGeAN7FnrHe4p75nvPeAp7r0HzTyUI3zkVaO899lz4W/huBXo0EYZ5" +
  "M3tZeoF7jHqNdb4OLwyJWI1nBHsNd8h7O3v5dRMT/Xl0AKhfagKJd0N5xXIgfB4B3A7jY2x6oHoeeMJ7VnnxPRp7D3w3e7J7H3ugexl6k3n/exo1ERzTBO9iNnwpCeF6v3uWe6F6DXw1e/Z7h3vgezB85XsYfON5" +
  "iHfQD6QQmXjdHEIbCWVneZt5wHute/R7r3t7d411oCaZeBV853fheW57wHqWdXthCVGZadwOtTg8fNp7UnwpfP51FHZcesV7T3uJe217ons2enB71hbZcLNxN3I7eHt7C3xKe9x79XstfJt7iHv7e258THpHfDR3" +
  "zBd0A3Mn8AVBAFUfF2hZABAXcnVoeWV7DHyKetF6xHtCfMp4RHw6e8V5CXs3emtDJQNzB+cDnHwpeap7UHw9fCh8enxUfCN4SHdsfH98W3xvfG97fXooEWIn4GQkaeRigDTkZBxyYnvKetl7GXgLekJ48nuQfJh7" +
  "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" +
  "w39geG5/JIDGf89+WX6XfzyAmX/vf5Z6/XUKVoBcjWfxVHhbRYBjfoR5+X/xe0R4kX8yexKACH/gfWB/bHvLf3eAK4CdPKQILoCNC6OAMoARBN4PlYANeuQn1nbweaR+c306gE6A3H9igP176X42fnt5KEF4A75E" +
  "njdJQV1ivkQzgFZAEIDgfjeAtn+nfriAWBfYRIeAYYDnfmOAhn9AgMBUXFNyb44Jl1XPfPJLI4Dpf3GAGH6ygKR5y4Duf1GAgnz9dXcDmz5yPQUn44B3bud/14CTfy1/lX9zgE+AzICkd+KA6w9ue1h7lnh5b2AJ" +
  "AGd8by9mBGcigI9/836Ae1+AsoDtf75+zYBwfM+A3U0kCOx+G3OzVIl/WG6LfumAr4CHfbGAjXUHgaaA1AgogJ+AgX42fugh9GMKbghh6nmkfzaA2YDkfgGBc3/vgE19rXwQfxsaxwN0LCtLWG+if8orbYCPf/p/" +
  "fnUKevx3Rn9egE2AsXuzgCaBHX2revYI2gGWfrJ02gFcdMUy8BNWfZ4hcICEgMWA7YA7gd6AL3c/gXZ4UG2Yfk9+YzpTDQRgwV+2RG1w4UmOf/B7lXcbfziBhYC3f6l/iYDfgE59U1z4UT1gnGBwWcCAg3BXfe55" +
  "kn8QgZR/nICCf5J+ZIEEgYuAkARSRvgPAxYHb3qBiAlmW+wt1YBhdw+BmoBxfySBAIC0gCeBXXxZbH900GpcbJx40GrRJRF9eH7xfcSAJoBMgQKB+36sfPJ8QW9/erFBVgpPby9RESBGgZSAMoFFeHCBhYEAgTqB" +
  "mYEif25+G3rqUCl0ByfTcXtx5nEIYcJ/0Hzof+qAE4DQfheBNHqwgXdmTV9beT0GmX4IF3FmrnrGgZ4h6ICmgZiAN4GWgXKAHn+sY9p8Y4EBgLWAKoA0d1N1Bm0paDdqYWSicgV/goDYgEqBl4HsfyWBToHVgRl8" +
  "0CSMgN1iJALqgbMD/HyEgX9/YYGnfmJSaGO9gT6AGYHPgH5Adh0BCZQN/3BPAAEJd37vgUyA8YFMgdyAdYHUgSeBq3r/Es1ywxj4OoKBsmpdgM6B2oCNdQqCjQr1gZp/BXmtfX498lSyHRwWemJzcQUnHIIENt6B" +
  "EYDwgUuB44GIgeJ71Xvke62BzH8FH3YdjQoKH68FQA8OgmJ234G6gZuAfH7KgAaCiYHUfTR84w29CGcqcWuCa9lqNiIjgsOAIoESgYh1P4LBGTMDOoJhfymA+XWrehpJnH5TZZton34DNx4mEn7YewGCYIEmgmCA" +
  "O4I8gfF8ZYBLgiRAaSm9a0OCVm5mgsmBMYEQgkiC7IAngoiAB4IdffSA839xexxxNkK5GZBcDoH9gMV//4A5gUl95IEDgeaBzoAQf9oBJ3d1e4eC72ZvfR13NoJxgeuA4H0md2A9ToKegHaATn+DfAEQ02a6ZXlf" +
  "mIK8GQ06Dnm5gY6Cu4GGgBaCioAafO53HXwsBiVwoYBUR/ca/F/yX/1R8xpcgUmBfoIDgo12rIL/EKSCZYF4gS4VPVtsFZgBvYJiY7Z9boG0enF3G3hfgRGCI4GrgYGCmoEZgM+ANWPeDq1tpW3TKllfAGDcBHyC" +
  "g4C0gkN6FBrJgoCCiIFhgvOAUnbxf1V2/3n9dasJbQBeGc5rsAl4W5VTH2IkerZubYLhgc+BX4JPghiBD38ueOOCbHVae98dinKGcSxuyoHwgtmC4oHzgpSClHpZedQIwoFdefWAAii2bbQWRz4hKAyDO3BaA1qC" +
  "1oDXguCBAYPygrZ1InAHLD0QggK5gneBq3o0TgdHMAGzbBAeIoPdarZ9lIH+gP1/tYK0diGDOXoeg4OCBYEQf9Qe8y52KkpgIBZUffd2k4GVgHJ3x4JugnOBk4JtfPWC1oE7fV914ATMIQ8dAGL4f6aBQX/8fz98" +
  "f4IwfcuCLIKggDR3XDg9A2xIanQQZT0DIABNZlmDE4N9fy57zXpcfwKCXoKHgXGCPIKVel18vGWmb90cRDRVfdZ/RV+zgiuDZYNWfDg8OmEwgwiCG3rigF48G29+A193/4Jyg0+DLINmg92AgoJ5g3iAsn6zBMp7" +
  "E2C4QORkvHuwemyCYYNpd5mAJYICg4SDYILlgSeBpoK3UB18NHfKe9kTWIIKbMZ6/3KUa4RD7oEVgzeChoHKgt6CmYNzgmWABRhVH1QFXwkGcMsQaAQYSLODNIIpg32Cc4OWgzqBBYL0gpWCm3+hgB8InGdIascM" +
  "oX6Ag42CqYFQg0p1xIOUa0GDqnzBg0SDJy71Zf5y1YOCgRd4gHgzgdd2NYHvec2BP4M5gniDPYINfk9VBGGVBEFp5nxcgsiCSYJRg6yDhoPjgzZ+FRXLeTdkz3ljZLKCQH/kemh3Rnjfg/GCEoLdgmeD34L8fRt6" +
  "Mm51A+JmzGrKMT1hBoSNfD16R4L9g9yCWnUEhDN5PzHig+d9nH+0BI4Q3whTG9hicC4ZhDBgO3yog6GCOIKQfnSBwIP2gcKDNHcRCSMc1y6HYOUN+WbyIEuDAIO8gxiDq4MAhK2DFYShgCJu/msbb8lZygL8gDGE" +
  "goN0g/+DhYPMgmZ9oYArC4UzuBCmPzwYSIT5CAYVPoSBg9V8vYOIdUeE1ilNhNKByX91gCaE04P0XhxUy3l3DBxUZXnqeTWAzX4OhOyDSnUff/l7WIQ9gBeCZICod+KCLCTgfIV+ZiJVc1oiIAJge+8ST4TKg5WD" +
  "M4RChJiD74NpgzR8Y2hzhBtuEmlde5OAW4IghMuDg4M0hEOEU4P3gRB/Nwg5KQ4FY2euZZ9+n0zBgl1qY4SQf5ODY4NdglKE7YM1hH+E/H7PgJUEyQx5LSouKR+HLXNxg2RnZwZ28Gw/hFGEnnVwNA+Edn2hhESE" +
  "P4AQf/IV4DmRYEkA5VsKPu1XuAFAfmdgUITqfP6DoISNhLl/LYLEAgAjQmIKKi6BJHS+e0yD+YNud0B4/IMXg8aEtYTIhBiARYQ0d/Qv8TCxb1szPgXpJKN/oIKKhEGEx4R+hLeEj4SegwsRv2GwT+RSOGLBZfZ3" +
  "SoDEhKV+b4IDg0KD0oNRght60WiZNWs2+2ctYwYk/4RFX4oHY3yJhHuEaHy0hKh+TYGihGN/Nn5RNK5Dx3gFYxGF9TufguqD4IMjhNCDyn/6hOCAxx1uABSFAAIvHFYbH4V9CuVbIoUWhQeFZIOfhNmE6YSOhLaA" +
  "z4Bua0lPYTJya+RkZU/ngDuDjIIkgiqFfIRadTGF8SMxf2qEdoExg7uCZHCZIsp2+GkNBfOEYXYMhBl/+YNOg7GE2IQLhayByYRUg/11AjIXG2wVBzJYhZiE73v1hLCA94S2dVeFEhtsFRSEo4QQfxuBwFm7HT4p" +
  "039sGACCLQCsAl6FEYFghYyELYVUhcB+r4OcCRpi2hrub/0D7oE5hQ2E14QKhbo9foAahVmEbIQdhWQNLgymCF5w/3V5W2wAyWung7CExYQKhZ2A+YRahPuEnH/6aCQyk3J0bjwGtl+chX+AJXpxhXKB4YPTgWiD" +
  "ZoWxeERHXGU4ZZFxug43XayF1XdHgSmFnoQ8hSyFJYSHhTKDsXiIFN0tO2XeEdctr4WIa114pYGShfaEQIMUhBRAvIWshTh9XHnEgbYdNC06W4ZgS1A2bmFvU2rugkRt8Htyd66A5oQYe9uCZoRShVKDdoUvhRB/" +
  "9nyydH+DsoXEhV+FxoWmhQGEroEWhB81QYFWGzEEVGyFfrV+54Uue5V3MwBPhZOF3oWVhdGDl4WIhd078oWNgdhiHzWQgU1xZ3nCgMx623edhOuDc4V9hLeFpYLhght88HcnLg4F+EdyfvNy/g0JAXV+kIWRg/iD" +
  "O3UydNSEZ3f6hcWFpYVBhXKCgITqfsFmR1TCJsRm1WhZHz0DCVemg/aFeoQ7hVGF/YUbhf+FV3tlgPdyIGS8HX9qfYVdaj9/OoW0hVGFPYY3fWWFDoXOguIkhgXLR80vknGwcctHH4TohXKF6oUnhqeFSoYQf5Z+" +
  "TYYNaHaEUYY3hXCDs4UNhlaGdIBrhIqAXXyChANFl24SaWqGh4Q+f+WECIWUhSSEBIO4hSiBNHdjaBuBCG4XaB2Bi25GghN9Y4ZqfHiGw2ZzhpaFdYZ7fTVyM3LDbytyGQ+yCcFbVXOeeG1/RIaAhhmFSYbNghB/" +
  "LlCEhbobnD40ghkCo4WPgiaGZYZChYqBNn+zDDcM2oFkYCwYAIJihhiFk3yEhv6FdYbBfvJhennpA/twygeAbLSGj2muK6qGVIakhZSGo3mRRNqEUIIAhsh45YN9aLMMDGwegd5+Q4aAhTKEUYVTdcWGOIaGhRGG" +
  "boQThuSCowJ6IMBtaXC0dHpbeYSShqyG9ntUhKYh6TyFhWaGuoKrevgW1CqoCmEyvlHphkw9bH+/aX+Ff4bfhtd86IYjcECFoYYohnp9G3pJUahnPmA1Iypwyoa6g9iCzYYKhfyGcj2Vhqx/Nn6fF4QnsnyiF4Rn" +
  "AHCNfJqEKoNAhCuF34Xug+qE4oWDfGJIQEPma4NdU4aehqKCYoFXhuyF3IRWhdRB4iRAhpo5J4feWINqAYcXhWWEDobohBCGuoJdfHdPYA2YZg6AmYTDgkN/rIAjhqmDqoEPhnSGZ4Ykf2kfSwlzB8Zy3mdwFcKF" +
  "uIE8g293+YU/h8yDFoe2hC6FW4ShFk4I6HOyQ/Zj/33Yg+t5on3keiGGloDahXGG/IWuhjmGdYZdfEB5vFsxhgZw2gWecMQpCVeQhspmcYM1hkWGgoVth4BuHYPrhTaE+oacf25raYU0hWyFboZyh6uGMIdkhu6A" +
  "e4ebga+DbEhFcstprjYhRIdpH4EChxaDBIdkh+SGoobwg/iB2y0hDIaEsXChZCAeeIR+hrh9hYeghoeHDYWWhjR3hHvJB71l9XYec/9s7HShh2R3b4GXgJOD1oSUhzGHtoVCh+aGG3pTdTxgZGjHhq6HXWeRhSCH" +
  "IoSthgh+v4O5hx+DG3rFeJtwBWMMV2+DTIfLgRt4tYcUh7WFUofBhkODUoBuJqxRTghiSHth1yNLcVdiYWXpg4SHgYWVhwiH53uCMvmCtSysUct534eBaDl4gocPgsOHqoNBh4WGioCrestyY17FcpWESGjxhxh/" +
  "ooflh7eH1od1hduEVYXzfKgCg4QEfMYCd4T+hyCBZIQBiIaHDIUYhxiCDX58aNcfggJcYwdlkRwpf1YhL4fXhDmAAojRhuWGd4H8ee53FIZKbr4dVIKdhdOFoH5GezSG3oajh76GI4eIhzh9nIHcC5hx54OAbFNo" +
  "6QJtajCBYYa8hp+GMoj4hmiDpmvQhomHzXtUgUIMiAnME8t5tjGpD4lg9YNrAsKHH4Y0gbKH+oO9fNuF1YciiJeHN4QAeqQ2eIdJY4R8bodrh599cINRAfOHQIcyh8iHpHeXNmqHLYZHiE5+CoNkcJNyfExCcJNy" +
  "kGf+MlZ/L4j6dz2Da3dOhVCHi4T1h6+G94f8hA4FQmKiDI9non96iMOFaIhRh1uI+YZwiM2FFA0BdlgLlIixhQRuEwGNiIGIGHv2LGx4eoemhwmHS4ZtFNB3s1+MCaOI03fIenx/2YPMhtSHN4Zlh9KGNIc0fIQP" +
  "Cxhvh4ICAxy5ap+Fb4iLiFuC8YYAiLaH4H2ziGCIr4gjiEOF+IcJFPgIDwE+ASF8fTH4BMmIKxF8f3N1QIghhyeAn4gTiNmH4w+VaGYAQysfSdqIwYQehjCIEIhqfOIw3YjDiFyIqIVYdxkM2V90cM0Ou4hvhpWA" +
  "XoEkhumFpIcSiFSHmIWhgKNlOYimZT4IcWoIYdaF8od0h5OGxYfnh3eFkITnPFR76oHhZmB+uIipbzsicYeriPKGMYgCidWI9YiEgt2EPinPAmBbpHOvBVA3IyoGLyeDOoceiL+I84hThQWI64TgfP8B2AECPxgP" +
  "e0cqiTOGP4iSg0B4xYJDeMWCEnnxiFWGI4nghSWJJ4T9dRwlWRcXAaIY7gwwJfhH5ltSNMsM7329iKV/4YgAez2J+EcSK9JRloeQiO2F94jdVWwAU3X/EHY/Qxb9dPR8ZYiIhNKIxIe8gROJ4YUUiDZ+cRL2hgBq" +
  "BmMpcGCGBEySh4CI54S4h/aHsYhkfwURoTBzcHOJzXB/YVyAmohuiQOIM4fJh5mF4CDkiBBD8CpUQveD4IgiiUKIpYfWiBWJjIBIOcU1vzh8XKhijYkcDDhj5SOCXMsDT3yqgNOEVogihrOHQ3hXiJSDNoZyhlCJ" +
  "WIZSiQB6yhtmXR1v5GJLKHBmHW8fgXCGoYnmh2GJOonff7qF+ggPNzwFinL3Ry5jeANLUuSEIYmtiKKJA4k7iScupUyzX0ERFmzUd7eBsmPYhQuG04dQhQqF8XLWb8KJY4nPgKcW+Yh6G8cC14k+iCRoXon0h1p1" +
  "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"
);

const POKEMON_PROGRESS_DATA = decodePokemonData(
  "ewAiAHMAcABlAGMAaQBlAHMAIgA6AFsAWwAiAOwAnQC0AOwAgwCBAO0AlQAQAZQAqAAiACwANAAsADYAGwELATIALAAxADYAXQAkASwADAEOARABEgEUAbQA7QCSAIAAGQEbATEANAAgAQsBMwAsADMAMgAkAV0A" +
  "JgENAQ8BEQETARUB6gC9AIMAMAEsADIAMwA2ACwAMAA7AQwB7QCMAIwAKAHrAKYArABFATYANAFbADUAIQEjASUBDAFSAawA7ACeAJAA6wCTAJwARQEyAVcBSQFIAToBPAFeAWABYgGqAL0ARQEyADQAMABKAUwB" +
  "IgDqALwArADrALYAgADqALgAsABVATYBCwE4AFoBawEnAZYAtADrAIsAiAB8AX4BgAFmATMBJgFbADkANwFbAXcB6gCxALAAfAGBAOwAmQCVAHIBMwCVAUsBPAHsALoAkADtAIQAsADtAJQAvAAZASABogGTATEA" +
  "MQAsADcAhwEiAIsBqADrAI0AsAB/AYEBRgG1AVcBMQAgATEASwFcAbgBsgCEAKkBqwGUAIwArwEhATcAhQGkAV0BvwCUAOwAtgCpACgBzwGxAQsBMgG1AbcB6wCUALEA1wHZAQ8BzwE3AMIBWQHFAeABjwCFAOwA" +
  "uQC6AbYAoAHAATEA0QF2ATwB6gC1AKwA+QFUARoBLAA1AHUB3QE3ACEBOAC3AawBvADsAKMApABmATIAwgGFAWoBxwEHAgkCpADtAIgA/QEbATIAIgH3AQwBeQF7AaAAmwDPATUAtAEfAXUBMgDGAXcB6wCgAIgA" +
  "7QCKALgA6wCdAK4B9AE0AFkB0wF4AfAB6wC5AIQA7ACwALgAIQJXAQ0CRgEnAvgBNwI5AmMBnABSARABoQC/AcQBNQA0AncB7ACVAIQA6wCzALQAIQKFAR8BGAI5AccBUAJSAlQC7QCBAP0BTAIDAjUCEgK5ABAB" +
  "uACEAM8BswEgATUCLwIIAj4BaALPARkC0gEoAqoAugGeAJgA6wCRAJAA7ACnAC8BwAE2AAECWwAyAIUBDQK3AeoAswCgAH0CfwJMAnQCbAGMAUYC6wCfALAA4gCZAH8CGwFNApMBMwB1ASIB4AGQAmQBXgHrAIIA" +
  "mAAMAo4CXQGfApwA7QCAAD0C/gENAmMCKAKoApIClAKZAIIARQGZAjUBNgGdAscBiwGNAaACUwHrAIUArAIxAYQCGwK4AagC7QCCALkAcgEyAK8CpQGCAHwCzwIZAbkCMQA2AWQClAC9AOwAiwBlATcBRgH1AcUC" +
  "2QKdAOwAigAUAoUAUAEwAs8BgQLFAqICmAAOAbgA7QDlAg4BMQLEATcAzQJNAZEALgKmAL8BNgE5AE4CPAHtAPcCXwJ7AfkC0gIhATkASQE1AgkCvADrALEARAHAATQAlQELAZIBhgLHAYgCugEMA2oCNQCjASgC" +
  "mgBHArIA7gG1AMICHAEeAVsANAAYAjEA4AGDADoCgwCIAB0CZgEzAKYCuAEwAqwBjAApAogA2QKcAFwCywK0AWQCTwFuAuICCwLAATUAAwIRAwMCcwEGAj0DMALsAIQAuQAsAqwCxAGSAQgDvQCYAE4BoQDoAiMC" +
  "JAOVATMAJwO7Ao8AUgKjAl4BGAMwA+EBlADqALcALgKLAEADIAE1AIMBWAG0ATIAlwGPAqUATQNtAZgAaQMhAQ8D6gKjAuwAmADKAkEDVwJYATYBhAIGAo4AeQKlABAB2gJ7AxgB9AE1ABsBNQKIAqAAbgJOATQD" +
  "jQDzASABHQGTAZkCMwAzAIcCswC6AZQDagI3AP0CXQGnAJ0AyAJ2AzYAVwNCA0YBBQJbAoQA4wGbAHwCiACtABgDGgP4AbAAgABjAxkBtAE3AHUBCAOcAI0BlACUALoDBQONAygCsAA4A7EAmQDaAf4B6QILAagD" +
  "RgE1ALcB4gKNAaUAygPJA8sDMQEzAKIDeAGwAJUA7ADXA+YBrQKbAt8CpwEoATcDVQFoATEBcAMnAZwApADqALIAlABuApEBvQN3Ae0AmwBSApQApAKtAjIA2wNQAowA7QCGALUA6wCqABcCHAFXAzYARQOsA5gB" +
  "twAIApwAoQADBAUEZwHFAuoAtACKAaAApQAQBMsC9QK4AXYCiwEUAq0BVQGCArwD3QLSA5oAsADsALgAkAOPAJkALgMbBOwAJgQoBJADXgItAjoD3wKfAesAiAArAhUBwwMIBJMBNwA2AZsC7AGFAJIDYAMhAQQC" +
  "9AP4AXoB6wCnAI0BjwDOAcwDIgRZAfwD4AG8AfwBRQTZAxsE4QGxAFYEUwHLAtUC9QOPAHsBjAHtAIMAjAIsADgAVwH2AXQB4AGCAIoCjACpAEsEiACgA/0DlQAKA48AcgSAAmwDOAB1ATMAtgFbAnUE6wBdA+sA" +
  "ngBmBPUBbAJPAr0A1gHnAoACWQGEAbABQgJdASoC7ACJAewAiQTxAmoCNgBfBP4CTwF7A6QARQTEATgB6gJ7AnoCkADoAlcBOABZAVoD4AF7AnMDUwGdBJgE/QOlAF8BsgToAo0EWwA4AAMCMwA0ANIDsgQ1A4gC" +
  "dgMiAQcDTwJMBO0AjQDYAuEDlgO2BDgAWQMKBKUBTATrALsAkAC+AXME3wKFALgDnwD9AbQBzwM8AzQDhgPsANYEwwMxADgAxQP4AYkCnQQ/A+gDkwE5AIED0QMUA+YEMATjAk0DkQGHBJsErADvApcCRgH8A+oC" +
  "oQDjAfEEhgB2A/QC3wKKAAID9gSUAGkCgAJJAQsBOQBFA+sDDQEDBV4BxQTyAloBtQNNAWACgwSpALUE6gSVAYIDEQLJAgEDFwWYBMIEpQGwADQDvwJTAYgCtQDoAgkFWwDFAbQBQQS7ArYAYgGzABIFhgTfAlEC" +
  "bgJFBNoE2wPrAucDRgTiBCIFTQGDAJUAXARhAiIDsgEwAFIEzQRNAYUAhQBEBWoCeAMIA9oCPgOGADQDBAS0A8UC7QCZAI0A7ACIAHkCVgWLAxQFuAGCAIoBowC6Aa8ATgO1AVkEmADSBLcD6ASAAn8DswF8BO0E" +
  "KAJrBYEEhADqAG0F4wKgA/QE1AHWAWYCwAKsAtoEEAMsBcMBGgFaAogE8QO/ACUF2QTQAUgEXQGfAK0ApgMEA6IBOwWNANkBvwCQA10EwAG4BOQDpQDvAVUC9AHoAd8CjwB5AqACiwRqA4MFswG5BIcFpQFSBaYF" +
  "NAWMA98CUgPvAfoDlgMjA7MBWQObA1sCnwGVBOwCuQC1BSEBNQBiA7MAdwVtBYIABAU8BDADXALsAJgFPwNkBH8CtAHiBHwFuAFMBGABUgKnAIoDxAHbBE8C4wKRA2ACagIwAI4FuAFlBQkD8gNgBd8ClwBiASoC" +
  "6wC4AE8E8wLTBXEEZQMuAkwEoAOaBCcBgQDsAscF5gOgANAF0AH9A7wAygFlBOsAoQA4A3oFPgWiBQgDngCJAJMELAHJAsMDdAGyAeMDJgKHAjwCOAVdA24F0QXLBOoCMgMGBT4DBgYZBlkEqQCUAM8FAwRxAfQB" +
  "MAA7A08CDwHsBeYCoAXJBN8CgwCeBGcFRgJqAuME3wKyBBICjQB7AY0AwgP0ATYGbQJ9Ac4FqgE1BuQETQGPAIoBJwWzAAAFYQVQAvEDegMPAfIEwAE3AFcD1AKVAWsEfwTWAfEEZQT1BVgFFgL8AecBVAY0ALQB" +
  "Vwb1A14G+gH/ArgAbgXzAvYFIgCsAcoB5QLmBRkG4gVgAZADpwA0A1QC4QQaBtYCUgKuBKAAgQVGAdsFpQE6BrsBPQZuA4EGTQGcBD4BiQHDA28DKQZsATMGhwAmBtoEggIyAQ8CkAQNAYsAkAORBuEENABDAywF" +
  "eANNAuABpAPrAusAmwZGBMwC4gXrAK4ApAAxBMMDmwJABbgBqwZyASMECAO/BZUE8QNTAc8FVQG3BWsDhgG7ArIAigIrBrkGBgXzBLIBsQU4AeABIgZ4BbgDjAHsAJsA+ARHAbAGLAbsALwAgADtAukE3QE1AEkB" +
  "MgGiBiwDZgPUBtYGnQAhAxIE2Qa5BA0F7AXxA5IEKwbwA3IBEAZtAq4EUQK3BoIBxgaVAeIE0gOXAHkCJwWyAC0GxQbdAekCLwVPAp4AcgMWBQQGHgSXBOIDYQUdAm0BhACgAM8BNABsAyIBTAKeAu4DSgSaBU8D" +
  "OwVBBiYEjgE+ArIBlwMTBn8ECgNBBpcAiQBhA+oC6wXBA+sAsAA9BjYBvQb+BtsGSgW4AScH1gGVAHgEuQJ9BFgFhAMoAe8DfwIsB5QGNgCFAqwFJwE3BfAGUgIXBgYGuQLuBvUDBAdHAhcDwAFzAY4GJwG0AI0B" +
  "MALTBEYENgArBfUBbgN+BCgCngCpAoQAoAXRBYcGbQatASgEBwUgAWIG3wLRAtwCJQNYBQAD9wJSAfoChgVYBYYAoADvA/8DIARrB2EFAAR1B/sG7QCLALEABAMSBG0ChACsBlAGiwBLAkYFAgKFAnMFbAGEBygB" +
  "fgcnBHUDsATqAiIGEAXEBv4B2gayAXsEwQXgAVQC7ACGAKEAnwdVA/4BwwFwBTgALgWXBuwAoABSAqMAowcYAuMDCAM3Bd4EiQQ1BG0CzwSmAKAFNgE4AKYHMQEwB3EESAJFBLkCegaYAXoBiwIDBNkFdwNFBg0B" +
  "nwFOBfsD2wMABLUA0AfyBpgHlAa7BwQCqwR8ArQHpAcxAKkFGgbMAtIDhgA4A+EH0wcYAjAALgTpBY8HjADbAjYBCAb1AxUB6wCEADYDKQRFAUgBWAXvB2UF6wBnBZEBTAa8BWEBnwS1AcoFJgSSAw4HwgH8AkEC" +
  "4AGIADoCkgeLA1AHDQHpBdMGyAQEAsoH6AaDBFMDggDABD8GsAKNAQQGLwS/ARsBpwc2BXYEygEOBqEF8AWsABABGgf0BdwCnAWxB40BhgCNAGoC4gTqAtUFYQEvBBgFMgLTBaYDSwQTARcIVwXWAggCUgNWApMB" +
  "JgKpBFsDTwKkBb0FmARsBoAFjwO0BU8F2wN/AbgDSQMPAZkBHghnBLAGeAXeA8AGAATABDcAYQUUCGUFBAPNA4MCxQFGAboFCwQuAp4AkQBgCIoDuQLCBd8CNwIqB+sAYQibBTADFAGrAOwAggA0BaED6gKLALoB" +
  "fgiLAmYBAQVkApcAngQyA0sHGAb+BVgFYQRoBrwCRQE4AFgIuQA4A34CiAKIB1cHQwjeAgAHbAGnAIEAlQjUBLYH3gbzBaEIIQKCAhkCzATdBvIFnwXrAIYDjwMYAw0I6gC+ALgAsAj4AowFAAJDCBkCNwFnCGwB" +
  "ygaxCDkFwQXKBZYEggCrAZgArAJIB8oH7AC0AOECiwaAAqUIcwHQA+ABjACAAO0AYQTrACcIgAWYBGIDlABHAr8CyQE0BtwCswHSBnYGzwXXBgcGqQYnCGABngVKAuEEmQTqAo0ALgK5AE8E2gQrBQ0CGwW7BBEC" +
  "lwD7AbcD4QR8CGQCyQKRAqcFRgEPB7IF1gGJBP8HlwgfAaEEUwRbAgUJJwWwAJEAnwhgBEgG+wFKBjIANQapBsECkQM9CD4F7AhtAvgH7QV2BQQD1gdtArAAmwFlBZIFDgPTBZ8F0whfAQ8IAAkxABkD6gK9ALgD" +
  "MgnmBZYDVAbOCJoIJwEPCCoCOghkAecBwgH6BDkJ1AWhCDgCZge1ARAHbwM3AZcGKQfSCIMAsQABA/sIOQgVAQcC8Ac2A0cHHAEwAGIDUwgQAdoHhgYNCFAC5AL8BqcGYgc/A+YDvwBAA14JNgWQA90ISQMfBlgJ" +
  "QwidBkoJVAS9AYABHgZoCckHcAmFAaEGuwJMBL4BdgmMBrQGKAJlBb4BOQNGBK8GcAiKAoMACwbqCIYJMACwBkoDLgLrBTkCswapBl8D5wiUCJABzAM/Ar0GugIoApYJigFOBNgDdwObCRsBEAKeCXkCJwjIAn0D" +
  "rwdMBvEGsAC6AXYC2AaDApkHnQmlAZgAnQG2BtoHMQGSAR8BqgOmCWwBsgA2A7kJPQasCeoCrAAIAqcA4wHhAxsBVgFDCDAJtQldAYoAqgB9AsoJoAW7CT8C/wbnBtEI1AmiCU8HiwhfAbEAkAOjAiEC8wjNCfYG" +
  "FANmAz4DDwjjCTICLgSUCN8GoACcAM0HagPlCeUH0gOcCPMJdwMbBHgFRwLnCFQF5AnfAmgDzAUABdgJAwLrAbsCtwCrAYcHMwM+AxEI9QHKBWYCZQlnCT8JQwg2APUGSwntAeAGBwdrBugFvQFDARkE/gFsBx8B" +
  "UwZ3A+ABBAZ7B24FMQHcB/sEqQJPAQMIrQIaAm0CXQN7BzsIRQEiCoMCNwC7CdIDngCOABEBNgO6CSEBKwptAmgDZARbBPoBcgExCvUD8AIwAgMG2wKYAiMDzAJFA0EHDgWsBpkAGwhOCsEFCQewAI0BHQSnAHYD" +
  "sQUjChsFjAeIBroBuQaNALAFEwieAMoBdAeJCBAGHwEgCB8H9QPHBW0BUQLDAwsFQwhoBHIJFAO3A2MDUAJ4BG4DmgPqAjkC/AFcBQ0HQQNQCjYGEwMoAkUCXwOwADcITAJfCMkBSgOvAC0DHAH/AYMFhAJJAUcB" +
  "4AGSCoQArwDHBxkB2wZiB3YHDgFSAgQGwwOZB28KhQHnCcYDRwJyCKcKPgVgCoMCGga/CRwC+walCqoJjAY1ADkIbAqkAGsIXwVZAS0HgwI5AG4DqQfxBj4B8QTfBf8BWgHiBeoAuwBbBc8EwApnBGwGnweMAL8E" +
  "cwiuBxoBfwMyADkA9gm7AsECKAXYCgwC8wgGCGQG/gKPAK0ADgE0A60HtQcoAsQEYAJkBPMBSQFxCR8BdwpGAxEClQD5BnsBrQAkB5YKwQTqAvgHJgX9AUAEwAgECSMGnAQGBiAB/AhPAusJeQKTCdwCuwrtCGkG" +
  "1QaQB4EHSQdDAvIJ8Aj5B+MGgQoJBu4BvwVRBjYHbAbLBlMCEgk8BCsFmwKpBFMKeAWxAHYFcQbBBVcDhwkzAZ0HEAHdBQUHiwSACkwGmgBkA3wKaggACjUBWQk3AVsHpQE7CyQLngDIBzIBxwiDBjwGDQpgB5cK" +
  "mgJlCG8D0gNLC/EDMwVRBmEHsAYMCtgEPQVPA/AF1QUrBi8ITwXwBTMFRQlRBuoBIgLqAo4HdQNlCzQE/gpoC20CHAigAJ4ERAfzAxMEvAC0AOoAuQCNACAKSQFjCFoDDAWHAr8AfgG6AL0AfAtaAdQKMQZuBrwC" +
  "hQnaBDELKwpCCREBFAIWBc0GdQobCa8IiQIVCJ4B3gNhAaEKZwSCAjgBYwaXBo8DmQufAZ0L9QE7BZEAIwZbBoACMQtHAbkIBgLoCroG9AFkCYkEywFqBloBzwetAakIoACoAZcHNgEHCVsAOAFpAVMKBwLyBbkK" +
  "3wg2AP0DlgAKA4MJmQm5AkkJZAKGAOMBvwW2An8DOAFZA2MKuAFFAh8JTAoqB2YBKwq4AnUBMwIGAs0BTQu/BKEBxwgMB+0CmgtVAZ4GmgOwAVMKKQesBuoL4gZmAZcI3ARFCdMHWQHNCbgCpQnZC0QEOQK3BkUE" +
  "6gHtB6UBnwCdAK0IywoiAXMGhADvCMoBZwqmC+kCHQm6AaMCXAiBB2QJhgDxA6EAnQAXDA0IGwuzCP8Hbwg1ARAGQgnrAMoGuQCFAJgEygfLBmAB+wG1AL8BfQtXAboEjwQUBtYGngBfAQIH+QEwDFoBxwhrC5oA" +
  "CAwvDOgCnwtsB7UKDQG8CzQKggQWB4oI7waKAZwIGQFZASQKIwzzCksJuAdtATsLTwzQAdQKNwUYCZQAngUGBlAMMQs0AIUB5gpCB9cFYgFdA1gM9QFLCLkAKwKHB+sCWAwXC10BfAonCn8HaQzDB6UB5QPxBJAA" +
  "gQBPBS4EvACNAb8CXwUxAbEFCAOJAXoCkAPbCZkGBAMwCTUBxwZDC6cCkgv2BI4AqwCBBzAJZAJBAZ0DJQaLDIMF2gNpAY8MuAEzBkwKcAGVDHoHLQJNChIC8AR3CSIBXwm/BSkCfAzfCJYMTwKVAOMBGQz2C0sI" +
  "NAilBEEDPwIwABIHuwI5BAoHKgiWA58LzQkzC1sCywvqCmUD1gaKDLMLYgPRCPkBFgQ2AwsImALWC5cDyAZbAhcBNQOvBKQHNwpIAVkBJQPSAxcBnwX7BdAGsQEIA6cAOgKjAAoDowzLChYKWAWXAP8DSwoxAgQM" +
  "qQa2AMoBWgXoCMsD8wwBCkcCSQO5AH8G9QFzBnMKagiBBMoD4QPTAo8JUQIoBcsDkwaaAqIFkAuJAJgA5ws+BfQKwQs/BP8BSwlUAksENANoA4AJqQYiBvEKPASfC3wIcQq7CKoLQwVHChMN7gs3APMK2QsmDKoL" +
  "fgHpCRwIbgmoBiYHNgN+Ai8CkgaABh4MkgR+AssFyAp3CY0GNQ2LAs4FiwB/BkENbQIyA4cHywUzDYEJbAFJDZEHrAZMDc0KbQU+AXUDywauBrwMEwTpCYQEgQR/CkoJ8AWSBM0FnwBeDYcJ5gxSCAgC1AunBk0N" +
  "SwVQAXUDpgOJCDQNbQIdBH0BVQfMCSMDLwOrCjAHXAVTAy4BjgF1DaMJmgK0CsQLdAfrANEIfg2ZCa8H0ga2ACwDQwFcBekKywkcATIMxAolChECiQYQAbIDognkBsELOQCwAQ0FyAg2A5cA6gwmBhgCcQxtBowA" +
  "hQtJDAUE7Ag1Ad0Kvgb1A6cNZAQ4A5wL2wySDakEng2XAKAA7QCEA6sILAFtC8UJCAMkBbwNlQobAXgDrA0GCvYITwLBDYYD6wDdCD4J2wecDDkADwLIDSMF3QQsAcQIUAkwCmIDRQLdCIwBpAiTAXQBnAItDdsN" +
  "awopBTICKwy3ALgDmgCeBBwDfw3cASQDWQ0HCgsE6Q0UAqAH2A3ZAysMSgScCPYN/wFsA3QBgwzgAZAFNwPaDMMCngZ0AakESwmgAP8DpgyLBK8HUAhKBHABLwQhA5kHcAs4A6YAjQHqBooBzg2vB/AFewL8CXYF" +
  "bgVQDIICdAFZA0sJRwu6DVICzg0EDEsIjgpOAagAAAT9BEADIQ7fDbMBegrGA7gG9gTSCyAOWQzqAoIE/ATkAcsDZwc7BT0OLQvPBIsALgZ3A2IDXwMiBhsKSA7fAg0M6gCCC8wNfAYFBFAFiwrKAasC9gtZC5wE" +
  "rQyuBAkLgA1tAu0F+wWnAysFYgYbBQ0FDApxC10I1AqyABIJUg4hArYEMwFuA9kL7ABsDl4BlQqNAhMEuQDhAs8EJwgZBWQCpgy5BoQNdwQhBRMEsgCfABQBLgKeB7IDFwx6B50A8QOTABQCkgBbBYYAuQxJASME" +
  "EQNJCRwFKAKRAJ4FaANNC94I2wY5Ct8CigaKAaEAAAVzBqQOAwazA8wMxgkoCJsB1QVODN8IFg0yCisCiAgmBIIIWQR6A3wDcQRiCFcBDwewAb4HBATrAIMAngUGDb8I6gIDDZQAaQgPCRALLgTjAuwAuwC5AOsA" +
  "vwCjB5YDZA7aAzcB0w0nAc8O0Q5FCtgN2gViAysEGwuSAkUFYwgPB7kEughdASsEZASdCEEMoQUODl8BPQ1+AkIIZAKdAIkAogKKAWMFpgT2B2sIswDlDdMC4gW6DXkCMgOEA5EBygdZBTwLlQCBBO4FjQXqAl0M" +
  "PwEMBgQNIQ3fDWwH9wruB64KigS9Df8MNwolA94MMAcUATgDfwVEB3ANaw24AagAuQBNCLMNuwNiA64EawuGA7YCWQTkBSIPXwHSDBIIWAWeACsCjAiMCGUEiQjACzMCfATaDm0G+Qq/B4MOPgUZCKUBzw69AKkC" +
  "eAfyCN8NEQtkDLgBoAJ4AhICmACKA9EFCwvOAmIB4gH5CeYOjgxCBPwJzwx7Ba0ORA2NAd0NsQp6B5gAQwW0AJEADAZYDD4PvglGCI0HrAZrC1sJZgtaAQ0IJAbiCKsLggXqAjkE7ACTAL0BxwM8BAUO6QJQDzgE" +
  "NgOOB6ULBwZsBisJjQiQAgwO0AFMBmEBKwm3BkwO3gltAmMFcwguArIALg5tC8QBmweOA5oBhQ3WBgUJigW+CJcPKAKWBcwFmQUKA3gGPgbnB+oFKwIXCOgGcgICCaAI8gW/B8EJtQ+MD3QHdgdvDVcJcwE7BcoG" +
  "bQX+B0oM4gSpBsMGCAKVC58PKwy4ALgDGA4CDssPNg+OA84PTQuJA4IIXwinAF4FqAAgDJoFOQuLCBIJvwRaALUPXwn4BtkMKwbODYAKSwjbCbULCAsYCMcIgASKAHwClgK8DZoM3ALRBn0PoA1fAdIPIgFiAycK" +
  "hA19DosDxwicALkNYAI9BWkJCAO4DU0LVws6DTYFdwXpCYYAXg1HDSgCwQNcAnMI3A/6CI0JWQuOAHcFgAGMC0oJWQs4D5ECkwIdDUINmAmBD9YGbgmbAtMFfglPDW8MGhBYBRYFkgQNDHQKBwVaBwEPZAdrC4QH" +
  "jAZJCpsIjQEVDEwPRgElDx4EHwVbCSUQCAOJAHwCKwb6B60CJQ8WEN4EDQwdCIkIOAETCDkCAQOQB44Iag1zBukMoQIBDJYA+AT8C1gDoQ7SAzEGRQmRAXAOdwpFDJELTQoeBKEBYgPsDb0ImgXMCb4OOQD1Bp8M" +
  "OwKoAJ0EUA74BDIBKwUAAnwEtw0KA+cIig+vB8oFXQWFDd4DkA1hEAAC8wLSA4wAjQA7B24BZhDbDLYEAAJABNoJfgGyADAN5AzDBYoB3gSlALkMagOpA0gFBwi7AhkNrAhmA30M3wI7C+8CiwW2ApUQ5geuDf4C" +
  "Qw+8AW0BywjZA4ICAAIPAvELcghdB94IWQL9A4wA8QNFAsQOPwttAyUCCA4rAj0Dyw0CCl4OLwkIDQoDQBBGCRwJsgzREBYIXQgTCCoHnQRuBugCKw7WAW4NGgnzAvAPlwB4ENwQeQQ2BeQQrwknCeIQ6gJwAS8Q" +
  "LAdiAxAOlgA0A+wJuQJOEL0AcASRABENiA38DZgDJgIkBFsCBBA0Cu0FDAKVELgI1gxPAgAG7QDECE0KHQjLAnMGpABSAqsGvA5BA4MFuwqBA3cQ8QksBtYPZgKgAxMIfghhD5gHfhD6BAoJsgwjBqYMLw+kBzcH" +
  "1A8oEOYDlAQGBhsO6gJ1BcsN3QPsAKAQfg7uCnkCNRE3ETICXwijBEwLpQDABcALawN8BHEPXQGqAJsBoAJBEaADYgOeDn0BWRBABDkAcwacAAoDngCPAHgQVQGpA4EKJRH+AmwKhwB1B50DxQZtAhgJngeyAKsO" +
  "WQJZBCsE3wMFDdYJTwsLAWsDmgotDR0OGgsPC/cNmAM3B0UMpAQ4Ak0FtQBtEfQI7QjsAjcNTBDaBYwPZQTvA6kAyQxKCKIEYgHLDa4PcxCYA2gHJA1dAaME3gQTCioRSwh2AhYQqAAhAw0COwXPBCgHOxCYB1cB" +
  "jANZAgYCBBBfBqQHSQlvETMCNQ7+Ao4ARwKvBUgKygVUBRsLfgoACgkQfA0wCKwOtQb5BiYLQQPSBqACMgdtD7sRxgMnBIAPPAUOCqMKkgiHD/sNIgxYAREL3ArSA5UAhQBFCbwNDAJsA00CNgFQD1AC1BEBDLIH" +
  "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"
);
const POKEMON_FORM_KO = decodePokemonData(
  "ewAiAHYAZQBuAHUAcwBhAHUAcgBtAGUAZwBhACIAOgAiAOsAqQCUAOoAsACAAOwAnQC0AOwAgwCBAO0AlQC0AOoAvQCDACIALAAiAGMAaABhAHIAaQB6ACgBZAAKAQwBeAAOARABEgEUAYAA6wCmAKwA7ACeAJAA" +
  "6wCqAL0AWAAjASUBJwEpASsBcgAtAQsBYQB5ADEBEQETARUBNgE4AToBPAG9AFkAQAFiAGwAYQBzAHQAbwBpAHMAZQAuAQ0BDwFLATQB6gCxALAA6wC2AIEA7ACZAJUAVAFlAGUAZAApAWwAbABeAUoBMwFNAY8A" +
  "hQDsALkAqABmAWsBJAFwAGkAZABnAGUAbwB0AHMBYAF1AYAA7QCUALwA7ACjAKQA7QCIAKwAQAFhAFYBawBhACsBbQCGATIBTAGJAZsAhADrAJQAmABAAXMAbABvAHcAYgByAG8AmgFhARUB7ACVALwA6wCPAJ8B" +
  "ngCAAEABggFuAAwBCQFHAXQBnAHtAIwArADtAIUAtQEkAZYBuAFXAWsAJwFuAKsBiAHsALoApQB5AbQAQAF/AW4AcwBpALoBDAG8ATQB7ACBAJgA7ACCADgBGAHsAKAAwwEiAGcAeQAoAWEAZABvAHMAywGcARQB" +
  "uADrAJ0AsAGyAewAigCkAJMBZQCpAWQAYQBjAHQAeQByAbsBhwG9AZQAhADBAYwA8QG8AEABCgF3AHQAdwCqAUcBMAECAjQB6wCuAKQA7AC4AKAAPwEkAQsCDQIPAgwBSQESAk0BFQIXAqAAUwEkAWEAbQBwAEIB" +
  "6wHtAdoBoACfAaMAoQCjAXQAbQFsAGkAeAAtAhUBFAGVAOwAsgCgAO0AhgD3ASQBcwBjACoBbwDXAV8BmwE0AR0BqwDeAQkCJAFoAPkB/AGpAXMA7AEBAkoCFQHtAJcApAAIAu0AgQCsAOsAoQCcAPUBQgIiAGgA" +
  "bwB1AG4A6gGqATkCiQGXAKwANAFAAf4BcgBhAG4AaQB0ACgBbQLrAKcAiADqALgAZQHyAWQCowFjAGUAcAB0AGkAbABdAVcCrAE1AYIAmADrAKwAtADtAIIAuQBUAVYBegBpAGsAAwF6ArIAiAB5Ad0BvQCUAKMB" +
  "dwAoAnAA+QGFAYsCiAHrAIwAFgGnALEAFwHRASQBuQFkAGUAdgBaAUgC2QE6Ak0BlACUAK4BiACjAWEAVQFlAHkAigLYASECgADqALkAnADJAgcCrwC4AAoCYQB3AIgCxQJJAowCOQF4AbkAmADtAIoAzwInAmcA" +
  "ZwCpAcoBqQKcAesAswAZAfYBYQKcAAgCCgJuAWkAJgEoAm0C7ACaAOQCngCoANACbgBlAP0BKQFjAPECjQBgAo0AlADlArwA2wLdAiIAcwBCAaYC6gHxAoMAjwFfAusAiwCeApUAhABAAWMAKAL5AXUAhgJtAu0A" +
  "jwCtAO0AgwDkAZQBeAIpARYDxgJYAokBjAAHArkAhADsAKECTgFUAXUCZQB0ADQCegKLAA0DwAGOAKsAkwFiAHMAbwAAAiUD1gKVAK8ChgCiArICVgE2AtQCuQIWAZYAjAGdAIwA6gC3ABYBiwCgAMACVgEKAW4A" +
  "hAJ6AuYCewIHAjUD7AJ4AuAC6wFWAj8DqgISAR4DyAK3APABYgKCAiQBVgGHAlcBegLyAe0AiwCwAK4BKwP2AUABbQNpACwC4wITAnEDcwPsAJgAFgJ3AyQBdAJ5AHEAdQCXASQD1QKqAqAAngK/AKAA7ACfAL8C" +
  "bANvAHAAaQJuAHkA8QLhAZYAtABhAq0AtgEoASYBqgFwABoDlQBjArkAnQM3AXUDawMiAGwAdQAVAykBHgKLA+QCowCoANABTgGAA2UCwQKqAVcBbgCmAXoCiACeAoQAFgJqAaADcQHpAUgDxwLsAJcAjwKNA7AC" +
  "6wCTAJwAQAGpAVkBbQBRAmEAdAAxAe0AngCIAAQD6QJAAqAAkAKxAiIA1AOqAaQCBwMxAewAmwCMAOwAiwDqAmIC4APiA9MDhAGqAWYAVALZAw8BigGfAWoD9gHeA/ADhgDhA5EC8wPVA2YAdQLpA/0DlQA1Af8D" +
  "AQTjA+UDmQGmAekDuwCPAdwC3wMABPIDJwJ1AGQAaQC+AzQDXAK2ADUBEANAAWsAeQAIAV0BVQH8AWsASgG4AAEDngCZAF4COwGNAxcEIgAjBCUEbQB3AGgAdwJlANoDmQC9AhgBBAMvBOsAMQQCBLICcgADARsE" +
  "agBhAFcBaADpA6cAFgGaALAAFAHLArUAnQOLAOwDOgFAARoEdQJFAskDJgOgAb0ClQCeAu4DQAFnApUDBwFuAGIAaAJqAjEB6gBTBEEEiADrAKUAvAAgAOsAsgCXAOwAnAPrAIIAnAAgAO0AngG+AYwAQAH4AmMA" +
  "qQF6AG0ABwFsAHQAdALpA5oAuADeA/IB6wDDA14CYAJqA6YAbwR8AiIAfQA="
);


const POKEMON_MULTI_HITS = {"armthrust":[2,5],"barrage":[2,5],"bonemerang":2,"bonerush":[2,5],"bulletseed":[2,5],"cometpunch":[2,5],"doublehit":2,"doubleironbash":2,"doublekick":2,"doubleslap":[2,5],"dragondarts":2,"dualchop":2,"dualwingbeat":2,"furyattack":[2,5],"furyswipes":[2,5],"geargrind":2,"iciclespear":[2,5],"pinmissile":[2,5],"populationbomb":10,"rockblast":[2,5],"scaleshot":[2,5],"spikecannon":[2,5],"surgingstrikes":3,"tachyoncutter":2,"tailslap":[2,5],"tripleaxel":3,"tripledive":3,"triplekick":3,"twinbeam":2,"twineedle":2,"watershuriken":[2,5]};
const POKEMON_WEIGHT_KG = [6.9,13,100,8.5,19,90.5,9,22.5,85.5,2.9,9.9,32,3.2,10,29.5,1.8,30,39.5,3.5,18.5,2,38,6.9,65,6,30,12,29.5,7,20,60,9,19.5,62,7.5,40,9.9,19.9,5.5,12,7.5,55,5.4,8.6,18.6,5.4,29.5,30,12.5,0.8,33.3,4.2,32,19.6,76.6,28,32,19,155,12.4,20,54,19.5,56.5,48,19.5,70.5,130,4,6.4,15.5,45.5,55,20,105,300,30,95,36,78.5,6,60,15,39.2,85.2,90,120,30,30,4,132.5,0.1,0.1,40.5,210,32.4,75.6,6.5,60,10.4,66.6,2.5,120,6.5,45,49.8,50.2,65.5,1,9.5,115,120,34.6,35,80,8,25,15,39,34.5,80,54.5,56,40.6,30,44.5,55,88.4,10,235,220,4,6.5,29,24.5,25,36.5,7.5,35,11.5,40.5,59,460,55.4,52.6,60,3.3,16.5,210,122,4,6.4,15.8,100.5,7.9,19,79.5,9.5,25,88.8,6,32.5,21.2,40.8,10.8,35.6,8.5,33.5,75,12,22.5,2,3,1,1.5,3.2,2,15,7.8,13.3,61.5,5.8,8.5,28.5,38,33.9,0.5,1,3,11.5,1.8,8.5,38,8.5,75,26.5,27,2.1,79.5,1,5,28.5,41.5,7.2,125.8,14,64.8,400,7.8,48.7,3.9,118,20.5,54,28,8.8,125.8,35,55,6.5,55.8,5,12,28.5,16,220,50.5,10.8,35,152,33.5,120,32.5,71.2,58,21,48,6,23.5,21.4,75.5,46.8,178,198,187,72,152,202,216,199,5,5,21.6,52.2,2.5,19.5,52,7.6,28,81.9,13.6,37,17.5,32.5,3.6,10,28.4,11.5,31.6,2.6,32.5,55,4,28,59.6,2.3,19.8,9.5,28,6.6,20.2,48.4,1.7,3.6,4.5,39.2,24,46.5,130.5,5.5,12,1.2,16.3,40.5,84,86.4,253.8,2,97,11,32.6,11,11.5,60,120,360,11.2,31.5,15.2,40.2,4.2,4.2,17.7,17.7,2,10.3,80,20.8,88.8,130,398,24,220,80.4,30.6,71.5,5,15,15.3,82,51.3,77.4,1.2,20.6,40.3,52.5,168,154,1.9,23.6,11.5,32.8,21.5,108,23.8,60.4,12.5,68.2,7.4,162,0.8,22,2.3,12.5,15,30.6,100,1,47,14,16.8,256.5,39.5,87.6,150.6,52.5,27,22.6,23.4,8.7,42.1,110.5,102.6,95.2,202.5,550,230,175,205,40,60,352,950,206.5,1.1,60.8,10.2,97,310,6.2,22,55,5.2,23,84.5,2,15.5,24.9,20,31.5,2.2,25.5,9.5,30.5,42,1.2,14.5,31.5,102.5,57,149.5,3.4,6.5,23.3,5.5,38.5,3.9,29.5,33.5,3.3,9.3,6.3,29.9,20.3,1.2,15,5.5,33.3,4.4,27.3,3.9,43.8,0.6,19.2,38,60.5,187,15,13,24.4,1.9,108,20.5,56,95,105,20.2,54,49.5,300,12,61.5,23,44.4,27,7,24,65,50.5,135.5,34,180,140,282.8,128.6,138.6,68,38,51.5,25.5,25.9,42.5,291,34,52,340,106.6,26.6,0.3,0.3,0.3,0.3,683,336,430,420,750,85.6,3.1,1.4,50.5,2.1,320,4,8.1,16,63,9.9,55.5,150,5.9,24.5,94.6,11.6,27,4.1,14.7,61,10.1,37.5,10.5,30.5,11,28,13.5,29,23.3,60.5,2.1,15,29,29.8,79.5,18,102,260,2.1,10.5,8.5,40.4,31,12.5,40,87,4.5,17,62,55.5,51,2.5,7.3,20.5,5.3,58.5,200.5,0.6,6.6,6.6,16.3,18,15.2,33.4,96.3,37.5,92.9,28,14.5,200,11.8,30,14,1.5,76.5,16.5,81,9.5,32,31,107.3,12.5,81.1,5.8,7.5,5.8,18,44,1,8,20.1,5.5,24.2,5.7,41,57.5,19.5,92.5,5,5.9,33,1,10.5,33,135,31.6,0.6,14.3,18.8,110,21,51,81,0.3,22,80.5,9,34.5,3.1,13,34.3,18,36,105.5,8.5,260,148,7.7,25.3,11,20,35.5,139,92,330,10.2,70,94.6,10.5,41,9,39.5,58,33,17.3,50,160,28.8,46,250,260,200,63,61,330,345,68,325,48.5,6.5,82.5,9,29,90,9.4,14.5,39,7,10.9,40,5,42.4,1.7,16,24.5,2.5,8.4,17,13.5,81.5,0.1,0.9,10,31,91,8,136,28,3.5,8.5,2,4.5,53,0.5,15.5,3.5,5,3.5,47,31,96,7.3,81.5,8.3,35.3,6,21,26,270,25.2,225,23.5,21.5,2.2,5.7,2.8,17.5,150.5,3,7,71,5,12.5,99.5,505,8,85,215,203,305,8.8,9,195,1.5,16,36.6,4.3,25,83,7.5,17.5,44,1.2,14.8,26,6,14.2,4.4,10.5,45,7,180,3.4,0.2,0.5,9.2,25,0.3,8,14.5,110,920,4,82,1.5,18.5,1.5,11.5,4.8,22.2,6.8,135,3.2,8.2,21.4,0.3,76,82.8,12,108,70,250,1.2,120.5,100.5,0.3,19.9,212,3.3,0.7,19,185,210,29.7,47,78.2,20.5,18.6,45.5,21.2,0.1,999.9,230,120,55.5,333.6,25,100,999.9,0.1,888,230,80.5,22.2,1.8,150,820,13,44.5,8,800,5,14,90,4.5,9,33,4,11.5,45.2,2.5,6,1.8,16,75,8,19.5,40.8,8.9,19.9,2.2,2.5,6,43,8.5,115.5,13.5,34,12,78,310.5,0.5,1,13,7.6,65.5,18,1,30,11,40,1,120,4,39,0.2,0.4,3.4,4.8,5.1,5.5,12.5,61,46,28,0.4,117,58.2,66.6,0.3,0.5,62,1,3.8,42,520,89,28,3,100,650,190,150,215,175,40,2,11,50,110,210,950,12,105,70,145,200,800,44.5,7.7,95.1,89,290,110,43,60.5,48,4.1,12.2,31.2,9.8,30.7,326.5,6.1,21.5,61.9,10.2,120,4,16.5,1,17.5,2.5,6.5,41,1.8,2.3,10.9,14.9,6.5,11.9,48.2,2.4,16,105,240,10.5,85,62,0.4,113,3.6,38.6,16,61,0.7,27.2,0.6,6,33,58,79,3,15,1,3.5,1.5,90,8.9,59.1,112.8,1.8,5.4,42.9,60.2,60.2,35,120,63,310,8,45,35,15,37,45,700,90,220,8,56,223,160,39.2,120,320,8,21,4,92,60,240,11,380.7,111,36,303,17,30,210,5,30,74.2,152.2,699.7,4.9,380,35,303,240,280,125,4.4,1.1,2.2,92,12.2,30.1,39.8,60,93,590,480,162.5,156,6.5,0.3];
