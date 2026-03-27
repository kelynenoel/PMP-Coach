import { useState, useEffect, useCallback } from "react";

// ─── THEME ───────────────────────────────────────────────────────────────────
const C={bg:"#05111f",surface:"#091929",card:"#0d2035",border:"#15324f",
  gold:"#e8a835",goldL:"#f5c96a",accent:"#3d8eff",text:"#dde9f5",
  muted:"#5d7e9a",ok:"#2ebd7a",err:"#e04f4f",purple:"#7c5cbf",warn:"#d97b35",
  people:"#3d8eff",process:"#2ebd7a",biz:"#9b6de0"};
const F={d:"'Playfair Display',Georgia,serif",b:"'DM Sans','Segoe UI',sans-serif"};
const DC={people:C.people,process:C.process,bizEnv:C.biz};
const DL={people:"People",process:"Process",bizEnv:"Business Env"};
const GS=`
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}body{background:#05111f;color:#dde9f5;font-family:'DM Sans','Segoe UI',sans-serif}
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#091929}::-webkit-scrollbar-thumb{background:#15324f;border-radius:3px}
.shimmer{background:linear-gradient(90deg,#091929 25%,#15324f 50%,#091929 75%);background-size:200% 100%;animation:sh 1.4s infinite}
@keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
.fi{animation:fi .3s ease both}.pulse{animation:pulse 2s ease infinite}
`;

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const SK="pmp60v2";
async function loadProfile(){
  try{const r=await window.storage.get(SK);return r?JSON.parse(r.value):null;}
  catch{return null;}
}
async function saveProfile(p){
  try{await window.storage.set(SK,JSON.stringify(p));}catch{}
}
function freshProfile(intensity="Standard"){
  return{
    startDate:new Date().toISOString().split("T")[0],
    streak:0,lastStudied:null,
    readiness:0,
    domains:{people:0,process:0,bizEnv:0},
    topicAcc:{},// {topic:{c,t}}
    weakAreas:[],strongAreas:[],
    sessionHistory:[],// last 10 summaries
    flashcards:[],// {q,a,topic,ease:2.5,interval:1,nextReview}
    totalAnswered:0,
    weeklyExams:[],// {day,score,domains}
    fullExams:[],// {day,score,domains,passProb}
    preferredIntensity:intensity,
    lastLesson:null,
  };
}
function getDay(startDate){
  if(!startDate)return 1;
  const d=Math.floor((new Date()-new Date(startDate))/(86400000))+1;
  return Math.min(60,Math.max(1,d));
}
function calcReadiness(p){
  if(p.totalAnswered<5)return p.totalAnswered*3;
  const avg=(p.domains.people+p.domains.process+p.domains.bizEnv)/3;
  const vol=Math.min(p.totalAnswered/400,1)*15;
  return Math.round(Math.min(avg*.82+vol,100));
}
function getWeakAreas(topicAcc){
  return Object.entries(topicAcc)
    .filter(([,v])=>v.t>=3)
    .sort((a,b)=>(a[1].c/a[1].t)-(b[1].c/b[1].t))
    .slice(0,3).map(([k])=>k);
}
function getStrongAreas(topicAcc){
  return Object.entries(topicAcc)
    .filter(([,v])=>v.t>=3&&v.c/v.t>=.8)
    .sort((a,b)=>(b[1].c/b[1].t)-(a[1].c/a[1].t))
    .slice(0,2).map(([k])=>k);
}
function updateProfile(profile,answers,questions){
  const p={...profile,topicAcc:{...profile.topicAcc}};
  let dc={people:0,process:0,bizEnv:0},dt={people:0,process:0,bizEnv:0};
  answers.forEach((a,i)=>{
    const q=questions[i];if(!q)return;
    const correct=a===q.correct;
    const topic=q.topic||"General";
    if(!p.topicAcc[topic])p.topicAcc[topic]={c:0,t:0};
    p.topicAcc[topic].t++;
    if(correct)p.topicAcc[topic].c++;
    const dom=q.domain||"process";
    dt[dom]=(dt[dom]||0)+1;
    if(correct)dc[dom]=(dc[dom]||0)+1;
  });
  // Smooth domain scores (EMA)
  ["people","process","bizEnv"].forEach(d=>{
    if(dt[d]>0){
      const sessionScore=Math.round(dc[d]/dt[d]*100);
      p.domains[d]=p.domains[d]===0?sessionScore:Math.round(p.domains[d]*.7+sessionScore*.3);
    }
  });
  p.totalAnswered+=answers.filter(a=>a!==null).length;
  p.weakAreas=getWeakAreas(p.topicAcc);
  p.strongAreas=getStrongAreas(p.topicAcc);
  p.readiness=calcReadiness(p);
  // Streak
  const today=new Date().toISOString().split("T")[0];
  const yesterday=new Date(Date.now()-86400000).toISOString().split("T")[0];
  if(p.lastStudied===yesterday)p.streak++;
  else if(p.lastStudied!==today)p.streak=1;
  p.lastStudied=today;
  return p;
}

// ─── TOPICS ──────────────────────────────────────────────────────────────────
const TOPICS=[
  {name:"Stakeholder Identification & Analysis",domain:"people"},
  {name:"Stakeholder Engagement & Communication",domain:"people"},
  {name:"Team Leadership & Servant Leadership",domain:"people"},
  {name:"Conflict Resolution & Negotiation",domain:"people"},
  {name:"Team Development & Motivation",domain:"people"},
  {name:"Emotional Intelligence & Empathy",domain:"people"},
  {name:"Virtual & Distributed Teams",domain:"people"},
  {name:"Risk Identification & Assessment",domain:"process"},
  {name:"Risk Response Planning",domain:"process"},
  {name:"Change Control & Integrated Change Management",domain:"process"},
  {name:"Scope Management & WBS",domain:"process"},
  {name:"Schedule Development & CPM",domain:"process"},
  {name:"Earned Value Management (EVM)",domain:"process"},
  {name:"Quality Assurance & Quality Control",domain:"process"},
  {name:"Procurement & Contract Types",domain:"process"},
  {name:"Agile & Scrum Delivery",domain:"process"},
  {name:"Kanban & Flow-Based Methods",domain:"process"},
  {name:"Hybrid Delivery Approaches",domain:"process"},
  {name:"Project Monitoring & Controlling",domain:"process"},
  {name:"Business Case & Benefits Realization",domain:"bizEnv"},
  {name:"Organizational Strategy & Value Delivery",domain:"bizEnv"},
  {name:"Governance & Compliance",domain:"bizEnv"},
  {name:"Organizational Change Management",domain:"bizEnv"},
  {name:"Portfolio & Program Context",domain:"bizEnv"},
];
function selectTopics(profile,count=3){
  const weak=profile.weakAreas;
  const weakTopics=TOPICS.filter(t=>weak.includes(t.name));
  const rest=TOPICS.filter(t=>!weak.includes(t.name));
  const shuffled=[...weakTopics,...rest.sort(()=>Math.random()-.5)];
  return shuffled.slice(0,count).map(t=>t.name);
}
function getDifficultyFromDay(day,domainScore){
  if(day<=7||domainScore<40)return"Easy to Medium";
  if(day<=21||domainScore<60)return"Medium to Hard";
  if(day<=42||domainScore<75)return"Hard";
  return"Hard to Exam-level (ambiguous multi-step scenarios)";
}

