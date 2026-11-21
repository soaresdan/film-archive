const $ = s => document.querySelector(s);
let films = [], active = {type:"all", value:"all"}, query = "";
const clean = v => String(v || "").trim();
const split = v => clean(v).split(/[;,]/).map(x=>x.trim()).filter(Boolean);
function csvParse(text){
  const rows=[]; let row=[], cell="", quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];
    if(c==='"'&&quoted&&n==='"'){cell+='"';i++}
    else if(c==='"')quoted=!quoted;
    else if(c===','&&!quoted){row.push(cell);cell=""}
    else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell=""}
    else cell+=c;
  }
  row.push(cell);if(row.some(x=>x.trim()))rows.push(row);
  const headers=(rows.shift()||[]).map(x=>x.trim());
  return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,(r[i]||"").trim()])));
}
function normalize(f){
  return {...f,year:Number(f.year)||0,collection:clean(f.collection).toLowerCase()||"archive",
    genres:clean(f.genres),country:clean(f.country),director:clean(f.director)};
}
async function loadFilms(){
  const url=window.ARCHIVE_CONFIG?.sheetCsvUrl;
  if(url){try{const r=await fetch(url);if(!r.ok)throw Error("Could not load sheet");const rows=csvParse(await r.text());return rows.filter(x=>x.title).map(normalize)}catch(e){console.warn(e)}}
  return (window.SAMPLE_FILMS||[]).map(normalize);
}
function uniqueValues(key){return [...new Set(films.flatMap(f=>key==="genres"?split(f.genres):[clean(f[key])]).filter(Boolean))].sort((a,b)=>a.localeCompare(b))}
function addLinks(id,values){const el=$(id);el.innerHTML="";values.forEach(v=>{const b=document.createElement("button");b.textContent=v;b.onclick=()=>setFilter(id.includes("genre")?"genre":id.includes("decade")?"decade":id.includes("country")?"country":"director",v);el.append(b)})}
function buildSidebar(){
  addLinks("#genre-list",uniqueValues("genres"));
  addLinks("#country-list",uniqueValues("country"));
  addLinks("#director-list",uniqueValues("director"));
  const decades=[...new Set(films.map(f=>Math.floor(f.year/10)*10).filter(Boolean))].sort((a,b)=>b-a);
  const el=$("#decade-list");el.innerHTML="";
  decades.forEach(d=>{const wrap=document.createElement("div");const b=document.createElement("button");b.textContent=`${d}s`;b.onclick=()=>setFilter("decade",String(d));wrap.append(b);const years=[...new Set(films.filter(f=>Math.floor(f.year/10)*10===d).map(f=>f.year))].sort((a,b)=>b-a);years.forEach(y=>{const yb=document.createElement("button");yb.textContent=`  ${y}`;yb.style.paddingLeft="18px";yb.onclick=()=>setFilter("year",String(y));wrap.append(yb)});el.append(wrap)});
}
function setFilter(type,value){active={type,value};$("#view-title").textContent=value==="all"?"All Films":type==="collection"?(value==="favorites"?"Favorites":"Personal Archive"):value;document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.filterValue===value&&type==="collection"));render()}
function filtered(){
  let list=films.filter(f=>{
    if(active.type==="collection"&&active.value!=="all"&&f.collection!==active.value)return false;
    if(active.type==="genre"&&!split(f.genres).includes(active.value))return false;
    if(active.type==="country"&&f.country!==active.value)return false;
    if(active.type==="director"&&f.director!==active.value)return false;
    if(active.type==="decade"&&String(Math.floor(f.year/10)*10)!==active.value)return false;
    if(active.type==="year"&&String(f.year)!==active.value)return false;
    const hay=[f.title,f.originalTitle,f.director,f.country,f.cast,f.genres].join(" ").toLowerCase();
    return !query||hay.includes(query);
  });
  const sort=$("#sort").value;
  return list.sort((a,b)=>sort==="year-desc"?b.year-a.year:sort==="year-asc"?a.year-b.year:sort==="title"?a.title.localeCompare(b.title):0);
}
function render(){
  const list=filtered(),grid=$("#film-grid");grid.innerHTML="";
  $("#status").textContent=`${list.length} film${list.length===1?"":"s"} in this view`;
  list.forEach(f=>{const card=document.createElement("article");card.className="film-card";card.tabIndex=0;
    const wrap=document.createElement("div");wrap.className="poster-wrap";
    if(f.poster){const img=document.createElement("img");img.className="poster";img.src=f.poster;img.alt=`${f.title} poster`;img.loading="lazy";img.onerror=()=>{img.remove();placeholder(wrap,f.title)};wrap.append(img)}
    else placeholder(wrap,f.title);
    const tag=document.createElement("span");tag.className="collection-tag";tag.textContent=f.collection==="favorites"?"FAVORITE":"ARCHIVE";wrap.append(tag);
    const title=document.createElement("div");title.className="film-title";title.textContent=f.title;
    const meta=document.createElement("div");meta.className="film-meta";meta.textContent=[f.year,f.country].filter(Boolean).join(" · ");
    const rating=document.createElement("div");rating.className="film-rating";rating.textContent=f.imdbRating?`IMDb ★ ${f.imdbRating}`:"";
    card.append(wrap,title,meta,rating);card.onclick=()=>openFilm(f);card.onkeydown=e=>{if(e.key==="Enter")openFilm(f)};grid.append(card);
  });
}
function placeholder(wrap,title){const p=document.createElement("div");p.className="poster-placeholder";p.textContent=title;wrap.append(p)}
function field(label,value){if(!clean(value))return "";return `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`}
function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function openFilm(f){
  const poster=f.poster?`<img class="detail-poster" src="${escapeHtml(f.poster)}" alt="">`:`<div class="poster-placeholder">${escapeHtml(f.title)}</div>`;
  let links="";
  if(f.driveUrl)links+=`<a href="${escapeHtml(f.driveUrl)}" target="_blank" rel="noopener">ACCESS FILM ↗</a>`;
  if(f.imdbUrl)links+=`<a href="${escapeHtml(f.imdbUrl)}" target="_blank" rel="noopener">IMDb ↗</a>`;
  if(f.letterboxdUrl)links+=`<a href="${escapeHtml(f.letterboxdUrl)}" target="_blank" rel="noopener">LETTERBOXD ↗</a>`;
  $("#detail-content").innerHTML=`<div class="detail-layout"><div>${poster}</div><div><div class="eyebrow">${escapeHtml(f.collection.toUpperCase())} · ${escapeHtml(f.country)}</div><h2 class="detail-title">${escapeHtml(f.title)}</h2><div class="detail-sub">${escapeHtml(f.originalTitle)} ${f.year?`(${f.year})`:""} · ${escapeHtml(f.runtime)}</div>
  <div class="detail-section"><h3>SYNOPSIS</h3><p>${escapeHtml(f.synopsis||"Synopsis not added yet.")}</p></div>
  <div class="detail-section"><h3>FILM DETAILS</h3>${field("Director",f.director)}${field("Country",f.country)}${field("Genres",f.genres)}${field("Cast",f.cast)}${field("Screenplay",f.screenplay)}${field("Cinematography",f.cinematography)}${field("Music",f.music)}${field("IMDb rating",f.imdbRating)}${field("Letterboxd rating",f.letterboxdRating)}</div>
  <div class="detail-links">${links||"<span class='film-meta'>External links not added.</span>"}</div></div></div>`;
  $("#modal").classList.add("open");$("#modal").setAttribute("aria-hidden","false");
}
function closeModal(){$("#modal").classList.remove("open");$("#modal").setAttribute("aria-hidden","true")}
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>setFilter("collection",b.dataset.filterValue)));
$("#search").addEventListener("input",e=>{query=e.target.value.toLowerCase().trim();render()});
$("#sort").addEventListener("change",render);
$("#modal").addEventListener("click",e=>{if(e.target.dataset.close)closeModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
(async()=>{films=await loadFilms();buildSidebar();render()})();
