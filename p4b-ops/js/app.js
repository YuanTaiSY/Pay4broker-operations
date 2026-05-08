// ============================================================
// app.js — 主逻辑，通常不需要修改
// ============================================================

// ── NAV ───────────────────────────────────────────────────────
function switchPage(id){
  document.querySelectorAll('.nav-tab').forEach((t,i)=>t.classList.toggle('active',['orders','deposit','handover','frozen'][i]===id));
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  if(id==='orders') setTimeout(updateOrderPage,80);
}

// ── MODAL ─────────────────────────────────────────────────────
function openModal(id){document.getElementById(id).classList.add('open');const di=id==='dep-modal'?'dm-date':id==='hc-modal'?'hm-date':'fm-date';document.getElementById(di)&&(document.getElementById(di).value=tod());}
function closeModal(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.modal-overlay').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')}));
function tod(){return new Date().toISOString().slice(0,10);}

// ── HELPERS ───────────────────────────────────────────────────
function fmt(n){if(!n)return '0';return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(0)+'K':Math.round(n).toString();}
function fmtN(n){return(n||0).toLocaleString();}
function pct(a,b){if(!b||!a)return '';const v=(a-b)/b*100;return(v>=0?'↑ ':'↓ ')+Math.abs(v).toFixed(1)+'%';}
function pcls(a,b){return a>=b?'up':'down';}
function set(id,v){const e=document.getElementById(id);if(e)e.textContent=v;}

// ── ORDER PAGE ────────────────────────────────────────────────
function updateOrderPage(){
  const idx=parseInt(document.getElementById('month-select').value);
  const d=PD[idx], dp=idx>0?PD[idx-1]:null;

  // Total across all platforms
  const tc=['DP','CG','RKX','i6'].reduce((s,k)=>s+(d[k]?.total_c||0),0);
  const ta=['DP','CG','RKX','i6'].reduce((s,k)=>s+(d[k]?.total_a||0),0);
  const ptc=dp?['DP','CG','RKX','i6'].reduce((s,k)=>s+(dp[k]?.total_c||0),0):0;
  const pta=dp?['DP','CG','RKX','i6'].reduce((s,k)=>s+(dp[k]?.total_a||0),0):0;

  // P4B total across all platforms this month
  const p4bC=['DP','CG','RKX','i6'].reduce((s,k)=>s+(d[k]?.p4b_c||0),0);
  const p4bA=['DP','CG','RKX','i6'].reduce((s,k)=>s+(d[k]?.p4b_a||0),0);

  set('om-tc',fmtN(tc));set('om-ta',fmt(ta));
  const cTc=document.getElementById('om-tc-chg');
  if(dp&&cTc){cTc.textContent=pct(tc,ptc)+' vs 上月';cTc.className='metric-sub '+pcls(tc,ptc);}
  const cTa=document.getElementById('om-ta-chg');
  if(dp&&cTa){cTa.textContent=pct(ta,pta)+' vs 上月';cTa.className='metric-sub '+pcls(ta,pta);}
  set('om-pc',fmtN(p4bC));
  set('om-pc-pct','跨所有商户 '+(tc?p4bC/tc*100:0).toFixed(1)+'%');
  set('om-pa',fmt(p4bA));
  set('om-pa-pct','跨所有商户 '+(ta?p4bA/ta*100:0).toFixed(1)+'%');

  const allP4bA=PD.map(m=>['DP','CG','RKX','i6'].reduce((s,k)=>s+(m[k]?.p4b_a||0),0)).filter(v=>v>0);
  set('om-avg',fmt(allP4bA.reduce((a,b)=>a+b,0)/allP4bA.length));

  renderPlatPie(idx);
  renderTrends(idx);
  renderTeamBars(idx);
  renderOrderTable();
}

