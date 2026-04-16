// ===========================
// SKINNY TO FIT — script.js
// AI Fitness Planner Logic 🔥
// ===========================

let selectedGoal = '';
let dietPlan = '';
let workoutPlan = '';
let activeTab = 'diet';

// ---- SCROLL ANIMATIONS ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.form-section').forEach(el => observer.observe(el));

// ---- BMI CALCULATOR ----
function calcBMI() {
  const age = parseFloat(document.getElementById('age').value);
  const h = parseFloat(document.getElementById('height').value);
  const w = parseFloat(document.getElementById('weight').value);

  if (!h || !w) {
    showToast('Height aur Weight daalo pehle! ⚠️');
    return;
  }

  const bmi = w / ((h / 100) ** 2);
  const bmiRound = Math.round(bmi * 10) / 10;

  document.getElementById('bmiVal').textContent = bmiRound;

  let cat, advice, color, pct;

  if (bmi < 16) {
    cat = 'Severely Underweight'; color = '#0096ff'; pct = 8;
    advice = 'Bhai, seriously weight gain karna padega. High calorie aur protein diet must hai.';
  } else if (bmi < 18.5) {
    cat = 'Underweight (Patla)'; color = '#0096ff'; pct = 18;
    advice = 'Tujhe weight gain karna chahiye. Muscle gain goal choose kar — sahi diet se body ban jayegi.';
  } else if (bmi < 25) {
    cat = 'Normal ✓ (Fit Hai Tu)'; color = '#39ff14'; pct = 42;
    advice = 'Bahut achha! Tu normal range mein hai. Muscle gain ya maintain goal choose kar.';
  } else if (bmi < 30) {
    cat = 'Overweight'; color = '#ffc800'; pct = 65;
    advice = 'Thoda wazn zyada hai. Fat loss goal le — diet + cardio se jaldi results aayenge.';
  } else if (bmi < 35) {
    cat = 'Obese Class I'; color = '#ff8800'; pct = 80;
    advice = 'Fat loss priority honi chahiye. Budget ke hisab se clean diet plan banate hain.';
  } else {
    cat = 'Obese Class II'; color = '#ff3232'; pct = 92;
    advice = 'Serious fat loss needed. Doctor se bhi milna consider karo saath mein.';
  }

  document.getElementById('bmiCat').textContent = cat;
  document.getElementById('bmiVal').style.color = color;
  document.getElementById('bmiVal').style.textShadow = `0 0 30px ${color}50`;
  document.getElementById('bmiAdvice').textContent = advice;
  document.getElementById('bmiThumb').style.left = `calc(${pct}% - 7px)`;
  document.getElementById('bmiThumb').style.background = color;
  document.getElementById('bmiThumb').style.boxShadow = `0 0 14px ${color}`;

  const resultEl = document.getElementById('bmiResult');
  resultEl.style.display = 'block';
  resultEl.style.animation = 'none';
  void resultEl.offsetWidth;
  resultEl.style.animation = 'fadeUp 0.6s ease forwards';

  // Auto scroll to goal section
  setTimeout(() => {
    document.getElementById('goalSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 700);
}

// ---- GOAL SELECTION ----
function selectGoal(goal, id) {
  selectedGoal = goal;

  // Reset all
  ['g-muscle', 'g-fat', 'g-maintain'].forEach(g => {
    const el = document.getElementById(g);
    el.classList.remove('active', 'active-fat', 'active-green');
  });

  const card = document.getElementById(id);
  if (goal === 'muscle') card.classList.add('active');
  else if (goal === 'fatloss') { card.classList.add('active'); card.classList.add('active-fat'); }
  else card.classList.add('active', 'active-green');

  // Auto scroll to budget
  setTimeout(() => {
    document.getElementById('budgetSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 400);
}

// ---- BUDGET ----
function setBudget(amount) {
  document.getElementById('budget').value = amount;
  updateBudgetLabel();
}

function updateBudgetLabel() {
  const b = parseFloat(document.getElementById('budget').value);
  const labelEl = document.getElementById('budgetLabel');

  if (!b) { labelEl.textContent = 'Abhi koi budget nahi daala'; labelEl.className = 'budget-label'; return; }

  if (b < 1500) {
    labelEl.textContent = '⚠️ Bahut tight budget — par hum kuch na kuch karenge';
    labelEl.className = 'budget-label cheap';
  } else if (b < 3000) {
    labelEl.textContent = '👍 Theek hai — decent Indian diet ban sakti hai';
    labelEl.className = 'budget-label okay';
  } else if (b < 6000) {
    labelEl.textContent = '✅ Achha budget — good balanced diet possible hai';
    labelEl.className = 'budget-label good';
  } else {
    labelEl.textContent = '🔥 Premium budget — best diet + supplements bhi consider kar sakte hain';
    labelEl.className = 'budget-label great';
  }
}

// ---- GENERATE PLAN ----
async function generatePlan() {
  const age = document.getElementById('age').value;
  const height = document.getElementById('height').value;
  const weight = document.getElementById('weight').value;
  const budget = document.getElementById('budget').value;
  const goalDetail = document.getElementById('goalDetail').value;
  const bmiVal = document.getElementById('bmiVal').textContent;
  const bmiCat = document.getElementById('bmiCat').textContent;

  if (!age || !height || !weight) {
    showToast('Pehle apni details fill karo (Step 01)! ⚠️');
    document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (!selectedGoal) {
    showToast('Apna goal choose karo (Step 02)! ⚠️');
    document.getElementById('goalSection').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (!budget) {
    showToast('Budget daalo (Step 03)! ⚠️');
    document.getElementById('budgetSection').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const btn = document.getElementById('genBtn');
  btn.disabled = true;
  btn.querySelector('.gen-text').textContent = 'BAN RAHA HAI...';

  const resultsEl = document.getElementById('resultsSection');
  resultsEl.style.display = 'block';
  document.getElementById('loadingState').style.display = 'flex';
  document.getElementById('resultText').style.display = 'none';
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const goalLabel = selectedGoal === 'muscle' ? 'Muscle Gain' : selectedGoal === 'fatloss' ? 'Fat Loss' : 'Maintain';

  const baseInfo = `
User ki details:
- Umar: ${age} saal
- Height: ${height}cm | Weight: ${weight}kg
- BMI: ${bmiVal} (${bmiCat})
- Goal: ${goalLabel}
- Specific goal: ${goalDetail || 'koi nahi'}
- Monthly food budget: ₹${budget}
  `;

  const dietPrompt = `
Tu ek professional Indian fitness nutritionist hai. Niche diye gaye user ke liye ek detailed 7-din ka diet plan bana.

${baseInfo}

RULES:
1. Sirf Indian khana use kar (roti, dal, sabzi, chawal, dahi, eggs, paneer, soya chunks, moong dal, oats, banana etc.)
2. Budget ₹${budget}/month ka dhyan rakho — expensive cheezein mat daalo
3. Har din ka BREAKFAST, MID-MORNING SNACK, LUNCH, EVENING SNACK, aur DINNER likho
4. Har meal ke saath approximate calories aur protein grams likho
5. Goal "${goalLabel}" ke hisab se plan customize karo
6. Din ke end mein total calories aur protein likho
7. Hindi-English mix mein casual style mein likho
8. Week ke end mein 3-5 important tips do
9. Emojis use karo throughout

Format: Day 1 se Day 7, phir Tips section
  `;

  const workoutPrompt = `
Tu ek experienced Indian fitness trainer hai. Niche diye gaye user ke liye ek detailed workout plan bana.

${baseInfo}

RULES:
1. Goal "${goalLabel}" ke hisab se plan banao
2. Week mein 5 din ka plan do (2 rest days bhi batao)
3. Har din ke liye:
   - Workout ka naam aur focus area
   - Warm-up (5 min)
   - Main exercises: exercise name, sets, reps, rest time
   - Cool-down (5 min)
4. Gym aur Home DONO options do jahan possible ho
5. Beginner-friendly explanations do
6. Progressive overload tips do
7. Hindi-English mix mein casual style mein likho
8. Week ke end mein recovery aur sleep tips do
9. Emojis use karo throughout

Format: Day 1 se Day 5 (workout), Day 6-7 (active rest)
  `;

  try {
    // Fetch both in parallel
    const [res1, res2] = await Promise.all([
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: dietPrompt }]
        })
      }),
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: workoutPrompt }]
        })
      })
    ]);

    const [d1, d2] = await Promise.all([res1.json(), res2.json()]);

    dietPlan = d1.content?.map(b => b.text || '').join('') || '❌ Diet plan load nahi hua. Please try again.';
    workoutPlan = d2.content?.map(b => b.text || '').join('') || '❌ Workout plan load nahi hua. Please try again.';

    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('resultText').style.display = 'block';
    document.getElementById('resultText').textContent = dietPlan;
    activeTab = 'diet';
    document.getElementById('rtab-diet').classList.add('active');
    document.getElementById('rtab-workout').classList.remove('active');

  } catch (err) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('resultText').style.display = 'block';
    document.getElementById('resultText').textContent = '❌ Kuch error aaya bhai.\n\nInternet connection check karo aur dobara try karo.\n\nError: ' + err.message;
  }

  btn.disabled = false;
  btn.querySelector('.gen-text').textContent = 'MERA PLAN GENERATE KARO';
}

