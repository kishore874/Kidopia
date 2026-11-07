// KIDOPIA demo app. This is a browser-only prototype, not secure authentication.
// Change this demo PIN before showing the prototype. Never use this as real security.
const DEMO_PARENT_PIN = "2468";
const $ = (id) => document.getElementById(id);
const starterQuestions = [
  {id:1, question:"Which animal says meow?", answer:"cat", points:5},
  {id:2, question:"What is 2 + 3?", answer:"5", points:5}
];
const pets = [
  {id:"panda",name:"Panda",emoji:"🐼",price:0,desc:"A calm and cuddly friend."},
  {id:"cat",name:"Kitty",emoji:"🐱",price:0,desc:"A curious little explorer."},
  {id:"dog",name:"Puppy",emoji:"🐶",price:10,desc:"A loyal and playful pal."},
  {id:"rabbit",name:"Bunny",emoji:"🐰",price:10,desc:"A soft and bouncy buddy."},
  {id:"fox",name:"Fox",emoji:"🦊",price:15,desc:"A clever forest friend."},
  {id:"bear",name:"Bear",emoji:"🐻",price:15,desc:"A big-hearted bestie."},
  {id:"frog",name:"Froggy",emoji:"🐸",price:20,desc:"A happy little hopper."},
  {id:"penguin",name:"Penguin",emoji:"🐧",price:20,desc:"A cool and cheerful pal."}
];
const accessories = [
  {id:"bow",name:"Cute bow",emoji:"🎀",price:10},
  {id:"crown",name:"Royal crown",emoji:"👑",price:20},
  {id:"glasses",name:"Cool glasses",emoji:"🕶️",price:15},
  {id:"flower",name:"Flower",emoji:"🌼",price:10},
  {id:"scarf",name:"Cozy scarf",emoji:"🧣",price:15},
  {id:"star",name:"Shiny star",emoji:"⭐",price:25}
];
const avatars = ["🐼","🦊","🐸","🐱","🐶","🐰","🐻","🐧","🦄","🐯"];
const quizQuestions = [
  {q:"Which planet do we live on?",a:["Mars","Earth","Jupiter","Venus"],correct:"Earth"},
  {q:"How many legs does a spider have?",a:["6","8","4","10"],correct:"8"},
  {q:"What is 4 + 3?",a:["6","8","7","9"],correct:"7"},
  {q:"Which one is a fruit?",a:["Carrot","Potato","Apple","Onion"],correct:"Apple"},
  {q:"What colour do you get by mixing blue and yellow?",a:["Green","Pink","Orange","Purple"],correct:"Green"}
];
const defaults = {
  name:"Explorer", nickname:"Explorer", username:"explorer", avatar:"🐼",
  points:30, selectedPet:"panda", ownedPets:["panda"], ownedAccessories:[], equippedAccessories:[],
  questions:starterQuestions, answered:[]
};
let state = loadState();
let currentQuiz = null;
let quizAnswered = false;
let chosenAvatar = state.avatar;

function cloneDefaults(){ return JSON.parse(JSON.stringify(defaults)); }
function loadState(){
  try {
    const saved = JSON.parse(localStorage.getItem("kidopiaDemo") || "null");
    const merged = saved && typeof saved === "object" ? {...cloneDefaults(), ...saved} : cloneDefaults();
    // Repair older saved versions and incomplete browser storage safely.
    ["ownedPets","ownedAccessories","equippedAccessories","questions","answered"].forEach(k=>{
      if(!Array.isArray(merged[k])) merged[k]=cloneDefaults()[k];
    });
    // Previously purchased accessories become equipped automatically after this update.
    if(!saved || !Array.isArray(saved.equippedAccessories)) merged.equippedAccessories=[...merged.ownedAccessories];
    if(!pets.some(p=>p.id===merged.selectedPet)) merged.selectedPet="panda";
    return merged;
  } catch (err) { return cloneDefaults(); }
}
function saveState(){ localStorage.setItem("kidopiaDemo", JSON.stringify(state)); renderAll(); }
function clean(text){ return String(text ?? "").trim(); }
function showToast(message){
  const toast=$("toast"); toast.textContent=message; toast.classList.add("show");
  clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove("show"),2200);
}
function setFeedback(id,message,error=false){
  const el=$(id); if(!el)return; el.textContent=message; el.classList.toggle("error",error);
}
function go(view){
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===view+"View"));
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.nav===view));
  if(view==="parents") refreshParentView();
  if(view==="games") renderFamilyQuestions();
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.nav)));
$("profileShortcut").addEventListener("click",()=>go("profile"));

