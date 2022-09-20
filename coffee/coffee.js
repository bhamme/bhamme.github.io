
function handleNext(currentPage) {
  let valid = false;
  switch (currentPage) {
    case 1:
      valid = cups > 0;
      break;
    case 2:
      valid = !!pour;
      break;
  }
  if (valid) {
    setPage(currentPage + 1);
    if (currentPage + 1 === 3) {
      updateResults();
    }
  } else {
    console.log('Invalid');
  }
}
function handleClear(currentPage) {
  switch (currentPage) {
    case 1:
      cups = 0;
      break;
    case 2:
      pour = undefined;
      break;
    default:
      cups = 0;
      pour = undefined;
      setPage(1);
  }
}

function addCup(numCups) {
  cups += numCups;
  updateCount(cups);
}

function updateCount(total) {
  const count = document.getElementById('cup-count');
  if (total <= 0) {
    count.innerHTML = '...';
  } else {
    count.innerHTML = total; // truncate decimals?
  }
}

// two or hundo
function setPour(pourType) {
  pour = pourType;
  updatePour(pour);
}

function updatePour(pour) {
  const pourEl = document.getElementById('pour-type');
  if (!pour) {
    pourEl.innerHTML = '...';
  } else {
    pourEl.innerHTML = getPourText(pour);
  }
}

function getPourText(pour) {
  switch (pour) {
    case 'two':
      return 'two 1/2 volume pours';
    case 'hundo':
      return 'several pours';
  }
  return '...';
}

function setPage(nextPage) {
  const currentPageEl = document.getElementById(`page${page}`);
  const nextPageEl = document.getElementById(`page${nextPage}`);
  currentPageEl.classList.remove('shown');
  nextPageEl.classList.add('shown');
  page = nextPage;
}

function updateResults() {
  const weightEl = document.getElementById('weight');
  const volumeEl = document.getElementById('volumes');
  const bloomEl = document.getElementById('bloom');

  const weight = cups * GRAMS_PER_CUP;
  weightEl.innerHTML = weight;
  const totalVolume = cups * ML_PER_CUP;
  const bloomVolume = weight * 2;
  bloomEl.innerHTML = bloomVolume;

  let pourAmount;
  if (pour === 'two') {
    pourAmount = (totalVolume - bloomVolume) / 2;
  } else {
    pourAmount = bloomVolume * 3;
  }

  let instructions = [];
  let accumulatedVolume = bloomVolume;
  while (accumulatedVolume < totalVolume) {
    accumulatedVolume = Math.min(accumulatedVolume + pourAmount, totalVolume);
    instructions.push(`<h2 onclick="crossout(this)">Pour to <span class='volume'>${accumulatedVolume}</span>ml, allow to drain</h2>`);
  }
  volumeEl.innerHTML = instructions.join("\n");
}

function crossout(el) {
  if (el.classList.contains('crossedout')) {
    el.classList.remove('crossedout');
  } else {
    el.classList.add('crossedout');
  }
}

const GRAMS_PER_CUP = 20;
const ML_PER_CUP = 330;

// initialize
let cups = 0;
let pour;
let page = 1;
updateCount(cups);
updatePour(pour);
setPage(page);