function selectPlat(plat,el){
  currentPlat=plat;
  document.querySelectorAll('#plat-chips .chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  const idx=parseInt(document.getElementById('month-select').value);
  renderPlatPie(idx);
}

function renderPlatPie(idx){
  const d=PD[idx];
  const platData=d[currentPlat];
  if(!platData){
    ['pie-plat-c','pie-plat-a'].forEach(id=>{
      if(window['_p'+id])window['_p'+id].destroy();
    });
    document.getElementById('leg-plat-c').innerHTML='<div style="color:var(--text3);font-size:12px;padding:20px 0">该月暂无此商户数据</div>';
    document.getElementById('leg-plat-a').innerHTML='';
    // Clear trend
    if(window._tPlatPct)window._tPlatPct.destroy();
    return;
  }

  const others=platData.others||{};
  // Build labels+data: P4B first, then others sorted by count, group rest as 其他
  const otherEntries=Object.entries(others).sort((a,b)=>b[1].c-a[1].c);
  const topOthers=otherEntries.slice(0,5);
  const restC=otherEntries.slice(5).reduce((s,[,v])=>s+v.c,0);
  const restA=otherEntries.slice(5).reduce((s,[,v])=>s+v.a,0);

  const labels=['Pay4Broker',...topOthers.map(([n])=>n),...(restC>0?['其他']:[])]
  const counts=[platData.p4b_c,...topOthers.map(([,v])=>v.c),...(restC>0?[restC]:[])]
  const amts=[platData.p4b_a,...topOthers.map(([,v])=>v.a),...(restA>0?[restA]:[])]
  const colors=['#7c3aed',...COLORS.filter(c=>c!=='#7c3aed').slice(0,labels.length-1)];

  const tc=platData.total_c||1;
  const ta=platData.total_a||1;
  drawPie('pie-plat-c','_ppC',labels,counts,tc,'leg-plat-c',colors);
  drawPie('pie-plat-a','_ppA',labels,amts,ta,'leg-plat-a',colors);

  // Trend: P4B % in this platform over months
  const trendPcts=PD.map(m=>{
    const pd=m[currentPlat];
    if(!pd||!pd.total_c)return null;
    return +(pd.p4b_c/pd.total_c*100).toFixed(1);
  });
  const trendLabels=MLABELS.map((m,i)=>trendPcts[i]!==null?m:null).filter(Boolean);
  const trendVals=trendPcts.filter(v=>v!==null);
  const trendLabelsFull=MLABELS;

  if(window._tPlatPct)window._tPlatPct.destroy();
  window._tPlatPct=new Chart(document.getElementById('trend-plat-pct'),{
    type:'line',
    data:{labels:MLABELS,datasets:[{
      label:'P4B 占比%',
      data:trendPcts,
      borderColor:'#7c3aed',backgroundColor:'rgba(124,58,237,.1)',
      tension:.35,fill:true,pointRadius:4,pointBackgroundColor:'#7c3aed',
      spanGaps:false
    }]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.parsed.y!==null?`P4B 占比: ${ctx.parsed.y}%`:''}}},
      scales:{x:{ticks:{color:'#9ba3b8',font:{size:10}},grid:{color:'rgba(0,0,0,.04)'}},
        y:{min:0,max:100,ticks:{color:'#9ba3b8',font:{size:10},callback:v=>v+'%'},grid:{color:'rgba(0,0,0,.05)'}}}}
  });
}

function drawPie(cid,sk,labels,data,total,legId,colors){
  colors=colors||COLORS;
  if(window[sk])window[sk].destroy();
  const nz=data.map((v,i)=>({v,l:labels[i],c:colors[i%colors.length]})).filter(x=>x.v>0);
  window[sk]=new Chart(document.getElementById(cid),{
    type:'doughnut',
    data:{labels:nz.map(x=>x.l),datasets:[{data:nz.map(x=>x.v),backgroundColor:nz.map(x=>x.c),borderWidth:2,borderColor:'#fff',hoverOffset:4}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'62%',plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`${ctx.label}: ${ctx.parsed.toLocaleString()} (${total?(ctx.parsed/total*100).toFixed(1):0}%)`}}}}
  });
  document.getElementById(legId).innerHTML=nz.map(x=>`
    <div class="pie-legend-item">
      <div class="pie-dot" style="background:${x.c}"></div>
      <span class="pie-legend-label">${x.l}</span>
      <span class="pie-legend-val">${total?(x.v/total*100).toFixed(1):0}%</span>
    </div>`).join('');
}

// Competitor monthly data per platform (笔数)
const COMP_DATA={
  DP:{
    'Pay4Broker':  [911,814,682,  0,  0,167, 83,  0,  0],
    'ChipPay':     [565,1055,1581,1340,1442,4202,2056,2219,2112],
    'MyPay':       [179,229,156,224,140, 45,  2, 18, 22],
    'Exlink':      [  5, 45, 24, 15, 45, 67, 31, 22,  4],
    'ANXPay':      [ 32, 75, 27, 23, 86, 67, 11,  5,  4],
    'NowPay':      [ 37,  0, 12, 30,  0,  0,  0, 44, 46],
    'FlashPay':    [  0,  0,  0, 36,  0,126, 82,  0,  0],
    'EasyOtc':     [  0,  0,  0,  0,  0,  0,  0,  0, 52],
    'TzPay':       [ 67,  8,  0,  0,  0,  0,  0,  0,  0],
  },
  CG:{
    'Pay4Broker':  [34,47,21,27,44,60,12,41, 6],
    'MyPay':       [36,17,19, 6,17,26,11,15,18],
    'Exlink':      [ 8, 5, 6,11,29,27,16,21,25],
  },
};