function renderAll(){
  const display=state.nickname||state.name||"Explorer";
  $("welcomeName").textContent=display;
  $("headerPoints").textContent=state.points;
  $("shopPoints").textContent=state.points;
  $("bigPoints").textContent=state.points;
  $("profilePoints").textContent=state.points;
  $("parentPoints").textContent=state.points;
  $("parentChildName").textContent=display;
  $("parentChildUsername").textContent="@"+(state.username||"explorer");
  $("profileDisplayName").textContent=display;
  $("profileHandle").textContent="@"+(state.username||"explorer");
  $("profileAvatar").textContent=state.avatar;
  $("profileShortcut").textContent=state.avatar;
  $("profileName").value=state.name;
  $("profileNickname").value=state.nickname;
  $("profileUsername").value=state.username;
  $("profilePet").textContent=pets.find(p=>p.id===state.selectedPet)?.name||"None";
  renderPets(); renderShop(); renderAvatarPicker(); renderManageQuestions();
}
function renderPets(){
  $("petGrid").innerHTML=pets.map(p=>{
    const owned=state.ownedPets.includes(p.id);
    const selected=state.selectedPet===p.id;
    return `<button class="pet-card ${selected?"selected":""}" data-pet="${p.id}"><span class="pet-emoji">${p.emoji}</span><strong>${p.name}</strong><small>${selected?"Your buddy":owned?"Owned":p.price+" ⭐"}</small></button>`;
  }).join("");
  document.querySelectorAll("[data-pet]").forEach(btn=>btn.addEventListener("click",()=>choosePet(btn.dataset.pet)));
  const pet=pets.find(p=>p.id===state.selectedPet)||pets[0];
  const worn=(state.equippedAccessories||[]).map(id=>accessories.find(a=>a.id===id)).filter(Boolean);
  const wearMarkup=worn.map(a=>`<span class="pet-wear wear-${a.id}" aria-label="${a.name}">${a.emoji}</span>`).join("");
  $("selectedPetCard").innerHTML=`<div class="pet-dressup"><span class="selected-pet-art">${pet.emoji}</span>${wearMarkup}</div><div class="pet-description"><p class="eyebrow">YOUR CURRENT BUDDY</p><h2>${pet.name}</h2><p>${pet.desc}</p><small class="wear-caption">${worn.length ? "Looking stylish! Accessories are being worn." : "Buy an accessory to dress up your pet!"}</small></div>`;
}
function choosePet(id){
  const pet=pets.find(p=>p.id===id); if(!pet)return;
  if(!state.ownedPets.includes(id)){
    if(state.points<pet.price){showToast("You need more stars for this pet.");return;}
    state.points-=pet.price; state.ownedPets.push(id);
    showToast(pet.name+" joined your family!");
  } else showToast(pet.name+" is now your buddy!");
  state.selectedPet=id; saveState();
}
function renderShop(){
  $("shopGrid").innerHTML=accessories.map(a=>{
    const owned=state.ownedAccessories.includes(a.id);
    const wearing=(state.equippedAccessories||[]).includes(a.id);
    return `<div class="shop-item"><span>${a.emoji}</span><div><strong>${a.name}</strong><small>${wearing?"Your pet is wearing it":owned?"In your collection":a.price+" stars"}</small></div><button data-accessory="${a.id}">${wearing?"Remove":owned?"Wear":"Buy"}</button></div>`;
  }).join("");
  document.querySelectorAll("[data-accessory]").forEach(b=>b.addEventListener("click",()=>buyAccessory(b.dataset.accessory)));
}
function buyAccessory(id){
  const a=accessories.find(x=>x.id===id); if(!a)return;
  if(!state.ownedAccessories.includes(id)){
    if(state.points<a.price){showToast("Keep learning to earn more stars!");return;}
    state.points-=a.price;state.ownedAccessories.push(id);
    if(!Array.isArray(state.equippedAccessories))state.equippedAccessories=[];
    state.equippedAccessories.push(id);
    saveState();showToast(a.name+" bought! Your pet is wearing it!");return;
  }
  if(!Array.isArray(state.equippedAccessories))state.equippedAccessories=[];
  if(state.equippedAccessories.includes(id)){
    state.equippedAccessories=state.equippedAccessories.filter(x=>x!==id);
    showToast(a.name+" removed.");
  } else { state.equippedAccessories.push(id);showToast("Your pet is wearing "+a.name+"!"); }
  saveState();
}
function renderAvatarPicker(){
  $("avatarPicker").innerHTML=avatars.map(a=>`<button type="button" class="avatar-choice ${chosenAvatar===a?"selected":""}" data-avatar="${a}">${a}</button>`).join("");
  document.querySelectorAll("[data-avatar]").forEach(b=>b.addEventListener("click",()=>{chosenAvatar=b.dataset.avatar;renderAvatarPicker();}));
}
$("saveProfile").addEventListener("click",()=>{
  const name=clean($("profileName").value), nickname=clean($("profileNickname").value), username=clean($("profileUsername").value).replace(/^@/,"").replace(/\s+/g,"").toLowerCase();
  if(!name||!nickname||!username){setFeedback("profileFeedback","Please fill in all three profile fields.",true);return;}
  state.name=name;state.nickname=nickname;state.username=username;state.avatar=chosenAvatar;saveState();
  setFeedback("profileFeedback","Profile saved on this device!");showToast("Your profile is updated.");
});