// ─── AI ──────────────────────────────────────────────────────────────────────
async function generateSession(profile,intensity){
  const day=getDay(profile.startDate);
  const topics=selectTopics(profile,3);
  const qCount=intensity==="Light"?10:intensity==="Intensive"?22:14;
  const avgDomain=(profile.domains.people+profile.domains.process+profile.domains.bizEnv)/3;
  const diff=getDifficultyFromDay(day,avgDomain);
  const weak=profile.weakAreas.length>0?`User struggles with: ${profile.weakAreas.join(", ")}.`:"";
  const strong=profile.strongAreas.length>0?`User performs well on: ${profile.strongAreas.join(", ")}.`:"";

  const prompt=`You are an expert PMP exam coach building a ${intensity} study session for Day ${day}/60.

USER PROFILE:
- Readiness: ${profile.readiness}%
- Domain scores: People ${profile.domains.people}%, Process ${profile.domains.process}%, Business Env ${profile.domains.bizEnv}%
- ${weak} ${strong}
- Total questions answered: ${profile.totalAnswered}
- Session topics to focus on: ${topics.join(", ")}

PMBOK 8 context: PMBOK 8 (Nov 2025) includes 6 principles, 7 performance domains, 5 focus areas, 40 processes. New exam (July 2026) has: People ~42%, Process ~50%, Business Environment ~8% (rising to ~26%).

Generate a JSON session response. Requirements:
- Micro lesson: focus on the first topic listed, practical and exam-focused
- ${qCount} questions total: mix all 3 ECO domains (proportional to their exam weights)
- Difficulty: ${diff}
- 50%+ of questions must be situational ("What should the PM do NEXT?")
- Each question must have plausible wrong answers (not obviously wrong)
- Include PMI mindset traps in explanations
- DO NOT repeat concepts from recent session (lastLesson: ${profile.lastLesson||"none"})

Respond ONLY with valid JSON, no markdown:
{
  "lesson": {
    "title": "...",
    "tldr": "one sentence core idea",
    "keyPoints": ["point 1","point 2","point 3","point 4"],
    "example": "real-world scenario applying this concept",
    "pmMindset": "the PMI thinking pattern this reinforces",
    "focusTopic": "the topic this lesson covers"
  },
  "questions": [
    {
      "domain": "people|process|bizEnv",
      "topic": "specific topic name",
      "difficulty": "Easy|Medium|Hard|Exam-level",
      "q": "full scenario question",
      "choices": ["A. ...","B. ...","C. ...","D. ..."],
      "correct": "A",
      "whyCorrect": "why A is correct, PMBOK 8 reference",
      "trap": "the specific trap/pitfall this question tests",
      "wrongAnswers": {"B":"why wrong","C":"why wrong","D":"why wrong"}
    }
  ]
}`;

  const res=await window.fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,
      messages:[{role:"user",content:prompt}]})
  });
  const data=await res.json();
  const txt=data.content?.find(b=>b.type==="text")?.text||"";
  return JSON.parse(txt.replace(/```json|```/g,"").trim());
}

async function generateSummary(score,domainScores,weakTopics,intensity,day){
  const prompt=`You are a PMP coach. Session complete on Day ${day}/60.

Results: ${score}% score, Domain breakdown: ${JSON.stringify(domainScores)}, Weak topics this session: ${weakTopics.join(", ")||"none identified"}

Generate a brief coaching summary as JSON:
{
  "headline": "one motivating sentence about their performance",
  "strengths": ["2 specific things they did well"],
  "improvements": ["2-3 specific areas to work on with actionable advice"],
  "nextFocus": "the single most important topic to study next",
  "mindsetCoach": "one PMI mindset tip reinforcing exam thinking patterns",
  "readinessImpact": "brief note on how this session moved their readiness"
}
Respond ONLY with valid JSON.`;

  const res=await window.fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,
      messages:[{role:"user",content:prompt}]})
  });
  const data=await res.json();
  const txt=data.content?.find(b=>b.type==="text")?.text||"";
  return JSON.parse(txt.replace(/```json|```/g,"").trim());
}