function renderTrends(){
  const opts={responsive:true,maintainAspectRatio:false,
    plugins:{legend:{position:'bottom',labels:{font:{size:11},boxWidth:10,padding:10}}},
    scales:{x:{ticks:{color:'#9ba3b8',font:{size:10}},grid:{color:'rgba(0,0,0,.04)'}},
      y:{ticks:{color:'#9ba3b8',font:{size:10},callback:v=>fmt(v)},grid:{color:'rgba(0,0,0,.05)'}}}};

  // LEFT chart: DP承兑商对比 — each line is one承兑商 in DP
  const dpColors={'Pay4Broker':'#7c3aed','ChipPay':'#2563eb','MyPay':'#059669',
    'Exlink':'#d97706','ANXPay':'#dc2626','NowPay':'#0891b2','FlashPay':'#be185d','EasyOtc':'#65a30d','TzPay':'#94a3b8'};
  const dpDs=Object.entries(COMP_DATA.DP).map(([name,data])=>({
    label:name,
    data:data.map(v=>v||null),
    borderColor:dpColors[name]||'#94a3b8',
    backgroundColor:(dpColors[name]||'#94a3b8')+'22',
    tension:.35,fill:false,pointRadius:3,borderWidth:name==='Pay4Broker'?3:1.5,
    borderDash:name==='Pay4Broker'?[]:[4,3],
    spanGaps:false,
  }));

  if(window._tC)window._tC.destroy();
  window._tC=new Chart(document.getElementById('trend-c'),{
    type:'line',
    data:{labels:MLABELS,datasets:dpDs},
    options:{...JSON.parse(JSON.stringify(opts)),
      plugins:{...opts.plugins,
        title:{display:true,text:'Doo Prime 渠道内各承兑商笔数对比',font:{size:12},color:'#5a6178',padding:{bottom:8}},
        tooltip:{callbacks:{label:ctx=>ctx.parsed.y!==null?`${ctx.dataset.label}: ${ctx.parsed.y}笔`:''}}
      }}
  });

  // RIGHT chart: CG承兑商对比
  const cgColors={'Pay4Broker':'#7c3aed','MyPay':'#059669','Exlink':'#d97706'};
  const cgDs=Object.entries(COMP_DATA.CG).map(([name,data])=>({
    label:name,
    data:data,
    borderColor:cgColors[name]||'#94a3b8',
    backgroundColor:(cgColors[name]||'#94a3b8')+'22',
    tension:.35,fill:false,pointRadius:3,borderWidth:name==='Pay4Broker'?3:1.5,
    borderDash:name==='Pay4Broker'?[]:[4,3],
  }));

  if(window._tA)window._tA.destroy();
  window._tA=new Chart(document.getElementById('trend-a'),{
    type:'line',
    data:{labels:MLABELS,datasets:cgDs},
    options:{...JSON.parse(JSON.stringify(opts)),
      plugins:{...opts.plugins,
        title:{display:true,text:'CG Trade 渠道内各承兑商笔数对比',font:{size:12},color:'#5a6178',padding:{bottom:8}},
        tooltip:{callbacks:{label:ctx=>`${ctx.dataset.label}: ${ctx.parsed.y}笔`}}
      }}
  });
}

function renderTeamBars(idx){
  const teamKeys=Object.keys(TEAMS).map(Number).sort((a,b)=>a-b);
  const bestKey=teamKeys.reduce((prev,cur)=>Math.abs(cur-idx)<Math.abs(prev-idx)?cur:prev,teamKeys[teamKeys.length-1]);
  const td=TEAMS[idx]||TEAMS[bestKey];
  const tms=td.teams;
  const ttC=tms.reduce((a,t)=>a+t.c,0);
  const ttA=tms.filter(t=>t.a>0).reduce((a,t)=>a+t.a,0);
  document.getElementById('team-bars-c').innerHTML=tms.map((t,i)=>`
    <div class="bar-row">
      <div class="bar-label" title="${t.n}">${t.n}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${(t.c/ttC*100).toFixed(1)}%;background:${COLORS[i%COLORS.length]}"></div></div>
      <div class="bar-val">${(t.c/ttC*100).toFixed(1)}%</div>
    </div>`).join('');
  document.getElementById('team-bars-a').innerHTML=tms.filter(t=>t.a>0).sort((a,b)=>b.a-a.a).map((t,i)=>`
    <div class="bar-row">
      <div class="bar-label" title="${t.n}">${t.n}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${(t.a/ttA*100).toFixed(1)}%;background:${COLORS[i%COLORS.length]}"></div></div>
      <div class="bar-val">${(t.a/ttA*100).toFixed(1)}%</div>
    </div>`).join('');
}

function renderOrderTable(){
  document.getElementById('o-tbody').innerHTML=PD.map((d,i)=>{
    const pBadge=(plat)=>{
      const pd=d[plat];if(!pd)return '<td style="color:var(--text3)">—</td><td>—</td>';
      const share=(pd.p4b_c/pd.total_c*100).toFixed(1);
      const cls=parseFloat(share)>=30?'b-green':parseFloat(share)>=15?'b-blue':'b-gray';
      return `<td style="font-family:var(--mono)">${fmtN(pd.total_c)}</td><td><span class="badge ${cls}">${share}%</span></td>`;
    };
    const p4bTotal=['DP','CG','RKX','i6'].reduce((s,k)=>s+(d[k]?.p4b_c||0),0);
    const p4bAmt=['DP','CG','RKX','i6'].reduce((s,k)=>s+(d[k]?.p4b_a||0),0);
    const prev=i>0?PD[i-1]:null;
    const prevAmt=prev?['DP','CG','RKX','i6'].reduce((s,k)=>s+(prev[k]?.p4b_a||0),0):0;
    const chgStr=prev?pct(p4bAmt,prevAmt):'';
    const cc=prev?(p4bAmt>=prevAmt?'color:var(--green)':'color:var(--red)'):'';
    return `<tr>
      <td style="font-weight:600;white-space:nowrap">${MLABELS[i]}</td>
      ${pBadge('DP')}${pBadge('CG')}${pBadge('RKX')}${pBadge('6i')}
      <td style="font-weight:600;color:var(--accent);font-family:var(--mono)">${fmtN(p4bTotal)}</td>
      <td style="font-family:var(--mono)">${fmtN(p4bAmt)}</td>
      <td style="font-family:var(--mono);${cc}">${chgStr}</td>
    </tr>`;
  }).join('');
}

