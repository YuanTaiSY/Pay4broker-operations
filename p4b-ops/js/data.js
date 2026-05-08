// ============================================================
// data.js — 每月更新此文件中的数据
// 修改 PD (渠道数据) 和 TEAMS (承兑商团队数据)
// ============================================================

// ── DATA ──────────────────────────────────────────────────────
const MLABELS=['2025-09','2025-10','2025-11','2025-12','2026-01','2026-02','2026-03','2026-04','2026-05'];

// Per-platform data: total orders, P4B orders, and top other承兑商
// PD[monthIdx][platform] = {total_c, total_a, p4b_c, p4b_a, others:{name:{c,a}}}
const PD=[
  // 0 = 9月2025
  {DP:{total_c:2785,total_a:20852714,p4b_c:911,p4b_a:8686989,others:{'ChipPay':{c:565,a:1265098},'MyPay (CNY)':{c:134,a:2020709},'TzPay':{c:67,a:1203653},'MyPay 支付宝':{c:45,a:543992},'NowPay':{c:37,a:1063143},'ANXPay':{c:32,a:283339}}},
   CG:{total_c:128,total_a:3035352,p4b_c:34,p4b_a:473907,others:{'MyPay':{c:36,a:1258345},'Exlink':{c:6,a:237620},'Exlink (大額入金)':{c:2,a:999813}}},
   RKX:null,i6:null},
  // 1 = 10月2025
  {DP:{total_c:2486,total_a:19514279,p4b_c:814,p4b_a:8548428,others:{'ChipPay':{c:1055,a:2733821},'MyPay (CNY)':{c:155,a:1077980},'ANXPay':{c:75,a:580319},'MyPay 支付宝':{c:74,a:943161},'Exlink':{c:44,a:1436846}}},
   CG:{total_c:98,total_a:1366936,p4b_c:47,p4b_a:524931,others:{'MyPay':{c:17,a:453448},'Exlink':{c:5,a:76980}}},
   RKX:null,i6:null},
  // 2 = 11月2025
  {DP:{total_c:2735,total_a:23786098,p4b_c:682,p4b_a:8627675,others:{'ChipPay':{c:1581,a:3139589},'MyPay ()':{c:80,a:608698},'MyPay 支付宝':{c:76,a:944047},'ANXPay':{c:27,a:238418},'Exlink':{c:21,a:402383}}},
   CG:{total_c:50,total_a:1147559,p4b_c:21,p4b_a:173701,others:{'MyPay':{c:19,a:423097},'Exlink':{c:4,a:14290},'Exlink (大額入金)':{c:2,a:486436}}},
   RKX:null,i6:null},
  // 3 = 12月2025
  {DP:{total_c:2166,total_a:16095119,p4b_c:0,p4b_a:0,others:{'ChipPay':{c:1340,a:2271778},'MyPay ()':{c:143,a:1621890},'MyPay 支付宝':{c:81,a:1027933},'FlashPay':{c:36,a:77794},'NowPay':{c:30,a:717399}}},
   CG:{total_c:50,total_a:688509,p4b_c:27,p4b_a:373653,others:{'Exlink':{c:11,a:88518},'MyPay':{c:6,a:125779}}},
   RKX:null,i6:null},
  // 4 = 1月2026
  {DP:{total_c:2727,total_a:24272965,p4b_c:0,p4b_a:0,others:{'ChipPay':{c:1442,a:2657589},'MyPay ()':{c:94,a:1083249},'ANXPay':{c:86,a:686673},'MyPay 支付宝':{c:46,a:583055},'Exlink':{c:45,a:1195825}}},
   CG:{total_c:99,total_a:3088229,p4b_c:44,p4b_a:676556,others:{'Exlink':{c:27,a:392415},'MyPay':{c:17,a:220686},'Exlink (大額入金)':{c:2,a:1686166}}},
   RKX:null,i6:null},
  // 5 = 2月2026
  {DP:{total_c:6167,total_a:41936581,p4b_c:167,p4b_a:2221595,others:{'Chippay -支付宝':{c:2792,a:6498472},'ChipPay':{c:1410,a:3850961},'FlashPay':{c:126,a:224153},'ANXPay':{c:67,a:504447},'Exlink':{c:67,a:1663574}}},
   CG:{total_c:197,total_a:6227290,p4b_c:60,p4b_a:1225975,others:{'MyPay':{c:26,a:359005},'Exlink':{c:24,a:252391},'Exlink (大額入金)':{c:3,a:2794530}}},
   RKX:null,i6:null},
  // 6 = 3月2026
  {DP:{total_c:2868,total_a:18964292,p4b_c:83,p4b_a:1108176,others:{'Chippay -支付宝':{c:1260,a:3193927},'ChipPay':{c:796,a:2514393},'FlashPay':{c:82,a:107643},'Exlink':{c:31,a:642426},'ANXPay':{c:11,a:73241}}},
   CG:{total_c:56,total_a:1056513,p4b_c:12,p4b_a:178014,others:{'Exlink':{c:16,a:129673},'MyPay':{c:11,a:154928}}},
   RKX:null,i6:null},
  // 7 = 4月2026
  {DP:{total_c:3544,total_a:25200812,p4b_c:0,p4b_a:0,others:{'Chippay -支付宝':{c:1504,a:3695284},'ChipPay':{c:715,a:1636618},'NowPay':{c:44,a:547194},'Exlink':{c:22,a:493401},'MyPay 支付宝':{c:18,a:416606}}},
   CG:{total_c:135,total_a:2835861,p4b_c:41,p4b_a:855824,others:{'Exlink':{c:21,a:261725},'MyPay':{c:15,a:189767}}},
   RKX:{total_c:53,total_a:743988,p4b_c:7,p4b_a:96845,others:{}},
   i6:{total_c:16,total_a:296640,p4b_c:0,p4b_a:0,others:{'BFT - Exlink':{c:10,a:142010}}}},
  // 8 = 5月2026
  {DP:{total_c:3419,total_a:26445098,p4b_c:0,p4b_a:0,others:{'Chippay -支付宝':{c:1525,a:4313373},'ChipPay':{c:587,a:1576067},'EasyOtc':{c:52,a:365944},'NowPay':{c:46,a:373483},'MyPay 支付宝':{c:12,a:222168}}},
   CG:{total_c:142,total_a:4080688,p4b_c:6,p4b_a:110815,others:{'Exlink':{c:25,a:165700},'MyPay':{c:18,a:190973}}},
   RKX:{total_c:139,total_a:1109720,p4b_c:0,p4b_a:0,others:{}},
   i6:{total_c:18,total_a:97559,p4b_c:0,p4b_a:0,others:{}}},
];