function startQuiz(){
  ["miniGamePanel","parentGatePanel","ticTacToePanel","racePanel","shootPanel"].forEach(id=>$(id).classList.add("hidden"));
  $("quizPanel").classList.remove("hidden");
  currentQuiz=quizQuestions[Math.floor(Math.random()*quizQuestions.length)];
  quizAnswered=false;$("quizPanel").classList.remove("hidden");$("questionCount").textContent="Quick quiz";
  $("quizQuestion").textContent=currentQuiz.q;$("quizFeedback").textContent="";
  $("nextQuestion").classList.add("hidden");
  $("answerList").innerHTML=currentQuiz.a.map(a=>`<button class="answer-button" data-answer="${a}">${a}</button>`).join("");
  document.querySelectorAll("[data-answer]").forEach(b=>b.addEventListener("click",()=>answerQuiz(b.dataset.answer,b)));
}
function answerQuiz(answer,button){
  if(quizAnswered)return;quizAnswered=true;
  document.querySelectorAll("[data-answer]").forEach(b=>{b.disabled=true;if(b.dataset.answer===currentQuiz.correct)b.classList.add("correct");});
  if(answer===currentQuiz.correct){state.points+=5;saveState();$("quizFeedback").textContent="Brilliant! You earned 5 stars. ⭐";}
  else{
    $("quizFeedback").textContent="Good try! The right answer is "+currentQuiz.correct+". Answer a parent question to unlock your next challenge.";
    button.classList.add("wrong");
    pendingAfterGate = startQuiz;
    window.setTimeout(()=>showParentGate("You can unlock your next quiz by answering a family question!"),650);
  }
  $("nextQuestion").classList.remove("hidden");
}
$("startQuiz").addEventListener("click",startQuiz);
$("nextQuestion").addEventListener("click",startQuiz);
let miniGameMode = "";
let pendingAfterGate = null;
let activeGateQuestion = null;