// ── FEE CALC ──────────────────────────────────────────────────
function calcFee(){
  const disc=parseFloat(document.getElementById('fee-team').value)||1;
  const p4b=parseFloat(document.getElementById('fee-p4b').value)||0;
  const okx=parseFloat(document.getElementById('fee-okx').value)||0;
  const amt=parseFloat(document.getElementById('fee-amount').value)||0;
  if(p4b<=okx||p4b<=0){
    set('fr-rate','0%');set('fr-eff',p4b.toFixed(4));set('fr-recv',amt.toLocaleString()+' U');set('fr-fee-amt','0 U');
    document.getElementById('fee-notice').innerHTML='<strong>无需收取手续费</strong>，当前兑入汇率优于或等于买币汇率。';return;
  }
  const diff=(p4b-okx)*disc;
  const rate=diff/p4b;
  const eff=p4b*(1-rate);
  const recv=amt*(1-rate);
  set('fr-rate',(rate*100).toFixed(4)+'%');
  set('fr-eff',eff.toFixed(5));
  set('fr-recv',recv.toLocaleString(undefined,{maximumFractionDigits:2})+' USDT');
  set('fr-fee-amt',(amt*rate).toLocaleString(undefined,{maximumFractionDigits:2})+' USDT');
  document.getElementById('fee-notice').innerHTML=`您好，充币渠道已开启，目前充币将收取 <strong>${(rate*100).toFixed(2)}%</strong> 手续费以补汇率差（例：${p4b.toFixed(2)} × ${(1-rate).toFixed(5)} = ${eff.toFixed(5)}）${amt?`；${amt.toLocaleString()} USDT → 实际到账约 <strong>${recv.toFixed(2)} USDT</strong>`:''}`;
}
calcFee();

// ── DEPOSIT ───────────────────────────────────────────────────
function autoRecv(){
  const a=parseFloat(document.getElementById('dm-in').value)||0;
  const f=parseFloat(document.getElementById('dm-fr').value)||0;
  document.getElementById('dm-recv').value=(a*(1-f)).toFixed(2);
}
function loadDepositExcel(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const wb=XLSX.read(e.target.result,{type:'array',cellDates:true});
      let allRows=[];
      // Read ALL sheets - file has 2025 and 2026 sheets
      wb.SheetNames.forEach(sheetName=>{
        if(sheetName.includes('不用'))return; // skip irrelevant sheets
        const ws=wb.Sheets[sheetName];
        const data=XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:''});
        // Find header row
        let hr=-1;
        for(let i=0;i<data.length;i++){
          const v=String(data[i][0]||'');
          if(v.includes('日期')||v.includes('DATE')||v.toLowerCase().includes('column1')){hr=i;break;}
        }
        const rows=data.slice(hr<0?1:hr+1);
        rows.forEach(r=>{
          // Must have order number (col 3)
          if(!String(r[3]||'').trim())return;
          allRows.push({
            date:    fmtExcelDate(r[0]),
            time:    String(r[1]||'').trim(),
            accountId: String(r[2]||'').trim(),
            orderId: String(r[3]||'').trim(),
            wallet:  String(r[4]||'').trim(),
            type:    String(r[5]||'TRC20').trim()||'TRC20',
            inAmt:   parseFloat(String(r[6]||'').replace(/[^0-9.]/g,''))||0,
            hash:    String(r[7]||'').trim(),
            recvAmt: parseFloat(String(r[8]||'').replace(/[^0-9.]/g,''))||0,
            pic:     String(r[9]||'').trim(),
            remark:  String(r[10]||'').trim(),
            feeRate: parseFloat(String(r[11]||'').replace(/[^0-9.]/g,''))||0,
          });
        });
      });
      // Sort by date desc
      allRows.sort((a,b)=>b.date.localeCompare(a.date));
      deposits=allRows;
      renderDeposit();
      alert(`✅ 成功导入 ${deposits.length} 条充币记录（含所有年份 sheet）`);
    }catch(err){alert('解析失败：'+err.message);}
  };
  reader.readAsArrayBuffer(file);
}
function renderDeposit(){
  const s=document.getElementById('dep-search').value.toLowerCase();
  const t=document.getElementById('dep-type').value;
  const p=document.getElementById('dep-pic').value;
  const data=deposits.filter(d=>{
    if(s&&!d.orderId.toLowerCase().includes(s)&&!d.accountId.toLowerCase().includes(s))return false;
    if(t&&d.type!==t)return false;if(p&&d.pic!==p)return false;return true;
  });
  document.getElementById('dep-empty').style.display=data.length?'none':'block';
  document.getElementById('dep-body').innerHTML=data.map(d=>`<tr>
    <td style="font-family:var(--mono);font-size:12px;white-space:nowrap">${d.date}</td>
    <td style="font-family:var(--mono);font-size:11px;color:var(--text3)">${d.time}</td>
    <td style="font-family:var(--mono);font-size:12px">${d.accountId}</td>
    <td style="font-size:11px;font-family:var(--mono);max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${d.orderId}</td>
    <td><span class="badge ${d.type==='TRC20'?'b-blue':'b-green'}">${d.type}</span></td>
    <td style="font-family:var(--mono)">${fmtN(d.inAmt)}</td>
    <td style="font-family:var(--mono)">${fmtN(d.recvAmt)}</td>
    <td><span class="badge b-gray">${d.feeRate?(d.feeRate*100).toFixed(2)+'%':'—'}</span></td>
    <td>${d.pic}</td>
    <td><span class="hash" title="${d.hash}" onclick="navigator.clipboard&&navigator.clipboard.writeText('${d.hash}').then(()=>alert('已复制哈希值'))">${d.hash?d.hash.slice(0,14)+'…':''}</span></td>
    <td style="font-size:12px;color:var(--text2);max-width:120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d.remark||''}</td>
    <td><button class="btn btn-sm btn-danger" onclick="deposits.splice(${deposits.indexOf(d)},1);renderDeposit()">删</button></td>
  </tr>`).join('');
  const tIn=data.reduce((a,d)=>a+d.inAmt,0);
  const tRv=data.reduce((a,d)=>a+d.recvAmt,0);
  set('dm-count',data.length.toLocaleString());
  set('dm-in',tIn.toLocaleString(undefined,{maximumFractionDigits:0}));
  set('dm-recv',tRv.toLocaleString(undefined,{maximumFractionDigits:0}));
  const fs=data.filter(d=>d.feeRate);
  set('dm-fee',fs.length?(fs.reduce((a,d)=>a+d.feeRate,0)/fs.length*100).toFixed(2)+'%':'—');
}
function saveDeposit(){
  deposits.unshift({date:document.getElementById('dm-date').value,time:document.getElementById('dm-time').value,accountId:document.getElementById('dm-id').value,orderId:document.getElementById('dm-order').value,type:document.getElementById('dm-type').value,inAmt:parseFloat(document.getElementById('dm-in').value)||0,recvAmt:parseFloat(document.getElementById('dm-recv').value)||0,feeRate:parseFloat(document.getElementById('dm-fr').value)||0,pic:document.getElementById('dm-pic').value,wallet:document.getElementById('dm-wallet').value,hash:document.getElementById('dm-hash').value,remark:document.getElementById('dm-remark').value});
  renderDeposit();closeModal('dep-modal');
}
function exportDeposit(){dlCSV([['日期','时间','账户ID','订单号','类型','入金USDT','到账USDT','手续费率','审批人','哈希','备注'],...deposits.map(d=>[d.date,d.time,d.accountId,d.orderId,d.type,d.inAmt,d.recvAmt,d.feeRate,d.pic,d.hash,d.remark])],'充币记录.csv');}