const TEAMS={
  6:{teams:[
    {n:'J-冯总',           c:335, a:9069082},
    {n:'J-景总 （小额）',  c:61,  a:260656},
    {n:'星火-2队',         c:43,  a:954418},
    {n:'J-新疆-冯总',     c:16,  a:265365},
    {n:'J-Allen',         c:9,   a:152718},
    {n:'星火XJ-1队',      c:8,   a:139135},
    {n:'星火XJ-2队',      c:8,   a:62347},
    {n:'FJJ-B18583825',   c:7,   a:421163},
    {n:'星火-1队',        c:7,   a:66425},
    {n:'J-杨总',          c:4,   a:73388},
    {n:'J-景总',          c:3,   a:26377},
    {n:'J-杨总2',         c:1,   a:34581},
  ]},
  7:{teams:[
    {n:'J-冯总',           c:339, a:11832239},
    {n:'J-冯总 （小额）',  c:217, a:915322},
    {n:'J-景总 （小额）',  c:136, a:676373},
    {n:'星火-2队',         c:48,  a:821016},
    {n:'J-Allen（小额）',  c:24,  a:98007},
    {n:'J-新疆-冯总',     c:20,  a:691090},
    {n:'J-Allen',         c:19,  a:482124},
    {n:'J-Sky总',         c:16,  a:0},
    {n:'星火XJ-2队',      c:14,  a:81460},
    {n:'J-景总',          c:13,  a:733734},
    {n:'星火XJ-1队',      c:13,  a:78492},
    {n:'星火1-1队',       c:11,  a:220073},
    {n:'J-杨总',          c:8,   a:62293},
    {n:'FJJ-B18583825',   c:7,   a:782985},
  ]},
  8:{teams:[
    {n:'J-冯总',           c:422, a:14507855},
    {n:'J-冯总 （小额）',  c:357, a:1569249},
    {n:'J-Sky总',         c:48,  a:0},
    {n:'J-新疆-冯总',     c:43,  a:864678},
    {n:'J-景总 （小额）',  c:40,  a:198102},
    {n:'星火-2队',         c:27,  a:688860},
    {n:'星火XJ-2队',      c:13,  a:64693},
    {n:'星火XJ-1队',      c:11,  a:109579},
    {n:'J-景总',          c:11,  a:758060},
    {n:'J-Allen',         c:9,   a:197341},
    {n:'FJJ-B18583825',   c:8,   a:1163137},
    {n:'星火1-1队',       c:4,   a:321563},
    {n:'J-杨总2',         c:3,   a:29187},
    {n:'J-杨总',          c:2,   a:34516},
  ]},
};
const COLORS=['#2563eb','#059669','#d97706','#dc2626','#7c3aed','#0891b2','#be185d','#65a30d','#ea580c','#6366f1','#a3a3a3'];
let currentPlat='DP';


// ── STATE ─────────────────────────────────────────────────────
let deposits=[],handovers=[],frozen=[],hcFilter='',frFilter='';