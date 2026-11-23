const DEMO = {
  teams: [
    {team_id:"T1",team_name:"Team 1",color:"#e87532"},{team_id:"T2",team_name:"Team 2",color:"#277da1"},
    {team_id:"T3",team_name:"Team 3",color:"#6b5ca5"},{team_id:"T4",team_name:"Team 4",color:"#39936d"},
    {team_id:"T5",team_name:"Team 5",color:"#c44d58"},{team_id:"T6",team_name:"Team 6",color:"#9b7a35"}
  ],
  games: [
    {game_id:"G1",week:"1",date:"2026-12-01",time:"7:00 PM",home_team:"Team 1",away_team:"Team 2",home_score:"58",away_score:"51",status:"Final"},
    {game_id:"G2",week:"1",date:"2026-12-01",time:"8:00 PM",home_team:"Team 3",away_team:"Team 4",home_score:"",away_score:"",status:"Upcoming"},
    {game_id:"G3",week:"1",date:"2026-12-01",time:"9:00 PM",home_team:"Team 5",away_team:"Team 6",home_score:"",away_score:"",status:"Upcoming"},
    {game_id:"G4",week:"2",date:"2026-12-08",time:"7:00 PM",home_team:"Team 2",away_team:"Team 3",home_score:"",away_score:"",status:"Upcoming"}
  ],
  playerStats: [
    {game_id:"G1",player_name:"Jordan Lee",team_name:"Team 1",points:"22",rebounds:"8"},
    {game_id:"G1",player_name:"Chris Patel",team_name:"Team 1",points:"16",rebounds:"11"},
    {game_id:"G1",player_name:"Sam Rivera",team_name:"Team 1",points:"12",rebounds:"5"},
    {game_id:"G1",player_name:"Alex Chen",team_name:"Team 2",points:"19",rebounds:"7"},
    {game_id:"G1",player_name:"Mike Davis",team_name:"Team 2",points:"14",rebounds:"9"},
    {game_id:"G1",player_name:"Dev Shah",team_name:"Team 2",points:"10",rebounds:"4"}
  ]
};