// ── HANDOVER ──────────────────────────────────────────────────
function loadHCExcel(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const wb=XLSX.read(e.target.result,{type:'array',cellDates:true});
      let allRows=[];
      // Read ALL sheets - each sheet is a month
      wb.SheetNames.forEach(sheetName=>{
        const ws=wb.Sheets[sheetName];
        const data=XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:''});
        // Find header row in this sheet
        let hr=-1;
        for(let i=0;i<data.length;i++){
          const v=String(data[i][0]||'');
          if(v.includes('日期')||v.includes('DATE')){hr=i;break;}
        }
        const rows=data.slice(hr<0?1:hr+1);
        rows.forEach(r=>{
          const c0=String(r[0]||'').trim();
          const c2=String(r[2]||'').trim();
          if(c0===''&&c2==='')return; // skip empty rows
          allRows.push({
            date: fmtExcelDate(r[0]),
            type: String(r[1]||'').trim(),
            orderId: String(r[2]||'').trim(),
            progress: String(r[3]||'').trim(),
            next: String(r[4]||'').trim(),
            priority: String(r[5]||'低').trim()||'低',
            status: String(r[6]||'').trim(),
            extra: String(r[7]||'').trim(),
            email: String(r[8]||'').trim(),
            _sheet: sheetName,
          });
        });
      });
      handovers=allRows;
      renderHC();updateHCM();
      alert(`✅ 成功导入 ${handovers.length} 条 Handover Cases（共 ${wb.SheetNames.length} 个月份 sheet）`);
    }catch(err){alert('解析失败：'+err.message);}
  };
  reader.readAsArrayBuffer(file);
}
function renderHC(){
  const s=document.getElementById('hc-search').value.toLowerCase();
  const mf=document.getElementById('hc-month')?.value||'';
  const data=handovers.filter(h=>{
    if(hcFilter==='__high')return h.priority==='高';
    if(hcFilter&&!h.status.includes(hcFilter))return false;
    if(mf&&!h.date.startsWith(mf))return false;
    if(s&&!h.orderId.toLowerCase().includes(s)&&!h.type.toLowerCase().includes(s)&&!h.progress.toLowerCase().includes(s))return false;
    return true;
  });
  document.getElementById('hc-empty').style.display=data.length?'none':'block';
  document.getElementById('hc-body').innerHTML=data.map(h=>`<tr>
    <td style="font-family:var(--mono);font-size:12px;white-space:nowrap">${h.date}</td>
    <td style="max-width:220px;font-size:12px">${h.type}</td>
    <td style="font-size:11px;font-family:var(--mono);max-width:160px;word-break:break-all">${h.orderId}</td>
    <td style="max-width:180px;font-size:12px;color:var(--text2)">${h.progress}</td>
    <td style="max-width:160px;font-size:12px;color:var(--text2)">${h.next}</td>
    <td>${priBadge(h.priority)}</td>
    <td>${statusBadge(h.status)}</td>
    <td style="font-size:11px;color:var(--text3);max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h.email||''}</td>
    <td style="white-space:nowrap">
      <select class="btn btn-sm" style="padding:3px 6px;font-size:11px;width:auto" onchange="handovers[${handovers.indexOf(h)}].status=this.value;renderHC();updateHCM()">
        <option ${h.status.includes('等待')?'selected':''}>等待中</option>
        <option ${h.status.includes('进行')?'selected':''}>进行中</option>
        <option ${h.status.includes('完成')?'selected':''}>已完成</option>
        <option ${h.status.includes('搁置')?'selected':''}>搁置（超过一个月客户/销售没回复）</option>
      </select>
    </td>
  </tr>`).join('');
}
function filterHC(f,el){hcFilter=f;document.querySelectorAll('#hc-chips .chip').forEach(c=>c.classList.remove('active'));el.classList.add('active');renderHC();}
function updateHCM(){
  const done=handovers.filter(h=>h.status.includes('完成')).length;
  set('hm-total',handovers.length);set('hm-done',done);
  set('hm-rate',handovers.length?'完成率 '+Math.round(done/handovers.length*100)+'%':'');
  set('hm-prog',handovers.filter(h=>h.status.includes('进行')).length);
  set('hm-wait',handovers.filter(h=>h.status.includes('等待')).length);
  set('hm-shelved',handovers.filter(h=>h.status.includes('搁置')).length);
}
function saveHC(){
  handovers.unshift({date:document.getElementById('hm-date').value,type:document.getElementById('hm-type').value,orderId:document.getElementById('hm-order').value,progress:document.getElementById('hm-prog').value,next:document.getElementById('hm-next').value,priority:document.getElementById('hm-pri').value,status:document.getElementById('hm-status').value,email:document.getElementById('hm-email').value,extra:document.getElementById('hm-extra').value});
  renderHC();updateHCM();closeModal('hc-modal');
}
function exportHC(){dlCSV([['日期','Case事项','订单号','当前进度','下一步','优先级','状态','邮箱'],...handovers.map(h=>[h.date,h.type,h.orderId,h.progress,h.next,h.priority,h.status,h.email])],'Handover_Cases.csv');}