// ---- SWITCH TAB ----
function switchTab(tab) {
  activeTab = tab;
  document.getElementById('rtab-diet').classList.toggle('active', tab === 'diet');
  document.getElementById('rtab-workout').classList.toggle('active', tab === 'workout');

  const textEl = document.getElementById('resultText');
  textEl.style.opacity = '0';
  textEl.style.transform = 'translateY(10px)';

  setTimeout(() => {
    textEl.textContent = tab === 'diet' ? dietPlan : workoutPlan;
    textEl.style.transition = 'all 0.3s ease';
    textEl.style.opacity = '1';
    textEl.style.transform = 'translateY(0)';
  }, 200);
}

// ---- COPY PLAN ----
function copyPlan() {
  const text = activeTab === 'diet' ? dietPlan : workoutPlan;
  if (!text) { showToast('Pehle plan generate karo! ⚠️'); return; }

  navigator.clipboard.writeText(text).then(() => {
    showToast('Plan copy ho gaya! 📋 Kahi bhi paste karo.');
  }).catch(() => {
    showToast('Copy nahi hua — manually select karke copy karo.');
  });
}

// ---- TOAST NOTIFICATION ----
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: #0d1117; border: 1px solid rgba(0,229,255,0.3);
    color: #f0f4f8; padding: 12px 24px; border-radius: 2px;
    font-family: 'JetBrains Mono', monospace; font-size: 13px;
    letter-spacing: 0.05em; z-index: 9999; white-space: nowrap;
    animation: toastIn 0.3s ease forwards;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ---- ENTER KEY SUPPORT ----
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.ctrlKey) generatePlan();
});