async function generateExamBatch(profile,batchNum,batchSize,examType){
  const day=getDay(profile.startDate);
  const isWeekly=examType==="weekly";
  const prompt=`You are a PMP exam generator. Generate ${batchSize} PMP exam questions (batch ${batchNum}) for a ${isWeekly?"60-question weekly":"180-question full"} simulation.

User Day: ${day}/60. Readiness: ${profile.readiness}%. Weak areas: ${profile.weakAreas.join(", ")||"none"}.

Domain distribution per batch: People ~42%, Process ~50%, Business Env ~8%.
Difficulty: mix of Medium, Hard, and Exam-level. All must be scenario-based situational questions.
PMBOK 8 aligned. July 2026 exam format.

Respond ONLY with valid JSON array (no wrapper object):
[{
  "domain":"people|process|bizEnv",
  "topic":"specific topic",
  "difficulty":"Medium|Hard|Exam-level",
  "q":"full scenario question",
  "choices":["A. ...","B. ...","C. ...","D. ..."],
  "correct":"A",
  "whyCorrect":"explanation",
  "trap":"the trap tested",
  "wrongAnswers":{"B":"why wrong","C":"why wrong","D":"why wrong"}
}]`;

  const res=await window.fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:3500,
      messages:[{role:"user",content:prompt}]})
  });
  const data=await res.json();
  const txt=data.content?.find(b=>b.type==="text")?.text||"";
  return JSON.parse(txt.replace(/```json|```/g,"").trim());
}

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
function Badge({children,color=C.gold,small=false}){
  return <span style={{background:color+"25",color,border:`1px solid ${color}44`,borderRadius:4,
    padding:small?"1px 7px":"2px 9px",fontSize:small?10:11,fontWeight:600,letterSpacing:"0.04em",whiteSpace:"nowrap"}}>{children}</span>;
}
function Btn({children,onClick,v="primary",full=false,disabled=false,small=false,s={}}){
  const base={fontFamily:F.b,fontWeight:600,fontSize:small?12:14,cursor:disabled?"not-allowed":"pointer",
    border:"none",borderRadius:8,padding:small?"8px 14px":"11px 20px",transition:"all .2s",
    opacity:disabled?.45:1,width:full?"100%":"auto",...s};
  const vs={primary:{background:`linear-gradient(135deg,${C.gold},#b8821a)`,color:"#060d1a"},
    sec:{background:"transparent",color:C.text,border:`1px solid ${C.border}`},
    ghost:{background:"transparent",color:C.muted,padding:small?"6px 10px":"8px 12px"},
    danger:{background:C.err+"22",color:C.err,border:`1px solid ${C.err}44`},
    accent:{background:C.accent+"22",color:C.accent,border:`1px solid ${C.accent}44`}};
  return <button onClick={onClick} disabled={disabled} style={{...base,...vs[v]}}>{children}</button>;
}
function PBar({val,max=100,color=C.gold,h=6,label=""}){
  const pct=Math.min(100,Math.round((val/max)*100));
  return(
    <div>
      {label&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:11,color:C.muted}}>{label}</span>
        <span style={{fontSize:11,color,fontWeight:600}}>{pct}%</span>
      </div>}
      <div style={{background:C.border,borderRadius:99,height:h,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${color},${color}99)`,
          borderRadius:99,transition:"width .6s ease"}}/>
      </div>
    </div>
  );
}
function ReadinessRing({score}){
  const r=44,cx=50,cy=50,stroke=7;
  const circ=2*Math.PI*r;
  const offset=circ-(score/100)*circ;
  const color=score>=70?C.ok:score>=45?C.gold:C.err;
  return(
    <div style={{position:"relative",width:110,height:110,flexShrink:0}}>
      <svg width="110" height="110" viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={stroke}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{transition:"stroke-dashoffset .8s ease"}}/>
      </svg>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
        <div style={{fontFamily:F.d,fontSize:22,fontWeight:700,color,lineHeight:1}}>{score}</div>
        <div style={{fontSize:9,color:C.muted,letterSpacing:"0.06em"}}>READINESS</div>
      </div>
    </div>
  );
}
function DomainBar({label,score,color}){
  return(
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:12,color:C.muted}}>{label}</span>
        <span style={{fontSize:12,color,fontWeight:600}}>{score}%</span>
      </div>
      <div style={{background:C.border,borderRadius:99,height:5,overflow:"hidden"}}>
        <div style={{width:`${score}%`,height:"100%",background:color,borderRadius:99,transition:"width .6s ease"}}/>
      </div>
    </div>
  );
}
function ShimmerBlock({h=48,w="100%",r=10}){
  return <div className="shimmer" style={{height:h,width:w,borderRadius:r,marginBottom:10}}/>;
}
function Section({title,color=C.gold,children}){
  return(
    <div style={{marginBottom:24}}>
      <div style={{fontSize:10,color,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:10}}>{title}</div>
      {children}
    </div>
  );
}

// ─── SCREENS ─────────────────────────────────────────────────────────────────

// ONBOARDING
function Onboarding({onStart}){
  const [intensity,setIntensity]=useState("Standard");
  const opts=[
    {id:"Light",icon:"🌱",time:"~30 min/day",q:"10 questions",desc:"Steady daily habit"},
    {id:"Standard",icon:"⚡",time:"~60 min/day",q:"14 questions",desc:"Recommended pace"},
    {id:"Intensive",icon:"🔥",time:"~90 min/day",q:"22 questions",desc:"Maximum speed"},
  ];
  return(
    <div className="fi" style={{padding:"40px 24px",maxWidth:480,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:11,color:C.gold,fontWeight:700,letterSpacing:"0.2em",marginBottom:12,textTransform:"uppercase"}}>PMP 60-Day Program</div>
        <h1 style={{fontFamily:F.d,fontSize:"clamp(28px,6vw,42px)",color:C.text,lineHeight:1.1,marginBottom:12}}>
          Your Path to<br/><span style={{color:C.gold}}>Above Target.</span>
        </h1>
        <p style={{color:C.muted,fontSize:14,lineHeight:1.7}}>AI-powered adaptive coaching aligned with PMBOK 8 and the PMP Exam Content Outline. Tracks your performance daily and adjusts to close your gaps.</p>
      </div>
      <div style={{marginBottom:28}}>
        <div style={{fontSize:11,color:C.muted,fontWeight:600,letterSpacing:"0.1em",marginBottom:12,textTransform:"uppercase"}}>Study Intensity</div>
        {opts.map(o=>(
          <div key={o.id} onClick={()=>setIntensity(o.id)} style={{background:intensity===o.id?C.gold+"18":C.card,
            border:`1px solid ${intensity===o.id?C.gold:C.border}`,borderRadius:12,padding:"14px 18px",
            cursor:"pointer",marginBottom:8,display:"flex",alignItems:"center",gap:14,transition:"all .2s"}}>
            <span style={{fontSize:24}}>{o.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:14,color:C.text}}>{o.id} <span style={{color:C.muted,fontWeight:400}}>· {o.time}</span></div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{o.q} per session · {o.desc}</div>
            </div>
            {intensity===o.id&&<div style={{width:8,height:8,borderRadius:99,background:C.gold,flexShrink:0}}/>}
          </div>
        ))}
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 18px",marginBottom:24}}>
        <div style={{fontSize:11,color:C.gold,fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>WHAT YOU GET</div>
        {["AI-generated lessons tailored to your gaps","Adaptive questions — harder when you're strong","Spaced repetition flashcards from your mistakes","Weekly 60-question exam simulations","Full 180-question mock exam at Day 25 & 50","Daily readiness score tracking all 3 ECO domains"].map((item,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
            <span style={{color:C.ok,flexShrink:0}}>✓</span>
            <span style={{fontSize:13,color:C.muted}}>{item}</span>
          </div>
        ))}
      </div>
      <Btn full onClick={()=>onStart(intensity)} s={{padding:"14px 20px",fontSize:15}}>
        Begin Day 1 →
      </Btn>
    </div>
  );
}

// DASHBOARD
function Dashboard({profile,onSession,onFlashcards,onExam}){
  const day=getDay(profile.startDate);
  const daysLeft=61-day;
  const recent=profile.sessionHistory.slice(-3).reverse();
  const examAvail=day>=25;
  const weeklyDue=day>0&&day%7===0&&!profile.weeklyExams.find(e=>e.day===day);

  return(
    <div className="fi" style={{padding:"20px 20px 80px"}}>
      {/* Header */}
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
          <div>
            <div style={{fontSize:11,color:C.gold,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase"}}>Day {day} of 60</div>
            <div style={{fontFamily:F.d,fontSize:24,color:C.text,lineHeight:1.1,marginTop:2}}>Mission Control</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,color:C.muted}}>{daysLeft} days left</div>
            <div style={{display:"flex",alignItems:"center",gap:4,marginTop:4,justifyContent:"flex-end"}}>
              <span style={{fontSize:14}}>🔥</span>
              <span style={{fontSize:13,color:C.warn,fontWeight:600}}>{profile.streak} day streak</span>
            </div>
          </div>
        </div>
        <div style={{background:C.border,borderRadius:99,height:3,marginTop:12}}>
          <div style={{width:`${(day/60)*100}%`,height:"100%",background:`linear-gradient(90deg,${C.gold},${C.ok})`,borderRadius:99}}/>
        </div>
      </div>

      {/* Readiness + Domains */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px",marginBottom:16}}>
        <div style={{display:"flex",gap:20,alignItems:"center"}}>
          <ReadinessRing score={profile.readiness}/>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:C.muted,fontWeight:600,letterSpacing:"0.1em",marginBottom:12,textTransform:"uppercase"}}>Domain Performance</div>
            <DomainBar label="People (~42%)" score={profile.domains.people} color={C.people}/>
            <DomainBar label="Process (~50%)" score={profile.domains.process} color={C.process}/>
            <DomainBar label="Business Env (~8%→26%)" score={profile.domains.bizEnv} color={C.biz}/>
          </div>
        </div>
        {profile.totalAnswered>0&&(
          <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.border}`,display:"flex",gap:12}}>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{fontFamily:F.d,fontSize:18,color:C.gold}}>{profile.totalAnswered}</div>
              <div style={{fontSize:10,color:C.muted}}>Questions</div>
            </div>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{fontFamily:F.d,fontSize:18,color:C.ok}}>{profile.sessionHistory.length}</div>
              <div style={{fontSize:10,color:C.muted}}>Sessions</div>
            </div>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{fontFamily:F.d,fontSize:18,color:C.people}}>{profile.flashcards.length}</div>
              <div style={{fontSize:10,color:C.muted}}>Flashcards</div>
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {weeklyDue&&(
        <div style={{background:C.gold+"18",border:`1px solid ${C.gold}55`,borderRadius:12,padding:"12px 16px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:C.gold}}>📋 Weekly Exam Due — Day {day}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>60-question simulation to benchmark progress</div>
          </div>
          <Btn small v="primary" onClick={()=>onExam("weekly")}>Take Now</Btn>
        </div>
      )}

      {/* Weak Areas */}
      {profile.weakAreas.length>0&&(
        <div style={{background:C.err+"12",border:`1px solid ${C.err}33`,borderRadius:12,padding:"12px 16px",marginBottom:12}}>
          <div style={{fontSize:11,color:C.err,fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>⚠ FOCUS AREAS</div>
          {profile.weakAreas.map((w,i)=>(
            <div key={i} style={{display:"flex",gap:6,marginBottom:4}}>
              <span style={{color:C.err,fontSize:11}}>↓</span>
              <span style={{fontSize:12,color:C.muted}}>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Strong Areas */}
      {profile.strongAreas.length>0&&(
        <div style={{background:C.ok+"12",border:`1px solid ${C.ok}33`,borderRadius:12,padding:"12px 16px",marginBottom:12}}>
          <div style={{fontSize:11,color:C.ok,fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>✓ PERFORMING WELL</div>
          {profile.strongAreas.map((s,i)=>(
            <div key={i} style={{display:"flex",gap:6,marginBottom:4}}>
              <span style={{color:C.ok,fontSize:11}}>↑</span>
              <span style={{fontSize:12,color:C.muted}}>{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* Primary CTA */}
      <Btn full onClick={onSession} s={{padding:"16px 20px",fontSize:16,marginBottom:12}}>
        👉 Start Today's Session — Day {day}
      </Btn>

      {/* Secondary Actions */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        <button onClick={onFlashcards} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",cursor:"pointer",textAlign:"left",fontFamily:F.b}}>
          <div style={{fontSize:18,marginBottom:4}}>🃏</div>
          <div style={{fontSize:13,fontWeight:600,color:C.text}}>Flashcards</div>
          <div style={{fontSize:11,color:C.muted}}>{profile.flashcards.length} cards</div>
        </button>
        <button onClick={()=>onExam("full")} disabled={!examAvail} style={{background:C.card,border:`1px solid ${examAvail?C.border:C.border+"55"}`,borderRadius:10,padding:"12px 14px",cursor:examAvail?"pointer":"not-allowed",textAlign:"left",fontFamily:F.b,opacity:examAvail?1:.5}}>
          <div style={{fontSize:18,marginBottom:4}}>🎯</div>
          <div style={{fontSize:13,fontWeight:600,color:C.text}}>Full Exam Sim</div>
          <div style={{fontSize:11,color:C.muted}}>{examAvail?"180 questions":"Unlocks Day 25"}</div>
        </button>
      </div>

      {/* Recent Sessions */}
      {recent.length>0&&(
        <Section title="Recent Sessions">
          {recent.map((s,i)=>(
            <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,color:C.text,fontWeight:500}}>Day {s.day} · {s.intensity}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>{s.correct}/{s.total} correct</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:16,fontWeight:700,color:s.score>=70?C.ok:s.score>=50?C.gold:C.err}}>{s.score}%</div>
                <div style={{display:"flex",gap:4,marginTop:4,justifyContent:"flex-end"}}>
                  {s.weakTopics?.slice(0,2).map((t,j)=><Badge key={j} color={C.err} small>{t.split(" ")[0]}</Badge>)}
                </div>
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Exam History */}
      {profile.weeklyExams.length>0&&(
        <Section title="Exam History">
          {profile.weeklyExams.slice(-3).reverse().map((e,i)=>(
            <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:12,color:C.muted}}>Weekly Exam · Day {e.day}</div>
              <div style={{fontSize:15,fontWeight:700,color:e.score>=70?C.ok:e.score>=50?C.gold:C.err}}>{e.score}%</div>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

// SESSION SETUP
function SessionSetup({profile,onStart,onBack}){
  const [intensity,setIntensity]=useState(profile.preferredIntensity||"Standard");
  const day=getDay(profile.startDate);
  const opts=[
    {id:"Light",icon:"🌱",time:"~30 min",q:10,desc:"Quick daily habit. 10 questions + focused lesson."},
    {id:"Standard",icon:"⚡",time:"~60 min",q:14,desc:"Recommended. Lesson + 14 questions + flashcard review."},
    {id:"Intensive",icon:"🔥",time:"~90 min",q:22,desc:"Deep work. Full lesson + 22 questions + spaced review."},
  ];
  const topicPreview=selectTopics(profile,3);
  return(
    <div className="fi" style={{padding:"20px 20px 40px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <Btn v="ghost" onClick={onBack}>← Dashboard</Btn>
        <Badge color={C.gold}>Day {day} of 60</Badge>
      </div>
      <h2 style={{fontFamily:F.d,fontSize:22,color:C.text,marginBottom:4}}>Today's Session</h2>
      <p style={{color:C.muted,fontSize:13,marginBottom:20}}>AI will tailor your lesson and questions based on your performance gaps.</p>

      <Section title="Focus Topics Today">
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {topicPreview.map((t,i)=><Badge key={i} color={i===0?C.gold:C.muted}>{t}</Badge>)}
          {profile.weakAreas.length>0&&<Badge color={C.err}>+Weak Areas</Badge>}
        </div>
      </Section>

      <Section title="Session Intensity">
        {opts.map(o=>(
          <div key={o.id} onClick={()=>setIntensity(o.id)} style={{background:intensity===o.id?C.gold+"15":C.card,
            border:`1px solid ${intensity===o.id?C.gold:C.border}`,borderRadius:12,padding:"14px 16px",
            cursor:"pointer",marginBottom:8,display:"flex",alignItems:"center",gap:12,transition:"all .2s"}}>
            <span style={{fontSize:22}}>{o.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:600,fontSize:13,color:C.text}}>{o.id} <span style={{color:C.muted,fontWeight:400}}>· {o.time} · {o.q} questions</span></div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{o.desc}</div>
            </div>
            <div style={{width:8,height:8,borderRadius:99,background:intensity===o.id?C.gold:C.border,transition:"background .2s",flexShrink:0}}/>
          </div>
        ))}
      </Section>

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:20}}>
        <div style={{fontSize:11,color:C.muted,fontWeight:600,letterSpacing:"0.08em",marginBottom:8}}>SESSION FLOW</div>
        {["📖 Micro Lesson (5–10 min)","❓ Practice Questions with Instant Feedback","🃏 Auto-generated Flashcards from Mistakes","📊 Session Summary & Recommendations"].map((s,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
            <span style={{color:C.gold,flexShrink:0,fontSize:11,marginTop:2}}>→</span>
            <span style={{fontSize:13,color:C.muted}}>{s}</span>
          </div>
        ))}
      </div>
      <Btn full onClick={()=>onStart(intensity)} s={{padding:"14px",fontSize:15}}>
        Generate Session with AI →
      </Btn>
    </div>
  );
}

// LESSON PHASE
function LessonPhase({lesson,onContinue}){
  return(
    <div className="fi" style={{padding:"20px 20px 40px"}}>
      <div style={{fontSize:10,color:C.gold,fontWeight:700,letterSpacing:"0.2em",marginBottom:16,textTransform:"uppercase"}}>📖 Micro Lesson</div>
      <h2 style={{fontFamily:F.d,fontSize:22,color:C.text,lineHeight:1.2,marginBottom:8}}>{lesson.title}</h2>
      <div style={{background:C.gold+"18",border:`1px solid ${C.gold}44`,borderRadius:10,padding:"12px 14px",marginBottom:20}}>
        <div style={{fontSize:14,color:C.gold,fontWeight:500,lineHeight:1.6}}>{lesson.tldr}</div>
      </div>
      <Section title="Key Points">
        {lesson.keyPoints.map((p,i)=>(
          <div key={i} style={{display:"flex",gap:10,marginBottom:10}}>
            <div style={{width:20,height:20,borderRadius:99,background:C.gold+"25",color:C.gold,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{i+1}</div>
            <span style={{fontSize:13,color:C.muted,lineHeight:1.65}}>{p}</span>
          </div>
        ))}
      </Section>
      <Section title="Real-World Example">
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px"}}>
          <div style={{fontSize:13,color:C.muted,lineHeight:1.7,fontStyle:"italic"}}>{lesson.example}</div>
        </div>
      </Section>
      <Section title="PMI Mindset Pattern">
        <div style={{background:C.purple+"18",border:`1px solid ${C.purple}44`,borderRadius:10,padding:"14px 16px"}}>
          <div style={{fontSize:11,color:C.purple,fontWeight:700,marginBottom:6,letterSpacing:"0.08em"}}>🧠 THINK LIKE PMI</div>
          <div style={{fontSize:13,color:C.muted,lineHeight:1.65}}>{lesson.pmMindset}</div>
        </div>
      </Section>
      <Btn full onClick={onContinue} s={{padding:"14px",fontSize:14}}>
        Ready — Start Questions →
      </Btn>
    </div>
  );
}

// QUESTION PHASE
function QuestionPhase({questions,onComplete}){
  const [qi,setQi]=useState(0);
  const [answers,setAnswers]=useState([]);
  const [sel,setSel]=useState(null);
  const [showReview,setShowReview]=useState(false);
  const q=questions[qi];
  const total=questions.length;
  const correct=answers.filter((a,i)=>a===questions[i]?.correct).length;

  const pick=(ch)=>{
    if(sel!==null)return;
    setSel(ch);
    setShowReview(true);
  };

  const next=()=>{
    const newAnswers=[...answers,sel];
    if(qi+1<total){
      setAnswers(newAnswers);
      setQi(qi+1);
      setSel(null);
      setShowReview(false);
    }else{
      onComplete(newAnswers,questions);
    }
  };

  if(!q)return null;
  const isCorrect=sel&&sel===q.correct;
  const domColor=DC[q.domain]||C.gold;

  const cc=(ch)=>{
    if(!sel)return{bg:C.card,br:C.border,col:C.text};
    if(ch===q.correct)return{bg:C.ok+"22",br:C.ok,col:C.text};
    if(ch===sel&&ch!==q.correct)return{bg:C.err+"22",br:C.err,col:C.text};
    return{bg:C.card,br:C.border+"44",col:C.muted};
  };

  return(
    <div className="fi" style={{padding:"16px 20px 40px"}}>
      {/* Progress bar */}
      <div style={{marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <div style={{display:"flex",gap:6}}>
            <Badge color={domColor} small>{DL[q.domain]||q.domain}</Badge>
            <Badge color={C.muted} small>{q.difficulty}</Badge>
          </div>
          <span style={{fontSize:12,color:C.muted}}>{qi+1}/{total}</span>
        </div>
        <div style={{background:C.border,borderRadius:99,height:4,overflow:"hidden"}}>
          <div style={{width:`${((qi)/(total))*100}%`,height:"100%",background:`linear-gradient(90deg,${C.gold},${C.ok})`,transition:"width .4s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          <span style={{fontSize:10,color:C.muted}}>{q.topic}</span>
          <span style={{fontSize:10,color:correct>=qi*.7?C.ok:C.muted}}>{correct} correct so far</span>
        </div>
      </div>

      {/* Question */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 16px",marginBottom:14,fontSize:14,color:C.text,lineHeight:1.75}}>{q.q}</div>

      {/* Choices */}
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
        {q.choices.map((c,i)=>{
          const col=cc(c);
          const letter=c.charAt(0);
          return(
            <button key={i} onClick={()=>pick(c)} style={{background:col.bg,border:`1px solid ${col.br}`,borderRadius:10,
              padding:"12px 14px",cursor:sel?"default":"pointer",textAlign:"left",color:col.col,
              fontFamily:F.b,fontSize:13,lineHeight:1.55,transition:"all .2s",display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontWeight:700,flexShrink:0,color:!sel?C.muted:c===q.correct?C.ok:c===sel?C.err:C.muted}}>{letter}.</span>
              <span>{c.slice(3)}</span>
              {sel&&c===q.correct&&<span style={{marginLeft:"auto",flexShrink:0,color:C.ok}}>✓</span>}
              {sel&&c===sel&&c!==q.correct&&<span style={{marginLeft:"auto",flexShrink:0,color:C.err}}>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Review Panel */}
      {showReview&&(
        <div className="fi">
          <div style={{background:isCorrect?C.ok+"15":C.err+"15",border:`1px solid ${isCorrect?C.ok:C.err}44`,
            borderRadius:12,padding:"14px 16px",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:isCorrect?C.ok:C.err,marginBottom:8}}>
              {isCorrect?"✓ CORRECT":"✗ INCORRECT"} — Correct answer: {q.correct}
            </div>
            <div style={{fontSize:13,color:C.muted,lineHeight:1.65,marginBottom:10}}>{q.whyCorrect}</div>
            {!isCorrect&&q.wrongAnswers?.[sel?.charAt(0)]&&(
              <div style={{paddingTop:8,borderTop:`1px solid ${C.border}`,fontSize:12,color:C.muted}}>
                <span style={{color:C.err,fontWeight:600}}>Why {sel?.charAt(0)} is wrong: </span>{q.wrongAnswers[sel?.charAt(0)]}
              </div>
            )}
          </div>
          <div style={{background:C.purple+"15",border:`1px solid ${C.purple}33`,borderRadius:10,padding:"10px 14px",marginBottom:12}}>
            <span style={{fontSize:11,color:C.purple,fontWeight:700}}>🎯 TRAP: </span>
            <span style={{fontSize:12,color:C.muted}}>{q.trap}</span>
          </div>
          {/* Wrong answer explanations */}
          {!isCorrect&&(
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",marginBottom:12}}>
              <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:8}}>ALL ANSWER ANALYSIS</div>
              {q.choices.filter(c=>c.charAt(0)!==q.correct).map((c,i)=>(
                <div key={i} style={{marginBottom:6}}>
                  <span style={{fontSize:12,color:C.err,fontWeight:600}}>{c.charAt(0)}: </span>
                  <span style={{fontSize:12,color:C.muted}}>{q.wrongAnswers?.[c.charAt(0)]||"Incorrect for this scenario."}</span>
                </div>
              ))}
            </div>
          )}
          <Btn full onClick={next} s={{padding:"12px",fontSize:13}}>
            {qi+1<total?"Next Question →":"Complete Session →"}
          </Btn>
        </div>
      )}
    </div>
  );
}

// SESSION SUMMARY
function SessionSummary({score,correct,total,summary,newFlashcards,weakTopics,onDone,loading}){
  const color=score>=70?C.ok:score>=50?C.gold:C.err;
  const grade=score>=80?"Above Target 🌟":score>=70?"On Target ✓":score>=50?"Needs Work ⚡":"Below Target ⚠";
  return(
    <div className="fi" style={{padding:"20px 20px 60px"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:11,color:C.gold,fontWeight:700,letterSpacing:"0.15em",marginBottom:8,textTransform:"uppercase"}}>Session Complete</div>
        <div style={{fontFamily:F.d,fontSize:56,color,lineHeight:1,marginBottom:4}}>{score}<span style={{fontSize:24}}>%</span></div>
        <div style={{fontSize:14,color:C.muted}}>{correct} of {total} correct · <span style={{color}}>{grade}</span></div>
      </div>

      {loading?(
        <div style={{padding:"20px 0"}}>
          <ShimmerBlock h={80}/><ShimmerBlock h={60}/><ShimmerBlock h={60}/>
          <div style={{fontSize:12,color:C.muted,textAlign:"center"}}>Coach analyzing your session...</div>
        </div>
      ):summary&&(
        <>
          <div style={{background:C.card,border:`1px solid ${color}44`,borderRadius:14,padding:"16px 18px",marginBottom:16}}>
            <div style={{fontSize:14,color:C.text,lineHeight:1.65,marginBottom:12,fontStyle:"italic"}}>"{summary.headline}"</div>
            <div style={{fontSize:11,color:C.ok,fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>STRENGTHS</div>
            {summary.strengths?.map((s,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
                <span style={{color:C.ok,flexShrink:0}}>✓</span>
                <span style={{fontSize:12,color:C.muted}}>{s}</span>
              </div>
            ))}
          </div>

          {summary.improvements?.length>0&&(
            <div style={{background:C.err+"12",border:`1px solid ${C.err}33`,borderRadius:12,padding:"14px 16px",marginBottom:14}}>
              <div style={{fontSize:11,color:C.err,fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>IMPROVEMENT AREAS</div>
              {summary.improvements.map((imp,i)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
                  <span style={{color:C.err,flexShrink:0}}>→</span>
                  <span style={{fontSize:12,color:C.muted}}>{imp}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{background:C.purple+"15",border:`1px solid ${C.purple}33`,borderRadius:12,padding:"14px 16px",marginBottom:14}}>
            <div style={{fontSize:11,color:C.purple,fontWeight:700,letterSpacing:"0.08em",marginBottom:6}}>🧠 MINDSET COACHING</div>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.65}}>{summary.mindsetCoach}</div>
          </div>

          <div style={{background:C.gold+"12",border:`1px solid ${C.gold}33`,borderRadius:12,padding:"12px 16px",marginBottom:16}}>
            <div style={{fontSize:11,color:C.gold,fontWeight:700,marginBottom:4}}>NEXT SESSION FOCUS</div>
            <div style={{fontSize:13,color:C.text}}>{summary.nextFocus}</div>
          </div>
        </>
      )}

      {newFlashcards?.length>0&&(
        <div style={{background:C.accent+"12",border:`1px solid ${C.accent}33`,borderRadius:12,padding:"12px 16px",marginBottom:16}}>
          <div style={{fontSize:11,color:C.accent,fontWeight:700,marginBottom:4}}>🃏 {newFlashcards.length} NEW FLASHCARDS ADDED</div>
          <div style={{fontSize:12,color:C.muted}}>From your missed questions — review them in the Flashcard deck.</div>
        </div>
      )}

      <Btn full onClick={onDone} s={{padding:"14px",fontSize:14}}>
        Back to Dashboard
      </Btn>
    </div>
  );
}

// FLASHCARD DECK
function FlashcardDeck({profile,onBack,onUpdate}){
  const [idx,setIdx]=useState(0);
  const [flip,setFlip]=useState(false);
  const [filter,setFilter]=useState("all");
  const today=new Date().toISOString().split("T")[0];
  const due=profile.flashcards.filter(c=>!c.nextReview||c.nextReview<=today);
  const deck=filter==="due"?due:profile.flashcards;

  const handleSM2=(card,quality)=>{
    // Simplified SM-2
    let ease=card.ease||2.5;
    let interval=card.interval||1;
    if(quality>=3){
      interval=interval<=1?4:interval<=4?6:Math.round(interval*ease);
      ease=Math.max(1.3,ease+(0.1-(5-quality)*(0.08+(5-quality)*0.02)));
    }else{interval=1;}
    const nr=new Date(Date.now()+interval*86400000).toISOString().split("T")[0];
    return{...card,ease,interval,nextReview:nr,lastReview:today};
  };

  const rate=(q)=>{
    if(idx>=deck.length)return;
    const card=deck[idx];
    const updated=handleSM2(card,q);
    const newCards=profile.flashcards.map(c=>c.q===card.q?updated:c);
    onUpdate({...profile,flashcards:newCards});
    setIdx(idx+1);
    setFlip(false);
  };

  if(deck.length===0)return(
    <div className="fi" style={{padding:"40px 24px",textAlign:"center"}}>
      <Btn v="ghost" onClick={onBack} s={{marginBottom:24}}>← Back</Btn>
      <div style={{fontSize:40,marginBottom:16}}>🃏</div>
      <h2 style={{fontFamily:F.d,fontSize:20,color:C.text,marginBottom:8}}>No Flashcards Yet</h2>
      <p style={{color:C.muted,fontSize:13}}>Flashcards are auto-generated from questions you miss during sessions. Complete a few sessions to build your deck.</p>
    </div>
  );

  const card=deck[idx%deck.length];
  const done=idx>=deck.length;

  return(
    <div className="fi" style={{padding:"20px 20px 60px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <Btn v="ghost" onClick={onBack}>← Back</Btn>
        <div style={{display:"flex",gap:6}}>
          <Badge color={C.ok}>{due.length} due</Badge>
          <Badge color={C.muted}>{profile.flashcards.length} total</Badge>
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {["all","due"].map(f=>(
          <button key={f} onClick={()=>{setFilter(f);setIdx(0);setFlip(false);}}
            style={{background:filter===f?C.gold+"22":"transparent",border:`1px solid ${filter===f?C.gold:C.border}`,
            borderRadius:7,padding:"6px 14px",cursor:"pointer",fontSize:12,color:filter===f?C.gold:C.muted,fontFamily:F.b,fontWeight:600}}>
            {f==="all"?"All Cards":"Due Today"}
          </button>
        ))}
      </div>
      {!done?(
        <>
          <div style={{marginBottom:8,fontSize:12,color:C.muted,textAlign:"right"}}>{idx+1} / {deck.length}</div>
          <div onClick={()=>setFlip(!flip)} style={{background:C.card,border:`1px solid ${flip?C.gold+"66":C.border}`,
            borderRadius:16,padding:"32px 24px",minHeight:200,cursor:"pointer",marginBottom:16,
            display:"flex",flexDirection:"column",justifyContent:"center",transition:"border-color .3s"}}>
            <div style={{fontSize:10,color:flip?C.gold:C.accent,letterSpacing:"0.15em",fontWeight:700,marginBottom:14,textTransform:"uppercase"}}>
              {flip?"Answer":"Question — tap to flip"}
            </div>
            <div style={{fontSize:"clamp(13px,3vw,16px)",color:C.text,lineHeight:1.7,whiteSpace:"pre-line"}}>{flip?card.a:card.q}</div>
            {!flip&&<div style={{position:"absolute",bottom:16,right:20,opacity:.3,fontSize:14}}>👆</div>}
            {card.topic&&<div style={{marginTop:14}}><Badge color={C.muted} small>{card.topic}</Badge></div>}
          </div>
          {flip&&(
            <div className="fi">
              <div style={{fontSize:11,color:C.muted,textAlign:"center",marginBottom:8}}>How well did you know this?</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                {[{q:1,l:"Forgot",c:C.err},{q:2,l:"Hard",c:C.warn},{q:3,l:"OK",c:C.gold},{q:4,l:"Easy",c:C.ok}].map(r=>(
                  <button key={r.q} onClick={()=>rate(r.q)} style={{background:r.c+"22",border:`1px solid ${r.c}44`,
                    borderRadius:8,padding:"10px 4px",cursor:"pointer",textAlign:"center",color:r.c,
                    fontFamily:F.b,fontSize:11,fontWeight:600}}>
                    {r.l}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ):(
        <div style={{textAlign:"center",padding:"40px 0"}}>
          <div style={{fontSize:32,marginBottom:12}}>🎉</div>
          <h3 style={{fontFamily:F.d,fontSize:20,color:C.text,marginBottom:8}}>All Done!</h3>
          <p style={{color:C.muted,fontSize:13,marginBottom:20}}>You've reviewed all {deck.length} cards. Come back tomorrow for spaced repetition.</p>
          <Btn onClick={()=>{setIdx(0);setFlip(false);}}>Review Again</Btn>
        </div>
      )}
    </div>
  );
}

// EXAM SIMULATION
function ExamSim({profile,examType,onComplete,onBack}){
  const [questions,setQuestions]=useState([]);
  const [qi,setQi]=useState(0);
  const [answers,setAnswers]=useState([]);
  const [sel,setSel]=useState(null);
  const [showReview,setShowReview]=useState(false);
  const [loading,setLoading]=useState(false);
  const [loadingMore,setLoadingMore]=useState(false);
  const [started,setStarted]=useState(false);
  const [phase,setPhase]=useState("intro");// intro|exam|results
  const [results,setResults]=useState(null);

  const isWeekly=examType==="weekly";
  const targetQ=isWeekly?60:180;
  const batchSize=20;

  const loadBatch=useCallback(async(batchNum)=>{
    setLoadingMore(true);
    try{
      const batch=await generateExamBatch(profile,batchNum,batchSize,examType);
      setQuestions(prev=>[...prev,...batch]);
    }catch(e){console.error("Batch load error:",e);}
    finally{setLoadingMore(false);}
  },[profile,examType]);

  const startExam=async()=>{
    setPhase("loading");
    setLoading(true);
    try{
      const batch=await generateExamBatch(profile,1,batchSize,examType);
      setQuestions(batch);
      setPhase("exam");
    }catch(e){setPhase("intro");}
    finally{setLoading(false);}
  };

  const handlePick=(ch)=>{
    if(sel!==null)return;
    setSel(ch);
    setShowReview(true);
  };

  const handleNext=async()=>{
    const newAnswers=[...answers,sel];
    const nextQi=qi+1;
    setAnswers(newAnswers);
    setQi(nextQi);
    setSel(null);
    setShowReview(false);
    // Load more batches as needed
    if(nextQi>=questions.length&&questions.length<targetQ&&!loadingMore){
      await loadBatch(Math.floor(questions.length/batchSize)+1);
    }
    if(nextQi>=targetQ||(nextQi>=questions.length&&questions.length>=targetQ)){
      // Calculate results
      const correct=newAnswers.filter((a,i)=>a===questions[i]?.correct).length;
      const score=Math.round(correct/Math.min(newAnswers.length,targetQ)*100);
      const domCorrect={people:0,process:0,bizEnv:0};
      const domTotal={people:0,process:0,bizEnv:0};
      newAnswers.forEach((a,i)=>{
        const q=questions[i];if(!q)return;
        const dom=q.domain||"process";
        domTotal[dom]=(domTotal[dom]||0)+1;
        if(a===q.correct)domCorrect[dom]=(domCorrect[dom]||0)+1;
      });
      const domScores={
        people:domTotal.people>0?Math.round(domCorrect.people/domTotal.people*100):0,
        process:domTotal.process>0?Math.round(domCorrect.process/domTotal.process*100):0,
        bizEnv:domTotal.bizEnv>0?Math.round(domCorrect.bizEnv/domTotal.bizEnv*100):0,
      };
      const passProb=score>=65?Math.round(50+score*.5):Math.round(score*.8);
      setResults({score,correct,total:newAnswers.length,domScores,passProb});
      setPhase("results");
      onComplete({score,domScores,passProb,examType,day:getDay(profile.startDate)});
    }
  };

  const q=questions[qi];
  const progress=Math.round((qi/targetQ)*100);

  if(phase==="intro")return(
    <div className="fi" style={{padding:"24px 20px 60px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:24}}>
        <Btn v="ghost" onClick={onBack}>← Back</Btn>
        <Badge color={isWeekly?C.gold:C.err}>{isWeekly?"Weekly Exam":"Full Exam Sim"}</Badge>
      </div>
      <h2 style={{fontFamily:F.d,fontSize:22,color:C.text,marginBottom:8}}>{isWeekly?"Weekly Assessment":"Full PMP Simulation"}</h2>
      <p style={{color:C.muted,fontSize:13,marginBottom:20}}>{isWeekly?"60 scenario-based questions. Same format as the real PMP exam.":"180 questions. Full exam simulation. Expected time: 4 hours in real exam."}</p>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px",marginBottom:20}}>
        {[
          `${targetQ} PMP-style situational questions`,
          "Mixed difficulty: Medium, Hard, and Exam-level",
          "All three ECO domains: People, Process, Business Env",
          "Immediate explanation after each question",
          `Domain-level score breakdown at completion`,
          isWeekly?"~60 min":"~180 min estimated",
        ].map((item,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
            <span style={{color:C.gold,flexShrink:0}}>→</span>
            <span style={{fontSize:13,color:C.muted}}>{item}</span>
          </div>
        ))}
      </div>
      <Btn full onClick={startExam} s={{padding:"14px",fontSize:14}}>
        Begin Exam — {targetQ} Questions
      </Btn>
    </div>
  );

  if(phase==="loading")return(
    <div style={{padding:"40px 20px",textAlign:"center"}}>
      <div className="pulse" style={{fontSize:32,marginBottom:16}}>📋</div>
      <div style={{fontFamily:F.d,fontSize:18,color:C.text,marginBottom:8}}>Generating Your Exam</div>
      <div style={{fontSize:13,color:C.muted,marginBottom:20}}>AI is crafting {batchSize} unique scenario questions...</div>
      <ShimmerBlock h={80}/><ShimmerBlock h={50}/><ShimmerBlock h={50}/><ShimmerBlock h={50}/>
    </div>
  );

  if(phase==="results"&&results)return(
    <div className="fi" style={{padding:"24px 20px 60px"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:11,color:C.gold,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>
          {isWeekly?"Weekly Exam Complete":"Full Simulation Complete"}
        </div>
        <div style={{fontFamily:F.d,fontSize:52,color:results.score>=70?C.ok:results.score>=50?C.gold:C.err,lineHeight:1,marginBottom:4}}>
          {results.score}<span style={{fontSize:22}}>%</span>
        </div>
        <div style={{fontSize:14,color:C.muted,marginBottom:4}}>{results.correct} of {results.total} correct</div>
        <Badge color={results.passProb>=70?C.ok:C.warn}>Pass Probability: ~{results.passProb}%</Badge>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 18px",marginBottom:16}}>
        <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:"0.1em",marginBottom:14}}>DOMAIN BREAKDOWN</div>
        <DomainBar label="People" score={results.domScores.people} color={C.people}/>
        <DomainBar label="Process" score={results.domScores.process} color={C.process}/>
        <DomainBar label="Business Environment" score={results.domScores.bizEnv} color={C.biz}/>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:16}}>
        <div style={{fontSize:11,color:C.gold,fontWeight:700,marginBottom:8}}>READINESS ASSESSMENT</div>
        {results.score>=80&&<p style={{fontSize:13,color:C.muted}}>🌟 Excellent performance. You're tracking well above target. Maintain this and you're on pace to pass with Above Target scores.</p>}
        {results.score>=70&&results.score<80&&<p style={{fontSize:13,color:C.muted}}>✓ Good performance. You're on track to pass. Focus on your lowest domain to push into Above Target territory.</p>}
        {results.score>=55&&results.score<70&&<p style={{fontSize:13,color:C.muted}}>⚡ You're getting there. Focus on improving your weakest domain and practice more scenario-based questions. You need more exam-level practice.</p>}
        {results.score<55&&<p style={{fontSize:13,color:C.muted}}>⚠ More work needed. Revisit fundamentals, especially in your lowest domains. Focus on understanding WHY answers are correct, not just memorizing content.</p>}
      </div>
      <Btn full onClick={onBack} s={{padding:"14px",fontSize:14}}>Back to Dashboard</Btn>
    </div>
  );

  // Exam question view
  if(!q)return(
    <div style={{padding:"40px 20px",textAlign:"center"}}>
      <div className="pulse" style={{fontSize:32,marginBottom:12}}>⏳</div>
      <div style={{fontSize:14,color:C.muted}}>Loading next questions...</div>
      <ShimmerBlock h={80}/><ShimmerBlock h={48}/><ShimmerBlock h={48}/>
    </div>
  );

  const isCorrect=sel&&sel===q.correct;
  const domColor=DC[q.domain]||C.gold;

  const cc=(ch)=>{
    if(!sel)return{bg:C.card,br:C.border,col:C.text};
    if(ch===q.correct)return{bg:C.ok+"22",br:C.ok,col:C.text};
    if(ch===sel&&ch!==q.correct)return{bg:C.err+"22",br:C.err,col:C.text};
    return{bg:C.card,br:C.border+"44",col:C.muted};
  };

  return(
    <div className="fi" style={{padding:"14px 20px 60px"}}>
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <div style={{display:"flex",gap:6}}>
            <Badge color={domColor} small>{DL[q.domain]||q.domain}</Badge>
            <Badge color={C.muted} small>Q{qi+1}/{targetQ}</Badge>
          </div>
          <span style={{fontSize:12,color:isWeekly?C.gold:C.err,fontWeight:600}}>{isWeekly?"Weekly":"Full Exam"}</span>
        </div>
        <div style={{background:C.border,borderRadius:99,height:3}}>
          <div style={{width:`${progress}%`,height:"100%",background:`linear-gradient(90deg,${C.gold},${C.ok})`,transition:"width .4s"}}/>
        </div>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px",marginBottom:12,fontSize:14,color:C.text,lineHeight:1.75}}>{q.q}</div>
      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
        {q.choices.map((c,i)=>{
          const col=cc(c);
          return(
            <button key={i} onClick={()=>handlePick(c)} style={{background:col.bg,border:`1px solid ${col.br}`,
              borderRadius:10,padding:"11px 14px",cursor:sel?"default":"pointer",textAlign:"left",
              color:col.col,fontFamily:F.b,fontSize:13,lineHeight:1.5,transition:"all .2s",
              display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontWeight:700,flexShrink:0,color:!sel?C.muted:c===q.correct?C.ok:c===sel?C.err:C.muted}}>{c.charAt(0)}.</span>
              <span>{c.slice(3)}</span>
            </button>
          );
        })}
      </div>
      {showReview&&(
        <div className="fi">
          <div style={{background:isCorrect?C.ok+"15":C.err+"15",border:`1px solid ${isCorrect?C.ok:C.err}44`,
            borderRadius:10,padding:"12px 14px",marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:700,color:isCorrect?C.ok:C.err,marginBottom:6}}>
              {isCorrect?"✓ CORRECT":"✗ INCORRECT"} — Answer: {q.correct}
            </div>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>{q.whyCorrect}</div>
          </div>
          <div style={{background:C.purple+"12",border:`1px solid ${C.purple}33`,borderRadius:8,padding:"8px 12px",marginBottom:10}}>
            <span style={{fontSize:10,color:C.purple,fontWeight:700}}>TRAP: </span>
            <span style={{fontSize:11,color:C.muted}}>{q.trap}</span>
          </div>
          {loadingMore&&<div style={{textAlign:"center",fontSize:12,color:C.muted,padding:"6px 0"}}>Loading next questions...</div>}
          <Btn full onClick={handleNext} s={{padding:"11px",fontSize:13}}>
            {qi+1<targetQ?`Next Question →`:"See Results →"}
          </Btn>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [profile,setProfile]=useState(null);
  const [screen,setScreen]=useState("loading");// loading|onboarding|dashboard|setup|session|flashcards|exam
  const [sessionData,setSessionData]=useState(null);
  const [sessionPhase,setSessionPhase]=useState("loading");// loading|lesson|questions|summary
  const [summaryData,setSummaryData]=useState(null);
  const [summaryLoading,setSummaryLoading]=useState(false);
  const [sessionAnswers,setSessionAnswers]=useState([]);
  const [sessionQuestions,setSessionQuestions]=useState([]);
  const [examType,setExamType]=useState("weekly");
  const [sessionError,setSessionError]=useState(null);

  // Load profile on mount
  useEffect(()=>{
    loadProfile().then(p=>{
      if(p){setProfile(p);setScreen("dashboard");}
      else{setScreen("onboarding");}
    });
  },[]);

  const persistProfile=(p)=>{setProfile(p);saveProfile(p);};

  const handleOnboardingComplete=async(intensity)=>{
    const p=freshProfile(intensity);
    persistProfile(p);
    setScreen("setup");
  };

  const handleStartSession=async(intensity)=>{
    setScreen("session");
    setSessionPhase("loading");
    setSessionError(null);
    setSessionData(null);
    setSummaryData(null);
    try{
      const data=await generateSession(profile,intensity);
      setSessionData({...data,intensity});
      const updatedProfile={...profile,preferredIntensity:intensity,lastLesson:data.lesson?.focusTopic||null};
      persistProfile(updatedProfile);
      setSessionPhase("lesson");
    }catch(e){
      setSessionError("Failed to generate session. Please check your connection and try again.");
      setSessionPhase("error");
    }
  };

  const handleQuestionsComplete=async(answers,questions)=>{
    setSessionAnswers(answers);
    setSessionQuestions(questions);
    const correct=answers.filter((a,i)=>a===questions[i]?.correct).length;
    const score=Math.round(correct/answers.length*100);
    // Find weak topics this session
    const topicErrors={};
    answers.forEach((a,i)=>{
      const q=questions[i];if(!q||a===q.correct)return;
      topicErrors[q.topic]=(topicErrors[q.topic]||0)+1;
    });
    const weakTopics=Object.entries(topicErrors).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k);
    // Build domain scores for this session
    const dc={people:0,process:0,bizEnv:0},dt={people:0,process:0,bizEnv:0};
    answers.forEach((a,i)=>{const q=questions[i];if(!q)return;const dom=q.domain||"process";dt[dom]++;if(a===q.correct)dc[dom]++;});
    const domScores={
      people:dt.people>0?Math.round(dc.people/dt.people*100):null,
      process:dt.process>0?Math.round(dc.process/dt.process*100):null,
      bizEnv:dt.bizEnv>0?Math.round(dc.bizEnv/dt.bizEnv*100):null,
    };
    // Auto-generate flashcards from missed questions
    const newFlashcards=questions
      .filter((q,i)=>answers[i]!==q.correct)
      .slice(0,5)
      .map(q=>({
        q:q.q,
        a:`Correct: ${q.correct}\n\n${q.whyCorrect}\n\nTrap: ${q.trap}`,
        topic:q.topic,ease:2.5,interval:1,
        nextReview:new Date(Date.now()+86400000).toISOString().split("T")[0],
      }));
    // Update profile
    const updatedProfile=updateProfile(profile,answers,questions);
    updatedProfile.flashcards=[...updatedProfile.flashcards,...newFlashcards].slice(-100);
    const sessionEntry={
      day:getDay(profile.startDate),
      intensity:sessionData?.intensity||"Standard",
      score,correct,total:answers.length,weakTopics,
      date:new Date().toISOString().split("T")[0],
    };
    updatedProfile.sessionHistory=[...updatedProfile.sessionHistory,sessionEntry].slice(-10);
    persistProfile(updatedProfile);
    setSessionPhase("summary");
    setSummaryData({score,correct,total:answers.length,weakTopics,newFlashcards});
    // Get AI coaching summary
    setSummaryLoading(true);
    try{
      const sum=await generateSummary(score,domScores,weakTopics,sessionData?.intensity||"Standard",getDay(profile.startDate));
      setSummaryData(prev=>({...prev,summary:sum}));
    }catch{}
    setSummaryLoading(false);
  };

  const handleExamComplete=(examResult)=>{
    const updatedProfile={...profile};
    if(examResult.examType==="weekly"){
      updatedProfile.weeklyExams=[...updatedProfile.weeklyExams,examResult];
    }else{
      updatedProfile.fullExams=[...updatedProfile.fullExams,examResult];
    }
    // Also update domain scores
    Object.entries(examResult.domScores).forEach(([dom,score])=>{
      if(score>0)updatedProfile.domains[dom]=Math.round(updatedProfile.domains[dom]*.6+score*.4);
    });
    updatedProfile.readiness=calcReadiness(updatedProfile);
    persistProfile(updatedProfile);
  };

  // ── RENDER ──
  const day=profile?getDay(profile.startDate):1;

  if(screen==="loading")return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div className="pulse" style={{fontFamily:F.d,fontSize:24,color:C.gold,marginBottom:8}}>PMP Coach</div>
        <div style={{fontSize:12,color:C.muted}}>Loading your profile...</div>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:F.b,color:C.text,maxWidth:580,margin:"0 auto"}}>
      <style>{GS}</style>

      {/* Top Bar */}
      {screen!=="onboarding"&&(
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"11px 20px",
          display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:26,height:26,background:`linear-gradient(135deg,${C.gold},#b8821a)`,borderRadius:6,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>📐</div>
            <div>
              <div style={{fontFamily:F.d,fontSize:13,fontWeight:700,color:C.text,lineHeight:1}}>PMP Coach</div>
              <div style={{fontSize:9,color:C.muted,letterSpacing:"0.05em"}}>Day {day}/60 · PMBOK 8</div>
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {profile&&<span style={{fontSize:11,color:C.gold,fontWeight:600}}>{profile.readiness}% ready</span>}
            {screen!=="dashboard"&&(
              <button onClick={()=>setScreen("dashboard")} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:12,fontFamily:F.b}}>🏠</button>
            )}
          </div>
        </div>
      )}

      {/* Screens */}
      {screen==="onboarding"&&<Onboarding onStart={handleOnboardingComplete}/>}

      {screen==="dashboard"&&profile&&(
        <Dashboard
          profile={profile}
          onSession={()=>setScreen("setup")}
          onFlashcards={()=>setScreen("flashcards")}
          onExam={(type)=>{setExamType(type);setScreen("exam");}}
        />
      )}

      {screen==="setup"&&profile&&(
        <SessionSetup
          profile={profile}
          onStart={handleStartSession}
          onBack={()=>setScreen("dashboard")}
        />
      )}

      {screen==="session"&&(
        <>
          {sessionPhase==="loading"&&(
            <div style={{padding:"40px 24px",textAlign:"center"}}>
              <div className="pulse" style={{fontSize:32,marginBottom:16}}>🧠</div>
              <div style={{fontFamily:F.d,fontSize:18,color:C.text,marginBottom:8}}>Building Your Session</div>
              <div style={{fontSize:13,color:C.muted,marginBottom:20}}>AI is generating a personalized lesson and questions based on your gaps...</div>
              <ShimmerBlock h={100}/><ShimmerBlock h={60}/><ShimmerBlock h={60}/><ShimmerBlock h={60}/>
            </div>
          )}
          {sessionPhase==="error"&&(
            <div style={{padding:"40px 24px",textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:12}}>⚠</div>
              <div style={{fontFamily:F.d,fontSize:18,color:C.text,marginBottom:8}}>Session Load Failed</div>
              <p style={{color:C.muted,fontSize:13,marginBottom:20}}>{sessionError}</p>
              <Btn onClick={()=>setScreen("setup")}>Try Again</Btn>
            </div>
          )}
          {sessionPhase==="lesson"&&sessionData?.lesson&&(
            <LessonPhase lesson={sessionData.lesson} onContinue={()=>setSessionPhase("questions")}/>
          )}
          {sessionPhase==="questions"&&sessionData?.questions&&(
            <QuestionPhase questions={sessionData.questions} onComplete={handleQuestionsComplete}/>
          )}
          {sessionPhase==="summary"&&summaryData&&(
            <SessionSummary
              score={summaryData.score}
              correct={summaryData.correct}
              total={summaryData.total}
              summary={summaryData.summary}
              newFlashcards={summaryData.newFlashcards}
              weakTopics={summaryData.weakTopics}
              loading={summaryLoading}
              onDone={()=>setScreen("dashboard")}
            />
          )}
        </>
      )}

      {screen==="flashcards"&&profile&&(
        <FlashcardDeck
          profile={profile}
          onBack={()=>setScreen("dashboard")}
          onUpdate={(p)=>{persistProfile(p);setProfile(p);}}
        />
      )}

      {screen==="exam"&&profile&&(
        <ExamSim
          profile={profile}
          examType={examType}
          onComplete={handleExamComplete}
          onBack={()=>setScreen("dashboard")}
        />
      )}
    </div>
  );
}