// ── FROZEN ────────────────────────────────────────────────────
function loadFRExcel(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const wb=XLSX.read(e.target.result,{type:'array',cellDates:true});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const data=XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:''});
      let hr=-1;
      for(let i=0;i<data.length;i++){
        if(String(data[i][0]||'').includes('交易员')){hr=i;break;}
      }
      frozen=data.slice(hr<0?1:hr+1).filter(r=>String(r[0]||'').trim()!='').map(r=>({
        trader:  String(r[0]||'').trim(),
        date:    fmtExcelDate(r[1]),
        p4bId:   String(r[2]||'').trim(),
        dpId:    String(r[3]||'').trim(),
        amount:  parseFloat(String(r[4]||'').replace(/[^0-9.]/g,''))||0,
        payerCN: String(r[5]||'').trim(),
        payerEN: String(r[6]||'').trim(),
        payerId: String(r[7]||'').trim(),
        sales:   String(r[8]||'').trim(),
        agent:   String(r[9]||'').trim(),
        doc:     String(r[10]||'').trim(),
        desc:    String(r[11]||'').trim(),
        type:    String(r[12]||'').trim(),
        coins:   String(r[13]||'').trim(),
        coinAmt: parseFloat(String(r[14]||'').replace(/[^0-9.]/g,''))||0,
        deduct:  parseFloat(String(r[15]||'').replace(/[^0-9.]/g,''))||0,
        repay:   parseFloat(String(r[16]||'').replace(/[^0-9.]/g,''))||0,
      }));
      renderFR();updateFRM();
      alert(`✅ 成功导入 ${frozen.length} 条冻结记录`);
    }catch(err){alert('解析失败：'+err.message);}
  };
  reader.readAsArrayBuffer(file);
}
function renderFR(){
  const s=document.getElementById('fr-search').value.toLowerCase();
  const cf=document.getElementById('fr-coins').value;
  const data=frozen.filter(f=>{
    if(frFilter==='是') return f.coins==='是';
    if(frFilter&&!f.type.includes(frFilter))return false;
    if(s&&!f.trader.toLowerCase().includes(s)&&!f.p4bId.toLowerCase().includes(s)&&!(f.payerCN||'').toLowerCase().includes(s)&&!(f.dpId||'').toLowerCase().includes(s))return false;
    if(cf&&f.coins!==cf)return false;
    return true;
  });
  document.getElementById('fr-empty').style.display=data.length?'none':'block';
  document.getElementById('fr-body').innerHTML=data.map(f=>`<tr>
    <td style="font-family:var(--mono);font-size:12px">${f.trader}</td>
    <td style="font-family:var(--mono);font-size:12px;white-space:nowrap">${f.date}</td>
    <td style="font-size:11px;font-family:var(--mono);max-width:130px;word-break:break-all">${f.p4bId}</td>
    <td style="font-size:11px;font-family:var(--mono);max-width:130px;word-break:break-all">${f.dpId}</td>
    <td style="font-family:var(--mono)">${f.amount?f.amount.toLocaleString():''}</td>
    <td>${f.payerCN||f.payerEN||''} ${f.payerId?`<span style="color:var(--text3);font-size:11px">(${f.payerId})</span>`:''}</td>
    <td>${frzBadge(f.type)}</td>
    <td><span class="badge ${f.coins==='是'?'b-green':'b-gray'}">${f.coins||'—'}</span></td>
    <td style="font-family:var(--mono)">${f.coinAmt?f.coinAmt.toFixed(2):''}</td>
    <td style="max-width:200px;font-size:12px;color:var(--text2)">${(f.desc||'').slice(0,80)}${f.desc&&f.desc.length>80?'…':''}</td>
    <td><button class="btn btn-sm btn-danger" onclick="frozen.splice(${frozen.indexOf(f)},1);renderFR();updateFRM()">删</button></td>
  </tr>`).join('');
}
function filterFR(f,el){frFilter=f;document.querySelectorAll('#fr-chips .chip').forEach(c=>c.classList.remove('active'));el.classList.add('active');renderFR();}
function updateFRM(){
  // Total unique cases = unique P4B order numbers (duplicates not counted)
  const uniqueOrders=new Set(frozen.filter(f=>f.p4bId).map(f=>f.p4bId));
  set('fm-total',uniqueOrders.size);
  set('fm-jud',frozen.filter(f=>f.type.includes('司法')).length);
  set('fm-acc',frozen.filter(f=>f.type.includes('账号')).length);
  set('fm-cpl',frozen.filter(f=>f.type.includes('客户')||f.type.includes('客诉')).length);
  set('fm-coins',frozen.reduce((a,f)=>a+f.coinAmt,0).toLocaleString(undefined,{maximumFractionDigits:2}));
  set('fm-amt',frozen.reduce((a,f)=>a+f.amount,0).toLocaleString(undefined,{maximumFractionDigits:0}));
}
function saveFR(){
  frozen.unshift({trader:document.getElementById('fm-trader').value,date:document.getElementById('fm-date').value,p4bId:document.getElementById('fm-p4b').value,dpId:document.getElementById('fm-dp').value,amount:parseFloat(document.getElementById('fm-ai').value)||0,payerCN:document.getElementById('fm-cn').value,payerId:document.getElementById('fm-pid').value,sales:document.getElementById('fm-sales').value,agent:document.getElementById('fm-agent').value,type:document.getElementById('fm-type').value,coins:document.getElementById('fm-coins-s').value,coinAmt:parseFloat(document.getElementById('fm-ca').value)||0,desc:document.getElementById('fm-desc').value});
  renderFR();updateFRM();closeModal('fr-modal');
}
function exportFR(){dlCSV([['交易员账号','反馈日期','P4B订单号','DP订单号','金额CNY','付款人','类型','是否补币','补币USDT','描述'],...frozen.map(f=>[f.trader,f.date,f.p4bId,f.dpId,f.amount,f.payerCN,f.type,f.coins,f.coinAmt,f.desc])],'冻结记录.csv');}

