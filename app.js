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
  points:30, selectedPet:"panda", ownedPets:["panda"], ownedAccessories:[],
  questions:starterQuestions, answered:[]
};
let state = loadState();
let currentQuiz = null;
let quizAnswered = false;
let chosenAvatar = state.avatar;

function loadState(){
  try {
    const saved = JSON.parse(localStorage.getItem("kidopiaDemo"));
    return saved ? {...structuredClone(defaults), ...saved} : structuredClone(defaults);
  } catch { return structuredClone(defaults); }
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
  const accessoryIcons=state.ownedAccessories.map(id=>accessories.find(a=>a.id===id)?.emoji).filter(Boolean).join(" ");
  $("selectedPetCard").innerHTML=`<span class="selected-pet-art">${pet.emoji}</span><div><p class="eyebrow">YOUR CURRENT BUDDY</p><h2>${pet.name} ${accessoryIcons}</h2><p>${pet.desc}</p></div>`;
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
    return `<div class="shop-item"><span>${a.emoji}</span><div><strong>${a.name}</strong><small>${owned?"Already yours":a.price+" stars"}</small></div><button data-accessory="${a.id}" ${owned?"disabled":""}>${owned?"Owned":"Get"}</button></div>`;
  }).join("");
  document.querySelectorAll("[data-accessory]").forEach(b=>b.addEventListener("click",()=>buyAccessory(b.dataset.accessory)));
}
function buyAccessory(id){
  const a=accessories.find(x=>x.id===id); if(!a||state.ownedAccessories.includes(id))return;
  if(state.points<a.price){showToast("Keep learning to earn more stars!");return;}
  state.points-=a.price;state.ownedAccessories.push(id);saveState();showToast(a.name+" added to your collection!");
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
  else{$("quizFeedback").textContent="Good try! The right answer is "+currentQuiz.correct+".";button.classList.add("wrong");}
  $("nextQuestion").classList.remove("hidden");
}
$("startQuiz").addEventListener("click",startQuiz);
$("nextQuestion").addEventListener("click",startQuiz);
$("numberGame").addEventListener("click",()=>{
  const target=Math.floor(Math.random()*5)+1;
  const guess=prompt("Guess a number from 1 to 5:");
  if(guess===null)return;
  if(Number(guess)===target){state.points+=3;saveState();showToast("You guessed it! +3 stars ⭐");}
  else showToast("Nice try! The number was "+target+". Try again!");
});

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
