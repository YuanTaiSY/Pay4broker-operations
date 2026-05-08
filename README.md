# Pay4Broker 运营管理系统

## 项目结构

```
p4b-ops/
├── index.html          主页面
├── css/
│   └── style.css       所有样式
├── js/
│   ├── data.js         ⭐ 每月更新数据在这里
│   └── app.js          主逻辑（通常不需要改）
└── README.md
```

## 每月更新数据

只需修改 `js/data.js` 文件：

### 1. 更新渠道数据 (PD 数组)
每个月份是 PD 数组的一项，包含各平台（DP/CG/RKX/6i）的：
- `total_c` — 总笔数
- `total_a` — 总金额 (CNY)
- `p4b_c` — P4B 笔数
- `p4b_a` — P4B 金额
- `others` — 其他承兑商数据

### 2. 更新承兑商团队数据 (TEAMS)
Key 对应月份 index（0=9月2025, 1=10月2025 ... 8=5月2026）
每个团队有 `n`(名称), `c`(笔数), `a`(金额)

### 3. 更新竞争对手趋势 (COMP_DATA)
DP 和 CG 渠道内各承兑商的月度笔数，用于趋势对比图

## 部署到 GitHub Pages

1. Push 到 GitHub
2. Settings → Pages → Branch: main → Save
3. 访问 `https://用户名.github.io/p4b-ops`

## 添加新月份

在 Cursor 里用这个 prompt：

```
在 js/data.js 的 PD 数组末尾添加新月份数据：
月份：2026年6月
DP: total_c=XXX, total_a=XXX, p4b_c=XXX, p4b_a=XXX
CG: total_c=XXX, ...
同时更新 MLABELS, COMP_DATA, 和下拉选单
```
