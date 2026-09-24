// Small, progressive enhancements layered over the existing practice flow.
let writingSaveTimer;
const originalPracticeDraw = draw;
const originalDashboardRender = render;
const originalPracticeOpen = openPractice;
const originalShowSpeakingOptions = showSpeakingOptions;

savePracticeSession = (active = true) => {
  if (!P.skill) return;
  st.practiceSession = {
    skill: P.skill, tier: P.tier, i: P.i, selected: P.selected,
    checked: P.checked, draft: P.draft || '', revealed: !!P.revealed,
    spoken: !!P.spoken, active
  };
  save();
};
openPractice = (skill, resume = null) => {
  const saved = resume || st.practiceSession;
  originalPracticeOpen(skill, resume);
  if (saved?.skill === skill) {
    P.draft = saved.draft || '';
    P.revealed = !!saved.revealed;
    P.spoken = !!saved.spoken;
  }
  priorExercise = P.i;
  draw();
  savePracticeSession(true);
};
showSpeakingOptions = message => {
  if (message.startsWith('Recording is not available')) message = 'Recording is unavailable here. Say the model answer aloud and compare the sounds and stress.';
  originalShowSpeakingOptions(message);
  if (speakingUrl) {
    document.querySelector('#start-speaking').style.display = '';
    document.querySelector('#start-speaking').textContent = 'Record again';
  }
  savePracticeSession(true);
};

function explainAnswer(question) {
  const answer = question.a;
  if (P.skill === 'Reading') return `Explanation: The passage supports “${answer}”. Check the sentence that gives this detail.`;
  if (P.skill === 'Listening') return `Explanation: The key spoken detail is “${answer}”. Listen for the time, action, or change described.`;
  if (P.skill === 'Writing') return `Explanation: “${answer}” best meets the writing goal stated in the prompt.`;
  return `Explanation: “${answer}” responds directly and gives the most complete answer to the examiner.`;
}

draw = () => {
  originalPracticeDraw();
  const writing = P.skill === 'Writing';
  const speaking = P.skill === 'Speaking';
  const writingPanel = document.querySelector('#writing-practice');
  const writingInput = document.querySelector('#writing-response');
  const compare = document.querySelector('#show-writing-samples');
  const answers = document.querySelector('#answer-options');
  const speakingPanel = document.querySelector('#speaking-practice');
  const speakingUnlocked = speaking && P.checked && P.selected === P.queue[P.i % P.queue.length].a;
  writingPanel.style.display = writing ? 'block' : 'none';
  if (writingInput.value !== (P.draft || '')) writingInput.value = P.draft || '';
  compare.disabled = !(P.draft || '').trim();
  answers.style.display = writing && !P.revealed && !P.checked ? 'none' : '';
  speakingPanel.style.display = speakingUnlocked ? 'block' : 'none';
  speakingPanel.querySelector('p').textContent = 'Correct! Practice saying the model answer aloud, record yourself, then listen back and check your pronunciation.';
  let model = document.querySelector('#speaking-model');
  if (!model) {
    model = document.createElement('p');
    model.id = 'speaking-model';
    model.className = 'speaking-model';
    speakingPanel.insertBefore(model, speakingPanel.querySelector('ul'));
  }
  model.textContent = P.queue[P.i % P.queue.length].a;
  const checks = speakingPanel.querySelectorAll('li');
  ['Are the sounds clear?', 'Did I stress the important words?', 'Was my speech steady and easy to understand?'].forEach((text, i) => { checks[i].textContent = text; });
  document.querySelector('#continue-speaking').style.display = 'none';
  let playModel = document.querySelector('#play-speaking-model');
  if (!playModel) {
    playModel = document.createElement('button');
    playModel.id = 'play-speaking-model';
    playModel.type = 'button';
    playModel.className = 'secondary';
    playModel.textContent = '▶ Hear model answer';
    document.querySelector('#start-speaking').before(playModel);
    playModel.addEventListener('click', () => {
      if (!window.speechSynthesis) { document.querySelector('#speaking-status').textContent = 'Audio playback is not available in this browser.'; return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(P.queue[P.i % P.queue.length].a);
      utterance.rate = .9;
      window.speechSynthesis.speak(utterance);
    });
  }
  document.querySelector('#start-speaking').textContent = speakingUrl ? 'Record again' : 'Start recording';
  if (P.checked) {
    const result = document.querySelector('#answer-result');
    result.textContent = `${P.selected === P.queue[P.i % P.queue.length].a ? 'Correct — great work!' : `Not quite. Correct answer: ${P.queue[P.i % P.queue.length].a}.`} ${explainAnswer(P.queue[P.i % P.queue.length])}`;
  }
};

document.querySelector('#writing-response').addEventListener('input', event => {
  P.draft = event.target.value;
  document.querySelector('#show-writing-samples').disabled = !P.draft.trim();
  clearTimeout(writingSaveTimer);
  writingSaveTimer = setTimeout(() => savePracticeSession(true), 350);
});
document.querySelector('#show-writing-samples').addEventListener('click', () => {
  if (!P.draft?.trim()) return;
  clearTimeout(writingSaveTimer);
  P.revealed = true;
  draw();
  savePracticeSession(true);
});
document.querySelector('#continue-speaking').addEventListener('click', () => {
  P.spoken = true;
  savePracticeSession(true);
});
document.querySelector('#start-speaking').addEventListener('click', () => window.speechSynthesis?.cancel(), true);
document.querySelector('#close-practice').addEventListener('click', () => clearTimeout(writingSaveTimer));

const checkButton = document.querySelector('#check-answer');
let priorExercise = 0;
checkButton.addEventListener('click', () => {
  setTimeout(() => {
    if (!P.checked && P.i > priorExercise) {
      P.draft = '';
      P.revealed = false;
      P.spoken = false;
      draw();
      savePracticeSession(true);
    }
    priorExercise = P.i;
  }, 0);
});

render = () => {
  originalDashboardRender();
  const count = Math.max(0, Number(st.today) || 0);
  const goalCount = Math.min(10, count);
  const extra = count - goalCount;
  const tier = currentTier();
  const accent = document.querySelector('.momentum .accent-text');
  if (accent) accent.textContent = extra ? `Daily goal complete · ${extra} extra exercise${extra === 1 ? '' : 's'}` : `${goalCount}/10 exercises answered today`;
  document.querySelector('#momentum-today').textContent = `${goalCount} / 10`;
  document.querySelector('#momentum-extra').textContent = extra ? `${extra} extra exercise${extra === 1 ? '' : 's'} today` : 'Exercises completed';
  document.querySelector('#momentum-next').textContent = tier < 3 ? `${Math.max(0, 100 - st.correctByTier[tier - 1])} left` : 'All unlocked';
  const tierNote = document.querySelector('.tier-card .muted');
  if (tierNote) tierNote.textContent = tier < 3 ? `${Math.max(0, 100 - st.correctByTier[tier - 1])} correct answers across all skills to the next tier` : 'All tiers unlocked';
  document.querySelectorAll('#daily-dots span').forEach((dot, i) => dot.classList.toggle('done', i < goalCount));
};
render();