// ── BADGES ────────────────────────────────────────────────────
function statusBadge(s){if(!s)return'<span class="badge b-gray">—</span>';if(s.includes('完成'))return'<span class="badge b-green">✓ 已完成</span>';if(s.includes('搁置'))return'<span class="badge b-amber">⏸ 搁置</span>';if(s.includes('进行'))return'<span class="badge b-blue">↻ 进行中</span>';return`<span class="badge b-gray">${s.slice(0,5)}</span>`;}
function priBadge(p){if(p==='高')return'<span class="badge b-red">高</span>';if(p==='中')return'<span class="badge b-blue">中</span>';return'<span class="badge b-gray">低</span>';}
function frzBadge(t){if(!t)return'<span class="badge b-gray">—</span>';if(t.includes('司法'))return'<span class="badge b-red">司法冻结</span>';if(t.includes('账号'))return'<span class="badge b-amber">账号冻结</span>';if(t.includes('客户')||t.includes('客诉'))return'<span class="badge b-purple">客诉</span>';if(t.includes('可疑'))return'<span class="badge b-red">可疑款项</span>';if(t.includes('公安'))return'<span class="badge b-amber">公安查问</span>';if(t.includes('反诈'))return'<span class="badge b-amber">反诈中心</span>';if(t.includes('银行'))return'<span class="badge b-blue">银行限额</span>';if(t.includes('风控'))return'<span class="badge b-purple">风控</span>';if(t.includes('交易员失误'))return'<span class="badge b-gray">交易员失误</span>';return`<span class="badge b-gray">${t}</span>`;}