const config = window.LEAGUE_CONFIG || {};
let leagueData = DEMO;
const $ = (id) => document.getElementById(id);
const safe = (value) => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function parseCSV(text){
  const rows=[]; let row=[], field="", quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i], n=text[i+1];
    if(c==='"' && quoted && n==='"'){field+='"';i++;}
    else if(c==='"') quoted=!quoted;
    else if(c===',' && !quoted){row.push(field);field="";}
    else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(field);if(row.some(x=>x.trim()!==""))rows.push(row);row=[];field="";}
    else field+=c;
  }
  row.push(field); if(row.some(x=>x.trim()!==""))rows.push(row);
  if(!rows.length)return [];
  const headers=rows.shift().map(x=>x.trim().replace(/^\uFEFF/,""));
  return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,(r[i]??"").trim()])));
}
async function getSheet(url, fallback){
  if(!url) return fallback;
  const response=await fetch(url,{cache:"no-store"});
  if(!response.ok) throw new Error("Could not load a published spreadsheet tab.");
  return parseCSV(await response.text());
}
function number(v){const n=Number(v);return Number.isFinite(n)?n:0}
function dateLabel(date){if(!date)return "Date TBD";const d=new Date(date+"T12:00:00");return Number.isNaN(d.getTime())?date:d.toLocaleDateString(undefined,{month:"short",day:"numeric"});}
function totals(){
  const map=new Map();
  leagueData.playerStats.forEach(s=>{
    const key=(s.player_name||"").trim()+"||"+(s.team_name||"").trim();
    if(!s.player_name)return;
    if(!map.has(key))map.set(key,{player:s.player_name,team:s.team_name,games:new Set(),points:0,rebounds:0});
    const p=map.get(key);p.games.add(s.game_id);p.points+=number(s.points);p.rebounds+=number(s.rebounds);
  });
  return [...map.values()].map(p=>({...p,gp:p.games.size,ppg:p.games.size?p.points/p.games.size:0,rpg:p.games.size?p.rebounds/p.games.size:0}));
}
function renderSummary(players){
  $("team-count").textContent=leagueData.teams.length;
  $("games-played").textContent=leagueData.games.filter(g=>(g.status||"").toLowerCase()==="final").length;
  $("player-count").textContent=players.length;
}
function renderSchedule(){
  const weeks=[...new Set(leagueData.games.map(g=>String(g.week||"1")))].sort((a,b)=>Number(a)-Number(b));
  const select=$("week-select"), old=select.value;
  select.innerHTML=weeks.map(w=>`<option value="${safe(w)}">Week ${safe(w)}</option>`).join("");
  if(weeks.includes(old))select.value=old;
  const week=select.value||weeks[0];
  const games=leagueData.games.filter(g=>String(g.week||"1")===week);
  $("schedule-list").innerHTML=games.length?games.map(g=>{
    const final=(g.status||"").toLowerCase()==="final";
    const score=final?`${number(g.home_score)} – ${number(g.away_score)}`:"VS";
    return `<article class="game-card" data-game="${safe(g.game_id)}" tabindex="0" role="button" aria-label="View ${safe(g.home_team)} versus ${safe(g.away_team)} box score">
      <div class="game-date"><strong>${safe(dateLabel(g.date))}</strong>${safe(g.time||"Time TBD")}</div>
      <div class="matchup"><span class="team-name">${safe(g.home_team)}</span><span class="versus">VS</span><span class="team-name">${safe(g.away_team)}</span></div>
      <div class="game-result"><strong>${safe(score)}</strong><span class="status-tag ${final?"":"upcoming"}">${safe(g.status||"Scheduled")}</span></div>
    </article>`;
  }).join(""):`<div class="empty-state">No games entered for this week yet.<br>Add games to the <strong>Games</strong> tab in your spreadsheet.</div>`;
  document.querySelectorAll(".game-card").forEach(card=>{card.addEventListener("click",()=>openGame(card.dataset.game));card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openGame(card.dataset.game)}})});
}
function renderPlayers(){
  const q=$("player-search").value.toLowerCase(), sort=$("player-sort").value;
  const rows=totals().filter(p=>(p.player+" "+p.team).toLowerCase().includes(q));
  const key={points:"points",rebounds:"rebounds",ppg:"ppg",rpg:"rpg",name:"player"}[sort];
  rows.sort((a,b)=>sort==="name"?a.player.localeCompare(b.player):b[key]-a[key]);
  $("players-body").innerHTML=rows.length?rows.map(p=>`<tr><td>${safe(p.player)}</td><td>${safe(p.team)}</td><td class="num">${p.gp}</td><td class="num">${p.points}</td><td class="num">${p.rebounds}</td><td class="num">${p.ppg.toFixed(1)}</td><td class="num">${p.rpg.toFixed(1)}</td></tr>`).join(""):`<tr><td colspan="7">No player statistics yet.</td></tr>`;
}
function leaderRows(list,valueKey,suffix){
  return list.slice(0,10).map((p,i)=>`<div class="leader-row"><span class="leader-rank">${String(i+1).padStart(2,"0")}</span><div><div class="leader-name">${safe(p.player)}</div><div class="leader-team">${safe(p.team)}</div></div><div class="leader-value">${valueKey==="points"?p.points:p.rebounds}<small style="font:600 9px Inter;color:#8391a0"> ${suffix}</small></div></div>`).join("")||`<div class="empty-state">Leaders will appear after stats are entered.</div>`;
}
function renderLeaders(){
  const p=totals();
  $("points-leaders").innerHTML=leaderRows([...p].sort((a,b)=>b.points-a.points),"points","PTS");
  $("rebound-leaders").innerHTML=leaderRows([...p].sort((a,b)=>b.rebounds-a.rebounds),"rebounds","REB");
}
function renderTeams(){
  $("teams-grid").innerHTML=leagueData.teams.map(t=>`<article class="team-card"><h3><span class="team-dot" style="background:${safe(t.color||"#f28b36")}"></span>${safe(t.team_name)}</h3><p>Team roster and season stats are calculated from recorded game performances.</p></article>`).join("")||`<div class="empty-state">Add your six teams to the Teams tab.</div>`;
}
function openGame(id){
  const g=leagueData.games.find(x=>x.game_id===id);if(!g)return;
  const stats=leagueData.playerStats.filter(s=>s.game_id===id);
  $("dialog-week").textContent=`WEEK ${g.week||"—"} • ${dateLabel(g.date)}`;
  $("dialog-title").textContent="Game box score";
  $("home-team-heading").textContent=g.home_team;$("away-team-heading").textContent=g.away_team;
  const final=(g.status||"").toLowerCase()==="final";
  $("dialog-score").innerHTML=`<div class="score-side"><span>${safe(g.home_team)}</span><strong>${final?number(g.home_score):"—"}</strong></div><div class="score-divider">FINAL SCORE</div><div class="score-side"><span>${safe(g.away_team)}</span><strong>${final?number(g.away_score):"—"}</strong></div>`;
  const side=(team)=>stats.filter(s=>s.team_name===team).map(s=>`<tr><td>${safe(s.player_name)}</td><td class="num">${number(s.points)}</td><td class="num">${number(s.rebounds)}</td></tr>`).join("")||`<tr><td colspan="3">No player stats entered</td></tr>`;
  $("home-stats").innerHTML=side(g.home_team);$("away-stats").innerHTML=side(g.away_team);
  $("game-dialog").showModal();
}
async function init(){
  $("league-name").textContent=config.leagueName||"LEAGUE CENTRAL";
  $("season-label").textContent=config.seasonLabel||"SEASON";
  const urls=[config.teamsCsvUrl,config.gamesCsvUrl,config.playerStatsCsvUrl];
  try{
    if(urls.some(Boolean)){
      const [teams,games,playerStats]=await Promise.all([
        getSheet(config.teamsCsvUrl,DEMO.teams),getSheet(config.gamesCsvUrl,DEMO.games),getSheet(config.playerStatsCsvUrl,DEMO.playerStats)
      ]);
      leagueData={teams,games,playerStats};
      $("data-status").textContent="Live spreadsheet data loaded.";
      $("data-status").className="data-status live";
    }else{
      $("data-status").textContent="Preview mode: showing sample data. Connect your Google Sheets tabs in config.js to show your league data.";
    }
  }catch(err){
    $("data-status").textContent="Could not load spreadsheet data. Check that all three tabs are published as CSV and their URLs are correct. Showing sample data instead.";
    $("data-status").className="data-status error";
    leagueData=DEMO;
  }
  const players=totals();renderSummary(players);renderSchedule();renderPlayers();renderLeaders();renderTeams();
}
document.querySelectorAll(".nav-button").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".nav-button").forEach(b=>b.classList.toggle("active",b===btn));
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${btn.dataset.view}`));
}));
$("week-select").addEventListener("change",renderSchedule);
$("player-search").addEventListener("input",renderPlayers);
$("player-sort").addEventListener("change",renderPlayers);
$("close-dialog").addEventListener("click",()=>$("game-dialog").close());
$("game-dialog").addEventListener("click",e=>{if(e.target===$("game-dialog"))$("game-dialog").close()});
init();