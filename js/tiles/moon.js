export const id = "moon";
export const label = "Moon Phase";
export const defaultSize = { w: 1, h: 1 };

export function render(root) {
  const phaseInfo = getMoonPhase(new Date());
  root.innerHTML = `
    <div style="font-size:13px;">
      <div><strong>Phase:</strong> ${phaseInfo.name}</div>
      <div><strong>Illumination:</strong> ${Math.round(phaseInfo.illum * 100)}%</div>
      <div><strong>Age:</strong> ${phaseInfo.age.toFixed(1)} days</div>
    </div>
  `;
}

// simple moon phase calc
function getMoonPhase(date) {
  const lp = 2551443; // lunar period in seconds
  const now = date.getTime() / 1000;
  const new_moon = 592500; // reference new moon (approx)
  const phase = ((now - new_moon) % lp) / lp;
  const age = phase * 29.53058867;
  let name = "New Moon";
  if (phase < 0.03 || phase > 0.97) name = "New Moon";
  else if (phase < 0.22) name = "Waxing Crescent";
  else if (phase < 0.28) name = "First Quarter";
  else if (phase < 0.47) name = "Waxing Gibbous";
  else if (phase < 0.53) name = "Full Moon";
  else if (phase < 0.72) name = "Waning Gibbous";
  else if (phase < 0.78) name = "Last Quarter";
  else name = "Waning Crescent";

  return { phase, age, illum: phase <= 0.5 ? phase * 2 : (1 - phase) * 2, name };
}