// ── ORDER EXCEL IMPORT ────────────────────────────────────────
function loadOrderExcel(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const wb=XLSX.read(e.target.result,{type:'array',cellDates:true});
      // Process all sheets (each sheet = one month)
      let imported=0;
      wb.SheetNames.forEach(sheetName=>{
        // Only process month sheets (含 月)
        if(!sheetName.includes('月'))return;
        const ws=wb.Sheets[sheetName];
        const data=XLSX.utils.sheet_to_json(ws,{header:1,raw:true,defval:''});

        const result={DP:{c:0,a:0},CG:{c:0,a:0},RKX:{c:0,a:0},i6:{c:0,a:0},P4B:{c:0,a:0}};
        let currentSection=null;

        for(let i=0;i<data.length;i++){
          const row=data[i];
          const v0=String(row[0]||'').trim();

          // Detect section headers
          if(v0.includes('DP')&&(v0.includes('非新疆')||v0.includes('新疆')))currentSection='DP';
          else if(v0.includes('CG')&&(v0.includes('非新疆')||v0.includes('新疆')))currentSection='CG';
          else if(v0.includes('RKX'))currentSection='RKX';
          else if(v0.startsWith('6i'))currentSection='i6';
          else if(v0.includes('P4B 兑入'))currentSection='P4B';

          // Grand Total rows
          if(v0==='Grand Total'&&currentSection){
            const cnt=parseInt(String(row[1]||'').replace(/,/g,''))||0;
            const amt=parseFloat(String(row[2]||'').replace(/[^0-9.]/g,''))||0;
            if(cnt>0&&currentSection&&result[currentSection]!==undefined){
              result[currentSection].c+=cnt;
              result[currentSection].a+=amt;
            }
            // Don't reset currentSection — there can be multiple Grand Totals per channel (非新疆 + 新疆)
          }
        }

        // Parse P4B teams for this month — exclude merchant names
        const MERCHANT_PREFIXES=['Doo Prime','CG Trade','RKX','6i'];
        const teams=[];
        let inP4B=false;
        for(let i=0;i<data.length;i++){
          const v0=String(data[i][0]||'').trim();
          if(v0.includes('P4B 兑入')||v0.includes('P4B兑入')){inP4B=true;continue;}
          if(v0.includes('P4B 兑出')||v0.includes('P4B兑出')){inP4B=false;break;}
          if(!inP4B)continue;
          if(!v0||v0==='兑入'||v0.includes('Grand Total')||v0.includes('订单数量'))continue;
          // Skip merchant channel rows
          if(MERCHANT_PREFIXES.some(p=>v0.startsWith(p)))continue;
          const cnt=parseInt(String(data[i][1]||'').replace(/,/g,''))||0;
          const amt=parseFloat(String(data[i][2]||'').replace(/[^0-9.]/g,''))||0;
          if(cnt>0){
            const existing=teams.find(t=>t.n===v0);
            if(existing){existing.c+=cnt;existing.a+=amt;}
            else teams.push({n:v0,c:cnt,a:amt});
          }
        }

        // Convert month name to index or add new entry
        const label=sheetName; // e.g. "4月2026"
        // Find if already exists in MLABELS
        const yr=sheetName.match(/(\d{4})/)?.[1];
        const mo=sheetName.match(/(\d+)月/)?.[1];
        if(yr&&mo){
          const key=`${yr}-${mo.padStart(2,'0')}`;
          const idx=MLABELS.indexOf(key);
          if(idx>=0){
            CD[idx]=result;
            if(teams.length>0)TEAMS[idx]={teams:teams.sort((a,b)=>b.c-a.c)};
          } else {
            // New month — append
            MLABELS.push(key);
            CD.push(result);
            if(teams.length>0)TEAMS[MLABELS.length-1]={teams:teams.sort((a,b)=>b.c-a.c)};
            // Add to dropdown
            const sel=document.getElementById('month-select');
            const opt=document.createElement('option');
            opt.value=MLABELS.length-1;
            opt.textContent=`${yr}年${mo}月`;
            sel.insertBefore(opt,sel.firstChild);
          }
          imported++;
        }
      });

      if(imported>0){
        updateOrderPage();
        alert(`✅ 成功导入 ${imported} 个月份的数据，图表已更新！`);
      } else {
        alert('未找到有效月份数据，请确认 Excel 的 sheet 名称包含「月」字（如：4月2026）');
      }
    }catch(err){alert('解析失败：'+err.message+'\n请确认上传的是订单汇总 Excel 文件。');}
  };
  reader.readAsArrayBuffer(file);
}
function fmtExcelDate(v){
  if(!v&&v!==0)return'';
  if(v instanceof Date){return v.toISOString().slice(0,10);}
  if(typeof v==='number'){
    // Excel serial date
    const d=new Date(Math.round((v-25569)*86400*1000));
    return d.toISOString().slice(0,10);
  }
  const s=String(v).trim();
  // Already formatted
  if(/^\d{4}-\d{2}-\d{2}/.test(s))return s.slice(0,10);
  // Try parse
  const d=new Date(s);
  if(!isNaN(d))return d.toISOString().slice(0,10);
  return s.slice(0,10);
}

// ── CSV ───────────────────────────────────────────────────────
function dlCSV(rows,name){const csv='\uFEFF'+rows.map(r=>r.map(v=>'"'+String(v||'').replace(/"/g,'""')+'"').join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=name;a.click();}

// ── INIT ──────────────────────────────────────────────────────
setTimeout(updateOrderPage,150);