function openMiniGame(label, question, answers, correct, points=3){
  ["quizPanel","parentGatePanel","ticTacToePanel","racePanel","shootPanel"].forEach(id=>$(id).classList.add("hidden"));
  miniGameMode = label;
  $("miniGameLabel").textContent = label.toUpperCase();
  $("miniGameQuestion").textContent = question;
  $("miniGameFeedback").textContent = "";
  $("miniGamePanel").classList.remove("hidden");
  $("parentGatePanel").classList.add("hidden");
  $("miniGameAnswers").innerHTML = answers.map((a,i)=>`<button class="answer-button" data-mini-answer="${i}">${a}</button>`).join("");
  document.querySelectorAll("[data-mini-answer]").forEach(btn=>btn.addEventListener("click",()=>{
    if(btn.disabled)return;
    const chosen=Number(btn.dataset.miniAnswer);
    document.querySelectorAll("[data-mini-answer]").forEach(x=>x.disabled=true);
    if(chosen===correct){
      state.points+=points;saveState();
      $("miniGameFeedback").textContent="Fantastic! You earned "+points+" stars. ⭐";
      showToast("Correct answer! +"+points+" stars");
    } else {
      btn.classList.add("wrong");
      document.querySelectorAll("[data-mini-answer]")[correct]?.classList.add("correct");
      $("miniGameFeedback").textContent="Not quite! Let's try a parent question to unlock your next try.";
      pendingAfterGate = ()=>openRandomMiniGameAgain(label);
      window.setTimeout(showParentGate,650);
    }
  }));
  $("miniGamePanel").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function openRandomMiniGameAgain(label){
  if(label==="NUMBER DASH") startNumberDash();
  else if(label==="ANIMAL MATCH") startAnimalMatch();
  else if(label==="ODD ONE OUT") startOddOneOut();
  else startBonusRound();
}
function startNumberDash(){
  const a=Math.floor(Math.random()*8)+2, b=Math.floor(Math.random()*8)+1;
  const correct=String(a+b), options=[correct,String(a+b+1),String(Math.max(1,a+b-1)),String(a+b+3)];
  const shuffled=shuffle(options);
  openMiniGame("Number dash",`What is ${a} + ${b}?`,shuffled,shuffled.indexOf(correct),3);
}
function startAnimalMatch(){
  const items=[{q:"Which animal says 'moo'?",a:["Cow 🐮","Duck 🦆","Cat 🐱","Lion 🦁"],c:0},
    {q:"Which animal can hop?",a:["Fish 🐟","Rabbit 🐰","Whale 🐳","Eagle 🦅"],c:1},
    {q:"Which animal has a long trunk?",a:["Fox 🦊","Panda 🐼","Elephant 🐘","Frog 🐸"],c:2}];
  const item=items[Math.floor(Math.random()*items.length)];
  openMiniGame("Animal match",item.q,item.a,item.c,3);
}
function startOddOneOut(){
  const items=[
    {q:"Which one is not a fruit?",a:["Apple 🍎","Banana 🍌","Carrot 🥕","Grape 🍇"],c:2},
    {q:"Which one can fly?",a:["Butterfly 🦋","Turtle 🐢","Dog 🐶","Elephant 🐘"],c:0},
    {q:"Which one is a shape?",a:["Circle 🔵","Mango 🥭","Pencil ✏️","Cloud ☁️"],c:0}
  ];
  const item=items[Math.floor(Math.random()*items.length)];
  openMiniGame("Odd one out",item.q,item.a,item.c,3);
}
function startBonusRound(){
  const items=[
    {q:"What comes next? 2, 4, 6, __",a:["7","8","9","10"],c:1},
    {q:"How many sides does a triangle have?",a:["2","3","4","5"],c:1},
    {q:"Which is the biggest number?",a:["12","21","9","18"],c:1}
  ];
  const item=items[Math.floor(Math.random()*items.length)];
  openMiniGame("Bonus round",item.q,item.a,item.c,8);
}
function shuffle(array){return [...array].sort(()=>Math.random()-.5);}
$("numberGame").addEventListener("click",startNumberDash);
$("animalGame").addEventListener("click",startAnimalMatch);
$("oddGame").addEventListener("click",startOddOneOut);
$("bonusGame").addEventListener("click",()=>{
  pendingAfterGate=startBonusRound;
  showParentGate("Answer a family question to unlock the bonus round!");
});
$("closeMiniGame").addEventListener("click",()=>{$("miniGamePanel").classList.add("hidden");});

function showParentGate(title){
  const available=(state.questions||[]).filter(q=>!state.answered.includes(q.id));
  ["miniGamePanel","quizPanel","ticTacToePanel","racePanel","shootPanel"].forEach(id=>$(id).classList.add("hidden"));
  $("parentGatePanel").classList.remove("hidden");
  $("gateTitle").textContent=title||"A little challenge before your next try!";
  $("gateAnswer").value="";setFeedback("gateFeedback","");
  if(!available.length){
    activeGateQuestion=null;
    $("gateQuestion").textContent="There are no new parent questions yet. Ask a parent to add one in Parent Corner.";
    $("gateAnswer").classList.add("hidden");
    $("checkGateAnswer").classList.add("hidden");
    $("parentGatePanel").scrollIntoView({behavior:"smooth",block:"center"});
    return;
  }
  $("gateAnswer").classList.remove("hidden");
  $("checkGateAnswer").classList.remove("hidden");
  activeGateQuestion=available[Math.floor(Math.random()*available.length)];
  $("gateQuestion").textContent=activeGateQuestion.question;
  $("parentGatePanel").scrollIntoView({behavior:"smooth",block:"center"});
}
$("checkGateAnswer").addEventListener("click",()=>{
  if(!activeGateQuestion){setFeedback("gateFeedback","Ask a parent to add a question first.",true);return;}
  if(clean($("gateAnswer").value).toLowerCase()===clean(activeGateQuestion.answer).toLowerCase()){
    const q=activeGateQuestion;state.points+=Number(q.points);state.answered.push(q.id);saveState();
    $("parentGatePanel").classList.add("hidden");showToast("Great! +"+q.points+" stars. Feature unlocked!");
    const next=pendingAfterGate;pendingAfterGate=null;activeGateQuestion=null;
    if(next)next();
    renderFamilyQuestions();
  } else setFeedback("gateFeedback","Not quite. Try again, or ask your parent for a hint.",true);
});
$("gateAnswer").addEventListener("keydown",e=>{if(e.key==="Enter")$("checkGateAnswer").click();});

function renderFamilyQuestions(){
  const questions=state.questions||[];
  const available=questions.filter(q=>!state.answered.includes(q.id));
  $("parentQuestionList").innerHTML=available.length?available.map(q=>`
    <div class="family-question"><strong>${escapeHtml(q.question)}</strong><input id="familyAnswer${q.id}" placeholder="Type your answer" autocomplete="off"><button class="primary-button" data-family-answer="${q.id}">Check answer · +${q.points} ⭐</button></div>
  `).join(""):`<div class="form-card"><p class="eyebrow">ALL CAUGHT UP</p><strong>No new parent questions right now.</strong><p style="font-size:12px;color:#89869d">Ask a parent to add another question in Parent Corner.</p></div>`;
  document.querySelectorAll("[data-family-answer]").forEach(b=>b.addEventListener("click",()=>checkFamilyAnswer(Number(b.dataset.familyAnswer))));
}
function escapeHtml(str){return String(str).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function checkFamilyAnswer(id){
  const q=state.questions.find(x=>x.id===id);const input=$("familyAnswer"+id);if(!q||!input)return;
  if(clean(input.value).toLowerCase()===clean(q.answer).toLowerCase()){
    state.points+=Number(q.points);state.answered.push(id);saveState();renderFamilyQuestions();showToast("Correct! You earned "+q.points+" stars! ⭐");
  }else showToast("Not quite. Have another try!");
}
function refreshParentView(){
  $("parentPin").value="";setFeedback("pinFeedback","");
  $("parentLock").classList.remove("hidden");$("parentTools").classList.add("hidden");
}
$("unlockParent").addEventListener("click",()=>{
  if($("parentPin").value===DEMO_PARENT_PIN){$("parentLock").classList.add("hidden");$("parentTools").classList.remove("hidden");renderManageQuestions();setFeedback("pinFeedback","");}
  else setFeedback("pinFeedback","That PIN isn't correct. Try again.",true);
});
$("parentPin").addEventListener("keydown",e=>{if(e.key==="Enter")$("unlockParent").click();});
$("parentLogout").addEventListener("click",refreshParentView);
$("addQuestion").addEventListener("click",()=>{
  const question=clean($("newQuestion").value),answer=clean($("newAnswer").value),points=Number($("questionPoints").value);
  if(!question||!answer){setFeedback("addFeedback","Please enter both a question and its correct answer.",true);return;}
  state.questions.push({id:Date.now(),question,answer,points});state.answered=state.answered.filter(id=>state.questions.some(q=>q.id===id));
  $("newQuestion").value="";$("newAnswer").value="";saveState();renderManageQuestions();renderFamilyQuestions();setFeedback("addFeedback","Question added! It is ready in Kids Zone.");
});
function renderManageQuestions(){
  $("manageQuestions").innerHTML=state.questions.length?state.questions.map(q=>`<div class="manage-row"><span>${escapeHtml(q.question)} <small>· ${q.points} ⭐</small></span><button data-delete-question="${q.id}">Delete</button></div>`).join(""):"<p style='font-size:12px;color:#89869d'>No questions yet.</p>";
  document.querySelectorAll("[data-delete-question]").forEach(b=>b.addEventListener("click",()=>{const id=Number(b.dataset.deleteQuestion);state.questions=state.questions.filter(q=>q.id!==id);state.answered=state.answered.filter(x=>x!==id);saveState();renderManageQuestions();renderFamilyQuestions();}));
}
renderAll();
go("home");

/* Version 1.2 arcade games */
const ticBoard = Array(9).fill("");
let ticTurn = "X";
let ticFinished = false;
function showArcadePanel(id){
  ["ticTacToePanel","racePanel","shootPanel","miniGamePanel","parentGatePanel","quizPanel"].forEach(panelId=>$(panelId).classList.add("hidden"));
  $(id).classList.remove("hidden");
  window.setTimeout(()=>$(id).scrollIntoView({behavior:"smooth",block:"center"}),50);
}
function startTicTacToe(){
  ticBoard.fill(""); ticTurn="X"; ticFinished=false;
  showArcadePanel("ticTacToePanel");
  renderTicTacToe();
}
function renderTicTacToe(){
  $("ticTacToeStatus").textContent=ticFinished?"Game finished":`Player ${ticTurn}'s turn`;
  $("ticTacToeGrid").innerHTML=ticBoard.map((v,i)=>`<button class="tic-cell" data-tic="${i}" aria-label="Square ${i+1}">${v}</button>`).join("");
  document.querySelectorAll("[data-tic]").forEach(b=>b.addEventListener("click",()=>playTicCell(Number(b.dataset.tic))));
}
function playTicCell(i){
  if(ticFinished||ticBoard[i])return;
  ticBoard[i]=ticTurn;
  const player=ticTurn;
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const winner=lines.some(line=>line.every(n=>ticBoard[n]===player));
  if(winner){
    ticFinished=true;renderTicTacToe();
    if(player==="X"){
      state.points+=5;saveState();$("ticTacToeStatus").textContent="Player X wins! +5 stars ⭐";
    } else {
      $("ticTacToeStatus").textContent="Player O wins. Answer a family question to play again!";
      pendingAfterGate=startTicTacToe;
      showParentGate("You lost this round! Answer a parent question to unlock another game.");
    }
    return;
  }
  if(ticBoard.every(Boolean)){ticFinished=true;renderTicTacToe();$("ticTacToeStatus").textContent="It's a draw! Good game.";return;}
  ticTurn=player==="X"?"O":"X";
  renderTicTacToe();
}
$("ticTacToeGame").addEventListener("click",startTicTacToe);
$("ticTacToeReset").addEventListener("click",startTicTacToe);

let raceRound=0;
function startRace(){
  raceRound=0;
  showArcadePanel("racePanel");
  $("raceTrack").textContent="🏎️";$("raceFeedback").textContent="";
  document.querySelectorAll("[data-lane]").forEach(b=>b.disabled=false);
  updateRaceStatus();
}
function updateRaceStatus(){$("raceStatus").textContent=`Round ${raceRound+1} of 5 — choose a lane!`;}
function chooseRaceLane(lane){
  if(raceRound>=5)return;
  const hazard=Math.floor(Math.random()*3);
  if(lane===hazard){
    $("raceTrack").textContent="🚧";
    $("raceFeedback").textContent="Oops! You bumped a cone. Answer a family question to try the race again.";
    pendingAfterGate=startRace;
    showParentGate("Race over! Answer a parent question to unlock another race.");
    return;
  }
  raceRound++;
  $("raceTrack").textContent=["🏎️","🚗","🚙"][lane];
  if(raceRound>=5){
    state.points+=5;saveState();
    $("raceStatus").textContent="You finished the race! +5 stars ⭐";
    $("raceFeedback").textContent="Awesome driving!";
    document.querySelectorAll("[data-lane]").forEach(b=>b.disabled=true);
  } else {$("raceFeedback").textContent="Clear lane! Keep going.";updateRaceStatus();}
}
$("raceGame").addEventListener("click",startRace);
document.querySelectorAll("[data-lane]").forEach(b=>b.addEventListener("click",()=>chooseRaceLane(Number(b.dataset.lane))));

let shootStars=0, shootMisses=0;
function startStarShooter(){
  shootStars=0;shootMisses=0;
  showArcadePanel("shootPanel");
  $("shootStatus").textContent="Tap 5 stars. Avoid the clouds!";
  $("shootFeedback").textContent="";
  renderShootTargets();
}
function renderShootTargets(){
  $("shootScore").textContent=`Stars: ${shootStars} / 8 · Misses: ${shootMisses} / 3`;
  const symbols=shuffle(["⭐","⭐","⭐","⭐","⭐","☁️","☁️","☁️"]);
  $("shootTargets").innerHTML=symbols.map((s,i)=>`<button class="shoot-target" data-target="${s==="⭐"?"star":"cloud"}" aria-label="${s==="⭐"?"Star":"Cloud"}">${s}</button>`).join("");
  document.querySelectorAll("[data-target]").forEach(b=>b.addEventListener("click",()=>{
    if(b.disabled)return;b.disabled=true;
    if(b.dataset.target==="star"){shootStars++;b.textContent="✨";}
    else {shootMisses++;b.textContent="💨";}
    $("shootScore").textContent=`Stars: ${shootStars} / 8 · Misses: ${shootMisses} / 3`;
    if(shootStars>=5){
      state.points+=5;saveState();$("shootStatus").textContent="Star collector! +5 stars ⭐";$("shootFeedback").textContent="You found 5 stars. Great job!";
      document.querySelectorAll("[data-target]").forEach(x=>x.disabled=true);
    } else if(shootMisses>=3){
      $("shootStatus").textContent="Round over!";
      $("shootFeedback").textContent="Too many clouds! Answer a family question to try again.";
      document.querySelectorAll("[data-target]").forEach(x=>x.disabled=true);
      pendingAfterGate=startStarShooter;
      showParentGate("Star game over! Answer a parent question to unlock another round.");
    }
  }));
}
$("shootGame").addEventListener("click",startStarShooter);
document.querySelectorAll("[data-close-arcade]").forEach(b=>b.addEventListener("click",()=>$(b.dataset.closeArcade).classList.add("hidden")));

// Keep all game cards responsive even after GitHub Pages/browser cache updates.
window.addEventListener("pageshow",()=>{ renderAll(); });
